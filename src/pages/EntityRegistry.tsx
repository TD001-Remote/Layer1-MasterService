/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Building2, MapPin, Edit, Trash2, GitBranch, Search, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RegistryEntity, ActiveEntity } from "../types";
import { getAllEntityDomains, getEntityCategoryById } from "../data/domains";
import { useData } from "../contexts/DataContext";
import { entityApi } from "../services/api";

type ViewMode = 'pending-assignment' | 'manage-records' | 'branch-operations';

export default function EntityRegistry() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('pending-assignment');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  
  const { getStagingEntities, activeEntities: ctxActiveEntities } = useData();
  
  const [fbEntities, setFbEntities] = useState<ActiveEntity[]>([]);
  const [isLoadingFb, setIsLoadingFb] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
  
  const allStagingEntities = getStagingEntities();
  const approvedStaging = allStagingEntities.filter(e => e.status === 'approved');
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
  const registryEntities = activeEntities;
  
  const allDomainCodes = Array.from(new Set([
    ...domains.map(d => d.code),
    ...activeEntities.map(e => e.primary_domain),
  ])).sort();
  
  const filteredEntities = activeEntities.filter(entity => {
    const matchesSearch = !searchTerm || 
      entity.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = !selectedDomain || 
      entity.primary_domain.toLowerCase() === selectedDomain.toLowerCase();
    return matchesSearch && matchesDomain;
  });

  // Group by domain for tree view
  const entitiesByDomain = filteredEntities.reduce((acc, entity) => {
    const domainCode = entity.primary_domain;
    if (!acc[domainCode]) {
      acc[domainCode] = [];
    }
    acc[domainCode].push(entity);
    return acc;
  }, {} as Record<string, ActiveEntity[]>);

  const handleAssignGeoZone = (stagingId: string) => {
    navigate(`/entity-registry/assign/${stagingId}`);
  };

  const handleEdit = (entityPk: string) => {
    navigate(`/entity-registry/edit/${entityPk}`);
  };

  const handleMoveBranch = (entityPk: string) => {
    navigate('/entity-registry');
  };

  const handleDelete = (entityPk: string) => {
    if (confirm('Are you sure you want to delete this entity?')) {
      // TODO: Implement delete
      console.log('Delete entity:', entityPk.replace(/[\r\n]/g, ' '));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-entity-100 text-entity-700 rounded-xl shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight">Entity Registry Management</h2>
              <p className="text-sm text-surface-500 mt-0.5 font-semibold">
                Assign geo/zone, manage records, and modify branch structure
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
              <div className="text-2xl font-extrabold text-entity-600 font-display">{activeEntities.length}</div>
              <div className="text-[11px] text-surface-500 font-bold uppercase tracking-wider">Active Entities</div>
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
              ? 'bg-entity-600 text-white shadow-lg shadow-entity-500/20'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          <MapPin className="inline w-4 h-4 mr-1.5" />
          Assign Geo/Zone
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
              ? 'bg-entity-600 text-white shadow-lg shadow-entity-500/20'
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
              ? 'bg-entity-600 text-white shadow-lg shadow-entity-500/20'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          <GitBranch className="inline w-4 h-4 mr-1.5" />
          Branch Operations
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-surface-200 shadow-lg overflow-hidden">
        
        {/* ASSIGN GEO/ZONE MODE */}
        {viewMode === 'pending-assignment' && (
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight">Pending Geo/Zone Assignment</h3>
              <p className="text-sm text-surface-500 mt-1 font-semibold">
                These entities are approved from staging. Assign geographic location and zone to move them to active registry.
              </p>
            </div>

            {approvedStaging.length === 0 ? (
              <div className="text-center py-16 text-surface-400 space-y-2">
                <MapPin className="w-16 h-16 mx-auto opacity-30" />
                <p className="text-lg font-bold text-surface-600">No entities waiting for assignment</p>
                <p className="text-sm text-surface-500 font-medium">Approved entities from staging will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {approvedStaging.map(entity => {
                  const categoryInfo = getEntityCategoryById(entity.category_id);
                  
                  return (
                    <div key={entity.id} className="border border-amber-200 bg-amber-50/70 rounded-xl p-5 hover:shadow-lg transition-all duration-200">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-amber-700 shadow-sm">
                              <Building2 className="w-7 h-7" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-surface-900 text-lg tracking-tight">{entity.entity_name}</h4>
                              {entity.phone && (
                                <p className="text-sm text-surface-600 font-medium mt-0.5">📞 {entity.phone}</p>
                              )}
                            </div>
                          </div>
                           
                          <div className="flex flex-wrap gap-2 mt-4">
                            <span className="px-3 py-1.5 bg-white border border-surface-200 text-surface-700 text-xs rounded-lg font-bold shadow-sm">
                              {categoryInfo?.domain.name}
                            </span>
                            <span className="px-3 py-1.5 bg-white border border-surface-200 text-surface-700 text-xs rounded-lg font-bold shadow-sm">
                              {categoryInfo?.category.name}
                            </span>
                          </div>
                           
                          <div className="flex gap-2 mt-3">
                            {entity.roles.isAssetProvider && (
                              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg font-bold">Asset Provider</span>
                            )}
                            {entity.roles.isServiceProvider && (
                              <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg font-bold">Service Provider</span>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleAssignGeoZone(entity.id)}
                          className="shrink-0 px-5 py-3 bg-entity-600 hover:bg-entity-700 text-white rounded-xl font-extrabold shadow-lg shadow-entity-500/20 hover:shadow-xl hover:shadow-entity-500/25 transition-all active:scale-95 flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4" />
                          Assign Geo/Zone
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
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight">Manage Entity Records</h3>
              <p className="text-sm text-surface-500 mt-1 font-semibold">
                View, edit, or delete existing entity records
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or phone..."
                   className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-entity-200 focus:border-entity-500"
                />
              </div>
               
               <select
                 value={selectedDomain}
                 onChange={(e) => setSelectedDomain(e.target.value)}
                  className="px-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-entity-200 focus:border-entity-500"
               >
                 <option value="">All Domains</option>
                 {allDomainCodes.map(code => <option key={code} value={code}>{code}</option>)}
               </select>
            </div>

            {filteredEntities.length === 0 ? (
              <div className="text-center py-16 text-surface-400 space-y-2">
                <Building2 className="w-16 h-16 mx-auto opacity-30" />
                <p className="text-lg font-bold text-surface-600">No entities found</p>
                <p className="text-sm text-surface-500 font-medium">
                  {searchTerm || selectedDomain ? 'Try adjusting your filters' : 'Assign geo/zone to approved entities to see them here'}
                </p>
              </div>
            ) : (
              <div className="border border-surface-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-surface-50 border-b border-surface-200">
                        <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Entity Name</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Phone</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Domain</th>
                        <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Location</th>
                        <th className="px-5 py-3.5 text-right text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {filteredEntities.map(entity => {
                        const categoryInfo = getEntityCategoryById(entity.category_pk);
                        
                        return (
                          <tr key={entity.entity_pk} className="hover:bg-surface-50/80 transition-colors duration-150">
                            <td className="px-5 py-3.5">
                              <div className="font-extrabold text-surface-900">{entity.entity_name}</div>
                              <div className="text-xs text-surface-400 font-mono mt-0.5">{entity.entity_pk}</div>
                            </td>
                            <td className="px-5 py-3.5 text-sm font-medium text-surface-700">{entity.phone || '—'}</td>
                            <td className="px-5 py-3.5">
                              <div className="text-sm font-semibold text-surface-900">{entity.category_name}</div>
                              <div className="text-xs text-surface-500 font-medium">{categoryInfo?.category.name || entity.category_pk}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="text-xs text-surface-600 font-mono font-semibold">{entity.zone_pk}</div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEdit(entity.entity_pk)}
                                  className="p-2 text-surface-500 hover:text-entity-600 hover:bg-entity-50 rounded-xl transition-all duration-150"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(entity.entity_pk)}
                                  className="p-2 text-surface-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all duration-150"
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
              </div>
            )}
          </div>
        )}

        {/* BRANCH OPERATIONS MODE */}
        {viewMode === 'branch-operations' && (
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight">Branch & Tree Operations</h3>
              <p className="text-sm text-surface-500 mt-1 font-semibold">
                Move entities between domain/category/type branches for better organization
              </p>
            </div>

            {Object.keys(entitiesByDomain).length === 0 ? (
              <div className="text-center py-16 text-surface-400 space-y-2">
                <GitBranch className="w-16 h-16 mx-auto opacity-30" />
                <p className="text-lg font-bold text-surface-600">No entities to organize</p>
                <p className="text-sm text-surface-500 font-medium">Entities will appear here once assigned</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(entitiesByDomain).map(([domainCode, entities]) => {
                  const domain = domains.find(d => d.code === domainCode);
                  
                  return (
                    <div key={domainCode} className="border border-surface-200 rounded-xl overflow-hidden">
                      <div className="bg-gradient-to-r from-entity-50 to-purple-50 px-5 py-3.5 border-b border-entity-100">
                        <div className="flex items-center justify-between">
                          <h4 className="font-extrabold text-surface-900 flex items-center gap-2 tracking-tight">
                            <GitBranch className="w-4 h-4 text-entity-600" />
                            {domain?.name || domainCode}
                          </h4>
                          <span className="text-sm text-surface-600 font-bold bg-white px-3 py-1 rounded-lg border border-surface-200">{entities.length} entities</span>
                        </div>
                      </div>
                       
                      <div className="p-4">
                        <div className="grid grid-cols-1 gap-2.5">
                          {entities.map(entity => {
                            const categoryInfo = getEntityCategoryById(entity.category_pk);
                             
                            return (
                              <div key={entity.entity_pk} className="flex items-center justify-between p-3.5 bg-surface-50 rounded-xl hover:bg-surface-100 border border-transparent hover:border-surface-200 transition-all duration-150">
                                <div className="flex-1">
                                  <div className="font-extrabold text-surface-900 text-sm">{entity.entity_name}</div>
                                  <div className="text-xs text-surface-500 font-medium mt-0.5">
                                    {entity.category_name}
                                    {entity.type_pk && <span className="text-surface-400"> → {entity.type_pk}</span>}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleMoveBranch(entity.entity_pk)}
                                  className="px-4 py-2 bg-entity-600 hover:bg-entity-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-entity-500/20 transition-all active:scale-95"
                                >
                                  <GitBranch className="w-3.5 h-3.5" />
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
