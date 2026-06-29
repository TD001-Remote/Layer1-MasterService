export type AdminModuleKey =
  | 'dashboard'
  | 'staging'
  | 'entity-zone-assign'
  | 'entity-manage'
  | 'non-entity-zone-assign'
  | 'non-entity-manage'
  | 'dct-entity'
  | 'dct-non-entity'
  | 'geography'
  | 'site-zone-assign'
  | 'data-upload';

export type ModuleCategory = 'core' | 'entity' | 'nonentity' | 'dct' | 'geo' | 'site' | 'upload';
export interface AdminModuleOption {
  key: AdminModuleKey;
  label: string;
  description: string;
  category: ModuleCategory;
}

export const ADMIN_MODULES: AdminModuleOption[] = [
  { key: 'staging', label: 'Data Staging', description: 'Review and approve CSV uploads', category: 'core' },
  { key: 'entity-zone-assign', label: 'Entity Zone Assignment', description: 'Assign geo zones to new entities', category: 'entity' },
  { key: 'entity-manage', label: 'Entity Management', description: 'Edit, move, and manage entities', category: 'entity' },
  { key: 'non-entity-zone-assign', label: 'Non-Entity Zone Assignment', description: 'Assign geo zones to non-entities', category: 'nonentity' },
  { key: 'non-entity-manage', label: 'Non-Entity Management', description: 'Edit, move, and manage non-entities', category: 'nonentity' },
  { key: 'dct-entity', label: 'DCT Entity Classification', description: 'Manage entity domain/category/type', category: 'dct' },
  { key: 'dct-non-entity', label: 'DCT Non-Entity Classification', description: 'Manage non-entity domain/category/type', category: 'dct' },
  { key: 'geography', label: 'Geography Management', description: 'Manage states, districts, taluks, zones', category: 'geo' },
  { key: 'site-zone-assign', label: 'Site Zone Assignment', description: 'Assign zones and manage sites', category: 'site' },
  { key: 'data-upload', label: 'Data Upload (L1 to L2)', description: 'Upload approved records to next layer', category: 'upload' },
];

export const MASTER_ADMIN_MODULES: AdminModuleKey[] = [
  'dashboard',
  'staging',
  'entity-zone-assign',
  'entity-manage',
  'non-entity-zone-assign',
  'non-entity-manage',
  'dct-entity',
  'dct-non-entity',
  'geography',
  'site-zone-assign',
  'data-upload',
];

export const ROUTE_REQUIRED_MODULES: Record<string, AdminModuleKey> = {
  '/staging': 'staging',
  '/data-upload': 'data-upload',
  '/entity-assign': 'entity-zone-assign',
  '/entity-manage': 'entity-manage',
  '/entity-registry': 'entity-manage',
  '/non-entity-assign': 'non-entity-zone-assign',
  '/non-entity-manage': 'non-entity-manage',
  '/non-entity-registry': 'non-entity-manage',
  '/dct-entity': 'dct-entity',
  '/dct-non-entity': 'dct-non-entity',
  '/geography': 'geography',
  '/geography-old': 'geography',
  '/sites': 'site-zone-assign',
};
