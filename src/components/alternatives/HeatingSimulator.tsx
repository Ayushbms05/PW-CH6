import React, { useState } from 'react';
import {
  calculateHeatingShiftSavings,
  HeatingShiftImpactParams,
} from '../../services/calculations/impactCalculator';
import { Flame } from 'lucide-react';

export const HeatingSimulator: React.FC = () => {
  const [fromHeating, setFromHeating] = useState<HeatingShiftImpactParams['fromHeating']>('wood-fireplace');
  const [toHeating, setToHeating] = useState<HeatingShiftImpactParams['toHeating']>('heat-pump');
  const [hoursPerDay, setHoursPerDay] = useState<number>(6);

  const savings = calculateHeatingShiftSavings({
    fromHeating,
    toHeating,
    hoursPerDay: Math.max(1, hoursPerDay || 1),
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <Flame className="w-5 h-5 text-amber-500" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-bold">Winter Domestic Heating Transition Calculator</h2>
          <p className="text-sm text-slate-500">
            Compare biomass, solid fuel, and fossil heating against clean electrified alternatives
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
        <div>
          <label htmlFor="current-heating-select" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Current Heating System
          </label>
          <select
            id="current-heating-select"
            value={fromHeating}
            onChange={(e) => setFromHeating(e.target.value as HeatingShiftImpactParams['fromHeating'])}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="wood-fireplace">Open Wood Fireplace (Heavy Particulate)</option>
            <option value="charcoal-brazier">Charcoal Angithi / Brazier (Extreme CO & PM2.5)</option>
            <option value="unvented-kerosene">Unvented Kerosene Heater (High VOCs/SO2)</option>
            <option value="electric-radiant">Electric Radiant Resistive Heater</option>
          </select>
        </div>

        <div>
          <label htmlFor="target-heating-select" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Sustainable Alternative
          </label>
          <select
            id="target-heating-select"
            value={toHeating}
            onChange={(e) => setToHeating(e.target.value as HeatingShiftImpactParams['toHeating'])}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="heat-pump">Air-Source Heat Pump (COP 3.5, Zero Local Emissions)</option>
            <option value="electric-radiant">Clean Electric Radiant Panel</option>
          </select>
        </div>

        <div>
          <label htmlFor="heating-hours-input" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Daily Operating Hours
          </label>
          <input
            id="heating-hours-input"
            type="number"
            min={1}
            max={24}
            value={hoursPerDay === 0 ? '' : hoursPerDay}
            onChange={(e) => setHoursPerDay(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Direct Impact Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 text-center">
          <span className="text-sm font-medium text-slate-500 block mb-0.5">Indoor Particulate Drop</span>
          <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            -{savings.indoorPollutantReductionPercent}%
          </span>
          <span className="text-xs text-slate-500 block mt-0.5">Direct bronchial protection</span>
        </div>

        <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/60 text-center">
          <span className="text-sm font-medium text-slate-500 block mb-0.5">Daily CO2 Prevented</span>
          <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
            {savings.dailyCo2SavedKg} kg
          </span>
          <span className="text-xs text-slate-500 block mt-0.5">
            {(savings.dailyCo2SavedKg * 30).toFixed(0)} kg CO2 per month
          </span>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 text-center">
          <span className="text-sm font-medium text-slate-500 block mb-0.5">Particulate Avoided / Day</span>
          <span className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {savings.dailyPm25SavedGrams} g
          </span>
          <span className="text-xs text-slate-500 block mt-0.5">Avoided in neighborhood air shed</span>
        </div>
      </div>
    </div>
  );
};
