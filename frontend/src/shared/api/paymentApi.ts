import { apiClient } from './client';
import {
  PageResponse,
  Payment,
  PaymentCreateRequest,
  PaymentFilterParams,
  PaymentPatchRequest,
  LandlordBankAccount,
  LandlordBankAccountUpdateRequest,
} from '../types';

export const paymentApi = {
  list: async (params?: PaymentFilterParams): Promise<PageResponse<Payment>> => {
    return apiClient<PageResponse<Payment>>('/api/payments', {
      method: 'GET',
      params: {
        contract_id: params?.contract_id,
        status: params?.status,
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 20,
      },
    });
  },

  get: async (id: string): Promise<Payment> => {
    return apiClient<Payment>(`/api/payments/${id}`, {
      method: 'GET',
    });
  },

  create: async (data: PaymentCreateRequest): Promise<Payment> => {
    return apiClient<Payment>('/api/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: string, data: PaymentPatchRequest): Promise<Payment> => {
    return apiClient<Payment>(`/api/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getBankAccount: async (): Promise<LandlordBankAccount | null> => {
    return apiClient<LandlordBankAccount | null>('/api/landlords/bank-account', {
      method: 'GET',
    });
  },

  updateBankAccount: async (
    data: LandlordBankAccountUpdateRequest
  ): Promise<LandlordBankAccount> => {
    return apiClient<LandlordBankAccount>('/api/landlords/bank-account', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  simulateWebhook: async (
    reference: string,
    amount: number
  ): Promise<{ success: boolean; status: string }> => {
    return apiClient<{ success: boolean; status: string }>('/api/webhooks/payment', {
      method: 'POST',
      body: JSON.stringify({ reference, amount }),
    });
  },
};
