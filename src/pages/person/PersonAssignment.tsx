/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Users, ChevronRight, X, Search, Link, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import { Person, PersonEntityLink, ActiveEntity, NonEntity } from "../../types";

export default function PersonAssignment() {
  const navigate = useNavigate();
  const { activeEntities, nonEntities, createPerson, persons } = useData();
   
  const [name, setName] = useState('');
  const [selectedEntities, setSelectedEntities] = useState<PersonEntityLink[]>([]);
  const [selectedNonEntities, setSelectedNonEntities] = useState<string[]>([]);
  const [parentPersonPk, setParentPersonPk] = useState<string | null>(null);
   
  // Search states
  const [entitySearch, setEntitySearch] = useState('');
  const [nonEntitySearch, setNonEntitySearch] = useState('');
  const [showEntityDropdown, setShowEntityDropdown] = useState(false);
  const [showNonEntityDropdown, setShowNonEntityDropdown] = useState(false);
  const [showParentDropdown, setShowParentDropdown] = useState(false);
   
  // Filter entities and non-entities
  const filteredEntities = activeEntities
    .filter(e => e.status === 'active')
    .filter(e => !selectedEntities.some(se => se.entity_pk === e.entity_pk))
    .filter(e => !entitySearch || e.entity_name.toLowerCase().includes(entitySearch.toLowerCase()) || e.entity_pk.toLowerCase().includes(entitySearch.toLowerCase()));
   
  const filteredNonEntities = nonEntities
    .filter(n => n.status === 'active')
    .filter(n => !selectedNonEntities.includes(n.non_entity_pk))
    .filter(n => !nonEntitySearch || n.non_entity_name.toLowerCase().includes(nonEntitySearch.toLowerCase()) || n.non_entity_pk.toLowerCase().includes(nonEntitySearch.toLowerCase()));
   
  const activePersons = persons.filter(p => p.status === 'active');
   
  const handleAddEntity = (entity: ActiveEntity) => {
    const nextOrder = selectedEntities.length > 0 
      ? Math.max(...selectedEntities.map(e => e.order)) + 1 
      : 1;
    setSelectedEntities(prev => [...prev, { entity_pk: entity.entity_pk, order: nextOrder }]);
    setEntitySearch('');
    setShowEntityDropdown(false);
  };
   
  const handleRemoveEntity = (entity_pk: string) => {
    setSelectedEntities(prev => prev.filter(e => e.entity_pk !== entity_pk));
  };
   
  const handleReorderEntity = (index: number, direction: 'up' | 'down') => {
    const newEntities = [...selectedEntities];
    if (direction === 'up' && index > 0) {
      [newEntities[index], newEntities[index - 1]] = [newEntities[index - 1], newEntities[index]];
    } else if (direction === 'down' && index < newEntities.length - 1) {
      [newEntities[index], newEntities[index + 1]] = [newEntities[index + 1], newEntities[index]];
    }
    // Update order numbers
    newEntities.forEach((e, i) => e.order = i + 1);
    setSelectedEntities(newEntities);
  };
   
  const handleAddNonEntity = (nonEntity: NonEntity) => {
    setSelectedNonEntities(prev => [...prev, nonEntity.non_entity_pk]);
    setNonEntitySearch('');
    setShowNonEntityDropdown(false);
  };
   
  const handleRemoveNonEntity = (non_entity_pk: string) => {
    setSelectedNonEntities(prev => prev.filter(n => n !== non_entity_pk));
  };
   
  const handleCreate = async () => {
    if (!name.trim() || selectedEntities.length === 0) {
      alert('Person name is required and at least one entity must be selected');
      return;
    }
   
    const nextPkNum = persons.length + 1;
    const newPerson: Person = {
      person_pk: `PER-${String(nextPkNum).padStart(6, '0')}`,
      name: name.trim(),
      entities: selectedEntities,
      non_entities: selectedNonEntities,
      parent_person_pk: parentPersonPk,
      status: 'active',
      statusLog: [],
      createdAt: new Date().toISOString(),
      assignedBy: 'admin',
    };
   
    try {
      await createPerson(newPerson);
      setName('');
      setSelectedEntities([]);
      setSelectedNonEntities([]);
      setParentPersonPk(null);
      alert(`Person created successfully as ${newPerson.person_pk}`);
    } catch (err) {
      console.error('Create failed:', err);
      alert('Failed to create person');
    }
  };
   
  const getEntityById = (pk: string) => activeEntities.find(e => e.entity_pk === pk);
  const getNonEntityById = (pk: string) => nonEntities.find(n => n.non_entity_pk === pk);
   
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/person-manage')}
              className="p-2 hover:bg-surface-100 rounded-xl transition-colors border border-transparent hover:border-surface-200"
            >
              <ChevronRight className="w-5 h-5 text-surface-500 rotate-180" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight">Person Assignment</h2>
              <p className="text-sm text-surface-500 mt-0.5 font-semibold">
                Create a new Person record linking entities and non-entities
              </p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={!name.trim() || selectedEntities.length === 0}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-brand-500/20 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Create Person
          </button>
        </div>
      </div>
   
      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Person Details */}
        <div className="bg-white rounded-xl border border-surface-200 p-6">
          <h3 className="text-lg font-bold text-surface-900 mb-4">Person Details</h3>
           
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-surface-700 mb-2">Person Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Kovai Land Group"
                className="w-full px-4 py-2.5 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
           
            {/* Parent Person Link */}
            <div>
              <label className="block text-sm font-bold text-surface-700 mb-2">Parent Person (Optional)</label>
              <div className="relative">
                <input
                  type="text"
                  value={parentPersonPk || ''}
                  onChange={(e) => setParentPersonPk(e.target.value || null)}
                  onFocus={() => setShowParentDropdown(true)}
                  placeholder="Search parent person..."
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {showParentDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-surface-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {activePersons.map(p => (
                      <button
                        key={p.person_pk}
                        onClick={() => {
                          setParentPersonPk(p.person_pk);
                          setShowParentDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-surface-50 text-sm"
                      >
                        {p.name} ({p.person_pk})
                      </button>
                    ))}
                    <button
                      onClick={() => setShowParentDropdown(false)}
                      className="w-full px-4 py-2 text-center text-surface-500 border-t border-surface-100"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
       
        {/* RIGHT: Entity & Non-Entity Selection */}
        <div className="space-y-6">
          {/* Entities */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h3 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Entities * (Min 1)
            </h3>
           
            {/* Search & Add */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                value={entitySearch}
                onChange={(e) => setEntitySearch(e.target.value)}
                onFocus={() => setShowEntityDropdown(true)}
                placeholder="Search entity to add..."
                className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {showEntityDropdown && entitySearch && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-surface-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredEntities.slice(0, 10).map(e => (
                    <button
                      key={e.entity_pk}
                      onClick={() => handleAddEntity(e)}
                      className="w-full px-4 py-2 text-left hover:bg-surface-50 text-sm flex items-center justify-between"
                    >
                      <span>{e.entity_name}</span>
                      <span className="text-xs font-mono text-surface-500">{e.entity_pk}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowEntityDropdown(false)}
                    className="w-full px-4 py-2 text-center text-surface-500 border-t border-surface-100"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    Close
                  </button>
                </div>
              )}
            </div>
           
            {/* Selected Entities */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedEntities.map((se, index) => {
                const entity = getEntityById(se.entity_pk);
                return entity ? (
                  <div key={se.entity_pk} className="flex items-center justify-between bg-surface-50 rounded-lg px-3 py-2.5">
                    <div className="flex-1">
                      <div className="font-medium text-surface-900">{entity.entity_name}</div>
                      <div className="text-xs font-mono text-surface-500">{entity.entity_pk} • Order: {se.order}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReorderEntity(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-surface-500 hover:text-brand-600 disabled:opacity-30"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleReorderEntity(index, 'down')}
                        disabled={index === selectedEntities.length - 1}
                        className="p-1 text-surface-500 hover:text-brand-600 disabled:opacity-30"
                        title="Move down"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => handleRemoveEntity(se.entity_pk)}
                        className="p-1 text-surface-500 hover:text-rose-600"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : null;
              })}
              {selectedEntities.length === 0 && (
                <div className="text-center py-8 text-surface-400 text-sm">
                  No entities selected. Search above to add.
                </div>
              )}
            </div>
          </div>
       
          {/* Non-Entities */}
          <div className="bg-white rounded-xl border border-surface-200 p-6">
            <h3 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <Link className="w-5 h-5" />
              Non-Entities (Optional)
            </h3>
           
            {/* Search & Add */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                value={nonEntitySearch}
                onChange={(e) => setNonEntitySearch(e.target.value)}
                onFocus={() => setShowNonEntityDropdown(true)}
                placeholder="Search non-entity to add..."
                className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              {showNonEntityDropdown && nonEntitySearch && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-surface-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredNonEntities.slice(0, 10).map(n => (
                    <button
                      key={n.non_entity_pk}
                      onClick={() => handleAddNonEntity(n)}
                      className="w-full px-4 py-2 text-left hover:bg-surface-50 text-sm"
                    >
                      <div>{n.non_entity_name}</div>
                      <div className="text-xs font-mono text-surface-500">{n.non_entity_pk}</div>
                    </button>
                  ))}
                  <button
                    onClick={() => setShowNonEntityDropdown(false)}
                    className="w-full px-4 py-2 text-center text-surface-500 border-t border-surface-100"
                  >
                    <X className="w-4 h-4 inline mr-1" />
                    Close
                  </button>
                </div>
              )}
            </div>
           
            {/* Selected Non-Entities */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedNonEntities.map(pk => {
                const ne = getNonEntityById(pk);
                return ne ? (
                  <div key={pk} className="flex items-center justify-between bg-surface-50 rounded-lg px-3 py-2.5">
                    <div>
                      <div className="font-medium text-surface-900">{ne.non_entity_name}</div>
                      <div className="text-xs font-mono text-surface-500">{pk}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRemoveNonEntity(pk)}
                        className="p-1 text-surface-500 hover:text-rose-600"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : null;
              })}
              {selectedNonEntities.length === 0 && (
                <div className="text-center py-8 text-surface-400 text-sm">
                  No non-entities selected. Search above to add.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}