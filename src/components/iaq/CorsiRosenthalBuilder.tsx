import React, { useState } from 'react';
import {
  analyzeRoomAirCleaning,
  getCorsiRosenthalSpecs,
} from '../../services/calculations/cadrCalculator';
import { Box, DollarSign } from 'lucide-react';

export const CorsiRosenthalBuilder: React.FC = () => {
  const [roomSqFt, setRoomSqFt] = useState<number>(350);
  const [ceilingHeight, setCeilingHeight] = useState<number>(9);
  const [filterType, setFilterType] = useState<'MERV-13' | 'MERV-14' | 'HEPA-grade'>('MERV-13');
  const [filterCount, setFilterCount] = useState<4 | 5>(4);
  const [fanSpeed, setFanSpeed] = useState<'low' | 'medium' | 'high'>('medium');

  const crSpecs = getCorsiRosenthalSpecs(filterType, filterCount, fanSpeed);
  const analysis = analyzeRoomAirCleaning({
    roomSqFt: Math.max(50, Number(roomSqFt) || 50),
    ceilingHeightFt: Math.max(7, Number(ceilingHeight) || 8),
    currentPurifierCadrCfm: crSpecs.estimatedCadrPm25,
    isHighSmogEpisode: true,
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-brand-500" aria-hidden="true" />
            <h2 className="text-xl font-bold">DIY Corsi-Rosenthal Box Air Cleaner Studio</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            ASHRAE-recommended low-cost, high-CADR particulate cleaner for severe winter inversions
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
          <DollarSign className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Saves ${crSpecs.commercialHepaEquivalentCostUsd - crSpecs.estimatedCostUsd} vs commercial HEPA</span>
        </div>
      </div>

      {/* Sizing & Builder Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
        <div>
          <label htmlFor="room-sqft-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Room Area (sq ft)
          </label>
          <input
            id="room-sqft-input"
            type="number"
            min={50}
            max={2000}
            value={roomSqFt === 0 ? '' : roomSqFt}
            onChange={(e) => setRoomSqFt(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="ceiling-height-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Ceiling Height (ft)
          </label>
          <input
            id="ceiling-height-input"
            type="number"
            min={7}
            max={20}
            value={ceilingHeight === 0 ? '' : ceilingHeight}
            onChange={(e) => setCeilingHeight(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <label htmlFor="filter-type-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Filter Media Standard
          </label>
          <select
            id="filter-type-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'MERV-13' | 'MERV-14' | 'HEPA-grade')}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="MERV-13">MERV-13 (85% PM2.5)</option>
            <option value="MERV-14">MERV-14 (90% PM2.5)</option>
            <option value="HEPA-grade">HEPA-grade (97%)</option>
          </select>
        </div>

        <div>
          <label htmlFor="filter-count-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Cube Configuration
          </label>
          <select
            id="filter-count-select"
            value={filterCount}
            onChange={(e) => setFilterCount(parseInt(e.target.value, 10) as 4 | 5)}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value={4}>4-Filter Standard</option>
            <option value={5}>5-Filter (+8% CFM)</option>
          </select>
        </div>

        <div>
          <label htmlFor="fan-speed-select" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Fan Speed
          </label>
          <select
            id="fan-speed-select"
            value={fanSpeed}
            onChange={(e) => setFanSpeed(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="low">Low (42 dB)</option>
            <option value="medium">Medium (51 dB)</option>
            <option value="high">High (58 dB)</option>
          </select>
        </div>
      </div>

      {/* Engineering Output Scorecard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-sm text-slate-500 block mb-0.5 font-medium">Clean Air Delivery (CADR)</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {crSpecs.estimatedCadrPm25} CFM
          </span>
          <span className="text-xs text-slate-400 block mt-0.5">PM2.5 filtration rate</span>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-sm text-slate-500 block mb-0.5 font-medium">Air Changes / Hour (ACH)</span>
          <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {analysis.effectiveAch} ACH
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
            {analysis.effectiveAch >= analysis.targetAch ? 'Optimal (5+ ACH)' : 'Acceptable'}
          </span>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-sm text-slate-500 block mb-0.5 font-medium">90% Particle Clearance</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {analysis.timeToClean90PercentMinutes} mins
          </span>
          <span className="text-xs text-slate-400 block mt-0.5">Decay to 10% ambient</span>
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-sm text-slate-500 block mb-0.5 font-medium">DIY Build Cost</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${crSpecs.estimatedCostUsd}
          </span>
          <span className="text-xs text-slate-400 block mt-0.5">
            vs ${crSpecs.commercialHepaEquivalentCostUsd} commercial
          </span>
        </div>
      </div>

      {/* Assembly Guide Steps */}
      <div className="p-4 bg-brand-50/40 dark:bg-brand-950/20 rounded-xl border border-brand-200 dark:border-brand-900/60">
        <h3 className="text-sm font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 mb-2">
          Step-by-Step Construction Instructions
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <li><strong>Orient Filters:</strong> Position 4 MERV-13 filters with airflow arrows pointing INWARD toward the interior void.</li>
          <li><strong>Seal Cube Edges:</strong> Seal all 4 vertical seam joints securely with duct tape or gaffer tape.</li>
          <li><strong>Base Seal:</strong> Tape a 20x20" cardboard panel over the bottom opening to prevent floor dust bypass.</li>
          <li><strong>Mount Fan on Top:</strong> Set the 20" box fan facing UPWARDS (exhausting clean air into ceiling zone).</li>
          <li><strong>Cardboard Shroud (+15% CFM):</strong> Cut a 15-inch circular hole in a piece of cardboard and tape it over the fan face. This stops blade-tip backdraft and increases effective clean air airflow by 15%!</li>
        </ol>
      </div>
    </div>
  );
};
