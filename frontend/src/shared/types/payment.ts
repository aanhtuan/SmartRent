export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface Payment {
  id: string;
  contract_id: string;
  billing_period: string;
  due_date: string;
  amount: number;
  status: PaymentStatus;
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
