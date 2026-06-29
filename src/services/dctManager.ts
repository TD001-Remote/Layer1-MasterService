/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  RegistryDomain,
  RegistryCategory,
  RegistryType,
  ActiveEntity,
  NonEntity,
  RegistryEntity,
  RegistryNonEntity,
  DCTChangeRecord,
  DCTChangeAction,
} from '../types';
import { taxonomyApi } from './api/taxonomyApi';

export interface DCTManagerDeps {
  domains: RegistryDomain[];
  setDomains: (updater: RegistryDomain[] | ((prev: RegistryDomain[]) => RegistryDomain[])) => void;
  categories: RegistryCategory[];
  setCategories: (updater: RegistryCategory[] | ((prev: RegistryCategory[]) => RegistryCategory[])) => void;
  types: RegistryType[];
  setTypes: (updater: RegistryType[] | ((prev: RegistryType[]) => RegistryType[])) => void;
  activeEntities: ActiveEntity[];
  setActiveEntities: (updater: ActiveEntity[] | ((prev: ActiveEntity[]) => ActiveEntity[])) => void;
  nonEntities: NonEntity[];
  setNonEntities: (updater: NonEntity[] | ((prev: NonEntity[]) => NonEntity[])) => void;
  registryEntities: RegistryEntity[];
  setRegistryEntities: (updater: RegistryEntity[] | ((prev: RegistryEntity[]) => RegistryEntity[])) => void;
  registryNonEntities: RegistryNonEntity[];
  setRegistryNonEntities: (updater: RegistryNonEntity[] | ((prev: RegistryNonEntity[]) => RegistryNonEntity[])) => void;
  logDctChange: (record: Omit<DCTChangeRecord, 'id' | 'timestamp' | 'performedBy'> & { redirects?: DCTChangeRecord['redirects'] }) => void;
  showToast: (type: 'success' | 'info' | 'warning', message: string) => void;
}

export class DCTManager {
  constructor(private deps: DCTManagerDeps) {}

  // ==================== DOMAINS ====================

