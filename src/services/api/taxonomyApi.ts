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
      return await seedCollectionIfEmpty<RegistryDomain>('domains', seedData, 'dctId');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createDomain(domain: RegistryDomain): Promise<RegistryDomain> {
    try {
      await saveDoc('domains', domain.dctId, domain);
      return domain;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateDomain(domain: RegistryDomain): Promise<RegistryDomain> {
    try {
      await saveDoc('domains', domain.dctId, domain);
      return domain;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateDomainStatus(dctId: string, status: 'active' | 'stopped'): Promise<void> {
    try {
      const domains = await this.getDomains();
      const domain = domains.find(d => d.dctId === dctId);
      if (domain) {
        await saveDoc('domains', dctId, { ...domain, status });
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
      return await seedCollectionIfEmpty<RegistryCategory>('categories', seedData, 'dctId');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createCategory(category: RegistryCategory): Promise<RegistryCategory> {
    try {
      await saveDoc('categories', category.dctId, category);
      return category;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateCategory(category: RegistryCategory): Promise<RegistryCategory> {
    try {
      await saveDoc('categories', category.dctId, category);
      return category;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateCategoryStatus(dctId: string, status: 'active' | 'stopped'): Promise<void> {
    try {
      const categories = await this.getCategories();
      const category = categories.find(c => c.dctId === dctId);
      if (category) {
        await saveDoc('categories', dctId, { ...category, status });
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
      return await seedCollectionIfEmpty<RegistryType>('types', seedData, 'dctId');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async createType(type: RegistryType): Promise<RegistryType> {
    try {
      await saveDoc('types', type.dctId, type);
      return type;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateType(type: RegistryType): Promise<RegistryType> {
    try {
      await saveDoc('types', type.dctId, type);
      return type;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateTypeStatus(dctId: string, status: 'active' | 'stopped'): Promise<void> {
    try {
      const types = await this.getTypes();
      const type = types.find(t => t.dctId === dctId);
      if (type) {
        await saveDoc('types', dctId, { ...type, status });
      }
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteDomain(dctId: string): Promise<void> {
    try {
      const { deleteDocById } = await import('../../lib/firebase');
      await deleteDocById('domains', dctId);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteCategory(dctId: string): Promise<void> {
    try {
      const { deleteDocById } = await import('../../lib/firebase');
      await deleteDocById('categories', dctId);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async deleteType(dctId: string): Promise<void> {
    try {
      const { deleteDocById } = await import('../../lib/firebase');
      await deleteDocById('types', dctId);
    } catch (error) {
      return handleApiError(error);
    }
  },
};
