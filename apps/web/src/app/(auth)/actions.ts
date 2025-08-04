'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AuthResult, loginSchema, registerSchema } from './types';

const BACKEND_URL = process.env.BACKEND_BASE_URL

/**
 * Sets secure, httpOnly cookies for authentication tokens with enhanced security.
 */
async function setAuthCookies(accessToken: string, refreshToken: string, user?: any): Promise<void> {
  const cookieStore = await cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };

  // Set access token with shorter expiration
  cookieStore.set('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  // Set refresh token with longer expiration
  cookieStore.set('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });

  // Store user data in a separate cookie (can be non-httpOnly for client access)
  if (user) {
    cookieStore.set('userData', JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    }), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      // Note: Not httpOnly so client can read user data
    });
  }
}


/**
 * Server action for user login
 * Processes form data and authenticates user with backend
 */
export async function loginAction(formData: FormData): Promise<AuthResult> {
  try {
    const email = formData.get('email')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    // Validate using Zod schema
    const validationResult = loginSchema.safeParse({ email, password });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });

      return { success: false, error: 'Please check your input', fieldErrors };
    }

    // Call backend login endpoint
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle different error types
      if (response.status === 401) return { success: false, error: 'Invalid email or password' };

      if (response.status === 400 && data.message) {
        // Handle validation errors from backend
        const fieldErrors: Record<string, string> = {};
        if (Array.isArray(data.message)) {
          data.message.forEach((msg: string) => {
            if (msg.includes('email')) fieldErrors.email = msg;
            if (msg.includes('password')) fieldErrors.password = msg;
          });
        }

        return { success: false, error: 'Please check your input', fieldErrors };
      }
      return { success: false, error: data.message || 'Login failed. Please try again.' };
    }
    await setAuthCookies(data.accessToken, data.refreshToken, data.user);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.'
    };
  }
}


/**
 * Server action for user registration
 * Processes form data and creates new user account
 */
export async function registerAction(formData: FormData): Promise<AuthResult> {
  try {
    const email = formData.get('email')?.toString() || '';
    const fullName = formData.get('fullName')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    const validationResult = registerSchema.safeParse({ email, fullName, password });
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      });
      return { success: false, error: 'Please check your input', fieldErrors };
    }

    const response = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, fullName, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle different error types
      if (response.status === 409) {
        return {
          success: false,
          fieldErrors: {
            email: 'An account with this email already exists'
          }
        };
      }

      if (response.status === 400 && data.message) {
        // Handle validation errors from backend
        const fieldErrors: Record<string, string> = {};
        if (Array.isArray(data.message)) {
          data.message.forEach((msg: string) => {
            if (msg.includes('email')) fieldErrors.email = msg;
            if (msg.includes('password')) fieldErrors.password = msg;
            if (msg.includes('fullName')) fieldErrors.fullName = msg;
          });
        }
        return { success: false, error: 'Please check your input', fieldErrors };
      }
      return { success: false, error: data.message || 'Registration failed. Please try again.' };
    }

    await setAuthCookies(data.accessToken, data.refreshToken, data.user);
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Network error. Please check your connection and try again.' };
  }
}


/**
 * Server action for OAuth callback handling
 * Processes OAuth callback tokens and sets authentication cookies
 */
export async function handleOAuthCallback(accessToken: string | null, refreshToken: string | null, error: string | null, redirectUrl?: string, user?: any): Promise<void> {
  const finalRedirectUrl = redirectUrl || '/dashboard';

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error);
    redirect(`/login?error=oauth_failed${redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''}`);
  }

  // Validate required tokens
  if (!accessToken || !refreshToken) {
    console.error('Missing tokens in OAuth callback');
    redirect(`/login?error=oauth_incomplete${redirectUrl ? `&redirect=${encodeURIComponent(redirectUrl)}` : ''}`);
  }

  await setAuthCookies(accessToken, refreshToken, user);
  redirect(finalRedirectUrl);
}


/**
 * Get Google OAuth URL for client-side redirect
 * Returns the backend OAuth URL for client-side navigation
 */
export async function getGoogleOAuthUrl(redirectUrl?: string) {
  const baseUrl = `${BACKEND_URL}/auth/google`;
  if (redirectUrl) {
    const url = new URL(baseUrl);
    url.searchParams.set('redirect', redirectUrl);
    return url.toString();
  }
  return baseUrl;
}

/**
 * Refreshes the access token using the refresh token
 * Returns new tokens or null if refresh fails
 */
export async function refreshTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      console.error('No refresh token available');
      return null;
    }

    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error('Token refresh failed:', response.status);
      // Clear invalid tokens
      await clearAuthCookies();
      return null;
    }

    const data = await response.json();

    // Set new tokens
    await setAuthCookies(data.accessToken, data.refreshToken);

    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    await clearAuthCookies();
    return null;
  }
}

/**
 * Clears authentication cookies securely
 */
async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0, // Expire immediately
    ...(isProduction && { domain: process.env.COOKIE_DOMAIN }),
  };

  const userCookieOptions = {
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0, // Expire immediately
    ...(isProduction && { domain: process.env.COOKIE_DOMAIN }),
  };

  cookieStore.set('accessToken', '', cookieOptions);
  cookieStore.set('refreshToken', '', cookieOptions);
  cookieStore.set('userData', '', userCookieOptions);
}

/**
 * Server action for user logout
 * Clears authentication cookies and optionally calls backend logout
 */
export async function logoutAction(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    // Call backend logout endpoint if refresh token exists
    if (refreshToken) {
      try {
        await fetch(`${BACKEND_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Backend logout error:', error);
      }
    }
    await clearAuthCookies();
  } catch (error) {
    console.error('Logout error:', error);
    await clearAuthCookies();
  }
  redirect('/login');
}