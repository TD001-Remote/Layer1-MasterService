import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  MapPin, 
  Phone, 
  Globe, 
  Tag,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Button, Card, Badge } from '../../components/ui';

export default function EntityDetails() {
  const { entityPk } = useParams<{ entityPk: string }>();
  const navigate = useNavigate();
  const { activeEntities, zoneRefs, stopEntity, recoverEntity, domains, categories, types } = useData();
  
  const entity = activeEntities.find(e => e.entity_pk === entityPk);
  const zone = zoneRefs.find(z => z.zone_pk === entity?.zone_pk);
  const domain = domains.find(d => d.code === entity?.primary_domain);
  const category = categories.find(c => c.pk === entity?.category_pk);
  const type = types.find(t => t.pk === (entity as any)?.type_pk);

  const [isProcessing, setIsProcessing] = useState(false);

  if (!entity) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 mb-2">Entity Not Found</h3>
          <p className="text-surface-600 mb-4">The requested entity could not be found.</p>
          <Button onClick={() => navigate('/entity-registry')}>
            Back to Registry
          </Button>
        </div>
      </div>
    );
  }

  const handleStop = async () => {
    if (!confirm(`Are you sure you want to stop entity "${entity.entity_name}"?`)) return;
    setIsProcessing(true);
    try {
      await stopEntity(entity.entity_pk);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecover = async () => {
    setIsProcessing(true);
    try {
      await recoverEntity(entity.entity_pk);
    } finally {
      setIsProcessing(false);
    }
  };

  const isStopped = entity.status === 'stopped';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/entity-registry')}
            className="px-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">{entity.entity_name}</h1>
            <p className="text-sm text-surface-500">{entity.entity_pk}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isStopped ? (
            <Button onClick={handleRecover} loading={isProcessing} variant="secondary">
              <CheckCircle size={16} className="mr-1" />
              Recover Entity
            </Button>
          ) : (
            <>
              <Button 
                variant="secondary"
                onClick={() => navigate(`/entity-registry/edit/${entity.entity_pk}`)}
              >
                <Edit size={16} className="mr-1" />
                Edit
              </Button>
              <Button onClick={handleStop} loading={isProcessing} variant="danger">
                <XCircle size={16} className="mr-1" />
                Stop Entity
              </Button>
            </>
          )}
        </div>
      </div>

      <div>
        <Badge variant={isStopped ? 'danger' : 'success'}>
          {isStopped ? 'Stopped' : 'Active'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Basic Information</h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-surface-500">Entity Name</dt>
              <dd className="text-sm text-surface-900 mt-1">{entity.entity_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-surface-500">Entity PK</dt>
              <dd className="text-sm text-surface-900 mt-1 font-mono">{entity.entity_pk}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-surface-500 flex items-center gap-1">
                <Phone size={14} />
                Phone
              </dt>
              <dd className="text-sm text-surface-900 mt-1">{entity.phone || 'Not provided'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-surface-500">Visibility</dt>
              <dd className="text-sm text-surface-900 mt-1">{entity.visibility_type}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <MapPin size={18} />
            Location
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-surface-500">Zone PK</dt>
              <dd className="text-sm text-surface-900 mt-1 font-mono">{entity.zone_pk}</dd>
            </div>
            {zone && (
              <div>
                <dt className="text-sm font-medium text-surface-500">Full Address</dt>
                <dd className="text-sm text-surface-900 mt-1">{zone.fullAddress}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-surface-500">City/Village ID</dt>
              <dd className="text-sm text-surface-900 mt-1 font-mono">{entity.cityVillageId}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-surface-500">Street ID</dt>
              <dd className="text-sm text-surface-900 mt-1 font-mono">{entity.streetId}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Tag size={18} />
            Classification
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-surface-500">Primary Domain</dt>
              <dd className="text-sm text-surface-900 mt-1">
                {entity.primary_domain} {domain && `- ${domain.name}`}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-surface-500">Category</dt>
              <dd className="text-sm text-surface-900 mt-1">
                {entity.category_pk} - {entity.category_name}
              </dd>
            </div>
            {type && (
              <div>
                <dt className="text-sm font-medium text-surface-500">Type</dt>
                <dd className="text-sm text-surface-900 mt-1">
                  {type.pk} - {type.name}
                </dd>
              </div>
            )}
          </dl>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Calendar size={18} />
            Metadata
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-surface-500">Created At</dt>
              <dd className="text-sm text-surface-900 mt-1">
                {entity.createdAt ? new Date(entity.createdAt).toLocaleString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-surface-500">Updated At</dt>
              <dd className="text-sm text-surface-900 mt-1">
                {entity.updatedAt ? new Date(entity.updatedAt).toLocaleString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-surface-500">Status</dt>
              <dd className="text-sm text-surface-900 mt-1">
                <Badge variant={isStopped ? 'danger' : 'success'}>
                  {entity.status}
                </Badge>
              </dd>
            </div>
          </dl>
        </Card>

        {entity.website_zone_entity_id && (
          <Card>
            <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Globe size={18} />
              Website Zone Entity
            </h2>
            <p className="text-sm text-surface-700">{entity.website_zone_entity_id}</p>
          </Card>
        )}
      </div>
    </div>
  );
}