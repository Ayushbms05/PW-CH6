export type VulnerabilityCategory =
  | 'infant'
  | 'elderly'
  | 'asthmatic'
  | 'cardiac'
  | 'pregnant'
  | 'pet'
  | 'outdoor-worker';

export type HousingType =
  | 'high-rise-apartment'
  | 'ground-floor-apartment'
  | 'independent-house'
  | 'dense-urban-cluster'
  | 'suburban-home';

export type PrimaryHeating =
  | 'wood-fireplace'
  | 'charcoal-burner'
  | 'electric-radiant'
  | 'heat-pump'
  | 'gas-boiler-vented'
  | 'kerosene-unvented';

export type PrimaryCommute =
  | 'single-occupant-car'
  | 'carpool'
  | 'two-wheeler'
  | 'bus-public'
  | 'metro-electric'
  | 'bicycle-walk';

export interface FamilyMember {
  id: string;
  name: string;
  age: number;
  vulnerabilities: VulnerabilityCategory[];
  dailyOutdoorHours: number;
}

export interface HouseholdProfile {
  id: string;
  name: string;
  locationId: string;
  members: FamilyMember[];
  housingType: HousingType;
  roomSizeSqFt: number;
  ceilingHeightFt: number;
  primaryHeating: PrimaryHeating;
  primaryCommute: PrimaryCommute;
  dailyCommuteDistanceKm: number;
  hasAirPurifier: boolean;
  hasMechanicalVentilation: boolean;
  cookingFuel: 'gas-piped' | 'lpg-cylinder' | 'electric-induction' | 'biomass';
}
