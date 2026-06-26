/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fetchCollection, saveDoc, seedCollectionIfEmpty } from '../../lib/firebase';
import { RegistryDomain, RegistryCategory, RegistryType } from '../../types';
import { handleApiError } from './api';

export const taxonomyApi = {
  // Domains
  async getDomains(): Promise<RegistryDomain[]> {
    try {
      return await fetchCollection<RegistryDomain>('domains');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seedDomains(seedData: RegistryDomain[]): Promise<RegistryDomain[]> {
    try {
      return await seedCollectionIfEmpty<RegistryDomain>('domains', seedData, 'code');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createDomain(domain: RegistryDomain): Promise<RegistryDomain> {
    try {
      await saveDoc('domains', domain.code, domain);
      return domain;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateDomain(domain: RegistryDomain): Promise<RegistryDomain> {
    try {
      await saveDoc('domains', domain.code, domain);
      return domain;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateDomainStatus(code: string, status: 'active' | 'stopped'): Promise<void> {
    try {
      const domains = await this.getDomains();
      const domain = domains.find(d => d.code === code);
      if (domain) {
        await saveDoc('domains', code, { ...domain, status });
      }
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Categories
  async getCategories(): Promise<RegistryCategory[]> {
    try {
      return await fetchCollection<RegistryCategory>('categories');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seedCategories(seedData: RegistryCategory[]): Promise<RegistryCategory[]> {
    try {
      return await seedCollectionIfEmpty<RegistryCategory>('categories', seedData, 'pk');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createCategory(category: RegistryCategory): Promise<RegistryCategory> {
    try {
      await saveDoc('categories', category.pk, category);
      return category;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateCategory(category: RegistryCategory): Promise<RegistryCategory> {
    try {
      await saveDoc('categories', category.pk, category);
      return category;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateCategoryStatus(pk: string, status: 'active' | 'stopped'): Promise<void> {
    try {
      const categories = await this.getCategories();
      const category = categories.find(c => c.pk === pk);
      if (category) {
        await saveDoc('categories', pk, { ...category, status });
      }
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Types
  async getTypes(): Promise<RegistryType[]> {
    try {
      return await fetchCollection<RegistryType>('types');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seedTypes(seedData: RegistryType[]): Promise<RegistryType[]> {
    try {
      return await seedCollectionIfEmpty<RegistryType>('types', seedData, 'pk');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createType(type: RegistryType): Promise<RegistryType> {
    try {
      await saveDoc('types', type.pk, type);
      return type;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateType(type: RegistryType): Promise<RegistryType> {
    try {
      await saveDoc('types', type.pk, type);
      return type;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateTypeStatus(pk: string, status: 'active' | 'stopped'): Promise<void> {
    try {
      const types = await this.getTypes();
      const type = types.find(t => t.pk === pk);
      if (type) {
        await saveDoc('types', pk, { ...type, status });
      }
    } catch (error) {
      return handleApiError(error);
    }
  },
};
