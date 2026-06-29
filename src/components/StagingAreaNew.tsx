/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Plus, Building2, MapPin, Upload, CheckCircle, XCircle, AlertTriangle, FileText, Download } from "lucide-react";
import { StagingEntity, StagingNonEntity, EntityRole, NonEntityRole } from "../types";
import { Category } from "../data/domains";
import { useData } from "../contexts/DataContext";
import { parseCSV } from "../utils/csvParser";

type TabType = 'create-entity' | 'create-non-entity' | 'upload-csv' | 'pending-review' | 'approved';

function CSVUploadTab() {
  const { createStagingEntity, createStagingNonEntity, domains } = useData();
   
  const [recordType, setRecordType] = useState<'entity' | 'non-entity'>('entity');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: string[] } | null>(null);

  const entityDomains = domains.filter(d => d.entityType === 'entity' || !d.entityType);
  const nonEntityDomains = domains.filter(d => d.entityType === 'non-entity' || !d.entityType);
  const availableDomains = recordType === 'entity' ? entityDomains : nonEntityDomains;
   
  const getCategories = () => {
    const domain = availableDomains.find(d => d.code === selectedDomain);
    return domain?.categories || [];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!csvFile || !selectedDomain || !selectedCategory) {
      alert('Please select a domain, category, and CSV file before uploading.');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const text = await csvFile.text();
      const { records, errors } = parseCSV(text);

      if (errors.length > 0 && records.length === 0) {
        setUploadResult({ success: 0, errors });
        return;
      }

      let successCount = 0;
      const rowErrors: string[] = [...errors];

      for (const record of records) {
        try {
          if (recordType === 'entity') {
            const name = record.entity_name?.trim();
            if (!name) { rowErrors.push(`Skipped row: entity_name is empty`); continue; }
            await createStagingEntity({
              entity_name: name,
              phone: record.phone || undefined,
              domain_code: selectedDomain,
              category_id: selectedCategory,
              role: 'physical-service-provider' as EntityRole,
              status: 'pending',
            });
          } else {
            const name = (record as any).non_entity_name?.trim() || record.entity_name?.trim();
            if (!name) { rowErrors.push(`Skipped row: name is empty`); continue; }
            await createStagingNonEntity({
              non_entity_name: name,
              domain_code: selectedDomain,
              category_id: selectedCategory,
              role: 'physical-asset' as NonEntityRole,
              status: 'pending',
            });
          }
          successCount++;
        } catch (err) {
          rowErrors.push(`Row failed: ${String(err).replace(/[\r\n]/g, ' ')}`);
        }
      }

      setUploadResult({ success: successCount, errors: rowErrors });
      if (successCount > 0) setCsvFile(null);
    } catch (err) {
      setUploadResult({ success: 0, errors: [`Failed to read file: ${String(err).replace(/[\r\n]/g, ' ')}`] });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const isEntity = recordType === 'entity';
    const headers = isEntity
      ? 'entity_name,record_type,primary_domain,category_pk,category_name,phone,visibility_type'
      : 'entity_name,record_type,primary_domain,category_pk,category_name,visibility_type';
    const example = isEntity
      ? `"Hospital Name","entity","${selectedDomain || 'HLT-SRV'}","${selectedCategory || 'CAT-HLTSRV-001'}","Doctor","9876543210","Public"`
      : `"Shop Space","non-entity","${selectedDomain || 'RE-COM'}","${selectedCategory || 'CAT-RECOM-001'}","Shop Space","Public"`;
     
    const blob = new Blob([`${headers}\n${example}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recordType}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight">Bulk Upload via CSV</h3>
        <p className="text-sm text-surface-500 font-semibold">
          Upload multiple records at once. All records in CSV will be assigned to the same Domain/Category/Type.
        </p>
      </div>

      <div className="bg-brand-50/80 border border-brand-200 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-brand-500/30">
            1
          </div>
          <h4 className="font-extrabold text-surface-900 font-display tracking-tight">Select Classification</h4>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-extrabold text-surface-700 uppercase tracking-widest">
            Record Type <span className="text-rose-500">*</span>
          </label>
          <div className="inline-flex gap-2 bg-white rounded-xl p-1.5 border border-surface-200 shadow-sm">
            <button
              onClick={() => {
                setRecordType('entity');
                setSelectedDomain('');
                setSelectedCategory('');
                setSelectedType('');
              }}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 ${
                recordType === 'entity'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'text-surface-500 hover:bg-surface-50'
              }`}
            >
              <Building2 className="inline w-4 h-4 mr-1.5" />
              Entity
            </button>
            <button
              onClick={() => {
                setRecordType('non-entity');
                setSelectedDomain('');
                setSelectedCategory('');
                setSelectedType('');
              }}
              className={`px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 ${
                recordType === 'non-entity'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-surface-500 hover:bg-surface-50'
              }`}
            >
              <MapPin className="inline w-4 h-4 mr-1.5" />
              Non-Entity
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-extrabold text-surface-700 mb-2 uppercase tracking-widest">
              Domain <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedDomain}
              onChange={(e) => { setSelectedDomain(e.target.value); setSelectedCategory(''); setSelectedType(''); }}
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
            >
              <option value="">Select Domain</option>
              {availableDomains.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-surface-700 mb-2 uppercase tracking-widest">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setSelectedType(''); }}
              disabled={!selectedDomain}
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 disabled:bg-surface-50 disabled:text-surface-400"
            >
              <option value="">Select Category</option>
              {getCategories().map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-extrabold text-surface-700 mb-2 uppercase tracking-widest">
              Type (Optional)
            </label>
            <input
              type="text"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              placeholder="e.g., Multi-Specialty"
              disabled={!selectedCategory}
              className="w-full px-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 disabled:bg-surface-50 disabled:text-surface-400"
            />
          </div>
        </div>

        {selectedDomain && selectedCategory && (
          <div className="mt-4 p-4 bg-white border border-brand-200 rounded-xl">
            <p className="text-xs text-brand-800 font-extrabold uppercase tracking-wider mb-1">Storage Path</p>
            <code className="font-mono text-xs block text-surface-700 bg-surface-50 p-2.5 rounded-lg">
              {recordType}-registry/domains/{selectedDomain}/categories/{selectedCategory}{selectedType ? `/types/${selectedType}` : ''}</code>
          </div>
        )}
      </div>

      {/* Step 2 */}
      <div className={`p-6 rounded-2xl border ${selectedDomain && selectedCategory ? 'bg-emerald-50/80 border-emerald-200' : 'bg-surface-50 border-surface-200'} space-y-5`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${selectedDomain && selectedCategory ? 'bg-emerald-600' : 'bg-surface-400'} text-white flex items-center justify-center font-extrabold text-sm shadow-md`}>
            2
          </div>
          <h4 className="font-extrabold text-surface-900 font-display tracking-tight">Upload CSV File</h4>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-700 hover:bg-surface-800 text-white rounded-xl text-sm font-extrabold shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Download Template
          </button>

          <div>
            <label className="block text-sm font-extrabold text-surface-700 mb-2 uppercase tracking-widest">
              CSV File <span className="text-rose-500">*</span>
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={!selectedDomain || !selectedCategory}
              className="w-full px-4 py-3 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 disabled:bg-surface-50 disabled:text-surface-400"
            />
            {csvFile && (
              <p className="text-sm text-emerald-600 mt-2 flex items-center gap-2 font-semibold">
                <FileText className="w-4 h-4" />
                {csvFile.name} ({(csvFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          <div className="p-4 bg-white border border-surface-200 rounded-xl space-y-1.5">
            <p className="text-sm font-extrabold text-surface-800 uppercase tracking-wider">CSV Format Requirements:</p>
            <ul className="text-xs text-surface-600 space-y-1.5 font-medium">
              <li>• <strong>Entity CSV:</strong> Columns: <code className="font-mono bg-surface-100 px-1.5 py-0.5 rounded text-surface-800 font-bold">entity_name</code>, <code className="font-mono bg-surface-100 px-1.5 py-0.5 rounded text-surface-800 font-bold">phone</code> (optional)</li>
              <li>• <strong>Non-Entity CSV:</strong> Columns: <code className="font-mono bg-surface-100 px-1.5 py-0.5 rounded text-surface-800 font-bold">non_entity_name</code></li>
              <li>• No geo/zone fields required — admin assigns after approval</li>
            </ul>
          </div>

          <button
            onClick={handleUpload}
            disabled={!csvFile || !selectedDomain || !selectedCategory || isUploading}
            className="w-full px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 disabled:bg-surface-300 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/25 transition-all active:scale-[0.98]"
          >
            <Upload className="w-5 h-5" />
            {isUploading ? 'Uploading...' : 'Upload & Create in Staging'}
          </button>

          {uploadResult && (
            <div className={`p-5 rounded-xl border ${uploadResult.success > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              {uploadResult.success > 0 && (
                <p className="text-sm font-extrabold text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  {uploadResult.success} record{uploadResult.success !== 1 ? 's' : ''} added to staging.
                </p>
              )}
              {uploadResult.errors.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {uploadResult.errors.map((e, i) => (
                    <p key={i} className="text-xs text-rose-700 flex items-start gap-1.5 font-medium">
                      <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      {e}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StagingAreaNew() {
  const [activeTab, setActiveTab] = useState<TabType>('create-entity');
   
  const {
    getStagingEntities,
    getStagingNonEntities,
    createStagingEntity,
    createStagingNonEntity,
    approveStagingEntity,
    approveStagingNonEntity,
    rejectStagingEntity,
    rejectStagingNonEntity,
    domains,
  } = useData();

  const stagingEntities = getStagingEntities();
  const stagingNonEntities = getStagingNonEntities();

  const [entityName, setEntityName] = useState('');
  const [entityPhone, setEntityPhone] = useState('');
  const [entityDomain, setEntityDomain] = useState('');
  const [entityCategory, setEntityCategory] = useState('');
  const [entityRole, setEntityRole] = useState<EntityRole>('physical-service-provider');
  const [nonEntityRole, setNonEntityRole] = useState<NonEntityRole>('physical-asset');

  const [nonEntityName, setNonEntityName] = useState('');
  const [nonEntityDomain, setNonEntityDomain] = useState('');
  const [nonEntityCategory, setNonEntityCategory] = useState('');

  const entityDomains = domains.filter(d => d.entityType === 'entity' || !d.entityType);
  const nonEntityDomains = domains.filter(d => d.entityType === 'non-entity' || !d.entityType);

  const getEntityCategories = (): Category[] => {
    const domain = entityDomains.find(d => d.code === entityDomain);
    return domain?.categories || [];
  };

  const getNonEntityCategories = (): Category[] => {
    const domain = nonEntityDomains.find(d => d.code === nonEntityDomain);
    return domain?.categories || [];
  };

  const handleCreateEntity = async () => {
    if (!entityName || !entityDomain || !entityCategory) {
      alert('Please fill all required fields');
      return;
    }
    await createStagingEntity({
      entity_name: entityName,
      phone: entityPhone || undefined,
      domain_code: entityDomain,
      category_id: entityCategory,
      role: entityRole,
      status: 'pending',
    });
    setEntityName('');
    setEntityPhone('');
    setEntityRole('physical-service-provider');
  };

  const handleCreateNonEntity = async () => {
    if (!nonEntityName || !nonEntityDomain || !nonEntityCategory) {
      alert('Please fill all required fields');
      return;
    }
    await createStagingNonEntity({
      non_entity_name: nonEntityName,
      domain_code: nonEntityDomain,
      category_id: nonEntityCategory,
      role: nonEntityRole,
      status: 'pending',
    });
    setNonEntityName('');
  };

  const handleApprove = async (id: string, type: 'entity' | 'non-entity') => {
    if (type === 'entity') await approveStagingEntity(id);
    else await approveStagingNonEntity(id);
  };

  const handleReject = async (id: string, type: 'entity' | 'non-entity') => {
    if (type === 'entity') await rejectStagingEntity(id);
    else await rejectStagingNonEntity(id);
  };

  const pendingEntities = stagingEntities.filter(e => e.status === 'pending');
  const approvedEntities = stagingEntities.filter(e => e.status === 'approved');
  const pendingNonEntities = stagingNonEntities.filter(ne => ne.status === 'pending');
  const approvedNonEntities = stagingNonEntities.filter(ne => ne.status === 'approved');

  const tabs = [
    { key: 'create-entity' as TabType, label: 'Create Entity', icon: Building2 },
    { key: 'create-non-entity' as TabType, label: 'Create Non-Entity', icon: MapPin },  
    { key: 'upload-csv' as TabType, label: 'Upload CSV', icon: Upload },
    { key: 'pending-review' as TabType, label: 'Pending Review', icon: AlertTriangle, count: pendingEntities.length + pendingNonEntities.length },
    { key: 'approved' as TabType, label: 'Approved', icon: CheckCircle, count: approvedEntities.length + approvedNonEntities.length },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-surface-200 pb-5">
        <h2 className="text-2xl font-extrabold text-surface-900 font-display tracking-tight">Staging Area</h2>
        <p className="text-sm text-surface-500 mt-1 font-semibold">
          Create entities and non-entities. Admin assigns geo/zone after approval.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-surface-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              relative flex items-center gap-2 px-5 py-3 text-sm font-bold transition-all duration-200 whitespace-nowrap
              ${activeTab === tab.key
                ? 'text-brand-700 bg-brand-50'
                : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
              }
            `}
            style={activeTab === tab.key ? { borderBottom: '2px solid var(--color-brand-500)' } : { borderBottom: '2px solid transparent' }}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`ml-1 px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                activeTab === tab.key ? 'bg-brand-200 text-brand-800' : 'bg-amber-100 text-amber-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-surface-200 shadow-lg">
        {activeTab === 'create-entity' && (
          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight">Create Entity</h3>
              <p className="text-xs text-surface-500 font-semibold">
                Entities are people or organizations that provide services or own assets. No geo/zone required yet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-extrabold text-surface-700 mb-2 uppercase tracking-widest">
                  Entity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  placeholder="e.g., Hospital Trust, Restaurant Owner"
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-surface-700 mb-2 uppercase tracking-widest">
                  Phone (Optional)
                </label>
                <input
                  type="text"
                  value={entityPhone}
                  onChange={(e) => setEntityPhone(e.target.value)}
                  placeholder="e.g., 9876543210"
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-surface-700 mb-2 uppercase tracking-widest">
                  Domain <span className="text-rose-500">*</span>
                </label>
                <select
                  value={entityDomain}
                  onChange={(e) => { setEntityDomain(e.target.value); setEntityCategory(''); }}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                >
                  <option value="">Select Domain</option>
                  {entityDomains.map(domain => (
                    <option key={domain.code} value={domain.code}>{domain.name} ({domain.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-extrabold text-surface-700 mb-2 uppercase tracking-widest">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={entityCategory}
                  onChange={(e) => setEntityCategory(e.target.value)}
                  disabled={!entityDomain}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 disabled:bg-surface-50 disabled:text-surface-400"
                >
                  <option value="">Select Category</option>
                  {getEntityCategories().map(category => (
                    <option key={category.id} value={category.id}>{category.name} ({category.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 bg-surface-50 rounded-xl border border-surface-200 space-y-3">
              <label className="block text-sm font-extrabold text-surface-700 uppercase tracking-widest">
                Entity Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([
                  ['physical-asset-provider', 'Physical Asset Provider'],
                  ['physical-service-provider', 'Physical Service Provider'],
                  ['physical-goods-provider', 'Physical Goods / Product Provider'],
                  ['non-physical-asset-provider', 'Non-Physical Asset Provider'],
                  ['non-physical-service-provider', 'Non-Physical Service Provider'],
                  ['non-physical-goods-provider', 'Non-Physical Goods / Product Provider'],
                ] as [EntityRole, string][]).map(([value, label]) => (
                  <label key={value} className={`flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-xl border transition-all ${
                    entityRole === value
                      ? 'bg-brand-50 border-brand-400 text-brand-800'
                      : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300'
                  }`}>
                    <input
                      type="radio"
                      name="entityRole"
                      value={value}
                      checked={entityRole === value}
                      onChange={() => setEntityRole(value)}
                      className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-sm font-semibold">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateEntity}
              className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-extrabold flex items-center gap-2 shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/25 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Create Entity in Staging
            </button>
          </div>
        )}

        {activeTab === 'create-non-entity' && (
          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight">Create Non-Entity</h3>
              <p className="text-xs text-surface-500 font-semibold">
                Non-entities are assets, spaces, infrastructure, or items with no active service role. No geo required yet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-extrabold text-surface-700 mb-2 uppercase tracking-widest">
                  Non-Entity Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={nonEntityName}
                  onChange={(e) => setNonEntityName(e.target.value)}
                  placeholder="e.g., Shop Space, Hospital Building"
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-extrabold text-surface-700 mb-2 uppercase tracking-widest">
                  Domain <span className="text-rose-500">*</span>
                </label>
                <select
                  value={nonEntityDomain}
                  onChange={(e) => { setNonEntityDomain(e.target.value); setNonEntityCategory(''); }}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500"
                >
                  <option value="">Select Domain</option>
                  {nonEntityDomains.map(domain => (
                    <option key={domain.code} value={domain.code}>{domain.name} ({domain.code})</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-extrabold text-surface-700 mb-2 uppercase tracking-widest">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={nonEntityCategory}
                  onChange={(e) => setNonEntityCategory(e.target.value)}
                  disabled={!nonEntityDomain}
                  className="w-full px-4 py-2.5 bg-white rounded-xl border border-surface-200 text-sm text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-500 disabled:bg-surface-50 disabled:text-surface-400"
                >
                  <option value="">Select Category</option>
                  {getNonEntityCategories().map(category => (
                    <option key={category.id} value={category.id}>{category.name} ({category.code})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 bg-surface-50 rounded-xl border border-surface-200 space-y-3">
              <label className="block text-sm font-extrabold text-surface-700 uppercase tracking-widest">
                Non-Entity Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([
                  ['physical-asset', 'Physical Asset'],
                  ['physical-service', 'Physical Service'],
                  ['physical-goods', 'Physical Goods / Product'],
                  ['non-physical-asset', 'Non-Physical Asset'],
                  ['non-physical-service', 'Non-Physical Service'],
                  ['non-physical-goods', 'Non-Physical Goods / Product'],
                ] as [NonEntityRole, string][]).map(([value, label]) => (
                  <label key={value} className={`flex items-center gap-2.5 cursor-pointer px-4 py-2.5 rounded-xl border transition-all ${
                    nonEntityRole === value
                      ? 'bg-blue-50 border-blue-400 text-blue-800'
                      : 'bg-white border-surface-200 text-surface-600 hover:border-surface-300'
                  }`}>
                    <input
                      type="radio"
                      name="nonEntityRole"
                      value={value}
                      checked={nonEntityRole === value}
                      onChange={() => setNonEntityRole(value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateNonEntity}
              className="px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-extrabold flex items-center gap-2 shadow-lg shadow-brand-500/20 hover:shadow-xl transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Create Non-Entity in Staging
            </button>
          </div>
        )}

        {activeTab === 'upload-csv' && (
          <div className="p-6">
            <CSVUploadTab />
          </div>
        )}

        {activeTab === 'pending-review' && (
          <ReviewSection
            title="Pending Review"
            description="Review and approve or reject submitted records"
            entities={pendingEntities}
            nonEntities={pendingNonEntities}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}

        {activeTab === 'approved' && (
          <ApprovedSection
            title="Approved"
            description="Records approved and ready for geo/zone assignment"
            approvedEntities={approvedEntities}
            approvedNonEntities={approvedNonEntities}
          />
        )}
      </div>
    </div>
  );
}

function ReviewSection({
  title,
  description,
  entities,
  nonEntities,
  onApprove,
  onReject,
}: {
  title: string;
  description: string;
  entities: StagingEntity[];
  nonEntities: StagingNonEntity[];
  onApprove: (id: string, type: 'entity' | 'non-entity') => void;
  onReject: (id: string, type: 'entity' | 'non-entity') => void;
}) {
  if (entities.length === 0 && nonEntities.length === 0) {
    return (
      <div className="text-center py-16 text-surface-400 space-y-2">
        <AlertTriangle className="w-12 h-12 mx-auto opacity-40" />
        <p className="font-bold text-surface-600">No pending records to review</p>
        <p className="text-sm text-surface-500 font-medium">Submitted records will appear here for approval</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight">{title}</h3>
        <p className="text-xs text-surface-500 font-semibold">{description}</p>
      </div>
      
      {entities.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-sm font-extrabold text-surface-700 uppercase tracking-widest">Entities ({entities.length})</h4>
          <div className="space-y-2.5">
            {entities.map(entity => (
              <div key={entity.id} className="border border-amber-200 bg-amber-50/60 rounded-xl p-4 hover:shadow-md transition-all duration-150">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-surface-900">{entity.entity_name}</h5>
                        {entity.phone && (
                          <p className="text-sm text-surface-600 font-medium mt-0.5">📞 {entity.phone}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-white border border-surface-200 text-surface-700 text-xs rounded-lg font-bold">{entity.domain_code}</span>
                      <span className="px-3 py-1 bg-white border border-surface-200 text-surface-700 text-xs rounded-lg font-bold">{entity.category_id}</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2.5 py-1 bg-brand-100 text-brand-700 text-xs rounded-lg font-bold capitalize">{entity.role.replace(/-/g, ' ')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => onApprove(entity.id, 'entity')} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => onReject(entity.id, 'entity')} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {nonEntities.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-sm font-extrabold text-surface-700 uppercase tracking-widest">Non-Entities ({nonEntities.length})</h4>
          <div className="space-y-2.5">
            {nonEntities.map(nonEntity => (
              <div key={nonEntity.id} className="border border-amber-200 bg-amber-50/60 rounded-xl p-4 hover:shadow-md transition-all duration-150">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-surface-900">{nonEntity.non_entity_name}</h5>
                        <p className="text-sm text-surface-600 font-medium capitalize">{nonEntity.role.replace(/-/g, ' ')}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-3 py-1 bg-white border border-surface-200 text-surface-700 text-xs rounded-lg font-bold">{nonEntity.domain_code}</span>
                      <span className="px-3 py-1 bg-white border border-surface-200 text-surface-700 text-xs rounded-lg font-bold">{nonEntity.category_id}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => onApprove(nonEntity.id, 'non-entity')} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => onReject(nonEntity.id, 'non-entity')} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-500/20 transition-all active:scale-95 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ApprovedSection({
  title,
  description,
  approvedEntities,
  approvedNonEntities,
}: {
  title: string;
  description: string;
  approvedEntities: StagingEntity[];
  approvedNonEntities: StagingNonEntity[];
}) {
  if (approvedEntities.length === 0 && approvedNonEntities.length === 0) {
    return (
      <div className="text-center py-16 text-surface-400 space-y-2">
        <CheckCircle className="w-12 h-12 mx-auto opacity-40" />
        <p className="font-bold text-surface-600">No approved records yet</p>
        <p className="text-sm text-surface-500 font-medium">Approved records will appear here awaiting assignment</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight">{title}</h3>
        <p className="text-xs text-surface-500 font-semibold">{description}</p>
      </div>
      
      {approvedEntities.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-sm font-extrabold text-surface-700 uppercase tracking-widest">Entities ({approvedEntities.length})</h4>
          <div className="space-y-2.5">
            {approvedEntities.map(entity => (
              <div key={entity.id} className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-4 transition-all hover:shadow-sm">
                <h5 className="font-extrabold text-surface-900">{entity.entity_name}</h5>
                <p className="text-xs text-surface-600 mt-1 font-medium">
                  Domain: {entity.domain_code} | Category: {entity.category_id}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs rounded-lg font-extrabold border border-emerald-200">
                  <CheckCircle className="w-3 h-3" />
                  Ready for Assignment
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {approvedNonEntities.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-sm font-extrabold text-surface-700 uppercase tracking-widest">Non-Entities ({approvedNonEntities.length})</h4>
          <div className="space-y-2.5">
            {approvedNonEntities.map(nonEntity => (
              <div key={nonEntity.id} className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-4 transition-all hover:shadow-sm">
                <h5 className="font-extrabold text-surface-900">{nonEntity.non_entity_name}</h5>
                <p className="text-xs text-surface-600 mt-1 font-medium">
                  Domain: {nonEntity.domain_code} | Category: {nonEntity.category_id}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs rounded-lg font-extrabold border border-emerald-200">
                  <CheckCircle className="w-3 h-3" />
                  Ready for Assignment
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
