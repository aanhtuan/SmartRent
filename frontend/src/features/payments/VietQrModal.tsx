import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '../../shared/api';
import { Payment } from '../../shared/types';
import { Dialog, Button } from '../../shared/components/ui';
import { formatVND } from '../../shared/utils/format';
import { QrCode, Copy, Check, Sparkles } from 'lucide-react';

interface VietQrModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const VietQrModal: React.FC<VietQrModalProps> = ({ payment, isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const simulateMutation = useMutation({
    mutationFn: () =>
      paymentApi.simulateWebhook(payment!.payment_reference || `SR${payment!.id.slice(0, 8).toUpperCase()}`, payment!.amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      onClose();
    },
  });

  if (!payment) return null;

  const refCode = payment.payment_reference || `SR${payment.id.slice(0, 8).toUpperCase()}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Thanh toán chuyển khoản VietQR">
      <div className="space-y-4 text-center">
        {payment.viet_qr_url ? (
          <div className="flex flex-col items-center">
            <div className="p-3 bg-white rounded-2xl shadow-card border border-border inline-block">
              <img
                src={payment.viet_qr_url}
                alt="Mã VietQR"
                className="w-64 h-64 object-contain rounded-xl"
              />
            </div>
            <p className="text-[11px] text-ink-muted mt-2">
              Mở ứng dụng Ngân hàng bất kỳ để quét mã QR Napas 247
            </p>
          </div>
        ) : (
          <div className="py-8 px-4 bg-surface-subtle rounded-2xl border border-dashed border-border text-center">
            <QrCode className="w-10 h-10 text-ink-muted mx-auto mb-2" />
            <p className="text-xs font-semibold text-ink">Chủ nhà chưa cài đặt tài khoản ngân hàng</p>
            <p className="text-[11px] text-ink-muted mt-1">
              Vui lòng chuyển khoản trực tiếp theo thông tin chủ nhà cung cấp hoặc thanh toán tiền mặt.
            </p>
          </div>
        )}

        <div className="p-3.5 bg-surface-subtle/80 rounded-xl border border-border text-left space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-ink-secondary">Số tiền:</span>
            <div className="flex items-center gap-1.5 font-bold text-ink text-sm">
              <span>{formatVND(payment.amount)}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(String(payment.amount), 'amount')}
                className="p-1 hover:bg-surface rounded text-ink-muted hover:text-ink"
                title="Sao chép"
              >
                {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-ink-secondary">Nội dung chuyển khoản:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold text-primary">
              <span>{refCode}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(refCode, 'ref')}
                className="p-1 hover:bg-surface rounded text-ink-muted hover:text-ink"
                title="Sao chép"
              >
                {copiedField === 'ref' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full text-xs"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-primary" />}
            isLoading={simulateMutation.isPending}
            onClick={() => simulateMutation.mutate()}
          >
            Mô phỏng ngân hàng báo có (Auto-Reconcile)
          </Button>

          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="w-full">
            Đóng
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
