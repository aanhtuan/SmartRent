import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../shared/api';
import {
  Card,
  Button,
  Skeleton,
  EmptyState,
  ErrorState,
  Pagination,
} from '../../shared/components/ui';
import { formatDateTime } from '../../shared/utils/format';
import {
  Bell,
  FileText,
  CreditCard,
  Wrench,
  Clock,
  Check,
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const queryClient = useQueryClient();

  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['notifications', page, unreadOnly],
    queryFn: () =>
      notificationApi.list({
        page,
        page_size: 15,
        unread: unreadOnly ? true : undefined,
      }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const getNotificationIcon = (type: string) => {
    if (type.includes('PAYMENT')) return <CreditCard className="w-4 h-4 text-accent" />;
    if (type.includes('MAINTENANCE')) return <Wrench className="w-4 h-4 text-primary" />;
    if (type.includes('CONTRACT')) return <FileText className="w-4 h-4 text-status-info" />;
    return <Bell className="w-4 h-4 text-ink-muted" />;
  };

  if (error) {
    return (
      <ErrorState
        title="Lỗi tải thông báo"
        message="Không thể kết nối đến máy chủ. Vui lòng thử lại."
        onRetry={() => refetch()}
      />
    );
  }

  const notifications = notificationsData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Trung tâm thông báo</h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Cập nhật các hoạt động về hợp đồng, thanh toán và tiến độ xử lý sự cố.
          </p>
        </div>

        {/* Unread toggle buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setUnreadOnly(false);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-colors ${
              !unreadOnly
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface border border-border text-ink-secondary hover:text-ink'
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => {
              setUnreadOnly(true);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-colors ${
              unreadOnly
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface border border-border text-ink-secondary hover:text-ink'
            }`}
          >
            Chưa đọc
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-7 h-7 text-primary/60" />}
          title={unreadOnly ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
          description="Các cập nhật quan trọng từ hệ thống SmartRent sẽ xuất hiện tại đây."
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const isUnread = !n.read_at;
            return (
              <Card
                key={n.id}
                className={`p-4 transition-all ${
                  isUnread
                    ? 'border-primary/30 bg-primary-soft/10 shadow-soft'
                    : 'border-border bg-surface opacity-90'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-control bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${isUnread ? 'font-semibold text-ink' : 'font-normal text-ink-secondary'}`}>
                          {n.message}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-ink-muted">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(n.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markReadMutation.mutate(n.id)}
                      isLoading={markReadMutation.isPending}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      className="text-xs shrink-0"
                    >
                      Đã đọc
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        pageSize={15}
        totalItems={notifications.length}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};
