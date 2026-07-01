/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { RotateCcw, Search, Globe, Landmark, Building2, MapPin, Trash2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

type RecoveryLevel = 'state' | 'district' | 'taluk' | 'city' | 'area' | 'street' | 'substreet';

interface ArchivedItem {
  id: string;
  name: string;
  level: RecoveryLevel;
  archivedAt: string;
  archivedBy: string;
  originalId: string;
}

export default function GeoZoneRecoveryPage() {
  const { states, setStates, districts, setDistricts, taluks, setTaluks, cities, setCities, areas, setAreas, streets, setStreets, substreets, setSubstreets } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<RecoveryLevel>('state');
  const [archivedItems, setArchivedItems] = useState<ArchivedItem[]>([]);

  const loadArchivedItems = () => {
    const stored = localStorage.getItem('geoZoneArchive');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setArchivedItems(parsed.filter((item: ArchivedItem) => item.level === selectedLevel));
      } catch {}
    }
  };

  const archivedStates = useMemo(() => 
    archivedItems.filter(item => item.level === 'state'), 
  [archivedItems]);
  const archivedDistricts = useMemo(() => 
    archivedItems.filter(item => item.level === 'district'), 
  [archivedItems]);
  const archivedTaluks = useMemo(() => 
    archivedItems.filter(item => item.level === 'taluk'), 
  [archivedItems]);
  const archivedCities = useMemo(() => 
    archivedItems.filter(item => item.level === 'city'), 
  [archivedItems]);
  const archivedAreas = useMemo(() => 
    archivedItems.filter(item => item.level === 'area'), 
  [archivedItems]);
  const archivedStreets = useMemo(() => 
    archivedItems.filter(item => item.level === 'street'), 
  [archivedItems]);
  const archivedSubstreets = useMemo(() => 
    archivedItems.filter(item => item.level === 'substreet'), 
  [archivedItems]);

  const handleRecover = async (item: ArchivedItem) => {
    try {
      const archivedData = JSON.parse(localStorage.getItem('geoZoneArchive') || '[]');
      const updated = archivedData.filter((a: ArchivedItem) => a.id !== item.id);
      localStorage.setItem('geoZoneArchive', JSON.stringify(updated));

      if (item.level === 'state') {
        setStates((prev: typeof states) => [...prev, { id: item.originalId, name: item.name }]);
      } else if (item.level === 'district') {
        const parentState = item.originalId.split('-').slice(0, 2).join('-');
        setDistricts((prev: typeof districts) => [...prev, { id: item.originalId, stateId: parentState, name: item.name }]);
      } else if (item.level === 'taluk') {
        const parentId = item.originalId.substring(0, item.originalId.lastIndexOf('-'));
        setTaluks((prev: typeof taluks) => [...prev, { id: item.originalId, districtId: parentId, name: item.name }]);
      } else if (item.level === 'city') {
        const parentId = item.originalId.substring(0, item.originalId.lastIndexOf('-'));
        setCities((prev: typeof cities) => [...prev, { id: item.originalId, talukId: parentId, name: item.name }]);
      } else if (item.level === 'area') {
        const parentId = item.originalId.substring(0, item.originalId.lastIndexOf('-'));
        setAreas((prev: typeof areas) => [...prev, { id: item.originalId, cityVillageId: parentId, name: item.name }]);
      } else if (item.level === 'street') {
        const parentId = item.originalId.substring(0, item.originalId.lastIndexOf('-'));
        setStreets((prev: typeof streets) => [...prev, { id: item.originalId, areaId: parentId, name: item.name, substreetsCount: 0 }]);
      } else if (item.level === 'substreet') {
        const parentId = item.originalId.substring(0, item.originalId.lastIndexOf('-'));
        setSubstreets((prev: typeof substreets) => [...prev, { id: item.originalId, streetId: parentId, name: item.name }]);
      }

      setArchivedItems((prev: ArchivedItem[]) => prev.filter(a => a.id !== item.id));
      
      if (window.confirm) {
        window.confirm = (msg: string) => { alert(msg); return true; };
      }
      alert(`Recovered ${item.level}: ${item.name}`);
    } catch (err) {
      console.error('Recover failed:', err);
    }
  };

  const handlePermanentlyDelete = (item: ArchivedItem) => {
    const archivedData = JSON.parse(localStorage.getItem('geoZoneArchive') || '[]');
    const updated = archivedData.filter((a: ArchivedItem) => a.id !== item.id);
    localStorage.setItem('geoZoneArchive', JSON.stringify(updated));
    setArchivedItems((prev: ArchivedItem[]) => prev.filter(a => a.id !== item.id));
    alert(`Permanently deleted ${item.level}: ${item.name}`);
  };

  const filteredItems = useMemo(() => {
    const items = selectedLevel === 'state' ? archivedStates :
                 selectedLevel === 'district' ? archivedDistricts :
                 selectedLevel === 'taluk' ? archivedTaluks :
                 selectedLevel === 'city' ? archivedCities :
                 selectedLevel === 'area' ? archivedAreas :
                 selectedLevel === 'street' ? archivedStreets : archivedSubstreets;
    
    if (!searchTerm) return items;
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.originalId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, selectedLevel, archivedStates, archivedDistricts, archivedTaluks, archivedCities, archivedAreas, archivedStreets, archivedSubstreets]);

  const getLevelLabel = () => {
    const labels: Record<RecoveryLevel, string> = {
      state: 'States',
      district: 'Districts',
      taluk: 'Taluks',
      city: 'Cities/Villages',
      area: 'Areas/Wards',
      street: 'Streets',
      substreet: 'Substreets/Lanes'
    };
    return labels[selectedLevel];
  };

  React.useEffect(() => {
    loadArchivedItems();
  }, [selectedLevel]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight">Geo-Zone Recovery</h2>
            <p className="text-sm text-slate-600 mt-1">Recover archived geographic locations and zones</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-600">{filteredItems.length}</div>
            <div className="text-xs text-slate-500">Archived Items</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {(['state', 'district', 'taluk', 'city', 'area', 'street', 'substreet'] as RecoveryLevel[]).map(level => {
            const LevelIcon = level === 'state' ? Globe : level === 'district' ? Landmark : level === 'taluk' ? Building2 : MapPin;
            return (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedLevel === level
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <LevelIcon className="w-3.5 h-3.5 inline mr-1" />
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            );
          })}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Search archived ${getLevelLabel()}...`}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[500px] overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No archived {selectedLevel}s found. Archive items from their respective managers.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Archived</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{item.originalId}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(item.archivedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleRecover(item)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                          title="Recover"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePermanentlyDelete(item)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}