export interface TenantProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string | null;
}

export interface TenantProfileCreateRequest {
  user_id: string;
  full_name: string;
  phone_number?: string;
}

export interface TenantProfilePatchRequest {
  full_name?: string;
  phone_number?: string | null;
}
