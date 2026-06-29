/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { FolderTree } from 'lucide-react';
import { Domain } from '../data/domains';

interface Props {
  domains: Domain[];
  selectedDomain: string;
  selectedCategory: string;
  selectedType: string;
  onDomainChange: (domainCode: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onTypeChange: (type: string) => void;
  themeColor?: 'indigo' | 'emerald';
  entityType: 'entity' | 'non-entity';
}

export default function DomainCategoryTypeSelector({
  domains,
  selectedDomain,
  selectedCategory,
  selectedType,
  onDomainChange,
  onCategoryChange,
  onTypeChange,
  themeColor = 'indigo',
  entityType
}: Props) {
  const focusRingClass = themeColor === 'indigo' ? 'focus:ring-indigo-500' : 'focus:ring-emerald-500';
  
  const getCategories = () => {
    const domain = domains.find(d => d.code === selectedDomain);
    return domain?.categories || [];
  };

  const getStoragePath = () => {
    if (!selectedDomain || !selectedCategory) return null;
    
    const prefix = entityType === 'entity' ? 'entity-registry' : 'non-entity-registry';
    const suffix = entityType === 'entity' ? 'entity' : 'non-entity';
    
    return `${prefix}/domains/${selectedDomain}/categories/${selectedCategory}${
      selectedType ? `/types/${selectedType}` : ''
    }/${suffix}/{pk}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className={`text-lg font-bold text-slate-900 mb-4 flex items-center gap-2`}>
        <FolderTree className={`w-5 h-5 text-${themeColor}-600`} />
        Branch Hierarchy (Domain → Category → Type)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Domain <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedDomain}
            onChange={(e) => onDomainChange(e.target.value)}
            className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 ${focusRingClass}`}
          >
            <option value="">Select Domain</option>
            {domains.map(d => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">
            {selectedDomain ? domains.find(d => d.code === selectedDomain)?.name : 'Select a primary domain'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            disabled={!selectedDomain}
            className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 ${focusRingClass} disabled:bg-slate-100`}
          >
            <option value="">Select Category</option>
            {getCategories().map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">
            {selectedCategory ? getCategories().find(c => c.id === selectedCategory)?.name : 'Select a category'}
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Type (Optional - for sub-branching)
          </label>
          <input
            type="text"
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            placeholder="e.g., Multi-Specialty, Corner Shop, Type-A (optional)"
            className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 ${focusRingClass}`}
          />
          <p className="text-xs text-slate-500 mt-1">
            Leave empty to place directly under category. Add type for deeper branching/organization.
          </p>
        </div>
      </div>

      {getStoragePath() && (
        <div className={`mt-4 p-3 bg-${themeColor}-50 border border-${themeColor}-200 rounded-lg`}>
          <p className={`text-xs text-${themeColor}-800`}>
            <strong>Storage Path Preview:</strong><br />
            <code className="font-mono text-xs mt-1 block">
              {getStoragePath()}
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
