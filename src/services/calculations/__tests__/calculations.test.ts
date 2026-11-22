import { describe, it, expect } from 'vitest';
import {
  calculateInversionDynamics,
  generateDiurnalSmogForecast,
} from '../inversionEngine';
import {
  calculateInhaledParticulate,
  calculateCommuteShiftSavings,
  calculateHeatingShiftSavings,
  CIGARETTE_EQUIVALENT_UG_PM25,
} from '../impactCalculator';
import {
  getCorsiRosenthalSpecs,
  analyzeRoomAirCleaning,
} from '../cadrCalculator';

describe('Phase 2: Inversion Engine Unit Tests', () => {
  it('correctly models extreme winter morning inversion trap (07:00 AM)', () => {
    const morning = calculateInversionDynamics(7, 6, 2, 350);
    expect(morning.isInversionActive).toBe(true);
    expect(morning.inversionStrength).toBe('extreme');
    expect(morning.boundaryLayerHeightMeters).toBeLessThan(250);
    expect(morning.inversionCeilingTempCelsius).toBeGreaterThan(morning.groundTempCelsius);
  });

  it('correctly identifies afternoon solar inversion breakup window (13:00 PM)', () => {
    const midday = calculateInversionDynamics(13, 14, 6, 350);
    expect(midday.isInversionActive).toBe(false);
    expect(midday.inversionStrength).toBe('low');
    expect(midday.boundaryLayerHeightMeters).toBeGreaterThan(800);
  });

  it('generates a 24-hour diurnal forecast with peaks aligned to winter atmospheric physics', () => {
    const forecast = generateDiurnalSmogForecast(200, 8, 4);
    expect(forecast).toHaveLength(24);

    const morningPeak = forecast.find((p) => p.hour === 8);
    const afternoonDip = forecast.find((p) => p.hour === 14);

    expect(morningPeak).toBeDefined();
    expect(afternoonDip).toBeDefined();
    expect(morningPeak!.pm25).toBeGreaterThan(afternoonDip!.pm25);
    expect(morningPeak!.isInversionPeak).toBe(true);
    expect(afternoonDip!.ventilationSafe).toBe(true);
  });
});

describe('Phase 2: Impact Calculator Unit Tests', () => {
  it('calculates inhaled PM2.5 and equivalent cigarette burden accurately', () => {
    const result = calculateInhaledParticulate({
      pm25ConcentrationUgM3: 300,
      durationHours: 2,
      activityLevel: 'moderate-exercise', // 2.1 m³/h ventilation
      isIndoors: false,
    });

    // Inhaled = 300 * 2.1 * 2 = 1260 µg
    expect(result.inhaledPm25Micrograms).toBe(1260);
    expect(result.inhaledPm25IfUnprotectedMicrograms).toBe(1260);
    expect(result.microgramsAvoided).toBe(0);
    expect(result.equivalentCigarettesAvoided).toBe(0);

    // Now test with indoor HEPA / CR Box (85% filtration)
    const protectedResult = calculateInhaledParticulate({
      pm25ConcentrationUgM3: 300,
      durationHours: 2,
      activityLevel: 'sedentary', // 0.55 m³/h
      isIndoors: true,
      indoorPurificationEfficiency: 0.85,
    });

    // Unprotected = 300 * 0.55 * 2 = 330 µg
    // Protected = 300 * (1 - 0.85) * 0.55 * 2 = 49.5 µg
    expect(protectedResult.inhaledPm25Micrograms).toBe(49.5);
    expect(protectedResult.microgramsAvoided).toBe(280.5);
    expect(protectedResult.equivalentCigarettesAvoided).toBe(
      parseFloat((280.5 / CIGARETTE_EQUIVALENT_UG_PM25).toFixed(2))
    );
    expect(protectedResult.lungProtectionScore).toBe(85);
  });

  it('calculates carbon and particulate savings when switching commute to public transit', () => {
    const savings = calculateCommuteShiftSavings({
      distanceKm: 25,
      fromMode: 'single-car-diesel',
      toMode: 'metro-train',
    });

    // Diesel: 171g CO2/km, 28mg PM2.5/km
    // Metro: 28g CO2/km, 1mg PM2.5/km
    // Diff CO2: (171 - 28) * 25 = 3575g = 3.58 kg
    // Diff PM2.5: (28 - 1) * 25 = 675mg = 0.675 g
    expect(savings.co2SavedKg).toBe(3.58);
    expect(savings.pm25SavedGrams).toBe(0.675);
  });

  it('returns zero savings if commute modes are identical', () => {
    const savings = calculateCommuteShiftSavings({
      distanceKm: 15,
      fromMode: 'carpool',
      toMode: 'carpool',
    });
    expect(savings.co2SavedKg).toBe(0);
    expect(savings.pm25SavedGrams).toBe(0);
  });

  it('quantifies substantial indoor toxic reduction when replacing wood fire with heat pump', () => {
    const heating = calculateHeatingShiftSavings({
      hoursPerDay: 5,
      fromHeating: 'wood-fireplace',
      toHeating: 'heat-pump',
    });

    expect(heating.dailyCo2SavedKg).toBeGreaterThan(8);
    expect(heating.dailyPm25SavedGrams).toBeGreaterThan(70);
    expect(heating.indoorPollutantReductionPercent).toBeGreaterThanOrEqual(95);
  });
});

