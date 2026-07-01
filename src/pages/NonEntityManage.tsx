/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NON-ENTITY PAGE 2: MANAGE/MODIFY/DELETE/RECOVERY
 * Purpose: Manage existing non-entities in registry
 */

import React, { useState, useEffect } from "react";
import { Home, Edit, Trash2, RotateCcw, Search, ChevronLeft, GitBranch, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NonEntity } from "../types";
import { getAllNonEntityDomains, getNonEntityCategoryById } from "../data/domains";
import { useData } from "../contexts/DataContext";
import { nonEntityApi } from "../services/api";

type ViewMode = 'active' | 'deleted';

export default function NonEntityManage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  
  const { nonEntities: ctxNonEntities, stopNonEntity, recoverNonEntity } = useData();
  
  const [fbNonEntities, setFbNonEntities] = useState<NonEntity[]>([]);
  const [isLoadingFb, setIsLoadingFb] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);

  const domains = getAllNonEntityDomains();
  
  const loadFromFirestore = async () => {
    setIsLoadingFb(true);
    setFbError(null);
    try {
      const data = await nonEntityApi.getAll();
      setFbNonEntities(data);
    } catch (err) {
      setFbError(String(err).replace(/[\r\n]/g, ' '));
      setFbNonEntities([]);
    } finally {
      setIsLoadingFb(false);
    }
  };
  
  useEffect(() => {
    loadFromFirestore();
  }, []);
  
  const nonEntities = fbNonEntities.length > 0 ? fbNonEntities : ctxNonEntities;
  const activeList = nonEntities.filter(n => n.status === 'active');
  const deletedList = nonEntities.filter(n => n.status === 'stopped');

  const allDomainCodes = Array.from(new Set([
    ...domains.map(d => d.code),
    ...nonEntities.map(n => n.primary_domain),
  ])).sort();
  
  const displayNonEntities = viewMode === 'active' ? activeList : deletedList;
  const filteredNonEntities = displayNonEntities.filter(nonEntity => {
    const matchesSearch = !searchTerm || 
      nonEntity.non_entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nonEntity.non_entity_pk.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = !selectedDomain || 
      nonEntity.primary_domain.toLowerCase() === selectedDomain.toLowerCase();
    return matchesSearch && matchesDomain;
  });

  const handleEdit = (nonEntityPk: string) => {
    navigate(`/non-entity-registry/${nonEntityPk}`);
  };
  
  const handleMoveBranch = (nonEntityPk: string) => {
    navigate(`/non-entity-registry/move-branch/${nonEntityPk}`);
  };

  const handleDelete = async (nonEntityPk: string) => {
    if (confirm('Stop this non-entity? It can be recovered later.')) {
      await stopNonEntity(nonEntityPk);
    }
  };

  const handleRecover = async (nonEntityPk: string) => {
    if (confirm('Recover this non-entity?')) {
      await recoverNonEntity(nonEntityPk);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/non-entity-assign')}
              className="p-2 hover:bg-surface-100 rounded-xl transition-colors border border-transparent hover:border-surface-200"
            >
              <ChevronLeft className="w-5 h-5 text-surface-500" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight">Non-Entity Management</h2>
              <p className="text-sm text-surface-500 mt-0.5 font-semibold">
                Manage, modify, and recover non-entity records
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
               ? 'bg-nonentity-600 text-white shadow-lg shadow-nonentity-500/20'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          <Home className="inline w-4 h-4 mr-1.5" />
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
              placeholder="Search by name or PK..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Domains</option>
            {allDomainCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {filteredNonEntities.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Home className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">
              {viewMode === 'active' ? 'No active non-entities' : 'No deleted non-entities'}
            </p>
            <p className="text-sm mt-1">
              {searchTerm || selectedDomain
                ? 'Try adjusting your filters'
                : viewMode === 'active'
                ? 'Assign non-entities from CSV imports'
                : 'Deleted non-entities will appear here'}
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Non-Entity</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Domain/Category</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Location</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredNonEntities.map(nonEntity => {
                  const categoryInfo = getNonEntityCategoryById(nonEntity.category_pk);
                  
                  return (
                    <tr key={nonEntity.non_entity_pk} className="hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900">{nonEntity.non_entity_name}</div>
                        <div className="text-xs text-slate-500 font-mono">{nonEntity.non_entity_pk}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-slate-900">{nonEntity.category_name}</div>
                        <div className="text-xs text-slate-600">{categoryInfo?.category.name || nonEntity.category_pk}</div>
                        {nonEntity.type_pk && (
                          <div className="text-xs text-slate-500 mt-1">Type: {nonEntity.type_pk}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-slate-600">
                          {nonEntity.stateId}/{nonEntity.districtId}/{nonEntity.talukId}
                        </div>
                        {nonEntity.zone_pk && (
                          <div className="text-xs text-slate-500 font-mono mt-1">{nonEntity.zone_pk}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {viewMode === 'active' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(nonEntity.non_entity_pk)}
                              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveBranch(nonEntity.non_entity_pk)}
                              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Move Branch"
                            >
                              <GitBranch className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(nonEntity.non_entity_pk)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleRecover(nonEntity.non_entity_pk)}
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