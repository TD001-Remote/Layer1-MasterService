/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Eye, Download, Upload, Calendar, FileText, Copy, ExternalLink, CheckCircle, XCircle, Globe, RefreshCw } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import type { SetSite } from '../../types';
import { siteApi } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

interface UploadRecord {
  id: string;
  entityType: string;
  fileName: string;
  driveLink: string;
  uploadedAt: string;
  uploadedBy: string;
  recordCount: number;
  status: 'success' | 'failed' | 'pending';
}

interface ScheduledJob {
  id: string;
  nextRun: string;
  lastRun?: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
}

export default function SitePage() {
  const { sites: ctxSites } = useData();

  const [fbSites, setFbSites] = useState<SetSite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [driveLinkInput, setDriveLinkInput] = useState('');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [jsonPreviewContent, setJsonPreviewContent] = useState('');

  const loadSites = async () => {
    setIsLoading(true);
    try {
      const sites = await siteApi.getAll();
      setFbSites(sites);
    } catch (err) {
      setFbSites(ctxSites);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSites();
    const storedHistory = JSON.parse(localStorage.getItem('l1ToL2UploadHistory_site') || '[]');
    if (Array.isArray(storedHistory)) setUploadHistory(storedHistory);
    const storedJobs = JSON.parse(localStorage.getItem('l1ToL2ScheduledJobs_site') || '[]');
    if (Array.isArray(storedJobs)) setScheduledJobs(storedJobs);
  }, []);

  useEffect(() => {
    localStorage.setItem('l1ToL2UploadHistory_site', JSON.stringify(uploadHistory));
  }, [uploadHistory]);

  useEffect(() => {
    localStorage.setItem('l1ToL2ScheduledJobs_site', JSON.stringify(scheduledJobs));
  }, [scheduledJobs]);

  const sites = fbSites.length > 0 ? fbSites : ctxSites;

  const generateJSONData = () => {
    return JSON.stringify(sites.map(site => ({
      site_id: site.site_id,
      title: site.title,
      subdomain: site.subdomain,
      zoneIds: site.zoneIds,
      status: site.status,
    })), null, 2);
  };

  const handleDownloadJSON = () => {
    const fileName = 'sites.all.json';
    const jsonData = generateJSONData();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewJSON = () => {
    setJsonPreviewContent(generateJSONData());
    setShowJsonPreview(true);
  };

  const pushToL2 = () => {
    setDriveLinkInput('');
    setShowPushModal(true);
  };

  const confirmPushToL2 = () => {
    setIsUploading(true);
    try {
      const fileName = 'sites.all.json';
      const jsonData = generateJSONData();
      const finalDriveLink = driveLinkInput.trim() || `https://drive.google.com/file/d/mock-${Date.now()}-sites/view`;

      const record: UploadRecord = {
        id: `UPLOAD-${Date.now()}`,
        entityType: 'site',
        fileName,
        driveLink: finalDriveLink,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
        recordCount: sites.length,
        status: 'success',
      };

      setUploadHistory(prev => [record, ...prev]);
      setShowPushModal(false);

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      alert(`Site data pushed to L2 successfully!\nFile: ${fileName}\nDrive Link: ${finalDriveLink}\nRecords: ${sites.length}`);
    } catch (err) {
      const record: UploadRecord = {
        id: `UPLOAD-${Date.now()}`,
        entityType: 'site',
        fileName: 'sites.all.json',
        driveLink: driveLinkInput.trim(),
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
        recordCount: 0,
        status: 'failed',
      };
      setUploadHistory(prev => [record, ...prev]);
      setShowPushModal(false);
      alert(`Failed to push data: ${String(err).replace(/[\r\n]/g, ' ')}`);
    } finally {
      setIsUploading(false);
    }
  };

  const scheduleCronJob = (intervalDays: number = 2) => {
    try {
      const job: ScheduledJob = {
        id: `JOB-${Date.now()}`,
        nextRun: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
      };
      setScheduledJobs(prev => [...prev, job]);
      setTimeout(() => {
        setScheduledJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'running', lastRun: j.nextRun } : j));
      }, 100);
      alert(`Cron job scheduled for Site data every ${intervalDays} days.`);
    } catch (err) {
      alert(`Failed to schedule: ${String(err).replace(/[\r\n]/g, ' ')}`);
    }
  };

  const cancelScheduledJob = (jobId: string) => {
    setScheduledJobs(prev => prev.filter(j => j.id !== jobId));
    alert('Scheduled job cancelled.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight mb-5">Site Data Export</h3>

        <div className="border border-surface-200 rounded-xl p-6 bg-purple-50/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900">All Sites Export</h4>
              <p className="text-sm text-slate-600 mt-1">Exports all site/provisioner blueprints with zone mappings</p>
            </div>
            <div className="text-3xl font-bold text-purple-600">{sites.length}</div>
          </div>

          <div className="flex gap-3">
            <button onClick={previewJSON} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Preview JSON
            </button>
            <button onClick={handleDownloadJSON} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" /> Download JSON
            </button>
            <button onClick={pushToL2} disabled={isUploading} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Push to L2
            </button>
            <button onClick={() => scheduleCronJob(2)} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Schedule Cron
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight mb-5 flex items-center gap-2.5">
          <Globe className="w-5 h-5" />
          Sites Overview
        </h3>
        {sites.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Globe className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No sites registered</p>
          </div>
        ) : (
          <div className="border border-surface-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Site ID</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Title</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Subdomain</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Zones</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {sites.map(site => (
                    <tr key={site.site_id} className="hover:bg-surface-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-mono font-bold text-surface-600">{site.site_id}</td>
                      <td className="px-5 py-3.5 font-extrabold text-surface-900">{site.title}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-surface-600">{site.subdomain}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-surface-600">{site.zoneIds.length} zone(s)</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 text-xs rounded font-bold ${site.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {site.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight mb-5 flex items-center gap-2.5">
          <Calendar className="w-5 h-5" />
          Scheduled Jobs
        </h3>
        {scheduledJobs.length === 0 ? (
          <div className="text-center py-12 text-surface-400 space-y-2">
            <Calendar className="w-12 h-12 mx-auto opacity-30" />
            <p className="font-medium text-surface-600">No scheduled jobs</p>
          </div>
        ) : (
          <div className="border border-surface-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Job ID</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Next Run</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {scheduledJobs.map(job => (
                    <tr key={job.id} className="hover:bg-surface-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-mono font-bold text-surface-600">{job.id}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-surface-600">
                        {new Date(job.nextRun).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-3 py-1.5 text-xs rounded-full font-extrabold ${
                          job.status === 'scheduled' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                          job.status === 'running' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          job.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                          'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {job.status === 'scheduled' && (
                            <button onClick={() => cancelScheduledJob(job.id)} className="p-1.5 text-surface-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all" title="Cancel job">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight mb-5 flex items-center gap-2.5">
          <FileText className="w-5 h-5" />
          Upload History
        </h3>
        {uploadHistory.length === 0 ? (
          <div className="text-center py-12 text-surface-400 space-y-2">
            <FileText className="w-12 h-12 mx-auto opacity-30" />
            <p className="font-medium text-surface-600">No upload history yet</p>
          </div>
        ) : (
          <div className="border border-surface-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">File</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Records</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Uploaded At</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {uploadHistory.map(upload => (
                    <tr key={upload.id} className="hover:bg-surface-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-extrabold text-surface-900">{upload.fileName}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-surface-600">{upload.recordCount}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-surface-600">{new Date(upload.uploadedAt).toLocaleString()}</td>
                      <td className="px-5 py-3.5">
                        {upload.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {upload.driveLink ? (
                          <div className="flex items-center gap-2">
                            <a href={upload.driveLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-800 font-semibold" title={upload.driveLink}>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button onClick={() => { navigator.clipboard.writeText(upload.driveLink); alert('Drive link copied!'); }} className="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 transition-all" title="Copy link">
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-surface-400 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showPushModal} onClose={() => setShowPushModal(false)} title="Push Site Data to L2" maxWidth="lg">
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Type: <span className="font-bold text-slate-900">Site</span></p>
            <p className="text-sm text-slate-600">Records: <span className="font-bold text-slate-900">{sites.length}</span></p>
          </div>
          <Input label="Google Drive Link (Optional)" value={driveLinkInput} onChange={(e) => setDriveLinkInput(e.target.value)} placeholder="https://drive.google.com/file/d/..." helperText="Leave empty to auto-generate a mock link." />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowPushModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={confirmPushToL2} disabled={isUploading} className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {isUploading ? 'Pushing...' : 'Confirm Push to L2'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showJsonPreview} onClose={() => setShowJsonPreview(false)} title="JSON Preview: sites.all.json" maxWidth="2xl">
        <div className="space-y-4">
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-auto max-h-96 whitespace-pre-wrap">{jsonPreviewContent}</pre>
          <div className="flex justify-end">
            <button onClick={() => setShowJsonPreview(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}