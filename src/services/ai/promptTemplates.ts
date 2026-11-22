import { HouseholdProfile } from '../../types/profile';
import { LocationAirData } from '../../types/pollution';

/**
 * Builds structured context-aware prompt for Low-Emission Daily Routine Synthesis
 */
export function buildRoutinePrompt(
  profile: HouseholdProfile,
  airData: LocationAirData,
  userNotes?: string
): { prompt: string; schemaDescription: string } {
  const vulnerableSummary = profile.members
    .filter((m) => m.vulnerabilities.length > 0)
    .map((m) => `${m.name} (${m.age}y, vulnerabilities: [${m.vulnerabilities.join(', ')}])`)
    .join('; ');

  const prompt = `
You are AeroHaven AI, a world-class atmospheric scientist and family clean air navigator.
Generate a tailored, low-emission daily routine for this household facing severe winter smog and thermal inversion.

### Household Context:
- Family Name: ${profile.name}
- Housing Type: ${profile.housingType} (${profile.roomSizeSqFt} sq ft, ceiling: ${profile.ceilingHeightFt} ft)
- Primary Heating: ${profile.primaryHeating}
- Primary Commute: ${profile.primaryCommute} (${profile.dailyCommuteDistanceKm} km round trip)
- Cooking Fuel: ${profile.cookingFuel}
- Has Air Purifier: ${profile.hasAirPurifier ? 'Yes' : 'No'}
- Vulnerable Members: ${vulnerableSummary || 'None registered'}

### Ambient Smog & Atmospheric Inversion Conditions (${airData.cityName}):
- Current AQI: ${airData.aqi} (${airData.category})
- Ambient PM2.5: ${airData.pollutants.pm25} µg/m³
- Thermal Inversion Active: ${airData.inversion.isInversionActive ? 'YES' : 'NO'} (${airData.inversion.inversionStrength} strength)
- Inversion Boundary Layer Height: ${airData.inversion.boundaryLayerHeightMeters} meters
- Ground Temp: ${airData.inversion.groundTempCelsius}°C, Inversion Ceiling Temp: ${airData.inversion.inversionCeilingTempCelsius}°C
- Peak Smog Hours: ${airData.inversion.peakSmogHours.map((h) => `${h.start}-${h.end}`).join(', ')}
- Safe Ventilation Window: ${airData.inversion.safeVentilationWindow.start} - ${airData.inversion.safeVentilationWindow.end}
${userNotes ? `- Additional Family Requests: "${userNotes}"` : ''}

### Objectives:
1. Shift school, work, and exercise schedules away from morning (06:00-09:30 AM) and evening (19:30-22:30 PM) inversion traps.
2. Recommend low-emission commute and heating substitutes (e.g. EV carpooling, metro, radiant heating, clean cooking habits).
3. Specify exact indoor air quality actions (air exchange during solar breakout window, Corsi-Rosenthal / HEPA run times).
4. Quantify direct impact: estimate exposure reduction % and emissions avoided.

Return a JSON object conforming strictly to the DailySmogPlan schema.
`;

  const schemaDescription = `
// DailySmogPlan Schema
{
  "id": "string",
  "date": "string (YYYY-MM-DD)",
  "householdId": "${profile.id}",
  "forecastAqiPeak": number,
  "inversionPeakHours": "string",
  "healthShieldScore": number (0-100),
  "totalInhaledPm25AvoidedUg": number,
  "totalCigarettesAvoidedEquivalent": number,
  "totalCo2SavedKg": number,
  "activities": [
    {
      "id": "string",
      "timeSlot": "string (e.g. '07:00 - 08:30')",
      "standardActivity": "string",
      "smogAdaptedActivity": "string",
      "timeShiftHours": number,
      "modeShift": "string",
      "exposureReductionPercent": number,
      "emissionReductionGramsCO2": number,
      "emissionReductionGramsPM25": number,
      "reasoning": "string",
      "vulnerabilityTarget": "string"
    }
  ]
}
`;

  return { prompt, schemaDescription };
}

/**
 * Builds structured context-aware prompt for IAQ Troubleshooting
 */
export function buildIAQTroubleshootPrompt(
  concernText: string,
  profile: HouseholdProfile,
  airData: LocationAirData
): { prompt: string; schemaDescription: string } {
  const prompt = `
You are AeroHaven IAQ Diagnostic Specialist.
A family is facing an indoor air quality challenge during high winter smog:

### Reported Concern:
"${concernText}"

### Environment:
- City: ${airData.cityName} (AQI ${airData.aqi}, PM2.5 ${airData.pollutants.pm25} µg/m³)
- Housing: ${profile.housingType}, ${profile.roomSizeSqFt} sq ft
- Heating: ${profile.primaryHeating}
- Purifier Available: ${profile.hasAirPurifier ? 'Yes' : 'No'}
- Vulnerable Household Members: ${profile.members.map((m) => `${m.name} (${m.vulnerabilities.join(', ')})`).join('; ')}

Provide an immediate, actionable mitigation plan including DIY hacks (like Corsi-Rosenthal boxes, weatherstripping, wet mopping, or ventilation timing).
`;

  const schemaDescription = `
{
  "problemSummary": "string",
  "urgentSafetyStep": "string",
  "recommendedHacks": [
    {
      "hackId": "string",
      "title": "string",
      "expectedImpact": "string",
      "steps": ["string"]
    }
  ],
  "medicalDisclaimer": "string"
}
`;

  return { prompt, schemaDescription };
}
