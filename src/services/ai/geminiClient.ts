/**
 * Production-Grade Resilient Gemini API Client Layer
 * Implements 6 Core Architectural Pillars + Observability:
 * 1. Core Rules & Security (lazy init, no key leakage, timeout enforcement)
 * 2. Multi-Model Fallback Chains (Tiered Routing: light vs heavy)
 * 3. Intelligent HTTP Error Classification (401/403 stop, 404 fast-forward, 429/5xx exponential backoff)
 * 4. Output Validation & Self-Healing JSON (fence stripping, 1-shot self-heal, required field check)
 * 5. Speed & Load Protection (Rate limiter interval, 60s Circuit Breaker)
 * 6. Content-Addressable Caching & Offline Fallback (SHA-256 cache, demo_data fallback)
 * 7. Observability & Logging (structured audit logs, getLastCallInfo())
 */

import { computeContentHash } from './hashUtils';
import { DEMO_SMOG_PLAN_DELHI_VULNERABLE, DEMO_IAQ_DIAGNOSIS } from './demoData';

export type TaskTier = 'light' | 'heavy';

export interface GenerateOptions {
  task?: TaskTier;
  systemInstruction?: string;
  temperature?: number;
  timeoutMs?: number;
  requiredFields?: string[];
  thinkingConfigDisabled?: boolean;
}

export interface CallTelemetry {
  timestampIso: string;
  modelUsed: string;
  task: TaskTier;
  source: 'live' | 'cache' | 'demo';
  attempts: number;
  fellBack: boolean;
  seconds: number;
  outcomeOrErrorCode: string;
}

export interface ClientConfig {
  apiKey?: string;
  modelChainLight?: string[];
  modelChainHeavy?: string[];
  timeoutSeconds?: number;
  minIntervalSeconds?: number;
  enableOfflineDemoFallback?: boolean;
}

const DEFAULT_GEMINI_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';

class GeminiClientLayer {
  private apiKey: string | null = DEFAULT_GEMINI_KEY;
  private modelChainLight: string[] = [
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-flash-lite-latest',
  ];
  private modelChainHeavy: string[] = [
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-flash-lite-latest',
  ];
  private timeoutSeconds = 35;
  private minIntervalSeconds = 1.0;
  private enableOfflineDemoFallback = true;

  // Rate Limiter Mutex
  private lastCallTimestamp = 0;
  private rateLimitLock: Promise<void> = Promise.resolve();

  // Circuit Breaker State: model -> { consecutiveFailures, cooldownUntil }
  private circuitBreakers: Map<string, { consecutiveFailures: number; cooldownUntil: number }> = new Map();

  // Content-Addressable Cache: key -> { data, timestamp }
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();

  // Observability & Telemetry Logs
  private callLogs: CallTelemetry[] = [];
  private lastCallInfo: CallTelemetry | null = null;

  constructor(config?: ClientConfig) {
    if (config?.apiKey !== undefined) {
      this.apiKey = config.apiKey ? config.apiKey.trim() : null;
    } else {
      this.apiKey = DEFAULT_GEMINI_KEY;
    }
    if (config?.modelChainLight) this.modelChainLight = config.modelChainLight;
    if (config?.modelChainHeavy) this.modelChainHeavy = config.modelChainHeavy;
    if (config?.timeoutSeconds) this.timeoutSeconds = config.timeoutSeconds;
    if (config?.minIntervalSeconds) this.minIntervalSeconds = config.minIntervalSeconds;
    if (config?.enableOfflineDemoFallback !== undefined) {
      this.enableOfflineDemoFallback = config.enableOfflineDemoFallback;
    }
  }

  /**
   * Lazily sets or updates the API key without printing or leaking it
   */
  public setApiKey(key: string): void {
    if (!key || key.trim() === '') {
      this.apiKey = null;
    } else {
      this.apiKey = key.trim();
    }
  }

  public getApiKeyConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  /**
   * Returns latest telemetry record (Pillar 7)
   */
  public getLastCallInfo(): CallTelemetry | null {
    return this.lastCallInfo;
  }

  /**
   * Returns formatted structured audit logs:
   * <timestamp_iso> | <model> | <task> | <outcome_or_error_code> | <seconds_taken>s
   */
  public getStructuredAuditLogs(): string[] {
    return this.callLogs.map(
      (log) => `${log.timestampIso} | ${log.modelUsed} | ${log.task} | ${log.outcomeOrErrorCode} | ${log.seconds.toFixed(3)}s`
    );
  }

