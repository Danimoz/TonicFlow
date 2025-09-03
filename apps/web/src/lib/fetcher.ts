import { getAuthTokens } from "./auth";
import { refreshTokens } from "@/app/(auth)/actions";
import { redirect } from "next/navigation";

export const fetcher = async (url: string, options: RequestInit = {}) => {
  try {
    const tokens = await getAuthTokens();

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
    if (response.status === 401 && (tokens?.refreshToken && !tokens?.accessToken)) {
      const newTokens = await refreshTokens();

      if (newTokens) {
        // Retry the request with new token
        headers["Authorization"] = `Bearer ${newTokens.accessToken}`;

        response = await fetch(url, {
          ...options,
          headers,
        });
      }
    }

    if (response.status === 401) {
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
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Re-throw known errors (like Unauthorized, HTTP errors)
    if (error instanceof Error) {
      throw error;
    }

    // Handle network errors and other unknown errors
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
