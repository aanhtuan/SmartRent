export type AssetCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'DAMAGED';

export type DepositStatus = 'HELD' | 'REFUNDED' | 'DEDUCTED';

export interface Deposit {
  id: string;
  contract_id: string;
  amount: number;
  status: DepositStatus;
  refund_amount: number;
  deduction_amount: number;
  deduction_reason?: string | null;
  held_at: string;
  resolved_at?: string | null;
  created_at: string;
}

export interface RoomAsset {
  id: string;
  room_id: string;
  name: string;
  asset_code?: string | null;
  condition_status: AssetCondition;
  initial_notes?: string | null;
  handover_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RecordDepositRequest {
  amount: number;
}

export interface ResolveDepositRequest {
  refund_amount: number;
  deduction_amount: number;
  deduction_reason?: string;
}

export interface CreateAssetRequest {
  name: string;
  asset_code?: string;
  condition_status: AssetCondition;
  initial_notes?: string;
}

export interface UpdateAssetRequest {
  name?: string;
  asset_code?: string;
  condition_status?: AssetCondition;
  initial_notes?: string;
  handover_notes?: string;
}
