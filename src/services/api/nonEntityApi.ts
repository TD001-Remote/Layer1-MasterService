/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fetchCollection, saveDoc, seedCollectionIfEmpty } from '../../lib/firebase';
import { NonEntity } from '../../types';
import { handleApiError } from './api';

export const nonEntityApi = {
  async getAll(): Promise<NonEntity[]> {
    try {
      return await fetchCollection<NonEntity>('non_entities');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async seed(seedData: NonEntity[]): Promise<NonEntity[]> {
    try {
      return await seedCollectionIfEmpty<NonEntity>('non_entities', seedData, 'non_entity_pk');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async create(nonEntity: NonEntity): Promise<NonEntity> {
    try {
      await saveDoc('non_entities', nonEntity.non_entity_pk, nonEntity);
      return nonEntity;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async update(nonEntity: NonEntity): Promise<NonEntity> {
    try {
      await saveDoc('non_entities', nonEntity.non_entity_pk, nonEntity);
      return nonEntity;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateStatus(pk: string, status: 'active' | 'stopped'): Promise<void> {
    try {
      const nonEntities = await this.getAll();
      const nonEntity = nonEntities.find(n => n.non_entity_pk === pk);
      if (nonEntity) {
        await saveDoc('non_entities', pk, { ...nonEntity, status });
      }
    } catch (error) {
      return handleApiError(error);
    }
  },
};
