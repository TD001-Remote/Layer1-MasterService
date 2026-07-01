/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ENTITY PAGE 2: MANAGE/MODIFY/DELETE/RECOVERY
 * Purpose: Manage existing entities in registry
 */

import React, { useState, useEffect } from "react";
import { Building2, Edit, Trash2, RotateCcw, Search, ChevronLeft, GitBranch, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ActiveEntity } from "../types";
import { getAllEntityDomains, getEntityCategoryById } from "../data/domains";
import { useData } from "../contexts/DataContext";
import { entityApi } from "../services/api";

type ViewMode = 'active' | 'deleted';

export default function EntityManage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  
  const { activeEntities: ctxActiveEntities, stopEntity, recoverEntity } = useData();
  
  const [fbEntities, setFbEntities] = useState<ActiveEntity[]>([]);
  const [isLoadingFb, setIsLoadingFb] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
  
  const domains = getAllEntityDomains();
  
  const loadFromFirestore = async () => {
    setIsLoadingFb(true);
    setFbError(null);
    try {
      const data = await entityApi.getAll();
      setFbEntities(data);
    } catch (err) {
      setFbError(String(err).replace(/[\r\n]/g, ' '));
      setFbEntities([]);
    } finally {
      setIsLoadingFb(false);
    }
  };
  
  useEffect(() => {
    loadFromFirestore();
  }, []);
  
  const activeEntities = fbEntities.length > 0 ? fbEntities : ctxActiveEntities;
  const activeList = activeEntities.filter(e => e.status === 'active');
  const deletedList = activeEntities.filter(e => e.status === 'stopped');
  
  const allDomainCodes = Array.from(new Set([
    ...domains.map(d => d.code),
    ...activeEntities.map(e => e.primary_domain),
  ])).sort();
  
  const displayEntities = viewMode === 'active' ? activeList : deletedList;
  const filteredEntities = displayEntities.filter(entity => {
    const matchesSearch = !searchTerm || 
      entity.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.entity_pk.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = !selectedDomain || 
      entity.primary_domain.toLowerCase() === selectedDomain.toLowerCase();
    return matchesSearch && matchesDomain;
  });

  const handleEdit = (entityPk: string) => {
    navigate(`/entity-registry/${entityPk}`);
  };

  const handleMoveBranch = (entityPk: string) => {
    navigate('/entity-registry');
  };

  const handleDelete = async (entityPk: string) => {
    if (confirm('Stop this entity? It can be recovered later.')) {
      await stopEntity(entityPk);
    }
  };

  const handleRecover = async (entityPk: string) => {
    if (confirm('Recover this entity?')) {
      await recoverEntity(entityPk);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/entity-assign')}
              className="p-2 hover:bg-surface-100 rounded-xl transition-colors border border-transparent hover:border-surface-200"
            >
              <ChevronLeft className="w-5 h-5 text-surface-500" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight">Entity Management</h2>
              <p className="text-sm text-surface-500 mt-0.5 font-semibold">
                Manage, modify, and recover entity records in the registry
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {fbError && (
              <div className="flex items-center gap-2 text-rose-600 text-sm font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>Firebase load failed</span>
              </div>
            )}
            <button
              onClick={loadFromFirestore}
              disabled={isLoadingFb}
              className="p-2.5 text-surface-500 hover:text-surface-800 hover:bg-surface-100 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-surface-200"
              title="Refresh from Firebase"
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingFb ? 'animate-spin text-brand-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-xl border border-surface-200 p-1.5 inline-flex gap-1 shadow-sm">
        <button
          onClick={() => setViewMode('active')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            viewMode === 'active'
              ? 'bg-entity-600 text-white shadow-lg shadow-entity-500/20'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          <Building2 className="inline w-4 h-4 mr-1.5" />
          Active ({activeList.length})
        </button>
        <button
          onClick={() => setViewMode('deleted')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            viewMode === 'deleted'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          <Trash2 className="inline w-4 h-4 mr-1.5" />
          Deleted ({deletedList.length})
        </button>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-xl border border-surface-200 p-1.5 inline-flex gap-1 shadow-sm">
        <button
          onClick={() => setViewMode('active')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            viewMode === 'active'
              ? 'bg-entity-600 text-white shadow-lg shadow-entity-500/20'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          <Building2 className="inline w-4 h-4 mr-1.5" />
          Active ({activeList.length})
        </button>
        <button
          onClick={() => setViewMode('deleted')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            viewMode === 'deleted'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          <Trash2 className="inline w-4 h-4 mr-1.5" />
          Deleted ({deletedList.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, phone, or PK..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Domains</option>
            {allDomainCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {filteredEntities.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">
              {viewMode === 'active' ? 'No active entities' : 'No deleted entities'}
            </p>
            <p className="text-sm mt-1">
              {searchTerm || selectedDomain
                ? 'Try adjusting your filters'
                : viewMode === 'active'
                ? 'Assign entities from CSV imports'
                : 'Stopped entities will appear here for recovery'}
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Domain/Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Location</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredEntities.map(entity => {
                  const categoryInfo = getEntityCategoryById(entity.category_pk);
                  
                  return (
                    <tr key={entity.entity_pk} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900">{entity.entity_name}</div>
                        <div className="text-xs text-slate-500 font-mono">{entity.entity_pk}</div>
                        {entity.phone && (
                          <div className="text-xs text-slate-600 mt-1">📞 {entity.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-slate-900">{entity.category_name}</div>
                        {entity.type_pk && (
                          <div className="text-xs text-slate-500 mt-1">Type: {entity.type_pk}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-slate-600 font-mono">{entity.zone_pk}</div>
                      </td>
                      <td className="px-4 py-4">
                        {viewMode === 'active' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(entity.entity_pk)}
                              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveBranch(entity.entity_pk)}
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Move Branch"
                            >
                              <GitBranch className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(entity.entity_pk)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleRecover(entity.entity_pk)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Recover
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
