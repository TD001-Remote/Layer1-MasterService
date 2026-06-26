/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fetchCollection, saveDoc, seedCollectionIfEmpty } from '../../lib/firebase';
import { SetSite } from '../../types';
import { handleApiError } from './api';

export const siteApi = {
  async getAll(): Promise<SetSite[]> {
    try {
      return await fetchCollection<SetSite>('sites');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seed(seedData: SetSite[]): Promise<SetSite[]> {
    try {
      return await seedCollectionIfEmpty<SetSite>('sites', seedData, 'site_id');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async create(site: SetSite): Promise<SetSite> {
    try {
      await saveDoc('sites', site.site_id, site);
      return site;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async update(site: SetSite): Promise<SetSite> {
    try {
      await saveDoc('sites', site.site_id, site);
      return site;
    } catch (error) {
      return handleApiError(error);
    }
  },
};
