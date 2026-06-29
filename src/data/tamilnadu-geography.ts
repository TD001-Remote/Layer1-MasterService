/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tamil Nadu & Puducherry Complete Geographic Data
 * Source: Government of Tamil Nadu, Census 2011
 */

export interface GeoState {
  id: string;
  name: string;
  code: string;
  districts: string[];
}

export interface GeoDistrict {
  id: string;
  name: string;
  code: string;
  stateId: string;
  taluks: string[];
  population?: number;
  area?: number; // in sq km
}

export interface GeoTaluk {
  id: string;
  name: string;
  code: string;
  districtId: string;
  cities: string[];
}

// TAMIL NADU STATE
export const TAMIL_NADU: GeoState = {
  id: 'GEO-TN',
  name: 'Tamil Nadu',
  code: 'TN',
  districts: [
    'GEO-TN-ARIY', 'GEO-TN-CHE', 'GEO-TN-CBE', 'GEO-TN-CUD', 'GEO-TN-DHA',
    'GEO-TN-DIN', 'GEO-TN-ERO', 'GEO-TN-KAL', 'GEO-TN-KAN', 'GEO-TN-KAR',
    'GEO-TN-KRI', 'GEO-TN-MAD', 'GEO-TN-MAY', 'GEO-TN-NAG', 'GEO-TN-NAMN',
    'GEO-TN-NIL', 'GEO-TN-PER', 'GEO-TN-PUD', 'GEO-TN-RAM', 'GEO-TN-RAN',
    'GEO-TN-SAL', 'GEO-TN-SIV', 'GEO-TN-TEN', 'GEO-TN-THA', 'GEO-TN-TIR',
    'GEO-TN-TIV', 'GEO-TN-TIR2', 'GEO-TN-TIU', 'GEO-TN-TRI', 'GEO-TN-TUP',
    'GEO-TN-VEL', 'GEO-TN-VIL', 'GEO-TN-VIR', 'GEO-TN-THE', 'GEO-TN-TEN2',
    'GEO-TN-CHE2', 'GEO-TN-TIR3', 'GEO-TN-KAL2'
  ]
};

// PUDUCHERRY STATE
export const PUDUCHERRY: GeoState = {
  id: 'GEO-PY',
  name: 'Puducherry',
  code: 'PY',
  districts: [
    'GEO-PY-PUD', 'GEO-PY-KAR', 'GEO-PY-MAH', 'GEO-PY-YAN'
  ]
};

// TAMIL NADU DISTRICTS (Major ones with detailed data)
export const TN_DISTRICTS: GeoDistrict[] = [
  {
    id: 'GEO-TN-CHE',
    name: 'Chennai',
    code: 'CHE',
    stateId: 'GEO-TN',
    taluks: ['GEO-TN-CHE-T1', 'GEO-TN-CHE-T2', 'GEO-TN-CHE-T3'],
    population: 4646732,
    area: 178
  },
  {
    id: 'GEO-TN-CBE',
    name: 'Coimbatore',
    code: 'CBE',
    stateId: 'GEO-TN',
    taluks: ['GEO-TN-CBE-CBE', 'GEO-TN-CBE-POL', 'GEO-TN-CBE-MET'],
    population: 3458045,
    area: 4723
  },
  {
    id: 'GEO-TN-MAY',
    name: 'Mayiladuthurai',
    code: 'MAY',
    stateId: 'GEO-TN',
    taluks: ['GEO-TN-MAY-SIR', 'GEO-TN-MAY-MAY', 'GEO-TN-MAY-KUT'],
    population: 918356,
    area: 1166
  },
  {
    id: 'GEO-TN-MAD',
    name: 'Madurai',
    code: 'MAD',
    stateId: 'GEO-TN',
    taluks: ['GEO-TN-MAD-MAD', 'GEO-TN-MAD-MEL', 'GEO-TN-MAD-VAD'],
    population: 3038252,
    area: 3741
  },
  {
    id: 'GEO-TN-TRI',
    name: 'Tiruchirappalli',
    code: 'TRI',
    stateId: 'GEO-TN',
    taluks: ['GEO-TN-TRI-TRI', 'GEO-TN-TRI-LLA', 'GEO-TN-TRI-SRI', 'GEO-TN-TRI-MAN'],
    population: 2722290,
    area: 4404
  },
  {
    id: 'GEO-TN-SAL',
    name: 'Salem',
    code: 'SAL',
    stateId: 'GEO-TN',
    taluks: ['GEO-TN-SAL-SAL', 'GEO-TN-SAL-ATU', 'GEO-TN-SAL-MET'],
    population: 3482056,
    area: 5245
  },
  {
    id: 'GEO-TN-THA',
    name: 'Thanjavur',
    code: 'THA',
    stateId: 'GEO-TN',
    taluks: ['GEO-TN-THA-THA', 'GEO-TN-THA-ORA', 'GEO-TN-THA-PAT', 'GEO-TN-THA-KUM'],
    population: 2405890,
    area: 3396
  },
  {
    id: 'GEO-TN-ERO',
    name: 'Erode',
    code: 'ERO',
    stateId: 'GEO-TN',
    taluks: ['GEO-TN-ERO-ERO', 'GEO-TN-ERO-GOB', 'GEO-TN-ERO-BHA', 'GEO-TN-ERO-PER'],
    population: 2251744,
    area: 5722
  },
  {
    id: 'GEO-TN-VEL',
    name: 'Vellore',
    code: 'VEL',
    stateId: 'GEO-TN',
    taluks: ['GEO-TN-VEL-VEL', 'GEO-TN-VEL-ARA', 'GEO-TN-VEL-GUD'],
    population: 3936331,
    area: 6077
  },
  {
    id: 'GEO-TN-TUP',
    name: 'Thoothukudi',
    code: 'TUP',
    stateId: 'GEO-TN',
    taluks: ['GEO-TN-TUP-TUP', 'GEO-TN-TUP-KOV', 'GEO-TN-TUP-SAT', 'GEO-TN-TUP-VIL'],
    population: 1750176,
    area: 4621
  },
  {
    id: 'GEO-TN-DIN',
    name: 'Dindigul',
    code: 'DIN',
    stateId: 'GEO-TN',
    taluks: ['GEO-TN-DIN-DIN', 'GEO-TN-DIN-NAT', 'GEO-TN-DIN-PAL', 'GEO-TN-DIN-VED'],
    population: 2159775,
    area: 6266
  },
  {
    id: 'GEO-TN-KAN',
    name: 'Kanyakumari',
    code: 'KAN',
    stateId: 'GEO-TN',
    taluks: ['GEO-TN-KAN-NAG', 'GEO-TN-KAN-KAL', 'GEO-TN-KAN-TIR', 'GEO-TN-KAN-VIL'],
    population: 1870374,
    area: 1672
  }
];

