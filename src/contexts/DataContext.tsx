/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  GeoState,
  GeoDistrict,
  GeoTaluk,
  CityVillage,
  Area,
  Street,
  SubStreet,
  ZoneRef,
  SetSite,
  ActiveEntity,
  PendingEntity,
  RegistryDomain,
  RegistryCategory,
  RegistryType,
  NonEntity,
  StagingEntity,
  StagingNonEntity,
  RegistryEntity,
  RegistryNonEntity,
  GeoData,
  BranchHierarchy,
  DCTChangeRecord,
  DCTChangeAction,
  DCTArchiveRecord,
  PendingDctChange,
  Person,
  PersonEntityLink,
} from '../types';

// Seed Data
import {
  states as seedStates,
  districts as seedDistricts,
  taluks as seedTaluks,
  citiesVillages as seedCities,
  areas as seedAreas,
  streets as seedStreets,
  substreets as seedSubstreets,
  seedSites,
  seedActiveEntities,
  masterDomains,
  masterCategories,
  masterTypes,
} from '../data/mockData';

// Firebase utilities
import { buildDynamicZoneRefs } from '../lib/firebase';

// API services
import { geoApi, siteApi, entityApi, pendingApi, nonEntityApi, taxonomyApi, personApi } from '../services/api';

interface DataContextType {
  // Loading state
  isLoading: boolean;

  // Geographic data
  states: GeoState[];
  districts: GeoDistrict[];
  taluks: GeoTaluk[];
  cities: CityVillage[];
  areas: Area[];
  streets: Street[];
  substreets: SubStreet[];
  zoneRefs: ZoneRef[];

  // Sites
  sites: SetSite[];

  // Entities
  activeEntities: ActiveEntity[];
  pendingEntities: PendingEntity[];
  nonEntities: NonEntity[];

// Taxonomy
   domains: RegistryDomain[];
   categories: RegistryCategory[];
   types: RegistryType[];

   // Persons
   persons: Person[];

   // Actions - Geographic
  addCity: (name: string, talukId: string) => Promise<void>;
  addArea: (name: string, cityVillageId: string) => Promise<void>;
  addStreet: (name: string, areaId: string) => Promise<void>;
  addSubstreet: (name: string, streetId: string) => Promise<void>;
  updateZone: (
    type: 'city' | 'area' | 'street' | 'substreet',
    id: string,
    updates: { name: string; parentId: string }
  ) => Promise<void>;
  refreshGeoData: () => Promise<void>;
  refreshAreas: () => Promise<void>;
  refreshStreets: () => Promise<void>;
  getDistrictsByState: (stateId: string) => GeoDistrict[];
  getTaluksByDistrict: (districtId: string) => GeoTaluk[];
  getCitiesByTaluk: (talukId: string) => CityVillage[];

  // Actions - Sites
  addSite: (site: SetSite) => Promise<void>;
  updateSite: (site: SetSite) => Promise<void>;

  // Actions - Entities
  addEntity: (entity: ActiveEntity) => Promise<void>;
  updateEntity: (entity: ActiveEntity) => Promise<void>;
  stopEntity: (entityPk: string) => Promise<void>;
  recoverEntity: (entityPk: string) => Promise<void>;
  refreshActiveEntities: () => Promise<void>;
  refreshNonEntities: () => Promise<void>;

  // Actions - Pending
  syncPendingEntities: (records: PendingEntity[]) => Promise<void>;
  commitApproved: (approvedRecords: PendingEntity[]) => Promise<void>;

  // NEW: Actions - Staging (simplified, no geo/zone)
  getStagingEntities: () => StagingEntity[];
  getStagingNonEntities: () => StagingNonEntity[];
  createStagingEntity: (entity: Omit<StagingEntity, 'id' | 'uploadedAt'>) => Promise<void>;
  createStagingNonEntity: (nonEntity: Omit<StagingNonEntity, 'id' | 'uploadedAt'>) => Promise<void>;
  approveStagingEntity: (id: string) => Promise<void>;
  approveStagingNonEntity: (id: string) => Promise<void>;
  rejectStagingEntity: (id: string) => Promise<void>;
  rejectStagingNonEntity: (id: string) => Promise<void>;

  // NEW: Actions - Registry (with geo/zone + hierarchical)
  getRegistryEntities: () => RegistryEntity[];
  getRegistryNonEntities: () => RegistryNonEntity[];
  assignEntityToRegistry: (stagingId: string, geoData: GeoData, hierarchy: BranchHierarchy) => Promise<void>;
  assignNonEntityToRegistry: (stagingId: string, geoData: GeoData, hierarchy: BranchHierarchy) => Promise<void>;
  moveEntityBranch: (entityPk: string, from: BranchHierarchy, to: BranchHierarchy) => Promise<void>;
  moveNonEntityBranch: (nonEntityPk: string, from: BranchHierarchy, to: BranchHierarchy) => Promise<void>;

// Actions - Non-entities
   addNonEntity: (nonEntity: NonEntity) => Promise<void>;
   updateNonEntity: (nonEntity: NonEntity) => Promise<void>;
   stopNonEntity: (pk: string) => Promise<void>;
   recoverNonEntity: (pk: string) => Promise<void>;

   // Actions - Person
   createPerson: (person: Person) => Promise<void>;
   updatePersonEntities: (person_pk: string, entities: PersonEntityLink[]) => Promise<void>;
   addNonEntityToPerson: (person_pk: string, non_entity_pk: string) => Promise<void>;
   removeNonEntityFromPerson: (person_pk: string, non_entity_pk: string) => Promise<void>;
   stopPerson: (person_pk: string, reason: string) => Promise<void>;
   recoverPerson: (person_pk: string, reason: string) => Promise<void>;
   updatePersonParent: (person_pk: string, parent_person_pk: string | null) => Promise<void>;

// Actions - Taxonomy
   addDomain: (domain: RegistryDomain) => Promise<void>;
   updateDomain: (domain: RegistryDomain) => Promise<void>;
   stopDomain: (code: string, targetCode?: string) => Promise<void>;
   recoverDomain: (code: string) => Promise<void>;

   addCategory: (category: RegistryCategory) => Promise<void>;
   updateCategory: (category: RegistryCategory) => Promise<void>;
   stopCategory: (pk: string, targetPk?: string) => Promise<void>;
   recoverCategory: (pk: string) => Promise<void>;

   addType: (type: RegistryType) => Promise<void>;
   updateType: (type: RegistryType) => Promise<void>;
   stopType: (pk: string, targetPk?: string) => Promise<void>;
   recoverType: (pk: string) => Promise<void>;

  redirectEntitiesFromDomain: (oldCode: string, newCode: string) => Promise<void>;
  redirectNonEntitiesFromDomain: (oldCode: string, newCode: string) => Promise<void>;
  redirectEntitiesFromCategory: (oldPk: string, newPk: string) => Promise<void>;
  redirectNonEntitiesFromCategory: (oldPk: string, newPk: string) => Promise<void>;
  redirectEntitiesFromType: (oldPk: string, newPk?: string) => Promise<void>;
  redirectNonEntitiesFromType: (oldPk: string, newPk?: string) => Promise<void>;
  splitDomain: (oldCode: string, newDomains: { code: string; name: string; categoryPks: string[] }[]) => Promise<void>;
  splitCategory: (oldPk: string, newCategories: { pk: string; name: string; typePks: string[] }[]) => Promise<void>;
  splitType: (oldPk: string, newTypes: { pk: string; name: string }[]) => Promise<void>;

  // DCT Change tracking
  dctChanges: DCTChangeRecord[];
  getDctChanges: () => DCTChangeRecord[];
  clearDctChanges: () => void;

// DCT Convert actions
   convertDomain: (oldDctId: string, newDomain: { code: string; name: string }) => Promise<void>;
   convertCategory: (oldDctId: string, newCategory: { pk: string; name: string }) => Promise<void>;
   convertType: (oldDctId: string, newType: { pk: string; name: string }) => Promise<void>;

   // DCT Merge actions
   mergeDomains: (sourceCodes: string[], targetCode: string) => Promise<void>;
   mergeCategories: (sourcePks: string[], targetPk: string) => Promise<void>;
   mergeTypes: (sourcePks: string[], targetPk: string) => Promise<void>;

   // DCT Modify actions (name/code only, no id change)
   modifyDomain: (dctId: string, newName: string, newCode?: string) => Promise<void>;
   modifyCategory: (dctId: string, newName: string, newPk?: string) => Promise<void>;
   modifyType: (dctId: string, newName: string, newPk?: string) => Promise<void>;

// DCT Recovery actions
    dctArchive: DCTArchiveRecord[];
    recoverArchivedDct: (archiveId: string) => Promise<void>;
    permanentlyDeleteArchivedDct: (archiveId: string) => Promise<void>;

    // DCT Master-Admin Approval Queue
    pendingDctChanges: PendingDctChange[];
    submitForApproval: (change: Omit<PendingDctChange, 'id' | 'submittedAt' | 'status'>) => Promise<void>;
    approveDctChange: (changeId: string, reviewedBy: string, notes?: string) => Promise<void>;
    rejectDctChange: (changeId: string, reviewedBy: string, notes?: string) => Promise<void>;
    getPendingDctChanges: () => PendingDctChange[];

