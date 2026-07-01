/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Eye, Download, Upload, Calendar, FileText, Copy, ExternalLink, CheckCircle, XCircle, MapIcon, RefreshCw } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import type { ZoneRef, CityVillage, Area, Street, SubStreet } from '../../types';
import { geoApi } from '../../services/api';
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

export default function GeoZonePage() {
  const { zoneRefs: ctxZoneRefs, states, districts, taluks, cities, areas, streets, substreets } = useData();

  const [fbCities, setFbCities] = useState<CityVillage[]>([]);
  const [fbAreas, setFbAreas] = useState<Area[]>([]);
  const [fbStreets, setFbStreets] = useState<Street[]>([]);
  const [fbSubstreets, setFbSubstreets] = useState<SubStreet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<UploadRecord[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledJob[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [driveLinkInput, setDriveLinkInput] = useState('');
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [jsonPreviewContent, setJsonPreviewContent] = useState('');

  const loadGeoData = async () => {
    setIsLoading(true);
    try {
      const [cities, areas, streets, substreets] = await Promise.all([
        geoApi.getCities(),
        geoApi.getAreas(),
        geoApi.getStreets(),
        geoApi.getSubstreets(),
      ]);
      setFbCities(cities.length > 0 ? cities : (cities as any));
      setFbAreas(areas.length > 0 ? areas : (areas as any));
      setFbStreets(streets.length > 0 ? streets : (streets as any));
      setFbSubstreets(substreets.length > 0 ? substreets : (substreets as any));
    } catch (err) {
      setFbCities(cities as any);
      setFbAreas(areas as any);
      setFbStreets(streets as any);
      setFbSubstreets(substreets as any);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGeoData();
    const storedHistory = JSON.parse(localStorage.getItem('l1ToL2UploadHistory_geoZone') || '[]');
    if (Array.isArray(storedHistory)) setUploadHistory(storedHistory);
    const storedJobs = JSON.parse(localStorage.getItem('l1ToL2ScheduledJobs_geoZone') || '[]');
    if (Array.isArray(storedJobs)) setScheduledJobs(storedJobs);
  }, []);

  useEffect(() => {
    localStorage.setItem('l1ToL2UploadHistory_geoZone', JSON.stringify(uploadHistory));
  }, [uploadHistory]);

  useEffect(() => {
    localStorage.setItem('l1ToL2ScheduledJobs_geoZone', JSON.stringify(scheduledJobs));
  }, [scheduledJobs]);

  const zoneRefs = ctxZoneRefs;
  const allGeoData = {
    states,
    districts,
    taluks,
    cities: fbCities.length > 0 ? fbCities : cities,
    areas: fbAreas.length > 0 ? fbAreas : areas,
    streets: fbStreets.length > 0 ? fbStreets : streets,
    substreets: fbSubstreets.length > 0 ? fbSubstreets : substreets,
    zoneRefs,
  };

  const generateJSONData = () => {
    return JSON.stringify({
      states: allGeoData.states.map(s => ({ id: s.id, name: s.name })),
      districts: allGeoData.districts.map(d => ({ id: d.id, stateId: d.stateId, name: d.name })),
      taluks: allGeoData.taluks.map(t => ({ id: t.id, districtId: t.districtId, name: t.name })),
      cities: allGeoData.cities.map(c => ({ id: c.id, talukId: c.talukId, name: c.name })),
      areas: allGeoData.areas.map(a => ({ id: a.id, cityVillageId: a.cityVillageId, name: a.name })),
      streets: allGeoData.streets.map(s => ({ id: s.id, areaId: s.areaId, name: s.name, substreetsCount: s.substreetsCount })),
      substreets: allGeoData.substreets.map(s => ({ id: s.id, streetId: s.streetId, name: s.name })),
      zoneRefs: allGeoData.zoneRefs.map(z => ({ zone_pk: z.zone_pk, fullAddress: z.fullAddress })),
    }, null, 2);
  };

  const handleDownloadJSON = () => {
    const fileName = 'geo-zone.all.json';
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
      const fileName = 'geo-zone.all.json';
      const jsonData = generateJSONData();
      const finalDriveLink = driveLinkInput.trim() || `https://drive.google.com/file/d/mock-${Date.now()}-geo-zone/view`;
      const totalRecords = allGeoData.cities.length + allGeoData.areas.length + allGeoData.streets.length + allGeoData.substreets.length + allGeoData.zoneRefs.length;

      const record: UploadRecord = {
        id: `UPLOAD-${Date.now()}`,
        entityType: 'geo-zone',
        fileName,
        driveLink: finalDriveLink,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
        recordCount: totalRecords,
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

      alert(`Geo-Zone data pushed to L2 successfully!\nFile: ${fileName}\nDrive Link: ${finalDriveLink}\nRecords: ${totalRecords}`);
    } catch (err) {
      const record: UploadRecord = {
        id: `UPLOAD-${Date.now()}`,
        entityType: 'geo-zone',
        fileName: 'geo-zone.all.json',
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
      alert(`Cron job scheduled for Geo-Zone data every ${intervalDays} days.`);
    } catch (err) {
      alert(`Failed to schedule: ${String(err).replace(/[\r\n]/g, ' ')}`);
    }
  };

  const cancelScheduledJob = (jobId: string) => {
    setScheduledJobs(prev => prev.filter(j => j.id !== jobId));
    alert('Scheduled job cancelled.');
  };

  const totalRecords = allGeoData.cities.length + allGeoData.areas.length + allGeoData.streets.length + allGeoData.substreets.length + allGeoData.zoneRefs.length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight mb-5">Geo-Zone Data Export</h3>

        <div className="border border-surface-200 rounded-xl p-6 bg-amber-50/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900">All Geo-Zone Export</h4>
              <p className="text-sm text-slate-600 mt-1">Exports complete geographic hierarchy (states, districts, taluks, cities, areas, streets, substreets, zone refs)</p>
            </div>
            <div className="text-3xl font-bold text-amber-600">{totalRecords}</div>
          </div>

          <div className="flex gap-3">
            <button onClick={previewJSON} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Preview JSON
            </button>
            <button onClick={handleDownloadJSON} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
              <Download className="w-4 h-4" /> Download JSON
            </button>
            <button onClick={pushToL2} disabled={isUploading} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Push to L2
            </button>
            <button onClick={() => scheduleCronJob(2)} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Schedule Cron
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight mb-5 flex items-center gap-2.5">
          <MapIcon className="w-5 h-5" />
          Geo-Zone Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-700 font-medium">States</p>
            <p className="text-2xl font-bold text-amber-900">{allGeoData.states.length}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-700 font-medium">Districts</p>
            <p className="text-2xl font-bold text-amber-900">{allGeoData.districts.length}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-700 font-medium">Taluks</p>
            <p className="text-2xl font-bold text-amber-900">{allGeoData.taluks.length}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-700 font-medium">Cities/Villages</p>
            <p className="text-2xl font-bold text-amber-900">{allGeoData.cities.length}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-700 font-medium">Areas</p>
            <p className="text-2xl font-bold text-amber-900">{allGeoData.areas.length}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-700 font-medium">Streets</p>
            <p className="text-2xl font-bold text-amber-900">{allGeoData.streets.length}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-700 font-medium">Substreets</p>
            <p className="text-2xl font-bold text-amber-900">{allGeoData.substreets.length}</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <p className="text-sm text-amber-700 font-medium">Zone Refs</p>
            <p className="text-2xl font-bold text-amber-900">{allGeoData.zoneRefs.length}</p>
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
                          job.status === 'scheduled' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                          job.status === 'running' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
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

      <Modal isOpen={showPushModal} onClose={() => setShowPushModal(false)} title="Push Geo-Zone Data to L2" maxWidth="lg">
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <p className="text-sm text-slate-600">Type: <span className="font-bold text-slate-900">Geo-Zone</span></p>
            <p className="text-sm text-slate-600">Records: <span className="font-bold text-slate-900">{totalRecords}</span></p>
          </div>
          <Input label="Google Drive Link (Optional)" value={driveLinkInput} onChange={(e) => setDriveLinkInput(e.target.value)} placeholder="https://drive.google.com/file/d/..." helperText="Leave empty to auto-generate a mock link." />
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowPushModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
            <button onClick={confirmPushToL2} disabled={isUploading} className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed">
              {isUploading ? 'Pushing...' : 'Confirm Push to L2'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showJsonPreview} onClose={() => setShowJsonPreview(false)} title="JSON Preview: geo-zone.all.json" maxWidth="2xl">
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
