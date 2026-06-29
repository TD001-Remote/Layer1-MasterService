/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, MapPin, FolderTree } from "lucide-react";
import { GeoData, BranchHierarchy } from "../types";
import { getAllNonEntityDomains, getNonEntityCategoryById } from "../data/domains";
import { useData } from "../contexts/DataContext";

export default function NonEntityAssignment() {
  const { stagingId } = useParams<{ stagingId: string }>();
  const navigate = useNavigate();
  
  // Use DataContext
  const { getStagingNonEntities, assignNonEntityToRegistry, zoneRefs } = useData();
  
  // Get staging non-entity
  const stagingNonEntity = getStagingNonEntities().find(ne => ne.id === stagingId);
  
  if (!stagingNonEntity) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Staging non-entity not found</p>
        <button onClick={() => navigate('/non-entity-registry')} className="mt-4 text-emerald-600">
          Back to Registry
        </button>
      </div>
    );
  }
  
  // Get domain/category info from staging non-entity
  const categoryInfo = stagingNonEntity.category_id ? getNonEntityCategoryById(stagingNonEntity.category_id) : undefined;
  const domains = getAllNonEntityDomains();
  
  // Geo form state
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [talukId, setTalukId] = useState('');
  const [cityVillageId, setCityVillageId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [streetId, setStreetId] = useState('');
  const [substreetId, setSubstreetId] = useState('');
  const [zonePk, setZonePk] = useState('');
  
  // Branch form state - initialize from staging or empty
  const [domain, setDomain] = useState(categoryInfo?.domain.code || '');
  const [category, setCategory] = useState(stagingNonEntity.category_id || '');
  const [type, setType] = useState('');
  
  // Mock geo data
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
  
  const handleDomainChange = (domainCode: string) => {
    setDomain(domainCode);
    setCategory(''); // Reset category when domain changes
    setType('');
  };
  
  const handleCategoryChange = (categoryId: string) => {
    setCategory(categoryId);
    setType(''); // Reset type when category changes
  };
  
  const handleSave = async () => {
    // Validate required fields (only state/district/taluk required for non-entities)
    if (!stateId || !districtId || !talukId) {
      alert('Please fill required geo fields: State, District, and Taluk');
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
      zone_pk: zonePk || undefined // Optional for non-entities
    };
  
    const hierarchy: BranchHierarchy = {
      domain,
      category,
      type: type || undefined
    };
  
    try {
      await assignNonEntityToRegistry(stagingId!, geoData, hierarchy);
      navigate('/non-entity-registry');
    } catch (err) {
      console.error('Assignment failed:', err);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/non-entity-registry')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Assign Geo to Non-Entity</h2>
          <p className="text-sm text-slate-600 mt-1">
            Assign geographic location and branch hierarchy to approved non-entity
          </p>
        </div>
      </div>
  
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Non-Entity Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Non-Entity Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 font-medium">Non-Entity Name</label>
                <p className="text-sm font-bold text-slate-900 mt-1">{stagingNonEntity.non_entity_name}</p>
              </div>
              
              <div>
                <label className="text-xs text-slate-500 font-medium">Domain</label>
                <p className="text-sm text-slate-700 mt-1">{categoryInfo?.domain.name}</p>
              </div>
              
              <div>
                <label className="text-xs text-slate-500 font-medium">Category</label>
                <p className="text-sm text-slate-700 mt-1">{categoryInfo?.category.name}</p>
              </div>
              
              <div className="p-3 bg-slate-100 rounded-lg">
                <p className="text-xs text-slate-700">
                  <strong>Type:</strong> Non-Entity
                </p>
              </div>
            </div>
  
            <div className="mt-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-xs text-emerald-800 font-medium">
                <strong>Note:</strong> Zone PK is optional for non-entities. Only State/District/Taluk required.
              </p>
            </div>
          </div>
        </div>
  
        {/* Right: Assignment Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Geographic Assignment */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                >
                  <option value="">Select District</option>
                  {mockDistricts
                    .filter(d => d.stateId === stateId)
                    .map(district => (
                      <option key={district.id} value={district.id}>{district.name}</option>
                    ))}
                </select>
              </div>
  
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Taluk <span className="text-red-500">*</span>
                </label>
                <select
                  value={talukId}
                  onChange={(e) => setTalukId(e.target.value)}
                  disabled={!districtId}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
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
                  Zone PK (Optional)
                </label>
                <select
                  value={zonePk}
                  onChange={(e) => setZonePk(e.target.value)}
                  disabled={!talukId}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 font-mono text-sm"
                >
                  <option value="">No specific zone (area-level asset)</option>
                  {mockZones.map(zone => (
                    <option key={zone.zone_pk} value={zone.zone_pk}>
                      {zone.zone_pk} - {zone.fullAddress}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  For broad assets like parks or infrastructure, zone can be left empty
                </p>
              </div>
            </div>
          </div>
  
          {/* Branch Hierarchy */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-emerald-600" />
              Branch Hierarchy (Domain → Category → Type)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Domain <span className="text-red-500">*</span>
                </label>
                <select
                  value={domain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={!domain}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                >
                  <option value="">Select Category</option>
                  {domains.find(d => d.code === domain)?.categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
  
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Type (Optional - for sub-branching)
                </label>
                <input
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="e.g., Corner Shop, Ground Floor, Type-A (optional)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty to place directly under category. Add type for deeper branching/organization.
                </p>
              </div>
            </div>
  
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-xs text-emerald-800">
                <strong>Storage Path Preview:</strong><br />
                {domain && category ? (
                  <code className="font-mono text-xs mt-1 block">
                    non-entity-registry/domains/{domain}/categories/{category}
                    {type ? `/types/${type}` : ''}/non-entity/&#123;non_entity_pk&#125;
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
              onClick={() => navigate('/non-entity-registry')}
              className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2"
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