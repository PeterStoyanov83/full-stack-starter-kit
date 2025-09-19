// Authentication utilities for Laravel API integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  role_display?: string;
  created_at?: string;
  updated_at?: string;
  email_verified_at?: string;
  is_active?: boolean;
  tools_count?: number;
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}

export interface DashboardResponse {
  greeting: string;
  user: User;
  current_time: string;
  permissions: Record<string, boolean>;
}

export class AuthAPI {
  private static getAuthHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при вход');
    }

    return response.json();
  }

  static async logout(token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Logout error');
    }

    return response.json();
  }

  static async getDashboard(token: string): Promise<DashboardResponse> {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на данни');
    }

    return response.json();
  }

  static async getCurrentUser(token: string): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на потребител');
    }

    return response.json();
  }
}

// Local storage utilities
export class AuthStorage {
  private static TOKEN_KEY = 'auth_token';
  private static USER_KEY = 'auth_user';

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static setUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  static getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  static clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  static isAuthenticated(): boolean {
    return this.getToken() !== null && this.getUser() !== null;
  }
}