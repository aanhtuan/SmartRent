export type ContractStatus = 'ACTIVE' | 'TERMINATED' | 'EXPIRED';

export interface Contract {
  id: string;
  tenant_profile_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  status: ContractStatus;
  tenant_signature?: string | null;
  tenant_signed_at?: string | null;
  landlord_signature?: string | null;
  landlord_signed_at?: string | null;
}

export interface ContractCreateRequest {
  tenant_profile_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  status?: 'ACTIVE';
}

export interface ContractPatchRequest {
  start_date?: string;
  end_date?: string;
  status?: 'ACTIVE' | 'TERMINATED';
}

export interface ContractFilterParams {
  room_id?: string;
  status?: ContractStatus;
  page?: number;
  page_size?: number;
}
