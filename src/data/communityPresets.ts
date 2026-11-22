import { CarpoolSyndicate, SharedPurifierItem, CommunitySmogReport } from '../types/community';

export const PRESET_CARPOOLS: CarpoolSyndicate[] = [
  {
    id: 'carpool-cyber-hub',
    neighborhood: 'South Delhi / Vasant Kunj',
    routeTitle: 'Clean Air Corridor to Cyber Hub / OMR',
    destination: 'Cyber City Tech Park',
    departureTime: '08:45 AM (Post-Inversion Peak)',
    returnTime: '06:15 PM',
    totalSeats: 4,
    availableSeats: 2,
    dailyCo2SavingsKg: 5.8,
    dailyPm25SavingsGrams: 0.95,
    contactOrganizer: 'Vikram S. (Verified Resident)',
  },
  {
    id: 'carpool-school-run',
    neighborhood: 'Noida Sector 62',
    routeTitle: 'Multi-Family Electric Van School Run',
    destination: 'Greenwood & St. Mary Schools',
    departureTime: '08:15 AM',
    returnTime: '02:30 PM',
    totalSeats: 7,
    availableSeats: 3,
    dailyCo2SavingsKg: 8.4,
    dailyPm25SavingsGrams: 1.45,
    contactOrganizer: 'Parent Council Coordinator',
  },
];

export const PRESET_SHARED_PURIFIERS: SharedPurifierItem[] = [
  {
    id: 'hub-purifier-1',
    model: 'Community Corsi-Rosenthal Cube (5-MERV13)',
    cadrRatingCfm: 440,
    idealRoomSqFt: 600,
    currentHolderNeighborhood: 'Sector 14 Community Center',
    availabilityStatus: 'available',
    donorOrCommunityHub: 'Neighborhood Clean Air Library',
  },
  {
    id: 'hub-purifier-2',
    model: 'High-Capacity HEPA H13 Mobile Tower',
    cadrRatingCfm: 380,
    idealRoomSqFt: 500,
    currentHolderNeighborhood: 'Block B Senior Living Center',
    availabilityStatus: 'in-use',
    reservationReturnDate: 'Tomorrow at 10:00 AM',
    donorOrCommunityHub: 'Rotary Clean Air Initiative',
  },
];

export const PRESET_COMMUNITY_REPORTS: CommunitySmogReport[] = [
  {
    id: 'rep-01',
    neighborhood: 'Green Park Outer Ring Road',
    timestamp: '25 mins ago',
    incidentType: 'open-leaf-burning',
    severity: 'severe',
    description: 'Municipal park staff sweeping dry biomass and open burning leaves, causing dense localized plume over pedestrian pathway.',
    status: 'verified',
    upvotesCount: 19,
    localActionPrompt: 'Alerted Resident Welfare Association (RWA) and municipal green helpline. Avoid jogging along the perimeter path.',
  },
  {
    id: 'rep-02',
    neighborhood: 'Industrial Border Sector 5',
    timestamp: '1 hour ago',
    incidentType: 'heavy-vehicle-idling',
    severity: 'moderate',
    description: 'Queue of 12 un-covered diesel dumper trucks idling at freight checkpost creating heavy black carbon exhaust trap.',
    status: 'investigating',
    upvotesCount: 14,
    localActionPrompt: 'Traffic marshals dispatched to enforce immediate engine turn-off during queue standstill.',
  },
];
