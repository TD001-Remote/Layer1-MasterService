/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fetchCollection, saveDoc, seedCollectionIfEmpty } from '../../lib/firebase';
import { ActiveEntity } from '../../types';
import { handleApiError } from './api';

export const entityApi = {
  async getAll(): Promise<ActiveEntity[]> {
    try {
      return await fetchCollection<ActiveEntity>('active_entities');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seed(seedData: ActiveEntity[]): Promise<ActiveEntity[]> {
    try {
      return await seedCollectionIfEmpty<ActiveEntity>('active_entities', seedData, 'entity_pk');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async create(entity: ActiveEntity): Promise<ActiveEntity> {
    try {
      await saveDoc('active_entities', entity.entity_pk, entity);
      return entity;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async update(entity: ActiveEntity): Promise<ActiveEntity> {
    try {
      await saveDoc('active_entities', entity.entity_pk, entity);
      return entity;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateStatus(entityPk: string, status: 'active' | 'stopped'): Promise<void> {
    try {
      const entities = await this.getAll();
      const entity = entities.find(e => e.entity_pk === entityPk);
      if (entity) {
        await saveDoc('active_entities', entityPk, { ...entity, status });
      }
    } catch (error) {
      return handleApiError(error);
    }
  },
};
