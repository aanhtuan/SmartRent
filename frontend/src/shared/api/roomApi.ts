import { apiClient } from './client';
import { PageResponse, PaginationParams, Room, RoomCreateRequest, RoomUpdateRequest } from '../types';

export const roomApi = {
  listByProperty: async (propertyId: string, params?: PaginationParams): Promise<PageResponse<Room>> => {
    return apiClient<PageResponse<Room>>(`/api/properties/${propertyId}/rooms`, {
      method: 'GET',
      params: {
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 20,
      },
    });
  },

  create: async (propertyId: string, data: RoomCreateRequest): Promise<Room> => {
    return apiClient<Room>(`/api/properties/${propertyId}/rooms`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get: async (id: string): Promise<Room> => {
    return apiClient<Room>(`/api/rooms/${id}`, {
      method: 'GET',
    });
  },

  update: async (id: string, data: RoomUpdateRequest): Promise<Room> => {
    return apiClient<Room>(`/api/rooms/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string): Promise<void> => {
    return apiClient<void>(`/api/rooms/${id}`, {
      method: 'DELETE',
    });
  },
};
