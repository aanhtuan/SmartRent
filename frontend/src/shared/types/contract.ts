export type ContractStatus = 'ACTIVE' | 'TERMINATED' | 'EXPIRED';

export interface Contract {
  id: string;
  tenant_profile_id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  status: ContractStatus;
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
