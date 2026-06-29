// Domain/Category/Type Classification System
// Data sourced from /datacollection folder

export interface Category {
  id: string;
  name: string;
  code: string;
}

export interface Domain {
  id: string;
  name: string;
  code: string;
  categories: Category[];
}

// ============================================================
// NON-ENTITY DOMAINS (Assets)
// ============================================================

export const NON_ENTITY_DOMAINS: Domain[] = [
  {
    id: 'NE-RE-COM',
    name: 'Real Estate - Commercial',
    code: 'RE-COM',
    categories: [
      { id: 'CAT-RECOM-001', name: 'Shop Space', code: 'SHOP' },
      { id: 'CAT-RECOM-002', name: 'Office Space', code: 'OFFICE' },
      { id: 'CAT-RECOM-003', name: 'Warehouse', code: 'WAREHOUSE' },
      { id: 'CAT-RECOM-004', name: 'Shopping Complex', code: 'COMPLEX' },
      { id: 'CAT-RECOM-005', name: 'Market Hall', code: 'MARKET' },
      { id: 'CAT-RECOM-006', name: 'Industrial Shed', code: 'SHED' },
      { id: 'CAT-RECOM-007', name: 'Showroom', code: 'SHOWROOM' },
      { id: 'CAT-RECOM-008', name: 'Commercial Plot', code: 'PLOT' }
    ]
  },
  {
    id: 'NE-RE-RES',
    name: 'Real Estate - Residential',
    code: 'RE-RES',
    categories: [
      { id: 'CAT-RERES-001', name: 'Independent House', code: 'HOUSE' },
      { id: 'CAT-RERES-002', name: 'Apartment', code: 'APT' },
      { id: 'CAT-RERES-003', name: 'Villa', code: 'VILLA' },
      { id: 'CAT-RERES-004', name: 'Farmhouse', code: 'FARM' },
      { id: 'CAT-RERES-005', name: 'Residential Plot', code: 'PLOT' },
      { id: 'CAT-RERES-006', name: 'Gated Community Unit', code: 'GATED' },
      { id: 'CAT-RERES-007', name: 'Tenement', code: 'TENANT' }
    ]
  },
  {
    id: 'NE-INF-TRA',
    name: 'Infrastructure - Transport',
    code: 'INF-TRA',
    categories: [
      { id: 'CAT-INFTRA-001', name: 'Road', code: 'ROAD' },
      { id: 'CAT-INFTRA-002', name: 'Highway', code: 'HWY' },
      { id: 'CAT-INFTRA-003', name: 'Bridge', code: 'BRIDGE' },
      { id: 'CAT-INFTRA-004', name: 'Flyover', code: 'FLYOVER' },
      { id: 'CAT-INFTRA-005', name: 'Railway Line', code: 'RAILWAY' },
      { id: 'CAT-INFTRA-006', name: 'Bus Station', code: 'BUS' },
      { id: 'CAT-INFTRA-007', name: 'Railway Station', code: 'TRAIN' },
      { id: 'CAT-INFTRA-008', name: 'Airport Terminal', code: 'AIRPORT' }
    ]
  },
  {
    id: 'NE-INF-UTI',
    name: 'Infrastructure - Utilities',
    code: 'INF-UTI',
    categories: [
      { id: 'CAT-INFUTI-001', name: 'Water Pipeline', code: 'WATER' },
      { id: 'CAT-INFUTI-002', name: 'Sewage Line', code: 'SEWAGE' },
      { id: 'CAT-INFUTI-003', name: 'Electricity Line', code: 'ELEC' },
      { id: 'CAT-INFUTI-004', name: 'Gas Pipeline', code: 'GAS' },
      { id: 'CAT-INFUTI-005', name: 'Telecom Tower', code: 'TELECOM' },
      { id: 'CAT-INFUTI-006', name: 'Water Tank', code: 'TANK' },
      { id: 'CAT-INFUTI-007', name: 'Substation', code: 'SUBSTATION' }
    ]
  },
  {
    id: 'NE-REL-CUL',
    name: 'Religious & Cultural',
    code: 'REL-CUL',
    categories: [
      { id: 'CAT-RELCUL-001', name: 'Temple', code: 'TEMPLE' },
      { id: 'CAT-RELCUL-002', name: 'Church', code: 'CHURCH' },
      { id: 'CAT-RELCUL-003', name: 'Mosque', code: 'MOSQUE' },
      { id: 'CAT-RELCUL-004', name: 'Gurudwara', code: 'GURUDWARA' },
      { id: 'CAT-RELCUL-005', name: 'Monastery', code: 'MONASTERY' },
      { id: 'CAT-RELCUL-006', name: 'Heritage Site', code: 'HERITAGE' },
      { id: 'CAT-RELCUL-007', name: 'Monument', code: 'MONUMENT' }
    ]
  },
  {
    id: 'NE-PUB-SPC',
    name: 'Public Spaces',
    code: 'PUB-SPC',
    categories: [
      { id: 'CAT-PUBSPC-001', name: 'Park', code: 'PARK' },
      { id: 'CAT-PUBSPC-002', name: 'Playground', code: 'PLAYGROUND' },
      { id: 'CAT-PUBSPC-003', name: 'Garden', code: 'GARDEN' },
      { id: 'CAT-PUBSPC-004', name: 'Open Ground', code: 'GROUND' },
      { id: 'CAT-PUBSPC-005', name: 'Community Hall', code: 'HALL' },
      { id: 'CAT-PUBSPC-006', name: 'Public Square', code: 'SQUARE' }
    ]
  },
  {
    id: 'NE-NAT-AST',
    name: 'Natural Assets',
    code: 'NAT-AST',
    categories: [
      { id: 'CAT-NATAST-001', name: 'River', code: 'RIVER' },
      { id: 'CAT-NATAST-002', name: 'Lake', code: 'LAKE' },
      { id: 'CAT-NATAST-003', name: 'Pond', code: 'POND' },
      { id: 'CAT-NATAST-004', name: 'Forest', code: 'FOREST' },
      { id: 'CAT-NATAST-005', name: 'Hill', code: 'HILL' },
      { id: 'CAT-NATAST-006', name: 'Beach', code: 'BEACH' },
      { id: 'CAT-NATAST-007', name: 'Wetland', code: 'WETLAND' },
      { id: 'CAT-NATAST-008', name: 'Wildlife Area', code: 'WILDLIFE' }
    ]
  },
  {
    id: 'NE-AGR-AST',
    name: 'Agricultural Assets',
    code: 'AGR-AST',
    categories: [
      { id: 'CAT-AGRAST-001', name: 'Crop Land', code: 'CROP' },
      { id: 'CAT-AGRAST-002', name: 'Orchard', code: 'ORCHARD' },
      { id: 'CAT-AGRAST-003', name: 'Plantation', code: 'PLANT' },
      { id: 'CAT-AGRAST-004', name: 'Grazing Land', code: 'GRAZE' },
      { id: 'CAT-AGRAST-005', name: 'Fallow Land', code: 'FALLOW' },
      { id: 'CAT-AGRAST-006', name: 'Agricultural Plot', code: 'PLOT' }
    ]
  },
  {
    id: 'NE-INS-BLD',
    name: 'Institutional Buildings',
    code: 'INS-BLD',
    categories: [
      { id: 'CAT-INSBLD-001', name: 'School Building', code: 'SCHOOL' },
      { id: 'CAT-INSBLD-002', name: 'College Building', code: 'COLLEGE' },
      { id: 'CAT-INSBLD-003', name: 'Hospital Building', code: 'HOSPITAL' },
      { id: 'CAT-INSBLD-004', name: 'Government Office Building', code: 'GOVT' },
      { id: 'CAT-INSBLD-005', name: 'Court Building', code: 'COURT' },
      { id: 'CAT-INSBLD-006', name: 'Police Station Building', code: 'POLICE' },
      { id: 'CAT-INSBLD-007', name: 'Library Building', code: 'LIBRARY' }
    ]
  },
  {
    id: 'NE-IND-AST',
    name: 'Industrial Assets',
    code: 'IND-AST',
    categories: [
      { id: 'CAT-INDAST-001', name: 'Factory Building', code: 'FACTORY' },
      { id: 'CAT-INDAST-002', name: 'Processing Plant', code: 'PROCESS' },
      { id: 'CAT-INDAST-003', name: 'Power Plant', code: 'POWER' },
      { id: 'CAT-INDAST-004', name: 'Manufacturing Unit', code: 'MFG' },
      { id: 'CAT-INDAST-005', name: 'Cold Storage', code: 'COLD' },
      { id: 'CAT-INDAST-006', name: 'Industrial Plot', code: 'PLOT' }
    ]
  }
];

