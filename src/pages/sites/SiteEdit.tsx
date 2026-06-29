/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { validateRequired, validateSubdomain } from '../../utils/validation';

export default function SiteEdit() {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  const { sites, updateSite } = useData();

  const site = sites.find(s => s.site_id === siteId);

  const [title, setTitle] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [subdomainError, setSubdomainError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (site) {
      setTitle(site.title);
      setSubdomain(site.subdomain);
      setStatus(site.status);
    }
  }, [site]);

  if (!site) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <h3 className="text-lg font-bold text-slate-900">Site Not Found</h3>
          <button onClick={() => navigate('/sites')} className="text-indigo-600 text-sm font-semibold flex items-center gap-1 mx-auto">
            <ArrowLeft className="w-4 h-4" /> Back to Sites
          </button>
        </div>
      </div>
    );
  }

  const cleanSubdomain = (val: string) => val.toLowerCase().replace(/[^a-z0-9-]/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const titleV = validateRequired(title, 'Title');
    setTitleError(titleV.isValid ? null : titleV.error || 'Required');

    const slug = cleanSubdomain(subdomain);
    const subErr = validateSubdomain(slug, sites.filter(s => s.site_id !== siteId).map(s => s.subdomain));
    setSubdomainError(subErr);

    if (!titleV.isValid || subErr) { setLoading(false); return; }

    try {
      await updateSite({ ...site, title: title.trim(), subdomain: slug, status });
      navigate(`/sites/${siteId}`);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <button onClick={() => navigate(`/sites/${siteId}`)} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Site</h1>
          <p className="text-xs font-mono text-slate-400">{site.site_id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">L1 Primary Data</h2>

          {/* Site ID — read only */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Site ID</label>
            <input
              value={site.site_id}
              disabled
              className="w-full px-4 py-2.5 text-sm font-mono bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setTitleError(null); }}
              className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                titleError ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-500'
              }`}
            />
            {titleError && <p className="text-xs text-red-500 mt-1">⚠ {titleError}</p>}
          </div>

          {/* Subdomain */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Subdomain <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <input
                type="text"
                value={subdomain}
                onChange={e => { setSubdomain(cleanSubdomain(e.target.value)); setSubdomainError(null); }}
                className={`flex-1 px-4 py-2.5 text-sm font-mono border rounded-l-lg focus:outline-none focus:ring-2 transition-all ${
                  subdomainError ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-200 focus:border-indigo-500'
                }`}
              />
              <span className="px-3 py-2.5 bg-slate-100 border border-l-0 border-slate-300 text-slate-500 text-xs font-mono rounded-r-lg">
                .registry.in
              </span>
            </div>
            {subdomainError && <p className="text-xs text-red-500 mt-1">⚠ {subdomainError}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as 'draft' | 'active')}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
            </select>
          </div>
        </div>

        <p className="text-xs text-slate-400 px-1">
          Zone assignments are managed in the <button type="button" onClick={() => navigate('/sites')} className="text-indigo-500 underline">Site Provisioner</button>.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(`/sites/${siteId}`)}
            className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </form>
    </div>
  );
}
