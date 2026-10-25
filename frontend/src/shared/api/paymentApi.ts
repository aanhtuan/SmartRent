import { apiClient } from './client';
import { PageResponse, Payment, PaymentCreateRequest, PaymentFilterParams, PaymentPatchRequest } from '../types';

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
};
