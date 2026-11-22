/**
 * Atmospheric Inversion Engine
 * Models winter diurnal temperature inversion, boundary layer dynamics,
 * and optimal ventilation windows.
 */

import { HourlyPollutionPoint, InversionDynamics } from '../../types/pollution';

export interface InversionAnalysisResult {
  currentStatus: 'severe-inversion' | 'moderate-inversion' | 'neutral' | 'inversion-broken';
  mixingLayerHeightMeters: number;
  dispersionFactor: number; // 0 (stagnant trap) to 1.0 (free dispersion)
  safestVentilationWindow: {
    startHour: number;
    endHour: number;
    recommendedDurationMin: number;
    rationale: string;
  };
  hourlyRiskMap: { hour: number; riskScore: number; isTrapZone: boolean }[];
}

/**
 * Calculates atmospheric mixing layer height & inversion severity based on
 * hour of day (diurnal solar cycle), surface temperature, and wind speed.
 */
export function calculateInversionDynamics(
  hour: number,
  groundTempC: number,
  windSpeedKmh: number,
  baselinePm25: number
): InversionDynamics {
  const h = Math.floor(((hour % 24) + 24) % 24);
  const safeWind = Math.max(0, windSpeedKmh);
  const safePm25 = Math.max(0, baselinePm25);

  let boundaryLayerHeightMeters = 300;
  let isInversionActive = true;
  let inversionStrength: InversionDynamics['inversionStrength'] = 'moderate';

  if (h >= 5 && h <= 9) {
    boundaryLayerHeightMeters = 150 + safeWind * 5;
    isInversionActive = true;
    inversionStrength = 'extreme';
  } else if (h >= 10 && h <= 11) {
    boundaryLayerHeightMeters = 400 + safeWind * 10;
    isInversionActive = true;
    inversionStrength = 'moderate';
  } else if (h >= 12 && h <= 15) {
    boundaryLayerHeightMeters = 850 + safeWind * 20;
    isInversionActive = false; // Inversion broken by solar convective mixing
    inversionStrength = 'low';
  } else if (h >= 16 && h <= 19) {
    boundaryLayerHeightMeters = 500;
    isInversionActive = true;
    inversionStrength = 'moderate';
  } else {
    // Night hours 20:00 - 04:00
    boundaryLayerHeightMeters = 220 + safeWind * 5;
    isInversionActive = true;
    inversionStrength = 'strong';
  }

  // Stagnant low winds (< 5 km/h) aggravate inversion trap
  if (safeWind < 4 && isInversionActive) {
    if (inversionStrength === 'strong') inversionStrength = 'extreme';
  }

  const inversionCeilingTemp = isInversionActive
    ? groundTempC + (inversionStrength === 'extreme' ? 4.5 : 2.0)
    : groundTempC - 3.0; // Normal lapse rate when broken

  return {
    isInversionActive,
    inversionStrength,
    boundaryLayerHeightMeters: Math.round(boundaryLayerHeightMeters),
    groundTempCelsius: groundTempC,
    inversionCeilingTempCelsius: parseFloat(inversionCeilingTemp.toFixed(1)),
    windSpeedKmh: safeWind,
    humidityPercent: h >= 4 && h <= 9 ? 85 : 55,
    peakSmogHours: [
      { start: '06:00', end: '09:30' },
      { start: '19:30', end: '23:00' },
    ],
    safeVentilationWindow: {
      start: '13:00',
      end: '14:30',
      riskLevel: safePm25 > 300 ? 'moderate' : 'low',
    },
  };
}

/**
 * Generates an hourly 24h curve of PM2.5 and inversion trap dynamics
 */
export function generateDiurnalSmogForecast(
  basePm25: number,
  baseGroundTempC: number = 8,
  windSpeedKmh: number = 4
): HourlyPollutionPoint[] {
  const points: HourlyPollutionPoint[] = [];
  // Colder ground and calmer winds intensify stagnation factor
  const stagnationBonus = (baseGroundTempC < 10 ? 0.1 : 0) + (windSpeedKmh < 5 ? 0.1 : 0);

  for (let h = 0; h < 24; h++) {
    // Diurnal factor multiplier for winter smog
    let factor = 1.0;
    if (h >= 6 && h <= 9) {
      factor = 1.55 + stagnationBonus; // Morning inversion spike + vehicular cold starts
    } else if (h >= 10 && h <= 11) {
      factor = 1.25;
    } else if (h >= 12 && h <= 15) {
      factor = 0.65; // Solar thermal breakup & wind mixing
    } else if (h >= 16 && h <= 18) {
      factor = 0.95;
    } else if (h >= 19 && h <= 23) {
      factor = 1.35 + stagnationBonus; // Evening boundary layer compression + biomass/heating
    } else {
      factor = 1.15; // Late night buildup
    }

    const pm25 = Math.round(basePm25 * factor);
    // Rough AQI conversion
    const aqi = Math.min(500, Math.round(pm25 * 1.35));
    const isInversionPeak = (h >= 6 && h <= 9) || (h >= 20 && h <= 23);
    const ventilationSafe = h >= 12 && h <= 15;

    points.push({
      hour: h,
      timeLabel: `${h.toString().padStart(2, '0')}:00`,
      aqi,
      pm25,
      isInversionPeak,
      ventilationSafe,
    });
  }

  return points;
}
