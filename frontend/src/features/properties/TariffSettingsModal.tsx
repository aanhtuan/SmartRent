import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { utilityApi } from '../../shared/api';
import { Dialog, Button, Input } from '../../shared/components/ui';
import { Zap, Droplet, Wifi, Trash2, MoreHorizontal } from 'lucide-react';

interface TariffSettingsModalProps {
  propertyId: string | null;
  propertyName?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const TariffSettingsModal: React.FC<TariffSettingsModalProps> = ({
  propertyId,
  propertyName,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [elecRate, setElecRate] = useState('3500');
  const [waterRate, setWaterRate] = useState('25000');
  const [internetFee, setInternetFee] = useState('100000');
  const [garbageFee, setGarbageFee] = useState('30000');
  const [otherFees, setOtherFees] = useState('0');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: tariff, isLoading } = useQuery({
    queryKey: ['tariff', propertyId],
    queryFn: () => utilityApi.getTariff(propertyId!),
    enabled: isOpen && !!propertyId,
  });

  useEffect(() => {
    if (tariff) {
      setElecRate(String(tariff.electricity_rate || 0));
      setWaterRate(String(tariff.water_rate || 0));
      setInternetFee(String(tariff.internet_fee || 0));
      setGarbageFee(String(tariff.garbage_fee || 0));
      setOtherFees(String(tariff.other_fees || 0));
    }
  }, [tariff]);

  const mutation = useMutation({
    mutationFn: () =>
      utilityApi.updateTariff(propertyId!, {
        electricity_rate: Number(elecRate) || 0,
        water_rate: Number(waterRate) || 0,
        internet_fee: Number(internetFee) || 0,
        garbage_fee: Number(garbageFee) || 0,
        other_fees: Number(otherFees) || 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariff', propertyId] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Lỗi khi lưu biểu phí.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    mutation.mutate();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Cấu hình Biểu phí Tiện ích - ${propertyName || ''}`}
    >
      {isLoading ? (
        <div className="py-8 text-center text-sm text-ink-secondary">Đang tải biểu phí...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Giá điện (VNĐ / kWh)
              </label>
              <Input
                type="number"
                min="0"
                step="100"
                value={elecRate}
                onChange={(e) => setElecRate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1 flex items-center gap-1.5">
                <Droplet className="w-3.5 h-3.5 text-blue-500" />
                Giá nước (VNĐ / m³)
              </label>
              <Input
                type="number"
                min="0"
                step="500"
                value={waterRate}
                onChange={(e) => setWaterRate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1 flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5 text-indigo-500" />
                Phí Internet (VNĐ / tháng)
              </label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={internetFee}
                onChange={(e) => setInternetFee(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-secondary mb-1 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-emerald-500" />
                Phí rác / vệ sinh (VNĐ / tháng)
              </label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={garbageFee}
                onChange={(e) => setGarbageFee(e.target.value)}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ink-secondary mb-1 flex items-center gap-1.5">
                <MoreHorizontal className="w-3.5 h-3.5 text-ink-secondary" />
                Phí dịch vụ khác (thang máy, bảo vệ... VNĐ / tháng)
              </label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={otherFees}
                onChange={(e) => setOtherFees(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={mutation.isPending}>
              Lưu biểu phí
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
};
