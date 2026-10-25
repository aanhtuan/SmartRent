import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentApi } from '../../shared/api';
import { Dialog, Button, Input, Select } from '../../shared/components/ui';

interface LandlordBankModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COMMON_BANKS = [
  { value: '970422', label: 'MBBank (Quân Đội)' },
  { value: '970415', label: 'VietinBank (Công Thương)' },
  { value: '970436', label: 'Vietcombank (Ngoại Thương)' },
  { value: '970407', label: 'Techcombank' },
  { value: '970432', label: 'VPBank' },
  { value: '970418', label: 'BIDV (Đầu Tư & Phát Triển)' },
  { value: '970405', label: 'Agribank (Nông Nghiệp)' },
  { value: '970423', label: 'TPBank (Tiên Phong)' },
  { value: '970441', label: 'VIB (Quốc Tế)' },
  { value: '970403', label: 'Sacombank' },
];

export const LandlordBankModal: React.FC<LandlordBankModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [bankBin, setBankBin] = useState('970422');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: bankAccount, isLoading } = useQuery({
    queryKey: ['landlordBankAccount'],
    queryFn: () => paymentApi.getBankAccount(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (bankAccount) {
      setBankBin(bankAccount.bank_bin);
      setAccountNumber(bankAccount.account_number);
      setAccountHolderName(bankAccount.account_holder_name);
    }
  }, [bankAccount]);

  const mutation = useMutation({
    mutationFn: () => {
      const selectedBank = COMMON_BANKS.find((b) => b.value === bankBin);
      return paymentApi.updateBankAccount({
        bank_bin: bankBin,
        bank_name: selectedBank ? selectedBank.label.split(' ')[0] : 'Bank',
        account_number: accountNumber.trim(),
        account_holder_name: accountHolderName.trim().toUpperCase(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlordBankAccount'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Lỗi khi cập nhật tài khoản ngân hàng.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !accountHolderName.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ số tài khoản và tên chủ tài khoản.');
      return;
    }
    setErrorMsg(null);
    mutation.mutate();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Cài đặt Tài khoản Ngân hàng nhận tiền"
      description="Tài khoản này dùng để tạo mã VietQR tự động trên từng hóa đơn gửi cho khách thuê."
    >
      {isLoading ? (
        <div className="py-8 text-center text-sm text-ink-secondary">Đang tải thông tin...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Ngân hàng thụ hưởng
            </label>
            <Select
              value={bankBin}
              onChange={(e) => setBankBin(e.target.value)}
              options={COMMON_BANKS}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Số tài khoản ngân hàng
            </label>
            <Input
              placeholder="Ví dụ: 0123456789"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Tên chủ tài khoản (Không dấu)
            </label>
            <Input
              placeholder="Ví dụ: NGUYEN VAN A"
              value={accountHolderName}
              onChange={(e) => setAccountHolderName(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={mutation.isPending}>
              Lưu tài khoản
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
};
