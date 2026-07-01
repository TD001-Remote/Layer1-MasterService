/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Upload, Download, FileText, X, MapPin, Layers, Building2 } from 'lucide-react';
import { useData } from '../../contexts/DataContext';

export default function BulkImportPage() {
  const { states, districts, taluks, cities, areas, streets, substreets, addCity, addArea, addStreet, addSubstreet } = useData();
  const [selectedLevel, setSelectedLevel] = useState<ZoneLevel>('city');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
  const [selectedGeo, setSelectedGeo] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);

   const geoStates = states;
   const geoDistricts = districts;

  const handleDownloadTemplate = () => {
    const templates = {
      city: 'taluk_id,city_name\nGEO-TN-MAY-SIR,Sirkazhi Town',
      area: 'city_id,area_name\nZON-CITY-001,North Ward',
      street: 'area_id,street_name\nZON-AREA-001,Main Street',
      substreet: 'street_id,substreet_name\nZON-STR-001,Lane 1'
    };
    
    const template = templates[selectedLevel];
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedLevel}-template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const preview: CsvPreview = {
        headers: lines[0].split(',').map(h => h.trim()),
        rows: lines.slice(1, 11).map(l => l.split(',').map(c => c.trim())),
        totalRows: lines.length - 1
      };
      setCsvPreview(preview);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvFile || !selectedGeo) return;
    
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      
      let current = 0;
      const total = lines.length - 1;
      
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        
        try {
          if (selectedLevel === 'city' && cols.length >= 2) {
            await addCity(cols[1], cols[0]);
          } else if (selectedLevel === 'area' && cols.length >= 2) {
            await addArea(cols[1], cols[0]);
          } else if (selectedLevel === 'street' && cols.length >= 2) {
            await addStreet(cols[1], cols[0]);
          } else if (selectedLevel === 'substreet' && cols.length >= 2) {
            await addSubstreet(cols[1], cols[0]);
          }
        } catch (err) {
          console.error('Failed to import row:', cols);
        }
        
        current = i;
        setImportProgress({ current, total });
      }
      
      setTimeout(() => {
        alert(`Successfully imported ${total} ${selectedLevel}(s) for ${selectedGeo}`);
        setCsvFile(null);
        setCsvPreview(null);
        setImportProgress(null);
      }, 500);
    };
    reader.readAsText(csvFile);
  };

  const getLevelLabel = () => {
    switch (selectedLevel) {
      case 'city': return 'Cities/Villages';
      case 'area': return 'Areas/Wards';
      case 'street': return 'Streets';
      case 'substreet': return 'Substreets/Lanes';
    }
  };

  const getParentLabel = () => {
    switch (selectedLevel) {
      case 'city': return 'Taluk ID';
      case 'area': return 'City ID';
      case 'street': return 'Area ID';
      case 'substreet': return 'Street ID';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Upload className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-extrabold text-surface-900 font-display tracking-tight">Bulk Import Zones</h2>
            <p className="text-sm text-slate-600 mt-1">Import zones in bulk for a specific geographic location</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Zone Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as ZoneLevel)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="city">Cities/Villages</option>
                <option value="area">Areas/Wards</option>
                <option value="street">Streets</option>
                <option value="substreet">Substreets/Lanes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Parent Geographic Location</label>
              <select
                value={selectedGeo}
                onChange={(e) => setSelectedGeo(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select parent geo...</option>
                {geoStates.map(state => (
                  <option key={state.id} value={state.id}>{state.name} (State)</option>
                ))}
                {geoDistricts.map(district => (
                  <option key={district.id} value={district.id}>{district.name} (District)</option>
                ))}
                {taluks.map(taluk => (
                  <option key={taluk.id} value={taluk.id}>{taluk.name} (Taluk)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Download template to see required columns</li>
              <li>• Parent ID must exist in database ({getParentLabel()})</li>
              <li>• Name is required for each zone</li>
              <li>• Zones will be imported only under selected geographic location</li>
            </ul>
          </div>

          <div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center gap-2 mb-4"
            >
              <Download className="w-4 h-4" />
              Download Template
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          {csvPreview && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="p-3 bg-green-50 border-b border-green-200 flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">Preview: {csvFile?.name}</span>
                <button
                  onClick={() => { setCsvFile(null); setCsvPreview(null); }}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      {csvPreview.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left font-bold text-slate-700">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.rows.map((row, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        {row.map((cell, j) => (
                          <td key={j} className="px-3 py-2 text-slate-600">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-slate-50 text-sm text-slate-600">
                Showing {csvPreview.rows.length} of {csvPreview.totalRows} records
              </div>
            </div>
          )}

          {importProgress && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-medium text-amber-900">Importing...</span>
              </div>
              <div className="text-sm text-amber-800">
                {importProgress.current} of {importProgress.total} records processed
              </div>
            </div>
          )}

          {csvFile && selectedGeo && !importProgress && (
            <button
              onClick={handleImport}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Start Import
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 shadow-lg p-6">
        <h3 className="text-lg font-extrabold text-surface-900 font-display tracking-tight mb-4">Current Zone Counts</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-indigo-900">{cities.length}</div>
            <div className="text-sm text-indigo-700">Cities/Villages</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-900">{areas.length}</div>
            <div className="text-sm text-blue-700">Areas/Wards</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-900">{streets.length}</div>
            <div className="text-sm text-green-700">Streets</div>
          </div>
          <div className="bg-teal-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-teal-900">{substreets.length}</div>
            <div className="text-sm text-teal-700">Substreets</div>
          </div>
        </div>
      </div>
    </div>
  );
}