  /**
   * Rate Limiter: Enforces minimum interval between consecutive API calls (Pillar 5)
   * Using an asynchronous mutex lock to guarantee thread/event-loop safe spacing.
   */
  private async enforceRateLimit(): Promise<void> {
    const currentLock = this.rateLimitLock;
    let unlock: () => void = () => {};
    this.rateLimitLock = new Promise<void>((resolve) => {
      unlock = resolve;
    });

    await currentLock;
    try {
      const minIntervalMs = this.minIntervalSeconds * 1000;
      const now = Date.now();
      const elapsed = now - this.lastCallTimestamp;
      if (elapsed < minIntervalMs) {
        const waitTime = minIntervalMs - elapsed;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
      this.lastCallTimestamp = Date.now();
    } finally {
      unlock();
    }
  }

  /**
   * Circuit Breaker Helper (Pillar 5)
   */
  private isModelInCooldown(model: string): boolean {
    const state = this.circuitBreakers.get(model);
    if (!state) return false;
    return Date.now() < state.cooldownUntil;
  }

  private recordModelSuccess(model: string): void {
    this.circuitBreakers.set(model, { consecutiveFailures: 0, cooldownUntil: 0 });
  }

  private recordModelFailure(model: string, isSevere: boolean): void {
    const current = this.circuitBreakers.get(model) || { consecutiveFailures: 0, cooldownUntil: 0 };
    const consecutive = current.consecutiveFailures + 1;
    let cooldownUntil = 0;
    if (consecutive >= 2 && isSevere) {
      cooldownUntil = Date.now() + 60 * 1000; // 60s cooldown
    }
    this.circuitBreakers.set(model, { consecutiveFailures: consecutive, cooldownUntil });
  }

  /**
   * Checks content-addressable cache (Pillar 6)
   */
  public async checkCache<T>(cacheKey: string): Promise<T | null> {
    const entry = this.cache.get(cacheKey);
    if (entry) {
      return entry.data as T;
    }
    return null;
  }

  /**
   * Saves validated output to cache (Pillar 6)
   */
  public setCache(cacheKey: string, data: unknown): void {
    try {
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
    } catch {
      // Ignore cache write errors gracefully
    }
  }

  /**
   * Strips markdown code fences from AI string (Pillar 4)
   */
  public stripCodeFences(raw: string): string {
    let clean = raw.trim();
    if (clean.startsWith('```json')) {
      clean = clean.slice(7);
    } else if (clean.startsWith('```')) {
      clean = clean.slice(3);
    }
    if (clean.endsWith('```')) {
      clean = clean.slice(0, -3);
    }
    return clean.trim();
  }

  /**
   * Core Live Call Dispatcher with Error Classification & Retries (Pillars 2, 3, 4)
   */
  private async executeModelCall(
    model: string,
    prompt: string,
    systemInstruction: string,
    temperature: number,
    timeoutMs: number,
    thinkingDisabled: boolean
  ): Promise<{ text: string; finishReason?: string }> {
    if (!this.apiKey) {
      throw new Error('AUTH_MISSING: Gemini API key is missing. Lazy initialization halted safely.');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Standard Google Gemini REST endpoint
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
      
      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
        { role: 'user', parts: [{ text: prompt }] },
      ];

      const requestBody: Record<string, unknown> = {
        contents,
        generationConfig: {
          temperature,
          topP: 0.95,
        },
      };

      if (systemInstruction) {
        requestBody.systemInstruction = {
          parts: [{ text: systemInstruction }],
        };
      }

      if (thinkingDisabled) {
        // Explicitly suppress extended thinking if model requested
        requestBody.generationConfig = {
          ...(requestBody.generationConfig as object),
          thinkingConfig: { thinkingBudget: 0 },
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        const status = response.status;
        const errText = await response.text();
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfterSec = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null;

        const error = new Error(`HTTP_${status}: ${errText}`);
        (error as unknown as { status: number; retryAfterSec: number | null }).status = status;
        (error as unknown as { status: number; retryAfterSec: number | null }).retryAfterSec = retryAfterSec;
        throw error;
      }

      const json = await response.json();
      const candidate = json.candidates?.[0];
      if (!candidate || !candidate.content?.parts?.[0]?.text) {
        throw new Error('EMPTY_RESPONSE: Response was blocked or empty.');
      }

      return {
        text: candidate.content.parts[0].text,
        finishReason: candidate.finishReason,
      };
    } catch (err: unknown) {
      clearTimeout(timer);
      throw err;
    }
  }

  /**
   * Main JSON Generation Method
   * Executes multi-model fallback chain, rate limiting, circuit breaker,
   * self-healing parse retries, and offline demo fallback.
   */
  public async generateJson<T extends object>(
    prompt: string,
    schemaDescription: string,
    options: GenerateOptions = {}
  ): Promise<T> {
    const startTime = Date.now();
    const task = options.task || 'light';
    const systemInstruction = options.systemInstruction || 'You are an expert environmental intelligence assistant. Always output valid JSON.';
    const temperature = options.temperature ?? 0.2;
    const timeoutMs = (options.timeoutMs ?? this.timeoutSeconds * 1000);
    const requiredFields = options.requiredFields || [];

    // Pillar 6: Content-Addressable Cache Check
    const cacheKey = await computeContentHash(systemInstruction, prompt, schemaDescription, task);
    const cached = await this.checkCache<T>(cacheKey);
    if (cached) {
      const duration = (Date.now() - startTime) / 1000;
      const telemetry: CallTelemetry = {
        timestampIso: new Date().toISOString(),
        modelUsed: 'cache',
        task,
        source: 'cache',
        attempts: 0,
        fellBack: false,
        seconds: duration,
        outcomeOrErrorCode: '200_OK_CACHE_HIT',
      };
      this.lastCallInfo = telemetry;
      this.callLogs.push(telemetry);
      return cached;
    }

    // Determine model chain
    const baseChain = task === 'heavy' ? [...this.modelChainHeavy] : [...this.modelChainLight];
    
    // Filter out models in active circuit breaker cooldown, unless all are in cooldown
    let activeChain = baseChain.filter((m) => !this.isModelInCooldown(m));
    if (activeChain.length === 0) {
      activeChain = baseChain; // Bypass skip if all models in cooldown (Pillar 5)
    }

    let overallAttempts = 0;
    let didFallback = false;
    const chainErrors: string[] = [];

    // Attempt live chain if API key is provided
    if (this.apiKey) {
      for (let i = 0; i < activeChain.length; i++) {
        const model = activeChain[i];
        if (i > 0) didFallback = true;

        let modelAttempts = 0;
        const maxRetries = 2; // For 429, 5xx, timeouts

        while (modelAttempts <= maxRetries) {
          overallAttempts++;
          modelAttempts++;

          try {
            // Pillar 5: Rate Limiter
            await this.enforceRateLimit();

            // Execute Call
            const res = await this.executeModelCall(
              model,
              prompt,
              systemInstruction,
              temperature,
              timeoutMs,
              options.thinkingConfigDisabled ?? false
            );

            // Pillar 4: Output Validation & Self-Healing JSON
            let parsed: T | null = null;
            let parseFailed = false;

            try {
              const stripped = this.stripCodeFences(res.text);
              parsed = JSON.parse(stripped) as T;

              // Validate required fields
              for (const reqField of requiredFields) {
                if (!(reqField in (parsed as Record<string, unknown>))) {
                  parseFailed = true;
                  break;
                }
              }
            } catch {
              parseFailed = true;
            }

            // Self-Healing JSON Retry (Pillar 4: trigger once on same model with temp=0)
            if (parseFailed || res.finishReason === 'MAX_TOKENS') {
              const healPrompt = `${prompt}\n\nCRITICAL: Return only valid JSON matching this schema: ${schemaDescription}. Do not include markdown or explanations.`;
              const healRes = await this.executeModelCall(
                model,
                healPrompt,
                systemInstruction,
                0.0, // temperature=0
                timeoutMs,
                options.thinkingConfigDisabled ?? false
              );

              try {
                const healStripped = this.stripCodeFences(healRes.text);
                parsed = JSON.parse(healStripped) as T;
                for (const reqField of requiredFields) {
                  if (!(reqField in (parsed as Record<string, unknown>))) {
                    throw new Error(`MISSING_FIELD: Required field '${reqField}' absent in self-healed output.`);
                  }
                }
              } catch (healErr) {
                throw new Error(`PARSE_FAILED: Self-healing JSON parsing failed: ${(healErr as Error).message}`);
              }
            }

            if (parsed) {
              this.recordModelSuccess(model);
              this.setCache(cacheKey, parsed);

              const duration = (Date.now() - startTime) / 1000;
              const telemetry: CallTelemetry = {
                timestampIso: new Date().toISOString(),
                modelUsed: model,
                task,
                source: 'live',
                attempts: overallAttempts,
                fellBack: didFallback,
                seconds: duration,
                outcomeOrErrorCode: '200_OK_LIVE',
              };
              this.lastCallInfo = telemetry;
              this.callLogs.push(telemetry);
              return parsed;
            }
          } catch (err: unknown) {
            const error = err as Error & { status?: number; retryAfterSec?: number | null };
            const status = error.status;

            // Pillar 3: Intelligent HTTP Error Classification
            if (status === 401 || status === 403) {
              // Auth / Permission: Stop immediately. Zero retries.
              const telemetry: CallTelemetry = {
                timestampIso: new Date().toISOString(),
                modelUsed: model,
                task,
                source: 'live',
                attempts: overallAttempts,
                fellBack: didFallback,
                seconds: (Date.now() - startTime) / 1000,
                outcomeOrErrorCode: `HTTP_${status}_AUTH_FAIL`,
              };
              this.lastCallInfo = telemetry;
              this.callLogs.push(telemetry);
              throw new Error(`AUTH_ERROR: Gemini API key is invalid or unauthorized (HTTP ${status}).`);
            }

            if (status === 404) {
              // Model Retired or Not Found: Move to next model immediately with 0ms sleep
              this.recordModelFailure(model, true);
              chainErrors.push(`${model} (404 Not Found)`);
              break; // exit while loop -> advance to next model
            }

            if (status === 400 && error.message.toLowerCase().includes('thinking')) {
              // Retry once with thinkingConfig disabled
              options.thinkingConfigDisabled = true;
              continue;
            }

            if (status === 400) {
              // Other 400 Bad Request: Stop immediately
              throw new Error(`BAD_REQUEST: Invalid request parameters: ${error.message}`);
            }

            // Check for immediate offline / network disconnection (Pillar 6)
            const isNetworkOffline =
              error.message.toLowerCase().includes('failed to fetch') ||
              error.message.toLowerCase().includes('fetch failed') ||
              error.message.toLowerCase().includes('enotfound') ||
              error.message.toLowerCase().includes('networkerror') ||
              error.name === 'TypeError';

            if (isNetworkOffline && this.enableOfflineDemoFallback) {
              // Complete network outage: fast-forward immediately to Pillar 6 offline demo fallback
              chainErrors.push(`${model} (Network offline: ${error.message})`);
              i = activeChain.length; // break outer loop as well
              break;
            }

            // 429, 500, 502, 503, 504, Timeouts, Aborts
            const isSevere = status === 429 || status === 503 || error.name === 'AbortError';
            this.recordModelFailure(model, isSevere);

            if (modelAttempts <= maxRetries) {
              // Exponential backoff scaled by configured interval (fast for tests, robust for prod)
              const backoffScale = Math.min(1.0, this.minIntervalSeconds);
              let backoffMs = (Math.pow(2, modelAttempts - 1) * 1000 + Math.random() * 500) * backoffScale;
              if (error.retryAfterSec && error.retryAfterSec < 10) {
                backoffMs = error.retryAfterSec * 1000;
              }
              await new Promise((r) => setTimeout(r, backoffMs));
              continue; // retry same model
            } else {
              // Exceeded retries on this model -> fall forward to next model
              chainErrors.push(`${model} (Exhausted retries: ${error.message})`);
              break;
            }
          }
        }
      }
    }

    // Pillar 6: If all live models fail or no API key, serve fallback from demo_data
    if (this.enableOfflineDemoFallback) {
      const fallbackResult = this.resolveDemoFallback<T>(prompt, schemaDescription);
      if (fallbackResult) {
        // Cache fallback result so repeated calls hit cache in < 5ms
        this.setCache(cacheKey, fallbackResult);

        const duration = (Date.now() - startTime) / 1000;
        const telemetry: CallTelemetry = {
          timestampIso: new Date().toISOString(),
          modelUsed: 'offline-knowledge-engine',
          task,
          source: 'demo',
          attempts: overallAttempts,
          fellBack: true,
          seconds: duration,
          outcomeOrErrorCode: 'DEMO_DATA_FALLBACK_SUCCESS',
        };
        this.lastCallInfo = telemetry;
        this.callLogs.push(telemetry);
        return fallbackResult;
      }
    }

    // If both live and fallback are exhausted, raise friendly RuntimeError
    const outcomeSummary = chainErrors.length > 0 ? chainErrors.join('; ') : 'No valid API key or network connection.';
    throw new Error(`RUNTIME_ERROR: All Gemini models failed. Diagnostics: [${outcomeSummary}]`);
  }

  /**
   * Smart Demo Fallback Resolver matching winter smog domain prompts
   */
  private resolveDemoFallback<T>(prompt: string, schemaDescription: string): T | null {
    const lowerPrompt = prompt.toLowerCase();
    const lowerSchema = schemaDescription.toLowerCase();

    // Check for IAQ diagnosis schema or emergency troubleshooting prompts
    if (
      lowerSchema.includes('iaqdiagnosis') ||
      lowerPrompt.includes('cough') ||
      lowerPrompt.includes('troubleshoot') ||
      lowerPrompt.includes('emergency') ||
      lowerPrompt.includes('shortness of breath')
    ) {
      return JSON.parse(JSON.stringify(DEMO_IAQ_DIAGNOSIS)) as T;
    }

    // Default to comprehensive Delhi/inversion low-emission smog routine
    return JSON.parse(JSON.stringify(DEMO_SMOG_PLAN_DELHI_VULNERABLE)) as T;
  }
}

// Singleton export with default zero-crash lazy init
export const geminiClient = new GeminiClientLayer();

// Factory export for testing & isolated instances
export function createGeminiClient(config?: ClientConfig): GeminiClientLayer {
  return new GeminiClientLayer(config);
}
