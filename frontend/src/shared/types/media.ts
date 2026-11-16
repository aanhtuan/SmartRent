export interface MediaFile {
  id: string;
  uploader_user_id: string;
  target_type: 'MAINTENANCE' | 'ROOM' | 'PROPERTY';
  target_id?: string;
  file_name: string;
  url: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}
