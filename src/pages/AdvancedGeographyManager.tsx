/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ADVANCED GEOGRAPHY MANAGER
 * Complete Tamil Nadu & Puducherry Geographic Hierarchy Management
 */

import { useState } from "react";
import { 
  MapPin, 
  Plus, 
  Upload, 
  Download, 
  Search, 
  ChevronRight, 
  ChevronDown,
  Edit,
  Trash2,
  Map,
  BarChart3,
  FileText,
  X
} from "lucide-react";
import { useData } from "../contexts/DataContext";
import { 
  getAllStates, 
  getAllDistricts, 
  getDistrictsByState, 
  getTaluksByDistrict,
  GEO_STATS
} from "../data/tamilnadu-geography";

type GeoLevel = 'state' | 'district' | 'taluk' | 'city' | 'area' | 'street' | 'substreet';
type ViewMode = 'tree' | 'table' | 'stats' | 'bulk-import';

interface AddLocationForm {
  level: GeoLevel;
  name: string;
  code: string;
  parentId: string;
}

export default function AdvancedGeographyManager() {
  const { cities, areas, streets, substreets, addCity, addArea, addStreet, addSubstreet, refreshAreas } = useData();
  
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [selectedLevel, setSelectedLevel] = useState<GeoLevel>('district');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['GEO-TN']));
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<AddLocationForm>({
    level: 'district',
    name: '',
    code: '',
    parentId: ''
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  
  const states = getAllStates();
  const allDistricts = getAllDistricts();

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleDownloadTemplate = (level: GeoLevel) => {
    const templates = {
      district: 'state_id,district_name,district_code\nGEO-TN,Mayiladuthurai,MAY',
      taluk: 'district_id,taluk_name,taluk_code\nGEO-TN-MAY,Sirkazhi,SIR',
      city: 'taluk_id,city_name,city_code\nGEO-TN-MAY-SIR,Sirkazhi Town,CITY1',
      area: 'city_id,area_name,area_code\nZON-CITY-001,North Ward,AREA1',
      street: 'area_id,street_name,street_code\nZON-AREA-001,Main Street,STR1',
      substreet: 'street_id,substreet_name,substreet_code\nZON-STR-001,Lane 1,SUB1'
    };
    
    const template = templates[level as keyof typeof templates] || templates.district;
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${level}-template.csv`;
    a.click();
  };

  const handleAddLocation = async () => {
    const safeName = addForm.name.trim().replace(/[<>"'&]/g, '');
    if (!safeName) {
      alert('Please enter a location name');
      return;
    }

    try {
      if (addForm.level === 'city') {
        await addCity(safeName, addForm.parentId);
      } else if (addForm.level === 'area') {
        await addArea(safeName, addForm.parentId);
      } else if (addForm.level === 'street') {
        await addStreet(safeName, addForm.parentId);
      } else if (addForm.level === 'substreet') {
        await addSubstreet(safeName, addForm.parentId);
      }
      
      setShowAddModal(false);
      setAddForm({ level: 'district', name: '', code: '', parentId: '' });
    } catch (err) {
      console.error('Failed to add location:', String(err).replace(/[\r\n]/g, ' '));
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    // Parse CSV and process records
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      
      if (lines.length < 2) {
        alert('CSV file must have at least 2 lines (header + data)');
        return;
      }

      // Skip header, process data rows
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        
        if (selectedLevel === 'city' && cols.length >= 2) {
          await addCity(cols[1], cols[0]); // talukId, name
        } else if (selectedLevel === 'area' && cols.length >= 2) {
          await addArea(cols[1], cols[0]); // cityId, name
        } else if (selectedLevel === 'street' && cols.length >= 2) {
          await addStreet(cols[1], cols[0]); // areaId, name
        } else if (selectedLevel === 'substreet' && cols.length >= 2) {
          await addSubstreet(cols[1], cols[0]); // streetId, name
        }
      }
      
      alert(`Successfully imported ${lines.length - 1} records`);
      setCsvFile(null);
    };
    
    reader.readAsText(csvFile);
  };

  // Get all locations for table view
  const getTableData = () => {
    if (selectedLevel === 'state') return states.map(s => ({ id: s.id, name: s.name, parent: '-', zonePk: '-' }));
    if (selectedLevel === 'district') return allDistricts.map(d => ({ 
      id: d.id, 
      name: d.name, 
      parent: states.find(s => s.id === d.stateId)?.name || '-',
      zonePk: '-' 
    }));
    if (selectedLevel === 'city') return cities.map(c => ({
      id: c.id,
      name: c.name,
      parent: c.talukId,
      zonePk: '-'
    }));
    if (selectedLevel === 'area') return areas.map(a => ({
      id: a.id,
      name: a.name,
      parent: a.cityVillageId,
      zonePk: '-'
    }));
    if (selectedLevel === 'street') return streets.map(s => ({
      id: s.id,
      name: s.name,
      parent: s.areaId,
      zonePk: '-'
    }));
    if (selectedLevel === 'substreet') return substreets.map(ss => ({
      id: ss.id,
      name: ss.name,
      parent: ss.streetId,
      zonePk: '-'
    }));
    
    return [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-7 h-7 text-blue-600" />
              Advanced Geography Manager
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Complete Tamil Nadu & Puducherry geographic hierarchy management
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

      {/* View Mode Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 inline-flex gap-1">
        <button
          onClick={() => setViewMode('tree')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'tree'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Map className="inline w-4 h-4 mr-1" />
          Hierarchy Tree
        </button>
        <button
          onClick={() => setViewMode('table')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'table'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText className="inline w-4 h-4 mr-1" />
          Table View
        </button>
        <button
          onClick={() => setViewMode('stats')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'stats'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="inline w-4 h-4 mr-1" />
          Statistics
        </button>
        <button
          onClick={() => setViewMode('bulk-import')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'bulk-import'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Upload className="inline w-4 h-4 mr-1" />
          Bulk Import
        </button>
      </div>

      {/* HIERARCHY TREE VIEW */}
      {viewMode === 'tree' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Tree Navigation */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search locations..."
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[700px] overflow-y-auto">
              {/* State Level */}
              {states.map(state => {
                const stateDistricts = getDistrictsByState(state.id);
                
                return (
                  <div key={state.id} className="border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleNode(state.id)}
                      className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedNodes.has(state.id) ? (
                          <ChevronDown className="w-5 h-5 text-blue-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-blue-600" />
                        )}
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <div className="text-left">
                          <div className="font-bold text-slate-900">{state.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{state.id}</div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-600">
                        <span>{stateDistricts.length} Districts</span>
                        <span>{state.id === 'GEO-TN' ? GEO_STATS.totalTaluks : 8} Taluks</span>
                      </div>
                    </button>

                    {/* District Level */}
                    {expandedNodes.has(state.id) && (
                      <div className="p-4 space-y-2">
                        {stateDistricts.map(district => {
                          const taluks = getTaluksByDistrict(district.id);
                          
                          return (
                            <div key={district.id} className="ml-4 border-l-2 border-blue-200 pl-4">
                              <button
                                onClick={() => toggleNode(district.id)}
                                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {expandedNodes.has(district.id) ? (
                                    <ChevronDown className="w-4 h-4 text-slate-600" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                  )}
                                  <div className="text-left">
                                    <div className="font-medium text-slate-900">{district.name}</div>
                                    <div className="text-xs text-slate-500 font-mono">{district.id}</div>
                                  </div>
                                </div>
                                <div className="flex gap-3 text-xs text-slate-600">
                                  <span>{district.taluks?.length || 0} Taluks</span>
                                  {district.population && (
                                    <span>{(district.population / 100000).toFixed(1)}L Pop</span>
                                  )}
                                </div>
                              </button>
                              
                              {/* Taluk Level */}
                              {expandedNodes.has(district.id) && taluks.length > 0 && (
                                <div className="ml-4 mt-2 space-y-2">
                                  {taluks.map(taluk => {
                                    const talukCities = cities.filter(c => c.talukId === taluk.id);
                                    
                                    return (
                                      <div key={taluk.id} className="border-l-2 border-slate-200 pl-4">
                                        <button
                                          onClick={() => toggleNode(taluk.id)}
                                          className="w-full flex items-center justify-between p-2 bg-white border border-slate-200 rounded hover:bg-slate-50"
                                        >
                                          <div className="flex items-center gap-2">
                                            {expandedNodes.has(taluk.id) ? (
                                              <ChevronDown className="w-3 h-3 text-slate-500" />
                                            ) : (
                                              <ChevronRight className="w-3 h-3 text-slate-500" />
                                            )}
                                            <div className="text-left">
                                              <div className="font-medium text-sm text-slate-900">{taluk.name}</div>
                                              <div className="text-xs text-slate-500 font-mono">{taluk.id}</div>
                                            </div>
                                          </div>
                                          <span className="text-xs text-slate-500">{talukCities.length} Cities</span>
                                        </button>
                                        
                                        {/* City Level */}
                                        {expandedNodes.has(taluk.id) && talukCities.length > 0 && (
                                          <div className="ml-4 mt-2 space-y-1">
                                            {talukCities.map(city => {
                                              const cityAreas = areas.filter(a => a.cityVillageId === city.id);
                                              
                                              return (
                                                <div key={city.id} className="text-xs text-slate-700 p-1.5 bg-slate-50 rounded">
                                                  <span className="font-medium">{city.name}</span>
                                                  <span className="text-slate-500 ml-2">({cityAreas.length} areas)</span>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 sticky top-6">
              <h3 className="font-bold text-slate-900">Quick Actions</h3>
              
               <button
                 onClick={() => setShowAddModal(true)}
                 className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
               >
                 <Plus className="w-5 h-5" />
                 Add New Location
               </button>
               
               <button
                 onClick={refreshAreas}
                 className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2"
               >
                 <Download className="w-5 h-5" />
                 Load/Refresh Areas Data
               </button>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Preview Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as GeoLevel)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="state">State</option>
                  <option value="district">District</option>
                  <option value="taluk">Taluk</option>
                  <option value="city">City/Village</option>
                  <option value="area">Area/Ward</option>
                  <option value="street">Street</option>
                  <option value="substreet">Substreet/Lane</option>
                </select>
              </div>

              <button
                onClick={() => handleDownloadTemplate(selectedLevel)}
                className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
              >
                <Download className="w-4 h-4" />
                Download CSV Template
              </button>

              <div className="pt-4 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-700 mb-2">Current Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cities:</span>
                    <span className="font-bold text-slate-900">{cities.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Areas:</span>
                    <span className="font-bold text-slate-900">{areas.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Streets:</span>
                    <span className="font-bold text-slate-900">{streets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Substreets:</span>
                    <span className="font-bold text-slate-900">{substreets.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="mb-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">All Locations - Table View</h3>
            <div className="flex gap-2">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as GeoLevel)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="state">States</option>
                <option value="district">Districts</option>
                <option value="taluk">Taluks</option>
                <option value="city">Cities</option>
                <option value="area">Areas</option>
                <option value="street">Streets</option>
                <option value="substreet">Substreets</option>
              </select>
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Parent</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Zone PK</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {getTableData().map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-mono text-slate-600">{row.id}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{row.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{row.parent}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-500">{row.zonePk}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {getTableData().length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No {selectedLevel}s found. Add locations using the tree view or bulk import.
            </div>
          )}
        </div>
      )}

      {/* STATISTICS VIEW */}
      {viewMode === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">States</div>
            <div className="text-3xl font-bold text-blue-600">{GEO_STATS.totalStates}</div>
            <div className="text-xs text-slate-500 mt-1">TN + Puducherry</div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Districts</div>
            <div className="text-3xl font-bold text-green-600">{GEO_STATS.totalDistricts}</div>
            <div className="text-xs text-slate-500 mt-1">{GEO_STATS.tnDistricts} TN + {GEO_STATS.pyDistricts} PY</div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Taluks</div>
            <div className="text-3xl font-bold text-purple-600">{GEO_STATS.totalTaluks}</div>
            <div className="text-xs text-slate-500 mt-1">Administrative blocks</div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Total Zones</div>
            <div className="text-3xl font-bold text-orange-600">{GEO_STATS.totalZones.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Unique Zone PKs</div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Cities/Villages</div>
            <div className="text-3xl font-bold text-indigo-600">{GEO_STATS.totalCities.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Urban + Rural</div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Areas/Wards</div>
            <div className="text-3xl font-bold text-pink-600">{GEO_STATS.totalAreas.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Subdivisions</div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Streets</div>
            <div className="text-3xl font-bold text-cyan-600">{GEO_STATS.totalStreets.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">Main roads</div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-sm text-slate-600 mb-1">Coverage</div>
            <div className="text-3xl font-bold text-emerald-600">100%</div>
            <div className="text-xs text-slate-500 mt-1">TN & PY Complete</div>
          </div>
        </div>
      )}

      {/* BULK IMPORT VIEW */}
      {viewMode === 'bulk-import' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Bulk Import Geographic Data</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Level to Import
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as GeoLevel)}
                className="w-full max-w-md px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="city">Cities/Villages</option>
                <option value="area">Areas/Wards</option>
                <option value="street">Streets</option>
                <option value="substreet">Substreets/Lanes</option>
              </select>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Download template first to see required columns</li>
                <li>• Parent ID must exist in database</li>
                <li>• Name and code are required</li>
                <li>• Zone PK will be auto-generated for street/substreet levels</li>
              </ul>
            </div>

            {csvFile && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <span className="text-sm text-green-800">Selected: {csvFile.name}</span>
                <button 
                  onClick={() => setCsvFile(null)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => handleDownloadTemplate(selectedLevel)}
                className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Template
              </button>
              
              <label className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 cursor-pointer">
                <Upload className="w-5 h-5" />
                Select CSV File
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
              </label>
              
              {csvFile && (
                <button
                  onClick={handleCsvUpload}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Import Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD LOCATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Add New Location</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Level</label>
                <select
                  value={addForm.level}
                  onChange={(e) => setAddForm({ ...addForm, level: e.target.value as GeoLevel, parentId: '' })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="city">City/Village</option>
                  <option value="area">Area/Ward</option>
                  <option value="street">Street</option>
                  <option value="substreet">Substreet/Lane</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parent</label>
                <select
                  value={addForm.parentId}
                  onChange={(e) => setAddForm({ ...addForm, parentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select parent...</option>
                  {addForm.level === 'city' && allDistricts.flatMap(d => getTaluksByDistrict(d.id)).map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                  ))}
                  {addForm.level === 'area' && cities.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                  ))}
                  {addForm.level === 'street' && areas.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.id})</option>
                  ))}
                  {addForm.level === 'substreet' && streets.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location name..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLocation}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Add Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
