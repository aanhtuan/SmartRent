import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi, contractApi } from '../../shared/api';
import { Payment, PaymentCreateRequest, PaymentStatus } from '../../shared/types';
import {
  Card,
  Button,
  Badge,
  Input,
  Select,
  Dialog,
  ConfirmDialog,
  Skeleton,
  EmptyState,
  ErrorState,
  Pagination,
} from '../../shared/components/ui';
import { formatVND, formatDate, paymentStatusMap } from '../../shared/utils/format';
import { CreditCard, Plus, CheckCircle2, Clock } from 'lucide-react';

export const PaymentList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [markingPaidPayment, setMarkingPaidPayment] = useState<Payment | null>(null);

  // Form states
  const [contractId, setContractId] = useState('');
  const [billingPeriod, setBillingPeriod] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Query payments
  const {
    data: paymentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['payments', page, statusFilter],
    queryFn: () =>
      paymentApi.list({
        page,
        page_size: 10,
        status: (statusFilter || undefined) as PaymentStatus | undefined,
      }),
  });

  // Query active contracts for creating bills
  const { data: contractsData } = useQuery({
    queryKey: ['contracts', 'for-payments'],
    queryFn: () => contractApi.list({ status: 'ACTIVE', page: 1, page_size: 100 }),
    enabled: isCreateOpen,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: PaymentCreateRequest) => paymentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      if (err.status === 409) {
        setFormError('Kỳ hóa đơn này đã tồn tại cho hợp đồng đã chọn.');
      } else {
        setFormError(
          err.message || 'Không thể tạo hóa đơn. Số tiền phải là số nguyên VND lớn hơn 0.'
        );
      }
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => paymentApi.patch(id, { status: 'PAID' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setMarkingPaidPayment(null);
    },
    onError: (err: any) => {
      alert(err.message || 'Không thể cập nhật trạng thái đã thanh toán.');
      setMarkingPaidPayment(null);
    },
  });

  const resetForm = () => {
    setContractId('');
    setBillingPeriod('');
    setDueDate('');
    setAmount('');
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractId || !billingPeriod || !dueDate || !amount) {
      setFormError('Vui lòng điền đầy đủ các thông tin hóa đơn.');
      return;
    }
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Số tiền phải là số nguyên dương VND.');
      return;
    }

    // Backend requires billingPeriod to be first of month
    let periodFormatted = billingPeriod;
    if (periodFormatted.length === 7) {
      periodFormatted += '-01';
    }

    createMutation.mutate({
      contract_id: contractId,
      billing_period: periodFormatted,
      due_date: dueDate,
      amount: numAmount,
    });
  };

  if (error) {
    return (
      <ErrorState
        title="Lỗi tải danh sách thanh toán"
        message="Không thể kết nối đến máy chủ. Vui lòng thử lại."
        onRetry={() => refetch()}
      />
    );
  }

  const payments = paymentsData?.items ?? [];
  const contracts = contractsData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Quản lý hóa đơn & Thu phí</h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Lập phiếu thu tiền phòng theo kỳ, theo dõi trạng thái đã thanh toán hoặc quá hạn.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Lập hóa đơn mới
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { value: '', label: 'Tất cả hóa đơn' },
          { value: 'PENDING', label: 'Chờ thanh toán' },
          { value: 'OVERDUE', label: 'Quá hạn' },
          { value: 'PAID', label: 'Đã thanh toán' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface border border-border text-ink-secondary hover:text-ink hover:bg-surface-subtle'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payments List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-7 h-7 text-primary/60" />}
          title="Chưa có hóa đơn nào"
          description="Không tìm thấy hóa đơn nào phù hợp với bộ lọc hiện tại. Bấm nút dưới để lập hóa đơn kỳ mới."
          actionLabel="Lập hóa đơn"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3">
          {payments.map((p) => {
            const statusInfo = paymentStatusMap[p.status];
            return (
              <Card key={p.id} hoverable className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-lg font-bold text-ink">
                        {formatVND(p.amount)}
                      </span>
                      <Badge variant={statusInfo.variant} size="sm" dot>
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-secondary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-ink-muted" />
                        Kỳ thanh toán: <strong>{formatDate(p.billing_period)}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Hạn chót: <strong>{formatDate(p.due_date)}</strong>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-ink-muted">
                        HĐ: {p.contract_id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>

                  {p.status !== 'PAID' && (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => setMarkingPaidPayment(p)}
                    >
                      Xác nhận đã thu
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
        pageSize={10}
        totalItems={payments.length}
        onPageChange={(p) => setPage(p)}
      />

      {/* Create Payment Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Lập hóa đơn thu phí"
        description="Chọn hợp đồng thuê và nhập kỳ tính phí cùng số tiền nguyên VND."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs">
              {formError}
            </div>
          )}

          <Select
            label="Chọn hợp đồng thuê (Đang hiệu lực)"
            value={contractId}
            onChange={(e) => setContractId(e.target.value)}
            options={contracts.map((c) => ({
              value: c.id,
              label: `HĐ #${c.id.substring(0, 8)} (Từ ${formatDate(c.start_date)} đến ${formatDate(c.end_date)})`,
            }))}
            placeholder="Chọn một hợp đồng"
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Kỳ tính phí (Ngày đầu tháng)"
              type="date"
              value={billingPeriod}
              onChange={(e) => setBillingPeriod(e.target.value)}
              required
            />
            <Input
              label="Hạn thanh toán"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Số tiền cần thu (VND)"
            type="number"
            step="1"
            min="1000"
            placeholder="Ví dụ: 3500000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            helperText="Nhập số nguyên không có số thập phân"
          />

          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={createMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={createMutation.isPending}>
              Lập hóa đơn
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Mark As Paid Confirm Dialog */}
      {markingPaidPayment && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setMarkingPaidPayment(null)}
          onConfirm={() => markPaidMutation.mutate(markingPaidPayment.id)}
          title="Xác nhận đã nhận thanh toán?"
          description={`Xác nhận đã thu số tiền ${formatVND(markingPaidPayment.amount)}. Lưu ý: Trạng thái PAID là trạng thái cuối cùng và không thể sửa đổi sau khi xác nhận.`}
          variant="primary"
          confirmLabel="Đã nhận tiền"
          isLoading={markPaidMutation.isPending}
        />
      )}
    </div>
  );
};
