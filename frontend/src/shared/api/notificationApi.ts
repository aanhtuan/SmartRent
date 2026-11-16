import { apiClient } from './client';
import { Notification, NotificationFilterParams, PageResponse } from '../types';

export const notificationApi = {
  list: async (params?: NotificationFilterParams): Promise<PageResponse<Notification>> => {
    return apiClient<PageResponse<Notification>>('/api/notifications', {
      method: 'GET',
      params: {
        unread: params?.unread,
        page: params?.page ?? 1,
        page_size: params?.page_size ?? 20,
      },
    });
  },

  get: async (id: string): Promise<Notification> => {
    return apiClient<Notification>(`/api/notifications/${id}`, {
      method: 'GET',
    });
  },

  markAsRead: async (id: string): Promise<Notification> => {
    return apiClient<Notification>(`/api/notifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    });
  },
};
