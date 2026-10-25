import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../shared/api';
import { DepositStatus } from '../../shared/types';
import { formatVND, formatDate } from '../../shared/utils/format';
import {
  Dialog,
  Button,
  Input,
  Textarea,
  Badge,
  Skeleton,
} from '../../shared/components/ui';
import { ShieldCheck, ArrowDownRight } from 'lucide-react';

interface DepositModalProps {
  contractId: string;
  contractCode?: string;
  isOpen: boolean;
  onClose: () => void;
  isLandlord?: boolean;
}

const statusBadgeMap: Record<
  DepositStatus,
  { label: string; variant: 'info' | 'success' | 'warning' }
> = {
  HELD: { label: 'Đang tạm giữ', variant: 'info' },
  REFUNDED: { label: 'Đã hoàn trả 100%', variant: 'success' },
  DEDUCTED: { label: 'Đã khấu trừ hoàn tất', variant: 'warning' },
};

export const DepositModal: React.FC<DepositModalProps> = ({
  contractId,
  contractCode,
  isOpen,
  onClose,
  isLandlord = true,
}) => {
  const queryClient = useQueryClient();

  const [isRecording, setIsRecording] = useState(false);
  const [isResolving, setIsResolving] = useState(false);

  // Form states
  const [amount, setAmount] = useState<number>(0);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [deductionReason, setDeductionReason] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: deposit,
    isLoading,
  } = useQuery({
    queryKey: ['contract-deposit', contractId],
    queryFn: async () => {
      try {
        return await inventoryApi.getDeposit(contractId);
      } catch (err: any) {
        if (err.status === 404) return null;
        throw err;
      }
    },
    enabled: isOpen && !!contractId,
  });

  const recordMutation = useMutation({
    mutationFn: () => inventoryApi.recordDeposit(contractId, { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-deposit', contractId] });
      setIsRecording(false);
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Không thể ghi nhận tiền đặt cọc.');
    },
  });

  const resolveMutation = useMutation({
    mutationFn: () =>
      inventoryApi.resolveDeposit(deposit!.id, {
        refund_amount: refundAmount,
        deduction_amount: deductionAmount,
        deduction_reason: deductionReason || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-deposit', contractId] });
      setIsResolving(false);
      setFormError(null);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Không thể quyết toán tiền cọc.');
    },
  });

  const handleStartResolve = () => {
    if (!deposit) return;
    setRefundAmount(deposit.amount);
    setDeductionAmount(0);
    setDeductionReason('');
    setIsResolving(true);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deposit) return;
    if (refundAmount < 0 || deductionAmount < 0) {
      setFormError('Số tiền không được âm.');
      return;
    }
    if (refundAmount + deductionAmount > deposit.amount) {
      setFormError(
        `Tổng tiền hoàn trả (${formatVND(refundAmount)}) và khấu trừ (${formatVND(
          deductionAmount
        )}) không được vượt quá số tiền cọc ban đầu (${formatVND(deposit.amount)}).`
      );
      return;
    }
    setFormError(null);
    resolveMutation.mutate();
  };

  const renderContent = () => {
    if (isLoading) {
      return <Skeleton className="h-32 w-full" />;
    }

    if (!deposit && !isRecording) {
      return (
        <div className="p-6 text-center space-y-3 bg-surface-subtle border border-dashed border-border rounded-xl">
          <ShieldCheck className="w-8 h-8 text-ink-muted mx-auto" />
          <p className="text-xs text-ink-secondary">
            Hợp đồng này chưa ghi nhận khoản tiền đặt cọc đảm bảo.
          </p>
          {isLandlord && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setAmount(3000000);
                setIsRecording(true);
              }}
            >
              Ghi nhận tiền cọc
            </Button>
          )}
        </div>
      );
    }

    if (isRecording) {
      return (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (amount <= 0) {
              setFormError('Vui lòng nhập số tiền cọc hợp lệ.');
              return;
            }
            setFormError(null);
            recordMutation.mutate();
          }}
          className="p-4 bg-surface-subtle border border-border rounded-xl space-y-3"
        >
          <h4 className="text-sm font-semibold text-ink">Ghi nhận số tiền đặt cọc</h4>
          {formError && (
            <div className="p-2 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
              {formError}
            </div>
          )}
          <Input
            label="Số tiền cọc (VND)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            helperText={`Định dạng: ${formatVND(amount)}`}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsRecording(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={recordMutation.isPending}
            >
              Lưu số tiền cọc
            </Button>
          </div>
        </form>
      );
    }

    if (!deposit) return null;

    if (isResolving) {
      return (
        <form
          onSubmit={handleResolveSubmit}
          className="p-4 bg-surface-subtle border border-border rounded-xl space-y-3"
        >
          <h4 className="text-sm font-semibold text-ink">Quyết toán tiền đặt cọc</h4>
          <p className="text-xs text-ink-secondary">
            Tổng tiền cọc ban đầu:{' '}
            <strong className="text-ink">{formatVND(deposit.amount)}</strong>
          </p>

          {formError && (
            <div className="p-2 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tiền hoàn trả khách (VND)"
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value))}
              required
            />
            <Input
              label="Tiền khấu trừ (VND)"
              type="number"
              value={deductionAmount}
              onChange={(e) => setDeductionAmount(Number(e.target.value))}
              required
            />
          </div>

          {deductionAmount > 0 && (
            <Textarea
              label="Lý do khấu trừ"
              placeholder="VD: Trừ tiền hỏng rèm cửa, bù tiền điện nước chưa thanh toán..."
              value={deductionReason}
              onChange={(e) => setDeductionReason(e.target.value)}
              rows={2}
              required
            />
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setIsResolving(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={resolveMutation.isPending}
            >
              Xác nhận quyết toán
            </Button>
          </div>
        </form>
      );
    }

    return (
      <div className="p-4 bg-surface-subtle border border-border rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-ink-secondary block">Trạng thái tiền cọc</span>
            <Badge variant={statusBadgeMap[deposit.status].variant} size="md">
              {statusBadgeMap[deposit.status].label}
            </Badge>
          </div>

          <div className="text-right">
            <span className="text-xs text-ink-secondary block">Số tiền cọc ban đầu</span>
            <span className="text-lg font-bold text-primary">
              {formatVND(deposit.amount)}
            </span>
          </div>
        </div>

        <div className="text-xs text-ink-secondary space-y-1 pt-2 border-t border-border">
          <div>Ghi nhận lúc: {formatDate(deposit.held_at)}</div>
          {deposit.resolved_at && (
            <div>Quyết toán lúc: {formatDate(deposit.resolved_at)}</div>
          )}
        </div>

        {deposit.status !== 'HELD' && (
          <div className="p-3 bg-surface border border-border rounded-lg space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-ink-secondary">Đã hoàn lại khách:</span>
              <strong className="text-status-success">
                {formatVND(deposit.refund_amount)}
              </strong>
            </div>
            {deposit.deduction_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-ink-secondary">Đã khấu trừ:</span>
                <strong className="text-status-warning">
                  {formatVND(deposit.deduction_amount)}
                </strong>
              </div>
            )}
            {deposit.deduction_reason && (
              <div className="pt-1 text-[11px] text-ink-muted">
                Lý do khấu trừ: {deposit.deduction_reason}
              </div>
            )}
          </div>
        )}

        {deposit.status === 'HELD' && isLandlord && (
          <div className="pt-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ArrowDownRight className="w-3.5 h-3.5" />}
              onClick={handleStartResolve}
            >
              Quyết toán hoàn trả / Khấu trừ
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        setIsRecording(false);
        setIsResolving(false);
        setFormError(null);
        onClose();
      }}
      title={`Quản lý Tiền đặt cọc (HĐ #${contractCode || contractId.substring(0, 8)})`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {renderContent()}

        <div className="pt-3 border-t border-border flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsRecording(false);
              setIsResolving(false);
              onClose();
            }}
          >
            Đóng
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
