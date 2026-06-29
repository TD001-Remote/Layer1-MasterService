/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building2, MapPin, FolderTree } from "lucide-react";
import { GeoData, BranchHierarchy } from "../types";
import { getAllEntityDomains, getEntityCategoryById } from "../data/domains";

export default function EntityAssignment() {
  const { stagingId } = useParams<{ stagingId: string }>();
  const navigate = useNavigate();
  
  // Mock staging entity data - would come from DataContext
  const stagingEntity = {
    id: stagingId || '',
    entity_name: 'Sample Hospital',
    phone: '9876543210',
    domain_code: 'HLT-SRV',
    category_id: 'CAT-HLTSRV-003',
    roles: {
      isAssetProvider: true,
      isServiceProvider: true
    }
  };

  const categoryInfo = getEntityCategoryById(stagingEntity.category_id);
  const domains = getAllEntityDomains();

  // Geo form state
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [talukId, setTalukId] = useState('');
  const [cityVillageId, setCityVillageId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [streetId, setStreetId] = useState('');
  const [substreetId, setSubstreetId] = useState('');
  const [zonePk, setZonePk] = useState('');

  // Branch form state
  const [domain, setDomain] = useState(stagingEntity.domain_code);
  const [category, setCategory] = useState(stagingEntity.category_id);
  const [type, setType] = useState('');

  // Mock geo data - would come from DataContext
  const mockStates = [
    { id: 'GEO-TN', name: 'Tamil Nadu' },
    { id: 'GEO-PY', name: 'Puducherry' }
  ];

  const mockDistricts = [
    { id: 'GEO-TN-MAY', stateId: 'GEO-TN', name: 'Mayiladuthurai' },
    { id: 'GEO-TN-TJ', stateId: 'GEO-TN', name: 'Thanjavur' }
  ];

  const mockTaluks = [
    { id: 'GEO-TN-MAY-SIR', districtId: 'GEO-TN-MAY', name: 'Sirkazhi' },
    { id: 'GEO-TN-MAY-KUT', districtId: 'GEO-TN-MAY', name: 'Kuthalam' }
  ];

  const mockZones = [
    { zone_pk: 'ZON-TN-MAY-SIR-CITY1-AREA1-STR1', fullAddress: 'Sirkazhi Town, North Ward, Main Street' },
    { zone_pk: 'ZON-TN-MAY-SIR-CITY1-AREA1-STR2', fullAddress: 'Sirkazhi Town, North Ward, South Car Street' }
  ];

  const getCategories = () => {
    const selectedDomain = domains.find(d => d.code === domain);
    return selectedDomain?.categories || [];
  };

  const handleSave = () => {
    // Validate required fields
    if (!stateId || !districtId || !talukId || !zonePk) {
      alert('Please fill all required geo fields: State, District, Taluk, and Zone PK');
      return;
    }

    if (!domain || !category) {
      alert('Please select Domain and Category');
      return;
    }

    const geoData: GeoData = {
      stateId,
      districtId,
      talukId,
      cityVillageId: cityVillageId || undefined,
      areaId: areaId || undefined,
      streetId: streetId || undefined,
      substreetId: substreetId || undefined,
      zone_pk: zonePk
    };

    const hierarchy: BranchHierarchy = {
      domain,
      category,
      type: type || undefined
    };

    console.log('Assigning entity:', {
      stagingId,
      geoData,
      hierarchy
    });

    // Would call DataContext method to move from staging to registry
    alert('Entity assigned to registry! (Mock - will integrate with DataContext)');
    navigate('/entity-registry');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/entity-registry')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Assign Geo/Zone to Entity</h2>
          <p className="text-sm text-slate-600 mt-1">
            Assign geographic location and branch hierarchy to approved entity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Entity Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Entity Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-medium">Entity Name</label>
                <p className="text-sm font-bold text-slate-900 mt-1">{stagingEntity.entity_name}</p>
              </div>
              
              {stagingEntity.phone && (
                <div>
                  <label className="text-xs text-slate-500 font-medium">Phone</label>
                  <p className="text-sm font-mono text-slate-700 mt-1">{stagingEntity.phone}</p>
                </div>
              )}
              
              <div>
                <label className="text-xs text-slate-500 font-medium">Domain</label>
                <p className="text-sm text-slate-700 mt-1">{categoryInfo?.domain.name}</p>
              </div>
              
              <div>
                <label className="text-xs text-slate-500 font-medium">Category</label>
                <p className="text-sm text-slate-700 mt-1">{categoryInfo?.category.name}</p>
              </div>
              
              <div>
                <label className="text-xs text-slate-500 font-medium">Roles</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {stagingEntity.roles.isAssetProvider && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                      Asset Provider
                    </span>
                  )}
                  {stagingEntity.roles.isServiceProvider && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                      Service Provider
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 font-medium">
                <strong>Note:</strong> Zone PK is required for entities. This ensures full address tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Assignment Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Geographic Assignment */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-600" />
              Geographic Assignment
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={stateId}
                  onChange={(e) => {
                    setStateId(e.target.value);
                    setDistrictId('');
                    setTalukId('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select State</option>
                  {mockStates.map(state => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={districtId}
                  onChange={(e) => {
                    setDistrictId(e.target.value);
                    setTalukId('');
                  }}
                  disabled={!stateId}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                >
                  <option value="">Select District</option>
                  {mockDistricts
                    .filter(d => d.stateId === stateId)
                    .map(district => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Taluk <span className="text-red-500">*</span>
                </label>
                <select
                  value={talukId}
                  onChange={(e) => setTalukId(e.target.value)}
                  disabled={!districtId}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                >
                  <option value="">Select Taluk</option>
                  {mockTaluks
                    .filter(t => t.districtId === districtId)
                    .map(taluk => (
                      <option key={taluk.id} value={taluk.id}>{taluk.name}</option>
                    ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Zone PK <span className="text-red-500">*</span>
                </label>
                <select
                  value={zonePk}
                  onChange={(e) => setZonePk(e.target.value)}
                  disabled={!talukId}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 font-mono text-sm"
                >
                  <option value="">Select Zone</option>
                  {mockZones.map(zone => (
                    <option key={zone.zone_pk} value={zone.zone_pk}>
                      {zone.zone_pk} - {zone.fullAddress}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Zone PK includes: City/Village → Area → Street → Substreet
                </p>
              </div>
            </div>
          </div>

          {/* Branch Hierarchy */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-indigo-600" />
              Branch Hierarchy
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Domain <span className="text-red-500">*</span>
                </label>
                <select
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value);
                    setCategory('');
                    setType('');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Domain</option>
                  {domains.map(d => (
                    <option key={d.code} value={d.code}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setType('');
                  }}
                  disabled={!domain}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                >
                  <option value="">Select Category</option>
                  {getCategories().map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type (Optional)
                </label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g., Multi-Specialty, General, Specialty (optional for branching)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty to place directly under category. Add type for deeper branching.
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Storage Path:</strong> {' '}
                {domain && category ? (
                  <code className="font-mono text-xs">
                    entity-registry/domains/{domain}/categories/{category}
                    {type ? `/types/${type}` : ''}/entity/&#123;entity_pk&#125;
                  </code>
                ) : (
                  <span className="text-slate-500">Select domain and category first</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate('/entity-registry')}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save to Registry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
