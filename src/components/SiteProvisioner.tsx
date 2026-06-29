/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Globe, MapPin, Plus, Search, CheckCircle, X } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { validateRequired, validateSubdomain } from "../utils/validation";

type PanelMode = 'create' | 'assign-zones';

export default function SiteProvisioner() {
  const { sites, zoneRefs, addSite, updateSite } = useData();

  const [panel, setPanel] = useState<PanelMode>('create');

  // Create Site form
  const [title, setTitle] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Assign Zones
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [zoneQuery, setZoneQuery] = useState('');

  const selectedSite = sites.find(s => s.site_id === selectedSiteId);

  const cleanSubdomain = (val: string) =>
    val.toLowerCase().replace(/[^a-z0-9-]/g, '');

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();

    const titleV = validateRequired(title, 'Title');
    setTitleError(titleV.isValid ? null : titleV.error || 'Required');

    const slug = cleanSubdomain(subdomain);
    const subErr = validateSubdomain(slug, sites.map(s => s.subdomain));
    setSubdomainError(subErr);

    if (!titleV.isValid || subErr) return;

    setCreating(true);
    const newId = `SITE-${String(sites.length + 1).padStart(3, '0')}`;
    await addSite({
      site_id: newId,
      title: title.trim(),
      subdomain: slug,
      zoneIds: [],
      status: 'draft',
    });

    setTitle('');
    setSubdomain('');
    setTitleError(null);
    setSubdomainError(null);
    setCreating(false);

    // Switch to assign zones panel with the new site pre-selected
    setSelectedSiteId(newId);
    setPanel('assign-zones');
  };

  const handleToggleZone = (zonePk: string) => {
    if (!selectedSite) return;
    const updated = selectedSite.zoneIds.includes(zonePk)
      ? selectedSite.zoneIds.filter(z => z !== zonePk)
      : [...selectedSite.zoneIds, zonePk];
    updateSite({ ...selectedSite, zoneIds: updated });
  };

  const handleActivate = () => {
    if (!selectedSite) return;
    updateSite({ ...selectedSite, status: 'active' });
  };

  const filteredZones = zoneRefs.filter(z =>
    z.fullAddress.toLowerCase().includes(zoneQuery.toLowerCase()) ||
    z.zone_pk.toLowerCase().includes(zoneQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Globe className="w-7 h-7 text-indigo-600" />
          Site Provisioner
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Create site IDs and assign geographic zones. L1 stores ID and zone references only.
        </p>
      </div>

      {/* Panel Tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setPanel('create')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            panel === 'create'
              ? 'bg-white text-indigo-600 shadow'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Plus className="inline w-4 h-4 mr-1" />
          Create Site
        </button>
        <button
          onClick={() => setPanel('assign-zones')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
            panel === 'assign-zones'
              ? 'bg-white text-indigo-600 shadow'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MapPin className="inline w-4 h-4 mr-1" />
          Assign Geo / Zone
          {sites.filter(s => s.zoneIds.length === 0).length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-bold">
              {sites.filter(s => s.zoneIds.length === 0).length}
            </span>
          )}
        </button>
      </div>

      {/* ── PANEL: CREATE SITE ── */}
      {panel === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-1">New Site</h3>
            <p className="text-xs text-slate-500 mb-5">
              Only the site ID, title, and subdomain are stored in L1. Zones are assigned separately.
            </p>

            <form onSubmit={handleCreateSite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Site Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => { setTitle(e.target.value); setTitleError(null); }}
                  placeholder="e.g. Sirkazhi Heritage Portal"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    titleError
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
                />
                {titleError && (
                  <p className="text-xs text-red-500 mt-1">⚠ {titleError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                  Subdomain <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={e => { setSubdomain(cleanSubdomain(e.target.value)); setSubdomainError(null); }}
                    placeholder="sirkazhi-heritage"
                    className={`flex-1 px-4 py-2.5 text-sm font-mono border rounded-l-lg focus:outline-none focus:ring-2 transition-all ${
                      subdomainError
                        ? 'border-red-400 focus:ring-red-200'
                        : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-500'
                    }`}
                  />
                  <span className="px-3 py-2.5 bg-slate-100 border border-l-0 border-slate-300 text-slate-500 text-xs font-mono rounded-r-lg">
                    .registry.in
                  </span>
                </div>
                {subdomainError
                  ? <p className="text-xs text-red-500 mt-1">⚠ {subdomainError}</p>
                  : <p className="text-xs text-slate-400 mt-1">Lowercase letters, numbers, hyphens only</p>
                }
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {creating ? 'Creating...' : 'Create Site'}
              </button>
            </form>
          </div>

          {/* Existing Sites list */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">
              All Sites
              <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-normal">
                {sites.length}
              </span>
            </h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {sites.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No sites yet. Create one →</p>
              ) : (
                sites.map(site => (
                  <div
                    key={site.site_id}
                    className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          {site.site_id}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                          site.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {site.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 mt-1">{site.title}</p>
                      <p className="text-xs text-slate-400 font-mono">{site.subdomain}.registry.in</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500">
                        {site.zoneIds.length} zone{site.zoneIds.length !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={() => { setSelectedSiteId(site.site_id); setPanel('assign-zones'); }}
                        className="block mt-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Assign Zones →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PANEL: ASSIGN GEO / ZONE ── */}
      {panel === 'assign-zones' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Site Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Select Site</h3>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {sites.map(site => (
                <button
                  key={site.site_id}
                  onClick={() => setSelectedSiteId(site.site_id)}
                  className={`w-full text-left p-3 border rounded-lg transition-all ${
                    selectedSiteId === site.site_id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500">{site.site_id}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                      site.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {site.status}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-1 truncate">{site.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{site.zoneIds.length} zones assigned</p>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Zone Assignment */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedSite ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Select a site to assign zones</p>
              </div>
            ) : (
              <>
                {/* Selected site summary */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {selectedSite.site_id}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                          selectedSite.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {selectedSite.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 mt-2">{selectedSite.title}</h3>
                      <p className="text-xs text-slate-400 font-mono">{selectedSite.subdomain}.web.app</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">{selectedSite.zoneIds.length}</p>
                      <p className="text-xs text-slate-500">Zones Assigned</p>
                      {selectedSite.status === 'draft' && selectedSite.zoneIds.length > 0 && (
                        <button
                          onClick={handleActivate}
                          className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Activate Site
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Assigned zone pills */}
                  {selectedSite.zoneIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                      {selectedSite.zoneIds.map(zid => (
                        <span
                          key={zid}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono rounded"
                        >
                          {zid}
                          <button
                            onClick={() => handleToggleZone(zid)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Zone search + list */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">Available Zones</h4>
                    <span className="text-xs text-slate-400">{filteredZones.length} zones</span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={zoneQuery}
                      onChange={e => setZoneQuery(e.target.value)}
                      placeholder="Search by address or Zone PK..."
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-[420px] overflow-y-auto">
                    {filteredZones.map(zone => {
                      const assigned = selectedSite.zoneIds.includes(zone.zone_pk);
                      return (
                        <div
                          key={zone.zone_pk}
                          onClick={() => handleToggleZone(zone.zone_pk)}
                          className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all select-none ${
                            assigned
                              ? 'border-indigo-300 bg-indigo-50'
                              : 'border-slate-100 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-all ${
                            assigned
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 bg-white'
                          }`}>
                            {assigned && <span className="text-[10px] font-bold">✓</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono bg-slate-900 text-indigo-300 px-2 py-0.5 rounded font-bold shrink-0">
                                {zone.zone_pk}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {zone.fullAddress.split(',')[0]}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">{zone.fullAddress}</p>
                          </div>
                          <span className={`text-xs font-bold shrink-0 ${assigned ? 'text-indigo-600' : 'text-slate-300'}`}>
                            {assigned ? 'ASSIGNED' : 'ADD'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
