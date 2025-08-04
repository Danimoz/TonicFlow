import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Checks if the user is authenticated by verifying the presence of auth tokens
 * @returns Promise<boolean> - true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken');
    const refreshToken = cookieStore.get('refreshToken');

    // User is considered authenticated if they have both tokens
    return !!(accessToken?.value && refreshToken?.value);
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
}

/**
 * Requires authentication - redirects to login if not authenticated
 * Use this in pages that require authentication
 */
export async function requireAuth(): Promise<void> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/login');
  }
}

/**
 * Gets the current user's authentication tokens
 * @returns Promise<{accessToken: string | null, refreshToken: string | null}>
 */
export async function getAuthTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value || null;
    const refreshToken = cookieStore.get('refreshToken')?.value || null;

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error getting auth tokens:', error);
    return { accessToken: null, refreshToken: null };
  }
}

/**
 * Gets the current user's information from cookies
 */
export async function getCurrentUser(): Promise<any | null> {
  try {
    const cookieStore = await cookies();
    const userData = cookieStore.get('userData')?.value;

    if (!userData) return null;

    return JSON.parse(userData);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Gets initial auth state for the auth context (server-side)
 * This is called in the layout to provide initial auth state
 */
export async function getInitialAuthState(): Promise<{
  isAuthenticated: boolean;
  user: any | null;
}> {
  try {
    const authenticated = await isAuthenticated();
    const user = authenticated ? await getCurrentUser() : null;

    return {
      isAuthenticated: authenticated,
      user,
    };
  } catch (error) {
    console.error('Error getting initial auth state:', error);
    return {
      isAuthenticated: false,
      user: null,
    };
  }
}