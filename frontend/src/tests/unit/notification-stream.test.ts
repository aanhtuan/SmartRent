import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNotificationsStream, StreamNotification } from '../../shared/hooks/useNotificationsStream';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock EventSource
class MockEventSource {
  listeners: Record<string, ((e: any) => void)[]> = {};
  onerror: (() => void) | null = null;
  close = vi.fn();

  constructor(public url: string) {}

  addEventListener(event: string, callback: (e: any) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  dispatchEvent(event: string, data: any) {
    const handlers = this.listeners[event] || [];
    handlers.forEach((h) => h({ data }));
  }
}

describe('useNotificationsStream Hook', () => {
  let mockEventSourceInstance: MockEventSource;

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).EventSource = vi.fn((url: string) => {
      mockEventSourceInstance = new MockEventSource(url);
      return mockEventSourceInstance;
    });
  });

  it('subscribes to SSE stream and forwards notifications to callback', () => {
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      React.createElement(QueryClientProvider, { client: queryClient }, children)
    );

    const onNotification = vi.fn();
    const { unmount } = renderHook(() => useNotificationsStream(onNotification), { wrapper });

    expect(globalThis.EventSource).toHaveBeenCalledWith('/api/notifications/stream');

    const sampleNotification: StreamNotification = {
      type: 'PAYMENT_RECEIVED',
      sourceType: 'payment',
      sourceId: 'pay-123',
      message: 'Hóa đơn đã được thanh toán',
    };

    // Simulate SSE event from backend
    mockEventSourceInstance.dispatchEvent('notification', JSON.stringify(sampleNotification));

    expect(onNotification).toHaveBeenCalledWith(sampleNotification);

    unmount();
    expect(mockEventSourceInstance.close).toHaveBeenCalled();
  });
});
