import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from '../../shared/api';
import { AssetCondition, RoomAsset } from '../../shared/types';
import {
  Dialog,
  Button,
  Input,
  Select,
  Textarea,
  Badge,
  Skeleton,
} from '../../shared/components/ui';
import { PackageCheck, Plus, Trash2, Edit3 } from 'lucide-react';

interface RoomAssetModalProps {
  roomId: string;
  roomNumber: string;
  isOpen: boolean;
  onClose: () => void;
}

const conditionMap: Record<
  AssetCondition,
  { label: string; variant: 'success' | 'info' | 'warning' | 'error' }
> = {
  EXCELLENT: { label: 'Như mới (100%)', variant: 'success' },
  GOOD: { label: 'Hoạt động tốt', variant: 'info' },
  FAIR: { label: 'Có hao mòn nhẹ', variant: 'warning' },
  DAMAGED: { label: 'Hư hỏng / Lỗi', variant: 'error' },
};

export const RoomAssetModal: React.FC<RoomAssetModalProps> = ({
  roomId,
  roomNumber,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingAsset, setEditingAsset] = useState<RoomAsset | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [assetCode, setAssetCode] = useState('');
  const [condition, setCondition] = useState<AssetCondition>('GOOD');
  const [initialNotes, setInitialNotes] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: assets = [],
    isLoading,
  } = useQuery({
    queryKey: ['room-assets', roomId],
    queryFn: () => inventoryApi.listAssets(roomId),
    enabled: isOpen && !!roomId,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      inventoryApi.createAsset(roomId, {
        name,
        asset_code: assetCode || undefined,
        condition_status: condition,
        initial_notes: initialNotes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-assets', roomId] });
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Không thể tạo mới tài sản bàn giao.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      inventoryApi.updateAsset(editingAsset!.id, {
        name,
        asset_code: assetCode || undefined,
        condition_status: condition,
        initial_notes: initialNotes || undefined,
        handover_notes: handoverNotes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-assets', roomId] });
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Không thể cập nhật tài sản.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => inventoryApi.deleteAsset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['room-assets', roomId] });
    },
  });

  const resetForm = () => {
    setIsAdding(false);
    setEditingAsset(null);
    setName('');
    setAssetCode('');
    setCondition('GOOD');
    setInitialNotes('');
    setHandoverNotes('');
    setFormError(null);
  };

  const handleStartEdit = (a: RoomAsset) => {
    setEditingAsset(a);
    setName(a.name);
    setAssetCode(a.asset_code || '');
    setCondition(a.condition_status);
    setInitialNotes(a.initial_notes || '');
    setHandoverNotes(a.handover_notes || '');
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Vui lòng nhập tên tài sản/thiết bị.');
      return;
    }
    setFormError(null);
    if (editingAsset) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={`Kiểm kê thiết bị & Tài sản phòng ${roomNumber}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Header toolbar */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2 text-xs text-ink-secondary">
            <PackageCheck className="w-4 h-4 text-primary" />
            <span>Danh mục đồ đạc bàn giao cho khách thuê</span>
          </div>
          {!isAdding && (
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => {
                resetForm();
                setIsAdding(true);
              }}
            >
              Thêm thiết bị
            </Button>
          )}
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="p-4 bg-surface-subtle border border-border rounded-xl space-y-3"
          >
            <h4 className="text-sm font-semibold text-ink">
              {editingAsset ? 'Chỉnh sửa thông tin thiết bị' : 'Thêm thiết bị kiểm kê mới'}
            </h4>

            {formError && (
              <div className="p-2 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Tên tài sản / Thiết bị"
                placeholder="VD: Điều hòa Daikin 1.5HP"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Mã tài sản (tùy chọn)"
                placeholder="VD: TS-DH-01"
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Tình trạng hiện tại"
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                options={[
                  { value: 'EXCELLENT', label: 'Như mới (100%)' },
                  { value: 'GOOD', label: 'Hoạt động tốt' },
                  { value: 'FAIR', label: 'Có hao mòn nhẹ' },
                  { value: 'DAMAGED', label: 'Hư hỏng / Lỗi' },
                ]}
              />
              <Input
                label="Ghi chú ban đầu (bàn giao)"
                placeholder="VD: Kèm remote và phiếu bảo hành"
                value={initialNotes}
                onChange={(e) => setInitialNotes(e.target.value)}
              />
            </div>

            {editingAsset && (
              <Textarea
                label="Ghi chú hoàn trả (khi kết thúc hợp đồng)"
                placeholder="VD: Hoạt động bình thường, đã vệ sinh lưới lọc"
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                rows={2}
              />
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" size="sm" variant="ghost" onClick={resetForm}>
                Hủy
              </Button>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {editingAsset ? 'Lưu cập nhật' : 'Thêm vào danh sách'}
              </Button>
            </div>
          </form>
        )}

        {/* Asset Listing */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : assets.length === 0 ? (
          <div className="py-8 text-center text-ink-muted text-xs border border-dashed border-border rounded-xl">
            Chưa có tài sản hoặc đồ đạc nào được kiểm kê trong phòng này.
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
            {assets.map((asset) => {
              const cond = conditionMap[asset.condition_status] || conditionMap.GOOD;
              return (
                <div
                  key={asset.id}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface hover:bg-surface-subtle transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">{asset.name}</span>
                      {asset.asset_code && (
                        <span className="text-[11px] font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                          {asset.asset_code}
                        </span>
                      )}
                      <Badge variant={cond.variant} size="sm">
                        {cond.label}
                      </Badge>
                    </div>

                    <div className="text-xs text-ink-secondary space-x-3">
                      {asset.initial_notes && (
                        <span>Bàn giao: {asset.initial_notes}</span>
                      )}
                      {asset.handover_notes && (
                        <span className="text-status-warning">
                          • Trả phòng: {asset.handover_notes}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-auto">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(asset)}
                      title="Sửa thiết bị"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-ink-secondary" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Xóa tài sản "${asset.name}" khỏi danh sách?`)) {
                          deleteMutation.mutate(asset.id);
                        }
                      }}
                      title="Xóa thiết bị"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-status-error" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-3 border-t border-border flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetForm();
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
