/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Globe, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Sliders, 
  ExternalLink,
  Search,
  Settings,
  HelpCircle
} from "lucide-react";
import { SetSite, DomainCode } from "../types";
import { useData } from "../contexts/DataContext";
import { validateRequired, validateSubdomain } from "../utils/validation";

export default function SiteProvisioner() {
  const { sites: activeSites, zoneRefs, addSite, updateSite } = useData();
  const onAddSite = addSite;
  const onUpdateSite = updateSite;

  // Current Site Selection
  const [selectedSiteId, setSelectedSiteId] = useState<string>("SITE-001");
  const selectedSite = activeSites.find(s => s.site_id === selectedSiteId) || activeSites[0];

  // Site Creator modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubdomain, setNewSubdomain] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTheme, setNewTheme] = useState("#2563eb");
  const [newPrimaryDomain, setNewPrimaryDomain] = useState<DomainCode>("RET");

  // Filter state for zone search in mapper
  const [zoneQuery, setZoneQuery] = useState("");

  // Inline form errors
  const [titleError, setTitleError] = useState<string | null>(null);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);

  const selectedZones = selectedSite?.zoneIds || [];

  // Handle subdomain slugification
  const cleanSubdomain = (val: string) => {
    return val.toLowerCase().replace(/[^a-z0-9-]/g, "");
  };

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields - convert ValidationResult to string | null
    const titleValidation = validateRequired(newTitle, 'Portal Title');
    setTitleError(titleValidation.isValid ? null : titleValidation.error || 'Invalid title');
    
    const cleanSlug = cleanSubdomain(newSubdomain);
    const subdomainErr = validateSubdomain(cleanSlug, activeSites.map(s => s.subdomain));
    setSubdomainError(subdomainErr);
    
    if (!titleValidation.isValid || subdomainErr) return;

    const newId = `SITE-${String(activeSites.length + 1).padStart(3, "0")}`;
    onAddSite({
      site_id: newId,
      title: newTitle,
      subdomain: cleanSlug,
      description: newDesc,
      themeColor: newTheme,
      primaryDomain: newPrimaryDomain,
      zoneIds: [], // Start with empty zones
      status: "draft"
    });

    // Reset fields
    setNewTitle("");
    setNewSubdomain("");
    setNewDesc("");
    setNewTheme("#2563eb");
    setTitleError(null);
    setSubdomainError(null);
    setSelectedSiteId(newId);
    setShowCreateModal(false);
  };

  // Toggle Zone assignment for current selected site
  const handleToggleZone = (zoneId: string) => {
    if (!selectedSite) return;
    
    let updatedZones = [...selectedSite.zoneIds];
    if (updatedZones.includes(zoneId)) {
      updatedZones = updatedZones.filter(id => id !== zoneId);
    } else {
      updatedZones.push(zoneId);
    }

    onUpdateSite({
      ...selectedSite,
      zoneIds: updatedZones
    });
  };

  // Filter zones matching query
  const filteredZones = zoneRefs.filter(z => 
    z.fullAddress.toLowerCase().includes(zoneQuery.toLowerCase()) || 
    z.zone_pk.toLowerCase().includes(zoneQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="site_provisioning_panel">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">Dynamic Web Generators (L5 Sites)</h2>
          <p className="text-sm text-slate-500 font-medium font-sans">Configure multi-tenant portal parameters and map physical local zones</p>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-colors uppercase shrink-0"
        >
          <Plus size={15} /> Provision New Portal
        </button>
      </div>

      {/* Primary Workspace: Selection bar and dynamic mapper split-view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Portal Selector & Metadata review */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Active Portals list</h4>
            
            <div className="space-y-2">
              {activeSites.map(site => {
                const isSelected = site.site_id === selectedSiteId;
                return (
                  <div 
                    key={site.site_id}
                    className={`p-4 border rounded-xl transition-all ${
                      isSelected 
                        ? "border-indigo-500 bg-indigo-50/10 shadow-sm" 
                        : "border-slate-100 bg-white"
                    }`}
                  >
                    <Link 
                      to={`/sites/${site.site_id}`}
                      className="block cursor-pointer hover:bg-slate-50/50 rounded-lg transition-all -m-1 p-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3.5 h-3.5 rounded-full inline-block shrink-0 border border-white shadow-xs" 
                            style={{ backgroundColor: site.themeColor }}
                          ></span>
                          <h5 className="font-bold text-sm text-slate-950 line-clamp-1 hover:text-indigo-600 transition-colors">{site.title}</h5>
                        </div>
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                          {site.site_id}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 font-mono">
                        <Globe size={11} className="text-slate-300" />
                        <span className="truncate">{site.subdomain}.registry.in</span>
                      </div>
                    </Link>

                    <div 
                      onClick={() => setSelectedSiteId(site.site_id)}
                      className="mt-3 flex justify-between items-center text-xs border-t border-slate-100/60 pt-2.5 cursor-pointer"
                    >
                      <span className="text-slate-400 font-medium">({site.zoneIds.length} Zones Assigned)</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        site.status === "active" ? "bg-emerald-100/80 text-emerald-800" : "bg-amber-100/80 text-amber-800"
                      }`}>
                        {site.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Setup Metadata card */}
          {selectedSite && (
            <div className="bg-gradient-to-br from-slate-950 to-slate-800 text-white p-5 rounded-xl space-y-4 shadow-lg border border-slate-800">
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold px-2 py-0.5 rounded uppercase">
                Portal Blueprints
              </span>
              
              <div className="space-y-1">
                <h4 className="text-base font-bold font-display tracking-tight text-white">{selectedSite.title}</h4>
                <p className="text-xs text-slate-300 italic leading-relaxed">{selectedSite.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-800 pt-4.5">
                <div>
                  <span className="text-gray-400 block font-mono font-semibold">PRIMARY DOMAIN</span>
                  <span className="font-bold text-indigo-400 font-mono uppercase mt-0.5 inline-block">{selectedSite.primaryDomain} Target</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-mono font-semibold">BRAND COLOR</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: selectedSite.themeColor }}></span>
                    <span className="font-mono font-bold uppercase text-slate-200">{selectedSite.themeColor}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  className="w-full py-2.5 bg-slate-100/50 hover:bg-slate-100 text-slate-400 cursor-not-allowed rounded-lg text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200/60"
                  disabled
                >
                  Live Web Preview (L5 Integration Pending)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Interactive Zone Mapping Engine */}
        <div className="lg:col-span-12 xl:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
                <Sliders size={16} className="text-indigo-600 font-bold" />
                Dynamic Street Zone Mapper
              </h3>
              <p className="text-xs text-slate-400 font-medium">Map specific physical street zones; they populate this site automatically.</p>
            </div>
            
            {/* Search filter input */}
            <div className="relative w-full sm:w-64 shrink-0">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                value={zoneQuery}
                onChange={(e) => setZoneQuery(e.target.value)}
                placeholder="Search Streets, Areas, PKs..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-5 font-semibold text-slate-800 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:outline-none rounded-lg transition-all"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {filteredZones.map(zone => {
              const isAssigned = selectedZones.includes(zone.zone_pk);
              
              // Find other sites which ALSO map this exact zone (proving overlap capability)
              const overlappingSites = activeSites.filter(s => s.site_id !== selectedSite?.site_id && s.zoneIds.includes(zone.zone_pk));

              return (
                <div 
                  key={zone.zone_pk}
                  onClick={() => handleToggleZone(zone.zone_pk)}
                  className={`p-3 border rounded-xl flex items-center justify-between transition-all cursor-pointer hover:bg-slate-50 select-none ${
                    isAssigned 
                      ? "border-indigo-200 bg-indigo-50/10" 
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3 w-10/12">
                    {/* Checkbox */}
                    <div className="shrink-0 mt-0.5">
                      <div className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center ${
                        isAssigned 
                          ? "bg-indigo-600 border-indigo-600 text-white" 
                          : "border-slate-300 bg-white"
                      }`}>
                        {isAssigned && <span className="text-[10px] font-bold">✓</span>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-mono bg-[#0F172A] text-indigo-300 border border-slate-800 px-1.5 py-0.2 rounded font-bold tracking-wider">
                          {zone.zone_pk}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{zone.fullAddress.split(",")[0]}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 font-sans font-medium">{zone.fullAddress}</p>
                      
                      {/* Overlap proof badge */}
                      {overlappingSites.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mt-1 pb-0.5">
                          <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-bold font-mono border border-indigo-100 uppercase tracking-wide">SHARED ARCHITECTURE</span>
                          <span className="text-[9px] text-slate-400 font-medium">Also included in:</span>
                          {overlappingSites.map(s => (
                            <span key={s.site_id} className="text-[9px] font-bold font-mono bg-slate-100 text-slate-600 px-1 rounded-sm">
                              {s.subdomain}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold shrink-0 ml-4 ${
                    isAssigned ? "text-indigo-600" : "text-slate-300"
                  }`}>
                    {isAssigned ? "MAPPED" : "UNMAPPED"}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-indigo-50/40 text-indigo-900 border border-indigo-100 rounded-xl text-xs flex gap-2 items-start leading-relaxed font-semibold">
            <HelpCircle size={15} className="shrink-0 mt-0.5 text-indigo-600 font-bold" />
            <div>
              <strong>Multi-Site Overlapping Mandate:</strong> Because our physical zones serve as universal address registers, you can assign the same physical street zone to multiple site portals. Any entity verification in L1 instantly propagates to all matched portals simultaneously.
            </div>
          </div>
        </div>

      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
            
            <div className="bg-[#0F172A] px-6 py-4 text-white flex justify-between items-center border-b border-slate-800">
              <h4 className="font-display font-bold text-sm uppercase tracking-wide">
                Provision Dynamic Site Engine
              </h4>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white font-bold transition-colors">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1 font-semibold">Corporate/Portal Title</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => { setNewTitle(e.target.value); setTitleError(null); }} 
                  placeholder="e.g. Sirkazhi Medical Help Directory"
                  className={`w-full text-xs font-semibold border rounded-lg p-3 focus:bg-white focus:outline-none transition-all ${
                    titleError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-5 focus:border-indigo-500'
                  }`}
                />
                {titleError && (
                  <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                    <span>⚠</span>{titleError}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1 font-semibold">Dynamic Subdomain Routing URL</label>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    value={newSubdomain} 
                    onChange={(e) => { setNewSubdomain(cleanSubdomain(e.target.value)); setSubdomainError(null); }} 
                    placeholder="sirkazhi-medics"
                    className={`w-full text-xs font-semibold border rounded-l-lg p-3 focus:bg-white focus:outline-none font-mono transition-all ${
                      subdomainError ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-slate-5 focus:border-indigo-500'
                    }`}
                  />
                  <span className="bg-slate-100 text-slate-550 border border-l-0 border-slate-200 px-3 py-3 rounded-r-lg text-xs font-mono font-bold shrink-0">
                    .registry.in
                  </span>
                </div>
                {subdomainError ? (
                  <p className="text-xs text-red-500 font-medium mt-1 flex items-center gap-1">
                    <span>⚠</span>{subdomainError}
                  </p>
                ) : (
                  <span className="text-[9px] text-slate-450 font-bold font-mono mt-1 block">Only alphanumeric symbols and hyphens are supported.</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1 font-semibold">Target Primary Utility Domain</label>
                <select 
                  value={newPrimaryDomain} 
                  onChange={(e) => setNewPrimaryDomain(e.target.value as DomainCode)}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-3 bg-slate-5 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
                >
                  <option value="RET">Retail & Shops (RET)</option>
                  <option value="MED">Medicinal & Clinics (MED)</option>
                  <option value="TOU">Tourism & Heritage (TOU)</option>
                  <option value="EDU">Educational Centers (EDU)</option>
                  <option value="FOO">Food & Dining (FOO)</option>
                  <option value="AGR">Agricultural Storage (AGR)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1 font-semibold">Style Theme Brand Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={newTheme} 
                    onChange={(e) => setNewTheme(e.target.value)} 
                    className="w-10 h-10 border-0 p-0 rounded cursor-pointer shrink-0"
                  />
                  <input 
                    type="text" 
                    value={newTheme} 
                    onChange={(e) => setNewTheme(e.target.value)} 
                    className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-3 bg-slate-5 focus:border-indigo-500 focus:bg-white focus:outline-none font-mono transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1 font-semibold">Portal Purpose SEO Description</label>
                <textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  placeholder="Summarize geographical target bounds, catalog scopes and target domains."
                  rows={2}
                  className="w-full text-xs font-semibold border border-slate-200 rounded-lg p-3 bg-slate-5 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors font-sans"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md transition-colors font-sans"
                >
                  Generate Portal Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
