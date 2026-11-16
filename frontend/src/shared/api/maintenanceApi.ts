import { apiClient } from './client';
import {
  Maintenance,
  MaintenanceClassifyRequest,
  MaintenanceCreateRequest,
  MaintenanceFilterParams,
  MaintenancePreviewRequest,
  MaintenancePreviewResponse,
  MaintenanceStatusUpdateRequest,
  PageResponse,
} from '../types';

export const maintenanceApi = {
  list: async (params?: MaintenanceFilterParams): Promise<PageResponse<Maintenance>> => {
    return apiClient<PageResponse<Maintenance>>('/api/maintenance-requests', {
      method: 'GET',
      params: {
        room_id: params?.room_id,
        status: params?.status,
        priority: params?.priority,
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 20,
      },
    });
  },

  get: async (id: string): Promise<Maintenance> => {
    return apiClient<Maintenance>(`/api/maintenance-requests/${id}`, {
      method: 'GET',
    });
  },

  preview: async (data: MaintenancePreviewRequest): Promise<MaintenancePreviewResponse> => {
    return apiClient<MaintenancePreviewResponse>('/api/maintenance-requests/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  submit: async (data: MaintenanceCreateRequest): Promise<Maintenance> => {
    return apiClient<Maintenance>('/api/maintenance-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateStatus: async (id: string, data: MaintenanceStatusUpdateRequest): Promise<Maintenance> => {
    return apiClient<Maintenance>(`/api/maintenance-requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  classify: async (id: string, data: MaintenanceClassifyRequest): Promise<Maintenance> => {
    return apiClient<Maintenance>(`/api/maintenance-requests/${id}/classify`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
