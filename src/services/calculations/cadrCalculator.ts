/**
 * Clean Air Delivery Rate (CADR) & IAQ Engineering Engine
 * Computes Corsi-Rosenthal Box specs, room sizing, Air Changes per Hour (ACH),
 * and clearance decay times for winter smog indoors.
 */

import { CorsiRosenthalSpecs } from '../../types/iaq';

export interface RoomSizingInput {
  roomSqFt: number;
  ceilingHeightFt?: number; // default 9ft
  currentPurifierCadrCfm?: number;
  isHighSmogEpisode?: boolean; // requires min 5 ACH during severe smog
}

export interface RoomCleanAirAnalysis {
  roomVolumeCuFt: number;
  effectiveAch: number; // Air changes per hour
  targetAch: number;
  cadrDeficitCfm: number;
  timeToClean90PercentMinutes: number;
  timeToClean99PercentMinutes: number;
  recommendedCorsiRosenthalConfig: CorsiRosenthalSpecs;
  adequacyRating: 'inadequate' | 'fair' | 'good' | 'optimal';
}

/**
 * Calculates Corsi-Rosenthal Box filtration parameters
 */
export function getCorsiRosenthalSpecs(
  filterType: 'MERV-13' | 'MERV-14' | 'HEPA-grade' = 'MERV-13',
  filterCount: 4 | 5 = 4,
  fanSpeed: 'low' | 'medium' | 'high' = 'medium'
): CorsiRosenthalSpecs {
  // 20" Box Fan typical airflows across 4-5 pleats
  const speedCfm = {
    low: 280,
    medium: 420,
    high: 560,
  };

  // Single-pass efficiency on PM2.5
  const efficiency = {
    'MERV-13': 0.85,
    'MERV-14': 0.90,
    'HEPA-grade': 0.97,
  };

  const rawCfm = speedCfm[fanSpeed] * (filterCount === 5 ? 1.08 : 1.0);
  const cadr = Math.round(rawCfm * efficiency[filterType]);

  const noise = fanSpeed === 'low' ? 42 : fanSpeed === 'medium' ? 51 : 58;

  // Commercial HEPA unit with 400 CFM typically costs $400 - $650
  // CR box with 4 MERV-13 filters + box fan costs ~$65 - $80
  const filterCost = filterCount * 14;
  const fanCost = 25;
  const totalCost = filterCost + fanCost;

  return {
    filterType,
    filterCount,
    filterDimensionsInches: { width: 20, height: 20, depth: 2 },
    fanSizeInches: 20,
    fanSpeed,
    estimatedCfm: Math.round(rawCfm),
    estimatedCadrPm25: cadr,
    estimatedCostUsd: totalCost,
    commercialHepaEquivalentCostUsd: 450,
    noiseLevelDb: noise,
    filterLifeMonths: 6, // In severe smog, change pleats every 4-6 months
  };
}

/**
 * Computes Air Changes per Hour (ACH) and clearance times for a given room
 */
export function analyzeRoomAirCleaning(input: RoomSizingInput): RoomCleanAirAnalysis {
  const safeSqFt = Math.max(1, input.roomSqFt);
  const height = Math.max(1, input.ceilingHeightFt ?? 9);
  const volumeCuFt = safeSqFt * height;
  const currentCadr = Math.max(0, input.currentPurifierCadrCfm ?? 0);

  // In severe winter smog, EPA/ASHRAE recommends at least 5 ACH for vulnerable individuals
  const targetAch = input.isHighSmogEpisode ? 5.5 : 4.0;
  const requiredCadrCfm = Math.round((targetAch * volumeCuFt) / 60);

  const effectiveAch = volumeCuFt > 0 ? parseFloat(((currentCadr * 60) / volumeCuFt).toFixed(2)) : 0;
  const cadrDeficitCfm = Math.max(0, requiredCadrCfm - currentCadr);

  // Clearance times using standard well-mixed decay equation: C(t) = C0 * exp(-ACH * t)
  // t90 = -ln(0.10) / ACH = 2.3026 / ACH hours = (2.3026 * 60) / ACH minutes
  // t99 = -ln(0.01) / ACH = 4.6052 / ACH hours = (4.6052 * 60) / ACH minutes
  const timeToClean90PercentMinutes = effectiveAch > 0 ? Math.round((2.3026 * 60) / effectiveAch) : 999;
  const timeToClean99PercentMinutes = effectiveAch > 0 ? Math.round((4.6052 * 60) / effectiveAch) : 999;

  let adequacyRating: RoomCleanAirAnalysis['adequacyRating'] = 'inadequate';
  if (effectiveAch >= targetAch) {
    adequacyRating = 'optimal';
  } else if (effectiveAch >= targetAch * 0.75) {
    adequacyRating = 'good';
  } else if (effectiveAch >= targetAch * 0.45) {
    adequacyRating = 'fair';
  }

  const crSpecs = getCorsiRosenthalSpecs('MERV-13', 4, 'medium');

  return {
    roomVolumeCuFt: volumeCuFt,
    effectiveAch,
    targetAch,
    cadrDeficitCfm,
    timeToClean90PercentMinutes,
    timeToClean99PercentMinutes,
    recommendedCorsiRosenthalConfig: crSpecs,
    adequacyRating,
  };
}