    // Toast
   showToast: (type: 'success' | 'info' | 'warning', message: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Geographic data
  const [states] = useState<GeoState[]>(seedStates);
  const [districts] = useState<GeoDistrict[]>(seedDistricts);
  const [taluks] = useState<GeoTaluk[]>(seedTaluks);
  const [cities, setCities] = useState<CityVillage[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [streets, setStreets] = useState<Street[]>([]);
  const [substreets, setSubstreets] = useState<SubStreet[]>([]);
  const [zoneRefs, setZoneRefs] = useState<ZoneRef[]>([]);

  // Sites
  const [sites, setSites] = useState<SetSite[]>([]);

// Entities
   const [activeEntities, setActiveEntities] = useState<ActiveEntity[]>([]);
   const [pendingEntities, setPendingEntities] = useState<PendingEntity[]>([]);
   const [nonEntities, setNonEntities] = useState<NonEntity[]>([]);

   // Persons
   const [persons, setPersons] = useState<Person[]>([]);

   // NEW: Staging and Registry
  const [stagingEntities, setStagingEntities] = useState<StagingEntity[]>([]);
  const [stagingNonEntities, setStagingNonEntities] = useState<StagingNonEntity[]>([]);
  const [registryEntities, setRegistryEntities] = useState<RegistryEntity[]>([]);
  const [registryNonEntities, setRegistryNonEntities] = useState<RegistryNonEntity[]>([]);

  // Taxonomy
  const [domains, setDomains] = useState<RegistryDomain[]>([]);
  const [categories, setCategories] = useState<RegistryCategory[]>([]);
  const [types, setTypes] = useState<RegistryType[]>([]);

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'info' | 'warning'; message: string } | null>(null);

  // DCT change log state
  const [dctChanges, setDctChanges] = useState<DCTChangeRecord[]>([]);

// DCT archive for recovery
   const [dctArchive, setDctArchive] = useState<DCTArchiveRecord[]>([]);

   // Pending DCT changes for master-admin approval
   const [pendingDctChanges, setPendingDctChanges] = useState<PendingDctChange[]>([]);

   // Load DCT archive from localStorage
   useEffect(() => {
     try {
       const stored = JSON.parse(localStorage.getItem('dctArchive') || '[]');
       if (Array.isArray(stored)) {
         setDctArchive(stored);
       }
     } catch {}
   }, []);

   // Load pending DCT changes from localStorage
   useEffect(() => {
     try {
       const stored = JSON.parse(localStorage.getItem('pendingDctChanges') || '[]');
       if (Array.isArray(stored)) {
         setPendingDctChanges(stored);
       }
     } catch {}
   }, []);

   // Load DCT changes from localStorage
   useEffect(() => {
     try {
       const stored = JSON.parse(localStorage.getItem('dctChanges') || '[]');
       if (Array.isArray(stored)) {
         setDctChanges(stored);
       }
     } catch {}
   }, []);

   // Save dctChanges to localStorage whenever it changes
   useEffect(() => {
     try {
       localStorage.setItem('dctChanges', JSON.stringify(dctChanges));
     } catch {}
   }, [dctChanges]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Initialize data from Firebase
  useEffect(() => {
    async function initFirebase() {
      try {
        setIsLoading(true);

        // Load geographic data
        const citiesData = await geoApi.seedCities(seedCities);
        const areasData = await geoApi.seedAreas(seedAreas);
        const streetsData = await geoApi.seedStreets(seedStreets);
        const substreetsData = await geoApi.seedSubstreets(seedSubstreets);

        const sitesData = await siteApi.seed(seedSites);

        // Load entities
        const entitiesData = await entityApi.seed(seedActiveEntities);
        const pendingData = await pendingApi.getAll();

        // Load taxonomy
        const domainsData = await taxonomyApi.seedDomains(
          masterDomains.map((d) => ({ ...d, status: d.status || 'active' }))
        );
        const categoriesData = await taxonomyApi.seedCategories(
          masterCategories.map((c) => ({ ...c, status: c.status || 'active' }))
        );
        const typesData = await taxonomyApi.seedTypes(
          masterTypes.map((t) => ({ ...t, status: t.status || 'active' }))
        );

        // Load non-entities
        const initialSeedNonEntities: NonEntity[] = [
          {
            non_entity_pk: 'NENT-000001',
            non_entity_name: 'Sirkazhi Temple Chariot Festival Route',
            stateId: 'GEO-TN',
            districtId: 'GEO-TN-MAY',
            talukId: 'GEO-TN-MAY-SIR',
            cityVillageId: 'ZON-CITY-001',
            areaId: 'ZON-AREA-001',
            streetId: 'ZON-STR-001',
            substreetId: null,
            zone_pk: 'ZON-TN-MAY-SIR-CITY1-AREA1-STR1',
            primary_domain: 'TOU',
            secondary_domains: [],
            category_pk: 'CAT-TOU-722',
            category_name: 'Spiritual Ashrams & Parks',
            type_pk: 'TYP-TOU-722-01',
            phone: '044-2432901',
            visibility_type: 'Public',
            status: 'active',
            createdAt: '2026-06-22T12:00:00Z',
            updatedAt: '2026-06-22T12:00:00Z',
            linkedEntities: {}, // NEW: Added
          },
          {
            non_entity_pk: 'NENT-000002',
            non_entity_name: 'Pattamangala Lake Water Basin Project',
            stateId: 'GEO-TN',
            districtId: 'GEO-TN-MAY',
            talukId: 'GEO-TN-MAY-SIR',
            cityVillageId: 'ZON-CITY-001',
            areaId: 'ZON-AREA-001',
            streetId: 'ZON-STR-002',
            substreetId: null,
            zone_pk: 'ZON-TN-MAY-SIR-CITY1-AREA1-STR2',
            primary_domain: 'AGR',
            secondary_domains: [],
            category_pk: 'CAT-AGR-501',
            category_name: 'Seeds & Farm Supplies Depot',
            type_pk: 'TYP-AGR-501-01',
            phone: '044-2432902',
            visibility_type: 'Public',
            status: 'active',
            createdAt: '2026-06-22T12:00:00Z',
            updatedAt: '2026-06-22T12:00:00Z',
            linkedEntities: {}, // NEW: Added
          },
        ];

        const nonEntitiesData = await nonEntityApi.seed(initialSeedNonEntities);

        // Set all state
        setCities(citiesData);
        setAreas(areasData);
        setStreets(streetsData);
        setSubstreets(substreetsData);
        setSites(sitesData);
        setActiveEntities(entitiesData);
        setPendingEntities(pendingData);
        setDomains(domainsData);
        setCategories(categoriesData);
        setTypes(typesData);
        setNonEntities(nonEntitiesData);
      } catch (err) {
        console.error('Firebase syncing error:', String(err).replace(/[\r\n]/g, ' '));
      } finally {
        setIsLoading(false);
      }
    }

    initFirebase();
  }, []);

  // Load DCT changes from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('dctChanges') || '[]');
      if (Array.isArray(stored) && stored.length > 0) {
        setDctChanges(stored);
      }
    } catch {}
  }, []);

  // Recalculate zone refs when geographic data changes
  useEffect(() => {
    if (cities.length > 0) {
      const refs = buildDynamicZoneRefs(streets, areas, cities, substreets, taluks, districts);
      setZoneRefs(refs);
    }
  }, [streets, areas, cities, substreets, taluks, districts]);

  // Toast helper
  const showToast = (type: 'success' | 'info' | 'warning', message: string) => {
    setToast({ type, message });
  };

  const logDctChange = async (
    action: DCTChangeAction,
    dctType: 'domain' | 'category' | 'type',
    dctId: string,
    oldValue: string,
    newValue: string,
    description: string,
    redirects?: { entityCount: number; nonEntityCount: number; targetDctId?: string }
  ) => {
    const record: DCTChangeRecord = {
      id: `DCT-LOG-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      action,
      dctType,
      dctId,
      oldValue,
      newValue,
      description,
      performedBy: 'admin',
      redirects,
    };
    setDctChanges((prev) => [record, ...prev]);
    try {
      const existing = JSON.parse(localStorage.getItem('dctChanges') || '[]');
      existing.unshift(record);
      localStorage.setItem('dctChanges', JSON.stringify(existing.slice(0, 500)));
    } catch {}
  };

  // Geographic actions
  const addCity = async (name: string, talukId: string) => {
    try {
      const newCityId = `ZON-CITY-${String(cities.length + 1).padStart(3, '0')}`;
      const newCity = { id: newCityId, talukId, name };
      await geoApi.createCity(newCity);
      setCities((prev) => [...prev, newCity]);
      showToast('success', `Geographic Townlet '${name}' successfully provisioned as ${newCityId}.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to persist new geographic zone.');
    }
  };

  const addArea = async (name: string, cityVillageId: string) => {
    try {
      const newAreaId = `ZON-AREA-${String(areas.length + 1).padStart(3, '0')}`;
      const newArea = { id: newAreaId, cityVillageId, name };
      await geoApi.createArea(newArea);
      setAreas((prev) => [...prev, newArea]);
      showToast('success', `Area Ward '${name}' successfully provisioned as ${newAreaId}.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to persist new area zone.');
    }
  };

  const addStreet = async (name: string, areaId: string) => {
    try {
      const newStreetId = `ZON-STR-${String(streets.length + 1).padStart(3, '0')}`;
      const newStreet = { id: newStreetId, areaId, name, substreetsCount: 0 };
      await geoApi.createStreet(newStreet);
      setStreets((prev) => [...prev, newStreet]);
      showToast('success', `Physical Street '${name}' successfully locked as ${newStreetId}.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to persist new street.');
    }
  };

  const addSubstreet = async (name: string, streetId: string) => {
    try {
      const newSubId = `ZON-SUB-${String(substreets.length + 1).padStart(3, '0')}`;
      const newSubstreet = { id: newSubId, streetId, name };
      await geoApi.createSubstreet(newSubstreet);
      setSubstreets((prev) => [...prev, newSubstreet]);
      showToast('success', `Physical Substreet Track '${name}' successfully appended as ${newSubId}.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to persist new substreet.');
    }
  };

  const updateZone = async (
    type: 'city' | 'area' | 'street' | 'substreet',
    id: string,
    updates: { name: string; parentId: string }
  ) => {
    try {
      if (type === 'city') {
        const updated = await geoApi.updateCity(id, { name: updates.name, talukId: updates.parentId });
        setCities((prev) => prev.map((c) => (c.id === id ? updated : c)));
        showToast('success', `City/Village '${updates.name}' updated successfully.`);
      } else if (type === 'area') {
        const updated = await geoApi.updateArea(id, { name: updates.name, cityVillageId: updates.parentId });
        setAreas((prev) => prev.map((a) => (a.id === id ? updated : a)));
        showToast('success', `Area '${updates.name}' updated successfully.`);
      } else if (type === 'street') {
        const updated = await geoApi.updateStreet(id, { name: updates.name, areaId: updates.parentId });
        setStreets((prev) => prev.map((s) => (s.id === id ? updated : s)));
        showToast('success', `Street '${updates.name}' updated successfully.`);
      } else if (type === 'substreet') {
        const updated = await geoApi.updateSubstreet(id, { name: updates.name, streetId: updates.parentId });
        setSubstreets((prev) => prev.map((s) => (s.id === id ? updated : s)));
        showToast('success', `Substreet '${updates.name}' updated successfully.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to update zone.');
      throw err;
    }
  };

  const refreshGeoData = async () => {
    try {
      const [citiesData, areasData, streetsData, substreetsData] = await Promise.all([
        geoApi.getCities(),
        geoApi.getAreas(),
        geoApi.getStreets(),
        geoApi.getSubstreets(),
      ]);
      setCities(citiesData);
      setAreas(areasData);
      setStreets(streetsData);
      setSubstreets(substreetsData);
      showToast('success', 'Geographic data refreshed successfully.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to refresh geographic data.');
    }
  };

  const refreshAreas = async () => {
    try {
      const areasData = await geoApi.getAreas();
      setAreas(areasData);
      showToast('success', 'Areas data refreshed successfully.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to refresh areas data.');
    }
  };

  const refreshStreets = async () => {
    try {
      const streetsData = await geoApi.getStreets();
      setStreets(streetsData);
      showToast('success', 'Streets data refreshed successfully.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to refresh streets data.');
    }
  };

  const getDistrictsByState = (stateId: string) => districts.filter(d => d.stateId === stateId);
  const getTaluksByDistrict = (districtId: string) => taluks.filter(t => t.districtId === districtId);
  const getCitiesByTaluk = (talukId: string) => cities.filter(c => c.talukId === talukId);

  // Site actions
  const addSite = async (newSite: SetSite) => {
    try {
      await siteApi.create(newSite);
      setSites((prev) => [...prev, newSite]);
      showToast('success', `Dynamic Web Generator Blueprint '${newSite.title}' successfully compiled.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to compile site blueprint.');
    }
  };

  const updateSite = async (updatedSite: SetSite) => {
    try {
      await siteApi.update(updatedSite);
      setSites((prev) => prev.map((s) => (s.site_id === updatedSite.site_id ? updatedSite : s)));
      showToast('success', `Site '${updatedSite.title}' updated successfully.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to update site '${updatedSite.title}'.`);
    }
  };

  // Entity actions
  const addEntity = async (entity: ActiveEntity) => {
    try {
      const updated = { ...entity, status: 'active' as const };
      await entityApi.create(updated);
      setActiveEntities((prev) => {
        const exists = prev.some(e => e.entity_pk === updated.entity_pk);
        return exists ? prev.map(e => e.entity_pk === updated.entity_pk ? updated : e) : [...prev, updated];
      });
      showToast('success', `Entity L4 '${entity.entity_name}' successfully added.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to add entity '${entity.entity_name}'.`);
    }
  };

  const updateEntity = async (updated: ActiveEntity) => {
    try {
      await entityApi.update(updated);
      setActiveEntities((prev) => prev.map((e) => (e.entity_pk === updated.entity_pk ? updated : e)));
      showToast('success', `L1 Registry block '${updated.entity_name}' successfully updated.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to update L1 entity.');
    }
  };

  const stopEntity = async (entityPk: string) => {
    try {
      const ent = activeEntities.find((e) => e.entity_pk === entityPk);
      if (ent) {
        await entityApi.updateStatus(entityPk, 'stopped');
        setActiveEntities((prev) => prev.map((e) => (e.entity_pk === entityPk ? { ...e, status: 'stopped' } : e)));
        showToast('warning', `Active Entity L4 '${ent.entity_name}' (${entityPk}) successfully stopped.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to stop entity '${entityPk}'.`);
    }
  };

  const recoverEntity = async (entityPk: string) => {
    try {
      const ent = activeEntities.find((e) => e.entity_pk === entityPk);
      if (ent) {
        await entityApi.updateStatus(entityPk, 'active');
        setActiveEntities((prev) => prev.map((e) => (e.entity_pk === entityPk ? { ...e, status: 'active' } : e)));
        showToast('success', `Active Entity L4 '${ent.entity_name}' (${entityPk}) successfully recovered.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to recover entity '${entityPk}'.`);
    }
  };

  // Pending actions
  const syncPendingEntities = async (records: PendingEntity[]) => {
    setPendingEntities(records);
    try {
      await pendingApi.syncAll(records);
    } catch (err) {
      console.error('Staging synchronization error:', String(err).replace(/[\r\n]/g, ' '));
      showToast('warning', 'Failed to synchronize staging area with database.');
    }
  };

  const commitApproved = async (approvedRecords: PendingEntity[]) => {
    if (approvedRecords.length === 0) return;

    try {
      const newlyMigratedEntities: ActiveEntity[] = [];
      const newlyMigratedNonEntities: NonEntity[] = [];
      
      for (const p of approvedRecords) {
        if (p.record_type === 'entity') {
          // Handle ENTITY records - require full zone
          const entPk = `ENT-${String(Date.now()).slice(-6)}`;
          const relativeZone = zoneRefs.find((z) => z.zone_pk === p.target_zone_pk);

          if (!relativeZone) {
            console.error(`Zone not found for entity: ${String(p.entity_name).replace(/[\r\n]/g, ' ')}`);
            continue;
          }

          const docObj: ActiveEntity = {
            entity_pk: entPk,
            entity_name: p.entity_name,
            stateId: p.stateId || relativeZone.stateId,
            districtId: p.districtId || relativeZone.districtId,
            talukId: p.talukId || relativeZone.talukId,
            cityVillageId: p.cityVillageId || relativeZone.cityVillageId,
            areaId: p.areaId || relativeZone.areaId,
            streetId: p.streetId || relativeZone.streetId,
            substreetId: p.substreetId || relativeZone.substreetId,
            zone_pk: p.target_zone_pk!,
            primary_domain: p.primary_domain as any,
            secondary_domains: [],
            category_pk: p.category_pk,
            category_name: p.category_name,
            phone: p.phone,
            visibility_type: p.visibility_type,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            website_zone_entity_id: p.website_zone_entity_id || null,
            roles: { isAssetProvider: false, isServiceProvider: true }, // NEW: Default roles
            linkedAssets: [], // NEW: Default empty
          };

          await entityApi.create(docObj);
          newlyMigratedEntities.push(docObj);
          
        } else if (p.record_type === 'non-entity') {
          // Handle NON-ENTITY records - GEO only, zone optional
          const nonEntPk = `NENT-${String(Date.now()).slice(-6)}`;
          
          // Build zone_pk if zone fields are provided
          let zone_pk = p.target_zone_pk || '';
          if (!zone_pk && p.streetId) {
            const relativeZone = zoneRefs.find((z) => z.streetId === p.streetId);
            zone_pk = relativeZone?.zone_pk || '';
          }

          const nonEntObj: NonEntity = {
            non_entity_pk: nonEntPk,
            non_entity_name: p.entity_name,
            stateId: p.stateId,
            districtId: p.districtId,
            talukId: p.talukId,
            cityVillageId: p.cityVillageId,
            areaId: p.areaId,
            streetId: p.streetId,
            substreetId: p.substreetId || null,
            zone_pk: zone_pk,
            primary_domain: p.primary_domain,
            secondary_domains: [],
            category_pk: p.category_pk,
            category_name: p.category_name,
            type_pk: p.type_pk,
            phone: p.phone,
            visibility_type: p.visibility_type,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            website_zone_entity_id: p.website_zone_entity_id || null,
            linkedEntities: {}, // NEW: Default empty
          };

          await nonEntityApi.create(nonEntObj);
          newlyMigratedNonEntities.push(nonEntObj);
        }
        
        await pendingApi.delete(p.id);
      }

      // Update state
      if (newlyMigratedEntities.length > 0) {
        setActiveEntities((prev) => [...prev, ...newlyMigratedEntities]);
      }
      if (newlyMigratedNonEntities.length > 0) {
        setNonEntities((prev) => [...prev, ...newlyMigratedNonEntities]);
      }

      const approvedIds = approvedRecords.map((a) => a.id);
      setPendingEntities((prev) => prev.filter((p) => !approvedIds.includes(p.id)));

      const entityCount = newlyMigratedEntities.length;
      const nonEntityCount = newlyMigratedNonEntities.length;
      showToast(
        'success',
        `Migration Complete: ${entityCount} entities and ${nonEntityCount} non-entities promoted.`
      );
    } catch (err) {
      console.error('Commit failed:', String(err).replace(/[\r\n]/g, ' '));
      showToast('warning', 'Promotion fails to synchronize. Ensure Cloud connectivity is active.');
    }
  };

  // Non-entity actions
  const addNonEntity = async (nent: NonEntity) => {
    try {
      const updated = { ...nent, status: 'active' as const };
      await nonEntityApi.create(updated);
      setNonEntities((prev) => {
        const exists = prev.some(n => n.non_entity_pk === updated.non_entity_pk);
        return exists ? prev.map(n => n.non_entity_pk === updated.non_entity_pk ? updated : n) : [...prev, updated];
      });
      showToast('success', `Non-Entity L4 '${nent.non_entity_name}' successfully added.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to add Non-Entity '${nent.non_entity_name}'.`);
    }
  };

  const updateNonEntity = async (nent: NonEntity) => {
    try {
      await nonEntityApi.update(nent);
      setNonEntities((prev) => prev.map((n) => (n.non_entity_pk === nent.non_entity_pk ? nent : n)));
      showToast('success', `Non-Entity L4 '${nent.non_entity_name}' updated successfully.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to update Non-Entity '${nent.non_entity_name}'.`);
    }
  };

  const stopNonEntity = async (pk: string) => {
    try {
      const nent = nonEntities.find((n) => n.non_entity_pk === pk);
      if (nent) {
        await nonEntityApi.updateStatus(pk, 'stopped');
        setNonEntities((prev) => prev.map((n) => (n.non_entity_pk === pk ? { ...n, status: 'stopped' } : n)));
        showToast('warning', `Non-Entity L4 '${nent.non_entity_name}' set to stopped.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to stop Non-Entity '${pk}'.`);
    }
  };

  const recoverNonEntity = async (pk: string) => {
    try {
      const nent = nonEntities.find((n) => n.non_entity_pk === pk);
      if (nent) {
        await nonEntityApi.updateStatus(pk, 'active');
        setNonEntities((prev) => prev.map((n) => (n.non_entity_pk === pk ? { ...n, status: 'active' } : n)));
        showToast('success', `Non-Entity '${nent.non_entity_name}' successfully recovered.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to recover Non-Entity '${pk}'.`);
    }
  };

  const refreshActiveEntities = async () => {
    try {
      const entitiesData = await entityApi.getAll();
      setActiveEntities(entitiesData);
      showToast('success', 'Entities data refreshed successfully.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to refresh entities data.');
    }
  };

  const refreshNonEntities = async () => {
    try {
      const nonEntitiesData = await nonEntityApi.getAll();
      setNonEntities(nonEntitiesData);
      showToast('success', 'Non-entities data refreshed successfully.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to refresh non-entities data.');
    }
  };

  // Taxonomy actions - Domains
  const addDomain = async (dom: RegistryDomain) => {
    try {
      const updated = { ...dom, status: 'active' as const, dctId: dom.dctId || `DCT-DOM-${String(Date.now()).slice(-6)}` };
      await taxonomyApi.createDomain(updated);
      setDomains((prev) => [...prev, updated]);
      await logDctChange('edit', 'domain', updated.dctId, 'created', updated.name, `Domain '${updated.name}' created`);
      showToast('success', `Domain L1 '${updated.name}' successfully registered.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to register Domain '${dom.name}'.`);
    }
  };

  const updateDomain = async (dom: RegistryDomain) => {
    try {
      await taxonomyApi.updateDomain(dom);
      const dctId = dom.dctId || dom.code;
      setDomains((prev) => prev.map((d) => (d.dctId === dctId ? dom : d)));
      await logDctChange('edit', 'domain', dctId, dom.name, dom.name, `Domain '${dom.name}' updated`);
      showToast('success', `Domain L1 '${dom.name}' updated successfully.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to update Domain '${dom.name}'.`);
    }
  };

  const stopDomain = async (identifier: string, targetCode?: string) => {
    try {
      const dom = domains.find((d) => d.code === identifier || d.dctId === identifier);
      if (!dom) return;
      if (targetCode && targetCode !== dom.code) {
        await redirectEntitiesFromDomain(dom.code, targetCode);
        await redirectNonEntitiesFromDomain(dom.code, targetCode);
      }
      await taxonomyApi.updateDomainStatus(dom.dctId, 'stopped');
      setDomains((prev) => prev.map((d) => (d.dctId === dom.dctId ? { ...d, status: 'stopped' } : d)));
      const entityCount = activeEntities.filter(e => e.primary_domain === dom.code).length;
      const nonEntityCount = nonEntities.filter(n => n.primary_domain === dom.code).length;
      const targetDomain = targetCode ? domains.find(d => d.code === targetCode) : undefined;
      await logDctChange('delete', 'domain', dom.dctId, dom.name, 'stopped', `Domain '${dom.name}' set to stopped${targetDomain ? ` and redirected to '${targetDomain.name}'` : ''}.`, { entityCount, nonEntityCount, targetDctId: targetDomain?.dctId });
      const archiveRecord: DCTArchiveRecord = {
        id: `ARCH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        dctType: 'domain',
        dctId: dom.dctId,
        originalCode: dom.code,
        originalName: dom.name,
        archivedAt: new Date().toISOString(),
        archivedBy: 'admin',
        entityCount,
        nonEntityCount,
        redirectedTo: targetDomain?.dctId,
      };
      setDctArchive((prev) => [archiveRecord, ...prev]);
      try {
        const existing = JSON.parse(localStorage.getItem('dctArchive') || '[]');
        existing.unshift(archiveRecord);
        localStorage.setItem('dctArchive', JSON.stringify(existing.slice(0, 200)));
      } catch {}
      showToast('warning', `Domain L1 '${dom.name}' set to stopped.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to stop Domain '${identifier}'.`);
    }
  };

  const recoverDomain = async (identifier: string) => {
    try {
      const dom = domains.find((d) => d.code === identifier || d.dctId === identifier);
      if (dom) {
        await taxonomyApi.updateDomainStatus(dom.dctId, 'active');
        setDomains((prev) => prev.map((d) => (d.dctId === dom.dctId ? { ...d, status: 'active' } : d)));
        await logDctChange('edit', 'domain', dom.dctId, 'stopped', 'active', `Domain '${dom.name}' recovered`);
        showToast('success', `Domain L1 '${dom.name}' successfully recovered.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to recover Domain '${identifier}'.`);
    }
  };

  // Taxonomy actions - Categories
  const addCategory = async (cat: RegistryCategory) => {
    try {
      const updated = { ...cat, status: 'active' as const, dctId: cat.dctId || `DCT-CAT-${String(Date.now()).slice(-6)}` };
      await taxonomyApi.createCategory(updated);
      setCategories((prev) => [...prev, updated]);
      await logDctChange('edit', 'category', updated.dctId, 'created', updated.name, `Category '${updated.name}' created`);
      showToast('success', `Category L2 '${cat.name}' successfully registered.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to register Category '${cat.name}'.`);
    }
  };

  const updateCategory = async (cat: RegistryCategory) => {
    try {
      await taxonomyApi.updateCategory(cat);
      const dctId = cat.dctId || cat.pk;
      setCategories((prev) => prev.map((c) => (c.dctId === dctId ? cat : c)));
      await logDctChange('edit', 'category', dctId, cat.name, cat.name, `Category '${cat.name}' updated`);
      showToast('success', `Category L2 '${cat.name}' updated successfully.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to update Category '${cat.name}'.`);
    }
  };

  const stopCategory = async (identifier: string, targetPk?: string) => {
    try {
      const cat = categories.find((c) => c.pk === identifier || c.dctId === identifier);
      if (!cat) return;
      if (targetPk && targetPk !== cat.pk) {
        await redirectEntitiesFromCategory(cat.pk, targetPk);
        await redirectNonEntitiesFromCategory(cat.pk, targetPk);
      }
      await taxonomyApi.updateCategoryStatus(cat.dctId, 'stopped');
      setCategories((prev) => prev.map((c) => (c.dctId === cat.dctId ? { ...c, status: 'stopped' } : c)));
      const entityCount = activeEntities.filter(e => e.category_pk === cat.pk).length;
      const nonEntityCount = nonEntities.filter(n => n.category_pk === cat.pk).length;
      const targetCat = targetPk ? categories.find(c => c.pk === targetPk) : undefined;
      await logDctChange('delete', 'category', cat.dctId, cat.name, 'stopped', `Category '${cat.name}' set to stopped${targetCat ? ` and redirected to '${targetCat.name}'` : ''}.`, { entityCount, nonEntityCount, targetDctId: targetCat?.dctId });
      const archiveRecord: DCTArchiveRecord = {
        id: `ARCH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        dctType: 'category',
        dctId: cat.dctId,
        originalPk: cat.pk,
        originalName: cat.name,
        archivedAt: new Date().toISOString(),
        archivedBy: 'admin',
        entityCount,
        nonEntityCount,
        redirectedTo: targetCat?.dctId,
      };
      setDctArchive((prev) => [archiveRecord, ...prev]);
      try {
        const existing = JSON.parse(localStorage.getItem('dctArchive') || '[]');
        existing.unshift(archiveRecord);
        localStorage.setItem('dctArchive', JSON.stringify(existing.slice(0, 200)));
      } catch {}
      showToast('warning', `Category L2 '${cat.name}' set to stopped.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to stop Category '${identifier}'.`);
    }
  };

  const recoverCategory = async (identifier: string) => {
    try {
      const cat = categories.find((c) => c.pk === identifier || c.dctId === identifier);
      if (cat) {
        await taxonomyApi.updateCategoryStatus(cat.dctId, 'active');
        setCategories((prev) => prev.map((c) => (c.dctId === cat.dctId ? { ...c, status: 'active' } : c)));
        await logDctChange('edit', 'category', cat.dctId, 'stopped', 'active', `Category '${cat.name}' recovered`);
        showToast('success', `Category L2 '${cat.name}' successfully recovered.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to recover Category '${identifier}'.`);
    }
  };

  // Taxonomy actions - Types
  const addType = async (typ: RegistryType) => {
    try {
      const updated = { ...typ, status: 'active' as const, dctId: typ.dctId || `DCT-TYP-${String(Date.now()).slice(-6)}` };
      await taxonomyApi.createType(updated);
      setTypes((prev) => [...prev, updated]);
      await logDctChange('edit', 'type', updated.dctId, 'created', updated.name, `Type '${updated.name}' created`);
      showToast('success', `Class Type L3 '${typ.name}' successfully registered.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to register Class Type '${typ.name}'.`);
    }
  };

  const updateType = async (typ: RegistryType) => {
    try {
      await taxonomyApi.updateType(typ);
      const dctId = typ.dctId || typ.pk;
      setTypes((prev) => prev.map((t) => (t.dctId === dctId ? typ : t)));
      await logDctChange('edit', 'type', dctId, typ.name, typ.name, `Type '${typ.name}' updated`);
      showToast('success', `Class Type L3 '${typ.name}' updated successfully.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to update Class Type '${typ.name}'.`);
    }
  };

  const stopType = async (identifier: string, targetPk?: string) => {
    try {
      const typ = types.find((t) => t.pk === identifier || t.dctId === identifier);
      if (!typ) return;
      if (targetPk && targetPk !== typ.pk) {
        await redirectEntitiesFromType(typ.pk, targetPk);
        await redirectNonEntitiesFromType(typ.pk, targetPk);
      }
      await taxonomyApi.updateTypeStatus(typ.dctId, 'stopped');
      setTypes((prev) => prev.map((t) => (t.dctId === typ.dctId ? { ...t, status: 'stopped' } : t)));
      const entityCount = activeEntities.filter(e => e.type_pk === typ.pk).length;
      const nonEntityCount = nonEntities.filter(n => n.type_pk === typ.pk).length;
      const targetType = targetPk ? types.find(t => t.pk === targetPk) : undefined;
      await logDctChange('delete', 'type', typ.dctId, typ.name, 'stopped', `Type '${typ.name}' set to stopped${targetType ? ` and redirected to '${targetType.name}'` : ''}.`, { entityCount, nonEntityCount, targetDctId: targetType?.dctId });
      const archiveRecord: DCTArchiveRecord = {
        id: `ARCH-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        dctType: 'type',
        dctId: typ.dctId,
        originalPk: typ.pk,
        originalName: typ.name,
        archivedAt: new Date().toISOString(),
        archivedBy: 'admin',
        entityCount,
        nonEntityCount,
        redirectedTo: targetType?.dctId,
      };
      setDctArchive((prev) => [archiveRecord, ...prev]);
      try {
        const existing = JSON.parse(localStorage.getItem('dctArchive') || '[]');
        existing.unshift(archiveRecord);
        localStorage.setItem('dctArchive', JSON.stringify(existing.slice(0, 200)));
      } catch {}
      showToast('warning', `Class Type L3 '${typ.name}' set to stopped.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to stop Type '${identifier}'.`);
    }
  };

  const recoverType = async (identifier: string) => {
    try {
      const typ = types.find((t) => t.pk === identifier || t.dctId === identifier);
      if (typ) {
        await taxonomyApi.updateTypeStatus(typ.dctId, 'active');
        setTypes((prev) => prev.map((t) => (t.dctId === typ.dctId ? { ...t, status: 'active' } : t)));
        await logDctChange('edit', 'type', typ.dctId, 'stopped', 'active', `Type '${typ.name}' recovered`);
        showToast('success', `Class Type L3 '${typ.name}' successfully recovered.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to recover Type '${identifier}'.`);
    }
  };

  const redirectEntitiesFromDomain = async (oldCode: string, newCode: string) => {
    try {
      const newDomain = domains.find(d => d.code === newCode);
      if (!newDomain) throw new Error('Target domain not found');
      setActiveEntities((prev) =>
        prev.map((e) =>
          e.primary_domain === oldCode ? { ...e, primary_domain: newCode } : e
        )
      );
      setRegistryEntities((prev) =>
        prev.map((e) =>
          e.domain === oldCode ? { ...e, domain: newCode } : e
        )
      );
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to redirect entities from domain '${oldCode}'.`);
    }
  };

  const redirectNonEntitiesFromDomain = async (oldCode: string, newCode: string) => {
    try {
      const newDomain = domains.find(d => d.code === newCode);
      if (!newDomain) throw new Error('Target domain not found');
      setNonEntities((prev) =>
        prev.map((n) =>
          n.primary_domain === oldCode ? { ...n, primary_domain: newCode } : n
        )
      );
      setRegistryNonEntities((prev) =>
        prev.map((n) =>
          n.domain === oldCode ? { ...n, domain: newCode } : n
        )
      );
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to redirect non-entities from domain '${oldCode}'.`);
    }
  };

  const redirectEntitiesFromCategory = async (oldPk: string, newPk: string) => {
    try {
      const newCategory = categories.find(c => c.pk === newPk);
      if (!newCategory) throw new Error('Target category not found');
      setActiveEntities((prev) =>
        prev.map((e) =>
          e.category_pk === oldPk ? { ...e, category_pk: newPk, category_name: newCategory.name } : e
        )
      );
      setRegistryEntities((prev) =>
        prev.map((e) =>
          e.category === oldPk ? { ...e, category: newPk } : e
        )
      );
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to redirect entities from category '${oldPk}'.`);
    }
  };

  const redirectNonEntitiesFromCategory = async (oldPk: string, newPk: string) => {
    try {
      const newCategory = categories.find(c => c.pk === newPk);
      if (!newCategory) throw new Error('Target category not found');
      setNonEntities((prev) =>
        prev.map((n) =>
          n.category_pk === oldPk ? { ...n, category_pk: newPk, category_name: newCategory.name } : n
        )
      );
      setRegistryNonEntities((prev) =>
        prev.map((n) =>
          n.category === oldPk ? { ...n, category: newPk } : n
        )
      );
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to redirect non-entities from category '${oldPk}'.`);
    }
  };

  const redirectEntitiesFromType = async (oldPk: string, newPk?: string) => {
    try {
      setActiveEntities((prev) =>
        prev.map((e) =>
          e.type_pk === oldPk ? { ...e, type_pk: newPk } : e
        )
      );
      setRegistryEntities((prev) =>
        prev.map((e) =>
          e.type === oldPk ? { ...e, type: newPk } : e
        )
      );
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to redirect entities from type '${oldPk}'.`);
    }
  };

  const redirectNonEntitiesFromType = async (oldPk: string, newPk?: string) => {
    try {
      setNonEntities((prev) =>
        prev.map((n) =>
          n.type_pk === oldPk ? { ...n, type_pk: newPk } : n
        )
      );
      setRegistryNonEntities((prev) =>
        prev.map((n) =>
          n.type === oldPk ? { ...n, type: newPk } : n
        )
      );
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to redirect non-entities from type '${oldPk}'.`);
    }
  };

  const splitDomain = async (oldCode: string, newDomains: { code: string; name: string; categoryPks: string[] }[]) => {
    try {
      const oldDomain = domains.find(d => d.code === oldCode);
      if (!oldDomain) return;

      for (const nd of newDomains) {
        const domain: RegistryDomain = {
          dctId: `DCT-DOM-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          code: nd.code,
          name: nd.name,
          description: `Split from ${oldCode}`,
          color: '#6366f1',
          icon: 'folder',
          status: 'active',
        };
        await taxonomyApi.createDomain(domain);
        setDomains((prev) => [...prev, domain]);

        for (const catPk of nd.categoryPks) {
          const cat = categories.find(c => c.pk === catPk);
          if (cat) {
            const newCat: RegistryCategory = {
              dctId: `DCT-CAT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              ...cat,
              pk: cat.pk.replace(/^CAT-[A-Z]+-/, `CAT-${nd.code}-`),
              domainCode: nd.code,
            };
            await taxonomyApi.createCategory(newCat);
            setCategories((prev) => [...prev, newCat]);
            await redirectEntitiesFromCategory(catPk, newCat.pk);
            await redirectNonEntitiesFromCategory(catPk, newCat.pk);
          }
        }
      }

      const targetCode = newDomains[0]?.code || oldCode;
      await redirectEntitiesFromDomain(oldCode, targetCode);
      await redirectNonEntitiesFromDomain(oldCode, targetCode);
      await stopDomain(oldCode, targetCode);
      await logDctChange('split', 'domain', oldDomain.dctId, oldDomain.name, newDomains.map(n => n.name).join(', '), `Domain '${oldDomain.name}' split into ${newDomains.length} domains`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to split domain '${oldCode}'.`);
    }
  };

  const splitCategory = async (oldPk: string, newCategories: { pk: string; name: string; typePks: string[] }[]) => {
    try {
      const oldCategory = categories.find(c => c.pk === oldPk);
      if (!oldCategory) return;

      for (const nc of newCategories) {
        const category: RegistryCategory = {
          dctId: `DCT-CAT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          pk: nc.pk,
          domainCode: oldCategory.domainCode,
          name: nc.name,
          description: `Split from ${oldPk}`,
          status: 'active',
        };
        await taxonomyApi.createCategory(category);
        setCategories((prev) => [...prev, category]);

        for (const typePk of nc.typePks) {
          const typ = types.find(t => t.pk === typePk);
          if (typ) {
            const newType: RegistryType = {
              dctId: `DCT-TYP-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              ...typ,
              pk: typ.pk.replace(/^TYP-[A-Z]+-[A-Z]+-/, `TYP-${oldCategory.domainCode}-${nc.pk.split('-').pop()}-`),
              categoryPk: nc.pk,
            };
            await taxonomyApi.createType(newType);
            setTypes((prev) => [...prev, newType]);
            await redirectEntitiesFromType(typePk, newType.pk);
            await redirectNonEntitiesFromType(typePk, newType.pk);
          }
        }
      }

      const targetPk = newCategories[0]?.pk || oldPk;
      await redirectEntitiesFromCategory(oldPk, targetPk);
      await redirectNonEntitiesFromCategory(oldPk, targetPk);
      await stopCategory(oldPk, targetPk);
      await logDctChange('split', 'category', oldCategory.dctId, oldCategory.name, newCategories.map(n => n.name).join(', '), `Category '${oldCategory.name}' split into ${newCategories.length} categories`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to split category '${oldPk}'.`);
    }
  };

  const splitType = async (oldPk: string, newTypes: { pk: string; name: string }[]) => {
    try {
      const oldType = types.find(t => t.pk === oldPk);
      if (!oldType) return;

      for (const nt of newTypes) {
        const newType: RegistryType = {
          dctId: `DCT-TYP-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          pk: nt.pk,
          categoryPk: oldType.categoryPk,
          name: nt.name,
          description: `Split from ${oldPk}`,
          status: 'active',
        };
        await taxonomyApi.createType(newType);
        setTypes((prev) => [...prev, newType]);
      }

      const targetPk = newTypes[0]?.pk || oldPk;
      await redirectEntitiesFromType(oldPk, targetPk);
      await redirectNonEntitiesFromType(oldPk, targetPk);
      await stopType(oldPk, targetPk);
      await logDctChange('split', 'type', oldType.dctId, oldType.name, newTypes.map(n => n.name).join(', '), `Type '${oldType.name}' split into ${newTypes.length} types`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to split type '${oldPk}'.`);
    }
  };

  const convertDomain = async (oldDctId: string, newDomain: { code: string; name: string }) => {
    try {
      const oldDomain = domains.find(d => d.dctId === oldDctId || d.code === oldDctId);
      if (!oldDomain) return;
      const existingTarget = domains.find(d => d.code === newDomain.code);
      if (existingTarget) {
        await redirectEntitiesFromDomain(oldDomain.code, newDomain.code);
        await redirectNonEntitiesFromDomain(oldDomain.code, newDomain.code);
        await stopDomain(oldDomain.code, newDomain.code);
      } else {
        const converted: RegistryDomain = {
          dctId: oldDomain.dctId,
          code: newDomain.code,
          name: newDomain.name,
          description: oldDomain.description,
          color: oldDomain.color,
          icon: oldDomain.icon,
          status: 'active',
        };
        await taxonomyApi.updateDomain(converted);
        setDomains((prev) => prev.map((d) => (d.dctId === oldDomain.dctId ? converted : d)));
        await redirectEntitiesFromDomain(oldDomain.code, newDomain.code);
        await redirectNonEntitiesFromDomain(oldDomain.code, newDomain.code);
      }
      await logDctChange('convert', 'domain', oldDomain.dctId, oldDomain.name, newDomain.name, `Domain '${oldDomain.name}' converted to '${newDomain.name}' (${newDomain.code})`);
      showToast('success', `Domain '${oldDomain.name}' converted successfully.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to convert Domain '${oldDctId}'.`);
    }
  };

  const convertCategory = async (oldDctId: string, newCategory: { pk: string; name: string }) => {
    try {
      const oldCategory = categories.find(c => c.dctId === oldDctId || c.pk === oldDctId);
      if (!oldCategory) return;
      const existingTarget = categories.find(c => c.pk === newCategory.pk);
      if (existingTarget) {
        await redirectEntitiesFromCategory(oldCategory.pk, newCategory.pk);
        await redirectNonEntitiesFromCategory(oldCategory.pk, newCategory.pk);
        await stopCategory(oldCategory.pk, newCategory.pk);
      } else {
        const converted: RegistryCategory = {
          dctId: oldCategory.dctId,
          pk: newCategory.pk,
          domainCode: oldCategory.domainCode,
          name: newCategory.name,
          description: oldCategory.description,
          status: 'active',
        };
        await taxonomyApi.updateCategory(converted);
        setCategories((prev) => prev.map((c) => (c.dctId === oldCategory.dctId ? converted : c)));
        await redirectEntitiesFromCategory(oldCategory.pk, newCategory.pk);
        await redirectNonEntitiesFromCategory(oldCategory.pk, newCategory.pk);
      }
      await logDctChange('convert', 'category', oldCategory.dctId, oldCategory.name, newCategory.name, `Category '${oldCategory.name}' converted to '${newCategory.name}' (${newCategory.pk})`);
      showToast('success', `Category '${oldCategory.name}' converted successfully.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to convert Category '${oldDctId}'.`);
    }
  };

  const convertType = async (oldDctId: string, newType: { pk: string; name: string }) => {
    try {
      const oldType = types.find(t => t.dctId === oldDctId || t.pk === oldDctId);
      if (!oldType) return;
      const existingTarget = types.find(t => t.pk === newType.pk);
      if (existingTarget) {
        await redirectEntitiesFromType(oldType.pk, newType.pk);
        await redirectNonEntitiesFromType(oldType.pk, newType.pk);
        await stopType(oldType.pk, newType.pk);
      } else {
        const converted: RegistryType = {
          dctId: oldType.dctId,
          pk: newType.pk,
          categoryPk: oldType.categoryPk,
          name: newType.name,
          description: oldType.description,
          status: 'active',
        };
        await taxonomyApi.updateType(converted);
        setTypes((prev) => prev.map((t) => (t.dctId === oldType.dctId ? converted : t)));
        await redirectEntitiesFromType(oldType.pk, newType.pk);
        await redirectNonEntitiesFromType(oldType.pk, newType.pk);
      }
      await logDctChange('convert', 'type', oldType.dctId, oldType.name, newType.name, `Type '${oldType.name}' converted to '${newType.name}' (${newType.pk})`);
      showToast('success', `Type '${oldType.name}' converted successfully.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to convert Type '${oldDctId}'.`);
    }
  };

  // ==================== MERGE ====================

  const mergeDomains = async (sourceCodes: string[], targetCode: string) => {
    try {
      const targetDomain = domains.find(d => d.code === targetCode);
      if (!targetDomain) throw new Error('Target domain not found');
      
      for (const sourceCode of sourceCodes) {
        const sourceDomain = domains.find(d => d.code === sourceCode);
        if (!sourceDomain || sourceCode === targetCode) continue;
        
        await redirectEntitiesFromDomain(sourceCode, targetCode);
        await redirectNonEntitiesFromDomain(sourceCode, targetCode);
        await stopDomain(sourceCode, targetCode);
      }
      
      await logDctChange('edit', 'domain', targetDomain.dctId, 'merge', `${sourceCodes.length} merged`, `Merged ${sourceCodes.length} domains into '${targetDomain.name}'`);
      showToast('success', `Merged ${sourceCodes.length} domains into '${targetDomain.name}'.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to merge domains.');
    }
  };

  const mergeCategories = async (sourcePks: string[], targetPk: string) => {
    try {
      const targetCat = categories.find(c => c.pk === targetPk);
      if (!targetCat) throw new Error('Target category not found');
      
      for (const sourcePk of sourcePks) {
        const sourceCat = categories.find(c => c.pk === sourcePk);
        if (!sourceCat || sourcePk === targetPk) continue;
        
        await redirectEntitiesFromCategory(sourcePk, targetPk);
        await redirectNonEntitiesFromCategory(sourcePk, targetPk);
        await stopCategory(sourcePk, targetPk);
      }
      
      await logDctChange('edit', 'category', targetCat.dctId, 'merge', `${sourcePks.length} merged`, `Merged ${sourcePks.length} categories into '${targetCat.name}'`);
      showToast('success', `Merged ${sourcePks.length} categories into '${targetCat.name}'.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to merge categories.');
    }
  };

  const mergeTypes = async (sourcePks: string[], targetPk: string) => {
    try {
      const targetType = types.find(t => t.pk === targetPk);
      if (!targetType) throw new Error('Target type not found');
      
      for (const sourcePk of sourcePks) {
        const sourceType = types.find(t => t.pk === sourcePk);
        if (!sourceType || sourcePk === targetPk) continue;
        
        await redirectEntitiesFromType(sourcePk, targetPk);
        await redirectNonEntitiesFromType(sourcePk, targetPk);
        await stopType(sourcePk, targetPk);
      }
      
      await logDctChange('edit', 'type', targetType.dctId, 'merge', `${sourcePks.length} merged`, `Merged ${sourcePks.length} types into '${targetType.name}'`);
      showToast('success', `Merged ${sourcePks.length} types into '${targetType.name}'.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to merge types.');
    }
  };

  // ==================== MODIFY (Name-only change) ====================

  const modifyDomain = async (dctId: string, newName: string, newCode?: string) => {
    try {
      const dom = domains.find(d => d.dctId === dctId);
      if (!dom) return;
      const updated: RegistryDomain = { ...dom, name: newName, ...(newCode ? { code: newCode } : {}) };
      await taxonomyApi.updateDomain(updated);
      setDomains((prev) => prev.map((d) => (d.dctId === dctId ? updated : d)));
      await logDctChange('edit', 'domain', dctId, dom.name, newName, `Domain name changed from '${dom.name}' to '${newName}'`);
      showToast('success', `Domain name updated to '${newName}'.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to modify domain.');
    }
  };

  const modifyCategory = async (dctId: string, newName: string, newPk?: string) => {
    try {
      const cat = categories.find(c => c.dctId === dctId);
      if (!cat) return;
      const updated: RegistryCategory = { ...cat, name: newName, ...(newPk ? { pk: newPk } : {}) };
      await taxonomyApi.updateCategory(updated);
      setCategories((prev) => prev.map((c) => (c.dctId === dctId ? updated : c)));
      await logDctChange('edit', 'category', dctId, cat.name, newName, `Category name changed from '${cat.name}' to '${newName}'`);
      showToast('success', `Category name updated to '${newName}'.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to modify category.');
    }
  };

  const modifyType = async (dctId: string, newName: string, newPk?: string) => {
    try {
      const typ = types.find(t => t.dctId === dctId);
      if (!typ) return;
      const updated: RegistryType = { ...typ, name: newName, ...(newPk ? { pk: newPk } : {}) };
      await taxonomyApi.updateType(updated);
      setTypes((prev) => prev.map((t) => (t.dctId === dctId ? updated : t)));
      await logDctChange('edit', 'type', dctId, typ.name, newName, `Type name changed from '${typ.name}' to '${newName}'`);
      showToast('success', `Type name updated to '${newName}'.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to modify type.');
    }
  };

  // ==================== RECOVERY ====================

  const recoverArchivedDct = async (archiveId: string) => {
    try {
      const archived = dctArchive.find(a => a.id === archiveId);
      if (!archived) return;
      
      if (archived.dctType === 'domain') {
        const dom = domains.find(d => d.dctId === archived.dctId);
        if (dom) {
          await taxonomyApi.updateDomainStatus(dom.dctId, 'active');
          setDomains((prev) => prev.map((d) => (d.dctId === dom.dctId ? { ...d, status: 'active' } : d)));
        }
      } else if (archived.dctType === 'category') {
        const cat = categories.find(c => c.dctId === archived.dctId);
        if (cat) {
          await taxonomyApi.updateCategoryStatus(cat.dctId, 'active');
          setCategories((prev) => prev.map((c) => (c.dctId === cat.dctId ? { ...c, status: 'active' } : c)));
        }
      } else if (archived.dctType === 'type') {
        const typ = types.find(t => t.dctId === archived.dctId);
        if (typ) {
          await taxonomyApi.updateTypeStatus(typ.dctId, 'active');
          setTypes((prev) => prev.map((t) => (t.dctId === typ.dctId ? { ...t, status: 'active' } : t)));
        }
      }
      
      setDctArchive((prev) => prev.filter((a) => a.id !== archiveId));
      await logDctChange('edit', archived.dctType, archived.dctId, 'stopped', 'active', `Recovered '${archived.originalName}' from archive`);
      showToast('success', `'${archived.originalName}' recovered from archive.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to recover archived DCT.');
    }
  };

  const permanentlyDeleteArchivedDct = async (archiveId: string) => {
    if (!confirm('Permanently delete this archived DCT? This cannot be undone.')) return;
    
    try {
      const archived = dctArchive.find(a => a.id === archiveId);
      setDctArchive((prev) => prev.filter((a) => a.id !== archiveId));
      
      if (archived) {
        if (archived.dctType === 'domain') {
          await taxonomyApi.deleteDomain(archived.dctId);
        } else if (archived.dctType === 'category') {
          await taxonomyApi.deleteCategory(archived.dctId);
        } else if (archived.dctType === 'type') {
          await taxonomyApi.deleteType(archived.dctId);
        }
        await logDctChange('delete', archived.dctType, archived.dctId, archived.originalName || '', 'deleted', 'Permanently deleted from archive');
      }
      showToast('warning', 'Archived DCT permanently deleted.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to permanently delete.');
    }
  };

  // DCT Master-Admin Approval Queue methods
  const submitForApproval = async (change: Omit<PendingDctChange, 'id' | 'submittedAt' | 'status'>) => {
    try {
      const newChange: PendingDctChange = {
        ...change,
        id: `PEND-DCT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      };
      const updated = [...pendingDctChanges, newChange];
      setPendingDctChanges(updated);
      localStorage.setItem('pendingDctChanges', JSON.stringify(updated));
      showToast('info', 'DCT change submitted for master-admin approval.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to submit DCT change for approval.');
    }
  };

  const approveDctChange = async (changeId: string, reviewedBy: string, notes?: string) => {
    try {
      const change = pendingDctChanges.find(c => c.id === changeId);
      if (!change) throw new Error('Change not found');
      
      const updated = pendingDctChanges.map(c => 
        c.id === changeId 
          ? { ...c, status: 'approved' as const, reviewedBy, reviewedAt: new Date().toISOString(), reviewNotes: notes }
          : c
      );
      setPendingDctChanges(updated);
      localStorage.setItem('pendingDctChanges', JSON.stringify(updated));
      showToast('success', `DCT change approved by ${reviewedBy}.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to approve DCT change.');
    }
  };

  const rejectDctChange = async (changeId: string, reviewedBy: string, notes?: string) => {
    try {
      const updated = pendingDctChanges.map(c => 
        c.id === changeId 
          ? { ...c, status: 'rejected' as const, reviewedBy, reviewedAt: new Date().toISOString(), reviewNotes: notes }
          : c
      );
      setPendingDctChanges(updated);
      localStorage.setItem('pendingDctChanges', JSON.stringify(updated));
      showToast('info', `DCT change rejected by ${reviewedBy}.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to reject DCT change.');
    }
  };

  const getPendingDctChanges = () => pendingDctChanges;

  // NEW: Staging methods
  const getStagingEntities = () => stagingEntities;
  const getStagingNonEntities = () => stagingNonEntities;

  const createStagingEntity = async (entity: Omit<StagingEntity, 'id' | 'uploadedAt'>) => {
    try {
      const newEntity: StagingEntity = {
        ...entity,
        id: `STAGE-ENT-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };
      setStagingEntities((prev) => [...prev, newEntity]);
      showToast('success', `Entity '${entity.entity_name}' added to staging. Awaiting approval.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to create staging entity '${entity.entity_name}'.`);
    }
  };

  const createStagingNonEntity = async (nonEntity: Omit<StagingNonEntity, 'id' | 'uploadedAt'>) => {
    try {
      const newNonEntity: StagingNonEntity = {
        ...nonEntity,
        id: `STAGE-NENT-${Date.now()}`,
        uploadedAt: new Date().toISOString(),
      };
      setStagingNonEntities((prev) => [...prev, newNonEntity]);
      showToast('success', `Non-Entity '${nonEntity.non_entity_name}' added to staging. Awaiting approval.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to create staging non-entity '${nonEntity.non_entity_name}'.`);
    }
  };

  const approveStagingEntity = async (id: string) => {
    try {
      setStagingEntities((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'approved' as const } : e))
      );
      showToast('success', 'Entity approved. Ready for geo/zone assignment.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to approve entity.');
    }
  };

  const approveStagingNonEntity = async (id: string) => {
    try {
      setStagingNonEntities((prev) =>
        prev.map((ne) => (ne.id === id ? { ...ne, status: 'approved' as const } : ne))
      );
      showToast('success', 'Non-Entity approved. Ready for geo assignment.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to approve non-entity.');
    }
  };

  const rejectStagingEntity = async (id: string) => {
    try {
      setStagingEntities((prev) => prev.filter((e) => e.id !== id));
      showToast('info', 'Entity rejected and removed from staging.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to reject entity.');
    }
  };

  const rejectStagingNonEntity = async (id: string) => {
    try {
      setStagingNonEntities((prev) => prev.filter((ne) => ne.id !== id));
      showToast('info', 'Non-Entity rejected and removed from staging.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to reject non-entity.');
    }
  };

  // NEW: Registry methods
  const getRegistryEntities = () => registryEntities;
  const getRegistryNonEntities = () => registryNonEntities;

  const assignEntityToRegistry = async (
    stagingId: string,
    geoData: GeoData,
    hierarchy: BranchHierarchy
  ) => {
    try {
      const stagingEntity = stagingEntities.find((e) => e.id === stagingId);
      if (!stagingEntity) {
        throw new Error('Staging entity not found');
      }

      // Generate entity PK
      const entityPk = `ENT-${String(Date.now()).slice(-6)}`;

      // Create registry entity
      const registryEntity: RegistryEntity = {
        entity_name: stagingEntity.entity_name,
        phone: stagingEntity.phone,
        domain_code: stagingEntity.domain_code,
        category_id: stagingEntity.category_id,
        roles: stagingEntity.roles,
        status: 'approved',
        entity_pk: entityPk,
        zone_pk: geoData.zone_pk!,
        stateId: geoData.stateId,
        districtId: geoData.districtId,
        talukId: geoData.talukId,
        cityVillageId: geoData.cityVillageId || '',
        areaId: geoData.areaId || '',
        streetId: geoData.streetId || '',
        substreetId: geoData.substreetId || null,
        assignedAt: new Date().toISOString(),
        assignedBy: 'admin', // TODO: Get from auth context
        domain: hierarchy.domain,
        category: hierarchy.category,
        type: hierarchy.type,
        linkedAssets: [],
      };

      const activeEntity: ActiveEntity = {
        entity_pk: entityPk,
        entity_name: registryEntity.entity_name,
        phone: registryEntity.phone,
        stateId: registryEntity.stateId,
        districtId: registryEntity.districtId,
        talukId: registryEntity.talukId,
        cityVillageId: registryEntity.cityVillageId,
        areaId: registryEntity.areaId,
        streetId: registryEntity.streetId,
        substreetId: registryEntity.substreetId,
        zone_pk: registryEntity.zone_pk,
        primary_domain: registryEntity.domain,
        secondary_domains: [],
        category_pk: registryEntity.category,
        category_name: '',
        type_pk: registryEntity.type,
        visibility_type: 'Public',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        website_zone_entity_id: null,
        roles: registryEntity.roles,
        linkedAssets: [],
      };

      setRegistryEntities((prev) => [...prev, registryEntity]);
      setActiveEntities((prev) => [...prev, activeEntity]);

      // Remove from staging
      setStagingEntities((prev) => prev.filter((e) => e.id !== stagingId));

      showToast('success', `Entity '${registryEntity.entity_name}' assigned to registry (${entityPk}).`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to assign entity to registry.');
    }
  };

  const assignNonEntityToRegistry = async (
    stagingId: string,
    geoData: GeoData,
    hierarchy: BranchHierarchy
  ) => {
    try {
      const stagingNonEntity = stagingNonEntities.find((ne) => ne.id === stagingId);
      if (!stagingNonEntity) {
        throw new Error('Staging non-entity not found');
      }

      // Generate non-entity PK
      const nonEntityPk = `NENT-${String(Date.now()).slice(-6)}`;

      // Create registry non-entity
      const registryNonEntity: RegistryNonEntity = {
        non_entity_name: stagingNonEntity.non_entity_name,
        domain_code: stagingNonEntity.domain_code,
        category_id: stagingNonEntity.category_id,
        status: 'approved',
        non_entity_pk: nonEntityPk,
        stateId: geoData.stateId,
        districtId: geoData.districtId,
        talukId: geoData.talukId,
        cityVillageId: geoData.cityVillageId,
        areaId: geoData.areaId,
        streetId: geoData.streetId,
        substreetId: geoData.substreetId,
        zone_pk: geoData.zone_pk,
        assignedAt: new Date().toISOString(),
        assignedBy: 'admin', // TODO: Get from auth context
        domain: hierarchy.domain,
        category: hierarchy.category,
        type: hierarchy.type,
        linkedEntities: {},
      };

      const nonEntity: NonEntity = {
        non_entity_pk: nonEntityPk,
        non_entity_name: registryNonEntity.non_entity_name,
        stateId: registryNonEntity.stateId,
        districtId: registryNonEntity.districtId,
        talukId: registryNonEntity.talukId,
        cityVillageId: registryNonEntity.cityVillageId,
        areaId: registryNonEntity.areaId,
        streetId: registryNonEntity.streetId,
        substreetId: registryNonEntity.substreetId,
        zone_pk: registryNonEntity.zone_pk,
        primary_domain: registryNonEntity.domain,
        secondary_domains: [],
        category_pk: registryNonEntity.category,
        category_name: '',
        type_pk: registryNonEntity.type,
        visibility_type: 'Public',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        website_zone_entity_id: null,
        linkedEntities: {},
      };

      setRegistryNonEntities((prev) => [...prev, registryNonEntity]);
      setNonEntities((prev) => [...prev, nonEntity]);

      // Remove from staging
      setStagingNonEntities((prev) => prev.filter((ne) => ne.id !== stagingId));

      showToast('success', `Non-Entity '${registryNonEntity.non_entity_name}' assigned to registry (${nonEntityPk}).`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to assign non-entity to registry.');
    }
  };

  const moveEntityBranch = async (
    entityPk: string,
    from: BranchHierarchy,
    to: BranchHierarchy
  ) => {
    try {
      setRegistryEntities((prev) =>
        prev.map((e) =>
          e.entity_pk === entityPk
            ? { ...e, domain: to.domain, category: to.category, type: to.type }
            : e
        )
      );
      setActiveEntities((prev) =>
        prev.map((e) =>
          e.entity_pk === entityPk
            ? { ...e, primary_domain: to.domain, category_pk: to.category, type_pk: to.type }
            : e
        )
      );
      showToast('success', `Entity branch moved from ${from.category} to ${to.category}.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to move entity branch.');
    }
  };

  const moveNonEntityBranch = async (
    nonEntityPk: string,
    from: BranchHierarchy,
    to: BranchHierarchy
  ) => {
    try {
      setRegistryNonEntities((prev) =>
        prev.map((ne) =>
          ne.non_entity_pk === nonEntityPk
            ? { ...ne, domain: to.domain, category: to.category, type: to.type }
            : ne
        )
      );
      setNonEntities((prev) =>
        prev.map((ne) =>
          ne.non_entity_pk === nonEntityPk
            ? { ...ne, primary_domain: to.domain, category_pk: to.category, type_pk: to.type }
            : ne
        )
      );
      showToast('success', `Non-Entity branch moved from ${from.category} to ${to.category}.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to move non-entity branch.');
    }
  };

  // Person actions
  const createPerson = async (person: Person) => {
    try {
      await personApi.create(person);
      setPersons((prev) => [...prev, person]);
      showToast('success', `Person '${person.name}' successfully created as ${person.person_pk}.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to create Person '${person.name}'.`);
    }
  };

  const updatePersonEntities = async (person_pk: string, entities: PersonEntityLink[]) => {
    try {
      await personApi.updateEntities(person_pk, entities);
      setPersons((prev) =>
        prev.map((p) => (p.person_pk === person_pk ? { ...p, entities } : p))
      );
      showToast('success', 'Person entity links updated.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to update person entities.');
    }
  };

  const addNonEntityToPerson = async (person_pk: string, non_entity_pk: string) => {
    try {
      await personApi.addNonEntity(person_pk, non_entity_pk);
      setPersons((prev) =>
        prev.map((p) =>
          p.person_pk === person_pk
            ? { ...p, non_entities: [...p.non_entities, non_entity_pk] }
            : p
        )
      );
      showToast('success', `Non-Entity ${non_entity_pk} added to Person.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to add non-entity to person.');
    }
  };

  const removeNonEntityFromPerson = async (person_pk: string, non_entity_pk: string) => {
    try {
      await personApi.removeNonEntity(person_pk, non_entity_pk);
      setPersons((prev) =>
        prev.map((p) =>
          p.person_pk === person_pk
            ? { ...p, non_entities: p.non_entities.filter((n) => n !== non_entity_pk) }
            : p
        )
      );
      showToast('success', `Non-Entity ${non_entity_pk} removed from Person.`);
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to remove non-entity from person.');
    }
  };

  const stopPerson = async (person_pk: string, reason: string) => {
    try {
      const person = persons.find((p) => p.person_pk === person_pk);
      if (person) {
        const logEntry = {
          status: 'stopped' as const,
          reason,
          changedAt: new Date().toISOString(),
          changedBy: 'admin',
        };
        await personApi.updateStatus(person_pk, 'stopped', logEntry);
        setPersons((prev) =>
          prev.map((p) =>
            p.person_pk === person_pk
              ? { ...p, status: 'stopped', statusLog: [...p.statusLog, logEntry] }
              : p
          )
        );
        showToast('warning', `Person '${person.name}' stopped. Reason: ${reason}`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to stop person.');
    }
  };

  const recoverPerson = async (person_pk: string, reason: string) => {
    try {
      const person = persons.find((p) => p.person_pk === person_pk);
      if (person) {
        const logEntry = {
          status: 'active' as const,
          reason,
          changedAt: new Date().toISOString(),
          changedBy: 'admin',
        };
        await personApi.updateStatus(person_pk, 'active', logEntry);
        setPersons((prev) =>
          prev.map((p) =>
            p.person_pk === person_pk
              ? { ...p, status: 'active', statusLog: [...p.statusLog, logEntry] }
              : p
          )
        );
        showToast('success', `Person '${person.name}' recovered. Reason: ${reason}`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to recover person.');
    }
  };

  const updatePersonParent = async (person_pk: string, parent_person_pk: string | null) => {
    try {
      await personApi.updateParent(person_pk, parent_person_pk);
      setPersons((prev) =>
        prev.map((p) =>
          p.person_pk === person_pk ? { ...p, parent_person_pk } : p
        )
      );
      showToast('success', parent_person_pk ? 'Parent person linked.' : 'Parent person unlinked.');
    } catch (err) {
      console.error(err);
      showToast('warning', 'Failed to update person parent.');
    }
  };

  const value: DataContextType = {
    isLoading,
    states,
    districts,
    taluks,
    cities,
    areas,
    streets,
    substreets,
    zoneRefs,
    sites,
    activeEntities,
    pendingEntities,
    nonEntities,
    domains,
    categories,
    types,
    addCity,
    addArea,
    addStreet,
    addSubstreet,
    updateZone,
    refreshGeoData,
    refreshAreas,
    refreshStreets,
    getDistrictsByState,
    getTaluksByDistrict,
    getCitiesByTaluk,
    addSite,
    updateSite,
    addEntity,
    updateEntity,
    stopEntity,
    recoverEntity,
    refreshActiveEntities,
    refreshNonEntities,
    syncPendingEntities,
    commitApproved,
    // NEW: Staging methods
    getStagingEntities,
    getStagingNonEntities,
    createStagingEntity,
    createStagingNonEntity,
    approveStagingEntity,
    approveStagingNonEntity,
    rejectStagingEntity,
    rejectStagingNonEntity,
    // NEW: Registry methods
    getRegistryEntities,
    getRegistryNonEntities,
    assignEntityToRegistry,
    assignNonEntityToRegistry,
    moveEntityBranch,
    moveNonEntityBranch,
    addNonEntity,
    updateNonEntity,
    stopNonEntity,
    recoverNonEntity,
    addDomain,
    updateDomain,
    stopDomain,
    recoverDomain,
    addCategory,
    updateCategory,
    stopCategory,
    recoverCategory,
    addType,
    updateType,
    stopType,
    recoverType,
    redirectEntitiesFromDomain,
    redirectNonEntitiesFromDomain,
    redirectEntitiesFromCategory,
    redirectNonEntitiesFromCategory,
    redirectEntitiesFromType,
    redirectNonEntitiesFromType,
splitDomain,
     splitCategory,
     splitType,
     convertDomain,
     convertCategory,
     convertType,
     mergeDomains,
     mergeCategories,
     mergeTypes,
     modifyDomain,
     modifyCategory,
     modifyType,
dctChanges,
      dctArchive,
      pendingDctChanges,
      getDctChanges: () => dctChanges,
      clearDctChanges: () => setDctChanges([]),
      recoverArchivedDct,
      permanentlyDeleteArchivedDct,
      submitForApproval,
      approveDctChange,
      rejectDctChange,
      getPendingDctChanges,
      showToast,
   };

  return (
    <DataContext.Provider value={value}>
      {isLoading ? (
        <LoadingSpinner 
          fullScreen 
          text="Initializing L1 Identity Registry..." 
        />
      ) : (
        children
      )}
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500/90 text-white'
                : toast.type === 'warning'
                ? 'bg-amber-500/90 text-white'
                : 'bg-blue-500/90 text-white'
            }`}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
