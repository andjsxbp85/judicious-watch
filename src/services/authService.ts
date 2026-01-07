import ENDPOINTS from "@/constants/endpoint";
import type { TokenResponse, LoginInput, BackendUser } from "@/types/authTypes";

export interface AuthResult {
  user: BackendUser;
  access_token: string;
}

export const authService = {
  /**
   * Login with backend OAuth2 password flow
   * Uses mock login for admin/admin credentials
   */
  async login({ username, password }: LoginInput): Promise<AuthResult> {
    // Mock login for admin/admin
    if (username === "admin" && password === "admin") {
      console.log("Using mock login for admin user");
      return this.mockLogin();
    }

    console.log("Attempting backend login for:", username);
    return this.backendLogin({ username, password });
  },

  /**
   * Mock login - returns mock admin user without backend call
   */
  async mockLogin(): Promise<AuthResult> {
    const mockUser: BackendUser = {
      id: "999",
      username: "admin",
      email: "admin@admin.com",
      full_name: "Admin User",
      is_admin: true,
      is_active: true,
    };

    const mockToken = "mock-jwt-token-" + Date.now();

    return {
      user: mockUser,
      access_token: mockToken,
    };
  },

  /**
   * Login with backend OAuth2 password flow and fetch user info
   */
  async backendLogin({ username, password }: LoginInput): Promise<AuthResult> {
    // Step 1: Get access token
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    const loginRes = await fetch(ENDPOINTS.AUTH_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
      body: form.toString(),
    });

    if (!loginRes.ok) {
      const errorData = await loginRes
        .json()
        .catch(() => ({ detail: "Login failed" }));
      console.error("Backend login error:", errorData);
      throw new Error(errorData.detail || "Invalid email or password");
    }

    const token: TokenResponse = await loginRes.json();
    console.log("Login successful, token received");

    // Step 2: Fetch user info using the token
    const userRes = await fetch(ENDPOINTS.USERS_ME, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!userRes.ok) {
      const errorData = await userRes
        .json()
        .catch(() => ({ detail: "Failed to fetch user info" }));
      console.error("Failed to fetch user info:", errorData);
      throw new Error("Failed to fetch user information");
    }

    const userData = await userRes.json();
    console.log("User info fetched:", userData);

    const user: BackendUser = {
      id: userData.id,
      username: userData.email.split("@")[0], // Extract username from email
      email: userData.email,
      full_name: userData.full_name,
      is_admin: userData.is_admin,
      is_active: userData.is_active,
    };

    return {
      user,
      access_token: token.access_token,
    };
  },

  /**
   * Logout - clears local state only
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
