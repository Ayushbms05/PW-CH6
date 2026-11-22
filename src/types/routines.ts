export interface RoutineActivity {
  id: string;
  timeSlot: string; // e.g. "07:00 - 08:30"
  standardActivity: string;
  smogAdaptedActivity: string;
  timeShiftHours?: number; // e.g. shifted from 7am to 12pm
  modeShift?: string; // e.g. from personal car to metro
  exposureReductionPercent: number;
  emissionReductionGramsCO2: number;
  emissionReductionGramsPM25: number;
  reasoning: string;
  vulnerabilityTarget?: string;
}

export interface DailySmogPlan {
  id: string;
  date: string;
  householdId: string;
  forecastAqiPeak: number;
  inversionPeakHours: string;
  activities: RoutineActivity[];
  totalInhaledPm25AvoidedUg: number;
  totalCigarettesAvoidedEquivalent: number;
  totalCo2SavedKg: number;
  healthShieldScore: number; // 0-100 score of protection
}
