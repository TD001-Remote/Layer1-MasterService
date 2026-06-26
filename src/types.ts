/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GeoState {
  id: string; // e.g. "GEO-TN"
  name: string; // e.g. "Tamil Nadu"
}

export interface GeoDistrict {
  id: string; // e.g. "GEO-TN-MAY"
  stateId: string;
  name: string; // e.g. "Mayiladuthurai"
}

export interface GeoTaluk {
  id: string; // e.g. "GEO-TN-MAY-SIR"
  districtId: string;
  name: string; // e.g. "Sirkazhi"
}

export interface CityVillage {
  id: string; // ZON-CITY-XXX
  talukId: string;
  name: string; // e.g. "Sirkazhi City", "Thirumullaivasal"
}

export interface Area {
  id: string; // ZON-AREA-XXX
  cityVillageId: string;
  name: string; // e.g. "Pattamangala", "North Ward"
}

export interface Street {
  id: string; // ZON-STR-XXX
  areaId: string;
  name: string; // e.g. "South Car Street"
  substreetsCount: number;
}

export interface SubStreet {
  id: string; // ZON-SUB-XXX
  streetId: string;
  name: string; // e.g. "Cross Lane 1"
}

// Complete Zone mapping reference
export interface ZoneRef {
  zone_pk: string; // e.g. "ZON-TN-MAY-SIR-CITY1-AREA2-STR15"
  stateId: string;
  districtId: string;
  talukId: string;
  cityVillageId: string;
  areaId: string;
  streetId: string;
  substreetId: string | null;
  fullAddress: string;
}

// Site schema for dynamic website generation
export interface SetSite {
  site_id: string; // e.g. "SITE-001"
  title: string;
  subdomain: string; // e.g. "sirkazhi-north"
  description: string;
  themeColor: string; // hex or Tailwind color class
  primaryDomain: string; // e.g. "TOU"
  zoneIds: string[]; // List of mapped Zone IDs containing addresses
  status: "active" | "draft";
  logoUrl?: string;
}

// The 11 core domains
export type DomainCode = string;

export interface RegistryDomain {
  code: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status?: "active" | "stopped";
}

export interface RegistryCategory {
  pk: string; // e.g. "CAT-MED-101"
  domainCode: string;
  name: string; // e.g. "Hospitals & Diagnostics"
  description: string;
  status?: "active" | "stopped";
}

export interface RegistryType {
  pk: string; // e.g. "TYP-MED-101-01"
  categoryPk: string;
  name: string; // e.g. "Government Taluk Hospital"
  description: string;
  status?: "active" | "stopped";
}

// Non-Entity / Activity Non-Entity in L1 DB
export interface NonEntity {
  non_entity_pk: string; // NENT-XXXXXX
  non_entity_name: string;
  stateId: string;
  districtId: string;
  talukId: string;
  cityVillageId: string;
  areaId: string;
  streetId: string;
  substreetId: string | null;
  zone_pk: string; // Full Zone reference ID
  primary_domain: string;
  secondary_domains: string[];
  category_pk: string;
  category_name: string;
  type_pk: string;
  phone?: string; // Optional phone number
  visibility_type: "Public" | "Private/Home";
  status: "active" | "stopped";
  createdAt: string;
  updatedAt: string;
  website_zone_entity_id?: string | null;
}

// Active entity in the L1 Database
export interface ActiveEntity {
  entity_pk: string; // ENT-XXXXXX
  entity_name: string;
  stateId: string;
  districtId: string;
  talukId: string;
  cityVillageId: string;
  areaId: string;
  streetId: string;
  substreetId: string | null;
  zone_pk: string; // Full Zone reference ID
  primary_domain: DomainCode;
  secondary_domains: string[]; // List of other Domain Codes if hybrid
  category_pk: string; // e.g., CAT-000452
  category_name: string; // e.g., Multi-Specialty Hospital
  phone?: string; // Optional phone number
  visibility_type: "Public" | "Private/Home";
  status: "active" | "stopped";
  createdAt: string;
  updatedAt: string;
  website_zone_entity_id?: string | null; // Associated Website Zone/Site ID
}

// Pending record uploaded via CSV but waiting for manual review
export interface PendingEntity {
  id: string; // Temp upload ID
  entity_name: string;
  record_type: 'entity' | 'non-entity'; // NEW: Distinguish between entity and non-entity
  target_zone_pk?: string; // Optional for non-entities, required for entities
  // GEO fields - required for both types
  stateId: string;
  districtId: string;
  talukId: string;
  cityVillageId?: string; // Optional for non-entities
  areaId?: string; // Optional for non-entities
  streetId?: string; // Optional for non-entities
  substreetId?: string | null;
  primary_domain: string; // MED, RET etc.
  category_pk: string;
  category_name: string;
  type_pk?: string; // Optional type
  phone?: string; // Optional phone number
  visibility_type: "Public" | "Private/Home";
  website_zone_entity_id?: string | null; // Associated Website Zone/Site ID
  
  // validation diagnostics
  validationErrors: string[];
  validationWarnings: string[];
  status: "pending" | "approved" | "rejected";
  
  // Human assessment compare field
  reportedBy: string;
  surveyDate: string;
}

// Master Copy record used by data manager for side-by-side comparison
export interface MasterCompareRecord {
  phone: string;
  legal_name: string;
  verified_address: string;
  manager_notes: string;
}
