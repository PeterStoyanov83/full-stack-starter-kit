// User management API for admin operations

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  email_verified_at?: string;
  tools_count?: number;
}

export interface UserFormData {
  name: string;
  email: string;
  role: string;
  password?: string;
}

export interface SystemStats {
  total_users: number;
  active_users: number;
  total_tools: number;
  active_tools: number;
  tools_this_month: number;
  categories_count: number;
  tags_count: number;
}

export interface UsersListResponse {
  data: User[];
  total: number;
}

export class UsersAPI {
  private static getAuthHeaders(token: string): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  static async getUsers(token: string): Promise<UsersListResponse> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на потребителите');
    }

    return response.json();
  }

  static async createUser(token: string, userData: UserFormData): Promise<{ message: string; user: User }> {
    console.log('Creating user with data:', userData);

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(userData),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error response:', errorData);

      // If it's a validation error, show specific field errors
      if (response.status === 422 && errorData.errors) {
        const errorMessages = Object.values(errorData.errors).flat().join(', ');
        throw new Error(`Грешка при валидация: ${errorMessages}`);
      }

      throw new Error(errorData.message || 'Грешка при създаване на потребител');
    }

    const result = await response.json();
    console.log('Success response:', result);
    return result;
  }

  static async updateUser(token: string, userId: number, userData: Partial<UserFormData>): Promise<{ message: string; user: User }> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при обновяване на потребител');
    }

    return response.json();
  }

  static async deleteUser(token: string, userId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при изтриване на потребител');
    }

    return response.json();
  }

  static async getSystemStats(token: string): Promise<SystemStats> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на статистики');
    }

    return response.json();
  }
}