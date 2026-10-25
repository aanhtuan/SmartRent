import { apiClient } from './client';
import { Contract, ContractCreateRequest, ContractFilterParams, ContractPatchRequest, PageResponse } from '../types';

export const contractApi = {
  list: async (params?: ContractFilterParams): Promise<PageResponse<Contract>> => {
    return apiClient<PageResponse<Contract>>('/api/contracts', {
      method: 'GET',
      params: {
        room_id: params?.room_id,
        status: params?.status,
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 20,
      },
    });
  },

  get: async (id: string): Promise<Contract> => {
    return apiClient<Contract>(`/api/contracts/${id}`, {
      method: 'GET',
    });
  },

  create: async (data: ContractCreateRequest): Promise<Contract> => {
    return apiClient<Contract>('/api/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: string, data: ContractPatchRequest): Promise<Contract> => {
    return apiClient<Contract>(`/api/contracts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
