import { geminiClient } from './geminiClient';
import { buildRoutinePrompt } from './promptTemplates';
import { HouseholdProfile } from '../../types/profile';
import { LocationAirData } from '../../types/pollution';
import { DailySmogPlan } from '../../types/routines';
import {
  calculateCommuteShiftSavings,
  calculateInhaledParticulate,
} from '../calculations/impactCalculator';

/**
 * High-Level Routine Optimizer
 * Combines GenAI generation with verifiable scientific impact formulas
 */
export async function generateOptimizedRoutine(
  profile: HouseholdProfile,
  airData: LocationAirData,
  userNotes?: string
): Promise<DailySmogPlan> {
  const { prompt, schemaDescription } = buildRoutinePrompt(profile, airData, userNotes);

  const plan = await geminiClient.generateJson<DailySmogPlan>(prompt, schemaDescription, {
    task: 'heavy',
    requiredFields: ['id', 'activities', 'forecastAqiPeak', 'healthShieldScore'],
    systemInstruction:
      'You are AeroHaven AI, an atmospheric and health intelligence agent specializing in winter smog mitigation.',
  });

  // Re-verify and ground impact calculations using deterministic scientific formulas
  if (plan.activities && plan.activities.length > 0) {
    let totalInhaledAvoided = 0;
    let totalCo2AvoidedKg = 0;

    for (const act of plan.activities) {
      if (act.modeShift && act.modeShift.toLowerCase().includes('carpool')) {
        const savings = calculateCommuteShiftSavings({
          distanceKm: profile.dailyCommuteDistanceKm / 2,
          fromMode: 'single-car-petrol',
          toMode: 'carpool',
        });
        totalCo2AvoidedKg += savings.co2SavedKg;
      }

      // Calculate inhaled avoided
      const inhalation = calculateInhaledParticulate({
        pm25ConcentrationUgM3: airData.pollutants.pm25,
        durationHours: 1.5,
        activityLevel: 'light-activity',
        isIndoors: true,
        indoorPurificationEfficiency: profile.hasAirPurifier ? 0.85 : 0.4,
      });

      totalInhaledAvoided += inhalation.microgramsAvoided;
    }

    if (totalCo2AvoidedKg > 0) {
      plan.totalCo2SavedKg = parseFloat(totalCo2AvoidedKg.toFixed(2));
    }
    if (totalInhaledAvoided > 0) {
      plan.totalInhaledPm25AvoidedUg = Math.round(totalInhaledAvoided);
      plan.totalCigarettesAvoidedEquivalent = parseFloat(
        (totalInhaledAvoided / 528).toFixed(2)
      );
    }
  }

  return plan;
}
