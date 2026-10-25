import { apiClient } from './client';
import { MediaFile } from '../types';

export const mediaApi = {
  upload: async (
    file: File,
    targetType: 'MAINTENANCE' | 'ROOM' | 'PROPERTY',
    targetId?: string
  ): Promise<MediaFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_type', targetType);
    if (targetId) {
      formData.append('target_id', targetId);
    }

    return apiClient<MediaFile>('/api/media/upload', {
      method: 'POST',
      body: formData,
    });
  },

  list: async (
    targetType?: string,
    targetId?: string
  ): Promise<MediaFile[]> => {
    return apiClient<MediaFile[]>('/api/media', {
      method: 'GET',
      params: {
        ...(targetType ? { target_type: targetType } : {}),
        ...(targetId ? { target_id: targetId } : {}),
      },
    });
  },

  listByTarget: async (
    targetType: 'MAINTENANCE' | 'ROOM' | 'PROPERTY',
    targetId: string
  ): Promise<MediaFile[]> => {
    return mediaApi.list(targetType, targetId);
  },

  delete: async (id: string): Promise<void> => {
    return apiClient<void>(`/api/media/${id}`, {
      method: 'DELETE',
    });
  },
};
