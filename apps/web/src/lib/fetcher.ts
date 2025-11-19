import { getAuthTokens } from "./auth";
import { refreshTokens } from "@/app/(auth)/actions";
import { redirect } from "next/navigation";

export const fetcher = async (url: string, options: RequestInit = {}) => {
  try {
    const tokens = await getAuthTokens();

    // Log if tokens are missing (for debugging)
    if (!tokens?.accessToken && !tokens?.refreshToken) {
      console.warn('[Fetcher] No auth tokens found. Request will proceed without authentication.');
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (tokens?.accessToken) {
      headers["Authorization"] = `Bearer ${tokens.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // If unauthorized and we have a refresh token, try to refresh and retry
    if (response.status === 401 && tokens?.refreshToken) {
      console.log('[Fetcher] Received 401, attempting token refresh...');

      const newTokens = await refreshTokens();

      if (newTokens) {
        console.log('[Fetcher] Token refresh successful, retrying request...');
        // Retry the request with new token
        headers["Authorization"] = `Bearer ${newTokens.accessToken}`;

        response = await fetch(url, {
          ...options,
          headers,
        });
      } else {
        console.error('[Fetcher] Token refresh failed');
      }
    }

    if (response.status === 401) {
      console.error('[Fetcher] Request unauthorized after refresh attempt');
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      // Try to get error details from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        // If there are field errors, include them in the error
        if (errorData.fieldErrors) {
          const error = new Error(errorMessage);
          (error as any).fieldErrors = errorData.fieldErrors;
          throw error;
        }
      } catch (jsonError) {
        // If we can't parse the error response, use the default message
        console.warn('[Fetcher] Could not parse error response:', jsonError);
      }
      console.error(`[Fetcher] Request failed: ${errorMessage} (${url})`);
      throw new Error(errorMessage);
    }

    // Check if response has content before trying to parse JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('[Fetcher] Response is not JSON, returning empty object');
      return {};
    }

    const data = await response.json();

    // Log if we got empty data with valid tokens (might indicate backend issue)
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      console.warn('[Fetcher] Received empty response from backend:', url);
    }

    return data;
  } catch (error) {
    // Re-throw known errors (like Unauthorized, HTTP errors)
    if (error instanceof Error) {
      // If it's an Unauthorized error, log additional context
      if (error.message === "Unauthorized") {
        console.error('[Fetcher] Unauthorized error - user may need to log in again');
      }
      throw error;
    }

    // Handle network errors and other unknown errors
    console.error('[Fetcher] Network error:', error);
    throw new Error("Network error. Please check your connection and try again.");
  }
};


export function handleServerError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "Unauthorized") redirect("/login");
    return { success: false, error: error.message };
  }

  return { success: false, error: "An unexpected error occurred" };
}
