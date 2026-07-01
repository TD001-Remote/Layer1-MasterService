/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MapPin, Globe, Upload, Database, Archive } from 'lucide-react';
import GeoPage from './GeoPage';
import ZonePage from './ZonePage';
import BulkImportPage from './BulkImportPage';
import GeoZoneManagerPage from './ZoneManagerPage';
import GeoZoneRecoveryPage from './GeoZoneRecoveryPage';
import { GEO_STATS } from '../../data/tamilnadu-geography';

type GeographyTab = 'geo' | 'zone' | 'bulk-import' | 'geo-zone-manager' | 'geo-zone-recovery';

export default function GeographyPage() {
  const [activeTab, setActiveTab] = useState<GeographyTab>('geo');

  const handleTabChange = (tab: GeographyTab) => {
    setActiveTab(tab);
  };

  const tabs = [
    { id: 'geo', label: 'Geo', icon: Globe, description: 'States, Districts, Taluks' },
    { id: 'zone', label: 'Zone', icon: MapPin, description: 'Cities, Areas, Streets, Substreets' },
    { id: 'bulk-import', label: 'Bulk Import', icon: Upload, description: 'Import zones for geo' },
    { id: 'geo-zone-manager', label: 'Geo-Zone Manager', icon: Database, description: 'Modify, change geo, remove/recover' },
    { id: 'geo-zone-recovery', label: 'Recovery', icon: Archive, description: 'Recover archived geo/zones' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-7 h-7 text-blue-600" />
              Geography Manager
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Complete geographic hierarchy and zone management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{GEO_STATS.totalZones.toLocaleString()}</div>
              <div className="text-xs text-slate-500">Total Zones</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-1 inline-flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as GeographyTab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
              title={tab.description}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === 'geo' && <GeoPage />}
        {activeTab === 'zone' && <ZonePage />}
        {activeTab === 'bulk-import' && <BulkImportPage />}
        {activeTab === 'geo-zone-manager' && <GeoZoneManagerPage />}
        {activeTab === 'geo-zone-recovery' && <GeoZoneRecoveryPage />}
      </div>
    </div>
  );
}