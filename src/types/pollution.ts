export type AQICategory =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous'
  | 'severe';

export interface PollutantConcentration {
  pm25: number; // in µg/m³
  pm10: number; // in µg/m³
  no2: number;  // in ppb or µg/m³
  o3: number;   // in ppb
  co: number;   // in ppm or mg/m³
  so2?: number; // in ppb
}

export interface InversionDynamics {
  isInversionActive: boolean;
  inversionStrength: 'low' | 'moderate' | 'strong' | 'extreme';
  boundaryLayerHeightMeters: number; // e.g., 200m in winter morning vs 1200m summer
  groundTempCelsius: number;
  inversionCeilingTempCelsius: number;
  windSpeedKmh: number;
  humidityPercent: number;
  peakSmogHours: { start: string; end: string }[];
  safeVentilationWindow: { start: string; end: string; riskLevel: 'low' | 'moderate' };
}

export interface LocationAirData {
  id: string;
  cityName: string;
  region: string;
  country: string;
  timestamp: string;
  aqi: number;
  category: AQICategory;
  pollutants: PollutantConcentration;
  inversion: InversionDynamics;
  hourlyForecast: HourlyPollutionPoint[];
}

export interface HourlyPollutionPoint {
  hour: number; // 0-23
  timeLabel: string; // e.g. "06:00"
  aqi: number;
  pm25: number;
  isInversionPeak: boolean;
  ventilationSafe: boolean;
}
