/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  SlidersHorizontal,
  Trash2,
  ShieldCheck,
  Columns,
  FolderTree,
  Plus
} from "lucide-react";
import { DomainCode } from "../types";
import { useData } from "../contexts/DataContext";

export default function RegistryViewer() {
  const {
    activeEntities,
    zoneRefs,
    stopEntity,
    recoverEntity,
    sites: activeSites,
    updateEntity,
    districts,
    taluks,
    cities,
    streets,
    domains,
    categories,
    types,
    nonEntities,
    addDomain,
    updateDomain,
    stopDomain,
    recoverDomain,
    addCategory,
    updateCategory,
    stopCategory,
    recoverCategory,
    addType,
    updateType,
    stopType,
    recoverType,
    addEntity,
  } = useData();

  // Domain Tab selection (All or specific enum)
  const [selectedDomain, setSelectedDomain] = useState<DomainCode | "ALL">("ALL");

  // View modes: column finder, schema tree, or flat tabular list
  const [viewMode, setViewMode] = useState<"list" | "schema_tree" | "columns">("columns");

  // Filter queries
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [selectedTaluk, setSelectedTaluk] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [selectedStreet, setSelectedStreet] = useState("ALL");

  const [showStopped, setShowStopped] = useState(false);

  // Filter based on standard status
  const visibleDomains = domains.filter(d => showStopped ? d.status === "stopped" : d.status === "active");
  const visibleCategories = categories.filter(c => showStopped ? c.status === "stopped" : c.status === "active");
  const visibleTypes = types.filter(t => showStopped ? t.status === "stopped" : t.status === "active");
  const visibleNonEntities = nonEntities.filter(n => showStopped ? n.status === "stopped" : n.status === "active");
  const visibleActiveEntities = activeEntities.filter(e => showStopped ? (e as any).status === "stopped" : (e as any).status === "active" || !(e as any).status);

  // Execute Cascading filters in memory
  const filteredActiveEntities = visibleActiveEntities.filter(ent => {
    // 1. Domain
    if (selectedDomain !== "ALL" && ent.primary_domain !== selectedDomain) return false;

    // 2. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = ent.entity_name.toLowerCase().includes(q);
      const catMatch = ent.category_name.toLowerCase().includes(q);
      const pkMatch = ent.entity_pk.toLowerCase().includes(q);
      const phoneMatch = ent.phone ? ent.phone.includes(q) : false;
      if (!nameMatch && !catMatch && !pkMatch && !phoneMatch) return false;
    }

    // 3. Geo Cascades
    const zoneMatchFilter = zoneRefs.find(z => z.zone_pk === ent.zone_pk);
    if (selectedDistrict !== "ALL" && zoneMatchFilter?.districtId !== selectedDistrict) return false;
    if (selectedTaluk !== "ALL" && ent.talukId !== selectedTaluk) return false;
    if (selectedCity !== "ALL" && ent.cityVillageId !== selectedCity) return false;
    if (selectedStreet !== "ALL" && ent.streetId !== selectedStreet) return false;

    return true;
  });

  const filteredNonEntities = visibleNonEntities.filter(nent => {
    // 1. Domain
    if (selectedDomain !== "ALL" && nent.primary_domain !== selectedDomain) return false;

    // 2. Text Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = nent.non_entity_name.toLowerCase().includes(q);
      const catMatch = (nent.category_name || "").toLowerCase().includes(q);
      const pkMatch = nent.non_entity_pk.toLowerCase().includes(q);
      const phoneMatch = (nent.phone || "").includes(q);
      if (!nameMatch && !catMatch && !pkMatch && !phoneMatch) return false;
    }

    // 3. Geo Cascades
    const zoneMatchFilter = zoneRefs.find(z => z.zone_pk === nent.zone_pk);
    if (selectedDistrict !== "ALL" && zoneMatchFilter?.districtId !== selectedDistrict) return false;
    if (selectedTaluk !== "ALL" && nent.talukId !== selectedTaluk) return false;
    if (selectedCity !== "ALL" && nent.cityVillageId !== selectedCity) return false;
    if (selectedStreet !== "ALL" && nent.streetId !== selectedStreet) return false;

    return true;
  });

  const allFilteredItems = [...filteredActiveEntities, ...filteredNonEntities];

  return (
    <div className="space-y-6" id="registry_viewer_panel">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">L1 Active Database Browser</h2>
          <p className="text-sm text-slate-500 font-medium font-sans">Query and navigate verified sequential entities registered in Tamil Nadu & Puducherry Region</p>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-3">
          <Link
            to="/registry/create"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-md flex items-center gap-2 transition-colors"
          >
            <Plus size={16} />
            Create Entity
          </Link>
          
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">
            <input type="checkbox" checked={showStopped} onChange={e => setShowStopped(e.target.checked)} className="rounded text-indigo-600 w-3 h-3" />
            Show Stopped / Archived
          </label>
        </div>
      </div>

      {/* Grid: 11-Domain Tabs */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Filter by Utility Domain</span>
        
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl">
          {/* ALL Tab */}
          <button
            onClick={() => setSelectedDomain("ALL")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
              selectedDomain === "ALL" 
                ? "bg-[#0F172A] text-white border-transparent shadow-xs" 
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            All Domains ({activeEntities.length})
          </button>

          {domains.map(d => {
            const count = activeEntities.filter(e => e.primary_domain === d.code).length;
            return (
              <button
                key={d.code}
                onClick={() => setSelectedDomain(d.code)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all cursor-pointer border flex items-center gap-1.5 truncate ${
                  selectedDomain === d.code
                    ? "bg-indigo-600 text-white border-transparent shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{d.code}</span>
                <span className="opacity-90 font-bold font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Filter parameters */}
      <div className="bg-white p-5 border border-slate-200 shadow-sm rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-xs font-bold text-slate-450 uppercase tracking-widest font-mono">
          <SlidersHorizontal size={14} className="text-indigo-600 font-bold" />
          Advanced Search & Query Parameters
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Text input search */}
          <div>
            <label className="block text-[10px] font-bold text-slate-555 uppercase font-mono tracking-wider mb-1">Search Term</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, Phone, Category..."
                className="w-full text-xs pl-8.5 pr-3 py-2 bg-slate-5 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none rounded-lg font-semibold text-slate-800 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="bg-white p-5 border border-slate-200 shadow-sm rounded-xl">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Filtered Results: {allFilteredItems.length} items</h3>
        <div className="space-y-2">
          {filteredActiveEntities.map(ent => (
            <div key={ent.entity_pk} className="border border-slate-100 p-3 rounded-lg flex justify-between items-center hover:bg-slate-50 transition-colors">
              <Link to={`/registry/${ent.entity_pk}`} className="flex-1">
                <h4 className="font-bold text-sm text-slate-900 hover:text-indigo-600">{ent.entity_name}</h4>
                <p className="text-xs text-slate-500 font-mono">{ent.entity_pk}</p>
              </Link>
              <button
                onClick={() => {
                  if (showStopped) {
                    if (confirm(`Recover ${ent.entity_name}?`)) recoverEntity(ent.entity_pk);
                  } else {
                    if (confirm(`Stop ${ent.entity_name}?`)) stopEntity(ent.entity_pk);
                  }
                }}
                className="px-3 py-1 text-xs font-bold rounded border hover:bg-slate-100 ml-2"
              >
                {showStopped ? <ShieldCheck size={12} /> : <Trash2 size={12} />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
