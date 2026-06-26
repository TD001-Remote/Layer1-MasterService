/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { useData } from "../../contexts/DataContext";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { validateRequired } from "../../utils/validation";

export default function ZoneEdit() {
  const { zoneId } = useParams<{ zoneId: string }>();
  const navigate = useNavigate();
  const { cities, areas, streets, substreets, taluks, updateZone } = useData();

  // Determine zone type
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

  // Form state
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [parentError, setParentError] = useState<string | null>(null);

  useEffect(() => {
    if (zone) {
      setName(zone.name);
      if (zoneType === "city") {
        setParentId((zone as any).talukId);
      } else if (zoneType === "area") {
        setParentId((zone as any).cityVillageId);
      } else if (zoneType === "street") {
        setParentId((zone as any).areaId);
      } else if (zoneType === "substreet") {
        setParentId((zone as any).streetId);
      }
    }
  }, [zone, zoneType]);

  if (!zone || !zoneType) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto mb-3 text-red-500" size={48} />
          <h2 className="text-xl font-bold text-red-900 mb-2">Zone Not Found</h2>
          <p className="text-red-700 mb-4">The zone you're trying to edit doesn't exist.</p>
          <Button onClick={() => navigate("/geography")} variant="secondary">
            Back to Geography
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate
    const nameValidation = validateRequired(name, "Name");
    const parentValidation = validateRequired(parentId, "Parent");

    setNameError(nameValidation.isValid ? null : nameValidation.error || "Invalid name");
    setParentError(parentValidation.isValid ? null : parentValidation.error || "Invalid parent");

    if (!nameValidation.isValid || !parentValidation.isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updateZone(zoneType, zone.id, { name, parentId });
      navigate(`/geography/${zone.id}`);
    } catch (err) {
      console.error("Failed to update zone:", err);
      setError("Failed to update zone. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getParentOptions = () => {
    if (zoneType === "city") {
      return taluks.map(t => ({ value: t.id, label: `${t.name} (${t.id})` }));
    } else if (zoneType === "area") {
      return cities.map(c => ({ value: c.id, label: `${c.name} (${c.id})` }));
    } else if (zoneType === "street") {
      return areas.map(a => ({ value: a.id, label: `${a.name} (${a.id})` }));
    } else if (zoneType === "substreet") {
      return streets.map(s => ({ value: s.id, label: `${s.name} (${s.id})` }));
    }
    return [];
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

  const getParentLabel = () => {
    switch (zoneType) {
      case "city": return "Taluk";
      case "area": return "City/Village";
      case "street": return "Area";
      case "substreet": return "Street";
      default: return "Parent";
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate(`/geography/${zone.id}`)}
          variant="secondary"
          size="sm"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit {getZoneTypeLabel()}</h1>
          <p className="text-sm text-slate-500">{zone.name}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <Input
            label="Zone Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameError(null);
            }}
            error={nameError || undefined}
            required
            disabled={isSubmitting}
            placeholder="Enter zone name"
          />

          <Select
            label={`Parent ${getParentLabel()}`}
            value={parentId}
            onChange={(e) => {
              setParentId(e.target.value);
              setParentError(null);
            }}
            options={getParentOptions()}
            error={parentError || undefined}
            required
            disabled={isSubmitting}
          />

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-xs text-slate-600">
              <span className="font-bold">Note:</span> Changing the parent will affect the zone's hierarchy 
              and may impact related entities and zone references.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => navigate(`/geography/${zone.id}`)}
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
              <Save size={16} />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
