/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Button, Input, Select, Card } from '../../components/ui';
import { validateRequired, validatePhone } from '../../utils/validation';
import { NonEntity } from '../../types';
import { getAllNonEntityDomains, getNonEntityCategoryById } from '../../data/domains';

export default function NonEntityEdit() {
  const { nonEntityPk } = useParams<{ nonEntityPk: string }>();
  const navigate = useNavigate();
  const { 
    nonEntities, 
    updateNonEntity,
    zoneRefs
  } = useData();
  
  const nonEntity = nonEntities.find(e => e.non_entity_pk === nonEntityPk);
  
  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [zonePk, setZonePk] = useState('');
  const [primaryDomain, setPrimaryDomain] = useState('');
  const [categoryPk, setCategoryPk] = useState('');
  const [typePk, setTypePk] = useState('');
  const [visibilityType, setVisibilityType] = useState<'Public' | 'Private/Home'>('Public');
  
  // Error states
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with entity data
  useEffect(() => {
    if (nonEntity) {
      setName(nonEntity.non_entity_name);
      setPhone(nonEntity.phone || '');
      setZonePk(nonEntity.zone_pk || '');
      setPrimaryDomain(nonEntity.primary_domain);
      setCategoryPk(nonEntity.category_pk);
      setVisibilityType(nonEntity.visibility_type);
    }
  }, [nonEntity]);

  if (!nonEntity) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Non-Entity Not Found</h3>
<Button onClick={() => navigate('/non-entity-registry')}>
             Back to Registry
           </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const nameValidation = validateRequired(name, 'Non-Entity Name');
    const phoneErr = validatePhone(phone);
    
    setNameError(nameValidation.isValid ? null : nameValidation.error || 'Invalid name');
    setPhoneError(phoneErr);
    
    if (!nameValidation.isValid || phoneErr) return;

    // Find category details
    const categoryInfo = getNonEntityCategoryById(categoryPk);

    setIsSubmitting(true);
    try {
      const updatedNonEntity: NonEntity = {
        ...nonEntity,
        non_entity_name: name,
        phone,
        zone_pk: zonePk || undefined,
        primary_domain: primaryDomain,
        category_pk: categoryPk,
        category_name: categoryInfo?.category.name || nonEntity.category_name,
        type_pk: typePk || undefined,
        visibility_type: visibilityType,
        updatedAt: new Date().toISOString(),
      };
      
      await updateNonEntity(updatedNonEntity);
      navigate(`/non-entity-registry/${nonEntity.non_entity_pk}`);
    } catch (error) {
      console.error('Failed to update non-entity:', error);
      setNameError('Failed to update non-entity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const domains = getAllNonEntityDomains();
  const selectedDomain = domains.find(d => d.code === primaryDomain);
  const filteredCategories = selectedDomain ? selectedDomain.categories : [];

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(`/non-entity-registry/${nonEntity.non_entity_pk}`)}
            className="px-2"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Non-Entity</h1>
            <p className="text-sm text-gray-500 font-mono">{nonEntity.non_entity_pk}</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Non-Entity Name"
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
            />

            <Select
              label="Zone PK (Optional)"
              value={zonePk}
              onChange={(e) => setZonePk(e.target.value)}
            >
              <option value="">No specific zone (area-level asset)</option>
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
                setPrimaryDomain(e.target.value);
                setCategoryPk('');
                setTypePk('');
              }}
              required
            >
              <option value="">Select domain...</option>
              {domains.map(domain => (
                <option key={domain.code} value={domain.code}>
                  {domain.code} - {domain.name}
                </option>
              ))}
            </Select>

            {filteredCategories.length > 0 && (
              <Select
                label="Category"
                value={categoryPk}
                onChange={(e) => {
                  setCategoryPk(e.target.value);
                  setTypePk('');
                }}
                required
              >
                <option value="">Select category...</option>
                {filteredCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.id} - {cat.name}
                  </option>
                ))}
              </Select>
            )}

            <Input
              label="Type (Optional - for sub-branching)"
              value={typePk}
              onChange={(e) => setTypePk(e.target.value)}
              placeholder="e.g., Type-A (optional)"
            />

            <Select
              label="Visibility Type"
              value={visibilityType}
              onChange={(e) => setVisibilityType(e.target.value as 'Public' | 'Private/Home')}
            >
              <option value="Public">Public</option>
              <option value="Private/Home">Private/Home</option>
            </Select>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/non-entity-registry/${nonEntity.non_entity_pk}`)}
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