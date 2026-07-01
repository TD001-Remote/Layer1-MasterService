/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Globe, Landmark, Building2, Search, MapPin } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

type ZoneLevel = 'city' | 'area' | 'street' | 'substreet';

export default function ZonePage() {
  const { 
    states, districts, taluks, 
    cities, areas, streets, substreets, 
    addCity, addArea, addStreet, addSubstreet, 
    getDistrictsByState, getTaluksByDistrict 
  } = useData();
  
  const [zoneName, setZoneName] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<ZoneLevel>('city');
  const [geoPath, setGeoPath] = useState<{ state: string; district: string; taluk: string }>({ state: '', district: '', taluk: '' });
  const [parentPath, setParentPath] = useState<{ city: string; area: string; street: string }>({ city: '', area: '', street: '' });

  const stateDistricts = geoPath.state ? getDistrictsByState(geoPath.state) : [];
  const districtTaluks = geoPath.district ? getTaluksByDistrict(geoPath.district) : [];
  const talukCities = geoPath.taluk ? cities.filter(c => c.talukId === geoPath.taluk) : [];
  const cityAreas = parentPath.city ? areas.filter(a => a.cityVillageId === parentPath.city) : [];
  const areaStreets = parentPath.area ? streets.filter(s => s.areaId === parentPath.area) : [];

  const levelLabel = {
    city: 'City/Village',
    area: 'Area/Ward',
    street: 'Street',
    substreet: 'Substreet/Lane'
  } as const;

  const getParentLabel = () => {
    switch (selectedLevel) {
      case 'city': return 'Taluk';
      case 'area': return 'City/Village';
      case 'street': return 'Area/Ward';
      case 'substreet': return 'Street';
    }
  };

  const handleAddZone = async () => {
    const safeName = zoneName.trim().replace(/[<>"'&]/g, '');
    if (!safeName) return;

    try {
      if (selectedLevel === 'city' && geoPath.taluk) {
        await addCity(safeName, geoPath.taluk);
      } else if (selectedLevel === 'area' && parentPath.city) {
        await addArea(safeName, parentPath.city);
      } else if (selectedLevel === 'street' && parentPath.area) {
        const count = streets.filter(s => s.areaId === parentPath.area).length;
        if (count >= 200) {
          alert('Maximum 200 streets per area reached');
          return;
        }
        await addStreet(safeName, parentPath.area);
      } else if (selectedLevel === 'substreet' && parentPath.street) {
        await addSubstreet(safeName, parentPath.street);
      }
      setZoneName('');
    } catch (err) {
      console.error('Failed to add zone:', String(err).replace(/[\r\n]/g, ' '));
    }
  };

  const getParentValue = () => {
    switch (selectedLevel) {
      case 'city': return geoPath.taluk;
      case 'area': return parentPath.city;
      case 'street': return parentPath.area;
      case 'substreet': return parentPath.street;
    }
  };

  const isReadyToAdd = () => {
    const parent = getParentValue();
    return zoneName.trim() && parent;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight">Zone Creation</h2>
            <p className="text-sm text-slate-600 mt-1">Select geography first, then create zones</p>
          </div>
        </div>

        {/* Zone Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Zone Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['city', 'area', 'street', 'substreet'] as ZoneLevel[]).map(level => (
                <button
                  key={level}
                  onClick={() => {
                    setSelectedLevel(level);
                    setParentPath({ city: '', area: '', street: '' });
                  }}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedLevel === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {levelLabel[level]}
                </button>
              ))}
            </div>
          </div>

          {/* Zone Name Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Zone Name</label>
            <input
              type="text"
              value={zoneName}
              onChange={(e) => setZoneName(e.target.value)}
              placeholder="Enter zone name..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddZone}
              disabled={!isReadyToAdd()}
              className="mt-2 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add {levelLabel[selectedLevel]}
            </button>
          </div>
        </div>

        {/* Geo Path Selection - State/District/Taluk */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
            <select
              value={geoPath.state}
              onChange={(e) => setGeoPath({ ...geoPath, state: e.target.value, district: '', taluk: '' })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
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
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg disabled:opacity-50"
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
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg disabled:opacity-50"
            >
              <option value="">Select Taluk...</option>
              {districtTaluks.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Parent Selection - only shown when needed */}
        {selectedLevel !== 'city' && geoPath.taluk && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
            {selectedLevel === 'area' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent City/Village</label>
                <select
                  value={parentPath.city}
                  onChange={(e) => setParentPath({ ...parentPath, city: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                >
                  <option value="">Select City...</option>
                  {talukCities.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            {selectedLevel === 'street' && parentPath.city && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent Area</label>
                <select
                  value={parentPath.area}
                  onChange={(e) => setParentPath({ ...parentPath, area: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                >
                  <option value="">Select Area...</option>
                  {cityAreas.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            )}
            {selectedLevel === 'substreet' && parentPath.area && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent Street</label>
                <select
                  value={parentPath.street}
                  onChange={(e) => setParentPath({ ...parentPath, street: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg"
                >
                  <option value="">Select Street...</option>
                  {areaStreets.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="text-xs text-slate-500 self-end pb-2">
              {getParentLabel()} must be selected to add {levelLabel[selectedLevel]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}