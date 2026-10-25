import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { contractApi } from '../../shared/api';
import {
  Card,
  Badge,
  Skeleton,
  EmptyState,
  ErrorState,
} from '../../shared/components/ui';
import { contractStatusMap, formatDate } from '../../shared/utils/format';
import { FileText, Calendar, ShieldCheck } from 'lucide-react';

export const TenantContracts: React.FC = () => {
  const {
    data: contractsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['contracts', 'tenant-view'],
    queryFn: () => contractApi.list({ page: 1, page_size: 20 }),
  });

  if (error) {
    return (
      <ErrorState
        title="Lỗi tải danh sách hợp đồng"
        message="Không thể kết nối đến máy chủ. Vui lòng thử lại."
        onRetry={() => refetch()}
      />
    );
  }

  const contracts = contractsData?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Hợp đồng thuê của tôi</h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Xem thông tin chi tiết các hợp đồng thuê nhà hiện tại và lịch sử thuê trước đây của bạn.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-7 h-7 text-primary/60" />}
          title="Chưa có hợp đồng nào"
          description="Hiện tại bạn chưa có hợp đồng thuê nhà nào được kích hoạt dưới tài khoản này."
        />
      ) : (
        <div className="space-y-4">
          {contracts.map((c) => {
            const statusInfo = contractStatusMap[c.status];
            return (
              <Card key={c.id} className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-control bg-primary-soft text-primary flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink text-base font-mono">
                        HỢP ĐỒNG #{c.id.substring(0, 8).toUpperCase()}
                      </h3>
                      <span className="text-xs text-ink-muted">Hợp đồng thuê phòng cá nhân</span>
                    </div>
                  </div>
                  <Badge variant={statusInfo.variant} size="md" dot>
                    {statusInfo.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-ink-muted shrink-0" />
                    <span className="text-ink-secondary">Ngày bắt đầu:</span>
                    <strong className="text-ink">{formatDate(c.start_date)}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-ink-muted shrink-0" />
                    <span className="text-ink-secondary">Ngày kết thúc:</span>
                    <strong className="text-ink">{formatDate(c.end_date)}</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs text-ink-muted">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Hợp đồng có hiệu lực pháp lý theo quy định của SmartRent</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
