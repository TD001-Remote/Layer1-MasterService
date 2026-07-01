/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Eye, Download, Upload, Calendar, FileText, Share2, Copy, ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { getAllEntityDomains } from '../../data/domains';
import type { ActiveEntity } from '../../types';
import { entityApi } from '../../services/api';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';

interface UploadRecord {
  id: string;
  domain: string;
  entityType: 'entity' | 'non-entity';
  fileName: string;
  driveLink: string;
  uploadedAt: string;
  uploadedBy: string;
  recordCount: number;
  status: 'success' | 'failed' | 'pending';
}

interface ScheduledJob {
  id: string;
  domain: string;
  nextRun: string;
  lastRun?: string;
  status: 'scheduled' | 'running' | 'completed' | 'failed';
}

export default function EntityPage() {
  const { activeEntities } = useData();
  const entityDomains = getAllEntityDomains();

  const [fbEntities, setFbEntities] = useState<ActiveEntity[]>([]);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushModalDomain, setPushModalDomain] = useState<string>('');
  const [driveLinkInput, setDriveLinkInput] = useState('');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [jsonPreviewContent, setJsonPreviewContent] = useState('');
  const [jsonPreviewFileName, setJsonPreviewFileName] = useState('');

  const loadFirebaseCounts = async () => {
    setIsLoadingCounts(true);
    try {
      const entities = await entityApi.getAll();
      setFbEntities(entities);
    } catch (err) {
      console.error('Failed to load Firebase counts:', String(err).replace(/[\r\n]/g, ' '));
    } finally {
      setIsLoadingCounts(false);
    }
  };

  useEffect(() => {
    loadFirebaseCounts();
    const storedHistory = JSON.parse(localStorage.getItem('l1ToL2UploadHistory_entity') || '[]');
    if (Array.isArray(storedHistory)) setUploadHistory(storedHistory);
    const storedJobs = JSON.parse(localStorage.getItem('l1ToL2ScheduledJobs_entity') || '[]');
    if (Array.isArray(storedJobs)) setScheduledJobs(storedJobs);
  }, []);

  useEffect(() => {
    localStorage.setItem('l1ToL2UploadHistory_entity', JSON.stringify(uploadHistory));
  }, [uploadHistory]);

  useEffect(() => {
    localStorage.setItem('l1ToL2ScheduledJobs_entity', JSON.stringify(scheduledJobs));
  }, [scheduledJobs]);

  const entities = fbEntities.length > 0 ? fbEntities : activeEntities;

  const generateJSONData = (domainCode: string) => {
    const data = entities.filter(e => e.primary_domain === domainCode);
    return JSON.stringify(data.map(e => ({
      pk: e.entity_pk,
      name: e.entity_name,
      domain: e.primary_domain,
      category: e.category_pk,
      category_name: e.category_name,
      type: e.type_pk,
      visibility_type: e.visibility_type,
      status: e.status,
      created_at: e.createdAt,
      updated_at: e.updatedAt,
      branch: {
        geo: `${e.stateId}/${e.districtId}/${e.talukId}/${e.cityVillageId}/${e.areaId}/${e.streetId}`,
        zone: e.zone_pk,
        dct: `${e.primary_domain}/${e.category_pk}${e.type_pk ? `/${e.type_pk}` : ''}`,
        site: e.website_zone_entity_id || null,
      },
      phone: e.phone || null,
    })), null, 2);
  };

  const handleDownloadJSON = (domainCode: string) => {
    const fileName = `${domainCode.toLowerCase()}.entity.json`;
    const jsonData = generateJSONData(domainCode);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewJSON = (domainCode: string) => {
    const fileName = `${domainCode.toLowerCase()}.entity.json`;
    setJsonPreviewContent(generateJSONData(domainCode));
    setJsonPreviewFileName(fileName);
    setShowJsonPreview(true);
  };

  const pushToL2 = (domainCode: string) => {
    setPushModalDomain(domainCode);
    setDriveLinkInput('');
    setShowPushModal(true);
  };

  const confirmPushToL2 = async () => {
    if (!pushModalDomain) return;
    setIsUploading(true);
    try {
      const fileName = `${pushModalDomain.toLowerCase()}.entity.json`;
      const jsonData = generateJSONData(pushModalDomain);
      const finalDriveLink = driveLinkInput.trim() || `https://drive.google.com/file/d/mock-${Date.now()}-${pushModalDomain}-entity/view`;
      const entityCount = entities.filter(e => e.primary_domain === pushModalDomain).length;

      const record: UploadRecord = {
        id: `UPLOAD-${Date.now()}`,
        domain: pushModalDomain,
        entityType: 'entity',
        fileName,
        driveLink: finalDriveLink,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
        recordCount: entityCount,
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

      alert(`Entity data pushed to L2 successfully!\nFile: ${fileName}\nDrive Link: ${finalDriveLink}\nRecords: ${entityCount}`);
    } catch (err) {
      const record: UploadRecord = {
        id: `UPLOAD-${Date.now()}`,
        domain: pushModalDomain,
        entityType: 'entity',
        fileName: `${pushModalDomain.toLowerCase()}.entity.json`,
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

  const scheduleCronJob = (domainCode: string, intervalDays: number = 2) => {
    setIsScheduling(true);
    try {
      const job: ScheduledJob = {
        id: `JOB-${Date.now()}`,
        domain: domainCode,
        nextRun: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
      };
      setScheduledJobs(prev => [...prev, job]);
      setTimeout(() => {
        setScheduledJobs(prev => prev.map(j => j.id === job.id ? { ...j, status: 'running', lastRun: j.nextRun } : j));
      }, 100);
      alert(`Cron job scheduled for domain ${domainCode} every ${intervalDays} days.`);
    } catch (err) {
      alert(`Failed to schedule: ${String(err).replace(/[\r\n]/g, ' ')}`);
    } finally {
      setIsScheduling(false);
    }
  };

  const cancelScheduledJob = (jobId: string) => {
    setScheduledJobs(prev => prev.filter(j => j.id !== jobId));
    alert('Scheduled job cancelled.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight mb-5">Entity Data Export</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-extrabold text-surface-700 mb-2 uppercase tracking-widest">
              Select Domain
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
            >
              <option value="">All Entity Domains</option>
              {entityDomains.map(d => (
                <option key={d.code} value={d.code}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border border-surface-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Domain</th>
                  <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Entities</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {entityDomains
                  .filter(d => !selectedDomain || d.code === selectedDomain)
                  .map(domain => {
                    const entityCount = entities.filter(e => e.primary_domain === domain.code).length;
                    return (
                      <tr key={domain.code} className="hover:bg-surface-50/80 transition-colors duration-150">
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-surface-900">{domain.name}</div>
                          <div className="text-xs text-surface-400 font-mono mt-0.5">{domain.code}</div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-extrabold text-indigo-600">{entityCount}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button onClick={() => previewJSON(domain.code)} className="p-2 text-surface-500 hover:text-surface-800 hover:bg-surface-100 rounded-xl transition-all" title="Preview JSON">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDownloadJSON(domain.code)} className="p-2 text-surface-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Download JSON">
                              <Download className="w-4 h-4" />
                            </button>
                            <button onClick={() => pushToL2(domain.code)} disabled={isUploading} className="p-2 text-surface-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all disabled:opacity-40" title="Push to L2">
                              <Upload className="w-4 h-4" />
                            </button>
                            <button onClick={() => scheduleCronJob(domain.code, 2)} disabled={isScheduling} className="p-2 text-surface-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all disabled:opacity-40" title="Schedule Cron">
                              <Calendar className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
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
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Domain</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Next Run</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {scheduledJobs.map(job => (
                    <tr key={job.id} className="hover:bg-surface-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-xs font-mono font-bold text-surface-600">{job.id}</td>
                      <td className="px-5 py-3.5 font-extrabold text-surface-900">{job.domain}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-surface-600">
                        {new Date(job.nextRun).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-3 py-1.5 text-xs rounded-full font-extrabold ${
                          job.status === 'scheduled' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
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
          <Share2 className="w-5 h-5" />
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
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Domain</th>
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
                      <td className="px-5 py-3.5 text-sm font-medium text-surface-600">{upload.domain}</td>
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
                            <a href={upload.driveLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 font-semibold" title={upload.driveLink}>
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

      <Modal isOpen={showPushModal} onClose={() => setShowPushModal(false)} title="Push Entity Data to L2" maxWidth="lg">
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Domain: <span className="font-bold text-slate-900">{pushModalDomain}</span></p>
            <p className="text-sm text-slate-600">Type: <span className="font-bold text-slate-900">Entity</span></p>
            <p className="text-sm text-slate-600">Records: <span className="font-bold text-slate-900">{entities.filter(e => e.primary_domain === pushModalDomain).length}</span></p>
          </div>
          <Input label="Google Drive Link (Optional)" value={driveLinkInput} onChange={(e) => setDriveLinkInput(e.target.value)} placeholder="https://drive.google.com/file/d/..." helperText="Leave empty to auto-generate a mock link." />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowPushModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={confirmPushToL2} disabled={isUploading} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {isUploading ? 'Pushing...' : 'Confirm Push to L2'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showJsonPreview} onClose={() => setShowJsonPreview(false)} title={`JSON Preview: ${jsonPreviewFileName}`} maxWidth="2xl">
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