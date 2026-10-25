import { apiClient } from './client';
import { PageResponse, PaginationParams, TenantProfile, TenantProfileCreateRequest, TenantProfilePatchRequest } from '../types';

export const tenantApi = {
  list: async (params?: PaginationParams): Promise<PageResponse<TenantProfile>> => {
    return apiClient<PageResponse<TenantProfile>>('/api/tenant-profiles', {
      method: 'GET',
      params: {
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 20,
      },
    });
  },

  get: async (id: string): Promise<TenantProfile> => {
    return apiClient<TenantProfile>(`/api/tenant-profiles/${id}`, {
      method: 'GET',
    });
  },

  create: async (data: TenantProfileCreateRequest): Promise<TenantProfile> => {
    return apiClient<TenantProfile>('/api/tenant-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  patch: async (id: string, data: TenantProfilePatchRequest): Promise<TenantProfile> => {
    return apiClient<TenantProfile>(`/api/tenant-profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
