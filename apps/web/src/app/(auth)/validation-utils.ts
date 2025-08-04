import { registerSchema, loginSchema, RegisterFormData, LoginFormData } from './types';

/**
 * Validation utilities for authentication forms
 */

// Field validation function with detailed error handling
export function validateField(fieldName: string, value: string, formType: 'login' | 'register' = 'register'): string {
  try {
    const schema = formType === 'login' ? loginSchema : registerSchema;
    
    if (fieldName === 'email') {
      schema.shape.email.parse(value);
    } else if (fieldName === 'password') {
      schema.shape.password.parse(value);
    } else if (fieldName === 'fullName' && formType === 'register') {
      (schema as typeof registerSchema).shape.fullName.parse(value);
    }
    
    return '';
  } catch (error: any) {
    return error.issues?.[0]?.message || 'Invalid input';
  }
}

// Validate entire form and return field errors
export function validateForm(data: RegisterFormData | LoginFormData, formType: 'login' | 'register' = 'register'): Record<string, string> {
  const schema = formType === 'login' ? loginSchema : registerSchema;
  const result = schema.safeParse(data);
  
  if (result.success) return {};
  
  const fieldErrors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const field = issue.path[0] as string;
    if (!fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  });
  
  return fieldErrors;
}

// Check if email appears to be a disposable/temporary email
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com',
    'temp-mail.org',
    'throwaway.email'
  ];
  
  const domain = email.split('@')[1]?.toLowerCase();
  return disposableDomains.includes(domain);
}

// Password strength validation with detailed criteria
export interface PasswordStrengthResult {
  criteria: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
  score: number;
  strength: 'weak' | 'fair' | 'good' | 'strong';
  color: string;
  requiredScore: number;
  feedback: string[];
}

export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  // Calculate score based on required criteria (first 4) and bonus (special chars)
  const requiredCriteria = [criteria.length, criteria.uppercase, criteria.lowercase, criteria.number];
  const requiredScore = requiredCriteria.filter(Boolean).length;
  const bonusScore = criteria.special ? 1 : 0;
  const totalScore = requiredScore + bonusScore;
  
  let strength: 'weak' | 'fair' | 'good' | 'strong';
  let color: string;
  let feedback: string[] = [];
  
  // Strength based on meeting required criteria first
  if (requiredScore < 3) {
    strength = 'weak';
    color = 'text-destructive';
    feedback.push('Password is too weak');
  } else if (requiredScore === 3) {
    strength = 'fair';
    color = 'text-orange-500';
    feedback.push('Password could be stronger');
  } else if (requiredScore === 4 && !criteria.special) {
    strength = 'good';
    color = 'text-yellow-500';
    feedback.push('Add special characters for better security');
  } else {
    strength = 'strong';
    color = 'text-green-500';
    feedback.push('Strong password!');
  }

  // Add specific feedback for missing criteria
  if (!criteria.length) feedback.push('Use at least 8 characters');
  if (!criteria.uppercase) feedback.push('Add uppercase letters');
  if (!criteria.lowercase) feedback.push('Add lowercase letters');
  if (!criteria.number) feedback.push('Add numbers');

  return { criteria, score: totalScore, strength, color, requiredScore, feedback };
}

// Check for common weak passwords
export function isCommonPassword(password: string): boolean {
  const commonPasswords = [
    'password', '12345678', 'qwerty123', 'abc123456', 'password123',
    'admin123', 'letmein', 'welcome123', 'monkey123', 'dragon123'
  ];
  
  return commonPasswords.includes(password.toLowerCase());
}

// Validate email format with additional checks
export function validateEmailFormat(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  // Basic email regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Check for disposable email
  if (isDisposableEmail(email)) {
    return { isValid: false, error: 'Please use a valid email address' };
  }

  // Check email length
  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true };
}

// Validate full name with additional checks
export function validateFullName(name: string): { isValid: boolean; error?: string } {
  if (!name || !name.trim()) {
    return { isValid: false, error: 'Full name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters long' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: 'Full name is too long' };
  }

  // Check that name contains at least one letter
  if (!/[a-zA-Z]/.test(trimmedName)) {
    return { isValid: false, error: 'Please enter a valid full name' };
  }

  // Check for excessive special characters
  const specialCharCount = (trimmedName.match(/[^a-zA-Z\s'-]/g) || []).length;
  if (specialCharCount > 2) {
    return { isValid: false, error: 'Full name contains invalid characters' };
  }

  return { isValid: true };
}

// Debounce utility for validation
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Form validation state management
export interface ValidationState {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isValidating: boolean;
}

export function createInitialValidationState(): ValidationState {
  return {
    errors: {},
    touched: {},
    isValid: false,
    isValidating: false
  };
}

// Update validation state helper
export function updateValidationState(
  currentState: ValidationState,
  updates: Partial<ValidationState>
): ValidationState {
  return {
    ...currentState,
    ...updates
  };
}