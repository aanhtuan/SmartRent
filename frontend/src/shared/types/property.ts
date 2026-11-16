export type PropertyStatus = 'ACTIVE' | 'INACTIVE';

export interface Property {
  id: string;
  name: string;
  address: string;
  status: PropertyStatus;
  created_at: string;
  updated_at: string;
}

export interface PropertyCreateRequest {
  name: string;
  address: string;
  status?: PropertyStatus;
}

export interface PropertyUpdateRequest {
  name?: string;
  address?: string;
  status?: PropertyStatus;
}
