import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../shared/api/client';
import { mediaApi } from '../../shared/api/mediaApi';
import { MediaFile } from '../../shared/types';

vi.mock('../../shared/api/client', () => ({
  apiClient: vi.fn(),
}));

describe('Media API and Upload Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists media files filtered by target type and target id', async () => {
    const mockFiles: MediaFile[] = [
      {
        id: 'med-1',
        uploader_user_id: 'user-1',
        target_type: 'MAINTENANCE',
        target_id: 'maint-123',
        file_name: 'broken-pipe.jpg',
        url: '/api/media/files/broken-pipe.jpg',
        mime_type: 'image/jpeg',
        file_size: 102400,
        created_at: '2026-10-25T10:00:00Z',
      },
    ];

    vi.mocked(apiClient).mockResolvedValueOnce(mockFiles);

    const result = await mediaApi.listByTarget('MAINTENANCE', 'maint-123');

    expect(apiClient).toHaveBeenCalledWith('/api/media', {
      method: 'GET',
      params: { target_type: 'MAINTENANCE', target_id: 'maint-123' },
    });
    expect(result).toHaveLength(1);
    expect(result[0].file_name).toBe('broken-pipe.jpg');
  });

  it('uploads a file successfully via multipart form-data', async () => {
    const dummyBlob = new Blob(['sample content'], { type: 'image/png' });
    const dummyFile = new File([dummyBlob], 'room-leak.png', { type: 'image/png' });

    const mockResponse: MediaFile = {
      id: 'med-2',
      uploader_user_id: 'tenant-1',
      target_type: 'MAINTENANCE',
      target_id: 'maint-456',
      file_name: 'room-leak.png',
      url: '/api/media/files/room-leak.png',
      mime_type: 'image/png',
      file_size: 14,
      created_at: '2026-10-25T12:00:00Z',
    };

    vi.mocked(apiClient).mockResolvedValueOnce(mockResponse);

    const result = await mediaApi.upload(dummyFile, 'MAINTENANCE', 'maint-456');

    expect(apiClient).toHaveBeenCalledWith(
      '/api/media/upload',
      expect.objectContaining({
        method: 'POST',
        body: expect.any(FormData),
      })
    );
    expect(result.id).toBe('med-2');
    expect(result.file_name).toBe('room-leak.png');
  });

  it('deletes an uploaded media file by id', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce(undefined);

    await mediaApi.delete('med-2');

    expect(apiClient).toHaveBeenCalledWith('/api/media/med-2', {
      method: 'DELETE',
    });
  });
});
