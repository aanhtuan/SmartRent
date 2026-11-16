export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Payment {
  id: string;
  contract_id: string;
  billing_period: string;
  due_date: string;
  amount: number;
  status: PaymentStatus;
  payment_reference?: string;
  viet_qr_url?: string | null;
}

export interface PaymentCreateRequest {
  contract_id: string;
  billing_period: string;
  due_date: string;
  amount: number;
}

export interface PaymentPatchRequest {
  status?: 'PAID';
  amount?: number;
  due_date?: string;
}

export interface PaymentFilterParams {
  contract_id?: string;
  status?: PaymentStatus;
  page?: number;
  page_size?: number;
}

export interface LandlordBankAccount {
  id: string;
  landlord_user_id: string;
  bank_bin: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  updated_at: string;
}

export interface LandlordBankAccountUpdateRequest {
  bank_bin: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
}
