/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, MapPin, Edit2, CheckCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export default function SiteDetails() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { sites, zoneRefs, updateSite } = useData();

  const site = sites.find(s => s.site_id === siteId);

  if (!site) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <Globe className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Site Not Found</h3>
          <button onClick={() => navigate('/sites')} className="text-indigo-600 text-sm font-semibold flex items-center gap-1 mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Sites
          </button>
        </div>
      </div>
    );
  }

  const assignedZones = zoneRefs.filter(z => site.zoneIds.includes(z.zone_pk));

  const handleActivate = () => updateSite({ ...site, status: 'active' });
  const handleDraft = () => updateSite({ ...site, status: 'draft' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/sites')} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{site.title}</h1>
            <p className="text-xs font-mono text-slate-400 mt-0.5">{site.site_id} · {site.subdomain}.registry.in</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {site.status === 'draft' ? (
            <button onClick={handleActivate} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Activate
            </button>
          ) : (
            <button onClick={handleDraft} className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-semibold rounded-lg">
              Set to Draft
            </button>
          )}
          <button
            onClick={() => navigate(`/sites/edit/${site.site_id}`)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" /> Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* L1 Primary Data */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">L1 Primary Data</h2>

          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Site ID</p>
            <p className="mt-1 font-mono font-bold text-slate-800 bg-slate-100 px-3 py-2 rounded-lg text-sm">{site.site_id}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Title</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{site.title}</p>
          </div>

          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Subdomain</p>
            <div className="flex items-center gap-2 mt-1">
              <Globe className="w-4 h-4 text-slate-400" />
              <p className="text-sm font-mono text-slate-800">{site.subdomain}.registry.in</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Status</p>
            <span className={`inline-block mt-1 px-3 py-1 rounded-lg text-sm font-bold ${
              site.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {site.status.toUpperCase()}
            </span>
          </div>

          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Zones Assigned</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{site.zoneIds.length}</p>
          </div>
        </div>

        {/* Assigned Zones */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Zones</h2>
            <button
              onClick={() => navigate('/sites')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Manage in Site Provisioner →
            </button>
          </div>

          {assignedZones.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No zones assigned yet</p>
              <button
                onClick={() => navigate('/sites')}
                className="mt-3 text-xs text-indigo-600 font-semibold"
              >
                Assign zones →
              </button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {assignedZones.map(zone => (
                <div key={zone.zone_pk} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <MapPin className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-mono bg-slate-900 text-indigo-300 px-2 py-0.5 rounded font-bold">
                      {zone.zone_pk}
                    </span>
                    <p className="text-xs text-slate-600 font-medium mt-1">{zone.fullAddress}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
