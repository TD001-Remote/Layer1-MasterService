import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Button, Input, Select, Card } from '../../components/ui';
import { validateRequired, validatePhone } from '../../utils/validation';
import { ActiveEntity, DomainCode } from '../../types';

export default function EntityEdit() {
  const { entityPk } = useParams<{ entityPk: string }>();
  const navigate = useNavigate();
  const { 
    activeEntities, 
    updateEntity, 
    zoneRefs, 
    domains, 
    categories,
    types
  } = useData();
  
  const entity = activeEntities.find(e => e.entity_pk === entityPk);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [zonePk, setZonePk] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState<DomainCode>('RET');
  const [categoryPk, setCategoryPk] = useState('');
  const [typePk, setTypePk] = useState('');
  const [visibilityType, setVisibilityType] = useState<'Public' | 'Private/Home'>('Public');
  
  // Error states
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [zonePkError, setZonePkError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with entity data
  useEffect(() => {
    if (entity) {
      setName(entity.entity_name);
      setPhone(entity.phone || '');
      setZonePk(entity.zone_pk);
      setPrimaryDomain(entity.primary_domain);
      setCategoryPk(entity.category_pk);
      setVisibilityType(entity.visibility_type);
    }
  }, [entity]);

  if (!entity) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-surface-900 mb-2">Entity Not Found</h3>
          <Button onClick={() => navigate('/entity-registry')}>
            Back to Registry
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const nameValidation = validateRequired(name, 'Entity Name');
    const phoneErr = validatePhone(phone);
    const zonePkValidation = validateRequired(zonePk, 'Zone PK');
    
    setNameError(nameValidation.isValid ? null : nameValidation.error || 'Invalid name');
    setPhoneError(phoneErr);
    setZonePkError(zonePkValidation.isValid ? null : zonePkValidation.error || 'Invalid zone');
    
    if (!nameValidation.isValid || phoneErr || !zonePkValidation.isValid) return;
    
    // Find zone details
    const zone = zoneRefs.find(z => z.zone_pk === zonePk);
    if (!zone) {
      setZonePkError('Invalid zone PK');
      return;
    }

    // Find category details
    const category = categories.find(c => c.pk === categoryPk);
    
    setIsSubmitting(true);
    try {
      const updatedEntity: ActiveEntity = {
        ...entity,
        entity_name: name,
        phone,
        zone_pk: zonePk,
        stateId: zone.stateId,
        districtId: zone.districtId,
        talukId: zone.talukId,
        cityVillageId: zone.cityVillageId,
        areaId: zone.areaId,
        streetId: zone.streetId,
        substreetId: zone.substreetId,
        primary_domain: primaryDomain,
        category_pk: categoryPk,
        category_name: category?.name || entity.category_name,
        visibility_type: visibilityType,
        updatedAt: new Date().toISOString(),
      };
      
      await updateEntity(updatedEntity);
      navigate(`/entity-registry/${entity.entity_pk}`);
    } catch (error) {
      console.error('Failed to update entity:', error);
      setNameError('Failed to update entity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.domainCode === primaryDomain && c.status === 'active'
  );

  const filteredTypes = types.filter(t => 
    t.categoryPk === categoryPk && t.status === 'active'
  );

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/entity-registry/${entity.entity_pk}`)}
            className="px-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-surface-900">Edit Entity</h1>
            <p className="text-sm text-surface-500">{entity.entity_pk}</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Entity Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={nameError}
              required
            />

            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={phoneError}
              placeholder="10-digit number"
              required
            />

            <Select
              label="Zone PK"
              value={zonePk}
              onChange={(e) => setZonePk(e.target.value)}
              error={zonePkError}
              required
            >
              <option value="">Select zone...</option>
              {zoneRefs.map(zone => (
                <option key={zone.zone_pk} value={zone.zone_pk}>
                  {zone.zone_pk} - {zone.fullAddress}
                </option>
              ))}
            </Select>

            <Select
              label="Primary Domain"
              value={primaryDomain}
              onChange={(e) => {
                setPrimaryDomain(e.target.value as DomainCode);
                setCategoryPk(''); // Reset category when domain changes
              }}
              required
            >
              {domains.filter(d => d.status === 'active').map(domain => (
                <option key={domain.code} value={domain.code}>
                  {domain.code} - {domain.name}
                </option>
              ))}
            </Select>

            <Select
              label="Category"
              value={categoryPk}
              onChange={(e) => {
                setCategoryPk(e.target.value);
                setTypePk(''); // Reset type when category changes
              }}
              required
            >
              <option value="">Select category...</option>
              {filteredCategories.map(cat => (
                <option key={cat.pk} value={cat.pk}>
                  {cat.pk} - {cat.name}
                </option>
              ))}
            </Select>

            {filteredTypes.length > 0 && (
              <Select
                label="Type (Optional)"
                value={typePk}
                onChange={(e) => setTypePk(e.target.value)}
              >
                <option value="">Select type (optional)...</option>
                {filteredTypes.map(type => (
                  <option key={type.pk} value={type.pk}>
                    {type.name}
                  </option>
                ))}
              </Select>
            )}

            <Select
              label="Visibility Type"
              value={visibilityType}
              onChange={(e) => setVisibilityType(e.target.value as 'Public' | 'Private/Home')}
              required
            >
              <option value="Public">Public</option>
              <option value="Private/Home">Private/Home</option>
            </Select>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
          onClick={() => navigate(`/entity-registry/${entity.entity_pk}`)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                <Save size={16} className="mr-1" />
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
