import React from 'react';
import { Payment } from '../../shared/types';
import { formatVND, formatDate, paymentStatusMap } from '../../shared/utils/format';
import { Dialog, Button, Badge } from '../../shared/components/ui';
import { Printer, CheckCircle2 } from 'lucide-react';

interface ReceiptPrintModalProps {
  payment: Payment;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  payment,
  isOpen,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const statusInfo = paymentStatusMap[payment.status];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Biên lai thu tiền #${payment.payment_reference || payment.id.substring(0, 8)}`}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between pb-3 border-b border-border print:hidden">
          <span className="text-xs text-ink-secondary">
            Xem và in phiếu thu tiền phòng / hóa đơn dịch vụ hàng tháng.
          </span>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
          >
            In / Lưu PDF
          </Button>
        </div>

        {/* Printable Receipt */}
        <div className="bg-white p-6 sm:p-8 border border-border shadow-sm rounded-container text-ink font-sans text-xs sm:text-sm space-y-5 print:border-none print:shadow-none print:p-0">
          <div className="flex items-start justify-between pb-4 border-b border-dashed border-border">
            <div>
              <h3 className="font-bold text-base text-primary uppercase">HỆ THỐNG NHÀ TRỌ SMARTRENT</h3>
              <p className="text-[11px] text-ink-secondary">Phần mềm quản trị nhà trọ thông minh</p>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs font-bold block text-ink">
                MÃ: {payment.payment_reference || `SR${payment.id.substring(0, 8).toUpperCase()}`}
              </span>
              <span className="text-[11px] text-ink-muted">
                Ngày xuất: {formatDate(new Date().toISOString())}
              </span>
            </div>
          </div>

          <div className="text-center py-2 space-y-1">
            <h2 className="text-lg font-bold uppercase tracking-wider text-ink">
              PHIẾU THU TIỀN PHÒNG
            </h2>
            <p className="text-xs text-ink-secondary">
              Kỳ thanh toán: Tháng {payment.billing_period.substring(5, 7)}/{payment.billing_period.substring(0, 4)}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-ink-secondary">Hợp đồng thuê:</span>
              <span className="font-mono font-medium">#{payment.contract_id.substring(0, 8)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-ink-secondary">Hạn thanh toán:</span>
              <span>{formatDate(payment.due_date)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-ink-secondary">Trạng thái phiếu:</span>
              <Badge variant={statusInfo.variant} size="sm" dot>
                {statusInfo.label}
              </Badge>
            </div>
            <div className="flex justify-between py-2 border-b-2 border-primary/20 items-center">
              <span className="font-bold text-ink">Tổng số tiền thu:</span>
              <span className="text-lg font-bold text-primary">{formatVND(payment.amount)}</span>
            </div>
          </div>

          {/* QR & Bank details if available */}
          {payment.viet_qr_url && (
            <div className="p-3 bg-surface-subtle border border-border rounded-xl flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold block text-ink">VietQR Napas 247</span>
                <span className="text-[11px] text-ink-secondary">
                  Quét mã để thanh toán tự động đối soát
                </span>
              </div>
              <img
                src={payment.viet_qr_url}
                alt="VietQR"
                className="w-16 h-16 object-contain rounded border border-border"
              />
            </div>
          )}

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 gap-4 text-center text-xs">
            <div className="space-y-1">
              <span className="font-bold uppercase block">NGƯỜI NỘP TIỀN</span>
              <span className="text-[10px] text-ink-muted italic">(Ký, ghi rõ họ tên)</span>
              <div className="h-16" />
            </div>
            <div className="space-y-1">
              <span className="font-bold uppercase block">NGƯỜI LẬP PHIẾU</span>
              <span className="text-[10px] text-ink-muted italic">(Ký, đóng dấu nếu có)</span>
              <div className="h-16 flex items-center justify-center">
                {payment.status === 'PAID' && (
                  <span className="text-status-success font-semibold flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ĐÃ XÁC NHẬN THU TIỀN
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-border flex justify-end print:hidden">
          <Button variant="outline" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
