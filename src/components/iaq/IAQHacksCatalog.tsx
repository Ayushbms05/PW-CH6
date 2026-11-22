import React, { useState } from 'react';
import { IAQ_HACKS_DATABASE } from '../../data/iaqHacks';
import { Check } from 'lucide-react';

export const IAQHacksCatalog: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Hacks' },
    { id: 'diy-purification', label: 'DIY Air Purifiers' },
    { id: 'ventilation', label: 'Inversion Ventilation' },
    { id: 'cleaning', label: 'Dust & Mopping' },
    { id: 'source-control', label: 'Indoor Sources & Seals' },
  ];

  const filteredHacks = selectedCategory === 'all'
    ? IAQ_HACKS_DATABASE
    : IAQ_HACKS_DATABASE.filter((h) => h.category === selectedCategory);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Evidence-Backed Low-Cost IAQ Hacks</h2>
        <p className="text-sm text-slate-500">
          Scientifically quantified interventions to seal leaks, suppress indoor dust resuspension, and purge PM2.5
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="IAQ Hack Categories">
        {categories.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
              selectedCategory === cat.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Hacks Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredHacks.map((hack) => (
          <div
            key={hack.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {hack.title}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                -{hack.impactPercentage}% PM2.5
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {hack.description}
            </p>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                The Science:
              </span>
              <p className="text-slate-500 dark:text-slate-400">{hack.scienceExplanation}</p>
            </div>

            <div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Action Steps:
              </span>
              <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                {hack.actionableSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
