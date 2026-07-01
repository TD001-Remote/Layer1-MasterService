/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Users, FolderTree, Scissors, Trash2, GitMerge, Edit, Lock, ChevronRight, Shield, RotateCcw, Archive, Plus, Search, X } from "lucide-react";
import { useData } from "../../../contexts/DataContext";

type TabMode = "domains" | "categories" | "types" | "approval-queue" | "archive";
type ManagementMode = "view" | "add" | "edit" | "split-domain" | "merge-domain" | "stop-domain";

export default function DCTEntityPage() {
  const { 
    domains, categories, types,
    pendingDctChanges, dctArchive,
    addDomain, updateDomain, stopDomain,
    addCategory, updateCategory, stopCategory,
    addType, updateType, stopType,
    splitDomain, convertDomain, mergeDomains, modifyDomain,
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
  const [editForm, setEditForm] = useState({ name: "", codeOrPk: "", parentId: "" });

  const entityDomains = domains.filter(d => d.entityType === 'entity');
  const entityCategories = categories.filter(c => c.entityType === 'entity');
  const entityTypes = types.filter(t => t.entityType === 'entity');

  const filteredDomains = searchTerm ? entityDomains.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) : entityDomains;

  const filteredCategories = searchTerm ? entityCategories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.pk.toLowerCase().includes(searchTerm.toLowerCase())
  ) : entityCategories;

  const filteredTypes = searchTerm ? entityTypes.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.pk.toLowerCase().includes(searchTerm.toLowerCase())
  ) : entityTypes;

  const handleAdd = async () => {
    if (activeTab === "domains") {
      await addDomain(domainForm as any);
      setDomainForm({ code: "", name: "", description: "" });
    } else if (activeTab === "categories") {
      const newPk = `CAT-${categoryForm.domainCode}-${String(entityCategories.length + 1).padStart(3, '0')}`;
      await addCategory({ ...categoryForm, pk: newPk, dctId: `DCT-CAT-${Date.now()}` } as any);
      setCategoryForm({ pk: "", domainCode: "", name: "", description: "" });
    } else if (activeTab === "types") {
      const cat = entityCategories.find(c => c.pk === categoryForm.categoryPk);
      if (!cat) return;
      const newPk = `${cat.pk}-${String(entityTypes.length + 1).padStart(2, '0')}`;
      await addType({ ...typeForm, pk: newPk, dctId: `DCT-TYP-${Date.now()}`, categoryPk: cat.pk } as any);
      setTypeForm({ pk: "", categoryPk: "", name: "", description: "" });
    }
    setManagementMode("view");
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    
    if (activeTab === "domains") {
      const domain = entityDomains.find(d => d.code === selectedItem.id);
      if (domain) await updateDomain(domain.dctId || selectedItem.id, { name: editForm.name });
    } else if (activeTab === "categories") {
      await updateCategory(selectedItem.id, { name: editForm.name });
    } else if (activeTab === "types") {
      await updateType(selectedItem.id, { name: editForm.name });
    }
    setManagementMode("view");
    setSelectedItem(null);
  };

  const handleStop = async (id: string, type: "domain" | "category" | "type") => {
    if (type === "domain") {
      await stopDomain(id);
    } else if (type === "category") {
      await stopCategory(id);
    } else {
      await stopType(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-7 h-7 text-indigo-600" />
              DCT Entity Admin
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage Domains, Categories, and Types for Service Providers
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab("domains")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "domains" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600"}`}>
            <FolderTree className="w-4 h-4 inline mr-1" /> Domains ({entityDomains.length})
          </button>
          <button onClick={() => setActiveTab("categories")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "categories" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600"}`}>
            <ChevronRight className="w-4 h-4 inline mr-1" /> Categories ({entityCategories.length})
          </button>
          <button onClick={() => setActiveTab("types")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "types" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600"}`}>
            <ChevronRight className="w-4 h-4 inline mr-1 rotate-90" /> Types ({entityTypes.length})
          </button>
          <button onClick={() => setActiveTab("approval-queue")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "approval-queue" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600"}`}>
            <Lock className="w-4 h-4 inline mr-1" /> Approval Queue
          </button>
          <button onClick={() => setActiveTab("archive")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "archive" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600"}`}>
            <Archive className="w-4 h-4 inline mr-1" /> Archive
          </button>
        </div>

        <div className="p-6">
          {/* Search bar for all tabs */}
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
                <button onClick={() => setManagementMode("add")} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Domain
                </button>
              </div>

              {managementMode === "add" && (
                <div className="bg-slate-50 border rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      placeholder="Domain Code"
                      value={domainForm.code}
                      onChange={(e) => setDomainForm({ ...domainForm, code: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded"
                    />
                    <input
                      placeholder="Domain Name"
                      value={domainForm.name}
                      onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })}
                      className="px-3 py-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAdd} disabled={!domainForm.code || !domainForm.name} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm disabled:opacity-50">
                      Add
                    </button>
                    <button onClick={() => setManagementMode("view")} className="px-3 py-1 bg-slate-300 text-slate-700 rounded text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredDomains.map(domain => (
                  <div key={domain.dctId || domain.code} className="border rounded-lg p-3 hover:bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{domain.name}</h3>
                        <p className="text-xs font-mono text-slate-500">{domain.code}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedItem({ id: domain.code, type: "domain" }); setManagementMode("edit"); }} className="p-1 text-slate-600 hover:text-indigo-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleStop(domain.code, "domain")} className="p-1 text-slate-600 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredDomains.length === 0 && <p className="text-center py-8 text-slate-500">No domains found</p>}
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Categories</h2>
                <button onClick={() => setManagementMode("add")} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Category
                </button>
              </div>

              {managementMode === "add" && (
                <div className="bg-slate-50 border rounded-lg p-4">
                  <div className="space-y-3 mb-3">
                    <select
                      value={categoryForm.domainCode}
                      onChange={(e) => setCategoryForm({ ...categoryForm, domainCode: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded"
                    >
                      <option value="">Select Domain</option>
                      {entityDomains.map(d => <option key={d.code} value={d.code}>{d.name} ({d.code})</option>)}
                    </select>
                    <input
                      placeholder="Category Name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAdd} disabled={!categoryForm.domainCode || !categoryForm.name} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm disabled:opacity-50">
                      Add
                    </button>
                    <button onClick={() => setManagementMode("view")} className="px-3 py-1 bg-slate-300 text-slate-700 rounded text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredCategories.map(cat => (
                  <div key={cat.pk} className="border rounded-lg p-3 hover:bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{cat.name}</h3>
                        <p className="text-xs font-mono text-slate-500">{cat.pk}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedItem({ id: cat.pk, type: "category" }); setManagementMode("edit"); }} className="p-1 text-slate-600 hover:text-indigo-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleStop(cat.pk, "category")} className="p-1 text-slate-600 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredCategories.length === 0 && <p className="text-center py-8 text-slate-500">No categories found</p>}
              </div>
            </div>
          )}

          {activeTab === "types" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Types</h2>
                <button onClick={() => setManagementMode("add")} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Type
                </button>
              </div>

              {managementMode === "add" && (
                <div className="bg-slate-50 border rounded-lg p-4">
                  <div className="space-y-3 mb-3">
                    <select
                      value={typeForm.categoryPk}
                      onChange={(e) => setTypeForm({ ...typeForm, categoryPk: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded"
                    >
                      <option value="">Select Category</option>
                      {entityCategories.map(c => <option key={c.pk} value={c.pk}>{c.name} ({c.pk})</option>)}
                    </select>
                    <input
                      placeholder="Type Name"
                      value={typeForm.name}
                      onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAdd} disabled={!typeForm.categoryPk || !typeForm.name} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm disabled:opacity-50">
                      Add
                    </button>
                    <button onClick={() => setManagementMode("view")} className="px-3 py-1 bg-slate-300 text-slate-700 rounded text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTypes.map(type => (
                  <div key={type.pk} className="border rounded-lg p-3 hover:bg-slate-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{type.name}</h3>
                        <p className="text-xs font-mono text-slate-500">{type.pk}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setSelectedItem({ id: type.pk, type: "type" }); setManagementMode("edit"); }} className="p-1 text-slate-600 hover:text-indigo-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleStop(type.pk, "type")} className="p-1 text-slate-600 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredTypes.length === 0 && <p className="text-center py-8 text-slate-500">No types found</p>}
              </div>
            </div>
          )}

          {activeTab === "approval-queue" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Approval Queue
              </h2>
              {!pendingDctChanges || pendingDctChanges.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No pending DCT changes</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {pendingDctChanges.filter(c => c.status === 'pending').map(change => (
                    <div key={change.id} className="border rounded-lg p-4 bg-amber-50">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-amber-800">{change.action} - {change.dctType}</span>
                        <span className="text-xs text-slate-500">{change.submittedBy}</span>
                      </div>
                      <p className="text-sm">{change.oldValue} → {change.newValue}</p>
                      <p className="text-xs text-slate-600 mt-1">{change.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "archive" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Archive
              </h2>
              {!dctArchive || dctArchive.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No archived DCTs</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dctArchive.map(record => (
                      <tr key={record.id} className="border-b">
                        <td className="py-2 capitalize">{record.dctType}</td>
                        <td className="py-2">{record.originalName}</td>
                        <td className="py-2">
                          <div className="flex gap-1">
                            <button onClick={() => recoverArchivedDct(record.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                              <RotateCcw className="w-3 h-3" />
                            </button>
                            <button onClick={() => permanentlyDeleteArchivedDct(record.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
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