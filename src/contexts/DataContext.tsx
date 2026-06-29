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
import { geoApi, siteApi, entityApi, pendingApi, nonEntityApi, taxonomyApi } from '../services/api';

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

  // Actions - Sites
  addSite: (site: SetSite) => Promise<void>;
  updateSite: (site: SetSite) => Promise<void>;

  // Actions - Entities
  addEntity: (entity: ActiveEntity) => Promise<void>;
  updateEntity: (entity: ActiveEntity) => Promise<void>;
  stopEntity: (entityPk: string) => Promise<void>;
  recoverEntity: (entityPk: string) => Promise<void>;

  // Actions - Pending
  syncPendingEntities: (records: PendingEntity[]) => Promise<void>;
  commitApproved: (approvedRecords: PendingEntity[]) => Promise<void>;

  // Actions - Non-entities
  addNonEntity: (nonEntity: NonEntity) => Promise<void>;
  updateNonEntity: (nonEntity: NonEntity) => Promise<void>;
  stopNonEntity: (pk: string) => Promise<void>;
  recoverNonEntity: (pk: string) => Promise<void>;

  // Actions - Taxonomy
  addDomain: (domain: RegistryDomain) => Promise<void>;
  updateDomain: (domain: RegistryDomain) => Promise<void>;
  stopDomain: (code: string) => Promise<void>;
  recoverDomain: (code: string) => Promise<void>;

  addCategory: (category: RegistryCategory) => Promise<void>;
  updateCategory: (category: RegistryCategory) => Promise<void>;
  stopCategory: (pk: string) => Promise<void>;
  recoverCategory: (pk: string) => Promise<void>;

  addType: (type: RegistryType) => Promise<void>;
  updateType: (type: RegistryType) => Promise<void>;
  stopType: (pk: string) => Promise<void>;
  recoverType: (pk: string) => Promise<void>;

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

  // Taxonomy
  const [domains, setDomains] = useState<RegistryDomain[]>([]);
  const [categories, setCategories] = useState<RegistryCategory[]>([]);
  const [types, setTypes] = useState<RegistryType[]>([]);

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'info' | 'warning'; message: string } | null>(null);

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

        // Load sites
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
        console.error('Firebase syncing error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initFirebase();
  }, []);

  // Recalculate zone refs when geographic data changes
  useEffect(() => {
    if (cities.length > 0) {
      const refs = buildDynamicZoneRefs(streets, areas, cities, substreets, taluks);
      setZoneRefs(refs);
    }
  }, [streets, areas, cities, substreets, taluks]);

  // Toast helper
  const showToast = (type: 'success' | 'info' | 'warning', message: string) => {
    setToast({ type, message });
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
      setActiveEntities((prev) => [...prev, updated]);
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
      console.error('Staging synchronization error:', err);
      showToast('warning', 'Failed to synchronize staging area with database.');
    }
  };

  const commitApproved = async (approvedRecords: PendingEntity[]) => {
    if (approvedRecords.length === 0) return;

    let currentEntityNum = activeEntities.length;
    let currentNonEntityNum = nonEntities.length;

    try {
      const newlyMigratedEntities: ActiveEntity[] = [];
      const newlyMigratedNonEntities: NonEntity[] = [];
      
      for (const p of approvedRecords) {
        if (p.record_type === 'entity') {
          // Handle ENTITY records - require full zone
          currentEntityNum++;
          const entPk = `ENT-${String(currentEntityNum).padStart(6, '0')}`;
          const relativeZone = zoneRefs.find((z) => z.zone_pk === p.target_zone_pk);

          if (!relativeZone) {
            console.error(`Zone not found for entity: ${p.entity_name}`);
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
          };

          await entityApi.create(docObj);
          newlyMigratedEntities.push(docObj);
          
        } else if (p.record_type === 'non-entity') {
          // Handle NON-ENTITY records - GEO only, zone optional
          currentNonEntityNum++;
          const nonEntPk = `NENT-${String(currentNonEntityNum).padStart(6, '0')}`;
          
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
            cityVillageId: p.cityVillageId || '',
            areaId: p.areaId || '',
            streetId: p.streetId || '',
            substreetId: p.substreetId || null,
            zone_pk: zone_pk,
            primary_domain: p.primary_domain,
            secondary_domains: [],
            category_pk: p.category_pk,
            category_name: p.category_name,
            type_pk: p.type_pk || '',
            phone: p.phone,
            visibility_type: p.visibility_type,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            website_zone_entity_id: p.website_zone_entity_id || null,
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
      console.error('Commit failed:', err);
      showToast('warning', 'Promotion fails to synchronize. Ensure Cloud connectivity is active.');
    }
  };

  // Non-entity actions
  const addNonEntity = async (nent: NonEntity) => {
    try {
      const updated = { ...nent, status: 'active' as const };
      await nonEntityApi.create(updated);
      setNonEntities((prev) => [...prev, updated]);
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

  // Taxonomy actions - Domains
  const addDomain = async (dom: RegistryDomain) => {
    try {
      const updated = { ...dom, status: 'active' as const };
      await taxonomyApi.createDomain(updated);
      setDomains((prev) => [...prev, updated]);
      showToast('success', `Domain L1 '${dom.name}' successfully registered.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to register Domain '${dom.name}'.`);
    }
  };

  const updateDomain = async (dom: RegistryDomain) => {
    try {
      await taxonomyApi.updateDomain(dom);
      setDomains((prev) => prev.map((d) => (d.code === dom.code ? dom : d)));
      showToast('success', `Domain L1 '${dom.name}' updated successfully.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to update Domain '${dom.name}'.`);
    }
  };

  const stopDomain = async (code: string) => {
    try {
      const dom = domains.find((d) => d.code === code);
      if (dom) {
        await taxonomyApi.updateDomainStatus(code, 'stopped');
        setDomains((prev) => prev.map((d) => (d.code === code ? { ...d, status: 'stopped' } : d)));
        showToast('warning', `Domain L1 '${dom.name}' set to stopped.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to stop Domain '${code}'.`);
    }
  };

  const recoverDomain = async (code: string) => {
    try {
      const dom = domains.find((d) => d.code === code);
      if (dom) {
        await taxonomyApi.updateDomainStatus(code, 'active');
        setDomains((prev) => prev.map((d) => (d.code === code ? { ...d, status: 'active' } : d)));
        showToast('success', `Domain L1 '${dom.name}' successfully recovered.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to recover Domain '${code}'.`);
    }
  };

  // Taxonomy actions - Categories
  const addCategory = async (cat: RegistryCategory) => {
    try {
      const updated = { ...cat, status: 'active' as const };
      await taxonomyApi.createCategory(updated);
      setCategories((prev) => [...prev, updated]);
      showToast('success', `Category L2 '${cat.name}' successfully registered.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to register Category '${cat.name}'.`);
    }
  };

  const updateCategory = async (cat: RegistryCategory) => {
    try {
      await taxonomyApi.updateCategory(cat);
      setCategories((prev) => prev.map((c) => (c.pk === cat.pk ? cat : c)));
      showToast('success', `Category L2 '${cat.name}' updated successfully.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to update Category '${cat.name}'.`);
    }
  };

  const stopCategory = async (pk: string) => {
    try {
      const cat = categories.find((c) => c.pk === pk);
      if (cat) {
        await taxonomyApi.updateCategoryStatus(pk, 'stopped');
        setCategories((prev) => prev.map((c) => (c.pk === pk ? { ...c, status: 'stopped' } : c)));
        showToast('warning', `Category L2 '${cat.name}' set to stopped.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to stop Category '${pk}'.`);
    }
  };

  const recoverCategory = async (pk: string) => {
    try {
      const cat = categories.find((c) => c.pk === pk);
      if (cat) {
        await taxonomyApi.updateCategoryStatus(pk, 'active');
        setCategories((prev) => prev.map((c) => (c.pk === pk ? { ...c, status: 'active' } : c)));
        showToast('success', `Category L2 '${cat.name}' successfully recovered.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to recover Category '${pk}'.`);
    }
  };

  // Taxonomy actions - Types
  const addType = async (typ: RegistryType) => {
    try {
      const updated = { ...typ, status: 'active' as const };
      await taxonomyApi.createType(updated);
      setTypes((prev) => [...prev, updated]);
      showToast('success', `Class Type L3 '${typ.name}' successfully registered.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to register Class Type '${typ.name}'.`);
    }
  };

  const updateType = async (typ: RegistryType) => {
    try {
      await taxonomyApi.updateType(typ);
      setTypes((prev) => prev.map((t) => (t.pk === typ.pk ? typ : t)));
      showToast('success', `Class Type L3 '${typ.name}' updated successfully.`);
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to update Class Type '${typ.name}'.`);
    }
  };

  const stopType = async (pk: string) => {
    try {
      const typ = types.find((t) => t.pk === pk);
      if (typ) {
        await taxonomyApi.updateTypeStatus(pk, 'stopped');
        setTypes((prev) => prev.map((t) => (t.pk === pk ? { ...t, status: 'stopped' } : t)));
        showToast('warning', `Class Type L3 '${typ.name}' set to stopped.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to stop Class Type '${pk}'.`);
    }
  };

  const recoverType = async (pk: string) => {
    try {
      const typ = types.find((t) => t.pk === pk);
      if (typ) {
        await taxonomyApi.updateTypeStatus(pk, 'active');
        setTypes((prev) => prev.map((t) => (t.pk === pk ? { ...t, status: 'active' } : t)));
        showToast('success', `Class Type L3 '${typ.name}' successfully recovered.`);
      }
    } catch (err) {
      console.error(err);
      showToast('warning', `Failed to recover Class Type '${pk}'.`);
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
    addSite,
    updateSite,
    addEntity,
    updateEntity,
    stopEntity,
    recoverEntity,
    syncPendingEntities,
    commitApproved,
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
