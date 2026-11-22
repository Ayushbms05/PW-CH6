import React, { useState } from 'react';
import { geminiClient } from '../../services/ai/geminiClient';
import { buildIAQTroubleshootPrompt } from '../../services/ai/promptTemplates';
import { HouseholdProfile } from '../../types/profile';
import { LocationAirData } from '../../types/pollution';
import { IAQDiagnosisResponse } from '../../services/ai/demoData';
import { Sparkles, Send, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

interface AICopilotProps {
  currentProfile: HouseholdProfile;
  airData: LocationAirData;
}

export const AICopilot: React.FC<AICopilotProps> = ({ currentProfile, airData }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<IAQDiagnosisResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const presetQueries = [
    'My child is coughing at 3 AM from winter smog',
    'How do I seal drafty balcony sliding doors cheaply?',
    'Should I run my car AC in fresh air or recirculate mode?',
    'Is it safe to go for a brisk morning walk at 7:00 AM?',
  ];

  const handleDiagnose = async (userText: string) => {
    if (!userText.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    setQuery(userText);

    try {
      const { prompt, schemaDescription } = buildIAQTroubleshootPrompt(userText, currentProfile, airData);
      const res = await geminiClient.generateJson<IAQDiagnosisResponse>(prompt, schemaDescription, {
        task: 'light',
        requiredFields: ['problemSummary', 'urgentSafetyStep', 'recommendedHacks'],
      });
      setDiagnosis(res);
    } catch {
      setErrorMessage('Diagnostic analysis currently unavailable. Please verify input or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-brand-500" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-bold">AeroHaven GenAI Emergency & Lifestyle Co-Pilot</h2>
          <p className="text-sm text-slate-500">
            Instant guidance for nighttime coughing episodes, window sealing, and toxic smog avoidance
          </p>
        </div>
      </div>

      {/* Preset prompt pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-500">Instant Questions:</span>
        {presetQueries.map((pill) => (
          <button
            key={pill}
            onClick={() => handleDiagnose(pill)}
            className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-300 hover:text-brand-600 transition-colors border border-slate-200 dark:border-slate-700"
          >
            {pill}
          </button>
        ))}
      </div>

      {/* Query Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleDiagnose(query);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Ask anything about winter smog, coughing symptoms, or indoor purification"
          placeholder="Ask anything about winter smog, coughing symptoms, or indoor purification..."
          className="flex-1 px-4 py-2.5 text-sm sm:text-base rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-5 py-2.5 rounded-xl font-semibold text-sm sm:text-base bg-brand-600 hover:bg-brand-700 text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Ask</span>
        </button>
      </form>

      {errorMessage && (
        <div role="alert" className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Diagnosis Response Output */}
      {diagnosis && (
        <div
          role="region"
          aria-live="polite"
          className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-4 animate-fade-in"
        >
          {/* Urgent safety step */}
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" aria-hidden="true" />
            <div>
              <strong className="block text-base mb-0.5">Immediate Protocol:</strong>
              {diagnosis.urgentSafetyStep}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">
              Atmospheric Diagnostic Summary
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
              {diagnosis.problemSummary}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Recommended Evidence-Backed Interventions
            </h3>
            {diagnosis.recommendedHacks.map((hack, idx) => (
              <div
                key={hack.hackId || idx}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {hack.title}
                  </h4>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {hack.expectedImpact}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                  {hack.steps.map((st, sIdx) => (
                    <li key={sIdx}>{st}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {diagnosis.medicalDisclaimer && (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{diagnosis.medicalDisclaimer}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
