/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Building2, UserCheck, FolderTree, GitBranch, Archive, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StagingEntity, RegistryEntity } from "../types";
import { getAllEntityDomains, getEntityCategoryById } from "../data/domains";

type TabType = 'pending-assignment' | 'active-entities' | 'modify-branch' | 'stopped';

export default function EntityRegistry() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pending-assignment');
  
  // Mock data - will be replaced with DataContext
  const [approvedStaging, setApprovedStaging] = useState<StagingEntity[]>([]);
  const [activeEntities, setActiveEntities] = useState<RegistryEntity[]>([]);
  const [stoppedEntities, setStoppedEntities] = useState<RegistryEntity[]>([]);

  const domains = getAllEntityDomains();

  // Group active entities by domain/category for tree view
  const entityTree = activeEntities.reduce((acc, entity) => {
    if (!acc[entity.domain]) {
      acc[entity.domain] = {};
    }
    if (!acc[entity.domain][entity.category]) {
      acc[entity.domain][entity.category] = {
        direct: [],
        types: {}
      };
    }
    
    if (entity.type) {
      if (!acc[entity.domain][entity.category].types[entity.type]) {
        acc[entity.domain][entity.category].types[entity.type] = [];
      }
      acc[entity.domain][entity.category].types[entity.type].push(entity);
    } else {
      acc[entity.domain][entity.category].direct.push(entity);
    }
    
    return acc;
  }, {} as Record<string, Record<string, { direct: RegistryEntity[], types: Record<string, RegistryEntity[]> }>>);

  const handleAssignGeoZone = (stagingId: string) => {
    navigate(`/entity-registry/assign/${stagingId}`);
  };

  const handleModifyBranch = (entityPk: string) => {
    navigate(`/entity-registry/modify/${entityPk}`);
  };

  const handleViewDetails = (entityPk: string) => {
    navigate(`/entity-registry/${entityPk}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-indigo-600" />
              Entity Registry
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Manage service providers and asset owners with geo/zone assignment
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">{activeEntities.length}</div>
            <div className="text-xs text-slate-500">Active Entities</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending-assignment')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
            activeTab === 'pending-assignment'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="inline w-4 h-4 mr-1" />
          Pending Assignment
          {approvedStaging.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
              {approvedStaging.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('active-entities')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'active-entities'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderTree className="inline w-4 h-4 mr-1" />
          Active Entities
          {activeEntities.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
              {activeEntities.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('modify-branch')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'modify-branch'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitBranch className="inline w-4 h-4 mr-1" />
          Modify Branch
        </button>
        <button
          onClick={() => setActiveTab('stopped')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'stopped'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Archive className="inline w-4 h-4 mr-1" />
          Stopped/Deleted
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {activeTab === 'pending-assignment' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pending Geo/Zone Assignment</h3>
                <p className="text-xs text-slate-500 mt-1">
                  These entities are approved from staging and need geo/zone assignment
                </p>
              </div>
            </div>

            {approvedStaging.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No entities awaiting assignment</p>
                <p className="text-sm mt-1">Approved entities from staging will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvedStaging.map(entity => {
                  const categoryInfo = getEntityCategoryById(entity.category_id);
                  
                  return (
                    <div key={entity.id} className="border border-amber-200 bg-amber-50 rounded-lg p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-slate-900">{entity.entity_name}</h5>
                            {entity.phone && (
                              <p className="text-xs text-slate-600 mt-0.5">📞 {entity.phone}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-medium">
                                {categoryInfo?.domain.name}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-medium">
                                {categoryInfo?.category.name}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-1">
                              {entity.roles.isAssetProvider && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                  Asset Provider
                                </span>
                              )}
                              {entity.roles.isServiceProvider && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                  Service Provider
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignGeoZone(entity.id)}
                        className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Assign Geo/Zone
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'active-entities' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Active Entities - Tree View</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Entities organized by domain → category → type hierarchy
                </p>
              </div>
            </div>

            {activeEntities.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No active entities yet</p>
                <p className="text-sm mt-1">Assign geo/zone to approved entities to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(entityTree).map(([domainCode, categories]) => {
                  const domain = domains.find(d => d.code === domainCode);
                  
                  return (
                    <div key={domainCode} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          <FolderTree className="w-4 h-4 text-indigo-600" />
                          {domain?.name || domainCode}
                        </h4>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        {Object.entries(categories).map(([categoryId, categoryData]) => {
                          const categoryInfo = getEntityCategoryById(categoryId);
                          const totalInCategory = categoryData.direct.length + 
                            Object.values(categoryData.types).reduce((sum, entities) => sum + entities.length, 0);
                          
                          return (
                            <div key={categoryId} className="pl-4 border-l-2 border-slate-200">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-slate-800 text-sm">
                                  {categoryInfo?.category.name || categoryId}
                                </h5>
                                <span className="text-xs text-slate-500 font-medium">
                                  {totalInCategory} entities
                                </span>
                              </div>
                              
                              {/* Direct entities (no type) */}
                              {categoryData.direct.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs text-slate-500 mb-1">Direct ({categoryData.direct.length})</p>
                                  <div className="space-y-1">
                                    {categoryData.direct.slice(0, 3).map(entity => (
                                      <div key={entity.entity_pk} className="text-xs text-slate-700 pl-2">
                                        • {entity.entity_name}
                                      </div>
                                    ))}
                                    {categoryData.direct.length > 3 && (
                                      <div className="text-xs text-slate-500 pl-2">
                                        + {categoryData.direct.length - 3} more
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {/* Types */}
                              {Object.keys(categoryData.types).length > 0 && (
                                <div className="space-y-2">
                                  {Object.entries(categoryData.types).map(([typeId, entities]) => (
                                    <div key={typeId} className="pl-4 border-l-2 border-slate-100">
                                      <p className="text-xs font-medium text-slate-700">
                                        Type: {typeId} ({entities.length})
                                      </p>
                                      <div className="space-y-1 mt-1">
                                        {entities.slice(0, 2).map(entity => (
                                          <div key={entity.entity_pk} className="text-xs text-slate-600 pl-2">
                                            • {entity.entity_name}
                                          </div>
                                        ))}
                                        {entities.length > 2 && (
                                          <div className="text-xs text-slate-500 pl-2">
                                            + {entities.length - 2} more
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'modify-branch' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Modify Branch</h3>
              <p className="text-xs text-slate-500 mt-1">
                Move entities between domain/category/type branches
              </p>
            </div>

            <div className="text-center py-12 text-slate-500">
              <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Branch modification coming soon</p>
              <p className="text-sm mt-1">Select an entity from Active Entities to move it</p>
            </div>
          </div>
        )}

        {activeTab === 'stopped' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Stopped/Deleted Entities</h3>
              <p className="text-xs text-slate-500 mt-1">
                Entities that have been deactivated or removed
              </p>
            </div>

            {stoppedEntities.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No stopped entities</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stoppedEntities.map(entity => (
                  <div key={entity.entity_pk} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <h5 className="font-bold text-slate-700">{entity.entity_name}</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Stopped on: {new Date(entity.assignedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
