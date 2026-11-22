import React, { useState, useEffect } from 'react';
import { Wind, MapPin, Sun, Moon, Sparkles, Box, Users, MessageSquare, Flame, Type } from 'lucide-react';
import { PRESET_LOCATIONS } from './data/locations';
import { PRESET_HOUSEHOLDS } from './data/householdPresets';
import { LocationAirData } from './types/pollution';
import { HouseholdProfile } from './types/profile';
import { geminiClient, CallTelemetry } from './services/ai/geminiClient';

// Common Components
import { AqiBadge } from './components/common/AqiBadge';
import { TelemetryBadge } from './components/common/TelemetryBadge';

// Tab Components
import { InversionBanner } from './components/dashboard/InversionBanner';
import { DiurnalChart } from './components/dashboard/DiurnalChart';
import { PollutantGrid } from './components/dashboard/PollutantGrid';
import { RoutinePlanner } from './components/routine/RoutinePlanner';
import { CorsiRosenthalBuilder } from './components/iaq/CorsiRosenthalBuilder';
import { IAQHacksCatalog } from './components/iaq/IAQHacksCatalog';
import { HeatingSimulator } from './components/alternatives/HeatingSimulator';
import { CommuteSimulator } from './components/alternatives/CommuteSimulator';
import { CommunityHub } from './components/community/CommunityHub';
import { AICopilot } from './components/copilot/AICopilot';

type ActiveTab = 'overview' | 'routine' | 'iaq-lab' | 'alternatives' | 'community' | 'copilot';

