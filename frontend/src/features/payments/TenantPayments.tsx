import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentApi } from '../../shared/api';
import { Payment } from '../../shared/types';
import {
  Card,
  Button,
  Badge,
  Skeleton,
  EmptyState,
  ErrorState,
} from '../../shared/components/ui';
import { formatVND, formatDate, paymentStatusMap } from '../../shared/utils/format';
import { CreditCard, Clock, CheckCircle2, QrCode } from 'lucide-react';
import { VietQrModal } from './VietQrModal';

export const TenantPayments: React.FC = () => {
  const [selectedPaymentForQr, setSelectedPaymentForQr] = useState<Payment | null>(null);

  const {
    data: paymentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['payments', 'tenant-view'],
    queryFn: () => paymentApi.list({ page: 1, page_size: 20 }),
  });

  if (error) {
    return (
      <ErrorState
        title="Lỗi tải danh sách hóa đơn"
        message="Không thể kết nối đến máy chủ. Vui lòng thử lại."
        onRetry={() => refetch()}
      />
    );
  }

  const payments = paymentsData?.items ?? [];
  const pendingPayments = payments.filter(
    (p) => p.status === 'PENDING' || p.status === 'OVERDUE'
  );
  const paidPayments = payments.filter((p) => p.status === 'PAID');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Hóa đơn của tôi</h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Theo dõi các khoản tiền phòng cần thanh toán và lịch sử biên lai đã nộp.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-7 h-7 text-primary/60" />}
          title="Bạn không có hóa đơn nào"
          description="Hiện tại chủ nhà chưa lập hóa đơn thu phí nào cho hợp đồng của bạn."
        />
      ) : (
        <div className="space-y-8">
          {/* Section 1: Pending & Overdue Bills */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-ink flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span>Cần thanh toán</span>
              {pendingPayments.length > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-status-warning-soft text-status-warning font-bold">
                  {pendingPayments.length}
                </span>
              )}
            </h2>

            {pendingPayments.length === 0 ? (
              <div className="p-5 rounded-container bg-surface border border-border flex items-center gap-3 text-status-success text-xs font-medium">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Tuyệt vời! Bạn đã hoàn thành tất cả các khoản thanh toán tiền phòng.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPayments.map((p) => {
                  const statusInfo = paymentStatusMap[p.status];
                  const isOverdue = p.status === 'OVERDUE';
                  return (
                    <Card
                      key={p.id}
                      className={
                        isOverdue
                          ? 'border-status-error-border bg-status-error-soft/20 p-5'
                          : 'border-border p-5'
                      }
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-ink">
                              {formatVND(p.amount)}
                            </span>
                            <Badge variant={statusInfo.variant} size="md" dot>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-ink-secondary">
                            <span>
                              Kỳ: <strong>{formatDate(p.billing_period)}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Hạn thanh toán:{' '}
                              <strong className={isOverdue ? 'text-status-error' : ''}>
                                {formatDate(p.due_date)}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<QrCode className="w-4 h-4" />}
                            onClick={() => setSelectedPaymentForQr(p)}
                          >
                            Quét mã VietQR
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Paid History */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-ink flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-status-success" />
              <span>Lịch sử đã thanh toán</span>
            </h2>

            {paidPayments.length === 0 ? (
              <p className="text-xs text-ink-muted">Chưa có lịch sử thanh toán nào trước đây.</p>
            ) : (
              <div className="space-y-2.5">
                {paidPayments.map((p) => (
                  <Card key={p.id} className="p-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-base font-bold text-ink">{formatVND(p.amount)}</span>
                      <p className="text-xs text-ink-muted">
                        Kỳ thanh toán: {formatDate(p.billing_period)} • Hạn đóng:{' '}
                        {formatDate(p.due_date)}
                      </p>
                    </div>
                    <Badge variant="success" size="sm" dot>
                      Đã thanh toán
                    </Badge>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VietQR Modal */}
      <VietQrModal
        payment={selectedPaymentForQr}
        isOpen={!!selectedPaymentForQr}
        onClose={() => setSelectedPaymentForQr(null)}
      />
    </div>
  );
};
