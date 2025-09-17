import { LoginFormData, LoginResponse } from '@/features/auth/login/schema';
import { RegisterFormData, RegisterResponse } from '@/features/auth/register/schema';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class AuthService {
  private async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async login(data: LoginFormData): Promise<LoginResponse> {
    return this.fetchWithAuth<LoginResponse>('/api/v2/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterFormData): Promise<RegisterResponse> {
    return this.fetchWithAuth<RegisterResponse>('/api/v2/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyToken(token: string): Promise<{ success: boolean; data?: any; error?: string }> {
    return this.fetchWithAuth('/api/v2/auth/verify-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
}

export const authService = new AuthService();
