import { z } from 'zod';

// Zod validation schemas
export const loginSchema = z.object({
  email: z
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long'),
});

export const registerSchema = z.object({
  email: z
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
    .max(254, 'Email address is too long')
    .refine(
      (email) => {
        // Check for common disposable email domains
        const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'yopmail.com'];
        const domain = email.split('@')[1]?.toLowerCase();
        return !disposableDomains.includes(domain);
      },
      'Please use a valid email address'
    ),
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters long')
    .max(100, 'Full name is too long')
    .refine(
      (name) => {
        // Check that name contains at least one letter and isn't just whitespace/numbers
        return /[a-zA-Z]/.test(name) && name.trim().length >= 2;
      },
      'Please enter a valid full name'
    )
    .refine(
      (name) => {
        // Check for reasonable name format (no excessive special characters)
        const cleanName = name.trim();
        const specialCharCount = (cleanName.match(/[^a-zA-Z\s'-]/g) || []).length;
        return specialCharCount <= 2; // Allow some special chars like apostrophes and hyphens
      },
      'Full name contains invalid characters'
    ),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password is too long')
    .refine(
      (password) => {
        // Check for at least one lowercase letter
        return /[a-z]/.test(password);
      },
      'Password must contain at least one lowercase letter'
    )
    .refine(
      (password) => {
        // Check for at least one uppercase letter
        return /[A-Z]/.test(password);
      },
      'Password must contain at least one uppercase letter'
    )
    .refine(
      (password) => {
        // Check for at least one number
        return /\d/.test(password);
      },
      'Password must contain at least one number'
    )
    .refine(
      (password) => {
        // Check for common weak passwords
        const commonPasswords = ['password', '12345678', 'qwerty123', 'abc123456'];
        return !commonPasswords.includes(password.toLowerCase());
      },
      'Password is too common, please choose a stronger password'
    ),
});

// Form data interfaces (inferred from Zod schemas)
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Authentication response interfaces
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  success: boolean;
  message: string;
}

// Server action result interface
export interface AuthResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  user?: AuthUser;
}

// OAuth callback parameters
export interface OAuthCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

// Form validation error interface
export interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  general?: string;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  isSubmitting: boolean;
}