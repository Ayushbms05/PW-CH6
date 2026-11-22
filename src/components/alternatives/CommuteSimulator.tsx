import React, { useState } from 'react';
import {
  calculateCommuteShiftSavings,
  CommuteShiftImpactParams,
} from '../../services/calculations/impactCalculator';
import { Car } from 'lucide-react';

export const CommuteSimulator: React.FC = () => {
  const [fromMode, setFromMode] = useState<CommuteShiftImpactParams['fromMode']>('single-car-diesel');
  const [toMode, setToMode] = useState<CommuteShiftImpactParams['toMode']>('metro-train');
  const [distanceKm, setDistanceKm] = useState<number>(24);

  const savings = calculateCommuteShiftSavings({
    fromMode,
    toMode,
    distanceKm: Math.max(1, distanceKm || 1),
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <Car className="w-5 h-5 text-brand-500" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-bold">Low-Emission Urban Commute Calculator</h2>
          <p className="text-sm text-slate-500">
            Calculate emissions and exposure savings by avoiding morning cold starts and single-occupant trips
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
        <div>
          <label htmlFor="commute-from-select" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Current Commute Mode
          </label>
          <select
            id="commute-from-select"
            value={fromMode}
            onChange={(e) => setFromMode(e.target.value as CommuteShiftImpactParams['fromMode'])}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="single-car-diesel">Single Occupant Diesel Car</option>
            <option value="single-car-petrol">Single Occupant Petrol Car</option>
            <option value="two-wheeler">Two-Wheeler (Motorcycle/Scooter)</option>
          </select>
        </div>

        <div>
          <label htmlFor="commute-to-select" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Sustainable Shift
          </label>
          <select
            id="commute-to-select"
            value={toMode}
            onChange={(e) => setToMode(e.target.value as CommuteShiftImpactParams['toMode'])}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="metro-train">Electric Metro / Clean Rail</option>
            <option value="carpool">Neighborhood 4-Person Carpool</option>
            <option value="bicycle-walk">Electric Cycle / Walk (Post-Inversion)</option>
          </select>
        </div>

        <div>
          <label htmlFor="commute-km-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Round Trip Distance (km)
          </label>
          <input
            id="commute-km-input"
            type="number"
            min={1}
            max={150}
            value={distanceKm === 0 ? '' : distanceKm}
            onChange={(e) => setDistanceKm(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 text-center">
          <span className="text-sm font-medium text-slate-500 block mb-0.5">Daily CO2 Prevented</span>
          <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
            {savings.co2SavedKg} kg
          </span>
          <span className="text-xs text-slate-500 block mt-0.5">
            Equivalent to saving ${(savings.co2SavedKg * 1.2).toFixed(2)} in fuel per trip
          </span>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 text-center">
          <span className="text-sm font-medium text-slate-500 block mb-0.5">Tailpipe PM2.5 Eliminated</span>
          <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {savings.pm25SavedGrams} g
          </span>
          <span className="text-xs text-slate-500 block mt-0.5">
            Toxic black carbon kept out of morning breathing zone
          </span>
        </div>
      </div>
    </div>
  );
};
