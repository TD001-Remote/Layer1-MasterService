/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Eye, Download, Upload, Calendar, FileText, Copy, ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import type { Person } from '../../types';
import { personApi } from '../../services/api';
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

export default function PersonPage() {
  const { persons: ctxPersons, activeEntities, nonEntities } = useData();

  const [fbPersons, setFbPersons] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [driveLinkInput, setDriveLinkInput] = useState('');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [jsonPreviewContent, setJsonPreviewContent] = useState('');

  const loadPersons = async () => {
    setIsLoading(true);
    try {
      const persons = await personApi.getAll();
      setFbPersons(persons);
    } catch (err) {
      setFbPersons(ctxPersons);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPersons();
    const storedHistory = JSON.parse(localStorage.getItem('l1ToL2UploadHistory_person') || '[]');
    if (Array.isArray(storedHistory)) setUploadHistory(storedHistory);
    const storedJobs = JSON.parse(localStorage.getItem('l1ToL2ScheduledJobs_person') || '[]');
    if (Array.isArray(storedJobs)) setScheduledJobs(storedJobs);
  }, []);

  useEffect(() => {
    localStorage.setItem('l1ToL2UploadHistory_person', JSON.stringify(uploadHistory));
  }, [uploadHistory]);

  useEffect(() => {
    localStorage.setItem('l1ToL2ScheduledJobs_person', JSON.stringify(scheduledJobs));
  }, [scheduledJobs]);

  const persons = fbPersons.length > 0 ? fbPersons : ctxPersons;

  const generateJSONData = () => {
    return JSON.stringify(persons.map(person => ({
      pk: person.person_pk,
      name: person.name,
      status: person.status,
      created_at: person.createdAt,
      entities: person.entities.map(e => ({
        entity_pk: e.entity_pk,
        order: e.order,
        entity_name: activeEntities.find(a => a.entity_pk === e.entity_pk)?.entity_name || e.entity_pk,
      })),
      non_entities: person.non_entities.map(n => ({
        non_entity_pk: n,
        non_entity_name: nonEntities.find(a => a.non_entity_pk === n)?.non_entity_name || n,
      })),
      parent_person_pk: person.parent_person_pk || null,
      status_log: person.statusLog,
    })), null, 2);
  };

  const handleDownloadJSON = () => {
    const fileName = 'persons.all.json';
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
      const fileName = 'persons.all.json';
      const jsonData = generateJSONData();
      const finalDriveLink = driveLinkInput.trim() || `https://drive.google.com/file/d/mock-${Date.now()}-persons/view`;

      const record: UploadRecord = {
        id: `UPLOAD-${Date.now()}`,
        entityType: 'person',
        fileName,
        driveLink: finalDriveLink,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
        recordCount: persons.length,
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

      alert(`Person data pushed to L2 successfully!\nFile: ${fileName}\nDrive Link: ${finalDriveLink}\nRecords: ${persons.length}`);
    } catch (err) {
      const record: UploadRecord = {
        id: `UPLOAD-${Date.now()}`,
        entityType: 'person',
        fileName: 'persons.all.json',
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
      alert(`Cron job scheduled for Person data every ${intervalDays} days.`);
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
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight mb-5">Person Data Export</h3>

        <div className="border border-surface-200 rounded-xl p-6 bg-indigo-50/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900">All Persons Export</h4>
              <p className="text-sm text-slate-600 mt-1">Exports all person records with entity and non-entity relationships</p>
            </div>
            <div className="text-3xl font-bold text-indigo-600">{persons.length}</div>
          </div>

          <div className="flex gap-3">
            <button onClick={previewJSON} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Preview JSON
            </button>
            <button onClick={handleDownloadJSON} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" /> Download JSON
            </button>
            <button onClick={pushToL2} disabled={isUploading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Push to L2
            </button>
            <button onClick={() => scheduleCronJob(2)} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Schedule Cron
            </button>
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
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Next Run</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-extrabold text-surface-500 uppercase tracking-widest">Last Run</th>
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
                      <td className="px-5 py-3.5 text-sm font-medium text-surface-600">
                        {job.lastRun ? new Date(job.lastRun).toLocaleString() : '—'}
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

      <Modal isOpen={showPushModal} onClose={() => setShowPushModal(false)} title="Push Person Data to L2" maxWidth="lg">
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Type: <span className="font-bold text-slate-900">Person</span></p>
            <p className="text-sm text-slate-600">Records: <span className="font-bold text-slate-900">{persons.length}</span></p>
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

      <Modal isOpen={showJsonPreview} onClose={() => setShowJsonPreview(false)} title="JSON Preview: persons.all.json" maxWidth="2xl">
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