/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Building2, FolderTree, Trash2, Edit, Lock, ChevronRight, Archive, RotateCcw, Plus, Search } from "lucide-react";
import { useData } from "../../../contexts/DataContext";

type TabMode = "domains" | "categories" | "types" | "approval-queue" | "archive";
type ManagementMode = "view" | "add" | "edit";

export default function DCTNonEntityPage() {
  const { 
    domains, categories, types,
    pendingDctChanges, dctArchive,
    addDomain, updateDomain, stopDomain,
    addCategory, updateCategory, stopCategory,
    addType, updateType, stopType,
    submitForApproval, approveDctChange, rejectDctChange,
    recoverArchivedDct, permanentlyDeleteArchivedDct
  } = useData();

  const [activeTab, setActiveTab] = useState<TabMode>("domains");
  const [managementMode, setManagementMode] = useState<ManagementMode>("view");
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: "domain" | "category" | "type" } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form states
  const [domainForm, setDomainForm] = useState({ code: "", name: "", description: "" });
  const [categoryForm, setCategoryForm] = useState({ pk: "", domainCode: "", name: "", description: "" });
  const [typeForm, setTypeForm] = useState({ pk: "", categoryPk: "", name: "", description: "" });

  const nonEntityDomains = domains.filter(d => d.entityType === 'non-entity' || !d.entityType);
  const nonEntityCategories = categories.filter(c => c.entityType === 'non-entity' || !c.entityType);
  const nonEntityTypes = types.filter(t => t.entityType === 'non-entity' || !t.entityType);

  const filtered = {
    domains: searchTerm ? nonEntityDomains.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase())) : nonEntityDomains,
    categories: searchTerm ? nonEntityCategories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.pk.toLowerCase().includes(searchTerm.toLowerCase())) : nonEntityCategories,
    types: searchTerm ? nonEntityTypes.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.pk.toLowerCase().includes(searchTerm.toLowerCase())) : nonEntityTypes
  };

  const handleAdd = async () => {
    if (activeTab === "domains") {
      await addDomain({ ...domainForm, entityType: 'non-entity' } as any);
      setDomainForm({ code: "", name: "", description: "" });
    } else if (activeTab === "categories") {
      const newPk = `CAT-NE-${categoryForm.domainCode}-${String(nonEntityCategories.length + 1).padStart(3, '0')}`;
      await addCategory({ ...categoryForm, pk: newPk, entityType: 'non-entity' } as any);
      setCategoryForm({ pk: "", domainCode: "", name: "", description: "" });
    } else if (activeTab === "types") {
      const newPk = `${typeForm.categoryPk}-${String(nonEntityTypes.length + 1).padStart(2, '0')}`;
      await addType({ ...typeForm, pk: newPk, entityType: 'non-entity' } as any);
      setTypeForm({ pk: "", categoryPk: "", name: "", description: "" });
    }
    setManagementMode("view");
  };

  const handleStop = async (id: string, type: "domain" | "category" | "type") => {
    if (type === "domain") await stopDomain(id, undefined, 'non-entity');
    else if (type === "category") await stopCategory(id);
    else await stopType(id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <div className="flex items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-emerald-600" />
              DCT Non-Entity Admin
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage Domains, Categories, and Types for Physical Assets
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab("domains")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "domains" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-600"}`}>
            <FolderTree className="w-4 h-4 inline mr-1" /> Domains ({nonEntityDomains.length})
          </button>
          <button onClick={() => setActiveTab("categories")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "categories" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-600"}`}>
            <ChevronRight className="w-4 h-4 inline mr-1" /> Categories ({nonEntityCategories.length})
          </button>
          <button onClick={() => setActiveTab("types")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "types" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-600"}`}>
            <ChevronRight className="w-4 h-4 inline mr-1 rotate-90" /> Types ({nonEntityTypes.length})
          </button>
          <button onClick={() => setActiveTab("approval-queue")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "approval-queue" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-600"}`}>
            <Lock className="w-4 h-4 inline mr-1" /> Approval Queue
          </button>
          <button onClick={() => setActiveTab("archive")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "archive" ? "text-emerald-600 border-b-2 border-emerald-600" : "text-slate-600"}`}>
            <Archive className="w-4 h-4 inline mr-1" /> Archive
          </button>
        </div>

        <div className="p-6">
          {(activeTab === "domains" || activeTab === "categories" || activeTab === "types") && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          )}

          {activeTab === "domains" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Domains</h2>
                <button onClick={() => setManagementMode("add")} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Domain
                </button>
              </div>

              {managementMode === "add" && (
                <div className="bg-slate-50 border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input placeholder="Code" value={domainForm.code} onChange={(e) => setDomainForm({ ...domainForm, code: e.target.value })} className="px-3 py-2 border border-slate-300 rounded" />
                    <input placeholder="Name" value={domainForm.name} onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })} className="px-3 py-2 border border-slate-300 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAdd} disabled={!domainForm.code || !domainForm.name} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">Add</button>
                    <button onClick={() => setManagementMode("view")} className="px-3 py-1 bg-slate-300 text-slate-700 rounded text-sm">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filtered.domains.map(d => (
                  <div key={d.code} className="border rounded-lg p-3 hover:bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{d.name}</h3>
                        <p className="text-xs font-mono text-slate-500">{d.code}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedItem({ id: d.code, type: "domain" }); setManagementMode("edit"); }} className="p-1 text-slate-600 hover:text-emerald-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleStop(d.code, "domain")} className="p-1 text-slate-600 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.domains.length === 0 && <p className="text-center py-8 text-slate-500">No domains found</p>}
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Categories</h2>
                <button onClick={() => setManagementMode("add")} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Category
                </button>
              </div>

              {managementMode === "add" && (
                <div className="bg-slate-50 border rounded-lg p-4">
                  <div className="space-y-3 mb-3">
                    <select value={categoryForm.domainCode} onChange={(e) => setCategoryForm({ ...categoryForm, domainCode: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded">
                      <option value="">Select Domain</option>
                      {nonEntityDomains.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                    </select>
                    <input placeholder="Name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAdd} disabled={!categoryForm.domainCode || !categoryForm.name} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">Add</button>
                    <button onClick={() => setManagementMode("view")} className="px-3 py-1 bg-slate-300 text-slate-700 rounded text-sm">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filtered.categories.map(c => (
                  <div key={c.pk} className="border rounded-lg p-3 hover:bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{c.name}</h3>
                        <p className="text-xs font-mono text-slate-500">{c.pk}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedItem({ id: c.pk, type: "category" }); setManagementMode("edit"); }} className="p-1 text-slate-600 hover:text-emerald-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleStop(c.pk, "category")} className="p-1 text-slate-600 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.categories.length === 0 && <p className="text-center py-8 text-slate-500">No categories found</p>}
              </div>
            </div>
          )}

          {activeTab === "types" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Types</h2>
                <button onClick={() => setManagementMode("add")} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Type
                </button>
              </div>

              {managementMode === "add" && (
                <div className="bg-slate-50 border rounded-lg p-4">
                  <div className="space-y-3 mb-3">
                    <select value={typeForm.categoryPk} onChange={(e) => setTypeForm({ ...typeForm, categoryPk: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded">
                      <option value="">Select Category</option>
                      {nonEntityCategories.map(c => <option key={c.pk} value={c.pk}>{c.name}</option>)}
                    </select>
                    <input placeholder="Name" value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAdd} disabled={!typeForm.categoryPk || !typeForm.name} className="px-3 py-1 bg-emerald-600 text-white rounded text-sm">Add</button>
                    <button onClick={() => setManagementMode("view")} className="px-3 py-1 bg-slate-300 text-slate-700 rounded text-sm">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filtered.types.map(t => (
                  <div key={t.pk} className="border rounded-lg p-3 hover:bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{t.name}</h3>
                        <p className="text-xs font-mono text-slate-500">{t.pk}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedItem({ id: t.pk, type: "type" }); setManagementMode("edit"); }} className="p-1 text-slate-600 hover:text-emerald-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleStop(t.pk, "type")} className="p-1 text-slate-600 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filtered.types.length === 0 && <p className="text-center py-8 text-slate-500">No types found</p>}
              </div>
            </div>
          )}

          {activeTab === "approval-queue" && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <h2 className="text-lg font-bold flex items-center gap-2"><Lock className="w-5 h-5" /> Approval Queue</h2>
              {!pendingDctChanges || pendingDctChanges.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No pending changes</p>
              ) : (
                pendingDctChanges.filter(c => c.status === 'pending').map(change => (
                  <div key={change.id} className="border rounded-lg p-4 bg-amber-50">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-amber-800">{change.action} - {change.dctType}</span>
                      <span className="text-xs text-slate-500">{change.submittedBy}</span>
                    </div>
                    <p className="text-sm">{change.oldValue} → {change.newValue}</p>
                    <button onClick={() => approveDctChange(change.id, 'master-admin')} className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-xs">Approve</button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "archive" && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <h2 className="text-lg font-bold flex items-center gap-2"><Archive className="w-5 h-5" /> Archive</h2>
              {!dctArchive || dctArchive.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No archived items</p>
              ) : (
                dctArchive.map(record => (
                  <div key={record.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{record.originalName}</h3>
                        <p className="text-xs text-slate-500">{record.dctType}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => recoverArchivedDct(record.id)} className="p-1 text-green-600"><RotateCcw className="w-4 h-4" /></button>
                        <button onClick={() => permanentlyDeleteArchivedDct(record.id)} className="p-1 text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}