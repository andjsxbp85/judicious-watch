import ENDPOINTS from "@/constants/endpoint";
import { mockUsers } from "@/lib/mockData";
import type { TokenResponse, LoginInput, BackendUser } from "@/types/authTypes";

export interface AuthResult {
  user: BackendUser;
  access_token: string;
}

// Mock users credentials (username = password for demo)
const MOCK_CREDENTIALS: Record<string, { password: string; isAdmin: boolean }> =
  {
    admin: { password: "admin", isAdmin: true },
    ahmad_verifikator: { password: "ahmad_verifikator", isAdmin: false },
    budi_verifikator: { password: "budi_verifikator", isAdmin: false },
    citra_verifikator: { password: "citra_verifikator", isAdmin: false },
  };

export const authService = {
  /**
   * Try mock login first, then fall back to backend
   */
  async login({ username, password }: LoginInput): Promise<AuthResult> {
    // First, try mock login
    const mockResult = this.tryMockLogin(username, password);
    if (mockResult) {
      console.log("Mock login successful for:", username);
      return mockResult;
    }

    // If mock login fails, try backend
    console.log("Trying backend login for:", username);
    return this.backendLogin({ username, password });
  },

  /**
   * Try to authenticate with mock credentials
   */
  tryMockLogin(username: string, password: string): AuthResult | null {
    const mockCred = MOCK_CREDENTIALS[username];

    if (mockCred && mockCred.password === password) {
      const mockUser = mockUsers.find((u) => u.username === username);

      const user: BackendUser = {
        id: mockUser?.id || username,
        username,
        email: `${username}@mock.local`,
        full_name: mockUser?.username || username,
        is_admin: mockCred.isAdmin,
        is_active: true,
      };

      return {
        user,
        access_token: `mock_token_${username}_${Date.now()}`,
      };
    }

    return null;
  },

  /**
   * Login with backend OAuth2 password flow
   */
  async backendLogin({ username, password }: LoginInput): Promise<AuthResult> {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);
    form.append("grant_type", "password");

    const res = await fetch(ENDPOINTS.AUTH_LOGIN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      credentials: "include",
      body: form.toString(),
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ detail: "Login failed" }));
      console.error("BACKEND LOGIN ERROR:", errorData);
      throw new Error(errorData.detail || "Invalid username or password");
    }

    const token: TokenResponse = await res.json();

    const user: BackendUser = {
      id: username,
      username,
      email: "",
      full_name: username,
      is_admin: true,
      is_active: true,
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
