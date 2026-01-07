import { authService } from "@/services/authService";

/**
 * API client for making authenticated requests
 * Automatically includes the access token in the Authorization header
 */
export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = authService.getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add Authorization header if token exists
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 401) {
    // Clear auth data and redirect to login
    authService.logout();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `HTTP error ${response.status}`,
    }));
    throw new Error(error.detail || "API request failed");
  }

  return response.json();
}
