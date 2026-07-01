/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Users, FolderTree, Trash2, Edit, Lock, ChevronRight, Archive, RotateCcw, Plus, Search, Building2, Shield } from "lucide-react";
import { useData } from "../../contexts/DataContext";

type EntityTab = "entity" | "non-entity";
type TabMode = "domains" | "categories" | "types" | "approval-queue" | "archive";
type ManagementMode = "view" | "add" | "edit" | "delete";

export default function DCTPage() {
  const { 
    domains, categories, types,
    pendingDctChanges, dctArchive,
    addDomain, updateDomain, stopDomain,
    addCategory, updateCategory, stopCategory,
    addType, updateType, stopType,
    submitForApproval, approveDctChange, rejectDctChange,
    recoverArchivedDct, permanentlyDeleteArchivedDct
  } = useData();

  const [entityTab, setEntityTab] = useState<EntityTab>("entity");
  const [activeTab, setActiveTab] = useState<TabMode>("domains");
  const [managementMode, setManagementMode] = useState<ManagementMode>("view");
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: "domain" | "category" | "type"; data?: any } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const entityDomains = domains.filter(d => d.entityType === 'entity');
  const entityCategories = categories.filter(c => c.entityType === 'entity');
  const entityTypes = types.filter(t => t.entityType === 'entity');
  const nonEntityDomains = domains.filter(d => d.entityType === 'non-entity' || !d.entityType);
  const nonEntityCategories = categories.filter(c => c.entityType === 'non-entity' || !c.entityType);
  const nonEntityTypes = types.filter(t => t.entityType === 'non-entity' || !t.entityType);

  const currentDomains = entityTab === "entity" ? entityDomains : nonEntityDomains;
  const currentCategories = entityTab === "entity" ? entityCategories : nonEntityCategories;
  const currentTypes = entityTab === "entity" ? entityTypes : nonEntityTypes;

  const filtered = {
    domains: searchTerm ? currentDomains.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.code.toLowerCase().includes(searchTerm.toLowerCase())) : currentDomains,
    categories: searchTerm ? currentCategories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.pk.toLowerCase().includes(searchTerm.toLowerCase())) : currentCategories,
    types: searchTerm ? currentTypes.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.pk.toLowerCase().includes(searchTerm.toLowerCase())) : currentTypes
  };

  const [domainForm, setDomainForm] = useState({ code: "", name: "", description: "" });
  const [categoryForm, setCategoryForm] = useState({ domainCode: "", name: "" });
  const [typeForm, setTypeForm] = useState({ categoryPk: "", name: "" });

  const handleAdd = async () => {
    if (activeTab === "domains") {
      await addDomain({ ...domainForm, entityType: entityTab } as any);
      setDomainForm({ code: "", name: "", description: "" });
    } else if (activeTab === "categories") {
      const domain = currentDomains.find(d => d.code === categoryForm.domainCode);
      if (!domain) return;
      const catCount = currentCategories.filter(c => c.domainCode === categoryForm.domainCode).length + 1;
      const newPk = `CAT-${categoryForm.domainCode}-${String(catCount).padStart(4, '0')}`;
      await addCategory({ ...categoryForm, pk: newPk, entityType: entityTab, dctId: `DCT-CAT-${Date.now()}` } as any);
      setCategoryForm({ domainCode: "", name: "" });
    } else if (activeTab === "types") {
      const cat = currentCategories.find(c => c.pk === typeForm.categoryPk);
      if (!cat) return;
      const typeCount = currentTypes.filter(t => t.categoryPk === typeForm.categoryPk).length + 1;
      const newPk = `${typeForm.categoryPk}-${String(typeCount).padStart(4, '0')}`;
      await addType({ ...typeForm, pk: newPk, entityType: entityTab, dctId: `DCT-TYP-${Date.now()}` } as any);
      setTypeForm({ categoryPk: "", name: "" });
    }
    setManagementMode("view");
    setSelectedItem(null);
  };

  const handleDelete = async (item: { id: string; type: "domain" | "category" | "type" }) => {
    if (item.type === "domain") {
      await stopDomain(item.id, undefined, entityTab);
    } else if (item.type === "category") {
      await stopCategory(item.id, undefined, entityTab);
    } else {
      await stopType(item.id, undefined, entityTab);
    }
    setManagementMode("view");
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FolderTree className="w-7 h-7 text-indigo-600" />
              DCT Taxonomy Manager
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage Domains, Categories, and Types for Service Providers & Physical Assets
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEntityTab("entity")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${entityTab === "entity" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              <Users className="w-4 h-4 inline mr-1" /> Entity
            </button>
            <button
              onClick={() => setEntityTab("non-entity")}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${entityTab === "non-entity" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              <Building2 className="w-4 h-4 inline mr-1" /> Non-Entity
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex border-b border-slate-200">
          <button onClick={() => setActiveTab("domains")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "domains" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600"}`}>
            <FolderTree className="w-4 h-4 inline mr-1" /> Domains ({currentDomains.length})
          </button>
          <button onClick={() => setActiveTab("categories")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "categories" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600"}`}>
            <ChevronRight className="w-4 h-4 inline mr-1" /> Categories ({currentCategories.length})
          </button>
          <button onClick={() => setActiveTab("types")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "types" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600"}`}>
            <ChevronRight className="w-4 h-4 inline mr-1 rotate-90" /> Types ({currentTypes.length})
          </button>
          <button onClick={() => setActiveTab("approval-queue")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "approval-queue" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600"}`}>
            <Lock className="w-4 h-4 inline mr-1" /> Approval ({pendingDctChanges?.filter(c => c.status === 'pending').length || 0})
          </button>
          <button onClick={() => setActiveTab("archive")} className={`flex-1 px-4 py-3 text-sm font-bold ${activeTab === "archive" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-600"}`}>
            <Archive className="w-4 h-4 inline mr-1" /> Archive ({dctArchive?.filter(a => a.entityType !== entityTab ? false : true).length || 0})
          </button>
        </div>

        <div className="p-6">
          {(activeTab === "domains" || activeTab === "categories" || activeTab === "types") && managementMode !== "add" && (
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

          {managementMode === "add" && (
            <div className="bg-slate-50 border rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-3 capitalize">Add New {activeTab.slice(0, -1)}</h3>
              <p className="text-xs text-slate-500 mb-2">
                {activeTab === "categories" && "Requires selecting a parent Domain"}
                {activeTab === "types" && "Requires selecting a parent Category (Domain auto-selected)"}
              </p>
              
              {activeTab === "domains" && (
                <div className="space-y-3">
                  <input placeholder="Domain Code" value={domainForm.code} onChange={(e) => setDomainForm({ ...domainForm, code: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded" />
                  <input placeholder="Domain Name" value={domainForm.name} onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded" />
                  <input placeholder="Description (optional)" value={domainForm.description} onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded" />
                </div>
              )}

              {activeTab === "categories" && (
                <div className="space-y-3">
                  <select value={categoryForm.domainCode} onChange={(e) => setCategoryForm({ ...categoryForm, domainCode: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded">
                    <option value="">Select Parent Domain (required)</option>
                    {currentDomains.map(d => <option key={d.code} value={d.code}>{d.name} ({d.code})</option>)}
                  </select>
                  <input placeholder="Category Name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded" />
                </div>
              )}

              {activeTab === "types" && (
                <div className="space-y-3">
                  <select value={typeForm.categoryPk} onChange={(e) => setTypeForm({ ...typeForm, categoryPk: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded">
                    <option value="">Select Parent Category (Domain auto-selected)</option>
                    {currentCategories.map(c => {
                      const domain = currentDomains.find(d => d.code === c.domainCode);
                      return <option key={c.pk} value={c.pk}>{domain?.name} → {c.name}</option>;
                    })}
                  </select>
                  <input placeholder="Type Name" value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded" />
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button onClick={handleAdd} disabled={
                  (activeTab === "domains" && (!domainForm.code || !domainForm.name)) ||
                  (activeTab === "categories" && (!categoryForm.domainCode || !categoryForm.name)) ||
                  (activeTab === "types" && (!typeForm.categoryPk || !typeForm.name))
                } className="px-4 py-2 bg-indigo-600 text-white rounded text-sm disabled:opacity-50">
                  Add
                </button>
                <button onClick={() => setManagementMode("view")} className="px-4 py-2 bg-slate-300 text-slate-700 rounded text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {activeTab === "domains" && managementMode !== "add" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Domains</h2>
                <button onClick={() => setManagementMode("add")} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Domain
                </button>
              </div>

              {filtered.domains.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No domains found. Add one to start building hierarchy.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filtered.domains.map(domain => (
                    <div key={domain.code} className="border rounded-lg p-3 hover:bg-slate-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-900">{domain.name}</h3>
                          <p className="text-xs font-mono text-slate-500">{domain.code}</p>
                          <p className="text-xs text-slate-400 mt-1">{currentCategories.filter(c => c.domainCode === domain.code).length} categories</p>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => { setSelectedItem({ id: domain.code, type: "domain", data: domain }); setManagementMode("edit"); }} className="p-1 text-slate-600 hover:text-indigo-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setSelectedItem({ id: domain.code, type: "domain" }); setManagementMode("delete"); }} className="p-1 text-slate-600 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "categories" && managementMode !== "add" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Categories (Parent Domain Required)</h2>
                <button onClick={() => setManagementMode("add")} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Category
                </button>
              </div>

              {filtered.categories.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No categories found. Select a domain above, then add categories.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filtered.categories.map(cat => {
                    const parentDomain = currentDomains.find(d => d.code === cat.domainCode);
                    return (
                      <div key={cat.pk} className="border rounded-lg p-3 hover:bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-slate-900">{cat.name}</h3>
                            <p className="text-xs font-mono text-slate-500">{cat.pk}</p>
                            <p className="text-xs text-slate-400">Domain: {parentDomain?.name || cat.domainCode}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setSelectedItem({ id: cat.pk, type: "category", data: cat }); setManagementMode("edit"); }} className="p-1 text-slate-600 hover:text-indigo-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setSelectedItem({ id: cat.pk, type: "category" }); setManagementMode("delete"); }} className="p-1 text-slate-600 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "types" && managementMode !== "add" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">Types (Parent Category Required)</h2>
                <button onClick={() => setManagementMode("add")} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add Type
                </button>
              </div>

              {filtered.types.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No types found. Select a category above, then add types.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filtered.types.map(t => {
                    const cat = currentCategories.find(c => c.pk === t.categoryPk);
                    const domain = cat ? currentDomains.find(d => d.code === cat.domainCode) : null;
                    return (
                      <div key={t.pk} className="border rounded-lg p-3 hover:bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-slate-900">{t.name}</h3>
                            <p className="text-xs font-mono text-slate-500">{t.pk}</p>
                            <p className="text-xs text-slate-400">Path: {domain?.name} → {cat?.name}</p>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => { setSelectedItem({ id: t.pk, type: "type", data: t }); setManagementMode("edit"); }} className="p-1 text-slate-600 hover:text-indigo-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setSelectedItem({ id: t.pk, type: "type" }); setManagementMode("delete"); }} className="p-1 text-slate-600 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "approval-queue" && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Approval Queue
              </h2>
              {!pendingDctChanges || pendingDctChanges.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No pending changes</p>
              ) : (
                <div className="space-y-3">
                  {pendingDctChanges.filter(c => c.status === 'pending').map(change => (
                    <div key={change.id} className="border rounded-lg p-4 bg-amber-50">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold uppercase text-amber-800">
                          {change.action} - {change.dctType}
                        </span>
                        <span className="text-xs text-slate-500">
                          {change.submittedBy} • {new Date(change.submittedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">"{change.oldValue}" → "{change.newValue}"</p>
                      <p className="text-xs text-slate-600 mt-1">{change.description}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => approveDctChange(change.id, 'master-admin')} className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold">
                          Approve
                        </button>
                        <button onClick={() => rejectDctChange(change.id, 'master-admin')} className="px-3 py-1 bg-red-600 text-white rounded text-xs font-bold">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "archive" && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Archive className="w-5 h-5" />
                Archive (Recovery Area)
              </h2>
              {!dctArchive || dctArchive.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No archived items</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200">
                    <tr>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Name</th>
                      <th className="text-left py-2">Archived</th>
                      <th className="text-left py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dctArchive.map(record => (
                      <tr key={record.id} className="border-b border-slate-100">
                        <td className="py-2 capitalize">{record.dctType}</td>
                        <td className="py-2">{record.originalName}</td>
                        <td className="py-2 text-xs text-slate-500">
                          {record.archivedAt ? new Date(record.archivedAt).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-2">
                          <div className="flex gap-1">
                            <button onClick={() => recoverArchivedDct(record.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Recover">
                              <RotateCcw className="w-3 h-3" />
                            </button>
                            <button onClick={() => permanentlyDeleteArchivedDct(record.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Delete Permanently">
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