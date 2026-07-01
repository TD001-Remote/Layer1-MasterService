/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Database, Upload, Download, Calendar, Users, Building, Globe } from 'lucide-react';
import EntityPage from './EntityPage';
import NonEntityPage from './NonEntityPage';
import PersonPage from './PersonPage';
import SitePage from './SitePage';
import GeoZonePage from './GeoZonePage';

type TabMode = 'entity' | 'non-entity' | 'person' | 'site' | 'geo-zone';

export default function DataUpload() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabMode>('entity');

  const tabs = [
    { id: 'entity', label: 'Entity', icon: Database, count: 'ENT' },
    { id: 'non-entity', label: 'Non-Entity', icon: Building, count: 'NENT' },
    { id: 'person', label: 'Person', icon: Users, count: 'PER' },
    { id: 'site', label: 'Site', icon: Globe, count: 'SITE' },
    { id: 'geo-zone', label: 'Geo-Zone', icon: Database, count: 'ZON' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-md border border-surface-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-7 h-7 text-indigo-600" />
              L1 to L2 Data Upload
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Push L1 data to L2 with granular export options per module
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-surface-100 rounded-xl transition-colors border border-transparent hover:border-surface-200"
          >
            <ChevronLeft className="w-5 h-5 text-surface-500" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="flex border-b border-slate-200 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabMode)}
                className={`flex-1 min-w-[140px] px-6 py-4 text-sm font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'entity' && <EntityPage />}
          {activeTab === 'non-entity' && <NonEntityPage />}
          {activeTab === 'person' && <PersonPage />}
          {activeTab === 'site' && <SitePage />}
          {activeTab === 'geo-zone' && <GeoZonePage />}
        </div>
      </div>
    </div>
  );
}