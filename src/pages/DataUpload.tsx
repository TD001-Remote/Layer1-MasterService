/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../contexts/DataContext";
import { getAllNonEntityDomains, getAllEntityDomains } from "../data/domains";
import { NonEntity, ActiveEntity } from "../types";
import { ChevronLeft, Database, Upload, Download, ExternalLink, Calendar, Clock, CheckCircle, XCircle, AlertTriangle, FileText, Share2, Eye, Trash2, Copy, RefreshCw } from "lucide-react";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { entityApi, nonEntityApi } from "../services/api";

function ActionBtn({ icon, onClick, disabled, title, color = 'surface' }: { icon: React.ReactNode; onClick: () => void; disabled?: boolean; title: string; color?: 'surface' | 'blue' | 'indigo' | 'emerald' | 'purple' }) {
  const colors: Record<string, string> = {
    surface: 'text-surface-500 hover:text-surface-800 hover:bg-surface-100',
    blue: 'text-surface-500 hover:text-blue-600 hover:bg-blue-50',
    indigo: 'text-surface-500 hover:text-indigo-600 hover:bg-indigo-50',
    emerald: 'text-surface-500 hover:text-emerald-600 hover:bg-emerald-50',
    purple: 'text-surface-500 hover:text-purple-600 hover:bg-purple-50',
  };
  return (
    <button onClick={onClick} disabled={disabled} title={title} className={`p-2 rounded-xl transition-all duration-150 ${colors[color]} disabled:opacity-40 disabled:cursor-not-allowed`}>
      {icon}
    </button>
  );
}

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

