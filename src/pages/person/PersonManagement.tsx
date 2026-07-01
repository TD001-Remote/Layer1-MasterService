/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Users, Edit, Trash2, RotateCcw, Search, ChevronLeft, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../contexts/DataContext";
import { Person, ActiveEntity, NonEntity } from "../../types";
import { personApi } from "../../services/api";

export default function PersonManagement() {
  const navigate = useNavigate();
  const { persons: ctxPersons, stopPerson: ctxStopPerson, recoverPerson: ctxRecoverPerson, activeEntities, nonEntities, showToast } = useData();
   
  const [viewMode, setViewMode] = useState<'active' | 'stopped'>('active');
  const [searchTerm, setSearchTerm] = useState('');
   
  const [fbPersons, setFbPersons] = useState<Person[]>([]);
  const [isLoadingFb, setIsLoadingFb] = useState(false);
  const [fbError, setFbError] = useState<string | null>(null);
 
  const loadFromFirestore = async () => {
    setIsLoadingFb(true);
    setFbError(null);
    try {
      const data = await personApi.getAll();
      setFbPersons(data);
    } catch (err) {
      setFbError(String(err).replace(/[\r\n]/g, ' '));
      setFbPersons([]);
    } finally {
      setIsLoadingFb(false);
    }
  };
 
  useEffect(() => {
    loadFromFirestore();
  }, []);
 
  const persons = fbPersons.length > 0 ? fbPersons : ctxPersons;
  const activeList = persons.filter(p => p.status === 'active');
  const stoppedList = persons.filter(p => p.status === 'stopped');
 
  const displayPersons = viewMode === 'active' ? activeList : stoppedList;
  const filteredPersons = displayPersons.filter(person => {
    const matchesSearch = !searchTerm || 
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.person_pk.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.entities.some(e => e.entity_pk.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });
 
  const handleEdit = (person_pk: string) => {
    // Navigate to person-registry detail page when created
    // For now, show a toast that edit is not yet implemented
    showToast('info', `Edit Person ${person_pk} - Coming soon`);
  };
 
  const handleStop = async (person_pk: string) => {
    const reason = prompt('Enter reason for stopping this person:');
    if (reason && reason.trim()) {
      await ctxStopPerson(person_pk, reason.trim());
    }
  };
 
  const handleRecover = async (person_pk: string) => {
    const reason = prompt('Enter reason for recovering this person:');
    if (reason && reason.trim()) {
      await ctxRecoverPerson(person_pk, reason.trim());
    }
  };
 
  const getEntityNames = (person: Person): string => {
    return person.entities
      .map(e => {
        const en = activeEntities.find(a => a.entity_pk === e.entity_pk);
        return en ? en.entity_name : e.entity_pk;
      })
      .join(', ');
  };
 
  const getNonEntityNames = (person: Person): string => {
    return person.non_entities
      .map(n => {
        const ne = nonEntities.find(a => a.non_entity_pk === n);
        return ne ? ne.non_entity_name : n;
      })
      .join(', ');
  };
 
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/person-assign')}
              className="p-2 hover:bg-surface-100 rounded-xl transition-colors border border-transparent hover:border-surface-200"
            >
              <ChevronLeft className="w-5 h-5 text-surface-500" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight">Person Management</h2>
              <p className="text-sm text-surface-500 mt-0.5 font-semibold">
                View and manage all Person records
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {fbError && (
              <div className="flex items-center gap-2 text-rose-600 text-sm font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>Firebase load failed</span>
              </div>
            )}
            <button
              onClick={loadFromFirestore}
              disabled={isLoadingFb}
              className="p-2.5 text-surface-500 hover:text-surface-800 hover:bg-surface-100 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-surface-200"
              title="Refresh from Firebase"
            >
              <RefreshCw className={`w-5 h-5 ${isLoadingFb ? 'animate-spin text-brand-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>
 
      {/* View Mode Toggle */}
      <div className="bg-white rounded-xl border border-surface-200 p-1.5 inline-flex gap-1 shadow-sm">
        <button
          onClick={() => setViewMode('active')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            viewMode === 'active'
               ? 'bg-person-600 text-white shadow-lg shadow-person-500/20'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          <Users className="inline w-4 h-4 mr-1.5" />
          Active ({activeList.length})
        </button>
        <button
          onClick={() => setViewMode('stopped')}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            viewMode === 'stopped'
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20'
              : 'text-surface-600 hover:bg-surface-50'
          }`}
        >
          <Trash2 className="inline w-4 h-4 mr-1.5" />
          Stopped ({stoppedList.length})
        </button>
      </div>
 
      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search persons by name, PK, or entity..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
 
        {/* Table */}
        {filteredPersons.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">
              {viewMode === 'active' ? 'No active persons' : 'No stopped persons'}
            </p>
            <p className="text-sm mt-1">
              {searchTerm
                ? 'Try adjusting your search'
                : viewMode === 'active'
                ? 'Create persons from entity and non-entity relationships'
                : 'Stopped persons will appear here'}
            </p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Person</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Entities</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Non-Entities</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Parent</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Status Log</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredPersons.map(person => (
                  <tr key={person.person_pk} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{person.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{person.person_pk}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-900 max-w-xs truncate">
                        {getEntityNames(person) || 'None'}
                      </div>
                      <div className="text-xs text-slate-500">{person.entities.length} entity(s)</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-slate-900 max-w-xs truncate">
                        {getNonEntityNames(person) || 'None'}
                      </div>
                      <div className="text-xs text-slate-500">{person.non_entities.length} non-entity(ies)</div>
                    </td>
                    <td className="px-4 py-4">
                      {person.parent_person_pk ? (
                        <div className="text-sm font-mono text-slate-600">{person.parent_person_pk}</div>
                      ) : (
                        <span className="text-slate-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs text-slate-500">
                        {person.statusLog.length} change(s)
                      </div>
                      {person.statusLog.length > 0 && (
                        <div className="text-xs text-slate-600 mt-1">
                          Last: {person.statusLog[person.statusLog.length - 1].status}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {viewMode === 'active' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(person.person_pk)}
                            className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStop(person.person_pk)}
                            className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Stop"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleRecover(person.person_pk)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Recover
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
