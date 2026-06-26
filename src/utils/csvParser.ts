/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PendingEntity } from '../types';

export interface CSVParseResult {
  records: PendingEntity[];
  errors: string[];
}

export function parseCSV(content: string): CSVParseResult {
  const errors: string[] = [];
  const records: PendingEntity[] = [];
  
  try {
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      errors.push('CSV file must contain at least a header row and one data row');
      return { records, errors };
    }
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Validate required headers
    const requiredHeaders = ['entity_name', 'record_type', 'primary_domain', 'category_pk', 'visibility_type'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
      return { records, errors };
    }
    
    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = parseCSVLine(line);
      
      if (values.length !== headers.length) {
        errors.push(`Row ${i + 1}: Column count mismatch (expected ${headers.length}, got ${values.length})`);
        continue;
      }
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      const recordType = row.record_type?.toLowerCase();
      if (recordType !== 'entity' && recordType !== 'non-entity') {
        errors.push(`Row ${i + 1}: Invalid record_type "${row.record_type}". Must be "entity" or "non-entity"`);
        continue;
      }
      
      // Create pending entity
      const entity: PendingEntity = {
        id: `PENDING-${Date.now()}-${i}`,
        entity_name: row.entity_name || '',
        record_type: recordType as 'entity' | 'non-entity',
        target_zone_pk: row.target_zone_pk || undefined,
        stateId: row.stateId || row.state_id || '',
        districtId: row.districtId || row.district_id || '',
        talukId: row.talukId || row.taluk_id || '',
        cityVillageId: row.cityVillageId || row.city_village_id || undefined,
        areaId: row.areaId || row.area_id || undefined,
        streetId: row.streetId || row.street_id || undefined,
        substreetId: row.substreetId || row.substreet_id || null,
        primary_domain: row.primary_domain || '',
        category_pk: row.category_pk || '',
        category_name: row.category_name || '',
        type_pk: row.type_pk || undefined,
        phone: row.phone || undefined,
        visibility_type: (row.visibility_type as 'Public' | 'Private/Home') || 'Public',
        website_zone_entity_id: row.website_zone_entity_id || null,
        validationErrors: [],
        validationWarnings: [],
        status: 'pending',
        reportedBy: 'CSV Upload',
        surveyDate: new Date().toISOString().split('T')[0],
      };
      
      records.push(entity);
    }
    
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return { records, errors };
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values.map(v => v.replace(/^"|"$/g, ''));
}

export function downloadCSVTemplate(): void {
  const headers = [
    'entity_name',
    'record_type',
    'primary_domain',
    'category_pk',
    'category_name',
    'type_pk',
    'phone',
    'visibility_type',
    'stateId',
    'districtId',
    'talukId',
    'cityVillageId',
    'areaId',
    'streetId',
    'target_zone_pk',
    'website_zone_entity_id'
  ];
  
  const exampleRows = [
    // Entity example - requires full zone
    [
      'Example Hospital',
      'entity',
      'MED',
      'CAT-MED-101',
      'Government Taluk Hospital',
      '',
      '+91 4364 270414',
      'Public',
      'GEO-TN',
      'GEO-TN-MAY',
      'GEO-TN-MAY-SIR',
      'ZON-CITY-001',
      'ZON-AREA-001',
      'ZON-STR-001',
      'ZON-TN-MAY-SIR-CITY1-AREA1-STR1',
      ''
    ],
    // Non-entity example - only GEO required, zone optional
    [
      'Heritage Festival Route',
      'non-entity',
      'TOU',
      'CAT-TOU-722',
      'Spiritual Events',
      '',
      '',
      'Public',
      'GEO-TN',
      'GEO-TN-MAY',
      'GEO-TN-MAY-SIR',
      '',
      '',
      '',
      '',
      ''
    ]
  ];
  
  const csvContent = [
    headers.join(','),
    ...exampleRows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'registry_upload_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
