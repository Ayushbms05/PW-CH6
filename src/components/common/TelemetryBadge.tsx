import React from 'react';
import { Cpu, Database, Zap } from 'lucide-react';
import { CallTelemetry } from '../../services/ai/geminiClient';

interface TelemetryBadgeProps {
  telemetry: CallTelemetry | null;
}

export const TelemetryBadge: React.FC<TelemetryBadgeProps> = ({ telemetry }) => {
  if (!telemetry) {
    return (
      <div
        className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm shrink-0 whitespace-nowrap"
        aria-label="AI Engine: Built-in Gemini Engine Active"
      >
        <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
        <span>Gemini Active</span>
      </div>
    );
  }

  const isCache = telemetry.source === 'cache';
  const isLive = telemetry.source === 'live';

  return (
    <div
      className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 shadow-sm shrink-0 whitespace-nowrap"
      aria-label={`AI Status: ${isLive ? 'Live Gemini API' : isCache ? 'SHA-256 Cache' : 'Offline Engine'}. Model: ${telemetry.modelUsed}. Latency: ${telemetry.seconds.toFixed(2)} seconds.`}
    >
      {isLive && <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />}
      {isCache && <Database className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />}
      {!isLive && !isCache && <Cpu className="w-3.5 h-3.5 text-brand-500 shrink-0" aria-hidden="true" />}
      <span>
        {isCache ? 'Cache (<1ms)' : `${telemetry.modelUsed} (${telemetry.seconds.toFixed(2)}s)`}
      </span>
    </div>
  );
};
