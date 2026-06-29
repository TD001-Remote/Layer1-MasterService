/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Home, MapPin, Edit, Trash2, GitBranch, Search, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RegistryNonEntity, NonEntity } from "../types";
import { getAllNonEntityDomains, getNonEntityCategoryById } from "../data/domains";
import { useData } from "../contexts/DataContext";
import { nonEntityApi } from "../services/api";

type ViewMode = 'pending-assignment' | 'manage-records' | 'branch-operations';

export default function NonEntityRegistry() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('pending-assignment');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  
  const { getStagingNonEntities, getRegistryNonEntities } = useData();
  
  const [fbNonEntities, setFbNonEntities] = useState<NonEntity[]>([]);
  const [isLoadingFb, setIsLoadingFb] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
  
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
  
  const allStagingNonEntities = getStagingNonEntities();
  const approvedStaging = allStagingNonEntities.filter(ne => ne.status === 'approved');
  const domains = getAllNonEntityDomains();
  
  const activeNonEntities = fbNonEntities;
  const allDomainCodes = Array.from(new Set([
    ...domains.map(d => d.code),
    ...activeNonEntities.map(n => n.primary_domain),
  ])).sort();
  
  const filteredNonEntities = activeNonEntities.filter(nonEntity => {
    const matchesSearch = !searchTerm || 
      nonEntity.non_entity_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = !selectedDomain || 
      nonEntity.primary_domain.toLowerCase() === selectedDomain.toLowerCase();
    return matchesSearch && matchesDomain;
  });

  const nonEntitiesByDomain = filteredNonEntities.reduce((acc, nonEntity) => {
    const domainCode = nonEntity.primary_domain;
    if (!acc[domainCode]) {
      acc[domainCode] = [];
    }
    acc[domainCode].push(nonEntity);
    return acc;
  }, {} as Record<string, NonEntity[]>);

  const handleAssignGeo = (stagingId: string) => {
    navigate(`/non-entity-registry/assign/${stagingId}`);
  };
  
  const handleEdit = (nonEntityPk: string) => {
    navigate(`/non-entity-registry/edit/${nonEntityPk}`);
  };

  const handleMoveBranch = (nonEntityPk: string) => {
    navigate(`/non-entity-registry/move-branch/${nonEntityPk}`);
  };

  const handleDelete = (nonEntityPk: string) => {
    if (confirm('Are you sure you want to delete this non-entity?')) {
      console.log('Delete non-entity:', nonEntityPk.replace(/[\r\n]/g, ' '));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shadow-sm">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight">Non-Entity Registry Management</h2>
              <p className="text-sm text-surface-500 mt-0.5 font-semibold">
                Assign geo location, manage non-entities, and modify branch structure
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
            <div className="text-right pl-3 border-l border-surface-200">
              <div className="text-2xl font-extrabold text-emerald-600 font-display">{activeNonEntities.length}</div>
              <div className="text-[11px] text-surface-500 font-bold uppercase tracking-wider">Active Non-Entities</div>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="bg-white rounded-xl border border-surface-200 p-1.5 inline-flex gap-1 shadow-sm">
        <button
          onClick={() => setViewMode('pending-assignment')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            viewMode === 'pending-assignment'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          <MapPin className="inline w-4 h-4 mr-1.5" />
          Assign Geo Location
          {approvedStaging.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] rounded-full font-extrabold">
              {approvedStaging.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setViewMode('manage-records')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            viewMode === 'manage-records'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          <Edit className="inline w-4 h-4 mr-1.5" />
          Manage Records
        </button>
        <button
          onClick={() => setViewMode('branch-operations')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            viewMode === 'branch-operations'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          <GitBranch className="inline w-4 h-4 mr-1.5" />
          Branch Operations
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl border border-slate-200">
        
        {/* ASSIGN GEO LOCATION MODE */}
        {viewMode === 'pending-assignment' && (
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">Pending Geo Assignment</h3>
              <p className="text-sm text-slate-500 mt-1">
                These non-entities are approved from staging. Assign geographic location (zone optional) to move them to active registry.
              </p>
            </div>

            {approvedStaging.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No non-entities waiting for assignment</p>
                <p className="text-sm mt-1">Approved non-entities from staging will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {approvedStaging.map(nonEntity => {
                  const categoryInfo = getNonEntityCategoryById(nonEntity.category_id);
                  
                  return (
                    <div key={nonEntity.id} className="border border-amber-300 bg-amber-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                              <Home className="w-6 h-6 text-emerald-700" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-lg">{nonEntity.non_entity_name}</h4>
                              <p className="text-sm text-slate-600 mt-0.5">Non-Entity</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg font-medium">
                              {categoryInfo?.domain.name}
                            </span>
                            <span className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg font-medium">
                              {categoryInfo?.category.name}
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleAssignGeo(nonEntity.id)}
                          className="ml-4 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm hover:shadow transition-all flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4" />
                          Assign Geo Location
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* MANAGE RECORDS MODE */}
        {viewMode === 'manage-records' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">Manage Non-Entity Records</h3>
              <p className="text-sm text-slate-500 mt-1">
                View, edit, or delete existing non-entity records
              </p>
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by non-entity name..."
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

            {/* Records Table */}
            {filteredNonEntities.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Home className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No non-entities found</p>
                <p className="text-sm mt-1">
                  {searchTerm || selectedDomain ? 'Try adjusting your filters' : 'Assign non-entities from CSV imports to see them here'}
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Non-Entity Name</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Domain</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Zone</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredNonEntities.map(nonEntity => {
                      const categoryInfo = getNonEntityCategoryById(nonEntity.category_pk);
                      
                      return (
                        <tr key={nonEntity.non_entity_pk} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-900">{nonEntity.non_entity_name}</div>
                            <div className="text-xs text-slate-500">{nonEntity.non_entity_pk}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-slate-900">{categoryInfo?.category.name || nonEntity.category_pk}</div>
                            <div className="text-xs text-slate-500">{nonEntity.primary_domain}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-slate-600">
                              {nonEntity.stateId}/{nonEntity.districtId}/{nonEntity.talukId}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs text-slate-600 font-mono">{nonEntity.zone_pk || '—'}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(nonEntity.non_entity_pk)}
                                className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(nonEntity.non_entity_pk)}
                                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* BRANCH OPERATIONS MODE */}
        {viewMode === 'branch-operations' && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900">Branch & Tree Operations</h3>
              <p className="text-sm text-slate-500 mt-1">
                Move non-entities between domain/category/type branches for better organization
              </p>
            </div>

            {/* Domain Tree View */}
            {Object.keys(nonEntitiesByDomain).length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <GitBranch className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">No non-entities to organize</p>
                <p className="text-sm mt-1">Non-entities will appear here once assigned</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(nonEntitiesByDomain).map(([domainCode, nonEntities]) => {
                  const domain = domains.find(d => d.code === domainCode);
                  
                  return (
                    <div key={domainCode} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-emerald-600" />
                            {domain?.name || domainCode}
                          </h4>
                          <span className="text-sm text-slate-600 font-medium">{nonEntities.length} non-entities</span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 gap-2">
                          {nonEntities.map(nonEntity => {
                            const categoryInfo = getNonEntityCategoryById(nonEntity.category_pk);
                            
                            return (
                              <div key={nonEntity.non_entity_pk} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                <div className="flex-1">
                                  <div className="font-medium text-slate-900">{nonEntity.non_entity_name}</div>
                                  <div className="text-xs text-slate-500 mt-0.5">
                                    {categoryInfo?.category.name || nonEntity.category_pk}
                                    {nonEntity.type_pk && ` → ${nonEntity.type_pk}`}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleMoveBranch(nonEntity.non_entity_pk)}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                                >
                                  <GitBranch className="w-4 h-4" />
                                  Move Branch
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}