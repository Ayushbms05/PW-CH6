export interface CarpoolSyndicate {
  id: string;
  neighborhood: string;
  routeTitle: string;
  destination: string;
  departureTime: string;
  returnTime: string;
  totalSeats: number;
  availableSeats: number;
  dailyCo2SavingsKg: number;
  dailyPm25SavingsGrams: number;
  contactOrganizer: string;
}

export interface SharedPurifierItem {
  id: string;
  model: string;
  cadrRatingCfm: number;
  idealRoomSqFt: number;
  currentHolderNeighborhood: string;
  availabilityStatus: 'available' | 'in-use' | 'reserved';
  reservationReturnDate?: string;
  donorOrCommunityHub: string;
}

export interface CommunitySmogReport {
  id: string;
  neighborhood: string;
  timestamp: string;
  incidentType: 'open-leaf-burning' | 'garbage-burning' | 'construction-dust' | 'heavy-vehicle-idling' | 'industrial-plume';
  severity: 'moderate' | 'severe' | 'emergency';
  description: string;
  status: 'verified' | 'investigating' | 'resolved';
  upvotesCount: number;
  localActionPrompt: string;
}
