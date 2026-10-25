export interface NotificationSource {
  type: string;
  id: string;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  read_at: string | null;
  created_at: string;
  source: NotificationSource;
}

export interface NotificationPatchRequest {
  read: true;
}

export interface NotificationFilterParams {
  unread?: boolean;
  page?: number;
  page_size?: number;
}
