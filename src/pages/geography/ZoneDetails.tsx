/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Edit2, 
  MapPin, 
  Layers,
  Database,
  Building,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { Button } from "../../components/ui/Button";
import { entityApi } from "../../services/api";
import { ActiveEntity } from "../../types";

export default function ZoneDetails() {
  const { zoneId } = useParams<{ zoneId: string }>();
  const navigate = useNavigate();
  const { cities, areas, streets, substreets, activeEntities: ctxActiveEntities } = useData();
  
  const [fbEntities, setFbEntities] = useState<ActiveEntity[]>([]);
  const [isLoadingFb, setIsLoadingFb] = useState(false);
  
  const loadFromFirestore = async () => {
    setIsLoadingFb(true);
    try {
      const data = await entityApi.getAll();
      setFbEntities(data);
    } catch (err) {
      console.error('Failed to load entities from Firestore:', String(err).replace(/[\r\n]/g, ' '));
    } finally {
      setIsLoadingFb(false);
    }
  };
  
  useEffect(() => {
    loadFromFirestore();
  }, []);
  
  const activeEntities = fbEntities.length > 0 ? fbEntities : ctxActiveEntities;

  // Determine zone type and find the zone
  const zoneType = zoneId?.includes("CITY") ? "city" 
    : zoneId?.includes("AREA") ? "area"
    : zoneId?.includes("SUB") ? "substreet"
    : zoneId?.includes("STR") ? "street"
    : null;

  const zone = zoneType === "city" ? cities.find(z => z.id === zoneId)
    : zoneType === "area" ? areas.find(z => z.id === zoneId)
    : zoneType === "street" ? streets.find(z => z.id === zoneId)
    : zoneType === "substreet" ? substreets.find(z => z.id === zoneId)
    : null;

  if (!zone || !zoneType) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={48} />
          <h2 className="text-xl font-bold text-red-900 mb-2">Zone Not Found</h2>
          <p className="text-red-700 mb-4">The zone you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/geography")} variant="secondary">
            Back to Geography
          </Button>
        </div>
      </div>
    );
  }

  // Calculate usage statistics
  const getUsageStats = () => {
    if (zoneType === "city") {
      const cityAreas = areas.filter(a => a.cityVillageId === zone.id);
      const cityStreets = cityAreas.flatMap(a => 
        streets.filter(s => s.areaId === a.id)
      );
      const citySubstreets = cityStreets.flatMap(s => 
        substreets.filter(sub => sub.streetId === s.id)
      );
      
      // Count entities in this city
      const entityCount = activeEntities.filter(e => 
        e.cityVillageId === zone.id
      ).length;

      return {
        areas: cityAreas.length,
        streets: cityStreets.length,
        substreets: citySubstreets.length,
        entities: entityCount
      };
    } else if (zoneType === "area") {
      const areaStreets = streets.filter(s => s.areaId === zone.id);
      const areaSubstreets = areaStreets.flatMap(s => 
        substreets.filter(sub => sub.streetId === s.id)
      );
      
      const entityCount = activeEntities.filter(e => 
        e.areaId === zone.id
      ).length;

      return {
        streets: areaStreets.length,
        substreets: areaSubstreets.length,
        entities: entityCount
      };
    } else if (zoneType === "street") {
      const streetSubstreets = substreets.filter(sub => sub.streetId === zone.id);
      
      const entityCount = activeEntities.filter(e => 
        e.streetId === zone.id
      ).length;

      return {
        substreets: streetSubstreets.length,
        entities: entityCount
      };
    } else if (zoneType === "substreet") {
      const entityCount = activeEntities.filter(e => 
        e.substreetId === zone.id
      ).length;

      return {
        entities: entityCount
      };
    }
    return {};
  };

  const stats = getUsageStats();

  // Get parent zone info
  const getParentInfo = () => {
    if (zoneType === "city") {
      return { label: "Taluk", id: (zone as any).talukId };
    } else if (zoneType === "area") {
      const city = cities.find(c => c.id === (zone as any).cityVillageId);
      return { label: "City/Village", id: (zone as any).cityVillageId, name: city?.name };
    } else if (zoneType === "street") {
      const area = areas.find(a => a.id === (zone as any).areaId);
      return { label: "Area", id: (zone as any).areaId, name: area?.name };
    } else if (zoneType === "substreet") {
      const street = streets.find(s => s.id === (zone as any).streetId);
      return { label: "Street", id: (zone as any).streetId, name: street?.name };
    }
    return null;
  };

  const parentInfo = getParentInfo();

  const getZoneIcon = () => {
    switch (zoneType) {
      case "city": return <Building className="text-indigo-600" size={24} />;
      case "area": return <Layers className="text-blue-600" size={24} />;
      case "street": return <MapPin className="text-green-600" size={24} />;
      case "substreet": return <MapPin className="text-teal-600" size={24} />;
      default: return <MapPin className="text-slate-600" size={24} />;
    }
  };

  const getZoneTypeLabel = () => {
    switch (zoneType) {
      case "city": return "City/Village";
      case "area": return "Area";
      case "street": return "Street";
      case "substreet": return "Substreet";
      default: return "Zone";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-md">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate("/geography")}
            variant="secondary"
            size="sm"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{zone.name}</h1>
            <p className="text-sm text-slate-600">{getZoneTypeLabel()} Details</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={loadFromFirestore}
            disabled={isLoadingFb}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh entity counts from Firebase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingFb ? 'animate-spin' : ''}`} />
          </button>
          <Button
            onClick={() => navigate(`/geography/edit/${zone.id}`)}
            variant="primary"
            size="sm"
          >
            <Edit2 size={16} />
            Edit
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-5">
          {getZoneIcon()}
          <h2 className="text-lg font-bold text-slate-900">Basic Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Zone ID</label>
            <p className="text-sm font-mono text-slate-900 mt-2 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200">
              {zone.id}
            </p>
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Zone Type</label>
            <p className="text-sm text-slate-900 mt-2 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200">
              {getZoneTypeLabel()}
            </p>
          </div>
          
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Zone Name</label>
            <p className="text-sm text-slate-900 mt-2 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200">
              {zone.name}
            </p>
          </div>

          {parentInfo && (
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Parent {parentInfo.label}</label>
              <p className="text-sm text-slate-900 mt-2 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200">
                {parentInfo.name ? `${parentInfo.name} (${parentInfo.id})` : parentInfo.id}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-5">
          <Database className="text-indigo-600" size={24} />
          <h2 className="text-lg font-bold text-slate-900">Usage Statistics</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.areas !== undefined && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 text-center shadow-sm">
              <div className="text-2xl font-bold text-indigo-900">{stats.areas}</div>
              <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mt-1">Areas</div>
            </div>
          )}
          
          {stats.streets !== undefined && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-900">{stats.streets}</div>
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mt-1">Streets</div>
            </div>
          )}
          
          {stats.substreets !== undefined && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-900">{stats.substreets}</div>
              <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mt-1">Substreets</div>
            </div>
          )}
          
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center shadow-sm">
            <div className="text-2xl font-bold text-purple-900">{stats.entities}</div>
            <div className="text-xs font-semibold text-purple-700 uppercase tracking-wide mt-1">Entities</div>
          </div>
        </div>

        {stats.entities !== undefined && stats.entities > 0 && (
          <div className="mt-5 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-amber-800">
                This zone is actively used by {stats.entities} {stats.entities === 1 ? 'entity' : 'entities'}. 
                Deletion or deactivation may affect entity records.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="bg-white border-2 border-red-200 rounded-xl p-6 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="text-red-600" size={24} />
          <h2 className="text-lg font-bold text-red-900">Danger Zone</h2>
        </div>
        
        <p className="text-sm text-red-700 mb-5">
          Deleting this zone is permanent and cannot be undone. All child zones and associated data will be affected.
        </p>
        
        <Button
          variant="secondary"
          size="sm"
          className="border-red-300 text-red-700 hover:bg-red-50"
          disabled={stats.entities ? stats.entities > 0 : false}
        >
          <Trash2 size={16} />
          Delete Zone
        </Button>
        
        {stats.entities && stats.entities > 0 && (
          <p className="text-xs text-red-600 mt-3 font-medium">
            Cannot delete: Zone is used by {stats.entities} active {stats.entities === 1 ? 'entity' : 'entities'}
          </p>
        )}
      </div>
    </div>
  );
}
