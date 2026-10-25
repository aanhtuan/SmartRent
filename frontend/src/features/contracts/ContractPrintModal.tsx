import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { contractApi } from '../../shared/api';
import { Contract } from '../../shared/types';
import { formatDate } from '../../shared/utils/format';
import { Dialog, Button, SignatureModal } from '../../shared/components/ui';
import { Printer, PenTool, CheckCircle2 } from 'lucide-react';

interface ContractPrintModalProps {
  contract: Contract;
  isOpen: boolean;
  onClose: () => void;
  isLandlord?: boolean;
}

export const ContractPrintModal: React.FC<ContractPrintModalProps> = ({
  contract,
  isOpen,
  onClose,
  isLandlord = false,
}) => {
  const queryClient = useQueryClient();
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  const signMutation = useMutation({
    mutationFn: (sigData: string) => contractApi.sign(contract.id, sigData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setIsSignModalOpen(false);
    },
  });

  const handlePrint = () => {
    window.print();
  };

  const userHasSigned = isLandlord
    ? !!contract.landlord_signature
    : !!contract.tenant_signature;

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title={`Văn bản hợp đồng thuê phòng #${contract.id.substring(0, 8)}`}
        maxWidth="xl"
      >
        <div className="space-y-6">
          {/* Action toolbar (hidden on actual print) */}
          <div className="flex items-center justify-between pb-3 border-b border-border print:hidden">
            <span className="text-xs text-ink-secondary">
              Xem trước văn bản hợp đồng pháp lý đầy đủ & chữ ký điện tử hai bên.
            </span>
            <div className="flex items-center gap-2">
              {!userHasSigned && (
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<PenTool className="w-3.5 h-3.5" />}
                  onClick={() => setIsSignModalOpen(true)}
                >
                  Ký điện tử ngay
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={handlePrint}
              >
                In / Lưu PDF
              </Button>
            </div>
          </div>

          {/* Printable Document Sheet */}
          <div className="bg-white p-6 sm:p-10 border border-border shadow-sm rounded-container text-ink font-serif text-sm leading-relaxed space-y-6 print:border-none print:shadow-none print:p-0">
            {/* Header */}
            <div className="text-center space-y-1">
              <h3 className="font-bold uppercase tracking-wider text-sm">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </h3>
              <p className="font-semibold text-xs italic underline">
                Độc lập – Tự do – Hạnh phúc
              </p>
              <div className="py-4">
                <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide">
                  HỢP ĐỒNG THUÊ PHÒNG TRỌ
                </h2>
                <span className="text-xs font-mono text-ink-muted">
                  Số: HD-{contract.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
            </div>

            {/* Parties */}
            <div className="space-y-4 text-xs sm:text-sm">
              <p className="italic">
                Hôm nay, các bên tham gia ký kết hợp đồng thuê phòng trọ bao gồm:
              </p>

              <div className="space-y-1 pl-2 border-l-2 border-primary/40">
                <p className="font-bold uppercase">BÊN CHO THUÊ (BÊN A):</p>
                <p>Đại diện quản lý nhà trọ SmartRent</p>
                <p>Quyền hạn: Đại diện chủ nhà hợp pháp</p>
              </div>

              <div className="space-y-1 pl-2 border-l-2 border-primary/40">
                <p className="font-bold uppercase">BÊN THUÊ (BÊN B):</p>
                <p>Khách thuê phòng trọ (Mã hồ sơ: {contract.tenant_profile_id.substring(0, 8)})</p>
              </div>
            </div>

            {/* Terms */}
            <div className="space-y-3 text-xs sm:text-sm pt-2">
              <h4 className="font-bold uppercase">ĐIỀU 1: ĐỐI TƯỢNG VÀ THỜI HẠN THUÊ</h4>
              <ul className="list-disc list-inside space-y-1 pl-2 text-ink-secondary">
                <li>Phòng thuê: Mã định danh phòng #{contract.room_id.substring(0, 8)}</li>
                <li>
                  Thời hạn thuê: Từ ngày <strong>{formatDate(contract.start_date)}</strong> đến ngày{' '}
                  <strong>{formatDate(contract.end_date)}</strong>.
                </li>
                <li>Trạng thái hiệu lực hiện tại: <strong>{contract.status}</strong></li>
              </ul>

              <h4 className="font-bold uppercase pt-2">ĐIỀU 2: TRÁCH NHIỆM HAI BÊN</h4>
              <p className="text-ink-secondary">
                1. Bên B có trách nhiệm thanh toán tiền thuê phòng, điện, nước và các dịch vụ tiện ích đúng hạn ghi trên hóa đơn hàng tháng.
              </p>
              <p className="text-ink-secondary">
                2. Hai bên cam kết tuân thủ quy chế phòng cháy chữa cháy, an ninh trật tự và quy định kiểm kê tài sản phòng ban đầu.
              </p>
            </div>

            {/* Signatures Block */}
            <div className="pt-8 grid grid-cols-2 gap-6 text-center text-xs sm:text-sm border-t border-border mt-8">
              {/* Landlord Signature */}
              <div className="space-y-2">
                <span className="font-bold uppercase block">ĐẠI DIỆN BÊN A</span>
                <span className="italic text-xs text-ink-muted block">(Ký và ghi rõ họ tên)</span>
                <div className="h-28 flex flex-col items-center justify-center">
                  {contract.landlord_signature ? (
                    <div className="space-y-1">
                      <img
                        src={contract.landlord_signature}
                        alt="Chữ ký Bên A"
                        className="max-h-20 object-contain mx-auto"
                      />
                      <span className="text-[10px] text-primary flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-status-success" />
                        Đã ký ({formatDate(contract.landlord_signed_at || '')})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-ink-muted italic border border-dashed border-border px-3 py-2 rounded">
                      Chưa ký
                    </span>
                  )}
                </div>
              </div>

              {/* Tenant Signature */}
              <div className="space-y-2">
                <span className="font-bold uppercase block">ĐẠI DIỆN BÊN B</span>
                <span className="italic text-xs text-ink-muted block">(Ký và ghi rõ họ tên)</span>
                <div className="h-28 flex flex-col items-center justify-center">
                  {contract.tenant_signature ? (
                    <div className="space-y-1">
                      <img
                        src={contract.tenant_signature}
                        alt="Chữ ký Bên B"
                        className="max-h-20 object-contain mx-auto"
                      />
                      <span className="text-[10px] text-primary flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-status-success" />
                        Đã ký ({formatDate(contract.tenant_signed_at || '')})
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-ink-muted italic border border-dashed border-border px-3 py-2 rounded">
                      Chưa ký
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

      {/* Signature Capture Modal */}
      <SignatureModal
        isOpen={isSignModalOpen}
        title={isLandlord ? 'Bên A (Chủ nhà) ký hợp đồng' : 'Bên B (Khách thuê) ký hợp đồng'}
        onClose={() => setIsSignModalOpen(false)}
        onSave={(dataUrl) => signMutation.mutate(dataUrl)}
        isLoading={signMutation.isPending}
      />
    </>
  );
};
