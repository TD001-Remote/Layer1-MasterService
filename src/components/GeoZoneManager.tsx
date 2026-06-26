/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Plus, 
  MapPin, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  Home, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Database,
  Building
} from "lucide-react";
import { Link } from "react-router-dom";
import { useData } from "../contexts/DataContext";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { validateRequired } from "../utils/validation";

export default function GeoZoneManager() {
  const {
    states,
    districts,
    taluks,
    cities,
    areas,
    streets,
    substreets,
    zoneRefs,
    activeEntities,
    addCity,
    addArea,
    addStreet,
    addSubstreet
  } = useData();

  // Selection States for detailed view
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    type: "state" | "district" | "taluk" | "city" | "area" | "street" | "substreet";
    name: string;
  }>({
    id: "ZON-CITY-001",
    type: "city",
    name: "Sirkazhi City"
  });

  // Tree Expansion States
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({
    "GEO-TN": true,
    "GEO-TN-MAY": true,
    "GEO-TN-MAY-SIR": true,
    "ZON-CITY-001": true,
    "ZON-AREA-001": true
  });

  // Creation State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<"city" | "area" | "street" | "substreet">("street");
  const [addName, setAddName] = useState("");
  const [addParentId, setAddParentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline form validation errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [parentIdError, setParentIdError] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Handle addition
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields - convert ValidationResult to string | null
    const nameValidation = validateRequired(addName, 'Name');
    const parentValidation = validateRequired(addParentId, 'Parent ID');
    
    setNameError(nameValidation.isValid ? null : nameValidation.error || 'Invalid name');
    setParentIdError(parentValidation.isValid ? null : parentValidation.error || 'Invalid parent ID');
    
    if (!nameValidation.isValid || !parentValidation.isValid) return;

    // Strict 200 check for streets in area
    if (addType === "street") {
      const count = streets.filter(s => s.areaId === addParentId).length;
      if (count >= 200) {
        setParentIdError("Integrity Constraint Breach: This Area already possesses the maximum limit of 200 Streets/Substreets.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Call appropriate action based on type
      if (addType === "city") await addCity(addName, addParentId);
      else if (addType === "area") await addArea(addName, addParentId);
      else if (addType === "street") await addStreet(addName, addParentId);
      else if (addType === "substreet") await addSubstreet(addName, addParentId);

      setAddName("");
      setShowAddModal(false);
      setNameError(null);
      setParentIdError(null);
    } catch (error) {
      console.error("Failed to create:", error);
      setParentIdError("Failed to create zone. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="geo_zone_panel">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-md">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900">Geographic & Zone Registry</h2>
          <p className="text-sm text-slate-600 font-medium">Construct and map State, District, Taluks to physical local streets</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setAddType("city");
              setAddParentId(taluks[0]?.id || "");
              setShowAddModal(true);
            }} 
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus size={14} /> +Town/Village
          </button>
          
          <button 
            onClick={() => {
              setAddType("area");
              setAddParentId(cities[0]?.id || "");
              setShowAddModal(true);
            }} 
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus size={14} /> +Area
          </button>

          <button 
            onClick={() => {
              setAddType("street");
              setAddParentId(areas[0]?.id || "");
              setShowAddModal(true);
            }} 
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> +Street Zone
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-900 text-lg">Zone Registry</h3>
          <p className="text-xs text-slate-600 mt-1">
            Click on any zone to view details and manage
          </p>
        </div>

        {/* Cities/Villages */}
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Building className="text-indigo-600" size={20} />
            <h4 className="font-bold text-slate-900 text-base">Cities/Villages ({cities.length})</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cities.slice(0, 6).map(city => (
              <Link
                key={city.id}
                to={`/geography/${city.id}`}
                className="flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-all group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{city.name}</div>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">{city.id}</div>
                </div>
                <ChevronRight className="text-indigo-500 group-hover:text-indigo-700" size={18} />
              </Link>
            ))}
          </div>
          {cities.length > 6 && (
            <p className="text-xs text-slate-600 mt-3 font-medium">
              +{cities.length - 6} more cities/villages
            </p>
          )}
        </div>

        {/* Areas */}
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="text-blue-600" size={20} />
            <h4 className="font-bold text-slate-900 text-base">Areas ({areas.length})</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {areas.slice(0, 6).map(area => (
              <Link
                key={area.id}
                to={`/geography/${area.id}`}
                className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{area.name}</div>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">{area.id}</div>
                </div>
                <ChevronRight className="text-blue-500 group-hover:text-blue-700" size={18} />
              </Link>
            ))}
          </div>
          {areas.length > 6 && (
            <p className="text-xs text-slate-600 mt-3 font-medium">
              +{areas.length - 6} more areas
            </p>
          )}
        </div>

        {/* Streets */}
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-green-600" size={20} />
            <h4 className="font-bold text-slate-900 text-base">Streets ({streets.length})</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {streets.slice(0, 6).map(street => (
              <Link
                key={street.id}
                to={`/geography/${street.id}`}
                className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-all group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{street.name}</div>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">{street.id}</div>
                </div>
                <ChevronRight className="text-green-500 group-hover:text-green-700" size={18} />
              </Link>
            ))}
          </div>
          {streets.length > 6 && (
            <p className="text-xs text-slate-600 mt-3 font-medium">
              +{streets.length - 6} more streets
            </p>
          )}
        </div>

        {/* Substreets */}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-teal-600" size={20} />
            <h4 className="font-bold text-slate-900 text-base">Substreets ({substreets.length})</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {substreets.slice(0, 6).map(substreet => (
              <Link
                key={substreet.id}
                to={`/geography/${substreet.id}`}
                className="flex items-center justify-between p-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-all group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{substreet.name}</div>
                  <div className="text-xs text-slate-600 font-mono mt-0.5">{substreet.id}</div>
                </div>
                <ChevronRight className="text-teal-500 group-hover:text-teal-700" size={18} />
              </Link>
            ))}
          </div>
          {substreets.length > 6 && (
            <p className="text-xs text-slate-600 mt-3 font-medium">
              +{substreets.length - 6} more substreets
            </p>
          )}
        </div>

        {/* Summary Stats */}
        <div className="p-5 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-900">{cities.length}</div>
              <div className="text-xs text-slate-600 font-semibold mt-1">Cities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{areas.length}</div>
              <div className="text-xs text-slate-600 font-semibold mt-1">Areas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{streets.length}</div>
              <div className="text-xs text-slate-600 font-semibold mt-1">Streets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{substreets.length}</div>
              <div className="text-xs text-slate-600 font-semibold mt-1">Substreets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Creation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-xl mb-6 text-slate-900">Add {addType}</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Name"
                value={addName}
                onChange={(e) => { setAddName(e.target.value); setNameError(null); }}
                error={nameError || undefined}
                required
                disabled={isSubmitting}
              />
              <Input
                label="Parent ID"
                value={addParentId}
                onChange={(e) => { setAddParentId(e.target.value); setParentIdError(null); }}
                error={parentIdError || undefined}
                required
                disabled={isSubmitting}
                className="font-mono"
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => { setShowAddModal(false); setNameError(null); setParentIdError(null); }}
                  variant="secondary"
                  fullWidth
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={isSubmitting}
                >
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
