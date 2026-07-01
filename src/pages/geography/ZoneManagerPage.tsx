/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { MapPin, Edit, Trash2, RotateCcw, Archive, Plus, Search, Globe, Landmark, Building2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

type ZoneLevel = 'city' | 'area' | 'street' | 'substreet';

interface ArchivedItem {
  id: string;
  name: string;
  level: 'state' | 'district' | 'taluk' | 'city' | 'area' | 'street' | 'substreet';
  originalId: string;
  archivedAt: string;
  archivedBy: string;
}

export default function GeoZoneManagerPage() {
  const { 
    states, districts, taluks, 
    cities, setCities, areas, setAreas, streets, setStreets, substreets, setSubstreets,
    addCity, addArea, addStreet, addSubstreet,
    getDistrictsByState, getTaluksByDistrict 
  } = useData();
  
  const [activeLevel, setActiveLevel] = useState<ZoneLevel>('city');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  
  // Geo path selection
  const [geoPath, setGeoPath] = useState<{ state: string; district: string; taluk: string }>({ state: '', district: '', taluk: '' });
  
  // Parent selection
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  const stateDistricts = geoPath.state ? getDistrictsByState(geoPath.state) : [];
  const districtTaluks = geoPath.district ? getTaluksByDistrict(geoPath.district) : [];
  const talukCities = geoPath.taluk ? cities.filter(c => c.talukId === geoPath.taluk) : [];
  const cityAreas = selectedCity ? areas.filter(a => a.cityVillageId === selectedCity) : [];
  const areaStreets = selectedArea ? streets.filter(s => s.areaId === selectedArea) : [];

  // Filter zones based on geo path - only show when path is selected
  const filteredZones = useMemo(() => {
    if (!geoPath.taluk) return [];
    
    switch (activeLevel) {
      case 'city':
        return cities.filter(c => c.talukId === geoPath.taluk);
      case 'area':
        if (!selectedCity) return [];
        return areas.filter(a => a.cityVillageId === selectedCity);
      case 'street':
        if (!selectedArea) return [];
        return streets.filter(s => s.areaId === selectedArea);
      case 'substreet':
        // For substreet, we need selected area
        if (!selectedArea) return [];
        return substreets.filter(sub => {
          const street = streets.find(s => s.id === sub.streetId);
          return street && street.areaId === selectedArea;
        });
      default:
        return [];
    }
  }, [geoPath.taluk, activeLevel, cities, areas, streets, substreets, selectedCity, selectedArea]);

  const handleArchiveZone = (zoneId: string, zoneName: string, level: ZoneLevel, parentId: string) => {
    const archive: ArchivedItem = {
      id: `ARCH-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: zoneName,
      level,
      originalId: zoneId,
      archivedAt: new Date().toISOString(),
      archivedBy: 'admin',
    };

    const existingArchive = JSON.parse(localStorage.getItem('geoZoneArchive') || '[]');
    localStorage.setItem('geoZoneArchive', JSON.stringify([...existingArchive, archive]));

    if (level === 'city') {
      setCities(prev => prev.filter(c => c.id !== zoneId));
    } else if (level === 'area') {
      setAreas(prev => prev.filter(a => a.id !== zoneId));
    } else if (level === 'street') {
      setStreets(prev => prev.filter(s => s.id !== zoneId));
    } else if (level === 'substreet') {
      setSubstreets(prev => prev.filter(s => s.id !== zoneId));
    }
  };

  const handleAddZone = async () => {
    const safeName = addName.trim().replace(/[<>"'&]/g, '');
    if (!safeName) return;

    try {
      if (activeLevel === 'city' && geoPath.taluk) {
        await addCity(safeName, geoPath.taluk);
      } else if (activeLevel === 'area' && selectedCity) {
        await addArea(safeName, selectedCity);
      } else if (activeLevel === 'street' && selectedArea) {
        const count = streets.filter(s => s.areaId === selectedArea).length;
        if (count >= 200) {
          alert('Maximum 200 streets per area reached');
          return;
        }
        await addStreet(safeName, selectedArea);
      } else if (activeLevel === 'substreet') {
        const parentStreet = streets.find(s => s.areaId === selectedArea);
        if (!parentStreet) return;
        await addSubstreet(safeName, parentStreet.id);
      }
      setShowAddModal(false);
      setAddName('');
    } catch (err) {
      console.error('Failed to add zone:', String(err).replace(/[\r\n]/g, ' '));
    }
  };

  const getParentLabel = () => {
    switch (activeLevel) {
      case 'city': return 'Taluk';
      case 'area': return 'City/Village';
      case 'street': return 'Area/Ward';
      case 'substreet': return 'Street';
    }
  };

  const levelLabel = {
    city: 'Cities/Villages',
    area: 'Areas/Wards',
    street: 'Streets',
    substreet: 'Substreets/Lanes'
  } as const;

  const canAdd = () => {
    if (activeLevel === 'city') return !!geoPath.taluk;
    if (activeLevel === 'area') return !!selectedCity;
    if (activeLevel === 'street') return !!selectedArea;
    if (activeLevel === 'substreet') return !!selectedArea;
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight">Geo-Zone Manager</h2>
            <p className="text-sm text-slate-600 mt-1">Modify, archive, and change geo for zones</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{(cities.length + areas.length + streets.length + substreets.length).toLocaleString()}</div>
            <div className="text-xs text-slate-500">Total Zones</div>
          </div>
        </div>

        {/* Zone Type Selection */}
        <div className="border-b border-slate-200 mb-4">
          <div className="flex gap-4">
            {(['city', 'area', 'street', 'substreet'] as ZoneLevel[]).map(level => (
              <button
                key={level}
                onClick={() => {
                  setActiveLevel(level);
                  setSelectedCity('');
                  setSelectedArea('');
                }}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeLevel === level
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {levelLabel[level]}
              </button>
            ))}
          </div>
        </div>

        {/* Zone Table - Only shows when geo path is selected */}
        {geoPath.taluk ? (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Parent</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(() => {
                  const parentKey = activeLevel === 'city' ? 'talukId' :
                                    activeLevel === 'area' ? 'cityVillageId' :
                                    activeLevel === 'street' ? 'areaId' : 'streetId';
                  return filteredZones.slice(0, 50).map(zone => (
                    <tr key={zone.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-mono text-slate-600">{zone.id}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{zone.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 font-mono">{zone[parentKey]}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => alert('Geo change feature coming soon')}
                            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" 
                            title="Change Geo"
                          >
                            <Globe className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleArchiveZone(zone.id, zone.name, activeLevel, zone[parentKey])}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Archive"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
            {filteredZones.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No {activeLevel}s found in selected geography.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 border border-slate-200 rounded-lg">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Select a geographic location</p>
            <p className="text-sm">Choose State → District → Taluk to view zones</p>
          </div>
        )}

        {geoPath.taluk && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setShowAddModal(true)}
              disabled={!canAdd()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add {levelLabel[activeLevel]}
            </button>
          </div>
        )}

        {/* Geo Path Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-4 border-t">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
            <select
              value={geoPath.state}
              onChange={(e) => setGeoPath({ ...geoPath, state: e.target.value, district: '', taluk: '' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            >
              <option value="">Select State...</option>
              {states.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
            <select
              value={geoPath.district}
              onChange={(e) => setGeoPath({ ...geoPath, district: e.target.value, taluk: '' })}
              disabled={!geoPath.state}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-50"
            >
              <option value="">Select District...</option>
              {stateDistricts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Taluk</label>
            <select
              value={geoPath.taluk}
              onChange={(e) => setGeoPath({ ...geoPath, taluk: e.target.value })}
              disabled={!geoPath.district}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg disabled:opacity-50"
            >
              <option value="">Select Taluk...</option>
              {districtTaluks.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          {/* Parent selection for area/street/substreet */}
          {activeLevel !== 'city' && geoPath.taluk && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {getParentLabel()}
              </label>
              {activeLevel === 'area' && (
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select City...</option>
                  {talukCities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
              {activeLevel === 'street' && selectedCity && (
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select Area...</option>
                  {cityAreas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              )}
              {activeLevel === 'substreet' && selectedArea && (
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Select Area...</option>
                  {cityAreas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Zone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New {levelLabel[activeLevel]}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Zone Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Enter zone name..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-slate-100 rounded-lg font-medium">
                  Cancel
                </button>
                <button onClick={handleAddZone} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}