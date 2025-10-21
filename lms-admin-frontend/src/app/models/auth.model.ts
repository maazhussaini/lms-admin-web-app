// Authentication related interfaces

export interface LoginRequest {
  email_address: string;
  password: string;
}

export interface Role {
  role_type: string;
  role_name: string;
}

export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Role;
  tenant_id?: number;
  user_type: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'TEACHER';
}

export interface Tokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface LoginResponseData {
  user: User;
  tokens: Tokens;
  permissions: string[];
}

export interface LoginResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LoginResponseData;
  timestamp: string;
  correlationId: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}
