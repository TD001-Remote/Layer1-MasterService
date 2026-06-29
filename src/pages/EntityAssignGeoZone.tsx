/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ENTITY PAGE 1: ASSIGN GEO/ZONE
 * Purpose: Assign geographic location and zone to entities from CSV imports
 */

import React, { useState } from "react";
import { Building2, MapPin, Save, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllEntityDomains, getEntityCategoryById } from "../data/domains";
import { useData } from "../contexts/DataContext";
import { GeoData, BranchHierarchy } from "../types";

export default function EntityAssignGeoZone() {
  const navigate = useNavigate();
  const { getStagingEntities, assignEntityToRegistry, states, districts, taluks, cities, areas, streets, zoneRefs } = useData();
  
  // Get approved staging entities (from CSV import)
  const allStagingEntities = getStagingEntities();
  const pendingAssignment = allStagingEntities.filter(e => e.status === 'approved');
  
  // Selected entity for assignment
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const selectedEntity = pendingAssignment.find(e => e.id === selectedEntityId);

  // Geo/Zone form state
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [talukId, setTalukId] = useState('');
  const [cityId, setCityId] = useState('');
  const [areaId, setAreaId] = useState('');
  const [streetId, setStreetId] = useState('');
  const [zonePk, setZonePk] = useState('');
  const [type, setType] = useState('');

  const filteredDistricts = stateId ? districts.filter(d => d.stateId === stateId) : districts;
  const filteredTaluks = districtId ? taluks.filter(t => t.districtId === districtId) : taluks;
  const filteredCities = talukId ? cities.filter(c => c.talukId === talukId) : cities;
  const filteredAreas = cityId ? areas.filter(a => a.cityVillageId === cityId) : areas;
  const filteredStreets = areaId ? streets.filter(s => s.areaId === areaId) : streets;
  const filteredZones = streetId ? zoneRefs.filter(z => z.streetId === streetId) : zoneRefs;

  const handleSelectEntity = (entityId: string) => {
    setSelectedEntityId(entityId);
    // Reset form
    setStateId('');
    setDistrictId('');
    setTalukId('');
    setCityId('');
    setAreaId('');
    setStreetId('');
    setZonePk('');
    setType('');
  };

  const handleAssign = async () => {
    if (!selectedEntity) return;

    if (!stateId || !districtId || !talukId || !zonePk) {
      alert('Please select State, District, Taluk, and Zone PK (all required for entities)');
      return;
    }

    const categoryInfo = getEntityCategoryById(selectedEntity.category_id);
    if (!categoryInfo) {
      alert('Invalid category information');
      return;
    }

    const geoData: GeoData = {
      stateId,
      districtId,
      talukId,
      cityVillageId: cityId || undefined,
      areaId: areaId || undefined,
      streetId: streetId,
      substreetId: zoneRefs.find(z => z.zone_pk === zonePk)?.substreetId || undefined,
      zone_pk: zonePk
    };

    const hierarchy: BranchHierarchy = {
      domain: categoryInfo.domain.code,
      category: selectedEntity.category_id,
      type: type || undefined
    };

    try {
      await assignEntityToRegistry(selectedEntity.id, geoData, hierarchy);
      // Reset selection
      setSelectedEntityId(null);
      alert('Entity assigned successfully!');
    } catch (err) {
      console.error('Assignment failed:', err);
      alert('Failed to assign entity');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-indigo-600" />
              Entity Assignment - Geo/Zone
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Assign geographic location and zone to entities imported from CSV
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">{pendingAssignment.length}</div>
              <div className="text-xs text-slate-500">Pending Assignment</div>
            </div>
            <button
              onClick={() => navigate('/entity-manage')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-2"
            >
              Manage Entities
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: Entity List (from CSV import) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Entities from CSV Import
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Select an entity to assign geo/zone location
          </p>

          {pendingAssignment.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No entities pending assignment</p>
              <p className="text-sm mt-1">Import CSV from Staging Area</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {pendingAssignment.map(entity => {
                const categoryInfo = getEntityCategoryById(entity.category_id);
                const isSelected = selectedEntityId === entity.id;
                
                return (
                  <button
                    key={entity.id}
                    onClick={() => handleSelectEntity(entity.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{entity.entity_name}</div>
                    {entity.phone && (
                      <div className="text-sm text-slate-600 mt-1">📞 {entity.phone}</div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">
                        {categoryInfo?.domain.name}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">
                        {categoryInfo?.category.name}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-1">
                      {entity.roles.isAssetProvider && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          Asset Provider
                        </span>
                      )}
                      {entity.roles.isServiceProvider && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                          Service Provider
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Geo/Zone Assignment Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {!selectedEntity ? (
            <div className="text-center py-16 text-slate-400">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Select an entity from the left</p>
              <p className="text-sm mt-1">to assign geographic location and zone</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Assign Geo/Zone</h3>
                <p className="text-sm text-slate-500">
                  All fields required for entities (exact location tracking)
                </p>
              </div>

              {/* Geo Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={stateId}
                    onChange={(e) => {
                      setStateId(e.target.value);
                      setDistrictId('');
                      setTalukId('');
                      setZonePk('');
                    }}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                     <option value="">Select State</option>
                     {states.map(s => (
                       <option key={s.id} value={s.id}>{s.name}</option>
                     ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={districtId}
                    onChange={(e) => {
                      setDistrictId(e.target.value);
                      setTalukId('');
                      setZonePk('');
                    }}
                    disabled={!stateId}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  >
                     <option value="">Select District</option>
                     {districts.filter(d => d.stateId === stateId).map(d => (
                       <option key={d.id} value={d.id}>{d.name}</option>
                     ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Taluk <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={talukId}
                    onChange={(e) => {
                      setTalukId(e.target.value);
                      setZonePk('');
                    }}
                    disabled={!districtId}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  >
                     <option value="">Select Taluk</option>
                     {taluks.filter(t => t.districtId === districtId).map(t => (
                       <option key={t.id} value={t.id}>{t.name}</option>
                     ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Zone PK (Full Address) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={zonePk}
                    onChange={(e) => setZonePk(e.target.value)}
                    disabled={!talukId}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 font-mono text-sm"
                  >
                     <option value="">Select Zone</option>
                     {zoneRefs.filter(z => z.talukId === talukId).map(z => (
                       <option key={z.zone_pk} value={z.zone_pk}>
                         {z.fullAddress}
                       </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Zone PK includes full address hierarchy
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Type (Optional - for sub-categorization)
                    </label>
                    <input
                      type="text"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      placeholder="e.g., Multi-Specialty, Type-A"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleAssign}
                  disabled={!stateId || !districtId || !talukId || !zonePk}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Assign to Registry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