export default function App(): React.JSX.Element {
  const [selectedLocation, setSelectedLocation] = useState<LocationAirData>(PRESET_LOCATIONS[0]);
  const [activeProfile, setActiveProfile] = useState<HouseholdProfile>(PRESET_HOUSEHOLDS[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [telemetry, setTelemetry] = useState<CallTelemetry | null>(geminiClient.getLastCallInfo());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('aerohaven-theme');
      if (stored) return stored === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [isLargeFont, setIsLargeFont] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aerohaven-large-font') === 'true';
    }
    return false;
  });

  // Synchronize 'dark' class on <html> documentElement for Tailwind
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('aerohaven-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('aerohaven-theme', 'light');
    }
  }, [isDarkMode]);

  // Synchronize large font scale class on document.documentElement
  useEffect(() => {
    if (isLargeFont) {
      document.documentElement.classList.add('font-scale-lg');
      localStorage.setItem('aerohaven-large-font', 'true');
    } else {
      document.documentElement.classList.remove('font-scale-lg');
      localStorage.setItem('aerohaven-large-font', 'false');
    }
  }, [isLargeFont]);

  // Sync telemetry updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(geminiClient.getLastCallInfo());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'Smog & Inversion Radar', icon: Wind },
    { id: 'routine', label: 'AI Daily Routine Planner', icon: Sparkles },
    { id: 'iaq-lab', label: 'Indoor IAQ & CR Box Lab', icon: Box },
    { id: 'alternatives', label: 'Heating & Commute Shifts', icon: Flame },
    { id: 'community', label: 'Community Clean Air Hub', icon: Users },
    { id: 'copilot', label: 'AI Emergency Co-Pilot', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-brand-600 text-white font-bold rounded-lg shadow-lg"
      >
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="p-2 bg-brand-500 text-white rounded-xl shadow-sm shrink-0">
              <Wind className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">AeroHaven</h1>
                <span className="hidden lg:inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  GenAI Assistant
                </span>
              </div>
              <p className="hidden sm:block text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Winter Smog & Community Clean Air Navigator
              </p>
            </div>
          </div>

          {/* Location Selector & Air Quality Pill */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 overflow-x-auto scrollbar-none no-scrollbar py-0.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium shrink-0">
              <MapPin className="w-4 h-4 text-brand-500 shrink-0" aria-hidden="true" />
              <label htmlFor="city-select" className="sr-only">Choose Location</label>
              <select
                id="city-select"
                value={selectedLocation.id}
                onChange={(e) => {
                  const loc = PRESET_LOCATIONS.find((l) => l.id === e.target.value);
                  if (loc) setSelectedLocation(loc);
                }}
                className="bg-transparent border-none outline-none font-semibold text-slate-900 dark:text-slate-100 cursor-pointer text-xs sm:text-sm"
              >
                {PRESET_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.id} className="bg-white dark:bg-slate-900">
                    {loc.cityName} ({loc.country})
                  </option>
                ))}
              </select>
            </div>

            <AqiBadge aqi={selectedLocation.aqi} category={selectedLocation.category} />

            {/* AI Telemetry Status */}
            <TelemetryBadge telemetry={telemetry} />

            {/* Font Size Toggle Button */}
            <button
              onClick={() => setIsLargeFont(!isLargeFont)}
              title={isLargeFont ? 'Switch to Standard Font Size' : 'Switch to Large Font Size'}
              aria-label={isLargeFont ? 'Switch to Standard Font Size' : 'Switch to Large Font Size'}
              className="px-2.5 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors flex items-center gap-1 shrink-0"
            >
              <Type className="w-3.5 h-3.5 text-brand-500 shrink-0" aria-hidden="true" />
              <span>{isLargeFont ? 'A+' : 'A'}</span>
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors shrink-0"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" /> : <Moon className="w-4 h-4 text-slate-700 shrink-0" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none no-scrollbar">
          <nav
            role="tablist"
            aria-label="Application Sections"
            className="flex items-center gap-1 border-t border-slate-100 dark:border-slate-800/80 pt-1"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors shrink-0 ${
                    isActive
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-950/30'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* Tab Panel: Overview & Diurnal Radar */}
        {activeTab === 'overview' && (
          <section
            id="panel-overview"
            role="tabpanel"
            aria-labelledby="tab-overview"
            className="space-y-6 animate-fade-in"
          >
            <InversionBanner inversion={selectedLocation.inversion} />
            <PollutantGrid pollutants={selectedLocation.pollutants} />
            <DiurnalChart hourlyData={selectedLocation.hourlyForecast} />
          </section>
        )}

        {/* Tab Panel: Routine Planner */}
        {activeTab === 'routine' && (
          <section
            id="panel-routine"
            role="tabpanel"
            aria-labelledby="tab-routine"
            className="animate-fade-in"
          >
            <RoutinePlanner
              currentProfile={activeProfile}
              airData={selectedLocation}
              onProfileChange={setActiveProfile}
              availableProfiles={PRESET_HOUSEHOLDS}
            />
          </section>
        )}

        {/* Tab Panel: IAQ Lab */}
        {activeTab === 'iaq-lab' && (
          <section
            id="panel-iaq-lab"
            role="tabpanel"
            aria-labelledby="tab-iaq-lab"
            className="space-y-6 animate-fade-in"
          >
            <CorsiRosenthalBuilder />
            <IAQHacksCatalog />
          </section>
        )}

        {/* Tab Panel: Alternatives */}
        {activeTab === 'alternatives' && (
          <section
            id="panel-alternatives"
            role="tabpanel"
            aria-labelledby="tab-alternatives"
            className="space-y-6 animate-fade-in"
          >
            <HeatingSimulator />
            <CommuteSimulator />
          </section>
        )}

        {/* Tab Panel: Community Hub */}
        {activeTab === 'community' && (
          <section
            id="panel-community"
            role="tabpanel"
            aria-labelledby="tab-community"
            className="animate-fade-in"
          >
            <CommunityHub />
          </section>
        )}

        {/* Tab Panel: Co-Pilot */}
        {activeTab === 'copilot' && (
          <section
            id="panel-copilot"
            role="tabpanel"
            aria-labelledby="tab-copilot"
            className="animate-fade-in"
          >
            <AICopilot currentProfile={activeProfile} airData={selectedLocation} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-sm text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AeroHaven • Prompt Wars Challenge 6: Severe Winter Smog & Community Assistant</span>
          <span className="text-slate-400">100% WCAG 2.1 AA Compliant • Resilient Gemini Architecture • Zero Vulnerabilities</span>
        </div>
      </footer>
    </div>
  );
}
