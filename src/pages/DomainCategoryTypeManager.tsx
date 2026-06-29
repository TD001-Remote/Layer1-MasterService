/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FolderTree, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllEntityDomains, getAllNonEntityDomains } from "../data/domains";
import { useData } from "../contexts/DataContext";

export default function DomainCategoryTypeManager() {
  const navigate = useNavigate();
  const { domains, categories, types } = useData();

  const entityDomains = getAllEntityDomains();
  const nonEntityDomains = getAllNonEntityDomains();

  const totalCategories = categories.length;
  const totalTypes = types.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FolderTree className="w-7 h-7 text-purple-600" />
              DCT Classification Viewer
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              View existing Domains, Categories, and Types. Creation and deletion are managed exclusively in the DCT Manager.
            </p>
          </div>
          <button
            onClick={() => navigate("/DCT-Assign")}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm"
          >
            Open DCT Manager
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Domains</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{domains.length}</p>
          <p className="text-xs text-slate-500 mt-1">
            {entityDomains.length} entity · {nonEntityDomains.length} non-entity
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Categories</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalCategories}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Types</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalTypes}</p>
        </div>
      </div>

      {/* Entity Domains */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-200">
          <h3 className="text-lg font-bold text-indigo-900">Entity Domains</h3>
          <p className="text-xs text-indigo-700 mt-0.5">Service provider classification tree</p>
        </div>
        <div className="p-4 space-y-3">
          {entityDomains.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No entity domains loaded</p>
          ) : (
            entityDomains.map((domain) => {
              const domainCategories = categories.filter((c) => c.domainCode === domain.code);
              return (
                <div key={domain.code} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{domain.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{domain.code}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {domainCategories.length} categories
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {domainCategories.map((cat) => (
                      <span
                        key={cat.pk}
                        className="text-xs bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-full font-medium"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Non-Entity Domains */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-200">
          <h3 className="text-lg font-bold text-emerald-900">Non-Entity Domains</h3>
          <p className="text-xs text-emerald-700 mt-0.5">Physical asset classification tree</p>
        </div>
        <div className="p-4 space-y-3">
          {nonEntityDomains.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">No non-entity domains loaded</p>
          ) : (
            nonEntityDomains.map((domain) => {
              const domainCategories = categories.filter((c) => c.domainCode === domain.code);
              return (
                <div key={domain.code} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{domain.name}</h4>
                      <p className="text-xs text-slate-500 font-mono">{domain.code}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {domainCategories.length} categories
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {domainCategories.map((cat) => (
                      <span
                        key={cat.pk}
                        className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full font-medium"
                      >
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-amber-900">Need to modify DCTs?</p>
          <p className="text-xs text-amber-800 mt-0.5">
            Add, edit, or remove domains, categories, and types from the DCT Manager.
          </p>
        </div>
        <button
          onClick={() => navigate("/DCT-Assign")}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-bold flex items-center gap-2"
        >
          Go to DCT Manager
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
