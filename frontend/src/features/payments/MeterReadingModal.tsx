import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { utilityApi, contractApi } from '../../shared/api';
import { Dialog, Button, Input, Select } from '../../shared/components/ui';
import { Zap, Droplet } from 'lucide-react';

interface MeterReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string;
  contractId?: string;
  roomCode?: string;
}

export const MeterReadingModal: React.FC<MeterReadingModalProps> = ({
  isOpen,
  onClose,
  roomId: initialRoomId,
  contractId: initialContractId,
  roomCode: initialRoomCode,
}) => {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const currentMonthFirstDay = `${today.substring(0, 7)}-01`;

  const [selectedContractId, setSelectedContractId] = useState(initialContractId || '');
  const [selectedRoomId, setSelectedRoomId] = useState(initialRoomId || '');
  const [billingPeriod, setBillingPeriod] = useState(currentMonthFirstDay);
  const [recordedDate, setRecordedDate] = useState(today);
  const [oldElec, setOldElec] = useState('0');
  const [newElec, setNewElec] = useState('0');
  const [oldWater, setOldWater] = useState('0');
  const [newWater, setNewWater] = useState('0');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch active contracts if contractId not provided
  const { data: contractsData } = useQuery({
    queryKey: ['contracts', 'active-for-reading'],
    queryFn: () => contractApi.list({ status: 'ACTIVE', page: 1, page_size: 100 }),
    enabled: isOpen && !initialContractId,
  });

  const contracts = contractsData?.items ?? [];

  useEffect(() => {
    if (initialContractId) {
      setSelectedContractId(initialContractId);
    } else if (contracts.length > 0 && !selectedContractId) {
      setSelectedContractId(contracts[0].id);
      setSelectedRoomId(contracts[0].room_id);
    }
  }, [initialContractId, contracts, selectedContractId]);

  useEffect(() => {
    if (initialRoomId) {
      setSelectedRoomId(initialRoomId);
    }
  }, [initialRoomId]);

  const handleContractChange = (cId: string) => {
    setSelectedContractId(cId);
    const found = contracts.find((c) => c.id === cId);
    if (found) {
      setSelectedRoomId(found.room_id);
    }
  };

  const activeRoomId = selectedRoomId || initialRoomId;

  const { data: latestReading } = useQuery({
    queryKey: ['latestReading', activeRoomId],
    queryFn: () => utilityApi.getLatestReading(activeRoomId!),
    enabled: isOpen && !!activeRoomId,
  });

  useEffect(() => {
    if (latestReading) {
      setOldElec(String(latestReading.new_electricity_kwh || 0));
      setNewElec(String(latestReading.new_electricity_kwh || 0));
      setOldWater(String(latestReading.new_water_m3 || 0));
      setNewWater(String(latestReading.new_water_m3 || 0));
    } else {
      setOldElec('0');
      setNewElec('0');
      setOldWater('0');
      setNewWater('0');
    }
  }, [latestReading, isOpen]);

  const elecDelta = Math.max(0, Number(newElec) - Number(oldElec));
  const waterDelta = Math.max(0, Number(newWater) - Number(oldWater));

  const mutation = useMutation({
    mutationFn: () =>
      utilityApi.recordReading({
        room_id: activeRoomId!,
        contract_id: selectedContractId,
        billing_period: billingPeriod,
        recorded_date: recordedDate,
        old_electricity_kwh: Number(oldElec),
        new_electricity_kwh: Number(newElec),
        old_water_m3: Number(oldWater),
        new_water_m3: Number(newWater),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestReading', activeRoomId] });
      queryClient.invalidateQueries({ queryKey: ['meterReadings', selectedContractId] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      onClose();
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Lỗi khi ghi nhận số điện nước.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContractId || !activeRoomId) {
      setErrorMsg('Vui lòng chọn hợp đồng thuê phòng.');
      return;
    }
    if (Number(newElec) < Number(oldElec)) {
      setErrorMsg('Chỉ số điện mới không được nhỏ hơn chỉ số cũ.');
      return;
    }
    if (Number(newWater) < Number(oldWater)) {
      setErrorMsg('Chỉ số nước mới không được nhỏ hơn chỉ số cũ.');
      return;
    }
    setErrorMsg(null);
    mutation.mutate();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Chốt chỉ số Điện / Nước ${initialRoomCode ? `- Phòng ${initialRoomCode}` : ''}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}

        {!initialContractId && (
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Chọn hợp đồng đang thuê
            </label>
            <Select
              value={selectedContractId}
              onChange={(e) => handleContractChange(e.target.value)}
              options={contracts.map((c) => ({
                value: c.id,
                label: `Phòng ${c.room_id.slice(0, 8)}... (${c.start_date} đến ${c.end_date})`,
              }))}
              placeholder="-- Chọn hợp đồng --"
              required
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Kỳ hóa đơn (Ngày 1 đầu tháng)
            </label>
            <Input
              type="date"
              value={billingPeriod}
              onChange={(e) => setBillingPeriod(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1">
              Ngày ghi số
            </label>
            <Input
              type="date"
              value={recordedDate}
              onChange={(e) => setRecordedDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/60 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Zap className="w-4 h-4 text-amber-600" />
            Chỉ số Điện (kWh)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-ink-secondary mb-1">Chỉ số cũ</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={oldElec}
                onChange={(e) => setOldElec(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-ink-secondary mb-1">Chỉ số mới</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={newElec}
                onChange={(e) => setNewElec(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="text-right text-xs font-medium text-amber-800">
            Tiêu thụ: <span className="font-bold">{elecDelta.toFixed(1)}</span> kWh
          </div>
        </div>

        <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/60 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
            <Droplet className="w-4 h-4 text-blue-600" />
            Chỉ số Nước (m³)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-ink-secondary mb-1">Chỉ số cũ</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={oldWater}
                onChange={(e) => setOldWater(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-ink-secondary mb-1">Chỉ số mới</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                value={newWater}
                onChange={(e) => setNewWater(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="text-right text-xs font-medium text-blue-800">
            Tiêu thụ: <span className="font-bold">{waterDelta.toFixed(1)}</span> m³
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={mutation.isPending}>
            Lưu & Tính tiền
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
