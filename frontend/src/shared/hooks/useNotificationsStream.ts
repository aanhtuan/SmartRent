import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getAccessToken } from '../api/client';

export interface StreamNotification {
  type: string;
  sourceType: string;
  sourceId: string;
  message: string;
}

export function useNotificationsStream(
  onNotificationReceived?: (notification: StreamNotification) => void
) {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const streamUrl = token 
      ? `${baseUrl}/api/notifications/stream?token=${encodeURIComponent(token)}`
      : `${baseUrl}/api/notifications/stream`;

    try {
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.addEventListener('notification', (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data) as StreamNotification;
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          if (onNotificationReceived) {
            onNotificationReceived(payload);
          }
        } catch {
          // Ignore JSON parse errors for heartbeats
        }
      });

      es.onerror = () => {
        // EventSource will automatically retry connection
      };
    } catch {
      // EventSource not supported in environment
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [queryClient, onNotificationReceived]);
}
