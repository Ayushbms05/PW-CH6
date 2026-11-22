import React, { useState } from 'react';
import { HourlyPollutionPoint } from '../../types/pollution';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface DiurnalChartProps {
  hourlyData: HourlyPollutionPoint[];
}

export const DiurnalChart: React.FC<DiurnalChartProps> = ({ hourlyData }) => {
  const [showDataTable, setShowDataTable] = useState(false);
  const maxPm25 = Math.max(...hourlyData.map((d) => d.pm25), 100);

  return (
    <div
      role="region"
      aria-labelledby="diurnal-chart-heading"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-500" aria-hidden="true" />
            <h2 id="diurnal-chart-heading" className="text-base sm:text-lg font-bold">
              24-Hour Diurnal Smog & Inversion Cycle
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Hourly particulate concentration showing morning inversion spikes and safe afternoon ventilation windows
          </p>
        </div>

        <button
          onClick={() => setShowDataTable(!showDataTable)}
          className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 self-end sm:self-auto"
          aria-expanded={showDataTable}
          aria-controls="diurnal-data-table"
        >
          <span>{showDataTable ? 'Hide Accessible Table' : 'Show Screen-Reader Table'}</span>
          {showDataTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Accessible screen-reader summary */}
      <p className="sr-only">
        Diurnal winter smog graph: Morning hours 06:00 to 09:30 AM peak with trapped thermal inversion. Afternoon hours 12:30 to 15:00 PM drop during solar breakup, providing the safe ventilation window. Detailed data table available below.
      </p>

      {/* Visual Bar Chart */}
      <div className="relative pt-6 pb-2" aria-hidden="true">
        <div className="h-44 flex items-end gap-1 sm:gap-1.5 w-full">
          {hourlyData.map((point) => {
            const heightPercent = Math.max(12, Math.round((point.pm25 / maxPm25) * 100));
            const isMorningPeak = point.hour >= 6 && point.hour <= 9;
            const isVentSafe = point.ventilationSafe;

            let barColor = 'bg-slate-400/80 hover:bg-slate-500';
            if (isMorningPeak) {
              barColor = 'bg-rose-500 hover:bg-rose-600';
            } else if (isVentSafe) {
              barColor = 'bg-emerald-500 hover:bg-emerald-600';
            } else if (point.hour >= 19 && point.hour <= 23) {
              barColor = 'bg-purple-500 hover:bg-purple-600';
            }

            return (
              <div
                key={point.hour}
                className="flex-1 flex flex-col items-center group relative h-full justify-end"
              >
                {/* Tooltip on hover */}
                <div
                  className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-slate-900 text-white text-xs rounded px-2.5 py-1.5 shadow-lg whitespace-nowrap"
                >
                  <span className="font-bold">{point.timeLabel}</span>: {point.pm25} µg/m³
                  {isMorningPeak && ' (Peak Inversion)'}
                  {isVentSafe && ' (Safe Purge Window)'}
                </div>

                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t transition-all ${barColor} cursor-default`}
                />
                <span className="text-xs text-slate-400 mt-1 select-none hidden sm:block">
                  {point.hour % 3 === 0 ? point.timeLabel.slice(0, 2) : ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-500" aria-hidden="true" />
              <span className="text-slate-600 dark:text-slate-300">Morning Inversion Peak (06:00 - 09:30)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500" aria-hidden="true" />
              <span className="text-slate-600 dark:text-slate-300">Solar Breakout Window (12:30 - 15:00)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-purple-500" aria-hidden="true" />
              <span className="text-slate-600 dark:text-slate-300">Evening Compression</span>
            </div>
          </div>
          <span className="text-slate-400 text-xs">Units: PM2.5 (µg/m³)</span>
        </div>
      </div>

      {/* Accessible Table for Screen Readers */}
      {showDataTable && (
        <div id="diurnal-data-table" className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <caption className="sr-only">24-hour hourly smog and ventilation safety data</caption>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th scope="col" className="py-2 px-3">Hour</th>
                <th scope="col" className="py-2 px-3">PM2.5 (µg/m³)</th>
                <th scope="col" className="py-2 px-3">Est. AQI</th>
                <th scope="col" className="py-2 px-3">Atmospheric Status</th>
                <th scope="col" className="py-2 px-3">Ventilation Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {hourlyData.map((row) => (
                <tr key={row.hour} className="border-b border-slate-100 dark:border-slate-800/60">
                  <td className="py-1.5 px-3 font-semibold">{row.timeLabel}</td>
                  <td className="py-1.5 px-3">{row.pm25}</td>
                  <td className="py-1.5 px-3">{row.aqi}</td>
                  <td className="py-1.5 px-3">
                    {row.isInversionPeak ? (
                      <span className="text-rose-600 dark:text-rose-400 font-semibold">Trapped Inversion</span>
                    ) : (
                      'Moderate mixing'
                    )}
                  </td>
                  <td className="py-1.5 px-3">
                    {row.ventilationSafe ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Safe for 20-30m purge</span>
                    ) : (
                      <span className="text-slate-400">Keep windows hermetically sealed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
