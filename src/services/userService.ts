import { APP_BASE_URL_API } from "@/constants/env";

export interface User {
  id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface UserCreateInput {
  full_name: string;
  email: string;
  password: string;
  is_active: boolean;
  is_admin: boolean;
}

export interface UserUpdateInput {
  full_name?: string;
  email?: string;
  password?: string;
  is_active?: boolean;
  is_admin?: boolean;
}

class UserService {
  private getAuthHeader(): HeadersInit {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${APP_BASE_URL_API}/api/users`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  }

  async getUserById(userId: string): Promise<User> {
    const response = await fetch(`${APP_BASE_URL_API}/api/users/${userId}`, {
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }

    return response.json();
  }

  async createUser(user: UserCreateInput): Promise<User> {
    const response = await fetch(`${APP_BASE_URL_API}/api/users`, {
      method: "POST",
      headers: this.getAuthHeader(),
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to create user");
    }

    return response.json();
  }

  async updateUser(userId: string, user: UserUpdateInput): Promise<User> {
    const response = await fetch(`${APP_BASE_URL_API}/api/users/${userId}`, {
      method: "PUT",
      headers: this.getAuthHeader(),
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to update user");
    }

    return response.json();
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${APP_BASE_URL_API}/api/users/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to delete user");
    }
  }

  async toggleAdminStatus(userId: string, isAdmin: boolean): Promise<User> {
    const response = await fetch(
      `${APP_BASE_URL_API}/api/users/${userId}/toggle-admin?is_admin=${isAdmin}`,
      {
        method: "PATCH",
        headers: this.getAuthHeader(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to toggle admin status");
    }

    return response.json();
  }
}

export const userService = new UserService();
