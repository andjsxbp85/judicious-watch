import ENDPOINTS from "@/constants/endpoint";
import type { TokenResponse, LoginInput, BackendUser } from "@/types/authTypes";

export interface AuthResult {
  user: BackendUser;
  access_token: string;
}

export const authService = {
  /**
   * Login with username and password
   * Calls the FastAPI backend OAuth2 password flow
   */
  async login({ username, password }: LoginInput): Promise<AuthResult> {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);
    form.append("grant_type", "password");

    const res = await fetch(ENDPOINTS.AUTH_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include", // Important for cookies
      body: form.toString(),
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ detail: "Login failed" }));
      console.error("LOGIN ERROR:", errorData);
      throw new Error(errorData.detail || "Invalid username or password");
    }

    const token: TokenResponse = await res.json();

    // Since backend doesn't have /me endpoint, we decode user info from token
    // or construct it from the login response
    // For now, we'll create a basic user object
    const user: BackendUser = {
      id: username,
      username,
      email: "", // Not provided by backend
      full_name: username, // Default to username
      is_admin: true, // Will be determined by backend in production
      is_active: true,
    };

    return {
      user,
      access_token: token.access_token,
    };
  },

  /**
   * Logout - clears local state only (no backend endpoint)
   */
  logout(): void {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("access_token");
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): BackendUser | null {
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem("access_token");
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getStoredUser();
  },

  /**
   * Store user and token after login
   */
  storeAuth(user: BackendUser, token: string): void {
    localStorage.setItem("auth_user", JSON.stringify(user));
    localStorage.setItem("access_token", token);
  },
};
