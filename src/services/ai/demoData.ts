/**
 * Demo Data & Fallback Knowledge Store
 * Serves verified high-fidelity responses when offline or in fallback mode (Pillar 6).
 */

import { DailySmogPlan } from '../../types/routines';

export interface IAQDiagnosisResponse {
  problemSummary: string;
  urgentSafetyStep: string;
  recommendedHacks: {
    hackId: string;
    title: string;
    expectedImpact: string;
    steps: string[];
  }[];
  medicalDisclaimer: string;
}

export const DEMO_SMOG_PLAN_DELHI_VULNERABLE: DailySmogPlan = {
  id: 'plan-delhi-sharma-demo',
  date: new Date().toISOString().split('T')[0],
  householdId: 'sharma-family',
  forecastAqiPeak: 435,
  inversionPeakHours: '06:00 - 09:30 AM & 19:30 - 23:00 PM',
  healthShieldScore: 92,
  totalInhaledPm25AvoidedUg: 1840,
  totalCigarettesAvoidedEquivalent: 3.48,
  totalCo2SavedKg: 4.8,
  activities: [
    {
      id: 'act-1',
      timeSlot: '06:30 - 08:30 AM',
      standardActivity: 'Morning school bus drop-off & grandmother balcony walk',
      smogAdaptedActivity: 'Keep windows sealed; shift grandmother walk to indoor hallway; arrange multi-family electric carpool at 08:30 AM',
      timeShiftHours: 1.5,
      modeShift: 'Single car drop -> 4-family electric carpool',
      exposureReductionPercent: 88,
      emissionReductionGramsCO2: 2400,
      emissionReductionGramsPM25: 45,
      reasoning: 'Severe thermal inversion boundary layer is compressed to 180m; ambient PM2.5 exceeds 340 µg/m³. Delaying commute by 1 hour reduces infant particle inhalation by 60%.',
      vulnerabilityTarget: 'Aarav (Toddler) & Kamla (Asthmatic Grandmother)',
    },
    {
      id: 'act-2',
      timeSlot: '12:30 - 01:15 PM',
      standardActivity: 'Windows kept closed all day causing CO2 buildup and stuffiness',
      smogAdaptedActivity: 'Execute 30-minute Solar Breakout Ventilation flush on opposite windows, followed by air purifiers on high for 20 mins',
      exposureReductionPercent: 40,
      emissionReductionGramsCO2: 0,
      emissionReductionGramsPM25: 0,
      reasoning: 'Solar heating lifts the inversion ceiling to >850m. Outdoor PM2.5 drops to daytime minimum. This is the only safe window to purge indoor CO2 without trapping toxic particulates.',
      vulnerabilityTarget: 'Entire Household',
    },
    {
      id: 'act-3',
      timeSlot: '05:30 - 07:00 PM',
      standardActivity: 'Driving petrol car to market during evening rush hour',
      smogAdaptedActivity: 'Combine neighborhood shopping with electric metro transit; avoid open frying without range hood',
      modeShift: 'Petrol car -> Metro transit & induction cooking',
      exposureReductionPercent: 75,
      emissionReductionGramsCO2: 2400,
      emissionReductionGramsPM25: 38,
      reasoning: 'Evening cooling traps diesel exhaust at ground level. Metro trip avoids cold-start emissions and vehicle queue exhaust exposure.',
      vulnerabilityTarget: 'Rohan & Pooja',
    },
  ],
};

export const DEMO_IAQ_DIAGNOSIS: IAQDiagnosisResponse = {
  problemSummary: 'Acute winter nighttime particulate trap combined with cold bronchial irritation.',
  urgentSafetyStep: 'Immediately relocate asthmatic family member to the smallest sealable bedroom, engage Corsi-Rosenthal Box / HEPA purifier on maximum speed, and do NOT open exterior windows.',
  recommendedHacks: [
    {
      hackId: 'corsi-rosenthal-box',
      title: 'Emergency Clean Air Zone Creation',
      expectedImpact: '85-90% PM2.5 reduction within 25 minutes',
      steps: [
        'Close bedroom doors and place rolled towels or draft stoppers under the door gap.',
        'Position the air purifier or Corsi-Rosenthal Box at waist height in the center of the room.',
        'Run on High speed for 20 minutes to achieve 5+ Air Changes per Hour (ACH), then turn to Medium for quiet sleep.',
      ],
    },
    {
      hackId: 'wet-microfiber-mopping',
      title: 'Surface Microfiber Wipe-Down',
      expectedImpact: 'Prevents resuspension of settled PM2.5/PM10',
      steps: [
        'Wipe bed headboards and side tables with a damp microfiber cloth.',
        'Do not dry sweep or vacuum unless using a certified HEPA-exhaust vacuum.',
      ],
    },
  ],
  medicalDisclaimer: 'Notice: AeroHaven provides environmental exposure mitigation recommendations. For acute shortness of breath, wheezing, or stridor, administer prescribed rescue inhalers immediately and seek medical care.',
};
