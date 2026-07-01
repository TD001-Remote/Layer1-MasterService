/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fetchCollection, saveDoc, seedCollectionIfEmpty, deleteDocById } from '../../lib/firebase';
import { CityVillage, Area, Street, SubStreet, GeoTaluk, GeoDistrict, GeoState } from '../../types';
import { handleApiError } from './api';

export const geoApi = {
  // GeoStates
  async getStates(): Promise<GeoState[]> {
    try {
      return await fetchCollection<GeoState>('states');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createState(state: GeoState): Promise<GeoState> {
    try {
      await saveDoc('states', state.id, state);
      return state;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateState(id: string, updates: Partial<GeoState>): Promise<GeoState> {
    try {
      const states = await fetchCollection<GeoState>('states');
      const state = states.find(s => s.id === id);
      if (!state) throw new Error('State not found');
      const updated = { ...state, ...updates };
      await saveDoc('states', id, updated);
      return updated;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteState(id: string): Promise<void> {
    try {
      await deleteDocById('states', id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seedStates(seedData: GeoState[]): Promise<GeoState[]> {
    try {
      return await seedCollectionIfEmpty<GeoState>('states', seedData, 'id');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // GeoDistricts
  async getDistricts(): Promise<GeoDistrict[]> {
    try {
      return await fetchCollection<GeoDistrict>('districts');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createDistrict(district: GeoDistrict): Promise<GeoDistrict> {
    try {
      await saveDoc('districts', district.id, district);
      return district;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateDistrict(id: string, updates: Partial<GeoDistrict>): Promise<GeoDistrict> {
    try {
      const districts = await fetchCollection<GeoDistrict>('districts');
      const district = districts.find(d => d.id === id);
      if (!district) throw new Error('District not found');
      const updated = { ...district, ...updates };
      await saveDoc('districts', id, updated);
      return updated;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteDistrict(id: string): Promise<void> {
    try {
      await deleteDocById('districts', id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seedDistricts(seedData: GeoDistrict[]): Promise<GeoDistrict[]> {
    try {
      return await seedCollectionIfEmpty<GeoDistrict>('districts', seedData, 'id');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // GeoTaluks
  async getTaluks(): Promise<GeoTaluk[]> {
    try {
      return await fetchCollection<GeoTaluk>('taluks');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createTaluk(taluk: GeoTaluk): Promise<GeoTaluk> {
    try {
      await saveDoc('taluks', taluk.id, taluk);
      return taluk;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateTaluk(id: string, updates: Partial<GeoTaluk>): Promise<GeoTaluk> {
    try {
      const taluks = await fetchCollection<GeoTaluk>('taluks');
      const taluk = taluks.find(t => t.id === id);
      if (!taluk) throw new Error('Taluk not found');
      const updated = { ...taluk, ...updates };
      await saveDoc('taluks', id, updated);
      return updated;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteTaluk(id: string): Promise<void> {
    try {
      await deleteDocById('taluks', id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seedTaluks(seedData: GeoTaluk[]): Promise<GeoTaluk[]> {
    try {
      return await seedCollectionIfEmpty<GeoTaluk>('taluks', seedData, 'id');
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Cities
  async getCities(): Promise<CityVillage[]> {
    try {
      return await fetchCollection<CityVillage>('cities');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seedCities(seedData: CityVillage[]): Promise<CityVillage[]> {
    try {
      return await seedCollectionIfEmpty<CityVillage>('cities', seedData, 'id');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createCity(city: CityVillage): Promise<CityVillage> {
    try {
      await saveDoc('cities', city.id, city);
      return city;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateCity(id: string, updates: Partial<CityVillage>): Promise<CityVillage> {
    try {
      const cities = await fetchCollection<CityVillage>('cities');
      const city = cities.find(c => c.id === id);
      if (!city) throw new Error('City not found');
      const updated = { ...city, ...updates };
      await saveDoc('cities', id, updated);
      return updated;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteCity(id: string): Promise<void> {
    try {
      await deleteDocById('cities', id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Areas
  async getAreas(): Promise<Area[]> {
    try {
      return await fetchCollection<Area>('areas');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seedAreas(seedData: Area[]): Promise<Area[]> {
    try {
      return await seedCollectionIfEmpty<Area>('areas', seedData, 'id');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createArea(area: Area): Promise<Area> {
    try {
      await saveDoc('areas', area.id, area);
      return area;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateArea(id: string, updates: Partial<Area>): Promise<Area> {
    try {
      const areas = await fetchCollection<Area>('areas');
      const area = areas.find(a => a.id === id);
      if (!area) throw new Error('Area not found');
      const updated = { ...area, ...updates };
      await saveDoc('areas', id, updated);
      return updated;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteArea(id: string): Promise<void> {
    try {
      await deleteDocById('areas', id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Streets
  async getStreets(): Promise<Street[]> {
    try {
      return await fetchCollection<Street>('streets');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seedStreets(seedData: Street[]): Promise<Street[]> {
    try {
      return await seedCollectionIfEmpty<Street>('streets', seedData, 'id');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createStreet(street: Street): Promise<Street> {
    try {
      await saveDoc('streets', street.id, street);
      return street;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateStreet(id: string, updates: Partial<Street>): Promise<Street> {
    try {
      const streets = await fetchCollection<Street>('streets');
      const street = streets.find(s => s.id === id);
      if (!street) throw new Error('Street not found');
      const updated = { ...street, ...updates };
      await saveDoc('streets', id, updated);
      return updated;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteStreet(id: string): Promise<void> {
    try {
      await deleteDocById('streets', id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Substreets
  async getSubstreets(): Promise<SubStreet[]> {
    try {
      return await fetchCollection<SubStreet>('substreets');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seedSubstreets(seedData: SubStreet[]): Promise<SubStreet[]> {
    try {
      return await seedCollectionIfEmpty<SubStreet>('substreets', seedData, 'id');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createSubstreet(substreet: SubStreet): Promise<SubStreet> {
    try {
      await saveDoc('substreets', substreet.id, substreet);
      return substreet;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateSubstreet(id: string, updates: Partial<SubStreet>): Promise<SubStreet> {
    try {
      const substreets = await fetchCollection<SubStreet>('substreets');
      const substreet = substreets.find(s => s.id === id);
      if (!substreet) throw new Error('Substreet not found');
      const updated = { ...substreet, ...updates };
      await saveDoc('substreets', id, updated);
      return updated;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteSubstreet(id: string): Promise<void> {
    try {
      await deleteDocById('substreets', id);
    } catch (error) {
      return handleApiError(error);
    }
  },
};