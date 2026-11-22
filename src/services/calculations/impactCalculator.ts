/**
 * Direct Impact Calculator
 * Computes PM2.5 inhalation mass, cigarette equivalence,
 * and emission savings (CO2 and PM2.5) for lifestyle and routine shifts.
 */

export interface ActivityInhalationParams {
  pm25ConcentrationUgM3: number;
  durationHours: number;
  activityLevel: 'rest-sleep' | 'sedentary' | 'light-activity' | 'moderate-exercise' | 'heavy-cardio';
  isIndoors: boolean;
  indoorPurificationEfficiency?: number; // e.g. 0.8 for 80% filtration
}

export interface InhalationImpactResult {
  inhaledPm25Micrograms: number;
  inhaledPm25IfUnprotectedMicrograms: number;
  microgramsAvoided: number;
  equivalentCigarettesAvoided: number;
  lungProtectionScore: number; // 0 to 100
}

export interface CommuteShiftImpactParams {
  distanceKm: number;
  fromMode: 'single-car-petrol' | 'single-car-diesel' | 'two-wheeler' | 'carpool' | 'metro-train' | 'bicycle-walk';
  toMode: 'single-car-petrol' | 'single-car-diesel' | 'two-wheeler' | 'carpool' | 'metro-train' | 'bicycle-walk';
}

export interface HeatingShiftImpactParams {
  hoursPerDay: number;
  fromHeating: 'wood-fireplace' | 'charcoal-brazier' | 'unvented-kerosene' | 'electric-radiant' | 'heat-pump';
  toHeating: 'wood-fireplace' | 'charcoal-brazier' | 'unvented-kerosene' | 'electric-radiant' | 'heat-pump';
}

/**
 * Inhalation rate in cubic meters per hour (m³/h) based on physiological ventilation
 * Reference: EPA Exposure Factors Handbook
 */
export const VENTILATION_RATES_M3_PER_HOUR: Record<ActivityInhalationParams['activityLevel'], number> = {
  'rest-sleep': 0.45,
  'sedentary': 0.55,
  'light-activity': 1.15,
  'moderate-exercise': 2.10,
  'heavy-cardio': 3.20,
};

/**
 * Berkeley Earth Rule of Thumb:
 * Inhaling 22 µg/m³ of PM2.5 over 24 hours at standard sedentary ventilation (~15 m³/day)
 * equates to the particulate lung burden of smoking 1 cigarette (approx 330 - 528 µg PM2.5 deposited).
 * Standard benchmark: 1 Cigarette ≈ 528 µg PM2.5 absorbed/inhaled.
 */
export const CIGARETTE_EQUIVALENT_UG_PM25 = 528;

/**
 * Calculates actual inhaled PM2.5 mass and the reduction achieved via interventions
 */
export function calculateInhaledParticulate(params: ActivityInhalationParams): InhalationImpactResult {
  const ventilationRate = VENTILATION_RATES_M3_PER_HOUR[params.activityLevel];
  const safePm25 = Math.max(0, params.pm25ConcentrationUgM3);
  const safeDuration = Math.max(0, params.durationHours);
  const safeEfficiency = Math.min(1, Math.max(0, params.indoorPurificationEfficiency ?? 0));

  const effectiveConcentration = params.isIndoors
    ? safePm25 * (1 - safeEfficiency)
    : safePm25;

  const actualInhaled = parseFloat(
    (effectiveConcentration * ventilationRate * safeDuration).toFixed(1)
  );

  const baselineUnprotected = parseFloat(
    (safePm25 * ventilationRate * safeDuration).toFixed(1)
  );

  const microgramsAvoided = Math.max(0, parseFloat((baselineUnprotected - actualInhaled).toFixed(1)));
  const equivalentCigarettesAvoided = parseFloat(
    (microgramsAvoided / CIGARETTE_EQUIVALENT_UG_PM25).toFixed(2)
  );

  const reductionFraction = baselineUnprotected > 0 ? (microgramsAvoided / baselineUnprotected) : 1;
  const lungProtectionScore = Math.min(100, Math.round(reductionFraction * 100));

  return {
    inhaledPm25Micrograms: actualInhaled,
    inhaledPm25IfUnprotectedMicrograms: baselineUnprotected,
    microgramsAvoided,
    equivalentCigarettesAvoided,
    lungProtectionScore,
  };
}