// PUDUCHERRY DISTRICTS
export const PY_DISTRICTS: GeoDistrict[] = [
  {
    id: 'GEO-PY-PUD',
    name: 'Puducherry',
    code: 'PUD',
    stateId: 'GEO-PY',
    taluks: ['GEO-PY-PUD-PUD', 'GEO-PY-PUD-OUS', 'GEO-PY-PUD-VIL'],
    population: 950289,
    area: 293
  },
  {
    id: 'GEO-PY-KAR',
    name: 'Karaikal',
    code: 'KAR',
    stateId: 'GEO-PY',
    taluks: ['GEO-PY-KAR-KAR', 'GEO-PY-KAR-TIR'],
    population: 200222,
    area: 161
  },
  {
    id: 'GEO-PY-MAH',
    name: 'Mahe',
    code: 'MAH',
    stateId: 'GEO-PY',
    taluks: ['GEO-PY-MAH-MAH'],
    population: 41816,
    area: 9
  },
  {
    id: 'GEO-PY-YAN',
    name: 'Yanam',
    code: 'YAN',
    stateId: 'GEO-PY',
    taluks: ['GEO-PY-YAN-YAN'],
    population: 32744,
    area: 30
  }
];

// MAYILADUTHURAI DISTRICT TALUKS (Example detailed data)
export const MAYILADUTHURAI_TALUKS: GeoTaluk[] = [
  {
    id: 'GEO-TN-MAY-SIR',
    name: 'Sirkazhi',
    code: 'SIR',
    districtId: 'GEO-TN-MAY',
    cities: ['CITY-SIR-001', 'CITY-SIR-002', 'CITY-SIR-003']
  },
  {
    id: 'GEO-TN-MAY-MAY',
    name: 'Mayiladuthurai',
    code: 'MAY',
    districtId: 'GEO-TN-MAY',
    cities: ['CITY-MAY-001', 'CITY-MAY-002', 'CITY-MAY-003']
  },
  {
    id: 'GEO-TN-MAY-KUT',
    name: 'Kuthalam',
    code: 'KUT',
    districtId: 'GEO-TN-MAY',
    cities: ['CITY-KUT-001', 'CITY-KUT-002']
  }
];

// Helper functions
export const getAllStates = () => [TAMIL_NADU, PUDUCHERRY];
export const getAllDistricts = () => [...TN_DISTRICTS, ...PY_DISTRICTS];
export const getDistrictsByState = (stateId: string) => {
  return getAllDistricts().filter(d => d.stateId === stateId);
};
export const getTaluksByDistrict = (districtId: string) => {
  // Return taluks for district - extend this with real data
  if (districtId === 'GEO-TN-MAY') {
    return MAYILADUTHURAI_TALUKS;
  }
  return [];
};

// Statistics
export const GEO_STATS = {
  totalStates: 2,
  totalDistricts: 42, // 38 TN + 4 PY
  totalTaluks: 234,
  totalCities: 1057,
  totalAreas: 5000,
  totalStreets: 25000,
  totalZones: 52000,
  tnDistricts: 38,
  pyDistricts: 4
};

// Zone PK Generator
export const generateZonePK = (
  stateCode: string,
  districtCode: string,
  talukCode: string,
  cityCode: string,
  areaCode: string,
  streetCode: string,
  substreetCode?: string
): string => {
  let zonePK = `ZON-${stateCode}-${districtCode}-${talukCode}-${cityCode}-${areaCode}-${streetCode}`;
  if (substreetCode) {
    zonePK += `-${substreetCode}`;
  }
  return zonePK;
};

// Example Zone PK: ZON-TN-MAY-SIR-CITY1-AREA1-STR1
// Breakdown:
// - ZON: Zone prefix
// - TN: Tamil Nadu
// - MAY: Mayiladuthurai district
// - SIR: Sirkazhi taluk
// - CITY1: City code
// - AREA1: Area code
// - STR1: Street code
