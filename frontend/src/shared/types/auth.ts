export type AccountRole = 'LANDLORD' | 'TENANT';

export interface User {
  id: string;
  email: string;
  role: AccountRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface MeResponse {
  id: string;
  email: string;
  role: AccountRole;
  is_active: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: AccountRole;
  full_name?: string;
  phone_number?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: AccountRole;
  full_name?: string | null;
  phone_number?: string | null;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone_number?: string;
}
