/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fetchCollection, saveDoc, deleteDocById } from '../../lib/firebase';
import { PendingEntity } from '../../types';
import { handleApiError } from './api';

export const pendingApi = {
  async getAll(): Promise<PendingEntity[]> {
    try {
      return await fetchCollection<PendingEntity>('pending_entities');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async create(pending: PendingEntity): Promise<PendingEntity> {
    try {
      await saveDoc('pending_entities', pending.id, pending);
      return pending;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async update(pending: PendingEntity): Promise<PendingEntity> {
    try {
      await saveDoc('pending_entities', pending.id, pending);
      return pending;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async delete(id: string): Promise<void> {
    try {
      await deleteDocById('pending_entities', id);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async syncAll(records: PendingEntity[]): Promise<void> {
    try {
      // Upsert all items in records
      for (const rec of records) {
        await saveDoc('pending_entities', rec.id, rec);
      }
    } catch (error) {
      return handleApiError(error);
    }
  },
};
