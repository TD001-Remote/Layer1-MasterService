/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fetchCollection, saveDoc } from '../../lib/firebase';
import { Person, PersonEntityLink } from '../../types';
import { handleApiError } from './api';

export const personApi = {
  async getAll(): Promise<Person[]> {
    try {
      return await fetchCollection<Person>('persons');
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getById(person_pk: string): Promise<Person | undefined> {
    try {
      const persons = await fetchCollection<Person>('persons');
      return persons.find(p => p.person_pk === person_pk);
    } catch (error) {
      return handleApiError(error);
    }
  },

  async create(person: Person): Promise<Person> {
    try {
      await saveDoc('persons', person.person_pk, person);
      return person;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async update(person: Person): Promise<Person> {
    try {
      await saveDoc('persons', person.person_pk, person);
      return person;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateEntities(person_pk: string, entities: PersonEntityLink[]): Promise<void> {
    try {
      const persons = await this.getAll();
      const person = persons.find(p => p.person_pk === person_pk);
      if (person) {
        await saveDoc('persons', person_pk, { ...person, entities });
      }
    } catch (error) {
      return handleApiError(error);
    }
  },

  async addNonEntity(person_pk: string, non_entity_pk: string): Promise<void> {
    try {
      const persons = await this.getAll();
      const person = persons.find(p => p.person_pk === person_pk);
      if (person && !person.non_entities.includes(non_entity_pk)) {
        await saveDoc('persons', person_pk, {
          ...person,
          non_entities: [...person.non_entities, non_entity_pk],
        });
      }
    } catch (error) {
      return handleApiError(error);
    }
  },

  async removeNonEntity(person_pk: string, non_entity_pk: string): Promise<void> {
    try {
      const persons = await this.getAll();
      const person = persons.find(p => p.person_pk === person_pk);
      if (person) {
        await saveDoc('persons', person_pk, {
          ...person,
          non_entities: person.non_entities.filter(n => n !== non_entity_pk),
        });
      }
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateStatus(person_pk: string, status: 'active' | 'stopped', logEntry: Person['statusLog'][0]): Promise<void> {
    try {
      const persons = await this.getAll();
      const person = persons.find(p => p.person_pk === person_pk);
      if (person) {
        await saveDoc('persons', person_pk, {
          ...person,
          status,
          statusLog: [...person.statusLog, logEntry],
        });
      }
    } catch (error) {
      return handleApiError(error);
    }
  },

  async updateParent(person_pk: string, parent_person_pk: string | null): Promise<void> {
    try {
      const persons = await this.getAll();
      const person = persons.find(p => p.person_pk === person_pk);
      if (person) {
        await saveDoc('persons', person_pk, { ...person, parent_person_pk });
      }
    } catch (error) {
      return handleApiError(error);
    }
  },
};
