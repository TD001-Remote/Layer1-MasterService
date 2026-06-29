/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Building2, MapPin, Upload, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { StagingEntity, StagingNonEntity } from "../types";
import { getAllEntityDomains, getAllNonEntityDomains, Domain, Category } from "../data/domains";

type TabType = 'create-entity' | 'create-non-entity' | 'upload-csv' | 'pending-review' | 'approved';

export default function StagingAreaNew() {
  const [activeTab, setActiveTab] = useState<TabType>('create-entity');
  const [stagingEntities, setStagingEntities] = useState<StagingEntity[]>([]);
  const [stagingNonEntities, setStagingNonEntities] = useState<StagingNonEntity[]>([]);

  // Entity form state
  const [entityName, setEntityName] = useState('');
  const [entityPhone, setEntityPhone] = useState('');
  const [entityDomain, setEntityDomain] = useState('');
  const [entityCategory, setEntityCategory] = useState('');
  const [isAssetProvider, setIsAssetProvider] = useState(false);
  const [isServiceProvider, setIsServiceProvider] = useState(true);

  // Non-Entity form state
  const [nonEntityName, setNonEntityName] = useState('');
  const [nonEntityDomain, setNonEntityDomain] = useState('');
  const [nonEntityCategory, setNonEntityCategory] = useState('');

  const entityDomains = getAllEntityDomains();
  const nonEntityDomains = getAllNonEntityDomains();

  // Get categories for selected domain
  const getEntityCategories = (): Category[] => {
    const domain = entityDomains.find(d => d.code === entityDomain);
    return domain?.categories || [];
  };

  const getNonEntityCategories = (): Category[] => {
    const domain = nonEntityDomains.find(d => d.code === nonEntityDomain);
    return domain?.categories || [];
  };

  // Handle create entity
  const handleCreateEntity = () => {
    if (!entityName || !entityDomain || !entityCategory) {
      alert('Please fill all required fields');
      return;
    }

    if (!isAssetProvider && !isServiceProvider) {
      alert('Entity must be either Asset Provider, Service Provider, or both');
      return;
    }

    const newEntity: StagingEntity = {
      id: `STAGE-ENT-${Date.now()}`,
      entity_name: entityName,
      phone: entityPhone || undefined,
      domain_code: entityDomain,
      category_id: entityCategory,
      roles: {
        isAssetProvider,
        isServiceProvider
      },
      status: 'pending',
      uploadedAt: new Date().toISOString()
    };

    setStagingEntities([...stagingEntities, newEntity]);
    
    // Reset form
    setEntityName('');
    setEntityPhone('');
    setIsAssetProvider(false);
    setIsServiceProvider(true);
    
    alert('Entity created in staging! Admin will review and assign geo/zone.');
  };

  // Handle create non-entity
  const handleCreateNonEntity = () => {
    if (!nonEntityName || !nonEntityDomain || !nonEntityCategory) {
      alert('Please fill all required fields');
      return;
    }

    const newNonEntity: StagingNonEntity = {
      id: `STAGE-NENT-${Date.now()}`,
      non_entity_name: nonEntityName,
      domain_code: nonEntityDomain,
      category_id: nonEntityCategory,
      status: 'pending',
      uploadedAt: new Date().toISOString()
    };

    setStagingNonEntities([...stagingNonEntities, newNonEntity]);
    
    // Reset form
    setNonEntityName('');
    
    alert('Non-Entity created in staging! Admin will review and assign geo.');
  };

  // Handle approve/reject
  const handleApprove = (id: string, type: 'entity' | 'non-entity') => {
    if (type === 'entity') {
      setStagingEntities(prev => 
        prev.map(e => e.id === id ? { ...e, status: 'approved' as const } : e)
      );
    } else {
      setStagingNonEntities(prev => 
        prev.map(ne => ne.id === id ? { ...ne, status: 'approved' as const } : ne)
      );
    }
  };

  const handleReject = (id: string, type: 'entity' | 'non-entity') => {
    if (type === 'entity') {
      setStagingEntities(prev => prev.filter(e => e.id !== id));
    } else {
      setStagingNonEntities(prev => prev.filter(ne => ne.id !== id));
    }
  };

  const pendingEntities = stagingEntities.filter(e => e.status === 'pending');
  const approvedEntities = stagingEntities.filter(e => e.status === 'approved');
  const pendingNonEntities = stagingNonEntities.filter(ne => ne.status === 'pending');
  const approvedNonEntities = stagingNonEntities.filter(ne => ne.status === 'approved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">Staging Area</h2>
        <p className="text-sm text-slate-600 mt-1">
          Create entities and non-entities. Admin assigns geo/zone after approval.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('create-entity')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'create-entity'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="inline w-4 h-4 mr-1" />
          Create Entity
        </button>
        <button
          onClick={() => setActiveTab('create-non-entity')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'create-non-entity'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="inline w-4 h-4 mr-1" />
          Create Non-Entity
        </button>
        <button
          onClick={() => setActiveTab('upload-csv')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'upload-csv'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="inline w-4 h-4 mr-1" />
          Upload CSV
        </button>
        <button
          onClick={() => setActiveTab('pending-review')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
            activeTab === 'pending-review'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Pending Review
          {(pendingEntities.length + pendingNonEntities.length) > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
              {pendingEntities.length + pendingNonEntities.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors relative ${
            activeTab === 'approved'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Approved
          {(approvedEntities.length + approvedNonEntities.length) > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
              {approvedEntities.length + approvedNonEntities.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {activeTab === 'create-entity' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Entity (Service Provider)</h3>
            <p className="text-xs text-slate-500">
              Entities are people or organizations that provide services or own assets. No geo/zone required yet.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Entity Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g., Hospital Trust, Restaurant Owner"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  value={entityPhone}
                  onChange={(e) => setEntityPhone(e.target.value)}
                  placeholder="e.g., 9876543210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Domain <span className="text-red-500">*</span>
                </label>
                <select
                  value={entityDomain}
                  onChange={(e) => {
                    setEntityDomain(e.target.value);
                    setEntityCategory(''); // Reset category
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Domain</option>
                  {entityDomains.map(domain => (
                    <option key={domain.code} value={domain.code}>
                      {domain.name} ({domain.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={entityCategory}
                  onChange={(e) => setEntityCategory(e.target.value)}
                  disabled={!entityDomain}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                >
                  <option value="">Select Category</option>
                  {getEntityCategories().map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2 p-4 bg-slate-50 rounded-lg">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Entity Roles <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isAssetProvider}
                    onChange={(e) => setIsAssetProvider(e.target.checked)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm text-slate-700">Asset Provider (Owner)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isServiceProvider}
                    onChange={(e) => setIsServiceProvider(e.target.checked)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className="text-sm text-slate-700">Service Provider (Operator)</span>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Example: Restaurant owner = both roles, Freelance plumber = service provider only
              </p>
            </div>

            <button
              onClick={handleCreateEntity}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Entity in Staging
            </button>
          </div>
        )}

        {activeTab === 'create-non-entity' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Non-Entity (Physical Asset)</h3>
            <p className="text-xs text-slate-500">
              Non-entities are physical assets like buildings, land, infrastructure. No geo required yet.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Non-Entity Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nonEntityName}
                  onChange={(e) => setNonEntityName(e.target.value)}
                  placeholder="e.g., Shop Space, Hospital Building"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Domain <span className="text-red-500">*</span>
                </label>
                <select
                  value={nonEntityDomain}
                  onChange={(e) => {
                    setNonEntityDomain(e.target.value);
                    setNonEntityCategory(''); // Reset category
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Domain</option>
                  {nonEntityDomains.map(domain => (
                    <option key={domain.code} value={domain.code}>
                      {domain.name} ({domain.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={nonEntityCategory}
                  onChange={(e) => setNonEntityCategory(e.target.value)}
                  disabled={!nonEntityDomain}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                >
                  <option value="">Select Category</option>
                  {getNonEntityCategories().map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleCreateNonEntity}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Non-Entity in Staging
            </button>
          </div>
        )}

        {activeTab === 'upload-csv' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Upload CSV</h3>
            <p className="text-sm text-slate-600">CSV upload feature coming soon...</p>
          </div>
        )}

        {activeTab === 'pending-review' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Pending Review</h3>
            
            {pendingEntities.length === 0 && pendingNonEntities.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No pending records to review</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pending Entities */}
                {pendingEntities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Entities</h4>
                    <div className="space-y-2">
                      {pendingEntities.map(entity => (
                        <div key={entity.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-slate-900">{entity.entity_name}</h5>
                            <p className="text-xs text-slate-500 mt-1">
                              Domain: {entity.domain_code} | Category: {entity.category_id}
                            </p>
                            <p className="text-xs text-slate-500">
                              Roles: {entity.roles.isAssetProvider && 'Asset Provider'} 
                              {entity.roles.isAssetProvider && entity.roles.isServiceProvider && ' + '}
                              {entity.roles.isServiceProvider && 'Service Provider'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(entity.id, 'entity')}
                              className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium"
                            >
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(entity.id, 'entity')}
                              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium"
                            >
                              <XCircle className="w-3 h-3 inline mr-1" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pending Non-Entities */}
                {pendingNonEntities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Non-Entities</h4>
                    <div className="space-y-2">
                      {pendingNonEntities.map(nonEntity => (
                        <div key={nonEntity.id} className="border border-slate-200 rounded-lg p-4 flex justify-between items-start">
                          <div>
                            <h5 className="font-bold text-slate-900">{nonEntity.non_entity_name}</h5>
                            <p className="text-xs text-slate-500 mt-1">
                              Domain: {nonEntity.domain_code} | Category: {nonEntity.category_id}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(nonEntity.id, 'non-entity')}
                              className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium"
                            >
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(nonEntity.id, 'non-entity')}
                              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium"
                            >
                              <XCircle className="w-3 h-3 inline mr-1" />
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'approved' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Approved (Awaiting Geo/Zone Assignment)</h3>
            <p className="text-sm text-slate-600">
              These records are approved and ready for geo/zone assignment by admin in the Registry.
            </p>
            
            {approvedEntities.length === 0 && approvedNonEntities.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No approved records yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Approved Entities */}
                {approvedEntities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Entities ({approvedEntities.length})</h4>
                    <div className="space-y-2">
                      {approvedEntities.map(entity => (
                        <div key={entity.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                          <h5 className="font-bold text-slate-900">{entity.entity_name}</h5>
                          <p className="text-xs text-slate-600 mt-1">
                            Domain: {entity.domain_code} | Category: {entity.category_id}
                          </p>
                          <span className="inline-block mt-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded">
                            Ready for Assignment
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approved Non-Entities */}
                {approvedNonEntities.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3">Non-Entities ({approvedNonEntities.length})</h4>
                    <div className="space-y-2">
                      {approvedNonEntities.map(nonEntity => (
                        <div key={nonEntity.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                          <h5 className="font-bold text-slate-900">{nonEntity.non_entity_name}</h5>
                          <p className="text-xs text-slate-600 mt-1">
                            Domain: {nonEntity.domain_code} | Category: {nonEntity.category_id}
                          </p>
                          <span className="inline-block mt-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded">
                            Ready for Assignment
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
