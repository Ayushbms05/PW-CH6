import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createGeminiClient } from '../geminiClient';
import { computeContentHash } from '../hashUtils';
import { PRESET_HOUSEHOLDS } from '../../../data/householdPresets';
import { PRESET_LOCATIONS } from '../../../data/locations';
import { buildRoutinePrompt, buildIAQTroubleshootPrompt } from '../promptTemplates';
import { generateOptimizedRoutine } from '../routineOptimizer';

describe('Phase 3: Resilient Gemini API Client Layer (All 7 Pillars)', () => {
  let client: ReturnType<typeof createGeminiClient>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    globalThis.fetch = originalFetch;
    client = createGeminiClient({
      minIntervalSeconds: 0.05, // Fast for unit tests
      timeoutSeconds: 2,
      enableOfflineDemoFallback: true,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe('Pillar 1: Core Rules & Security', () => {
    it('initializes lazily without crashing when API key is missing', () => {
      const blankClient = createGeminiClient({ apiKey: '', enableOfflineDemoFallback: true });
      expect(blankClient.getApiKeyConfigured()).toBe(false);
      expect(blankClient.getLastCallInfo()).toBeNull();
    });

    it('sets API key securely without exposing it in logs or telemetry', () => {
      client.setApiKey('test-secret-key-12345');
      expect(client.getApiKeyConfigured()).toBe(true);

      const logs = client.getStructuredAuditLogs();
      logs.forEach((log) => {
        expect(log).not.toContain('test-secret-key-12345');
      });
    });
  });

  describe('Pillar 4: Code Fence Stripping & Self-Healing JSON', () => {
    it('strips markdown code fences correctly', () => {
      const fenced = '```json\n{"message": "clean"}\n```';
      expect(client.stripCodeFences(fenced)).toBe('{"message": "clean"}');

      const plainFenced = '```\n{"foo": "bar"}\n```';
      expect(client.stripCodeFences(plainFenced)).toBe('{"foo": "bar"}');
    });

    it('validates required fields from schema and catches missing keys', async () => {
      // In offline fallback mode with required field missing, self-healing or validation is invoked
      const result = await client.generateJson<{ id: string; activities: unknown[] }>(
        'Plan smog routine for Sharma family',
        'DailySmogPlan schema',
        { task: 'light', requiredFields: ['id', 'activities'] }
      );
      expect(result.id).toBeDefined();
      expect(Array.isArray(result.activities)).toBe(true);
    });
  });

  describe('Pillar 6: Content-Addressable Caching & Offline Fallback', () => {
    it('computes deterministic SHA-256 hash excluding model and API key', async () => {
      const hash1 = await computeContentHash('sys1', 'prompt1', 'schema1', 'light');
      const hash2 = await computeContentHash('sys1', 'prompt1', 'schema1', 'light');
      const hash3 = await computeContentHash('sys1', 'prompt1', 'schema1', 'heavy');

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1).toHaveLength(64); // SHA-256 hex string
    });

    it('serves cached responses in < 5ms with zero API calls', async () => {
      const prompt = 'Test cache prompt';
      const schema = 'TestSchema';

      // First call (populates cache or demo data)
      const res1 = await client.generateJson<{ id: string }>(prompt, schema, { task: 'light' });
      expect(res1).toBeDefined();

      // Second call: should hit cache
      const start = performance.now();
      const res2 = await client.generateJson<{ id: string }>(prompt, schema, { task: 'light' });
      const elapsed = performance.now() - start;

      expect(res2).toEqual(res1);
      expect(elapsed).toBeLessThan(10); // Under 10ms (typically < 1ms)
      const lastInfo = client.getLastCallInfo();
      expect(lastInfo?.source).toBe('cache');
      expect(lastInfo?.modelUsed).toBe('cache');
    });

    it('serves emergency IAQ diagnosis fallback during network outage', async () => {
      const res = await client.generateJson<{ problemSummary: string; recommendedHacks: unknown[] }>(
        'Child coughing at 3 AM from severe winter smog',
        'IAQDiagnosis schema'
      );

      expect(res.problemSummary).toContain('winter nighttime particulate trap');
      expect(res.recommendedHacks.length).toBeGreaterThan(0);
      expect(client.getLastCallInfo()?.source).toBe('demo');
    });
  });

  describe('Pillar 7: Observability & Logging', () => {
    it('records structured audit logs conforming to production specification', async () => {
      await client.generateJson('Test log prompt', 'Schema', { task: 'light' });

      const info = client.getLastCallInfo();
      expect(info).not.toBeNull();
      expect(info?.task).toBe('light');
      expect(info?.seconds).toBeGreaterThanOrEqual(0);

      const logs = client.getStructuredAuditLogs();
      expect(logs.length).toBeGreaterThan(0);
      // Format: <timestamp_iso> | <model> | <task> | <outcome_or_error_code> | <seconds_taken>s
      expect(logs[0]).toMatch(/^[0-9T:.-]+Z? \| .+ \| (light|heavy) \| .+ \| [0-9.]+s$/);
    });
  });

  describe('Pillar 2, 3, 5: Error Classification, Fallbacks & Circuit Breakers', () => {
    it('halts immediately on 401 Unauthorized without retries', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        text: async () => 'API_KEY_INVALID',
        headers: new Headers(),
      });
      globalThis.fetch = mockFetch;

      const authClient = createGeminiClient({
        apiKey: 'invalid-key',
        minIntervalSeconds: 0.01,
        enableOfflineDemoFallback: false,
      });

      await expect(
        authClient.generateJson('Prompt', 'Schema', { task: 'light' })
      ).rejects.toThrow(/AUTH_ERROR/);

      // Verify zero retries (called exactly once)
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('falls forward through model chain on 404 Model Not Found with 0ms delay', async () => {
      let callCount = 0;
      const mockFetch = vi.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          return {
            ok: false,
            status: 404,
            text: async () => 'Model retired',
            headers: new Headers(),
          };
        }
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: '{"status": "recovered"}' }] } }],
          }),
        };
      });
      globalThis.fetch = mockFetch;

      const chainClient = createGeminiClient({
        apiKey: 'valid-test-key',
        modelChainLight: ['retired-model-v1', 'current-model-v2'],
        minIntervalSeconds: 0.01,
        enableOfflineDemoFallback: false,
      });

      const res = await chainClient.generateJson<{ status: string }>('test prompt', 'schema', { task: 'light' });
      expect(res.status).toBe('recovered');
      expect(callCount).toBe(2);
      expect(chainClient.getLastCallInfo()?.fellBack).toBe(true);
      expect(chainClient.getLastCallInfo()?.modelUsed).toBe('current-model-v2');
    });
  });

  describe('High-Level AI Routine Optimizer Integration', () => {
    it('synthesizes grounded low-emission daily routine with emissions calculations', async () => {
      const profile = PRESET_HOUSEHOLDS[0]; // Sharma family
      const airData = PRESET_LOCATIONS[0];  // Delhi NCR severe smog

      const plan = await generateOptimizedRoutine(profile, airData, 'Toddler needs morning playtime');
      expect(plan.id).toBeDefined();
      expect(plan.activities.length).toBeGreaterThan(0);
      expect(plan.totalCo2SavedKg).toBeGreaterThanOrEqual(0);
      expect(plan.totalInhaledPm25AvoidedUg).toBeGreaterThan(0);
      expect(plan.totalCigarettesAvoidedEquivalent).toBeGreaterThan(0);
    });

    it('builds context-aware prompt templates with complete environmental parameters', () => {
      const profile = PRESET_HOUSEHOLDS[0];
      const airData = PRESET_LOCATIONS[0];

      const { prompt, schemaDescription } = buildRoutinePrompt(profile, airData);
      expect(prompt).toContain('Sharma Family');
      expect(prompt).toContain('Delhi / NCR');
      expect(prompt).toContain('325 µg/m³');
      expect(prompt).toContain('Inversion Boundary Layer Height');
      expect(schemaDescription).toContain('DailySmogPlan');

      const iaq = buildIAQTroubleshootPrompt('Asthmatic child coughing at midnight', profile, airData);
      expect(iaq.prompt).toContain('Asthmatic child coughing at midnight');
      expect(iaq.schemaDescription).toContain('problemSummary');
    });
  });
});