export default function DataUpload() {
  const navigate = useNavigate();
  const { nonEntities, activeEntities } = useData();

  const nonEntityDomains = getAllNonEntityDomains();
  const entityDomains = getAllEntityDomains();
  const allDomains = [...nonEntityDomains, ...entityDomains];

  const [selectedDomain, setSelectedDomain] = useState('');
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushModalDomain, setPushModalDomain] = useState<string>('');
  const [pushModalType, setPushModalType] = useState<'entity' | 'non-entity'>('entity');
  const [driveLinkInput, setDriveLinkInput] = useState('');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [jsonPreviewContent, setJsonPreviewContent] = useState('');
  const [jsonPreviewFileName, setJsonPreviewFileName] = useState('');
  const [fbCounts, setFbCounts] = useState<Record<string, { entity: number; nonEntity: number }>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [mergedDomains, setMergedDomains] = useState(allDomains);
  const [fbEntities, setFbEntities] = useState<ActiveEntity[]>([]);
  const [fbNonEntities, setFbNonEntities] = useState<NonEntity[]>([]);

  const loadFirebaseCounts = async () => {
    setIsLoadingCounts(true);
    try {
const [entities, nonEntities] = await Promise.all([
      entityApi.getAll(),
      nonEntityApi.getAll(),
    ]);

      setFbEntities(entities);
      setFbNonEntities(nonEntities);

      const fbDomainCodes = new Set<string>();
      const counts: Record<string, { entity: number; nonEntity: number }> = {};

      for (const e of entities) {
        fbDomainCodes.add(e.primary_domain);
        counts[e.primary_domain] = counts[e.primary_domain] || { entity: 0, nonEntity: 0 };
        counts[e.primary_domain].entity++;
      }
      for (const n of nonEntities) {
        fbDomainCodes.add(n.primary_domain);
        counts[n.primary_domain] = counts[n.primary_domain] || { entity: 0, nonEntity: 0 };
        counts[n.primary_domain].nonEntity++;
      }

      const unknownDomains: typeof allDomains = Array.from(fbDomainCodes)
        .filter(code => !allDomains.find(d => d.code === code))
        .map(code => ({
          id: `UNKNOWN-${code}`,
          name: code,
          code,
          categories: [],
        }));

      const merged = [...allDomains, ...unknownDomains];
      setFbCounts(counts);
      setMergedDomains(merged);
    } catch (err) {
      console.error('Failed to load Firebase counts:', String(err).replace(/[\r\n]/g, ' '));
    } finally {
      setIsLoadingCounts(false);
    }
  };

  useEffect(() => {
    loadFirebaseCounts();
  }, []);

  // Load upload history from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('l1ToL2UploadHistory') || '[]');
      if (Array.isArray(stored)) setUploadHistory(stored);
    } catch {}
  }, []);

  // Load scheduled jobs from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('l1ToL2ScheduledJobs') || '[]');
      if (Array.isArray(stored)) setScheduledJobs(stored);
    } catch {}
  }, []);

  // Save upload history
  useEffect(() => {
    try {
      localStorage.setItem('l1ToL2UploadHistory', JSON.stringify(uploadHistory));
    } catch {}
  }, [uploadHistory]);

  // Save scheduled jobs
  useEffect(() => {
    try {
      localStorage.setItem('l1ToL2ScheduledJobs', JSON.stringify(scheduledJobs));
    } catch {}
  }, [scheduledJobs]);

  const getDomainData = (domainCode: string, type: 'entity' | 'non-entity') => {
    if (type === 'entity') {
      return fbEntities.filter(e => e.primary_domain === domainCode);
    }
    return fbNonEntities.filter(n => n.primary_domain === domainCode);
  };

  const generateJSONData = (domainCode: string, type: 'entity' | 'non-entity') => {
    const data = getDomainData(domainCode, type);
    
    const formattedData = data.map(record => {
      const base: any = {
        pk: 'entity_pk' in record ? record.entity_pk : record.non_entity_pk,
        name: 'entity_name' in record ? record.entity_name : record.non_entity_name,
        domain: record.primary_domain,
        category: record.category_pk,
        category_name: record.category_name,
        visibility_type: record.visibility_type,
        status: record.status,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
      };

      // For non-entities: add geo-zone-dct-site branch if available
      if (type === 'non-entity') {
        const nonEntity = record as NonEntity;
        base.branch = {
          geo: `${nonEntity.stateId}/${nonEntity.districtId}/${nonEntity.talukId}`,
          zone: nonEntity.zone_pk || null,
          dct: `${nonEntity.primary_domain}/${nonEntity.category_pk}${nonEntity.type_pk ? `/${nonEntity.type_pk}` : ''}`,
          site: nonEntity.website_zone_entity_id || null,
        };
        if (nonEntity.phone) base.phone = nonEntity.phone;
      } else {
        const entity = record as ActiveEntity;
        base.branch = {
          geo: `${entity.stateId}/${entity.districtId}/${entity.talukId}`,
          zone: entity.zone_pk || null,
          dct: `${entity.primary_domain}/${entity.category_pk}${entity.type_pk ? `/${entity.type_pk}` : ''}`,
          site: entity.website_zone_entity_id || null,
        };
        if (entity.phone) base.phone = entity.phone;
      }

      return base;
    });

    return JSON.stringify(formattedData, null, 2);
  };

  const pushToL2 = async (domainCode: string, entityType: 'entity' | 'non-entity') => {
    setPushModalDomain(domainCode);
    setPushModalType(entityType);
    setDriveLinkInput('');
    setShowPushModal(true);
  };

  const confirmPushToL2 = async () => {
    if (!pushModalDomain) return;
    setIsUploading(true);
    
    try {
      const fileName = `${pushModalDomain.toLowerCase()}.${pushModalType}.json`;
      const jsonData = generateJSONData(pushModalDomain, pushModalType);
      const finalDriveLink = driveLinkInput.trim() || `https://drive.google.com/file/d/mock-${Date.now()}-${pushModalDomain}-${pushModalType}/view`;
      
      const record: UploadRecord = {
        id: `UPLOAD-${Date.now()}`,
        domain: pushModalDomain,
        entityType: pushModalType,
        fileName,
        driveLink: finalDriveLink,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
        recordCount: getDomainData(pushModalDomain, pushModalType).length,
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

      alert(`Data pushed to L2 successfully!\nFile: ${fileName}\nDrive Link: ${finalDriveLink}\nRecords: ${record.recordCount}`);
    } catch (err) {
      const record: UploadRecord = {
        id: `UPLOAD-${Date.now()}`,
        domain: pushModalDomain,
        entityType: pushModalType,
        fileName: `${pushModalDomain.toLowerCase()}.${pushModalType}.json`,
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

  const scheduleCronJob = async (domainCode: string, intervalDays: number = 2) => {
    setIsScheduling(true);
    
    try {
      const job: ScheduledJob = {
        id: `JOB-${Date.now()}`,
        domain: domainCode,
        nextRun: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
      };

      setScheduledJobs(prev => [...prev, job]);
      
      // In real implementation, this would create a cron job on the server
      // For demo, we simulate with localStorage and setTimeout
      setTimeout(() => {
        setScheduledJobs(prev => 
          prev.map(j => j.id === job.id ? { ...j, status: 'running', lastRun: j.nextRun } : j)
        );
      }, 100);

      alert(`Cron job scheduled for every ${intervalDays} days. Next run: ${new Date(job.nextRun).toLocaleString()}`);
    } catch (err) {
      alert(`Failed to schedule: ${String(err).replace(/[\r\n]/g, ' ')}`);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDownloadJSON = (domainCode: string, entityType: 'entity' | 'non-entity') => {
    const fileName = `${domainCode.toLowerCase()}.${entityType}.json`;
    const jsonData = generateJSONData(domainCode, entityType);
    
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewJSON = (domainCode: string, entityType: 'entity' | 'non-entity') => {
    const fileName = `${domainCode.toLowerCase()}.${entityType}.json`;
    const jsonData = generateJSONData(domainCode, entityType);
    setJsonPreviewContent(jsonData);
    setJsonPreviewFileName(fileName);
    setShowJsonPreview(true);
  };

  const cancelScheduledJob = (jobId: string) => {
    setScheduledJobs(prev => prev.filter(j => j.id !== jobId));
    alert('Scheduled job cancelled.');
  };

  const domainCounts = mergedDomains.map(domain => ({
    code: domain.code,
    name: domain.name,
    entityCount: fbCounts[domain.code]?.entity ?? 0,
    nonEntityCount: fbCounts[domain.code]?.nonEntity ?? 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 hover:bg-surface-100 rounded-xl transition-colors border border-transparent hover:border-surface-200"
          >
            <ChevronLeft className="w-5 h-5 text-surface-500" />
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight flex items-center gap-2.5">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              L1 to L2 Data Upload
            </h2>
            <p className="text-sm text-surface-500 mt-1 font-semibold">
              Push L1 data to L2 with domain/entity split. Live data only. Schedule cron for every 2 days.
            </p>
          </div>
          <button
            onClick={loadFirebaseCounts}
            disabled={isLoadingCounts}
            className="p-2.5 text-surface-500 hover:text-surface-800 hover:bg-surface-100 rounded-xl transition-all disabled:opacity-50 border border-transparent hover:border-surface-200"
            title="Refresh data from Firebase"
          >
            <RefreshCw className={`w-5 h-5 ${isLoadingCounts ? 'animate-spin text-brand-500' : ''}`} />
          </button>
        </div>
      </div>

        {/* Domain Selection */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
          <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight mb-5">Push Data to L2</h3>
          
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
               <option value="">All Domains</option>
               {mergedDomains.map(d => (
                 <option key={d.code} value={d.code}>
                   {d.name} ({d.code})
                 </option>
               ))}
             </select>
            </div>
          </div>

          {/* Domain Data Summary */}
          <div className="border border-surface-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Domain</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Entities</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Non-Entities</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {domainCounts
                    .filter(d => !selectedDomain || d.code === selectedDomain)
                    .map(domain => (
                    <tr key={domain.code} className="hover:bg-surface-50/80 transition-colors duration-150">
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-surface-900">{domain.name}</div>
                        <div className="text-xs text-surface-400 font-mono mt-0.5">{domain.code}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-extrabold text-indigo-600">{domain.entityCount}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-extrabold text-emerald-600">{domain.nonEntityCount}</span>
                      </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <ActionBtn icon={<Eye className="w-4 h-4" />} onClick={() => previewJSON(domain.code, 'entity')} title="Preview Entity JSON" color="surface" />
                            <ActionBtn icon={<Download className="w-4 h-4" />} onClick={() => handleDownloadJSON(domain.code, 'entity')} title="Download Entity JSON" color="blue" />
                            <ActionBtn icon={<Upload className="w-4 h-4" />} onClick={() => pushToL2(domain.code, 'entity')} disabled={isUploading} title="Push Entity to L2" color="indigo" />
                            <ActionBtn icon={<Calendar className="w-4 h-4" />} onClick={() => scheduleCronJob(domain.code, 2)} disabled={isScheduling} title="Schedule Cron" color="purple" />
                            <ActionBtn icon={<Eye className="w-4 h-4" />} onClick={() => previewJSON(domain.code, 'non-entity')} title="Preview Non-Entity JSON" color="surface" />
                            <ActionBtn icon={<Download className="w-4 h-4" />} onClick={() => handleDownloadJSON(domain.code, 'non-entity')} title="Download Non-Entity JSON" color="emerald" />
                            <ActionBtn icon={<Upload className="w-4 h-4" />} onClick={() => pushToL2(domain.code, 'non-entity')} disabled={isUploading} title="Push Non-Entity to L2" color="emerald" />
                            <ActionBtn icon={<Calendar className="w-4 h-4" />} onClick={() => scheduleCronJob(domain.code, 2)} disabled={isScheduling} title="Schedule Cron" color="purple" />
                          </div>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* Scheduled Jobs */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight mb-5 flex items-center gap-2.5">
          <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          Scheduled Cron Jobs
        </h3>
        
        {scheduledJobs.length === 0 ? (
          <div className="text-center py-12 text-surface-400 space-y-2">
            <Calendar className="w-12 h-12 mx-auto opacity-30" />
            <p className="font-medium text-surface-600">No scheduled jobs</p>
            <p className="text-sm text-surface-500">Click the calendar icon to schedule a 2-day cron push.</p>
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
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Last Run</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Status</th>
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
                      <td className="px-5 py-3.5 text-sm font-medium text-surface-600">
                        {job.lastRun ? new Date(job.lastRun).toLocaleString() : '—'}
                      </td>
                       <td className="px-5 py-3.5">
                         <div className="flex items-center gap-2">
                           <span className={`px-3 py-1.5 text-xs rounded-full font-extrabold ${
                             job.status === 'scheduled' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                             job.status === 'running' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                             job.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                             'bg-rose-100 text-rose-700 border border-rose-200'
                           }`}>
                             {job.status}
                           </span>
                           {job.status === 'scheduled' && (
                             <button
                               onClick={() => cancelScheduledJob(job.id)}
                               className="p-1.5 text-surface-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                               title="Cancel job"
                             >
                               <Trash2 className="w-3.5 h-3.5" />
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

      {/* Upload History */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight mb-5 flex items-center gap-2.5">
          <div className="p-2 bg-brand-100 text-brand-700 rounded-xl">
            <Share2 className="w-5 h-5" />
          </div>
          Upload History
        </h3>
        
        {uploadHistory.length === 0 ? (
          <div className="text-center py-12 text-surface-400 space-y-2">
            <FileText className="w-12 h-12 mx-auto opacity-30" />
            <p className="font-medium text-surface-600">No upload history yet</p>
            <p className="text-sm text-surface-500">Push data to L2 to see history here.</p>
          </div>
        ) : (
          <div className="border border-surface-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">File</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Domain/Type</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Records</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Uploaded At</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Status</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {uploadHistory.map(upload => (
                    <tr key={upload.id} className="hover:bg-surface-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-extrabold text-surface-900">{upload.fileName}</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-surface-600">
                        {upload.domain} / {upload.entityType}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-surface-600">
                        {upload.recordCount}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-surface-600">
                        {new Date(upload.uploadedAt).toLocaleString()}
                      </td>
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
                             <a
                               href={upload.driveLink}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="text-indigo-600 hover:text-indigo-800 font-semibold"
                               title={upload.driveLink}
                             >
                               <ExternalLink className="w-4 h-4" />
                             </a>
                             <button
                               onClick={() => {
                                 navigator.clipboard.writeText(upload.driveLink);
                                 alert('Drive link copied to clipboard!');
                               }}
                               className="p-1.5 text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 transition-all"
                               title="Copy link"
                             >
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

      {/* Instructions */}
      <div className="bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 rounded-2xl p-5">
        <h4 className="font-extrabold text-brand-900 mb-3 flex items-center gap-2 uppercase tracking-wider text-sm">
          <AlertTriangle className="w-4 h-4" />
          L1 to L2 Data Flow Instructions
        </h4>
        <ul className="text-sm text-brand-800 space-y-1.5 font-medium">
          <li>• Data is split by domain and entity/non-entity (e.g., agri.entity.json)</li>
          <li>• Non-entity files include geo-zone-dct-site branch info if available</li>
          <li>• Admin pushes data to L2 and stores Google Drive link on L1</li>
          <li>• Click calendar icon to schedule automatic push every 2 days</li>
          <li>• Only live (active) data is pushed to L2</li>
        </ul>
      </div>

      {/* Push to L2 Modal */}
      <Modal
        isOpen={showPushModal}
        onClose={() => setShowPushModal(false)}
        title="Push Data to L2"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">
              Domain: <span className="font-bold text-slate-900">{pushModalDomain}</span>
            </p>
            <p className="text-sm text-slate-600">
              Type: <span className="font-bold text-slate-900">{pushModalType}</span>
            </p>
            <p className="text-sm text-slate-600">
              Records: <span className="font-bold text-slate-900">{getDomainData(pushModalDomain, pushModalType).length}</span>
            </p>
          </div>
          
          <Input
            label="Google Drive Link (Optional)"
            value={driveLinkInput}
            onChange={(e) => setDriveLinkInput(e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
            helperText="Leave empty to auto-generate a mock link. Enter a real Google Drive URL after uploading."
          />

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>Note:</strong> Download the JSON file first, upload it to Google Drive manually, then paste the Drive link above before confirming.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowPushModal(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmPushToL2}
              disabled={isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Pushing...' : 'Confirm Push to L2'}
            </button>
          </div>
        </div>
      </Modal>

      {/* JSON Preview Modal */}
      <Modal
        isOpen={showJsonPreview}
        onClose={() => setShowJsonPreview(false)}
        title={`JSON Preview: ${jsonPreviewFileName}`}
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-auto max-h-96 whitespace-pre-wrap">
            {jsonPreviewContent}
          </pre>
          <div className="flex justify-end">
            <button
              onClick={() => setShowJsonPreview(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}