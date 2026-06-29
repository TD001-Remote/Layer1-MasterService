/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NON-ENTITY PAGE 1: ASSIGN GEO
 * Purpose: Assign geographic location to non-entities from CSV imports (zone optional)
 */

import React, { useState } from "react";
import { Home, MapPin, Save, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllNonEntityDomains, getNonEntityCategoryById } from "../data/domains";
import { useData } from "../contexts/DataContext";
import { GeoData, BranchHierarchy } from "../types";

export default function NonEntityAssignGeo() {
  const navigate = useNavigate();
  const { getStagingNonEntities, assignNonEntityToRegistry, states, districts, taluks, zoneRefs } = useData();
  
  // Get approved staging non-entities (from CSV import)
  const allStagingNonEntities = getStagingNonEntities();
  const pendingAssignment = allStagingNonEntities.filter(ne => ne.status === 'approved');
  
  // Selected non-entity for assignment
  const [selectedNonEntityId, setSelectedNonEntityId] = useState<string | null>(null);
  const selectedNonEntity = pendingAssignment.find(ne => ne.id === selectedNonEntityId);

  // Geo form state
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [talukId, setTalukId] = useState('');
  const [zonePk, setZonePk] = useState('');
  const [type, setType] = useState('');

  const filteredDistricts = stateId ? districts.filter(d => d.stateId === stateId) : districts;
  const filteredTaluks = districtId ? taluks.filter(t => t.districtId === districtId) : taluks;
  const filteredZones = talukId ? zoneRefs.filter(z => z.talukId === talukId) : zoneRefs;

  const handleSelectNonEntity = (nonEntityId: string) => {
    setSelectedNonEntityId(nonEntityId);
    // Reset form
    setStateId('');
    setDistrictId('');
    setTalukId('');
    setZonePk('');
    setType('');
  };

  const handleAssign = async () => {
    if (!selectedNonEntity) return;

    if (!stateId || !districtId || !talukId) {
      alert('Please select State, District, and Taluk (required for non-entities, zone optional)');
      return;
    }

    const categoryInfo = getNonEntityCategoryById(selectedNonEntity.category_id);
    if (!categoryInfo) {
      alert('Invalid category information');
      return;
    }

    const geoData: GeoData = {
      stateId,
      districtId,
      talukId,
      zone_pk: zonePk || undefined // Optional for non-entities
    };

    const hierarchy: BranchHierarchy = {
      domain: categoryInfo.domain.code,
      category: selectedNonEntity.category_id,
      type: type || undefined
    };

    try {
      await assignNonEntityToRegistry(selectedNonEntity.id, geoData, hierarchy);
      // Reset selection
      setSelectedNonEntityId(null);
      alert('Non-entity assigned successfully!');
    } catch (err) {
      console.error('Assignment failed:', err);
      alert('Failed to assign non-entity');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Home className="w-7 h-7 text-emerald-600" />
              Non-Entity Assignment - Geo Location
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Assign geographic location to non-entities imported from CSV (zone optional)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-600">{pendingAssignment.length}</div>
              <div className="text-xs text-slate-500">Pending Assignment</div>
            </div>
            <button
              onClick={() => navigate('/non-entity-manage')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-2"
            >
              Manage Non-Entities
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: Non-Entity List (from CSV import) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Non-Entities from CSV Import
          </h3>
          <p className="text-sm text-slate-500 mb-4">
            Select a non-entity to assign geo location
          </p>

          {pendingAssignment.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Home className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No non-entities pending assignment</p>
              <p className="text-sm mt-1">Import CSV from Staging Area</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {pendingAssignment.map(nonEntity => {
                const categoryInfo = getNonEntityCategoryById(nonEntity.category_id);
                const isSelected = selectedNonEntityId === nonEntity.id;
                
                return (
                  <button
                    key={nonEntity.id}
                    onClick={() => handleSelectNonEntity(nonEntity.id)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50'
                        : 'border-slate-200 hover:border-emerald-300 bg-white'
                    }`}
                  >
                    <div className="font-bold text-slate-900">{nonEntity.non_entity_name}</div>
                    <div className="text-sm text-slate-600 mt-1">Non-Entity</div>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">
                        {categoryInfo?.domain.name}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">
                        {categoryInfo?.category.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Geo Assignment Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {!selectedNonEntity ? (
            <div className="text-center py-16 text-slate-400">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a non-entity from the left</p>
              <p className="text-sm mt-1">to assign geographic location</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Assign Geo Location</h3>
                <p className="text-sm text-slate-500">
                  State/District/Taluk required, Zone optional (for area-level assets)
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
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
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
                    onChange={(e) => setTalukId(e.target.value)}
                    disabled={!districtId}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100"
                  >
                     <option value="">Select Taluk</option>
                     {taluks.filter(t => t.districtId === districtId).map(t => (
                       <option key={t.id} value={t.id}>{t.name}</option>
                     ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Zone PK (Optional - for precise location)
                  </label>
                  <select
                    value={zonePk}
                    onChange={(e) => setZonePk(e.target.value)}
                    disabled={!talukId}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 font-mono text-sm"
                  >
                     <option value="">No specific zone (area-level asset)</option>
                     {filteredZones.map(z => (
                       <option key={z.zone_pk} value={z.zone_pk}>
                         {z.fullAddress}
                       </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Leave empty for broad assets like parks, infrastructure
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
                      placeholder="e.g., Corner Shop, Type-A"
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleAssign}
                  disabled={!stateId || !districtId || !talukId}
                  className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
