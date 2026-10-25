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
