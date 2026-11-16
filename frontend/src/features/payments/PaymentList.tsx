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
import { CreditCard, Plus, CheckCircle2, Clock, Zap, Landmark, ShieldCheck, Printer } from 'lucide-react';
import { MeterReadingModal } from './MeterReadingModal';
import { LandlordBankModal } from './LandlordBankModal';
import { DepositModal } from './DepositModal';
import { ReceiptPrintModal } from './ReceiptPrintModal';

export const PaymentList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMeterReadingOpen, setIsMeterReadingOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [markingPaidPayment, setMarkingPaidPayment] = useState<Payment | null>(null);
  const [depositContractId, setDepositContractId] = useState<string | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

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
    setFormError(null);

    if (!contractId) {
      setFormError('Vui lòng chọn hợp đồng thuê.');
      return;
    }

    if (!billingPeriod) {
      setFormError('Vui lòng chọn kỳ hóa đơn.');
      return;
    }

    if (!dueDate) {
      setFormError('Vui lòng chọn hạn thanh toán.');
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !Number.isInteger(numAmount)) {
      setFormError('Số tiền thanh toán phải là số nguyên VND lớn hơn 0.');
      return;
    }

    // Ensure billing_period is formatted as YYYY-MM-01
    const periodFormatted = billingPeriod.length === 7 ? `${billingPeriod}-01` : billingPeriod;

    if (new Date(dueDate) < new Date(periodFormatted)) {
      setFormError('Hạn thanh toán không được trước ngày bắt đầu kỳ hóa đơn.');
      return;
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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            leftIcon={<Landmark className="w-4 h-4 text-ink-secondary" />}
            onClick={() => setIsBankModalOpen(true)}
          >
            Tài khoản ngân hàng
          </Button>
          <Button
            variant="secondary"
            leftIcon={<Zap className="w-4 h-4 text-amber-500" />}
            onClick={() => setIsMeterReadingOpen(true)}
          >
            Chốt số điện nước
          </Button>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreate}
          >
            Lập hóa đơn mới
          </Button>
        </div>
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

      {/* Table / List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-7 h-7 text-primary/60" />}
          title={statusFilter ? 'Không có hóa đơn phù hợp bộ lọc' : 'Chưa có hóa đơn thanh toán'}
          description={
            statusFilter
              ? 'Thử chọn tab lọc khác để xem thêm hóa đơn.'
              : 'Tạo hóa đơn đầu tiên để bắt đầu theo dõi tiến độ nộp tiền phòng của khách thuê.'
          }
          actionLabel={statusFilter ? undefined : 'Lập hóa đơn đầu tiên'}
          onAction={statusFilter ? undefined : handleOpenCreate}
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-surface-subtle/70 text-ink-secondary font-medium">
                  <th className="py-3 px-4">Kỳ thanh toán</th>
                  <th className="py-3 px-4">Mã tham chiếu</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Hạn thanh toán</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => {
                  const statusInfo = paymentStatusMap[p.status];
                  return (
                    <tr key={p.id} className="hover:bg-surface-subtle/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-ink">
                        Tháng {p.billing_period.substring(5, 7)}/{p.billing_period.substring(0, 4)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-primary">
                        {p.payment_reference || `SR${p.id.slice(0, 8).toUpperCase()}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-ink text-sm">
                        {formatVND(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-ink-secondary">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-ink-muted" />
                          <span>{formatDate(p.due_date)}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={statusInfo.variant} size="sm" dot>
                          {statusInfo.label}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDepositContractId(p.contract_id)}
                            title="Quản lý tiền cọc hợp đồng"
                            aria-label="Quản lý tiền cọc hợp đồng"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setReceiptPayment(p)}
                            title="In phiếu thu / Biên lai"
                            aria-label="In phiếu thu / Biên lai"
                          >
                            <Printer className="w-3.5 h-3.5 text-ink-secondary" />
                          </Button>
                        {p.status !== 'PAID' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-status-success" />}
                            onClick={() => setMarkingPaidPayment(p)}
                          >
                            Xác nhận đã thu
                          </Button>
                        ) : (
                          <span className="text-xs text-ink-muted italic">Đã hoàn thành</span>
                        )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        pageSize={10}
        totalItems={payments.length}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Create Payment Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Lập hóa đơn tiền phòng mới"
        description="Chọn hợp đồng, kỳ thanh toán và số tiền cần thu."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Hợp đồng thuê
            </label>
            <Select
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              options={contracts.map((c) => ({
                value: c.id,
                label: `Phòng ID ${c.room_id.slice(0, 8)}... (${c.start_date} đến ${c.end_date})`,
              }))}
              placeholder="-- Chọn hợp đồng cần lập hóa đơn --"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                Kỳ hóa đơn (tháng)
              </label>
              <Input
                type="date"
                value={billingPeriod}
                onChange={(e) => setBillingPeriod(e.target.value)}
                required
              />
              <span className="text-[11px] text-ink-muted mt-0.5 block">
                Mặc định ngày đầu tháng (ví dụ: 2026-10-01)
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1">
                Hạn thanh toán
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Số tiền cần thu (VNĐ)
            </label>
            <Input
              type="number"
              placeholder="Ví dụ: 3500000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="1"
              required
            />
            {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
              <span className="text-[11px] text-primary font-medium mt-1 block">
                Thành tiền: {formatVND(Number(amount))}
              </span>
            )}
          </div>

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

      {/* Meter Reading Modal */}
      <MeterReadingModal
        isOpen={isMeterReadingOpen}
        onClose={() => setIsMeterReadingOpen(false)}
      />

      {/* Landlord Bank Modal */}
      <LandlordBankModal
        isOpen={isBankModalOpen}
        onClose={() => setIsBankModalOpen(false)}
      />

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

      {depositContractId && (
        <DepositModal
          contractId={depositContractId}
          isOpen={!!depositContractId}
          onClose={() => setDepositContractId(null)}
          isLandlord={true}
        />
      )}

      {receiptPayment && (
        <ReceiptPrintModal
          payment={receiptPayment}
          isOpen={!!receiptPayment}
          onClose={() => setReceiptPayment(null)}
        />
      )}
    </div>
  );
};