// ============================================================
// ENTITY DOMAINS (Service Providers)
// ============================================================

export const ENTITY_DOMAINS: Domain[] = [
  {
    id: 'E-BUS-FOD',
    name: 'Business - Food & Hospitality',
    code: 'BUS-FOD',
    categories: [
      { id: 'CAT-BUSFOD-001', name: 'Restaurant Owner/Operator', code: 'REST' },
      { id: 'CAT-BUSFOD-002', name: 'Hotel Owner/Operator', code: 'HOTEL' },
      { id: 'CAT-BUSFOD-003', name: 'Cafe Owner', code: 'CAFE' },
      { id: 'CAT-BUSFOD-004', name: 'Bakery Owner', code: 'BAKERY' },
      { id: 'CAT-BUSFOD-005', name: 'Catering Service', code: 'CATER' },
      { id: 'CAT-BUSFOD-006', name: 'Fast Food Operator', code: 'FAST' },
      { id: 'CAT-BUSFOD-007', name: 'Sweet Shop Owner', code: 'SWEET' },
      { id: 'CAT-BUSFOD-008', name: 'Mess Operator', code: 'MESS' }
    ]
  },
  {
    id: 'E-BUS-RET',
    name: 'Business - Retail & Trade',
    code: 'BUS-RET',
    categories: [
      { id: 'CAT-BUSRET-001', name: 'Shop Owner', code: 'SHOP' },
      { id: 'CAT-BUSRET-002', name: 'Supermarket Owner', code: 'SUPER' },
      { id: 'CAT-BUSRET-003', name: 'Wholesale Trader', code: 'WHOLE' },
      { id: 'CAT-BUSRET-004', name: 'Distributor', code: 'DIST' },
      { id: 'CAT-BUSRET-005', name: 'E-commerce Business', code: 'ECOM' },
      { id: 'CAT-BUSRET-006', name: 'Franchise Owner', code: 'FRAN' },
      { id: 'CAT-BUSRET-007', name: 'Market Vendor', code: 'VENDOR' }
    ]
  },
  {
    id: 'E-BUS-MFG',
    name: 'Business - Manufacturing',
    code: 'BUS-MFG',
    categories: [
      { id: 'CAT-BUSMFG-001', name: 'Factory Owner', code: 'FACTORY' },
      { id: 'CAT-BUSMFG-002', name: 'Processing Unit Operator', code: 'PROCESS' },
      { id: 'CAT-BUSMFG-003', name: 'Manufacturing Business', code: 'MFG' },
      { id: 'CAT-BUSMFG-004', name: 'Assembly Unit', code: 'ASSEM' },
      { id: 'CAT-BUSMFG-005', name: 'Production House', code: 'PROD' }
    ]
  },
  {
    id: 'E-PRO-TEC',
    name: 'Professional Services - Technical',
    code: 'PRO-TEC',
    categories: [
      { id: 'CAT-PROTEC-001', name: 'Civil Engineer', code: 'CIVIL' },
      { id: 'CAT-PROTEC-002', name: 'Electrical Engineer', code: 'ELEC' },
      { id: 'CAT-PROTEC-003', name: 'Mechanical Engineer', code: 'MECH' },
      { id: 'CAT-PROTEC-004', name: 'Architect', code: 'ARCH' },
      { id: 'CAT-PROTEC-005', name: 'Plumber', code: 'PLUMB' },
      { id: 'CAT-PROTEC-006', name: 'Electrician', code: 'ELCN' },
      { id: 'CAT-PROTEC-007', name: 'Carpenter', code: 'CARP' },
      { id: 'CAT-PROTEC-008', name: 'Welder', code: 'WELD' },
      { id: 'CAT-PROTEC-009', name: 'HVAC Technician', code: 'HVAC' }
    ]
  },
  {
    id: 'E-PRO-BUS',
    name: 'Professional Services - Business',
    code: 'PRO-BUS',
    categories: [
      { id: 'CAT-PROBUS-001', name: 'Chartered Accountant', code: 'CA' },
      { id: 'CAT-PROBUS-002', name: 'Lawyer', code: 'LAW' },
      { id: 'CAT-PROBUS-003', name: 'Consultant', code: 'CONS' },
      { id: 'CAT-PROBUS-004', name: 'Auditor', code: 'AUDIT' },
      { id: 'CAT-PROBUS-005', name: 'Tax Advisor', code: 'TAX' },
      { id: 'CAT-PROBUS-006', name: 'Financial Advisor', code: 'FIN' },
      { id: 'CAT-PROBUS-007', name: 'Business Analyst', code: 'BA' }
    ]
  },
  {
    id: 'E-PRO-CRE',
    name: 'Professional Services - Creative',
    code: 'PRO-CRE',
    categories: [
      { id: 'CAT-PROCRE-001', name: 'Interior Designer', code: 'INTER' },
      { id: 'CAT-PROCRE-002', name: 'Graphic Designer', code: 'GRAPH' },
      { id: 'CAT-PROCRE-003', name: 'Photographer', code: 'PHOTO' },
      { id: 'CAT-PROCRE-004', name: 'Videographer', code: 'VIDEO' },
      { id: 'CAT-PROCRE-005', name: 'Event Planner', code: 'EVENT' },
      { id: 'CAT-PROCRE-006', name: 'Advertising Agency', code: 'AD' }
    ]
  },
  {
    id: 'E-HLT-SRV',
    name: 'Healthcare Services',
    code: 'HLT-SRV',
    categories: [
      { id: 'CAT-HLTSRV-001', name: 'Doctor', code: 'DOC' },
      { id: 'CAT-HLTSRV-002', name: 'Dentist', code: 'DENT' },
      { id: 'CAT-HLTSRV-003', name: 'Hospital Management', code: 'HOSP' },
      { id: 'CAT-HLTSRV-004', name: 'Clinic Operator', code: 'CLINIC' },
      { id: 'CAT-HLTSRV-005', name: 'Diagnostic Lab Operator', code: 'LAB' },
      { id: 'CAT-HLTSRV-006', name: 'Pharmacy Owner', code: 'PHARM' },
      { id: 'CAT-HLTSRV-007', name: 'Physiotherapist', code: 'PHYSIO' },
      { id: 'CAT-HLTSRV-008', name: 'Veterinarian', code: 'VET' }
    ]
  },
  {
    id: 'E-EDU-SRV',
    name: 'Education Services',
    code: 'EDU-SRV',
    categories: [
      { id: 'CAT-EDUSRV-001', name: 'School Management', code: 'SCHOOL' },
      { id: 'CAT-EDUSRV-002', name: 'College Management', code: 'COLLEGE' },
      { id: 'CAT-EDUSRV-003', name: 'Coaching Center Owner', code: 'COACH' },
      { id: 'CAT-EDUSRV-004', name: 'Tutor', code: 'TUTOR' },
      { id: 'CAT-EDUSRV-005', name: 'Training Institute', code: 'TRAIN' },
      { id: 'CAT-EDUSRV-006', name: 'Preschool Operator', code: 'PRE' },
      { id: 'CAT-EDUSRV-007', name: 'Skill Development Center', code: 'SKILL' }
    ]
  },
  {
    id: 'E-GOV-SRV',
    name: 'Government Services',
    code: 'GOV-SRV',
    categories: [
      { id: 'CAT-GOVSRV-001', name: 'Administrative Officer', code: 'ADMIN' },
      { id: 'CAT-GOVSRV-002', name: 'Revenue Officer', code: 'REV' },
      { id: 'CAT-GOVSRV-003', name: 'Police Personnel', code: 'POLICE' },
      { id: 'CAT-GOVSRV-004', name: 'Judicial Officer', code: 'JUDGE' },
      { id: 'CAT-GOVSRV-005', name: 'Municipal Officer', code: 'MUNI' },
      { id: 'CAT-GOVSRV-006', name: 'Postal Service', code: 'POST' },
      { id: 'CAT-GOVSRV-007', name: 'Public Welfare Officer', code: 'WELFARE' }
    ]
  },
  {
    id: 'E-TRA-SRV',
    name: 'Transportation Services',
    code: 'TRA-SRV',
    categories: [
      { id: 'CAT-TRASRV-001', name: 'Taxi Operator', code: 'TAXI' },
      { id: 'CAT-TRASRV-002', name: 'Auto Driver', code: 'AUTO' },
      { id: 'CAT-TRASRV-003', name: 'Bus Operator', code: 'BUS' },
      { id: 'CAT-TRASRV-004', name: 'Logistics Company', code: 'LOG' },
      { id: 'CAT-TRASRV-005', name: 'Courier Service', code: 'COUR' },
      { id: 'CAT-TRASRV-006', name: 'Goods Transport', code: 'GOODS' },
      { id: 'CAT-TRASRV-007', name: 'Moving Service', code: 'MOVE' }
    ]
  },
  {
    id: 'E-AGR-SRV',
    name: 'Agricultural Services',
    code: 'AGR-SRV',
    categories: [
      { id: 'CAT-AGRSRV-001', name: 'Farmer', code: 'FARM' },
      { id: 'CAT-AGRSRV-002', name: 'Dairy Farmer', code: 'DAIRY' },
      { id: 'CAT-AGRSRV-003', name: 'Poultry Farm Owner', code: 'POULTRY' },
      { id: 'CAT-AGRSRV-004', name: 'Fishery Operator', code: 'FISH' },
      { id: 'CAT-AGRSRV-005', name: 'Agricultural Supplier', code: 'SUPPLY' },
      { id: 'CAT-AGRSRV-006', name: 'Farm Equipment Rental', code: 'EQUIP' }
    ]
  },
  {
    id: 'E-MNT-FAC',
    name: 'Maintenance & Facilities',
    code: 'MNT-FAC',
    categories: [
      { id: 'CAT-MNTFAC-001', name: 'Cleaning Service', code: 'CLEAN' },
      { id: 'CAT-MNTFAC-002', name: 'Security Service', code: 'SEC' },
      { id: 'CAT-MNTFAC-003', name: 'Pest Control', code: 'PEST' },
      { id: 'CAT-MNTFAC-004', name: 'Landscaping Service', code: 'LAND' },
      { id: 'CAT-MNTFAC-005', name: 'Facility Management', code: 'FAC' },
      { id: 'CAT-MNTFAC-006', name: 'Housekeeping Service', code: 'HOUSE' }
    ]
  },
  {
    id: 'E-FIN-SRV',
    name: 'Financial Services',
    code: 'FIN-SRV',
    categories: [
      { id: 'CAT-FINSRV-001', name: 'Bank', code: 'BANK' },
      { id: 'CAT-FINSRV-002', name: 'Insurance Company', code: 'INS' },
      { id: 'CAT-FINSRV-003', name: 'Microfinance Institution', code: 'MICRO' },
      { id: 'CAT-FINSRV-004', name: 'Investment Firm', code: 'INV' },
      { id: 'CAT-FINSRV-005', name: 'Money Transfer Service', code: 'MONEY' },
      { id: 'CAT-FINSRV-006', name: 'Cooperative Society', code: 'COOP' }
    ]
  },
  {
    id: 'E-TEC-SRV',
    name: 'Technology Services',
    code: 'TEC-SRV',
    categories: [
      { id: 'CAT-TECSRV-001', name: 'IT Company', code: 'IT' },
      { id: 'CAT-TECSRV-002', name: 'Software Company', code: 'SOFT' },
      { id: 'CAT-TECSRV-003', name: 'Web Developer', code: 'WEB' },
      { id: 'CAT-TECSRV-004', name: 'App Developer', code: 'APP' },
      { id: 'CAT-TECSRV-005', name: 'Data Center Operator', code: 'DATA' },
      { id: 'CAT-TECSRV-006', name: 'Tech Support', code: 'SUPP' },
      { id: 'CAT-TECSRV-007', name: 'Digital Marketing Agency', code: 'DIGI' }
    ]
  },
  {
    id: 'E-TOU-SRV',
    name: 'Tourism Services',
    code: 'TOU-SRV',
    categories: [
      { id: 'CAT-TOUSRV-001', name: 'Travel Agency', code: 'TRAVEL' },
      { id: 'CAT-TOUSRV-002', name: 'Tour Operator', code: 'TOUR' },
      { id: 'CAT-TOUSRV-003', name: 'Hotel Chain', code: 'CHAIN' },
      { id: 'CAT-TOUSRV-004', name: 'Resort Operator', code: 'RESORT' },
      { id: 'CAT-TOUSRV-005', name: 'Tourist Guide', code: 'GUIDE' },
      { id: 'CAT-TOUSRV-006', name: 'Adventure Sports Operator', code: 'ADV' }
    ]
  }
];

// Helper functions
export const getAllEntityDomains = (): Domain[] => ENTITY_DOMAINS;
export const getAllNonEntityDomains = (): Domain[] => NON_ENTITY_DOMAINS;

export const getEntityDomainByCode = (code: string): Domain | undefined => {
  return ENTITY_DOMAINS.find(d => d.code === code);
};

export const getNonEntityDomainByCode = (code: string): Domain | undefined => {
  return NON_ENTITY_DOMAINS.find(d => d.code === code);
};

export const getEntityCategoryById = (categoryId: string): { domain: Domain; category: Category } | undefined => {
  for (const domain of ENTITY_DOMAINS) {
    const category = domain.categories.find(c => c.id === categoryId);
    if (category) {
      return { domain, category };
    }
  }
  return undefined;
};

export const getNonEntityCategoryById = (categoryId: string): { domain: Domain; category: Category } | undefined => {
  for (const domain of NON_ENTITY_DOMAINS) {
    const category = domain.categories.find(c => c.id === categoryId);
    if (category) {
      return { domain, category };
    }
  }
  return undefined;
};
