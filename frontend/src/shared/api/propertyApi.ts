import { apiClient } from './client';
import { PageResponse, PaginationParams, Property, PropertyCreateRequest, PropertyUpdateRequest } from '../types';

export const propertyApi = {
  list: async (params?: PaginationParams): Promise<PageResponse<Property>> => {
    return apiClient<PageResponse<Property>>('/api/properties', {
      method: 'GET',
      params: {
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 20,
      },
    });
  },

  get: async (id: string): Promise<Property> => {
    return apiClient<Property>(`/api/properties/${id}`, {
      method: 'GET',
    });
  },

  create: async (data: PropertyCreateRequest): Promise<Property> => {
    return apiClient<Property>('/api/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: PropertyUpdateRequest): Promise<Property> => {
    return apiClient<Property>(`/api/properties/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
