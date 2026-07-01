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

// Site schema — L1 stores primary/ID data only
export interface SetSite {
  site_id: string;      // e.g. "SITE-001"
  title: string;        // Display name
  subdomain: string;    // e.g. "sirkazhi-north"
  zoneIds: string[];    // Assigned Zone PKs
  status: "active" | "draft";
}

export type DCTChangeAction = "edit" | "modify" | "delete" | "split" | "convert" | "merge";

export type UserRole = "admin" | "master-admin";

export type PendingDctStatus = "pending" | "approved" | "rejected";

export interface PendingDctChange {
  id: string;
  action: DCTChangeAction;
  dctType: "domain" | "category" | "type";
  dctId: string;
  oldValue: string;
  newValue: string;
  description: string;
  submittedBy: string;
  submittedAt: string;
  status: PendingDctStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface DCTChangeRecord {
  id: string;
  timestamp: string;
  action: DCTChangeAction;
  dctType: "domain" | "category" | "type";
  dctId: string;
  oldValue: string;
  newValue: string;
  description: string;
  performedBy: string;
  redirects?: {
    entityCount: number;
    nonEntityCount: number;
    targetDctId?: string;
  };
}

export interface DCTArchiveRecord {
  id: string;
  dctType: "domain" | "category" | "type";
  dctId: string;
  originalCode?: string;
  originalPk?: string;
  originalName: string;
  archivedAt: string;
  archivedBy: string;
  entityCount: number;
  nonEntityCount: number;
  redirectedTo?: string;
}

// The 11 core domains
export type DomainCode = string;

export interface Category {
  id: string;
  name: string;
  code: string;
}

export interface RegistryDomain {
  dctId: string;
  pk?: string;
  code: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  status?: "active" | "stopped";
  entityType?: "entity" | "non-entity";
  categories?: Category[];
}

export interface RegistryCategory {
  dctId: string;
  pk: string; // e.g. "CAT-MED-101"
  domainCode: string;
  name: string; // e.g. "Hospitals & Diagnostics"
  description: string;
  status?: "active" | "stopped";
  entityType?: "entity" | "non-entity";
}

export interface RegistryType {
  dctId: string;
  pk: string; // e.g. "TYP-MED-101-01"
  categoryPk: string;
  name: string; // e.g. "Government Taluk Hospital"
  description: string;
  status?: "active" | "stopped";
  entityType?: "entity" | "non-entity";
}

// Non-Entity in L1 DB
export interface NonEntity {
  non_entity_pk: string; // NENT-XXXXXX
  non_entity_name: string;
  stateId: string;
  districtId: string;
  talukId: string;
  cityVillageId?: string;
  areaId?: string;
  streetId?: string;
  substreetId?: string | null;
  zone_pk?: string;
  primary_domain: string;
  secondary_domains: string[];
  category_pk: string;
  category_name: string;
  type_pk?: string;
  phone?: string;
  visibility_type: "Public" | "Private/Home";
  status: "active" | "stopped";
  createdAt: string;
  updatedAt: string;
  website_zone_entity_id?: string | null;
  role: NonEntityRole;
  linkedEntities: {
    assetProvider?: string;
    serviceProvider?: string;
  };
}

// Entity role flags
export interface EntityRoles {
  isAssetProvider: boolean;
  isServiceProvider: boolean;
}

// Entity role — what kind of provider the entity is (pick one)
export type EntityRole =
  | 'physical-asset-provider'
  | 'physical-service-provider'
  | 'physical-goods-provider'
  | 'non-physical-asset-provider'
  | 'non-physical-service-provider'
  | 'non-physical-goods-provider';

// Non-entity role — what kind of asset/item the non-entity is (pick one)
export type NonEntityRole =
  | 'physical-asset'
  | 'physical-service'
  | 'physical-goods'
  | 'non-physical-asset'
  | 'non-physical-service'
  | 'non-physical-goods';

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
  type_pk?: string; // Optional type for hierarchical branching
  phone?: string; // Optional phone number
  visibility_type: "Public" | "Private/Home";
  status: "active" | "stopped";
  createdAt: string;
  updatedAt: string;
  website_zone_entity_id?: string | null; // Associated Website Zone/Site ID
  roles: EntityRoles;
  linkedAssets?: string[]; // IDs of non-entities (assets) this entity owns/operates
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

// ============================================================
// NEW: STAGING TYPES (No geo/zone assignment yet)
// ============================================================

export interface StagingEntity {
  id: string;
  entity_name: string;
  phone?: string;
  domain_code: string;
  category_id: string;
  roles: EntityRoles;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
}

export interface StagingNonEntity {
  id: string;
  non_entity_name: string;
  domain_code: string;
  category_id: string;
  role: NonEntityRole;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
}

// ============================================================
// NEW: REGISTRY TYPES (With geo/zone assigned)
// ============================================================

export interface RegistryEntity extends Omit<StagingEntity, 'id' | 'uploadedAt'> {
  entity_pk: string;
  zone_pk: string;
  stateId: string;
  districtId: string;
  talukId: string;
  cityVillageId: string;
  areaId: string;
  streetId: string;
  substreetId?: string | null;
  assignedAt: string;
  assignedBy: string;
  domain: string;
  category: string;
  type?: string;
  linkedAssets?: string[];
}

export interface RegistryNonEntity extends Omit<StagingNonEntity, 'id' | 'uploadedAt'> {
  non_entity_pk: string;
  stateId: string;
  districtId: string;
  talukId: string;
  cityVillageId?: string;
  areaId?: string;
  streetId?: string;
  substreetId?: string | null;
  zone_pk?: string;
  assignedAt: string;
  assignedBy: string;
  domain: string;
  category: string;
  type?: string;
  linkedEntities: {
    assetProvider?: string;
    serviceProvider?: string;
  };
}

// ============================================================
// BACKWARD COMPATIBILITY ALIASES
// ============================================================
export type PhysicalAsset = NonEntity;
export type StagingPhysicalAsset = StagingNonEntity;
export type RegistryPhysicalAsset = RegistryNonEntity;

// ============================================================
// NEW: ASSIGNMENT DATA TYPES
// ============================================================

// Geo assignment data
export interface GeoData {
  zone_pk?: string;
  stateId: string;
  districtId: string;
  talukId: string;
  cityVillageId?: string;
  areaId?: string;
  streetId?: string;
  substreetId?: string;
}

// Branch hierarchy for tree organization
export interface BranchHierarchy {
  domain: string;
  category: string;
  type?: string;
}

// ============================================================
// PERSON SYSTEM
// ============================================================

export interface PersonEntityLink {
  entity_pk: string;
  order: number;
}

export interface PersonStatusLogEntry {
  status: 'active' | 'stopped';
  reason: string;
  changedAt: string;
  changedBy: string;
}

export interface Person {
  person_pk: string;                  // PER-XXXXXX
  name: string;
  entities: PersonEntityLink[];       // min 1, ordered
  non_entities: string[];             // NENT-XXXXXX[], flat, optional
  parent_person_pk?: string | null;
  status: 'active' | 'stopped';
  statusLog: PersonStatusLogEntry[];
  createdAt: string;
  assignedBy: string;
}
