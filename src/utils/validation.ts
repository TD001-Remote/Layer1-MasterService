// Form validation utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateRequired = (value: string, fieldName: string = 'This field'): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

export const validatePhone = (phone: string): string | null => {
  if (!phone) {
    return 'Phone number is required';
  }
  
  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '');
  
  // Check if it's a valid 10-digit number
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(cleaned)) {
    return 'Invalid phone number (10 digits, starting with 6-9)';
  }
  
  return null;
};

export const validateZonePk = (zonePk: string): ValidationResult => {
  if (!zonePk) {
    return { isValid: false, error: 'Zone PK is required' };
  }
  
  // Zone PK format: LL-DD-TT-VVV (e.g., TN-01-02-003)
  const zonePkRegex = /^[A-Z]{2}-\d{2}-\d{2}-\d{3}$/;
  if (!zonePkRegex.test(zonePk)) {
    return { isValid: false, error: 'Invalid Zone PK format (e.g., TN-01-02-003)' };
  }
  
  return { isValid: true };
};

export const validateDomainCode = (code: string): ValidationResult => {
  if (!code) {
    return { isValid: false, error: 'Domain code is required' };
  }
  
  // Domain code: 2-digit number
  const codeRegex = /^\d{2}$/;
  if (!codeRegex.test(code)) {
    return { isValid: false, error: 'Invalid domain code (2 digits required)' };
  }
  
  return { isValid: true };
};

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email address';
  }
  
  return null;
};

export const validateUrl = (url: string): ValidationResult => {
  if (!url) {
    return { isValid: true }; // URL is optional
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

export const validatePositiveNumber = (value: string | number, fieldName: string = 'Value'): ValidationResult => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: `${fieldName} must be a positive number` };
  }
  
  return { isValid: true };
};

const MIN_PASSWORD_LENGTH = 6;

export const validatePassword = (value: string): string | null => {
  if (!value || value.trim() === '') {
    return 'Password is required';
  }
  
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  
  return null;
};

export const validateSubdomain = (subdomain: string, existingSubdomains: string[] = []): string | null => {
  if (!subdomain || subdomain.trim() === '') {
    return 'Subdomain is required';
  }
  
  // Check format: only lowercase letters, numbers, and hyphens
  const subdomainRegex = /^[a-z0-9-]+$/;
  if (!subdomainRegex.test(subdomain)) {
    return 'Subdomain can only contain lowercase letters, numbers, and hyphens';
  }
  
  // Check if subdomain already exists
  if (existingSubdomains.includes(subdomain)) {
    return 'This subdomain is already taken';
  }
  
  // Check length (3-63 characters is DNS standard)
  if (subdomain.length < 3 || subdomain.length > 63) {
    return 'Subdomain must be between 3 and 63 characters';
  }
  
  return null;
};
