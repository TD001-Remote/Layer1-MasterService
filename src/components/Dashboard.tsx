/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Layers, 
  MapPin, 
  Globe, 
  Database, 
  ShieldCheck, 
  FileText, 
  TrendingUp, 
  ChevronRight,
  Server,
  Network
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useData } from "../contexts/DataContext";
import { masterDomains } from "../data/mockData";

export default function Dashboard() {
  const navigate = useNavigate();
  const { zoneRefs, sites, activeEntities, pendingEntities } = useData();
  
  const onNavigate = (path: string) => {
    navigate(`/${path}`);
  };
  
  const activeSites = sites;
  const pendingCount = pendingEntities.length;
  
  // Calculate stats
  const totalStates = 1;
  const totalDistricts = 1;
  const totalTaluks = 3;
  const totalCities = 5;
  const totalAreas = 6;
  const totalStreets = 7;
  const totalZones = zoneRefs.length;
  
  const domainDistribution = activeEntities.reduce((acc, ent) => {
    acc[ent.primary_domain] = (acc[ent.primary_domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const domainLabels: Record<string, string> = {
    MED: "Medicinal & Health",
    EDU: "Education & Learning",
    ADM: "Administrative Units",
    FIN: "Finance & Banking",
    AGR: "Agriculture Depots",
    IND: "Industrial Plants",
    RET: "Retail & Bazaars",
    FOO: "Food & Beverage",
    SPO: "Sport & Wellness",
    TRP: "Transport & Logistics",
    TOU: "Tour & Heritage"
  };

  const domainColors: Record<string, string> = {
    MED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    EDU: "bg-blue-50 text-blue-700 border-blue-200",
    ADM: "bg-indigo-50 text-indigo-700 border-indigo-200",
    FIN: "bg-amber-50 text-amber-700 border-amber-200",
    AGR: "bg-green-50 text-green-700 border-green-200",
    IND: "bg-cyan-50 text-cyan-700 border-cyan-200",
    RET: "bg-violet-50 text-violet-700 border-violet-200",
    FOO: "bg-rose-50 text-rose-700 border-rose-200",
    SPO: "bg-purple-50 text-purple-700 border-purple-200",
    TRP: "bg-sky-50 text-sky-700 border-sky-200",
    TOU: "bg-orange-50 text-orange-700 border-orange-200"
  };

  return (
    <div className="space-y-6" id="dashboard_panel">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden border border-slate-200">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-indigo-600">
          <Network size={200} />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <span className="bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block">
            Layer 1 Core Console
          </span>
          <h1 className="text-3xl font-display font-bold tracking-tight md:text-4xl text-slate-900">
            TN, Puducherry & Tamil Regions L1 Identity Registry
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed font-sans font-medium">
            Unified administrative database of physical settlement zones, smart district registries, dynamic multi-tenant portal generators, and verified credential management for Tamil Nadu, Puducherry (UT), and surrounding Tamil-speaking zones.
          </p>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Core Geography */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold font-mono">Geo Hierarchy</p>
              <h4 className="text-2xl font-bold font-display mt-2 text-slate-900">
                {totalStates}s / {totalDistricts}D / {totalTaluks}T
              </h4>
            </div>
            <span className="p-2.5 bg-slate-100 rounded-lg text-slate-700">
              <MapPin size={20} />
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">District Administrative Bounds</span>
            <button onClick={() => onNavigate("geography")} className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline inline-flex items-center gap-0.5">
              View <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Dynamic Zones */}
        <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-indigo-600 uppercase tracking-wider font-bold font-mono">Physical Zones</p>
              <h4 className="text-2xl font-bold font-display mt-2 text-slate-900">
                {totalZones} Standardized
              </h4>
            </div>
            <span className="p-2.5 bg-indigo-100 rounded-lg text-indigo-700">
              <Layers size={20} />
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-indigo-700 font-bold">Max 200 Streets limit active</span>
            <button onClick={() => onNavigate("geography")} className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline inline-flex items-center gap-0.5">
              Streets <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Dynamic Sites */}
        <div className="bg-white p-5 rounded-xl border border-blue-200 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-blue-600 uppercase tracking-wider font-bold font-mono">Provisioned Sites</p>
              <h4 className="text-2xl font-bold font-display mt-2 text-slate-900">
                {activeSites.length} Multi-Tenant
              </h4>
            </div>
            <span className="p-2.5 bg-blue-100 rounded-lg text-blue-700">
              <Globe size={20} />
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-600 font-medium">Dynamic URL routing online</span>
            <button onClick={() => onNavigate("sites")} className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline inline-flex items-center gap-0.5">
              Engines <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* Commited Entities */}
        <div className="bg-white p-5 rounded-xl border border-purple-200 shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-purple-600 uppercase tracking-wider font-bold font-mono">Active Entities</p>
              <h4 className="text-2xl font-bold font-display mt-2 text-slate-900">
                {activeEntities.length} Master PKs
              </h4>
            </div>
            <span className="p-2.5 bg-purple-100 rounded-lg text-purple-700">
              <Database size={20} />
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-1 rounded">
              {pendingCount} Survey Rows Staged
            </span>
            <button onClick={() => onNavigate("staging")} className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline inline-flex items-center gap-0.5">
              Verify <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Architecture Flowchart & Domain stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Core Architecture explanation flowchart */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
              <Server size={20} className="text-indigo-600" />
              L1 Geo-Zone-Site Architecture Schematic
            </h3>
            <span className="text-xs text-slate-500 font-mono tracking-widest uppercase">UTILITY-BASED DIRECTORY</span>
          </div>
          
          <p className="text-sm text-slate-700 leading-relaxed font-sans font-medium">
            The database separates <strong className="text-slate-900">Administrative Geography (GEO)</strong> from <strong className="text-slate-900">Physical Human Settlements (ZONE)</strong>. This layout eliminates relational overlaps and feeds automated web generators directly.
          </p>

          <div className="space-y-4 pt-2">
            
            {/* Step 1: Geo Hierarchy */}
            <div className="flex gap-4 items-start relative pb-4">
              <div className="absolute top-8 bottom-0 left-3 w-0.5 bg-slate-200"></div>
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-mono font-bold flex items-center justify-center shrink-0 border-2 border-white shadow-sm">1</div>
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-slate-900">Administrative Geography (GEO)</h5>
                <p className="text-xs text-slate-600 font-medium">State/UT (Tamil Nadu / Puducherry) ➔ District (Mayiladuthurai / Karaikal) ➔ Taluk. Holds high-level regulatory bounds.</p>
              </div>
            </div>

            {/* Step 2: Zone Hierarchy */}
            <div className="flex gap-4 items-start relative pb-4">
              <div className="absolute top-8 bottom-0 left-3 w-0.5 bg-indigo-200"></div>
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-mono font-bold flex items-center justify-center shrink-0 border-2 border-white shadow-sm">2</div>
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-slate-900">Standardized Physical Settlement (ZONE)</h5>
                <p className="text-xs text-slate-600 font-medium">City/Village ➔ Area Ward ➔ Street ➔ Sub-street. Maximum 200 streets per area acts as an address lookup namespace and location anchor.</p>
              </div>
            </div>

            {/* Step 3: Site Mapping */}
            <div className="flex gap-4 items-start relative pb-4">
              <div className="absolute top-8 bottom-0 left-3 w-0.5 bg-blue-200"></div>
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-mono font-bold flex items-center justify-center shrink-0 border-2 border-white shadow-sm">3</div>
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-slate-900">Dynamic Multi-Tenant Mapping (SITES)</h5>
                <p className="text-xs text-slate-600 font-medium">A SITE is a logical group holding a list of specific Street Zone PKs. This allows 1 street to exist in multiple sites without duplicating entity data.</p>
              </div>
            </div>

            {/* Step 4: Staging Gate */}
            <div className="flex gap-4 items-start pb-2">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-mono font-bold flex items-center justify-center shrink-0 border-2 border-white shadow-sm">4</div>
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-slate-900">Verification Gate (Staging Area)</h5>
                <p className="text-xs text-slate-600 font-medium">CSV drafts are uploaded, technically verified, cross-checked against the Field Officer's handheld paper copies, and only then assigned a legal PK.</p>
              </div>
            </div>

          </div>
        </div>

        {/* 11 Domains Stats Breakdown */}
        <div className="lg:col-span-12 xl:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-md flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600" />
                11-Domain Utility Directory
              </h3>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {masterDomains.map((domain) => {
                const count = domainDistribution[domain.code] || 0;
                const percent = activeEntities.length ? Math.round((count / activeEntities.length) * 100) : 0;
                const themeClass = domainColors[domain.code] || "bg-slate-100 text-slate-700 border-slate-200";
                
                return (
                  <div key={domain.code} className="p-3 border rounded-lg border-slate-200 bg-white flex items-center justify-between hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-1 rounded font-mono font-bold border ${themeClass}`}>
                        {domain.code}
                      </span>
                      <div>
                        <h6 className="text-xs font-bold text-slate-900">{domainLabels[domain.code]}</h6>
                        <span className="text-[10px] text-slate-500 line-clamp-1">{domain.description}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4 font-mono">
                      <span className="block text-xs font-bold text-slate-900">{count} Active</span>
                      <span className="block text-[9px] text-slate-500 font-bold">{percent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => onNavigate("registry")} 
            className="w-full mt-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold tracking-wider transition-all uppercase flex items-center justify-center gap-2 shadow-md"
          >
            Explore Active Base Directory <ChevronRight size={14} />
          </button>
        </div>

      </div>

      {/* Quick Quickstart Helper cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-indigo-200 p-6 rounded-xl shadow-md space-y-3 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold font-mono shadow-sm">A</div>
          <h5 className="font-bold text-slate-900 text-sm">Standardize Geographic Skeleton</h5>
          <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
            Register Towns, Area Wards and individual Streets. Limit of 200 streets prevents unverified data clustering in any sector.
          </p>
        </div>
        
        <div className="bg-white border border-blue-200 p-6 rounded-xl shadow-md space-y-3 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold font-mono shadow-sm">B</div>
          <h5 className="font-bold text-slate-900 text-sm">Provision Dynamic Portal Metas</h5>
          <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
            Create Site definitions and map dynamic collections of streets. No duplicates are created; sites are built using central address refs.
          </p>
        </div>

        <div className="bg-white border border-amber-200 p-6 rounded-xl shadow-md space-y-3 hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold font-mono shadow-sm">C</div>
          <h5 className="font-bold text-slate-900 text-sm">Test Survey CSV upload</h5>
          <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
            Trigger dry-run validation logs. Drag and drop file surveys to see automatic duplicated threat warnings, correct them on spot, and migrate to L1.
          </p>
        </div>
      </div>
    </div>
  );
}
