import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { validateRequired, validatePhone } from '../../utils/validation';
import { ActiveEntity, DomainCode } from '../../types';

export default function EntityCreate() {
  const navigate = useNavigate();
  const { 
    addEntity,
    zoneRefs, 
    domains, 
    categories,
    types
  } = useData();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [zonePk, setZonePk] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState<DomainCode>('RET');
  const [categoryPk, setCategoryPk] = useState('');
  const [typePk, setTypePk] = useState('');
  const [visibilityType, setVisibilityType] = useState<'Public' | 'Private/Home'>('Public');
  
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [zonePkError, setZonePkError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const nameValidation = validateRequired(name, 'Entity Name');
    const phoneErr = phone ? validatePhone(phone) : null;
    const zonePkValidation = validateRequired(zonePk, 'Zone PK');
    const categoryValidation = validateRequired(categoryPk, 'Category');
    
    setNameError(nameValidation.isValid ? null : nameValidation.error || 'Invalid name');
    setPhoneError(phoneErr);
    setZonePkError(zonePkValidation.isValid ? null : zonePkValidation.error || 'Invalid zone');
    setCategoryError(categoryValidation.isValid ? null : categoryValidation.error || 'Select a category');
    
    if (!nameValidation.isValid || phoneErr || !zonePkValidation.isValid || !categoryValidation.isValid) return;
    
    const zone = zoneRefs.find(z => z.zone_pk === zonePk);
    if (!zone) {
      setZonePkError('Invalid zone PK');
      return;
    }

    const category = categories.find(c => c.pk === categoryPk);
    if (!category) {
      setCategoryError('Invalid category');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const timestamp = Date.now();
      const newEntity: ActiveEntity = {
        entity_pk: `ENT-${String(timestamp).slice(-6)}`,
        entity_name: name,
        phone: phone || undefined,
        zone_pk: zonePk,
        stateId: zone.stateId,
        districtId: zone.districtId,
        talukId: zone.talukId,
        cityVillageId: zone.cityVillageId,
        areaId: zone.areaId,
        streetId: zone.streetId,
        substreetId: zone.substreetId,
        primary_domain: primaryDomain,
        secondary_domains: [],
        category_pk: categoryPk,
        category_name: category.name,
        visibility_type: visibilityType,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        website_zone_entity_id: null,
        roles: { isAssetProvider: false, isServiceProvider: true },
      };
      
      await addEntity(newEntity);
      navigate(`/entity-registry/${newEntity.entity_pk}`);
    } catch (error) {
      console.error('Failed to create entity:', error);
      setNameError('Failed to create entity. Please try again.');
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
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 bg-white p-5 rounded-xl border border-surface-200 shadow-md">
        <Button 
          variant="secondary"
          onClick={() => navigate('/entity-registry')}
          size="sm"
        >
          <ArrowLeft size={18} />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Create New Entity</h1>
          <p className="text-sm text-surface-500">Add a new entity to the registry</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Entity Name"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(null); }}
            error={nameError || undefined}
            placeholder="Enter entity name"
            required
          />

          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setPhoneError(null); }}
            error={phoneError || undefined}
            placeholder="+91 XXXXXXXXXX (optional)"
          />

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">
              Zone / Location <span className="text-red-500">*</span>
            </label>
            <select
              value={zonePk}
              onChange={(e) => { setZonePk(e.target.value); setZonePkError(null); }}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                zonePkError 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-surface-300 focus:border-brand-500 focus:ring-brand-200'
              }`}
              required
            >
              <option value="">Select zone...</option>
              {zoneRefs.map(zone => (
                <option key={zone.zone_pk} value={zone.zone_pk}>
                  {zone.fullAddress}
                </option>
              ))}
            </select>
            {zonePkError && (
              <p className="mt-1 text-xs text-red-600">{zonePkError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">
              Primary Domain <span className="text-red-500">*</span>
            </label>
            <select
              value={primaryDomain}
              onChange={(e) => {
                setPrimaryDomain(e.target.value as DomainCode);
                setCategoryPk('');
                setTypePk('');
              }}
              className="w-full px-4 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-200"
              required
            >
              {domains.filter(d => d.status === 'active').map(domain => (
                <option key={domain.code} value={domain.code}>
                  {domain.code} - {domain.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryPk}
              onChange={(e) => {
                setCategoryPk(e.target.value);
                setCategoryError(null);
                setTypePk('');
              }}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                categoryError 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-surface-300 focus:border-brand-500 focus:ring-brand-200'
              }`}
              required
            >
              <option value="">Select category...</option>
              {filteredCategories.map(cat => (
                <option key={cat.pk} value={cat.pk}>
                  {cat.name}
                </option>
              ))}
            </select>
            {categoryError && (
              <p className="mt-1 text-xs text-red-600">{categoryError}</p>
            )}
            {filteredCategories.length === 0 && (
              <p className="mt-1 text-xs text-surface-500">Select a domain first</p>
            )}
          </div>

          {filteredTypes.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-surface-700 mb-2">
                Type (Optional)
              </label>
              <select
                value={typePk}
                onChange={(e) => setTypePk(e.target.value)}
                className="w-full px-4 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-200"
              >
                <option value="">Select type (optional)...</option>
                {filteredTypes.map(type => (
                  <option key={type.pk} value={type.pk}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-surface-700 mb-2">
              Visibility Type <span className="text-red-500">*</span>
            </label>
            <select
              value={visibilityType}
              onChange={(e) => setVisibilityType(e.target.value as 'Public' | 'Private/Home')}
              className="w-full px-4 py-2.5 border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-200"
              required
            >
              <option value="Public">Public</option>
              <option value="Private/Home">Private/Home</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/entity-registry')}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} variant="primary">
              <Plus size={16} />
              Create Entity
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}