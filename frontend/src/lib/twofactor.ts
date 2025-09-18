// Two-Factor Authentication API utilities

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8201/api';

export interface TwoFactorMethod {
  method: string;
  name: string;
  description: string;
  icon: string;
}

export interface TwoFactorStatus {
  is_enabled: boolean;
  enabled_methods: EnabledMethod[];
  available_methods: TwoFactorMethod[];
}

export interface EnabledMethod {
  method: string;
  name: string;
  is_setup_complete: boolean;
  last_used_at: string | null;
  backup_codes_count: number;
}

export interface SetupResponse {
  message: string;
  data: {
    secret_key: string;
    qr_code_url: string;
    manual_entry_key: string;
    backup_codes: string[];
  };
}

export interface QRCodeResponse {
  qr_code_url: string;
  manual_entry_key: string;
}

export interface BackupCodesResponse {
  message: string;
  backup_codes: string[];
}

export class TwoFactorAPI {
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

  // Get user's 2FA status
  static async getStatus(token: string): Promise<TwoFactorStatus> {
    const response = await fetch(`${API_BASE_URL}/2fa/status`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на 2FA статуса');
    }

    return response.json();
  }

  // Get available 2FA methods
  static async getMethods(token: string): Promise<{ methods: TwoFactorMethod[] }> {
    const response = await fetch(`${API_BASE_URL}/2fa/methods`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при зареждане на методите за 2FA');
    }

    return response.json();
  }

  // Setup Google Authenticator
  static async setupGoogleAuthenticator(token: string): Promise<SetupResponse> {
    const response = await fetch(`${API_BASE_URL}/2fa/setup`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ method: 'google_authenticator' }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при настройване на Google Authenticator');
    }

    return response.json();
  }

  // Enable 2FA after verification
  static async enable(token: string, method: string, code: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/2fa/enable`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ method, code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при активиране на 2FA');
    }

    return response.json();
  }

  // Disable 2FA
  static async disable(token: string, method: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/2fa/disable`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ method }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при деактивиране на 2FA');
    }

    return response.json();
  }

  // Get QR code for Google Authenticator
  static async getQRCode(token: string): Promise<QRCodeResponse> {
    const response = await fetch(`${API_BASE_URL}/2fa/qr-code`, {
      method: 'GET',
      headers: this.getAuthHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при генериране на QR код');
    }

    return response.json();
  }

  // Generate new backup codes
  static async generateBackupCodes(token: string, method: string): Promise<BackupCodesResponse> {
    const response = await fetch(`${API_BASE_URL}/2fa/backup-codes`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ method }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при генериране на резервни кодове');
    }

    return response.json();
  }

  // Verify 2FA code
  static async verify(token: string, code: string, method?: string): Promise<{ message: string; verified: boolean }> {
    const response = await fetch(`${API_BASE_URL}/2fa/verify`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ code, method }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при потвърждаване на кода');
    }

    return response.json();
  }

  // Send verification code (for email/telegram methods)
  static async sendCode(token: string, method?: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/2fa/send-code`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ method }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Грешка при изпращане на код');
    }

    return response.json();
  }
}