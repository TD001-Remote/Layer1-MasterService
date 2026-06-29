/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Tag,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Home
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Button, Card, Badge } from '../../components/ui';
import { getAllNonEntityDomains, getNonEntityCategoryById } from '../../data/domains';

export default function NonEntityDetails() {
  const { nonEntityPk } = useParams<{ nonEntityPk: string }>();
  const navigate = useNavigate();
  const { nonEntities, zoneRefs, stopNonEntity, recoverNonEntity } = useData();
  
  const nonEntity = nonEntities.find(e => e.non_entity_pk === nonEntityPk);
  const zone = zoneRefs.find(z => z.zone_pk === nonEntity?.zone_pk);
  const categoryInfo = nonEntity ? getNonEntityCategoryById(nonEntity.category_pk) : undefined;
  
  const [isProcessing, setIsProcessing] = useState(false);

  if (!nonEntity) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Non-Entity Not Found</h3>
          <p className="text-gray-600 mb-4">The requested non-entity could not be found.</p>
<Button onClick={() => navigate('/non-entity-registry')}>
             Back to Registry
           </Button>
        </div>
      </div>
    );
  }

  const handleStop = async () => {
    if (!confirm(`Are you sure you want to stop non-entity "${nonEntity.non_entity_name}"?`)) return;
    setIsProcessing(true);
    try {
      await stopNonEntity(nonEntity.non_entity_pk);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecover = async () => {
    setIsProcessing(true);
    try {
      await recoverNonEntity(nonEntity.non_entity_pk);
    } finally {
      setIsProcessing(false);
    }
  };

  const isStopped = nonEntity.status === 'stopped';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
<Button 
        variant="ghost" 
        onClick={() => navigate('/non-entity-registry')}
        className="px-2"
      >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{nonEntity.non_entity_name}</h1>
            <p className="text-sm text-gray-500 font-mono">{nonEntity.non_entity_pk}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isStopped ? (
            <Button onClick={handleRecover} loading={isProcessing} variant="secondary">
              <CheckCircle size={16} className="mr-1" />
              Recover Non-Entity
            </Button>
          ) : (
            <>
              <Button 
                variant="secondary"
                onClick={() => navigate(`/non-entity-registry/edit/${nonEntity.non_entity_pk}`)}
              >
                <Edit size={16} className="mr-1" />
                Edit
              </Button>
              <Button onClick={handleStop} loading={isProcessing} variant="danger">
                <XCircle size={16} className="mr-1" />
                Stop Non-Entity
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <Badge variant={isStopped ? 'danger' : 'success'}>
          {isStopped ? 'Stopped' : 'Active'}
        </Badge>
      </div>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-600" />
            Basic Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Non-Entity Name</dt>
              <dd className="text-sm text-gray-900 mt-1">{nonEntity.non_entity_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 font-mono">Non-Entity PK</dt>
              <dd className="text-sm text-gray-900 mt-1 font-mono">{nonEntity.non_entity_pk}</dd>
            </div>
            {nonEntity.phone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900 mt-1">{nonEntity.phone}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">Visibility Type</dt>
              <dd className="text-sm text-gray-900 mt-1">{nonEntity.visibility_type}</dd>
            </div>
          </dl>
        </Card>

        {/* Location Information */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            Location
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">State ID</dt>
              <dd className="text-sm text-gray-900 mt-1 font-mono">{nonEntity.stateId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">District ID</dt>
              <dd className="text-sm text-gray-900 mt-1 font-mono">{nonEntity.districtId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Taluk ID</dt>
              <dd className="text-sm text-gray-900 mt-1 font-mono">{nonEntity.talukId}</dd>
            </div>
            {nonEntity.zone_pk && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Zone PK</dt>
                <dd className="text-sm text-gray-900 mt-1 font-mono">{nonEntity.zone_pk}</dd>
              </div>
            )}
            {zone && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Address</dt>
                <dd className="text-sm text-gray-900 mt-1">{zone.fullAddress}</dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Classification */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-emerald-600" />
            Classification
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Primary Domain</dt>
              <dd className="text-sm text-gray-900 mt-1">
                {nonEntity.primary_domain} {categoryInfo?.domain.name && `- ${categoryInfo.domain.name}`}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="text-sm text-gray-900 mt-1">
                {nonEntity.category_pk} - {nonEntity.category_name}
              </dd>
            </div>
            {nonEntity.type_pk && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="text-sm text-gray-900 mt-1">{nonEntity.type_pk}</dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Metadata */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Metadata
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="text-sm text-gray-900 mt-1">
                {nonEntity.createdAt ? new Date(nonEntity.createdAt).toLocaleString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Updated At</dt>
              <dd className="text-sm text-gray-900 mt-1">
                {nonEntity.updatedAt ? new Date(nonEntity.updatedAt).toLocaleString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="text-sm text-gray-900 mt-1">
                <Badge variant={isStopped ? 'danger' : 'success'}>
                  {nonEntity.status}
                </Badge>
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}