import React, { useState } from 'react';
import { HouseholdProfile } from '../../types/profile';
import { LocationAirData } from '../../types/pollution';
import { DailySmogPlan } from '../../types/routines';
import { generateOptimizedRoutine } from '../../services/ai/routineOptimizer';
import { ImpactScorecard } from './ImpactScorecard';
import { Sparkles, Clock, AlertCircle, RefreshCw } from 'lucide-react';

interface RoutinePlannerProps {
  currentProfile: HouseholdProfile;
  airData: LocationAirData;
  onProfileChange: (profile: HouseholdProfile) => void;
  availableProfiles: HouseholdProfile[];
}

export const RoutinePlanner: React.FC<RoutinePlannerProps> = ({
  currentProfile,
  airData,
  onProfileChange,
  availableProfiles,
}) => {
  const [plan, setPlan] = useState<DailySmogPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customNote, setCustomNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const generated = await generateOptimizedRoutine(currentProfile, airData, customNote);
      setPlan(generated);
    } catch {
      setErrorMessage('Unable to optimize routine at this moment. Please verify parameters or retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Household Selector & Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" aria-hidden="true" />
              <h2 className="text-xl font-bold">AI Low-Emission Daily Routine Navigator</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Synthesizes daily schedules that navigate severe thermal inversions and optimize commute/heating emissions.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <label htmlFor="household-select" className="text-sm font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              Active Household:
            </label>
            <select
              id="household-select"
              value={currentProfile.id}
              onChange={(e) => {
                const found = availableProfiles.find((p) => p.id === e.target.value);
                if (found) {
                  onProfileChange(found);
                  setPlan(null); // Reset plan on household change
                }
              }}
              className="px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              {availableProfiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Profile Details Chips */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-semibold text-slate-500">Vulnerable Members:</span>
          {currentProfile.members
            .filter((m) => m.vulnerabilities.length > 0)
            .map((m) => (
              <span
                key={m.id}
                className="px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-medium"
              >
                {m.name} ({m.vulnerabilities.join(', ')})
              </span>
            ))}
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Commute: {currentProfile.primaryCommute} ({currentProfile.dailyCommuteDistanceKm} km)
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Heating: {currentProfile.primaryHeating}
          </span>
        </div>

        {/* Action input */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            aria-label="Specific family requests or custom needs"
            placeholder="Add specific family need (e.g. Toddler outdoor playtime, grandmother morning prayer)..."
            className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-5 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Optimizing with GenAI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" aria-hidden="true" />
                <span>Plan My Family's Day</span>
              </>
            )}
          </button>
        </div>

        {errorMessage && (
          <div role="alert" className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Live Impact Scorecard */}
      {plan && (
        <>
          <ImpactScorecard
            shieldScore={plan.healthShieldScore}
            inhaledAvoidedUg={plan.totalInhaledPm25AvoidedUg}
            cigarettesAvoided={plan.totalCigarettesAvoidedEquivalent}
            co2SavedKg={plan.totalCo2SavedKg}
          />

          {/* Timeline schedule */}
          <div
            role="region"
            aria-label="Synthesized Low-Emission Schedule Timeline"
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">Optimized Daily Routine</h3>
                <p className="text-sm text-slate-500">
                  Targeting morning inversion danger hours ({plan.inversionPeakHours})
                </p>
              </div>
              <span className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                Peak Smog Shield Active
              </span>
            </div>

            <div className="space-y-4">
              {plan.activities.map((act, index) => (
                <div
                  key={act.id || index}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-brand-500/40 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-500 shrink-0" aria-hidden="true" />
                      <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {act.timeSlot}
                      </span>
                      {act.vulnerabilityTarget && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          Target: {act.vulnerabilityTarget}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold">
                        -{act.exposureReductionPercent}% Exposure
                      </span>
                      {act.emissionReductionGramsCO2 > 0 && (
                        <span className="px-2.5 py-0.5 rounded bg-teal-500/15 text-teal-700 dark:text-teal-300 font-semibold">
                          -{act.emissionReductionGramsCO2}g CO2
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm my-2">
                    <div className="p-3 rounded-lg bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
                      <span className="font-semibold text-rose-700 dark:text-rose-300 block mb-0.5">
                        Conventional Routine:
                      </span>
                      <p className="text-slate-600 dark:text-slate-300">{act.standardActivity}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300 block mb-0.5">
                        Low-Emission Smog-Adapted Shift:
                      </span>
                      <p className="text-slate-600 dark:text-slate-200 font-medium">{act.smogAdaptedActivity}</p>
                    </div>
                  </div>

                  <div className="text-sm text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/40 dark:border-slate-800/40 flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" aria-hidden="true" />
                    <span><strong>Atmospheric Rationale:</strong> {act.reasoning}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
