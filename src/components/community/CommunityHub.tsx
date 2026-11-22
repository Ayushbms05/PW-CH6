import React, { useState } from 'react';
import {
  PRESET_CARPOOLS,
  PRESET_SHARED_PURIFIERS,
  PRESET_COMMUNITY_REPORTS,
} from '../../data/communityPresets';
import { CarpoolSyndicate, SharedPurifierItem, CommunitySmogReport } from '../../types/community';
import { Car, Wind, AlertTriangle, ThumbsUp, CheckCircle } from 'lucide-react';

export const CommunityHub: React.FC = () => {
  const [carpools, setCarpools] = useState<CarpoolSyndicate[]>(PRESET_CARPOOLS);
  const purifiers: SharedPurifierItem[] = PRESET_SHARED_PURIFIERS;
  const [reports, setReports] = useState<CommunitySmogReport[]>(PRESET_COMMUNITY_REPORTS);
  const [joinedId, setJoinedId] = useState<string | null>(null);

  const handleJoinCarpool = (id: string) => {
    setCarpools((prev) =>
      prev.map((c) =>
        c.id === id && c.availableSeats > 0
          ? { ...c, availableSeats: c.availableSeats - 1 }
          : c
      )
    );
    setJoinedId(id);
    setTimeout(() => setJoinedId(null), 2500);
  };

  const handleUpvoteReport = (id: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, upvotesCount: r.upvotesCount + 1 } : r))
    );
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Neighborhood Clean Air Carpools */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5 text-brand-500" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-bold">Neighborhood Clean Air Carpool Syndicates</h2>
            <p className="text-sm text-slate-500">
              Coordinated rides scheduled after the morning inversion peak (08:30 AM+) to cut cold-start exhaust
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {carpools.map((pool) => (
            <div
              key={pool.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {pool.neighborhood}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {pool.routeTitle}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500/10 text-brand-700 dark:text-brand-300">
                  {pool.availableSeats} of {pool.totalSeats} seats open
                </span>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                <div><strong>Destination:</strong> {pool.destination}</div>
                <div><strong>Schedule:</strong> {pool.departureTime} → Return {pool.returnTime}</div>
                <div><strong>Coordinator:</strong> {pool.contactOrganizer}</div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                  Saves {pool.dailyCo2SavingsKg} kg CO2/day
                </span>
                <button
                  onClick={() => handleJoinCarpool(pool.id)}
                  disabled={pool.availableSeats === 0}
                  className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-40 transition-colors"
                >
                  {joinedId === pool.id ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Booked!
                    </span>
                  ) : pool.availableSeats === 0 ? (
                    'Full'
                  ) : (
                    'Reserve Seat'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Shared Air Purifier Lending Library */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Wind className="w-5 h-5 text-emerald-500" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-bold">Community Shared Air Purifier Lending Library</h2>
            <p className="text-sm text-slate-500">
              Emergency high-CADR air filtration units rotated between families with acute respiratory needs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {purifiers.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {item.model}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-semibold ${
                    item.availabilityStatus === 'available'
                      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  {item.availabilityStatus === 'available' ? 'Available for Loan' : 'Currently in Use'}
                </span>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-300 space-y-0.5">
                <div><strong>Filtration CADR:</strong> {item.cadrRatingCfm} CFM (for {item.idealRoomSqFt} sq ft room)</div>
                <div><strong>Location Hub:</strong> {item.currentHolderNeighborhood}</div>
                <div><strong>Initiative Sponsor:</strong> {item.donorOrCommunityHub}</div>
                {item.reservationReturnDate && (
                  <div className="text-amber-600 dark:text-amber-400">
                    <strong>Expected Return:</strong> {item.reservationReturnDate}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Citizen Smog & Burning Incident Reporting */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-bold">Neighborhood Citizen Smog & Burning Reports</h2>
            <p className="text-sm text-slate-500">
              Crowdsourced smoke plume detection: open leaf burning, trash fires, and idling truck queues
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    {report.incidentType.replace(/-/g, ' ')}
                  </span>
                  <div className="text-base font-semibold">{report.neighborhood} • <span className="text-xs sm:text-sm text-slate-400 font-normal">{report.timestamp}</span></div>
                </div>
                <button
                  onClick={() => handleUpvoteReport(report.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>Verify ({report.upvotesCount})</span>
                </button>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300">
                {report.description}
              </p>

              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm text-rose-700 dark:text-rose-300">
                <strong>Action Prompt:</strong> {report.localActionPrompt}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
