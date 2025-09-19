// AI Tools API utilities for Laravel backend integration

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

export interface Tool {
  id: number;
  name: string;
  link: string;
  description: string;
  documentation?: string;
  usage_instructions?: string;
  examples?: string;
  images?: string[];
  category_id?: number;
  user_id: number;
  is_active: boolean;
  status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  approved_by?: number;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
  creator?: User;
  approver?: User;
  tags?: Tag[];
  recommended_users?: User[];
  // Rating and comments fields
  average_rating?: number;
  rating_count?: number;
  comment_count?: number;
  ratings_avg_rating?: number;
  ratings_count?: number;
  comments_count?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  tools_count?: number;
  active_tools_count?: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  tools_count?: number;
  active_tools_count?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at?: string;
  updated_at?: string;
  email_verified_at?: string;
  is_active?: boolean;
  tools_count?: number;
}

export interface ToolsResponse {
  data: Tool[];
  links: Record<string, unknown>;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
}

export interface ApprovalStats {
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  total_count: number;
  pending_today: number;
  approved_today: number;
}

export interface CreateToolData {
  name: string;
  link: string;
  description: string;
  documentation?: string;
  usage_instructions?: string;
  examples?: string;
  category_id?: number;
  images?: string[];
  tags?: number[];
  recommended_roles?: string[];
}

export interface ToolComment {
  id: number;
  tool_id: number;
  user_id: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  user: User;
  formatted_date?: string;
  truncated_comment?: string;
}

export interface ToolRating {
  id: number;
  tool_id: number;
  user_id: number;
  rating: number;
  created_at: string;
  updated_at: string;
  user: User;
  stars?: string;
}

export interface ToolRatingStats {
  average_rating: number;
  rating_count: number;
  rating_distribution: {
    [key: number]: number;
  };
  user_rating: number | null;
}

export interface CommentsResponse {
  data: ToolComment[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export class ToolsAPI {
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

  // Tools CRUD operations
  static async getTools(token: string, filters?: {
    search?: string;
    category_id?: number;
    tags?: number[];
    role?: string;
    user_id?: number;
    per_page?: number;
    page?: number;
  }): Promise<ToolsResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.role) params.append('role', filters.role);
    if (filters?.user_id) params.append('user_id', filters.user_id.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.tags?.length) {
      filters.tags.forEach(tag => params.append('tags[]', tag.toString()));
    }

    const url = `${API_BASE_URL}/tools${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на инструментите');
    }

    return response.json();
  }

  static async getTool(token: string, id: number): Promise<Tool> {
    const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на инструмента');
    }

    return response.json();
  }

  static async createTool(token: string, data: CreateToolData): Promise<{ message: string; tool: Tool }> {
    const response = await fetch(`${API_BASE_URL}/tools`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при създаване на инструмента');
    }

    return response.json();
  }

  static async updateTool(token: string, id: number, data: Partial<CreateToolData>): Promise<{ message: string; tool: Tool }> {
    const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при обновяване на инструмента');
    }

    return response.json();
  }

  static async deleteTool(token: string, id: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при изтриване на инструмента');
    }

    return response.json();
  }

  // Categories operations
  static async getCategories(token: string): Promise<Category[]> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на категориите');
    }

    return response.json();
  }

  static async getCategory(token: string, id: number): Promise<Category> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на категорията');
    }

    return response.json();
  }

  // Tags operations
  static async getTags(token: string): Promise<Tag[]> {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на таговете');
    }

    return response.json();
  }

  static async getTag(token: string, id: number): Promise<Tag> {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на тага');
    }

    return response.json();
  }

  // Tool Approval operations (Owner only)
  static async getPendingTools(token: string, filters?: {
    search?: string;
    category_id?: number;
    per_page?: number;
    page?: number;
  }): Promise<ToolsResponse> {
    const params = new URLSearchParams();

    if (filters?.search) params.append('search', filters.search);
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const url = `${API_BASE_URL}/tools-pending${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на чакащите инструменти');
    }

    return response.json();
  }

  static async approveTool(token: string, id: number): Promise<{ message: string; tool: Tool }> {
    const response = await fetch(`${API_BASE_URL}/tools/${id}/approve`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при одобряване на инструмента');
    }

    return response.json();
  }

  static async rejectTool(token: string, id: number, reason: string): Promise<{ message: string; tool: Tool }> {
    const response = await fetch(`${API_BASE_URL}/tools/${id}/reject`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ rejection_reason: reason }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при отказване на инструмента');
    }

    return response.json();
  }

  static async getApprovalStats(token: string): Promise<ApprovalStats> {
    const response = await fetch(`${API_BASE_URL}/tools/approval/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на статистиките за одобрение');
    }

    return response.json();
  }

  // Comments operations
  static async getComments(token: string, toolId: number, page: number = 1): Promise<CommentsResponse> {
    const response = await fetch(`${API_BASE_URL}/tools/${toolId}/comments?page=${page}`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на коментарите');
    }

    return response.json();
  }

  static async addComment(token: string, toolId: number, comment: string): Promise<{ message: string; comment: ToolComment }> {
    const response = await fetch(`${API_BASE_URL}/tools/${toolId}/comments`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при добавяне на коментар');
    }

    return response.json();
  }

  static async updateComment(token: string, toolId: number, commentId: number, comment: string): Promise<{ message: string; comment: ToolComment }> {
    const response = await fetch(`${API_BASE_URL}/tools/${toolId}/comments/${commentId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ comment }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при обновяване на коментара');
    }

    return response.json();
  }

  static async deleteComment(token: string, toolId: number, commentId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/tools/${toolId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при изтриване на коментара');
    }

    return response.json();
  }

  // Ratings operations
  static async getRating(token: string, toolId: number): Promise<ToolRatingStats> {
    const response = await fetch(`${API_BASE_URL}/tools/${toolId}/rating`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на рейтинга');
    }

    return response.json();
  }

  static async submitRating(token: string, toolId: number, rating: number): Promise<{ message: string; rating: ToolRating; average_rating: number; rating_count: number }> {
    const response = await fetch(`${API_BASE_URL}/tools/${toolId}/rating`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ rating }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при оценяване');
    }

    return response.json();
  }

  static async removeRating(token: string, toolId: number): Promise<{ message: string; average_rating: number; rating_count: number }> {
    const response = await fetch(`${API_BASE_URL}/tools/${toolId}/rating`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при премахване на оценката');
    }

    return response.json();
  }
}