describe('Phase 2: CADR & Room Air Cleaning Calculator Unit Tests', () => {
  it('computes Corsi-Rosenthal Box specs with superior cost efficiency', () => {
    const cr4 = getCorsiRosenthalSpecs('MERV-13', 4, 'medium');
    expect(cr4.estimatedCadrPm25).toBeGreaterThanOrEqual(350);
    expect(cr4.estimatedCostUsd).toBeLessThan(100);
    expect(cr4.commercialHepaEquivalentCostUsd).toBeGreaterThanOrEqual(400);

    const cr5High = getCorsiRosenthalSpecs('MERV-14', 5, 'high');
    expect(cr5High.estimatedCadrPm25).toBeGreaterThan(cr4.estimatedCadrPm25);
  });

  it('evaluates room Air Changes per Hour (ACH) and clearance times correctly', () => {
    const analysis = analyzeRoomAirCleaning({
      roomSqFt: 300,
      ceilingHeightFt: 9,
      currentPurifierCadrCfm: 250,
      isHighSmogEpisode: true,
    });

    // Volume = 300 * 9 = 2700 cu ft
    // ACH = (250 * 60) / 2700 = 5.56 ACH
    expect(analysis.roomVolumeCuFt).toBe(2700);
    expect(analysis.effectiveAch).toBe(5.56);
    expect(analysis.adequacyRating).toBe('optimal');
    expect(analysis.timeToClean90PercentMinutes).toBeLessThan(30);
  });

  it('flags inadequate air cleaning when room is large and purifier is absent or undersized', () => {
    const inadequate = analyzeRoomAirCleaning({
      roomSqFt: 800,
      ceilingHeightFt: 10,
      currentPurifierCadrCfm: 50,
      isHighSmogEpisode: true,
    });

    expect(inadequate.adequacyRating).toBe('inadequate');
    expect(inadequate.cadrDeficitCfm).toBeGreaterThan(600);
  });

  it('handles calculation edge cases defensively (negative, zero, extreme inputs)', () => {
    // Negative distance in commute shift
    const zeroCommute = calculateCommuteShiftSavings({
      distanceKm: -50,
      fromMode: 'single-car-diesel',
      toMode: 'metro-train',
    });
    expect(zeroCommute.co2SavedKg).toBe(0);
    expect(zeroCommute.pm25SavedGrams).toBe(0);

    // Negative hours in heating shift
    const zeroHeating = calculateHeatingShiftSavings({
      hoursPerDay: -10,
      fromHeating: 'wood-fireplace',
      toHeating: 'heat-pump',
    });
    expect(zeroHeating.dailyCo2SavedKg).toBe(0);
    expect(zeroHeating.dailyPm25SavedGrams).toBe(0);

    // Negative/zero room sizing
    const zeroRoom = analyzeRoomAirCleaning({
      roomSqFt: -100,
      ceilingHeightFt: 0,
    });
    expect(zeroRoom.roomVolumeCuFt).toBeGreaterThanOrEqual(1);
    expect(zeroRoom.effectiveAch).toBeGreaterThanOrEqual(0);

    // Out-of-bounds hour (-4 or 28)
    const outOfBoundsInversion = calculateInversionDynamics(-4, 5, -2, -100);
    expect(outOfBoundsInversion.boundaryLayerHeightMeters).toBeGreaterThan(0);
    expect(outOfBoundsInversion.windSpeedKmh).toBe(0);
  });
});
