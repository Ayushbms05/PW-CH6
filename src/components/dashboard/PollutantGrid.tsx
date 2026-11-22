import React from 'react';
import { PollutantConcentration } from '../../types/pollution';

interface PollutantGridProps {
  pollutants: PollutantConcentration;
}

export const PollutantGrid: React.FC<PollutantGridProps> = ({ pollutants }) => {
  const cards = [
    {
      name: 'PM2.5 (Fine Particulates)',
      value: `${pollutants.pm25} µg/m³`,
      whoLimit: '15 µg/m³ (24h avg)',
      ratio: Math.round(pollutants.pm25 / 15),
      danger: pollutants.pm25 > 100,
      description: 'Penetrates deep into alveolar gas exchange and bloodstream.',
    },
    {
      name: 'PM10 (Coarse Dust)',
      value: `${pollutants.pm10} µg/m³`,
      whoLimit: '45 µg/m³ (24h avg)',
      ratio: Math.round(pollutants.pm10 / 45),
      danger: pollutants.pm10 > 150,
      description: 'Trapped in upper respiratory tract and trachea.',
    },
    {
      name: 'NO2 (Nitrogen Dioxide)',
      value: `${pollutants.no2} ppb`,
      whoLimit: '25 µg/m³',
      ratio: Math.round(pollutants.no2 / 25),
      danger: pollutants.no2 > 50,
      description: 'Emitted by diesel engines and unvented gas stoves; inflames airways.',
    },
    {
      name: 'CO (Carbon Monoxide)',
      value: `${pollutants.co} ppm`,
      whoLimit: '4 mg/m³',
      ratio: Math.max(1, Math.round(pollutants.co / 2)),
      danger: pollutants.co > 5,
      description: 'Byproduct of biomass and charcoal winter heating; binds hemoglobin.',
    },
  ];

  return (
    <div
      role="region"
      aria-label="Multi-Pollutant Real-Time Concentrations"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => (
        <div
          key={card.name}
          className={`p-4 rounded-2xl border ${
            card.danger
              ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          } shadow-sm`}
        >
          <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
            <span>{card.name}</span>
            {card.danger && (
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                {card.ratio}x WHO Limit
              </span>
            )}
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {card.value}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-snug">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
};
