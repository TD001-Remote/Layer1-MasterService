/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { validateRequired, validateSubdomain } from '../../utils/validation';
import { DomainCode } from '../../types';

export default function SiteEdit() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { sites, zoneRefs, updateSite } = useData();

  const site = sites.find(s => s.site_id === siteId);

  // Form state
  const [title, setTitle] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#2563eb');
  const [primaryDomain, setPrimaryDomain] = useState<DomainCode>('RET');
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [status, setStatus] = useState<'draft' | 'active'>('draft');

  // UI state
  const [loading, setLoading] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [zoneQuery, setZoneQuery] = useState('');

  useEffect(() => {
    if (site) {
      setTitle(site.title);
      setSubdomain(site.subdomain);
      setDescription(site.description || '');
      setThemeColor(site.themeColor);
      setPrimaryDomain(site.primaryDomain);
      setSelectedZones(site.zoneIds);
      setStatus(site.status);
    }
  }, [site]);

  if (!site) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-bold text-slate-900">Site Not Found</h3>
          <p className="text-sm text-slate-500">The site you're trying to edit doesn't exist.</p>
          <button 
            onClick={() => navigate('/sites')}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-semibold mt-4"
          >
            <ArrowLeft size={16} />
            Back to Sites
          </button>
        </div>
      </div>
    );
  }

  const cleanSubdomain = (val: string) => {
    return val.toLowerCase().replace(/[^a-z0-9-]/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate
    const titleValidation = validateRequired(title, 'Portal Title');
    setTitleError(titleValidation.isValid ? null : titleValidation.error || 'Invalid title');

    const cleanSlug = cleanSubdomain(subdomain);
    // Exclude current site from subdomain validation
    const otherSites = sites.filter(s => s.site_id !== siteId);
    const subdomainErr = validateSubdomain(cleanSlug, otherSites.map(s => s.subdomain));
    setSubdomainError(subdomainErr);

    if (!titleValidation.isValid || subdomainErr) {
      setLoading(false);
      return;
    }

    try {
      await updateSite({
        ...site,
        title,
        subdomain: cleanSlug,
        description,
        themeColor,
        primaryDomain,
        zoneIds: selectedZones,
        status
      });

      navigate(`/sites/${siteId}`);
    } catch (error) {
      console.error('Error updating site:', error);
      setLoading(false);
    }
  };

  const handleToggleZone = (zoneId: string) => {
    if (selectedZones.includes(zoneId)) {
      setSelectedZones(prev => prev.filter(id => id !== zoneId));
    } else {
      setSelectedZones(prev => [...prev, zoneId]);
    }
  };

  const filteredZones = zoneRefs.filter(z => 
    z.fullAddress.toLowerCase().includes(zoneQuery.toLowerCase()) || 
    z.zone_pk.toLowerCase().includes(zoneQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/sites/${siteId}`)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Edit Site</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">{site.title}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Basic Information</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Site ID
              </label>
              <input 
                type="text" 
                value={site.site_id}
                disabled
                className="w-full px-4 py-2.5 text-sm font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'active')}
                className="w-full px-4 py-2.5 text-sm font-semibold bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Portal Title *
            </label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(null); }}
              placeholder="e.g. Sirkazhi Medical Help Directory"
              className={`w-full px-4 py-2.5 text-sm font-semibold border rounded-lg focus:outline-none transition-all ${
                titleError 
                  ? 'border-red-400 bg-red-50 focus:border-red-500' 
                  : 'border-slate-200 bg-white focus:border-indigo-500'
              }`}
            />
            {titleError && (
              <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                <span>⚠</span> {titleError}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe the site purpose, target zones, and primary domains..."
              className="w-full px-4 py-2.5 text-sm font-semibold border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Domain & Branding */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Domain & Branding</h2>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Subdomain *
            </label>
            <div className="flex items-center">
              <input 
                type="text" 
                value={subdomain}
                onChange={(e) => { setSubdomain(cleanSubdomain(e.target.value)); setSubdomainError(null); }}
                placeholder="sirkazhi-medics"
                className={`flex-1 px-4 py-2.5 text-sm font-mono font-semibold border rounded-l-lg focus:outline-none transition-all ${
                  subdomainError 
                    ? 'border-red-400 bg-red-50 focus:border-red-500' 
                    : 'border-slate-200 bg-white focus:border-indigo-500'
                }`}
              />
              <span className="px-4 py-2.5 bg-slate-100 border border-l-0 border-slate-200 text-slate-600 text-sm font-mono font-bold rounded-r-lg">
                .registry.in
              </span>
            </div>
            {subdomainError ? (
              <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                <span>⚠</span> {subdomainError}
              </p>
            ) : (
              <p className="text-xs text-slate-500 font-medium mt-1">
                Only lowercase letters, numbers, and hyphens allowed
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Primary Domain
            </label>
            <select
              value={primaryDomain}
              onChange={(e) => setPrimaryDomain(e.target.value as DomainCode)}
              className="w-full px-4 py-2.5 text-sm font-semibold bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all"
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
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Theme Color
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="color" 
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-14 h-14 border-2 border-slate-200 rounded-lg cursor-pointer"
              />
              <input 
                type="text" 
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="flex-1 px-4 py-2.5 text-sm font-mono font-semibold border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Zone Assignment */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Zone Assignment</h2>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold">
              {selectedZones.length} selected
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <input 
              type="text" 
              value={zoneQuery}
              onChange={(e) => setZoneQuery(e.target.value)}
              placeholder="Search zones by address or PK..."
              className="w-full px-4 py-2.5 pl-10 text-sm font-semibold border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none transition-all"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Zone List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto border border-slate-100 rounded-lg p-2">
            {filteredZones.map(zone => {
              const isSelected = selectedZones.includes(zone.zone_pk);
              return (
                <div 
                  key={zone.zone_pk}
                  onClick={() => handleToggleZone(zone.zone_pk)}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-all ${
                    isSelected 
                      ? 'border-indigo-200 bg-indigo-50/30' 
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                      isSelected 
                        ? 'bg-indigo-600 border-indigo-600 text-white' 
                        : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <span className="text-xs font-bold">✓</span>}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono bg-slate-900 text-indigo-300 px-2 py-0.5 rounded font-bold">
                          {zone.zone_pk}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {zone.fullAddress.split(',')[0]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{zone.fullAddress}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(`/sites/${siteId}`)}
            className="px-6 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
