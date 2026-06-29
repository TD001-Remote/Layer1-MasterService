/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Building2, FolderTree, Scissors, Trash2, GitMerge, Edit, Lock, ChevronRight, Shield, History, RotateCcw, Archive } from "lucide-react";
import { useData } from "../../../contexts/DataContext";
import { useAuth } from "../../../contexts/AuthContext";
import type { DCTArchiveRecord } from "../../../types";

type TabMode = "domains" | "categories" | "types" | "approval-queue" | "archive";
type ManagementMode = "view" | "split-domain" | "convert-domain" | "merge-domain" | "modify-domain";

interface SplitDomainForm {
  code: string;
  name: string;
  categoryPks: string[];
}

interface MergeForm {
  sourceIds: string[];
  targetId: string;
}

interface ConvertForm {
  code: string;
  name: string;
}

export default function DCTNonEntityPage() {
  const { userRole } = useAuth();
  const { 
    types,
    domains,
    categories,
    pendingDctChanges,
    dctArchive,
    submitForApproval,
    approveDctChange,
    rejectDctChange,
    recoverArchivedDct,
    permanentlyDeleteArchivedDct,
    stopDomain,
    stopCategory,
    stopType,
    splitDomain,
    convertDomain,
    convertCategory,
    convertType,
    mergeDomains,
    modifyDomain,
    modifyCategory,
    modifyType,
  } = useData();

  const isMasterAdmin = userRole === "master-admin";
  const currentUser = "admin-user";

  const [activeTab, setActiveTab] = useState<TabMode>("domains");
  const [managementMode, setManagementMode] = useState<ManagementMode>("view");
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  
  const [splitNewDomains, setSplitNewDomains] = useState<SplitDomainForm[]>([]);
  const [convertForm, setConvertForm] = useState<ConvertForm>({ code: "", name: "" });
  const [redirectDomain, setRedirectDomain] = useState<string>("");
  const [mergeDomainsState, setMergeDomainsState] = useState<MergeForm>({ sourceIds: [], targetId: "" });
  const [modifyDomainName, setModifyDomainName] = useState<string>("");
  const [modifyDomainCode, setModifyDomainCode] = useState<string>("");

  const nonEntityDomains = domains.filter(d => d.entityType === 'non-entity' || !d.entityType);
  const selectedDomainData = selectedDomain ? nonEntityDomains.find(d => d.code === selectedDomain) || domains.find(d => d.code === selectedDomain) : undefined;

  useEffect(() => {
    if (managementMode === "split-domain") {
      setSplitNewDomains([{ code: "", name: "", categoryPks: [] }]);
    }
  }, [managementMode]);

  const handleStopDomain = async (code: string, targetCode?: string) => {
    try {
      if (isMasterAdmin) {
        await stopDomain(code, targetCode);
      } else {
        const domain = nonEntityDomains.find(d => d.code === code);
      await submitForApproval({
        action: 'delete',
        dctType: 'domain',
        dctId: domain?.dctId || code,
        oldValue: domain?.name || code,
        newValue: targetCode || 'stopped',
        description: `Non-Entity Domain '${domain?.name}' requested to be stopped${targetCode ? ` with redirect to ${targetCode}` : ''}`,
        submittedBy: currentUser,
      });
      }
      setRedirectDomain("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSplitDomain = async () => {
    if (!selectedDomain) return;
    const validDomains = splitNewDomains.filter((d) => d.code && d.name);
    if (validDomains.length === 0) return;
    try {
      if (isMasterAdmin) {
        await splitDomain(selectedDomain, validDomains);
      } else {
        const domain = nonEntityDomains.find(d => d.code === selectedDomain);
        await submitForApproval({
          action: 'split',
          dctType: 'domain',
          dctId: selectedDomain,
          oldValue: selectedDomainData?.name || selectedDomain,
          newValue: validDomains.map(d => d.name).join(', '),
          description: `Non-Entity Domain '${selectedDomainData?.name}' requested to split into ${validDomains.length} domains`,
          submittedBy: currentUser,
        });
      }
      setManagementMode("view");
      setSelectedDomain(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertDomain = async () => {
    if (!selectedDomain || !convertForm.code || !convertForm.name) return;
    try {
      if (isMasterAdmin) {
        await convertDomain(selectedDomain, convertForm);
      } else {
        const domain = nonEntityDomains.find(d => d.code === selectedDomain);
        await submitForApproval({
          action: 'convert',
          dctType: 'domain',
          dctId: selectedDomain,
          oldValue: selectedDomainData?.name || selectedDomain,
          newValue: convertForm.name,
          description: `Non-Entity Domain '${selectedDomainData?.name}' requested to convert to '${convertForm.name}' (${convertForm.code})`,
          submittedBy: currentUser,
        });
      }
      setManagementMode("view");
      setSelectedDomain(null);
      setConvertForm({ code: "", name: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleMergeDomains = async () => {
    if (mergeDomainsState.sourceIds.length === 0 || !mergeDomainsState.targetId) return;
    try {
      if (isMasterAdmin) {
        await mergeDomains(mergeDomainsState.sourceIds, mergeDomainsState.targetId);
      } else {
        await submitForApproval({
          action: 'merge',
          dctType: 'domain',
          dctId: mergeDomainsState.sourceIds.join(','),
          oldValue: mergeDomainsState.sourceIds.length.toString(),
          newValue: mergeDomainsState.targetId,
          description: `Merge ${mergeDomainsState.sourceIds.length} Non-Entity domains into target`,
          submittedBy: currentUser,
        });
      }
      setManagementMode("view");
      setMergeDomainsState({ sourceIds: [], targetId: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleModifyDomain = async () => {
    if (!selectedDomain || !modifyDomainName) return;
    try {
      const domain = nonEntityDomains.find(d => d.code === selectedDomain);
      if (isMasterAdmin) {
        await modifyDomain(selectedDomain, modifyDomainName, modifyDomainCode || undefined);
      } else {
        await submitForApproval({
          action: 'modify',
          dctType: 'domain',
          dctId: selectedDomain,
          oldValue: domain?.name || selectedDomain,
          newValue: modifyDomainName,
          description: `Modify Non-Entity domain name/code`,
          submittedBy: currentUser,
        });
      }
      setManagementMode("view");
      setSelectedDomain(null);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSourceSelection = (code: string) => {
    const current = mergeDomainsState.sourceIds;
    if (current.includes(code)) {
      setMergeDomainsState({ ...mergeDomainsState, sourceIds: current.filter(id => id !== code) });
    } else {
      setMergeDomainsState({ ...mergeDomainsState, sourceIds: [...current, code] });
    }
  };

  const handleRecoverArchived = async (archiveId: string) => {
    try {
      await recoverArchivedDct(archiveId);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = async (archiveId: string) => {
    try {
      await permanentlyDeleteArchivedDct(archiveId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-emerald-600" />
              DCT Non-Entity Admin
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage Domains, Categories, and Types for Physical Assets (Non-Entities)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isMasterAdmin && (
              <span className="text-xs font-medium text-purple-700 bg-purple-100 px-3 py-1 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Master-Admin
              </span>
            )}
            {!isMasterAdmin && (
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Admin (Approval Required)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("domains")}
            className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
              activeTab === "domains"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FolderTree className="w-4 h-4 inline mr-2" />
            Domains ({nonEntityDomains.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
              activeTab === "categories"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ChevronRight className="w-4 h-4 inline mr-2" />
            Categories
          </button>
          <button
            onClick={() => setActiveTab("types")}
            className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
              activeTab === "types"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ChevronRight className="w-4 h-4 inline mr-2 rotate-90" />
            Types ({types.length})
          </button>
          <button
            onClick={() => setActiveTab("approval-queue")}
            className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
              activeTab === "approval-queue"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Approval Queue ({pendingDctChanges?.filter(c => c.status === 'pending').length || 0})
          </button>
          <button
            onClick={() => setActiveTab("archive")}
            className={`flex-1 px-6 py-4 text-sm font-bold transition-colors ${
              activeTab === "archive"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Archive className="w-4 h-4 inline mr-2" />
            Archive ({dctArchive?.length || 0})
          </button>
        </div>

        <div className="p-6">
          {activeTab === "domains" && (
            <div className="space-y-4">
              <div className="flex gap-2 mb-3">
                <button 
                  onClick={() => setManagementMode("merge-domain")} 
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm flex items-center gap-1"
                >
                  <GitMerge className="w-3 h-3" /> Merge
                </button>
              </div>

              {managementMode === "merge-domain" && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-4">
                  <h3 className="text-lg font-bold text-purple-900 mb-4">Merge Non-Entity Domains</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-purple-700 mb-2">Select source domains:</p>
                      <div className="flex flex-wrap gap-2">
                         {nonEntityDomains.map((d) => (
                           <button
                             key={d.dctId}
                             onClick={() => toggleSourceSelection(d.code)}
                            className={`px-2 py-1 text-xs rounded ${
                              mergeDomainsState.sourceIds.includes(d.code)
                                ? 'bg-purple-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {d.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <select
                        value={mergeDomainsState.targetId}
                        onChange={(e) => setMergeDomainsState({ ...mergeDomainsState, targetId: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded"
                      >
                        <option value="">Select target domain</option>
                         {nonEntityDomains.map((d) => (
                           <option key={d.dctId} value={d.code}>{d.name} ({d.code})</option>
                         ))}
                      </select>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={handleMergeDomains} className="px-3 py-1 bg-purple-600 text-white rounded text-sm" disabled={mergeDomainsState.sourceIds.length === 0 || !mergeDomainsState.targetId}>
                        Merge
                      </button>
                      <button onClick={() => setManagementMode("view")} className="px-3 py-1 bg-slate-300 text-slate-700 rounded text-sm">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {nonEntityDomains.map((domain) => (
                  <div key={domain.dctId} className="bg-white rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-slate-900">{domain.name}</h3>
                        <p className="text-xs text-slate-500 font-mono">{domain.code}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-emerald-100 text-emerald-700">
                          active
                        </span>
                        <button
                          onClick={() => {
                            setSelectedDomain(domain.code);
                            setManagementMode("split-domain");
                          }}
                          className="p-1.5 bg-amber-50 text-amber-600 rounded hover:bg-amber-100"
                          title="Split Domain"
                        >
                          <Scissors className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDomain(domain.code);
                            setManagementMode("modify-domain");
                          }}
                          className="p-1.5 bg-cyan-50 text-cyan-600 rounded hover:bg-cyan-100"
                          title="Modify Domain"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDomain(domain.code);
                            setManagementMode("convert-domain");
                          }}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          title="Convert Domain"
                        >
                          <FolderTree className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (redirectDomain) {
                              handleStopDomain(domain.code, redirectDomain);
                            } else {
                              handleStopDomain(domain.code);
                            }
                          }}
                          className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100"
                          title="Stop/Delete Domain"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {managementMode !== "view" && selectedDomain === domain.code && (
                      <div className="mt-3">
                        <select
                          value={redirectDomain}
                          onChange={(e) => setRedirectDomain(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
                        >
                          <option value="">Select redirect (optional)</option>
                           {nonEntityDomains.filter((d) => d.code !== domain.code).map((d) => (
                             <option key={d.dctId} value={d.code}>
                               {d.name} ({d.code})
                             </option>
                           ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Non-Entity Categories</h2>
              <div className="space-y-4">
                 {nonEntityDomains.map((domain) => (
                   <div key={domain.dctId} className="mb-4">
                     <h3 className="text-sm font-bold text-emerald-700 mb-2">{domain.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 ml-4">
                      {domain.categories.map((cat) => (
                        <div key={cat.id} className="border border-slate-200 rounded-lg p-3 bg-emerald-50/20">
                          <h4 className="font-medium text-slate-900 text-sm">{cat.name}</h4>
                          <p className="text-xs text-slate-500 font-mono">{cat.id}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "types" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Non-Entity Types</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {types.map((type) => (
                  <div key={type.dctId} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <h5 className="font-medium text-slate-900 text-xs">{type.name}</h5>
                    <p className="text-xs text-slate-500 font-mono">{type.pk}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "approval-queue" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                {isMasterAdmin ? "Approval Queue (Master-Admin)" : "Pending Changes"}
              </h2>
              {!pendingDctChanges || pendingDctChanges.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No pending DCT changes</p>
              ) : (
                <div className="space-y-3">
                  {pendingDctChanges.filter(c => c.status === 'pending').map((change) => (
                    <div key={change.id} className="border border-amber-200 bg-amber-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-amber-800 uppercase">
                          {change.action} - {change.dctType}
                        </span>
                        <span className="text-xs text-amber-600">
                          {change.submittedBy} • {new Date(change.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-900">
                        "{change.oldValue}" → "{change.newValue}"
                      </p>
                      <p className="text-xs text-slate-600 mt-1">{change.description}</p>
                      {isMasterAdmin && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => approveDctChange(change.id, "master-admin")}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectDctChange(change.id, "master-admin")}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "archive" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Archive className="w-5 h-5" />
                DCT Archive (Recovery Area)
              </h2>
              {!dctArchive || dctArchive.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No archived DCTs</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Entities</th>
                      <th className="text-left py-2">Non-Entities</th>
                      <th className="text-left py-2">Archived</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dctArchive.map((record: DCTArchiveRecord) => (
                      <tr key={record.id} className="border-b border-slate-100">
                        <td className="py-2 capitalize">{record.dctType}</td>
                        <td className="py-2">{record.originalName}</td>
                        <td className="py-2">{record.entityCount}</td>
                        <td className="py-2">{record.nonEntityCount}</td>
                        <td className="py-2 text-xs text-slate-500">{record.archivedAt ? new Date(record.archivedAt).toLocaleDateString() : "-"}</td>
                        <td className="py-2">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleRecoverArchived(record.id)}
                              className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                              title="Recover"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(record.id)}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                              title="Delete Permanently"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}