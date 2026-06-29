/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MapPin, UserCheck, FolderTree, GitBranch, Archive, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StagingNonEntity, RegistryNonEntity } from "../types";
import { getAllNonEntityDomains, getNonEntityCategoryById } from "../data/domains";

type TabType = 'pending-assignment' | 'active-non-entities' | 'modify-branch' | 'stopped';

export default function NonEntityRegistry() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('pending-assignment');
  
  // Mock data - will be replaced with DataContext
  const [approvedStaging, setApprovedStaging] = useState<StagingNonEntity[]>([]);
  const [activeNonEntities, setActiveNonEntities] = useState<RegistryNonEntity[]>([]);
  const [stoppedNonEntities, setStoppedNonEntities] = useState<RegistryNonEntity[]>([]);

  const domains = getAllNonEntityDomains();

  // Group active non-entities by domain/category for tree view
  const nonEntityTree = activeNonEntities.reduce((acc, nonEntity) => {
    if (!acc[nonEntity.domain]) {
      acc[nonEntity.domain] = {};
    }
    if (!acc[nonEntity.domain][nonEntity.category]) {
      acc[nonEntity.domain][nonEntity.category] = {
        direct: [],
        types: {}
      };
    }
    
    if (nonEntity.type) {
      if (!acc[nonEntity.domain][nonEntity.category].types[nonEntity.type]) {
        acc[nonEntity.domain][nonEntity.category].types[nonEntity.type] = [];
      }
      acc[nonEntity.domain][nonEntity.category].types[nonEntity.type].push(nonEntity);
    } else {
      acc[nonEntity.domain][nonEntity.category].direct.push(nonEntity);
    }
    
    return acc;
  }, {} as Record<string, Record<string, { direct: RegistryNonEntity[], types: Record<string, RegistryNonEntity[]> }>>);

  const handleAssignGeo = (stagingId: string) => {
    navigate(`/non-entity-registry/assign/${stagingId}`);
  };

  const handleModifyBranch = (nonEntityPk: string) => {
    navigate(`/non-entity-registry/modify/${nonEntityPk}`);
  };

  const handleViewDetails = (nonEntityPk: string) => {
    navigate(`/non-entity-registry/${nonEntityPk}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-7 h-7 text-emerald-600" />
              Non-Entity Registry
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Manage physical assets and infrastructure with geo assignment
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">{activeNonEntities.length}</div>
            <div className="text-xs text-slate-500">Active Non-Entities</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('pending-assignment')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
            activeTab === 'pending-assignment'
              ? 'border-emerald-600 text-emerald-600'
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
          onClick={() => setActiveTab('active-non-entities')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'active-non-entities'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FolderTree className="inline w-4 h-4 mr-1" />
          Active Non-Entities
          {activeNonEntities.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
              {activeNonEntities.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('modify-branch')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'modify-branch'
              ? 'border-emerald-600 text-emerald-600'
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
              ? 'border-emerald-600 text-emerald-600'
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
                <h3 className="text-lg font-bold text-slate-900">Pending Geo Assignment</h3>
                <p className="text-xs text-slate-500 mt-1">
                  These non-entities are approved from staging and need geo assignment (zone optional)
                </p>
              </div>
            </div>

            {approvedStaging.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No non-entities awaiting assignment</p>
                <p className="text-sm mt-1">Approved non-entities from staging will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvedStaging.map(nonEntity => {
                  const categoryInfo = getNonEntityCategoryById(nonEntity.category_id);
                  
                  return (
                    <div key={nonEntity.id} className="border border-amber-200 bg-amber-50 rounded-lg p-4 flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-bold text-slate-900">{nonEntity.non_entity_name}</h5>
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-medium">
                                {categoryInfo?.domain.name}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded font-medium">
                                {categoryInfo?.category.name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                              Physical asset - requires State/District/Taluk (zone optional)
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssignGeo(nonEntity.id)}
                        className="ml-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Assign Geo
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'active-non-entities' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Active Non-Entities - Tree View</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Physical assets organized by domain → category → type hierarchy
                </p>
              </div>
            </div>

            {activeNonEntities.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No active non-entities yet</p>
                <p className="text-sm mt-1">Assign geo to approved non-entities to see them here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(nonEntityTree).map(([domainCode, categories]) => {
                  const domain = domains.find(d => d.code === domainCode);
                  
                  return (
                    <div key={domainCode} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          <FolderTree className="w-4 h-4 text-emerald-600" />
                          {domain?.name || domainCode}
                        </h4>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        {Object.entries(categories).map(([categoryId, categoryData]) => {
                          const categoryInfo = getNonEntityCategoryById(categoryId);
                          const totalInCategory = categoryData.direct.length + 
                            Object.values(categoryData.types).reduce((sum, entities) => sum + entities.length, 0);
                          
                          return (
                            <div key={categoryId} className="pl-4 border-l-2 border-slate-200">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-bold text-slate-800 text-sm">
                                  {categoryInfo?.category.name || categoryId}
                                </h5>
                                <span className="text-xs text-slate-500 font-medium">
                                  {totalInCategory} non-entities
                                </span>
                              </div>
                              
                              {/* Direct non-entities (no type) */}
                              {categoryData.direct.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs text-slate-500 mb-1">Direct ({categoryData.direct.length})</p>
                                  <div className="space-y-1">
                                    {categoryData.direct.slice(0, 3).map(nonEntity => (
                                      <div key={nonEntity.non_entity_pk} className="text-xs text-slate-700 pl-2">
                                        • {nonEntity.non_entity_name}
                                        {nonEntity.linkedEntities.assetProvider && (
                                          <span className="ml-2 text-blue-600">(Owner linked)</span>
                                        )}
                                        {nonEntity.linkedEntities.serviceProvider && (
                                          <span className="ml-2 text-purple-600">(Operator linked)</span>
                                        )}
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
                                  {Object.entries(categoryData.types).map(([typeId, nonEntities]) => (
                                    <div key={typeId} className="pl-4 border-l-2 border-slate-100">
                                      <p className="text-xs font-medium text-slate-700">
                                        Type: {typeId} ({nonEntities.length})
                                      </p>
                                      <div className="space-y-1 mt-1">
                                        {nonEntities.slice(0, 2).map(nonEntity => (
                                          <div key={nonEntity.non_entity_pk} className="text-xs text-slate-600 pl-2">
                                            • {nonEntity.non_entity_name}
                                          </div>
                                        ))}
                                        {nonEntities.length > 2 && (
                                          <div className="text-xs text-slate-500 pl-2">
                                            + {nonEntities.length - 2} more
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
                Move non-entities between domain/category/type branches
              </p>
            </div>

            <div className="text-center py-12 text-slate-500">
              <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Branch modification coming soon</p>
              <p className="text-sm mt-1">Select a non-entity from Active Non-Entities to move it</p>
            </div>
          </div>
        )}

        {activeTab === 'stopped' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Stopped/Deleted Non-Entities</h3>
              <p className="text-xs text-slate-500 mt-1">
                Non-entities that have been deactivated or removed
              </p>
            </div>

            {stoppedNonEntities.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Archive className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">No stopped non-entities</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stoppedNonEntities.map(nonEntity => (
                  <div key={nonEntity.non_entity_pk} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <h5 className="font-bold text-slate-700">{nonEntity.non_entity_name}</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Stopped on: {new Date(nonEntity.assignedAt).toLocaleDateString()}
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
