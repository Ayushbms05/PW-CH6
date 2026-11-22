import React from 'react';
import { ShieldCheck, Cigarette, Leaf, HeartPulse } from 'lucide-react';

interface ImpactScorecardProps {
  shieldScore: number;
  inhaledAvoidedUg: number;
  cigarettesAvoided: number;
  co2SavedKg: number;
}

export const ImpactScorecard: React.FC<ImpactScorecardProps> = ({
  shieldScore,
  inhaledAvoidedUg,
  cigarettesAvoided,
  co2SavedKg,
}) => {
  return (
    <div
      role="region"
      aria-label="Quantified Direct Impact and Health Protection Metrics"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {/* Health Shield Score */}
      <div className="bg-gradient-to-br from-emerald-500/10 to-brand-500/10 border border-emerald-500/30 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Health Shield Score
          </span>
          <ShieldCheck className="w-5 h-5 text-emerald-500" aria-hidden="true" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
            {shieldScore}
          </span>
          <span className="text-base font-semibold text-slate-500">/ 100</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Household vulnerability protection efficiency based on scheduled time shifts.
        </p>
      </div>

      {/* Particulate Inhalation Avoided */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            PM2.5 Avoided
          </span>
          <HeartPulse className="w-5 h-5 text-brand-500" aria-hidden="true" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
            {inhaledAvoidedUg.toLocaleString()}
          </span>
          <span className="text-base font-semibold text-slate-500">µg</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Fine particulate matter prevented from entering bronchial alveoli today.
        </p>
      </div>

      {/* Cigarette Burden Equivalence */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Cigarettes Equivalent
          </span>
          <Cigarette className="w-5 h-5 text-rose-500" aria-hidden="true" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-extrabold text-rose-600 dark:text-rose-400">
            {cigarettesAvoided}
          </span>
          <span className="text-base font-semibold text-slate-500">cigs saved</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Based on Berkeley Earth standard: 22 µg/m³ 24h exposure ≈ 1 cigarette.
        </p>
      </div>

      {/* Carbon Emissions Prevented */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            CO2e Prevented
          </span>
          <Leaf className="w-5 h-5 text-teal-500" aria-hidden="true" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-4xl font-extrabold text-teal-600 dark:text-teal-400">
            {co2SavedKg}
          </span>
          <span className="text-base font-semibold text-slate-500">kg CO2</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          Through carpooling, metro shifting, and avoiding cold-start short trips.
        </p>
      </div>
    </div>
  );
};
