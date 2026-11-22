import React from 'react';
import { Layers, AlertTriangle, Sun, Gauge, ThermometerSnowflake } from 'lucide-react';
import { InversionDynamics } from '../../types/pollution';

interface InversionBannerProps {
  inversion: InversionDynamics;
}

export const InversionBanner: React.FC<InversionBannerProps> = ({ inversion }) => {
  return (
    <div
      role="region"
      aria-label="Winter Atmospheric Inversion Status"
      className="bg-gradient-to-r from-rose-950/20 via-amber-950/20 to-slate-900/40 border border-amber-500/30 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-500 rounded-xl shrink-0 mt-0.5">
            <Layers className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Atmospheric Dynamics
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-semibold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                {inversion.isInversionActive ? `${inversion.inversionStrength.toUpperCase()} INVERSION ACTIVE` : 'INVERSION BROKEN'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Winter Thermal Inversion Trap Detected
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Cold ground temperatures ({inversion.groundTempCelsius}°C) beneath warmer air aloft ({inversion.inversionCeilingTempCelsius}°C) create a natural thermal ceiling at <strong>{inversion.boundaryLayerHeightMeters}m</strong>, compressing vehicle and biomass emissions into a toxic surface layer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto shrink-0">
          <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs sm:text-sm mb-0.5">
              <Gauge className="w-4 h-4" aria-hidden="true" />
              <span>Ceiling Height</span>
            </div>
            <div className="text-base font-bold">{inversion.boundaryLayerHeightMeters} m</div>
          </div>

          <div className="p-3 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xs sm:text-sm mb-0.5">
              <ThermometerSnowflake className="w-4 h-4" aria-hidden="true" />
              <span>Ground Temp</span>
            </div>
            <div className="text-base font-bold">{inversion.groundTempCelsius}°C</div>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center col-span-2 sm:col-span-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm mb-0.5">
              <Sun className="w-4 h-4" aria-hidden="true" />
              <span>Safe Purge</span>
            </div>
            <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              {inversion.safeVentilationWindow.start} - {inversion.safeVentilationWindow.end}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Danger Inversion Hours: {inversion.peakSmogHours.map(h => `${h.start}-${h.end}`).join(' & ')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span>Stagnant Wind: {inversion.windSpeedKmh} km/h</span>
          <span>•</span>
          <span>Humidity: {inversion.humidityPercent}%</span>
        </div>
      </div>
    </div>
  );
};