  async addDomain(domain: RegistryDomain) {
    try {
      const updated = { ...domain, status: 'active' as const, dctId: domain.dctId || `DCT-DOM-${String(Date.now()).slice(-6)}` };
      await taxonomyApi.createDomain(updated);
      this.deps.setDomains((prev) => [...prev, updated]);
      this.deps.logDctChange({
        action: 'edit',
        dctType: 'domain',
        dctId: updated.dctId,
        oldValue: 'created',
        newValue: updated.name,
        description: `Domain '${updated.name}' created`,
      });
      this.deps.showToast('success', `Domain L1 '${updated.name}' successfully registered.`);
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to register Domain '${domain.name}'.`);
      throw err;
    }
  }

  async updateDomain(domain: RegistryDomain) {
    try {
      await taxonomyApi.updateDomain(domain);
      const dctId = domain.dctId || domain.code;
      this.deps.setDomains((prev) => prev.map((d) => (d.dctId === dctId ? domain : d)));
      this.deps.logDctChange({
        action: 'edit',
        dctType: 'domain',
        dctId,
        oldValue: domain.name,
        newValue: domain.name,
        description: `Domain '${domain.name}' updated`,
      });
      this.deps.showToast('success', `Domain L1 '${domain.name}' updated successfully.`);
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to update Domain '${domain.name}'.`);
      throw err;
    }
  }

  async stopDomain(identifier: string, targetCode?: string) {
    try {
      const dom = this.deps.domains.find((d) => d.code === identifier || d.dctId === identifier);
      if (!dom) return;
      if (targetCode && targetCode !== dom.code) {
        await this.redirectEntitiesFromDomain(dom.code, targetCode);
        await this.redirectNonEntitiesFromDomain(dom.code, targetCode);
      }
      await taxonomyApi.updateDomainStatus(dom.dctId, 'stopped');
      this.deps.setDomains((prev) => prev.map((d) => (d.dctId === dom.dctId ? { ...d, status: 'stopped' } : d)));
      const entityCount = this.deps.activeEntities.filter((e) => e.primary_domain === dom.code).length;
      const nonEntityCount = this.deps.nonEntities.filter((n) => n.primary_domain === dom.code).length;
      const targetDomain = targetCode ? this.deps.domains.find((d) => d.code === targetCode) : undefined;
      this.deps.logDctChange({
        action: 'delete',
        dctType: 'domain',
        dctId: dom.dctId,
        oldValue: dom.name,
        newValue: 'stopped',
        description: `Domain '${dom.name}' set to stopped${targetDomain ? ` and redirected to '${targetDomain.name}'` : ''}.`,
        redirects: { entityCount, nonEntityCount, targetDctId: targetDomain?.dctId }
      });
      this.deps.showToast('warning', `Domain L1 '${dom.name}' set to stopped.`);
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to stop Domain '${identifier}'.`);
      throw err;
    }
  }

  async recoverDomain(identifier: string) {
    try {
      const dom = this.deps.domains.find((d) => d.code === identifier || d.dctId === identifier);
      if (dom) {
        await taxonomyApi.updateDomainStatus(dom.dctId, 'active');
        this.deps.setDomains((prev) => prev.map((d) => (d.dctId === dom.dctId ? { ...d, status: 'active' } : d)));
        this.deps.logDctChange({
          action: 'edit',
          dctType: 'domain',
          dctId: dom.dctId,
          oldValue: 'stopped',
          newValue: 'active',
          description: `Domain '${dom.name}' recovered`
        });
        this.deps.showToast('success', `Domain L1 '${dom.name}' successfully recovered.`);
      }
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to recover Domain '${identifier}'.`);
      throw err;
    }
  }

  // ==================== CATEGORIES ====================

  async addCategory(category: RegistryCategory) {
    try {
      const updated = { ...category, status: 'active' as const, dctId: category.dctId || `DCT-CAT-${String(Date.now()).slice(-6)}` };
      await taxonomyApi.createCategory(updated);
      this.deps.setCategories((prev) => [...prev, updated]);
      this.deps.logDctChange({
        action: 'edit',
        dctType: 'category',
        dctId: updated.dctId,
        oldValue: 'created',
        newValue: updated.name,
        description: `Category '${updated.name}' created`,
      });
      this.deps.showToast('success', `Category L2 '${category.name}' successfully registered.`);
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to register Category '${category.name}'.`);
      throw err;
    }
  }

  async updateCategory(category: RegistryCategory) {
    try {
      await taxonomyApi.updateCategory(category);
      const dctId = category.dctId || category.pk;
      this.deps.setCategories((prev) => prev.map((c) => (c.dctId === dctId ? category : c)));
      this.deps.logDctChange({
        action: 'edit',
        dctType: 'category',
        dctId,
        oldValue: category.name,
        newValue: category.name,
        description: `Category '${category.name}' updated`,
      });
      this.deps.showToast('success', `Category L2 '${category.name}' updated successfully.`);
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to update Category '${category.name}'.`);
      throw err;
    }
  }

  async stopCategory(identifier: string, targetPk?: string) {
    try {
      const cat = this.deps.categories.find((c) => c.pk === identifier || c.dctId === identifier);
      if (!cat) return;
      if (targetPk && targetPk !== cat.pk) {
        await this.redirectEntitiesFromCategory(cat.pk, targetPk);
        await this.redirectNonEntitiesFromCategory(cat.pk, targetPk);
      }
      await taxonomyApi.updateCategoryStatus(cat.dctId, 'stopped');
      this.deps.setCategories((prev) => prev.map((c) => (c.dctId === cat.dctId ? { ...c, status: 'stopped' } : c)));
      const entityCount = this.deps.activeEntities.filter((e) => e.category_pk === cat.pk).length;
      const nonEntityCount = this.deps.nonEntities.filter((n) => n.category_pk === cat.pk).length;
      const targetCat = targetPk ? this.deps.categories.find((c) => c.pk === targetPk) : undefined;
      this.deps.logDctChange({
        action: 'delete',
        dctType: 'category',
        dctId: cat.dctId,
        oldValue: cat.name,
        newValue: 'stopped',
        description: `Category '${cat.name}' set to stopped${targetCat ? ` and redirected to '${targetCat.name}'` : ''}.`,
        redirects: { entityCount, nonEntityCount, targetDctId: targetCat?.dctId }
      });
      this.deps.showToast('warning', `Category L2 '${cat.name}' set to stopped.`);
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to stop Category '${identifier}'.`);
      throw err;
    }
  }

  async recoverCategory(identifier: string) {
    try {
      const cat = this.deps.categories.find((c) => c.pk === identifier || c.dctId === identifier);
      if (cat) {
        await taxonomyApi.updateCategoryStatus(cat.dctId, 'active');
        this.deps.setCategories((prev) => prev.map((c) => (c.dctId === cat.dctId ? { ...c, status: 'active' } : c)));
        this.deps.logDctChange({
          action: 'edit',
          dctType: 'category',
          dctId: cat.dctId,
          oldValue: 'stopped',
          newValue: 'active',
          description: `Category '${cat.name}' recovered`
        });
        this.deps.showToast('success', `Category L2 '${cat.name}' successfully recovered.`);
      }
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to recover Category '${identifier}'.`);
      throw err;
    }
  }

  // ==================== TYPES ====================

  async addType(type: RegistryType) {
    try {
      const updated = { ...type, status: 'active' as const, dctId: type.dctId || `DCT-TYP-${String(Date.now()).slice(-6)}` };
      await taxonomyApi.createType(updated);
      this.deps.setTypes((prev) => [...prev, updated]);
      this.deps.logDctChange({
        action: 'edit',
        dctType: 'type',
        dctId: updated.dctId,
        oldValue: 'created',
        newValue: updated.name,
        description: `Type '${updated.name}' created`,
      });
      this.deps.showToast('success', `Class Type L3 '${type.name}' successfully registered.`);
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to register Class Type '${type.name}'.`);
      throw err;
    }
  }

  async updateType(type: RegistryType) {
    try {
      await taxonomyApi.updateType(type);
      const dctId = type.dctId || type.pk;
      this.deps.setTypes((prev) => prev.map((t) => (t.dctId === dctId ? type : t)));
      this.deps.logDctChange({
        action: 'edit',
        dctType: 'type',
        dctId,
        oldValue: type.name,
        newValue: type.name,
        description: `Type '${type.name}' updated`,
      });
      this.deps.showToast('success', `Class Type L3 '${type.name}' updated successfully.`);
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to update Class Type '${type.name}'.`);
      throw err;
    }
  }

  async stopType(identifier: string, targetPk?: string) {
    try {
      const typ = this.deps.types.find((t) => t.pk === identifier || t.dctId === identifier);
      if (!typ) return;
      if (targetPk && targetPk !== typ.pk) {
        await this.redirectEntitiesFromType(typ.pk, targetPk);
        await this.redirectNonEntitiesFromType(typ.pk, targetPk);
      }
      await taxonomyApi.updateTypeStatus(typ.dctId, 'stopped');
      this.deps.setTypes((prev) => prev.map((t) => (t.dctId === typ.dctId ? { ...t, status: 'stopped' } : t)));
      const entityCount = this.deps.activeEntities.filter((e) => e.type_pk === typ.pk).length;
      const nonEntityCount = this.deps.nonEntities.filter((n) => n.type_pk === typ.pk).length;
      const targetType = targetPk ? this.deps.types.find((t) => t.pk === targetPk) : undefined;
      this.deps.logDctChange({
        action: 'delete',
        dctType: 'type',
        dctId: typ.dctId,
        oldValue: typ.name,
        newValue: 'stopped',
        description: `Type '${typ.name}' set to stopped${targetType ? ` and redirected to '${targetType.name}'` : ''}.`,
        redirects: { entityCount, nonEntityCount, targetDctId: targetType?.dctId }
      });
      this.deps.showToast('warning', `Class Type L3 '${typ.name}' set to stopped.`);
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to stop Type '${identifier}'.`);
      throw err;
    }
  }

  async recoverType(identifier: string) {
    try {
      const typ = this.deps.types.find((t) => t.pk === identifier || t.dctId === identifier);
      if (typ) {
        await taxonomyApi.updateTypeStatus(typ.dctId, 'active');
        this.deps.setTypes((prev) => prev.map((t) => (t.dctId === typ.dctId ? { ...t, status: 'active' } : t)));
        this.deps.logDctChange({
          action: 'edit',
          dctType: 'type',
          dctId: typ.dctId,
          oldValue: 'stopped',
          newValue: 'active',
          description: `Type '${typ.name}' recovered`
        });
        this.deps.showToast('success', `Class Type L3 '${typ.name}' successfully recovered.`);
      }
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to recover Type '${identifier}'.`);
      throw err;
    }
  }

  // ==================== REDIRECTS ====================

  async redirectEntitiesFromDomain(oldCode: string, newCode: string) {
    try {
      const newDomain = this.deps.domains.find((d) => d.code === newCode);
      if (!newDomain) throw new Error('Target domain not found');
      this.deps.setActiveEntities((prev) =>
        prev.map((e) => (e.primary_domain === oldCode ? { ...e, primary_domain: newCode } : e))
      );
      this.deps.setRegistryEntities((prev) =>
        prev.map((e) => (e.domain === oldCode ? { ...e, domain: newCode } : e))
      );
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to redirect entities from domain '${oldCode}'.`);
      throw err;
    }
  }

  async redirectNonEntitiesFromDomain(oldCode: string, newCode: string) {
    try {
      const newDomain = this.deps.domains.find((d) => d.code === newCode);
      if (!newDomain) throw new Error('Target domain not found');
      this.deps.setNonEntities((prev) =>
        prev.map((n) => (n.primary_domain === oldCode ? { ...n, primary_domain: newCode } : n))
      );
      this.deps.setRegistryNonEntities((prev) =>
        prev.map((n) => (n.domain === oldCode ? { ...n, domain: newCode } : n))
      );
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to redirect non-entities from domain '${oldCode}'.`);
      throw err;
    }
  }

  async redirectEntitiesFromCategory(oldPk: string, newPk: string) {
    try {
      const newCategory = this.deps.categories.find((c) => c.pk === newPk);
      if (!newCategory) throw new Error('Target category not found');
      this.deps.setActiveEntities((prev) =>
        prev.map((e) => (e.category_pk === oldPk ? { ...e, category_pk: newPk, category_name: newCategory.name } : e))
      );
      this.deps.setRegistryEntities((prev) =>
        prev.map((e) => (e.category === oldPk ? { ...e, category: newPk } : e))
      );
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to redirect entities from category '${oldPk}'.`);
      throw err;
    }
  }

  async redirectNonEntitiesFromCategory(oldPk: string, newPk: string) {
    try {
      const newCategory = this.deps.categories.find((c) => c.pk === newPk);
      if (!newCategory) throw new Error('Target category not found');
      this.deps.setNonEntities((prev) =>
        prev.map((n) => (n.category_pk === oldPk ? { ...n, category_pk: newPk, category_name: newCategory.name } : n))
      );
      this.deps.setRegistryNonEntities((prev) =>
        prev.map((n) => (n.category === oldPk ? { ...n, category: newPk } : n))
      );
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to redirect non-entities from category '${oldPk}'.`);
      throw err;
    }
  }

  async redirectEntitiesFromType(oldPk: string, newPk?: string) {
    try {
      this.deps.setActiveEntities((prev) =>
        prev.map((e) => (e.type_pk === oldPk ? { ...e, type_pk: newPk } : e))
      );
      this.deps.setRegistryEntities((prev) =>
        prev.map((e) => (e.type === oldPk ? { ...e, type: newPk } : e))
      );
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to redirect entities from type '${oldPk}'.`);
      throw err;
    }
  }

  async redirectNonEntitiesFromType(oldPk: string, newPk?: string) {
    try {
      this.deps.setNonEntities((prev) =>
        prev.map((n) => (n.type_pk === oldPk ? { ...n, type_pk: newPk } : n))
      );
      this.deps.setRegistryNonEntities((prev) =>
        prev.map((n) => (n.type === oldPk ? { ...n, type: newPk } : n))
      );
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to redirect non-entities from type '${oldPk}'.`);
      throw err;
    }
  }

  // ==================== SPLIT ====================

  async splitDomain(oldCode: string, newDomains: { code: string; name: string; categoryPks: string[] }[]) {
    try {
      const oldDomain = this.deps.domains.find((d) => d.code === oldCode);
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
        this.deps.setDomains((prev) => [...prev, domain]);

        for (const catPk of nd.categoryPks) {
          const cat = this.deps.categories.find((c) => c.pk === catPk);
          if (cat) {
            const newCat: RegistryCategory = {
              dctId: `DCT-CAT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              ...cat,
              pk: cat.pk.replace(/^CAT-[A-Z]+-/, `CAT-${nd.code}-`),
              domainCode: nd.code,
            };
            await taxonomyApi.createCategory(newCat);
            this.deps.setCategories((prev) => [...prev, newCat]);
            await this.redirectEntitiesFromCategory(catPk, newCat.pk);
            await this.redirectNonEntitiesFromCategory(catPk, newCat.pk);
          }
        }
      }

      const targetCode = newDomains[0]?.code || oldCode;
      await this.redirectEntitiesFromDomain(oldCode, targetCode);
      await this.redirectNonEntitiesFromDomain(oldCode, targetCode);
      await this.stopDomain(oldCode, targetCode);
      this.deps.logDctChange({
        action: 'split',
        dctType: 'domain',
        dctId: oldDomain.dctId,
        oldValue: oldDomain.name,
        newValue: newDomains.map((n) => n.name).join(', '),
        description: `Domain '${oldDomain.name}' split into ${newDomains.length} domains`
      });
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to split domain '${oldCode}'.`);
      throw err;
    }
  }

  async splitCategory(oldPk: string, newCategories: { pk: string; name: string; typePks: string[] }[]) {
    try {
      const oldCategory = this.deps.categories.find((c) => c.pk === oldPk);
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
        this.deps.setCategories((prev) => [...prev, category]);

        for (const typePk of nc.typePks) {
          const typ = this.deps.types.find((t) => t.pk === typePk);
          if (typ) {
            const newType: RegistryType = {
              dctId: `DCT-TYP-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
              ...typ,
              pk: typ.pk.replace(/^TYP-[A-Z]+-[A-Z]+-/, `TYP-${oldCategory.domainCode}-${nc.pk.split('-').pop()}-`),
              categoryPk: nc.pk,
            };
            await taxonomyApi.createType(newType);
            this.deps.setTypes((prev) => [...prev, newType]);
            await this.redirectEntitiesFromType(typePk, newType.pk);
            await this.redirectNonEntitiesFromType(typePk, newType.pk);
          }
        }
      }

      const targetPk = newCategories[0]?.pk || oldPk;
      await this.redirectEntitiesFromCategory(oldPk, targetPk);
      await this.redirectNonEntitiesFromCategory(oldPk, targetPk);
      await this.stopCategory(oldPk, targetPk);
      this.deps.logDctChange({
        action: 'split',
        dctType: 'category',
        dctId: oldCategory.dctId,
        oldValue: oldCategory.name,
        newValue: newCategories.map((n) => n.name).join(', '),
        description: `Category '${oldCategory.name}' split into ${newCategories.length} categories`
      });
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to split category '${oldPk}'.`);
      throw err;
    }
  }

  async splitType(oldPk: string, newTypes: { pk: string; name: string }[]) {
    try {
      const oldType = this.deps.types.find((t) => t.pk === oldPk);
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
        this.deps.setTypes((prev) => [...prev, newType]);
      }

      const targetPk = newTypes[0]?.pk || oldPk;
      await this.redirectEntitiesFromType(oldPk, targetPk);
      await this.redirectNonEntitiesFromType(oldPk, targetPk);
      await this.stopType(oldPk, targetPk);
      this.deps.logDctChange({
        action: 'split',
        dctType: 'type',
        dctId: oldType.dctId,
        oldValue: oldType.name,
        newValue: newTypes.map((n) => n.name).join(', '),
        description: `Type '${oldType.name}' split into ${newTypes.length} types`
      });
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to split type '${oldPk}'.`);
      throw err;
    }
  }

  // ==================== CONVERT ====================

  async convertDomain(oldDctId: string, newDomain: { code: string; name: string }) {
    try {
      const oldDomain = this.deps.domains.find((d) => d.dctId === oldDctId || d.code === oldDctId);
      if (!oldDomain) return;
      const existingTarget = this.deps.domains.find((d) => d.code === newDomain.code);
      if (existingTarget) {
        await this.redirectEntitiesFromDomain(oldDomain.code, newDomain.code);
        await this.redirectNonEntitiesFromDomain(oldDomain.code, newDomain.code);
        await this.stopDomain(oldDomain.code, newDomain.code);
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
        this.deps.setDomains((prev) => prev.map((d) => (d.dctId === oldDomain.dctId ? converted : d)));
        await this.redirectEntitiesFromDomain(oldDomain.code, newDomain.code);
        await this.redirectNonEntitiesFromDomain(oldDomain.code, newDomain.code);
      }
      this.deps.logDctChange({
        action: 'convert',
        dctType: 'domain',
        dctId: oldDomain.dctId,
        oldValue: oldDomain.name,
        newValue: newDomain.name,
        description: `Domain '${oldDomain.name}' converted to '${newDomain.name}' (${newDomain.code})`
      });
      this.deps.showToast('success', `Domain '${oldDomain.name}' converted successfully.`);
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to convert Domain '${oldDctId}'.`);
      throw err;
    }
  }

  async convertCategory(oldDctId: string, newCategory: { pk: string; name: string }) {
    try {
      const oldCategory = this.deps.categories.find((c) => c.dctId === oldDctId || c.pk === oldDctId);
      if (!oldCategory) return;
      const existingTarget = this.deps.categories.find((c) => c.pk === newCategory.pk);
      if (existingTarget) {
        await this.redirectEntitiesFromCategory(oldCategory.pk, newCategory.pk);
        await this.redirectNonEntitiesFromCategory(oldCategory.pk, newCategory.pk);
        await this.stopCategory(oldCategory.pk, newCategory.pk);
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
        this.deps.setCategories((prev) => prev.map((c) => (c.dctId === oldCategory.dctId ? converted : c)));
        await this.redirectEntitiesFromCategory(oldCategory.pk, newCategory.pk);
        await this.redirectNonEntitiesFromCategory(oldCategory.pk, newCategory.pk);
      }
      this.deps.logDctChange({
        action: 'convert',
        dctType: 'category',
        dctId: oldCategory.dctId,
        oldValue: oldCategory.name,
        newValue: newCategory.name,
        description: `Category '${oldCategory.name}' converted to '${newCategory.name}' (${newCategory.pk})`
      });
      this.deps.showToast('success', `Category '${oldCategory.name}' converted successfully.`);
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to convert Category '${oldDctId}'.`);
      throw err;
    }
  }

  async convertType(oldDctId: string, newType: { pk: string; name: string }) {
    try {
      const oldType = this.deps.types.find((t) => t.dctId === oldDctId || t.pk === oldDctId);
      if (!oldType) return;
      const existingTarget = this.deps.types.find((t) => t.pk === newType.pk);
      if (existingTarget) {
        await this.redirectEntitiesFromType(oldType.pk, newType.pk);
        await this.redirectNonEntitiesFromType(oldType.pk, newType.pk);
        await this.stopType(oldType.pk, newType.pk);
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
        this.deps.setTypes((prev) => prev.map((t) => (t.dctId === oldType.dctId ? converted : t)));
        await this.redirectEntitiesFromType(oldType.pk, newType.pk);
        await this.redirectNonEntitiesFromType(oldType.pk, newType.pk);
      }
      this.deps.logDctChange({
        action: 'convert',
        dctType: 'type',
        dctId: oldType.dctId,
        oldValue: oldType.name,
        newValue: newType.name,
        description: `Type '${oldType.name}' converted to '${newType.name}' (${newType.pk})`
      });
      this.deps.showToast('success', `Type '${oldType.name}' converted successfully.`);
    } catch (err) {
      console.error(err);
      this.deps.showToast('warning', `Failed to convert Type '${oldDctId}'.`);
      throw err;
    }
  }

  // ==================== MERGE ====================

  async mergeDomains(sourceCodes: string[], targetCode: string) {
    const targetDomain = this.deps.domains.find(d => d.code === targetCode);
    if (!targetDomain) throw new Error('Target domain not found');
    
    for (const sourceCode of sourceCodes) {
      const sourceDomain = this.deps.domains.find(d => d.code === sourceCode);
      if (!sourceDomain || sourceCode === targetCode) continue;
      
      await this.redirectEntitiesFromDomain(sourceCode, targetCode);
      await this.redirectNonEntitiesFromDomain(sourceCode, targetCode);
      await this.stopDomain(sourceCode, targetCode);
    }
    
    this.deps.logDctChange({
      action: 'merge',
      dctType: 'domain',
      dctId: targetDomain.dctId,
      oldValue: `${sourceCodes.length} merged`,
      newValue: targetDomain.name,
      description: `Merged ${sourceCodes.length} domains into '${targetDomain.name}'`
    });
    this.deps.showToast('success', `Merged ${sourceCodes.length} domains into '${targetDomain.name}'.`);
  }

  async mergeCategories(sourcePks: string[], targetPk: string) {
    const targetCat = this.deps.categories.find(c => c.pk === targetPk);
    if (!targetCat) throw new Error('Target category not found');
    
    for (const sourcePk of sourcePks) {
      const sourceCat = this.deps.categories.find(c => c.pk === sourcePk);
      if (!sourceCat || sourcePk === targetPk) continue;
      
      await this.redirectEntitiesFromCategory(sourcePk, targetPk);
      await this.redirectNonEntitiesFromCategory(sourcePk, targetPk);
      await this.stopCategory(sourcePk, targetPk);
    }
    
    this.deps.logDctChange({
      action: 'merge',
      dctType: 'category',
      dctId: targetCat.dctId,
      oldValue: `${sourcePks.length} merged`,
      newValue: targetCat.name,
      description: `Merged ${sourcePks.length} categories into '${targetCat.name}'`
    });
    this.deps.showToast('success', `Merged ${sourcePks.length} categories into '${targetCat.name}'.`);
  }

  async mergeTypes(sourcePks: string[], targetPk: string) {
    const targetType = this.deps.types.find(t => t.pk === targetPk);
    if (!targetType) throw new Error('Target type not found');
    
    for (const sourcePk of sourcePks) {
      const sourceType = this.deps.types.find(t => t.pk === sourcePk);
      if (!sourceType || sourcePk === targetPk) continue;
      
      await this.redirectEntitiesFromType(sourcePk, targetPk);
      await this.redirectNonEntitiesFromType(sourcePk, targetPk);
      await this.stopType(sourcePk, targetPk);
    }
    
    this.deps.logDctChange({
      action: 'merge',
      dctType: 'type',
      dctId: targetType.dctId,
      oldValue: `${sourcePks.length} merged`,
      newValue: targetType.name,
      description: `Merged ${sourcePks.length} types into '${targetType.name}'`
    });
    this.deps.showToast('success', `Merged ${sourcePks.length} types into '${targetType.name}'.`);
  }

  // ==================== MODIFY (Name-only change) ====================

  async modifyDomain(dctId: string, newName: string, newCode?: string) {
    const dom = this.deps.domains.find(d => d.dctId === dctId);
    if (!dom) return;
    const updated: RegistryDomain = { ...dom, name: newName, ...(newCode ? { code: newCode } : {}) };
    await taxonomyApi.updateDomain(updated);
    this.deps.setDomains((prev) => prev.map((d) => (d.dctId === dctId ? updated : d)));
    this.deps.logDctChange({
      action: 'edit',
      dctType: 'domain',
      dctId,
      oldValue: dom.name,
      newValue: newName,
      description: `Domain name changed from '${dom.name}' to '${newName}'`
    });
    this.deps.showToast('success', `Domain name updated to '${newName}'.`);
  }

  async modifyCategory(dctId: string, newName: string, newPk?: string) {
    const cat = this.deps.categories.find(c => c.dctId === dctId);
    if (!cat) return;
    const updated: RegistryCategory = { ...cat, name: newName, ...(newPk ? { pk: newPk } : {}) };
    await taxonomyApi.updateCategory(updated);
    this.deps.setCategories((prev) => prev.map((c) => (c.dctId === dctId ? updated : c)));
    this.deps.logDctChange({
      action: 'edit',
      dctType: 'category',
      dctId,
      oldValue: cat.name,
      newValue: newName,
      description: `Category name changed from '${cat.name}' to '${newName}'`
    });
    this.deps.showToast('success', `Category name updated to '${newName}'.`);
  }

  async modifyType(dctId: string, newName: string, newPk?: string) {
    const typ = this.deps.types.find(t => t.dctId === dctId);
    if (!typ) return;
    const updated: RegistryType = { ...typ, name: newName, ...(newPk ? { pk: newPk } : {}) };
    await taxonomyApi.updateType(updated);
    this.deps.setTypes((prev) => prev.map((t) => (t.dctId === dctId ? updated : t)));
    this.deps.logDctChange({
      action: 'edit',
      dctType: 'type',
      dctId,
      oldValue: typ.name,
      newValue: newName,
      description: `Type name changed from '${typ.name}' to '${newName}'`
    });
    this.deps.showToast('success', `Type name updated to '${newName}'.`);
  }
}