/**
 * Emissions factors per passenger-kilometer (g CO2e/km and mg PM2.5/km)
 */
export const COMMUTE_EMISSION_FACTORS: Record<
  CommuteShiftImpactParams['fromMode'],
  { co2GramsPerKm: number; pm25MgPerKm: number }
> = {
  'single-car-diesel': { co2GramsPerKm: 171, pm25MgPerKm: 28 },
  'single-car-petrol': { co2GramsPerKm: 154, pm25MgPerKm: 14 },
  'two-wheeler': { co2GramsPerKm: 72, pm25MgPerKm: 22 },
  'carpool': { co2GramsPerKm: 45, pm25MgPerKm: 6 },
  'metro-train': { co2GramsPerKm: 28, pm25MgPerKm: 1 },
  'bicycle-walk': { co2GramsPerKm: 0, pm25MgPerKm: 0 },
};

/**
 * Calculates emission savings when shifting commute mode
 */
export function calculateCommuteShiftSavings(params: CommuteShiftImpactParams): {
  co2SavedKg: number;
  pm25SavedGrams: number;
} {
  const from = COMMUTE_EMISSION_FACTORS[params.fromMode];
  const to = COMMUTE_EMISSION_FACTORS[params.toMode];
  const safeDistance = Math.max(0, params.distanceKm);

  const co2DiffGrams = Math.max(0, (from.co2GramsPerKm - to.co2GramsPerKm) * safeDistance);
  const pm25DiffMg = Math.max(0, (from.pm25MgPerKm - to.pm25MgPerKm) * safeDistance);

  return {
    co2SavedKg: parseFloat((co2DiffGrams / 1000).toFixed(2)),
    pm25SavedGrams: parseFloat((pm25DiffMg / 1000).toFixed(3)),
  };
}

/**
 * Heating emissions per hour of typical domestic space heating
 */
export const HEATING_EMISSION_FACTORS: Record<
  HeatingShiftImpactParams['fromHeating'],
  { co2GramsPerHour: number; pm25GramsPerHour: number; indoorHazardIndex: 'extreme' | 'high' | 'low' | 'none' }
> = {
  'wood-fireplace': { co2GramsPerHour: 1850, pm25GramsPerHour: 15.5, indoorHazardIndex: 'extreme' },
  'charcoal-brazier': { co2GramsPerHour: 2200, pm25GramsPerHour: 18.2, indoorHazardIndex: 'extreme' },
  'unvented-kerosene': { co2GramsPerHour: 1200, pm25GramsPerHour: 4.8, indoorHazardIndex: 'high' },
  'electric-radiant': { co2GramsPerHour: 620, pm25GramsPerHour: 0.05, indoorHazardIndex: 'none' },
  'heat-pump': { co2GramsPerHour: 195, pm25GramsPerHour: 0.01, indoorHazardIndex: 'none' },
};

/**
 * Computes daily savings when shifting from polluting heating to cleaner alternatives
 */
export function calculateHeatingShiftSavings(params: HeatingShiftImpactParams): {
  dailyCo2SavedKg: number;
  dailyPm25SavedGrams: number;
  indoorPollutantReductionPercent: number;
} {
  const from = HEATING_EMISSION_FACTORS[params.fromHeating];
  const to = HEATING_EMISSION_FACTORS[params.toHeating];
  const safeHours = Math.max(0, params.hoursPerDay);

  const co2GramsSaved = Math.max(0, (from.co2GramsPerHour - to.co2GramsPerHour) * safeHours);
  const pm25GramsSaved = Math.max(0, (from.pm25GramsPerHour - to.pm25GramsPerHour) * safeHours);

  const indoorReduction = from.pm25GramsPerHour > 0
    ? Math.min(100, Math.round(((from.pm25GramsPerHour - to.pm25GramsPerHour) / from.pm25GramsPerHour) * 100))
    : 0;

  return {
    dailyCo2SavedKg: parseFloat((co2GramsSaved / 1000).toFixed(2)),
    dailyPm25SavedGrams: parseFloat(pm25GramsSaved.toFixed(2)),
    indoorPollutantReductionPercent: Math.max(0, indoorReduction),
  };
}
