export interface CorsiRosenthalSpecs {
  filterType: 'MERV-13' | 'MERV-14' | 'HEPA-grade';
  filterCount: 4 | 5; // 4-filter cube or 5-filter (including bottom)
  filterDimensionsInches: { width: number; height: number; depth: number };
  fanSizeInches: 20; // Standard 20" box fan
  fanSpeed: 'low' | 'medium' | 'high';
  estimatedCfm: number;
  estimatedCadrPm25: number; // Clean Air Delivery Rate in CFM
  estimatedCostUsd: number;
  commercialHepaEquivalentCostUsd: number;
  noiseLevelDb: number;
  filterLifeMonths: number;
}

export interface VentilationRecommendation {
  recommendedWindowStart: string;
  recommendedWindowEnd: string;
  recommendedDurationMinutes: number;
  inversionStatus: string;
  crossVentilationRequired: boolean;
  protocolSteps: string[];
  immediatePostVentilationActions: string[];
}

export interface IAQHackItem {
  id: string;
  title: string;
  category: 'diy-purification' | 'ventilation' | 'source-control' | 'cleaning' | 'humidity';
  difficulty: 'easy' | 'moderate' | 'advanced';
  costLevel: 'free' | 'low' | 'medium';
  impactPercentage: number; // % PM2.5 or VOC reduction
  description: string;
  scienceExplanation: string;
  actionableSteps: string[];
  equipmentNeeded?: string[];
  precautions?: string[];
}
