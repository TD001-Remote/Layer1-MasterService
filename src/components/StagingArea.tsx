/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Check, 
  RefreshCw, 
  ListFilter,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Edit2,
  Download,
  Trash2,
  FileDown
} from "lucide-react";
import { PendingEntity } from "../types";
import { csvTemplates, csvTemplateErrors, masterPaperCopies } from "../data/mockData";
import { useData } from "../contexts/DataContext";
import { parseCSV, downloadCSVTemplate } from "../utils/csvParser";

export default function StagingArea() {
  const {
    zoneRefs,
    activeEntities,
    pendingEntities,
    syncPendingEntities,
    commitApproved,
    sites: activeSites
  } = useData();

  const onSetPendingEntities = syncPendingEntities;
  const onCommitApproved = commitApproved;

  // Selected Row for deep manual check comparison
  const [selectedPendingId, setSelectedPendingId] = useState<string | null>(null);
  
  // Quick edit states in case details need to be aligned to master paper copy
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editZone, setEditZone] = useState("");
  const [editWebsiteZoneEntityId, setEditWebsiteZoneEntityId] = useState("");
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Active loaded file description
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPending = pendingEntities.find(p => p.id === selectedPendingId);

  // Try to lookup paper notebook records (simulating physical-to-digital alignment)
  const masterPaperMatch = selectedPending && selectedPending.phone 
    ? masterPaperCopies[selectedPending.phone] 
    : selectedPending 
      ? Object.values(masterPaperCopies).find(p => p.legal_name.toLowerCase().includes(selectedPending.entity_name.toLowerCase()))
      : undefined;

  // Trigger simulated template upload
  const loadPresetFile = (preset: "perfect" | "errors") => {
    setUploadProgress(true);
    setUploadError(null);
    setTimeout(() => {
      if (preset === "perfect") {
        onSetPendingEntities(JSON.parse(JSON.stringify(csvTemplates.parsedRecords)));
        setLoadedFileName(csvTemplates.filename);
        setSelectedPendingId(csvTemplates.parsedRecords[0].id);
      } else {
        onSetPendingEntities(JSON.parse(JSON.stringify(csvTemplateErrors.parsedRecords)));
        setLoadedFileName(csvTemplateErrors.filename);
        setSelectedPendingId(csvTemplateErrors.parsedRecords[0].id);
      }
      setUploadProgress(false);
    }, 600);
  };

  // Handle real CSV file upload
  const handleFileUpload = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadError('Please upload a CSV file');
      return;
    }

    setUploadProgress(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const { records, errors } = parseCSV(content);

      if (errors.length > 0) {
        setUploadError(errors.join('; '));
        setUploadProgress(false);
        return;
      }

      // Run validation on parsed records
      const validatedRecords = records.map(record => {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validate entity name
        if (!record.entity_name.trim()) {
          errors.push("Entity name is required");
        }

        // Validate record type
        if (record.record_type === 'entity') {
          // ENTITIES: Require full zone assignment
          if (!record.target_zone_pk) {
            errors.push("Entities require a zone assignment (target_zone_pk)");
          } else {
            const zoneExists = zoneRefs.some(z => z.zone_pk === record.target_zone_pk);
            if (!zoneExists) {
              errors.push(`Invalid zone PK: ${record.target_zone_pk}`);
            }
          }
          
          // Check for entity duplicates in same zone
          if (record.target_zone_pk) {
            const duplicate = activeEntities.find(
              e => e.entity_name.toLowerCase() === record.entity_name.toLowerCase() 
                && e.zone_pk === record.target_zone_pk
            );
            if (duplicate) {
              warnings.push(`Duplicate: Entity "${record.entity_name}" already exists in this zone`);
            }
          }
        } else if (record.record_type === 'non-entity') {
          // NON-ENTITIES: Only require GEO (district/taluk), zone is optional
          if (!record.stateId || !record.districtId || !record.talukId) {
            errors.push("Non-entities require at least State, District, and Taluk IDs");
          }
          
          // If zone is provided for non-entity, validate it
          if (record.target_zone_pk) {
            const zoneExists = zoneRefs.some(z => z.zone_pk === record.target_zone_pk);
            if (!zoneExists) {
              warnings.push(`Zone PK provided but not found: ${record.target_zone_pk}`);
            }
          }
        }

        // Validate phone for public entities
        if (record.visibility_type === 'Public' && !record.phone) {
          warnings.push('Public records should have a phone number');
        }

        // Validate domain and category
        if (!record.primary_domain) {
          errors.push("Primary domain is required");
        }
        if (!record.category_pk) {
          errors.push("Category is required");
        }

        return {
          ...record,
          validationErrors: errors,
          validationWarnings: warnings,
        };
      });

      onSetPendingEntities(validatedRecords);
      setLoadedFileName(file.name);
      if (validatedRecords.length > 0) {
        setSelectedPendingId(validatedRecords[0].id);
      }
      setUploadProgress(false);
    };

    reader.onerror = () => {
      setUploadError('Failed to read file');
      setUploadProgress(false);
    };

    reader.readAsText(file);
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSelectPendingRow = (p: PendingEntity) => {
    setSelectedPendingId(p.id);
    setEditName(p.entity_name);
    setEditPhone(p.phone || '');
    setEditZone(p.target_zone_pk);
    setEditWebsiteZoneEntityId(p.website_zone_entity_id || "");
    setIsEditingMode(false);
  };

  // Perform a Quick Correction inline to override spelling or key before promoting
  const handleSaveCorrection = () => {
    if (!selectedPendingId) return;

    const updated = pendingEntities.map(p => {
      if (p.id === selectedPendingId) {
        // Re-execute validations on name & zone PK after adjustments
        const errors: string[] = [];
        const warnings: string[] = [];

        if (!editName.trim()) {
          errors.push("Data Quality Breach: Entity Name cannot be empty.");
        }
        if (!editPhone.trim() && p.visibility_type === "Public") {
          errors.push("Data Quality Breach: Public frontage stores require contact numbers.");
        }
        const zoneMatch = zoneRefs.some(z => z.zone_pk === editZone);
        if (!zoneMatch) {
          errors.push(`Address Validation Failure: Zone PK '${editZone}' is unrecognized.`);
        }
        const duplicateMatch = activeEntities.some(a => a.entity_name.toLowerCase() === editName.toLowerCase() && a.zone_pk === editZone);
        if (duplicateMatch) {
          warnings.push(`Duplicate Threat: An entity named '${editName}' already exists in Zone ${editZone}.`);
        }

        return {
          ...p,
          entity_name: editName,
          phone: editPhone,
          target_zone_pk: editZone,
          website_zone_entity_id: editWebsiteZoneEntityId || null,
          validationErrors: errors,
          validationWarnings: warnings
        };
      }
      return p;
    });

    onSetPendingEntities(updated);
    setIsEditingMode(false);
  };

  // Action: Promote records
  const handlePromoteSelected = () => {
    // Collect all valid rows
    const validAndApprovable = pendingEntities.filter(p => p.validationErrors.length === 0 && p.status === "pending");
    if (validAndApprovable.length === 0) {
      alert("No valid records to promote. Correct formatting errors (red badges) first.");
      return;
    }
    
    onCommitApproved(validAndApprovable);
    setSelectedPendingId(null);
  };

  // Single record rejection
  const handleRejectRow = (id: string) => {
    const updated = pendingEntities.map(p => {
      if (p.id === id) {
        return { ...p, status: "rejected" as const };
      }
      return p;
    });
    onSetPendingEntities(updated);
  };

  // Count diagnostics
  const errorCount = pendingEntities.filter(p => p.validationErrors.length > 0).length;
  const warningCount = pendingEntities.filter(p => p.validationWarnings.length > 0).length;

  // Export validated records to CSV
  const handleExportValidated = () => {
    const validRecords = pendingEntities.filter(p => p.validationErrors.length === 0 && p.status === "pending");
    
    if (validRecords.length === 0) {
      alert("No valid records to export. Fix validation errors first.");
      return;
    }

    // Create CSV content
    const headers = [
      "Entity Name",
      "Phone",
      "Target Zone PK",
      "Visibility Type",
      "Website Zone Entity ID",
      "Status",
      "Warnings"
    ];
    
    const rows = validRecords.map(record => [
      record.entity_name,
      record.phone || "",
      record.target_zone_pk,
      record.visibility_type,
      record.website_zone_entity_id || "",
      record.status,
      record.validationWarnings.join("; ")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `validated_records_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Bulk reject all pending records
  const handleBulkReject = () => {
    const pendingCount = pendingEntities.filter(p => p.status === "pending").length;
    
    if (pendingCount === 0) {
      alert("No pending records to reject.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to reject all ${pendingCount} pending records? This action cannot be undone.`
    );

    if (!confirmed) return;

    const updated = pendingEntities.map(p => {
      if (p.status === "pending") {
        return { ...p, status: "rejected" as const };
      }
      return p;
    });

    onSetPendingEntities(updated);
    setSelectedPendingId(null);
  };

  return (
    <div className="space-y-6" id="staging_verification_panel">
      
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">Staging & Human Verification Gate</h2>
          <p className="text-sm text-slate-500 font-medium font-sans">Subject survey rows to integrity tests and align fields to manual master sheets before promotion</p>
        </div>
        
        {pendingEntities.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportValidated}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-colors"
            >
              <Download size={14} />
              Export Valid Records
            </button>
            
            <button
              onClick={handleBulkReject}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-colors"
            >
              <Trash2 size={14} />
              Bulk Reject All
            </button>
          </div>
        )}
      </div>

      {/* CSV Dropper & Loaders section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Drag Drop Area simulator */}
        <div className="md:col-span-8 bg-white border border-slate-250 p-6 rounded-xl shadow-xs space-y-4">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center space-y-3 cursor-pointer ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-50' 
                : 'border-slate-200 hover:border-indigo-400 bg-slate-50/40'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClickUpload}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <UploadCloud size={40} className={`${isDragging ? 'text-indigo-600' : 'text-slate-400'} transition-colors`} />
            
            {uploadProgress ? (
              <div className="space-y-1.5 py-2">
                <RefreshCw size={20} className="animate-spin text-indigo-600 mx-auto" />
                <p className="text-sm text-slate-600 font-medium">Analyzing survey CSV file and parsing headers...</p>
              </div>
            ) : uploadError ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle size={20} />
                  <p className="text-sm font-bold">Upload Error</p>
                </div>
                <p className="text-xs text-red-600 max-w-md">{uploadError}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadError(null);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Try again
                </button>
              </div>
            ) : loadedFileName ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">File Loaded: <span className="font-mono text-indigo-600">{loadedFileName}</span></p>
                <p className="text-xs text-slate-400 font-medium">Total lines parsed: {pendingEntities.length} active draft records</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">Drag & Drop CSV File or Click to Browse</p>
                <p className="text-xs text-slate-400">Requires comma-delimited headers with verified Zone PK codes</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadCSVTemplate();
                }}
                className="px-3.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold rounded-lg border border-green-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileDown size={13} /> Download CSV Template
              </button>
              
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">OR USE PRESETS:</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => loadPresetFile("perfect")}
                className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-indigo-700 text-xs font-bold rounded-lg border border-slate-250 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <FileText size={13} className="text-indigo-600" /> Perfect Data
              </button>

              <button 
                onClick={() => loadPresetFile("errors")}
                className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-lg border border-slate-250 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <AlertTriangle size={13} className="text-rose-500" /> With Errors
              </button>
            </div>
          </div>
        </div>

        {/* Validation Dry-run Board */}
        <div className="md:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">Integrity Diagnostics Block</h4>
            
            {pendingEntities.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                Parser idle. Select one of the simulation survey presets or drop a file to process L1 validation.
              </p>
            ) : (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-200/50">
                  <span className="text-xs text-slate-500 font-bold">Survey Rows Parsed:</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">{pendingEntities.length}</span>
                </div>

                <div className="flex justify-between items-center bg-rose-50/60 p-2.5 rounded-lg border border-rose-100">
                  <span className="text-xs text-rose-700 font-bold flex items-center gap-1">
                    <XCircle size={13} className="text-rose-500" /> Critical Technical Errors:
                  </span>
                  <span className="text-sm font-bold text-rose-700 font-mono bg-rose-100 px-2 py-0.5 rounded">
                    {errorCount}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-amber-50/60 p-2.5 rounded-lg border border-amber-100">
                  <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
                    <AlertTriangle size={13} className="text-amber-500" /> Warning Threats (Duplicates):
                  </span>
                  <span className="text-sm font-bold text-amber-700 font-mono bg-amber-100 px-2 py-0.5 rounded">
                    {warningCount}
                  </span>
                </div>
              </div>
            )}
          </div>

          {pendingEntities.length > 0 && (
            <button 
              onClick={handlePromoteSelected}
              disabled={errorCount > 0 && pendingEntities.filter(p => p.status === 'pending').some(p => p.validationErrors.length > 0)}
              className={`w-full mt-4 py-2.5 text-xs font-bold font-display uppercase tracking-wider transition-all flex items-center justify-center gap-2 rounded-lg cursor-pointer ${
                errorCount > 0 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200" 
                  : "bg-indigo-650 hover:bg-indigo-700 text-white shadow-md font-bold"
              }`}
            >
              Approve & Promote Approved Rows <UserCheck size={14} />
            </button>
          )}
        </div>

      </div>

      {/* Side-by-side split screen checker */}
      {pendingEntities.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border-t border-slate-200 pt-6">
          
          {/* Left Split Pane: Survey Rows */}
          <div className="lg:col-span-12 xl:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 max-h-[480px] overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-100 font-mono">Survey Row Batches</h4>
            
            <div className="space-y-2">
              {pendingEntities.map(p => {
                const isSelected = p.id === selectedPendingId;
                const hasErrors = p.validationErrors.length > 0;
                const hasWarnings = p.validationWarnings.length > 0;

                return (
                  <div 
                    key={p.id}
                    onClick={() => handleSelectPendingRow(p)}
                    className={`p-3 border rounded-xl cursor-pointer hover:bg-slate-50/50 transition-all ${
                      isSelected 
                        ? "border-indigo-650 bg-indigo-50/10" 
                        : hasErrors 
                          ? "border-rose-200 bg-rose-50/5"
                          : hasWarnings
                            ? "border-amber-200 bg-amber-50/5"
                            : "border-slate-100 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h5 className="font-bold text-xs text-slate-800">{p.entity_name}</h5>
                        <p className="text-[10px] text-slate-400 font-mono mt-1 font-semibold">Zone: {p.target_zone_pk}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasErrors ? (
                          <span className="text-[9px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-sm">INVALID</span>
                        ) : hasWarnings ? (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-sm">CONFLICT</span>
                        ) : p.status === "approved" ? (
                          <span className="text-[9px] bg-indigo-100 text-indigo-850 font-bold px-1.5 py-0.5 rounded-sm">MIGRATING</span>
                        ) : (
                          <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-sm">STAGED</span>
                        )}
                      </div>
                    </div>

                    {/* Diagnostics banner */}
                    {hasErrors && (
                      <div className="mt-2 text-[10px] text-rose-600 font-bold flex items-center gap-1">
                        <ShieldAlert size={11} className="text-rose-500" /> {p.validationErrors.length} technical blockers detected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Split Pane: Inspector Compare Deck & corrections */}
          <div className="lg:col-span-12 xl:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            {selectedPending ? (
              <div className="space-y-6">
                
                {/* Section Header */}
                <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 font-mono font-bold px-2 py-0.5 rounded uppercase">
                      Inspect & Verify Segment #{selectedPending.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1 font-display">Row Review</h3>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsEditingMode(!isEditingMode)}
                      className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-indigo-700 hover:border-indigo-500 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer bg-white"
                    >
                      <Edit2 size={13} /> {isEditingMode ? "Cancel Corrections" : "Quick Corrections"}
                    </button>
                    
                    <button 
                      onClick={() => handleRejectRow(selectedPending.id)}
                      className="px-3 py-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100/50 text-rose-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Reject Draft
                    </button>
                  </div>
                </div>

                {/* Dry Run Detail Validation Logger */}
                {(selectedPending.validationErrors.length > 0 || selectedPending.validationWarnings.length > 0) && (
                  <div className="p-4 rounded-xl border leading-relaxed space-y-2 text-xs bg-rose-50/20 border-rose-100">
                    <span className="font-bold text-rose-850 uppercase block tracking-wider text-[10px] font-mono">Technical Validation Log output:</span>
                    
                    {selectedPending.validationErrors.map((err, i) => (
                      <p key={i} className="text-rose-700 font-bold flex items-start gap-1.5">
                        <XCircle size={13} className="shrink-0 mt-0.5 text-rose-500" /> {err}
                      </p>
                    ))}

                    {selectedPending.validationWarnings.map((war, i) => (
                      <p key={i} className="text-amber-700 font-bold flex items-start gap-1.5">
                        <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-500" /> {war}
                      </p>
                    ))}
                  </div>
                )}

                {/* Inline Editing Controls */}
                {isEditingMode ? (
                  <div className="p-4 bg-indigo-50/10 border border-indigo-150 rounded-xl space-y-4">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase font-mono tracking-wider">Emergency Override Panel</span>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-500 mb-1 font-bold">Spelling Correction</label>
                        <input 
                          type="text" 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full border border-slate-205 rounded p-2 font-bold focus:outline-none focus:border-indigo-505 bg-white text-slate-800 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1 font-bold">Phone Override</label>
                        <input 
                          type="text" 
                          value={editPhone} 
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full border border-slate-205 rounded p-2 focus:outline-none focus:border-indigo-505 bg-white text-slate-850 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-500 mb-1 font-bold">Street Zone PK Association</label>
                        <select 
                          value={editZone}
                          onChange={(e) => setEditZone(e.target.value)}
                          className="w-full border border-slate-205 rounded p-2 text-xs focus:outline-none focus:border-indigo-505 bg-white font-mono font-bold text-slate-800"
                        >
                          {zoneRefs.map(z => (
                            <option key={z.zone_pk} value={z.zone_pk}>{z.zone_pk} - {z.fullAddress.substring(0, 45)}...</option>
                          ))}
                          <option value="ZON-999-NON-EXISTENT">ZON-999-NON-EXISTENT (Invalid Simulator Demo)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-500 mb-1 font-bold">Website Zone Entity ID (Site Assoc.)</label>
                        <select 
                          value={editWebsiteZoneEntityId}
                          onChange={(e) => setEditWebsiteZoneEntityId(e.target.value)}
                          className="w-full border border-slate-205 rounded p-2 text-xs focus:outline-none focus:border-indigo-505 bg-white font-mono font-bold text-slate-800"
                        >
                          <option value="">-- No Direct Website ID Linked --</option>
                          {activeSites.map(s => (
                            <option key={s.site_id} value={s.site_id}>
                              {s.site_id} - {s.title} ({s.subdomain})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button 
                      onClick={handleSaveCorrection}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold tracking-wider uppercase cursor-pointer"
                    >
                      Save and Revalidate Row
                    </button>
                  </div>
                ) : (
                  /* Double column compare deck: CSV vs Handheld paper inspect */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* CSV side */}
                    <div className="border border-slate-150 p-4 rounded-xl space-y-3 bg-slate-50/40">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Surveyed CSV Record</span>
                      
                       <div className="space-y-2">
                        <div>
                          <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase tracking-wider">UPLOADED TEXT</span>
                          <span className="text-xs font-bold text-slate-800 block">{selectedPending.entity_name}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase tracking-wider">CONTACT VALUE</span>
                          <span className="text-xs font-semibold text-slate-600 block">{selectedPending.phone || "BLANK FIELD"}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase tracking-wider">ZONE PK ATTEMPT</span>
                          <span className="text-xs font-mono bg-[#0F172A] px-1.5 py-0.5 text-indigo-300 font-bold border border-slate-850 rounded-md inline-block mt-0.5">{selectedPending.target_zone_pk}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase tracking-wider">WEBSITE ZONE ENTITY ID</span>
                          <span className="text-xs font-semibold block text-slate-650 font-mono">
                            {selectedPending.website_zone_entity_id ? (
                              <div className="space-y-1">
                                <span className="bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded text-indigo-700 font-bold font-mono text-[10px]">{selectedPending.website_zone_entity_id}</span>
                                <span className="text-[7.5px] text-slate-450 font-sans block leading-normal">(Saves route reference on promotion; does not spawn websites automatically)</span>
                              </div>
                            ) : (
                              <span className="text-slate-450 italic font-medium">None Linked</span>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 block font-mono font-bold uppercase tracking-wider">VISIBILITY TYPE</span>
                          <span className="text-xs font-semibold block text-slate-600 capitalize">{selectedPending.visibility_type} mapping</span>
                        </div>
                      </div>
                    </div>

                    {/* Master paper inspection side */}
                    <div className="border border-indigo-150 p-4 rounded-xl space-y-3 bg-indigo-50/5">
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block font-mono">Inspector Field Log notebook</span>
                      
                      {masterPaperMatch ? (
                        <div className="space-y-2 text-xs">
                          <div>
                            <span className="text-[9px] text-indigo-700/60 block font-mono font-bold uppercase tracking-wider">VERIFIED LEGAL TITLE</span>
                            <span className="font-bold text-slate-900 block">{masterPaperMatch.legal_name}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-indigo-700/60 block font-mono font-bold uppercase tracking-wider">REGISTERED TELEPHONE</span>
                            <span className="font-mono font-bold text-slate-700 block">{masterPaperMatch.phone}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-indigo-700/60 block font-mono font-bold uppercase tracking-wider">PHYSICAL FRONTAGE ANNOTATION</span>
                            <span className="text-slate-600 block text-[11px] leading-relaxed font-semibold">{masterPaperMatch.address_note}</span>
                          </div>

                          {/* Quick alignment button */}
                          {selectedPending.entity_name !== masterPaperMatch.legal_name && (
                            <button 
                              onClick={() => {
                                setEditName(masterPaperMatch.legal_name);
                                setEditPhone(masterPaperMatch.phone);
                                setEditZone(selectedPending.target_zone_pk);
                                setIsEditingMode(true);
                              }}
                              className="w-full mt-2 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg font-bold text-[10px] uppercase flex items-center justify-center gap-1 border border-indigo-200 cursor-pointer transition-colors"
                            >
                              Align Name spelling to Field book <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="py-6 text-center space-y-2">
                          <ShieldAlert size={28} className="text-amber-500 mx-auto" />
                          <p className="text-xs text-slate-450 italic leading-normal font-medium">
                            No aligned entries found in Manual Field book for contact '{selectedPending.phone || "Blank"}'. Careful validation recommended.
                          </p>
                        </div>
                      )}
                    </div>

                  </div>
                )}

                <div className="text-[11px] text-slate-400 font-medium font-sans">
                  <strong>Verification Step:</strong> Promoting this row will instantly assign it an authorized sequential L1 identity key, clear it from staging, and trigger integration.
                </div>

              </div>
            ) : (
              <div className="py-12 text-center space-y-3">
                <ShieldAlert size={36} className="text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Audit Desk Unoccupied</p>
                <p className="text-xs text-slate-450 max-w-sm mx-auto leading-normal font-medium">
                  Select any pending survey row in the left batch menu to compare values in real-time with physical verification records and process quick overrides.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
