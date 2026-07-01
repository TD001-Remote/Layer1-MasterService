/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Search, Building2, Landmark, Globe, Plus, Edit, Trash2, X } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

type GeoLevel = 'state' | 'district' | 'taluk';

interface ArchivedItem {
  id: string;
  name: string;
  level: 'state' | 'district' | 'taluk' | 'city' | 'area' | 'street' | 'substreet';
  originalId: string;
  archivedAt: string;
  archivedBy: string;
}

export default function GeoPage() {
  const { 
    states, 
    districts, 
    taluks, 
    getDistrictsByState, 
    getTaluksByDistrict,
    addState,
    updateStateItem,
    deleteStateItem,
    addDistrict,
    updateDistrictItem,
    deleteDistrictItem,
    addTaluk,
    updateTalukItem,
    deleteTalukItem,
  } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['GEO-TN']));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [addLevel, setAddLevel] = useState<GeoLevel>('district');
  const [addName, setAddName] = useState('');
  const [addParentId, setAddParentId] = useState('');
  const [editLevel, setEditLevel] = useState<GeoLevel>('district');
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editParentId, setEditParentId] = useState('');

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleAddGeo = async () => {
    const safeName = addName.trim().replace(/[<>"'&]/g, '');
    if (!safeName) return;

    try {
      if (addLevel === 'state') {
        await addState(safeName);
      } else if (addLevel === 'district' && addParentId) {
        await addDistrict(safeName, addParentId);
      } else if (addLevel === 'taluk' && addParentId) {
        await addTaluk(safeName, addParentId);
      }
      setShowAddModal(false);
      setAddName('');
      setAddParentId('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditGeo = async () => {
    const safeName = editName.trim().replace(/[<>"'&]/g, '');
    if (!safeName || !editId) return;

    try {
      if (editLevel === 'state') {
        await updateStateItem(editId, safeName);
      } else if (editLevel === 'district') {
        await updateDistrictItem(editId, safeName, editParentId);
      } else if (editLevel === 'taluk') {
        await updateTalukItem(editId, safeName, editParentId);
      }
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGeo = async (id: string, level: GeoLevel, name: string) => {
    if (!confirm(`Are you sure you want to delete this ${level} "${name}"? This will move it to archive.`)) return;

    try {
      // Archive before deletion
      const archive: ArchivedItem = {
        id: `ARCH-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name,
        level,
        originalId: id,
        archivedAt: new Date().toISOString(),
        archivedBy: 'admin',
      };

      const existingArchive = JSON.parse(localStorage.getItem('geoZoneArchive') || '[]');
      localStorage.setItem('geoZoneArchive', JSON.stringify([...existingArchive, archive]));

      if (level === 'state') {
        await deleteStateItem(id, name);
      } else if (level === 'district') {
        await deleteDistrictItem(id, name);
      } else if (level === 'taluk') {
        await deleteTalukItem(id, name);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (level: GeoLevel, id: string, name: string, parentId: string) => {
    setEditLevel(level);
    setEditId(id);
    setEditName(name);
    setEditParentId(parentId);
    setShowEditModal(true);
  };

  const filteredStates = useMemo(() => {
    if (!searchTerm) return states;
    return states.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, states]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight">Geographic Hierarchy</h2>
            <p className="text-sm text-slate-600 mt-1">States, Districts & Taluks structure - CRUD enabled</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{districts.length}</div>
              <div className="text-xs text-slate-500">Districts</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-emerald-600">{states.length}</div>
              <div className="text-xs text-slate-500">States</div>
            </div>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search geographic locations..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {filteredStates.map(state => {
            const stateDistricts = getDistrictsByState(state.id);
            const stateTaluks = stateDistricts.flatMap(d => getTaluksByDistrict(d.id));
            const isExpanded = expandedNodes.has(state.id);

            return (
              <div key={state.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors">
                  <button
                    onClick={() => toggleNode(state.id)}
                    className="flex items-center gap-3"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-blue-600" />
                    )}
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-bold text-slate-900">{state.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{state.id}</div>
                    </div>
                  </button>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-slate-600">{stateTaluks.length} Taluks</span>
                    <button
                      onClick={() => openEditModal('state', state.id, state.name, '')}
                      className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit state"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGeo(state.id, 'state', state.name)}
                      className="p-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete state"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-2 bg-white">
                    {stateDistricts.map(district => {
                      const taluksList = getTaluksByDistrict(district.id);
                      const isDistrictExpanded = expandedNodes.has(district.id);

                      return (
                        <div key={district.id} className="ml-4 border-l-2 border-blue-200 pl-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg">
                            <button
                              onClick={() => toggleNode(district.id)}
                              className="flex items-center gap-2"
                            >
                              {isDistrictExpanded ? (
                                <ChevronDown className="w-4 h-4 text-slate-600" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-600" />
                              )}
                              <Landmark className="w-4 h-4 text-slate-600" />
                              <div className="text-left">
                                <div className="font-medium text-slate-900">{district.name}</div>
                                <div className="text-xs text-slate-500 font-mono">{district.id}</div>
                              </div>
                            </button>
                            <div className="flex gap-1 items-center">
                              <button
                                onClick={() => openEditModal('district', district.id, district.name, state.id)}
                                className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit district"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteGeo(district.id, 'district', district.name)}
                                className="p-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded"
                                title="Delete district"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {isDistrictExpanded && taluksList.length > 0 && (
                            <div className="ml-4 mt-2 space-y-1">
                              {taluksList.map(taluk => (
                                <div key={taluk.id} className="flex items-center justify-between p-2 text-xs bg-slate-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <Building2 className="w-3 h-3 text-slate-500" />
                                    <span className="font-medium text-slate-700">{taluk.name}</span>
                                    <span className="text-slate-500 font-mono">({taluk.id})</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => openEditModal('taluk', taluk.id, taluk.name, district.id)}
                                      className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                      title="Edit taluk"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteGeo(taluk.id, 'taluk', taluk.name)}
                                      className="p-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded"
                                      title="Delete taluk"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setAddLevel('state'); setAddParentId(''); setShowAddModal(true); }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add State
        </button>
        <button
          onClick={() => { setAddLevel('district'); setAddParentId(states[0]?.id || ''); setShowAddModal(true); }}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add District
        </button>
        <button
          onClick={() => { setAddLevel('taluk'); setAddParentId(districts[0]?.id || ''); setShowAddModal(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Taluk
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {states.map(state => (
          <div key={state.id} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
            <div className="text-3xl font-bold text-blue-600">{getDistrictsByState(state.id).length}</div>
            <div className="text-sm font-medium text-slate-700 mt-1">{state.name} Districts</div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add {addLevel}</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter name..."
                />
              </div>
              {(addLevel === 'taluk' || addLevel === 'district') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {addLevel === 'taluk' ? 'District' : 'State'}
                  </label>
                  <select
                    value={addParentId}
                    onChange={(e) => setAddParentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select parent...</option>
                    {addLevel === 'taluk' && districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                    ))}
                    {addLevel === 'district' && states.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium">
                  Cancel
                </button>
                <button onClick={handleAddGeo} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Edit {editLevel}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter name..."
                />
              </div>
              {(editLevel === 'taluk' || editLevel === 'district') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {editLevel === 'taluk' ? 'District' : 'State'}
                  </label>
                  <select
                    value={editParentId}
                    onChange={(e) => setEditParentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select parent...</option>
                    {editLevel === 'taluk' && districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.id})</option>
                    ))}
                    {editLevel === 'district' && states.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium">
                  Cancel
                </button>
                <button onClick={handleEditGeo} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}