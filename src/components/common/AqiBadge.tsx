import React from 'react';
import { AQICategory } from '../../types/pollution';

interface AqiBadgeProps {
  aqi: number;
  category: AQICategory;
  showDetails?: boolean;
}

export const AQI_COLORS: Record<AQICategory, { bg: string; text: string; border: string; label: string }> = {
  good: { bg: 'bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/30', label: 'Good' },
  moderate: { bg: 'bg-amber-500/15', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-500/30', label: 'Moderate' },
  'unhealthy-sensitive': { bg: 'bg-orange-500/15', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-500/30', label: 'Sensitive' },
  unhealthy: { bg: 'bg-rose-500/15', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-500/30', label: 'Unhealthy' },
  'very-unhealthy': { bg: 'bg-purple-500/15', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500/30', label: 'Very Unhealthy' },
  hazardous: { bg: 'bg-red-950/40', text: 'text-red-400 dark:text-red-300', border: 'border-red-900', label: 'Hazardous' },
  severe: { bg: 'bg-rose-950/60', text: 'text-rose-300 dark:text-rose-200', border: 'border-rose-900', label: 'Severe' },
};

export const AqiBadge: React.FC<AqiBadgeProps> = ({ aqi, category, showDetails = true }) => {
  const config = AQI_COLORS[category] || AQI_COLORS.hazardous;

  return (
    <div
      role="status"
      aria-label={`Air Quality Index: ${aqi}, Category: ${config.label}`}
      className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border text-xs sm:text-sm font-semibold shrink-0 whitespace-nowrap ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-current animate-pulse shrink-0" aria-hidden="true" />
      <span>AQI {aqi}</span>
      {showDetails && <span className="opacity-90 font-normal">({config.label})</span>}
    </div>
  );
};
