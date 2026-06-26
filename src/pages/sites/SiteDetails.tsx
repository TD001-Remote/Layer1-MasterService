/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit2, 
  Globe, 
  MapPin, 
  Palette,
  Calendar,
  ExternalLink,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export default function SiteDetails() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { sites, zoneRefs } = useData();

  const site = sites.find(s => s.site_id === siteId);

  if (!site) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
            <Globe size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Site Not Found</h3>
          <p className="text-sm text-slate-500">The site you're looking for doesn't exist.</p>
          <Link 
            to="/sites"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-semibold mt-4"
          >
            <ArrowLeft size={16} />
            Back to Sites
          </Link>
        </div>
      </div>
    );
  }

  // Get assigned zones
  const assignedZones = zoneRefs.filter(z => site.zoneIds.includes(z.zone_pk));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/sites')}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">{site.title}</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Site Details</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/sites/edit/${site.site_id}`)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
          >
            <Edit2 size={16} />
            Edit Site
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Site Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Basic Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block mb-1">Site ID</label>
                <p className="text-sm font-mono bg-slate-100 text-slate-700 px-3 py-2 rounded-lg font-bold">{site.site_id}</p>
              </div>
              
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block mb-1">Status</label>
                <span className={`inline-block px-3 py-2 rounded-lg text-sm font-bold ${
                  site.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {site.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block mb-1">Portal Title</label>
              <p className="text-sm text-slate-900 font-semibold">{site.title}</p>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block mb-1">Description</label>
              <p className="text-sm text-slate-600 leading-relaxed">{site.description || 'No description provided'}</p>
            </div>
          </div>

          {/* Domain & Branding */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Domain & Branding</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block mb-1">Subdomain</label>
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-slate-400" />
                  <p className="text-sm font-mono text-slate-900 font-semibold">{site.subdomain}.registry.in</p>
                  <button className="p-1 hover:bg-slate-100 rounded transition-colors" disabled>
                    <ExternalLink size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block mb-1">Primary Domain</label>
                <p className="text-sm font-mono bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg font-bold inline-block">{site.primaryDomain}</p>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-500 font-semibold uppercase tracking-wide block mb-1">Theme Color</label>
              <div className="flex items-center gap-3">
                <span 
                  className="w-10 h-10 rounded-lg border-2 border-white shadow-md" 
                  style={{ backgroundColor: site.themeColor }}
                />
                <span className="text-sm font-mono font-bold text-slate-700">{site.themeColor}</span>
              </div>
            </div>
          </div>

          {/* Assigned Zones */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Assigned Zones</h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-bold">
                {assignedZones.length} zones
              </span>
            </div>
            
            {assignedZones.length === 0 ? (
              <div className="text-center py-8">
                <MapPin size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No zones assigned yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {assignedZones.map(zone => (
                  <div 
                    key={zone.zone_pk}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-indigo-600 mt-1 shrink-0" />
                      <div className="space-y-1 flex-1">
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
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Status</span>
              <span className={`w-2.5 h-2.5 rounded-full ${
                site.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold font-display">{site.status === 'active' ? 'Active' : 'Draft'}</h3>
              <p className="text-sm text-slate-400 mt-1">
                {site.status === 'active' ? 'Site is live and operational' : 'Site is in draft mode'}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Statistics</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">Zones Assigned</span>
                <span className="text-sm font-bold text-slate-900">{assignedZones.length}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-xs text-slate-500 font-semibold">Primary Domain</span>
                <span className="text-sm font-bold text-slate-900">{site.primaryDomain}</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-slate-500 font-semibold">Status</span>
                <span className="text-sm font-bold text-slate-900 capitalize">{site.status}</span>
              </div>
            </div>
          </div>

          {/* Preview (Coming Soon) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">Preview</h2>
            <button 
              className="w-full py-3 bg-slate-100 text-slate-400 rounded-lg text-sm font-bold cursor-not-allowed flex items-center justify-center gap-2"
              disabled
            >
              <ExternalLink size={16} />
              Live Preview (L5 Pending)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
