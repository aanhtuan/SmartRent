import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../../shared/api';
import { Property, PropertyCreateRequest, PropertyUpdateRequest } from '../../shared/types';
import {
  Card,
  Button,
  Badge,
  Input,
  Dialog,
  ConfirmDialog,
  Skeleton,
  EmptyState,
  ErrorState,
  Pagination,
} from '../../shared/components/ui';
import { propertyStatusMap, formatDate } from '../../shared/utils/format';
import { Building2, Plus, Edit2, ArrowRight, MapPin, Calendar, Power, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TariffSettingsModal } from './TariffSettingsModal';

export const PropertyList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deactivatingProperty, setDeactivatingProperty] = useState<Property | null>(null);
  const [tariffProperty, setTariffProperty] = useState<Property | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const {
    data: propertiesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['properties', page],
    queryFn: () => propertyApi.list({ page, page_size: 10 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: PropertyCreateRequest) => propertyApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Không thể tạo nhà trọ. Vui lòng kiểm tra lại.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PropertyUpdateRequest }) =>
      propertyApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setEditingProperty(null);
      setDeactivatingProperty(null);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Cập nhật thất bại.');
    },
  });

  const resetForm = () => {
    setName('');
    setAddress('');
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (p: Property) => {
    resetForm();
    setEditingProperty(p);
    setName(p.name);
    setAddress(p.address);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setFormError('Vui lòng nhập tên và địa chỉ nhà trọ.');
      return;
    }
    createMutation.mutate({ name: name.trim(), address: address.trim() });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    if (!name.trim() || !address.trim()) {
      setFormError('Vui lòng nhập tên và địa chỉ nhà trọ.');
      return;
    }
    updateMutation.mutate({
      id: editingProperty.id,
      data: { name: name.trim(), address: address.trim() },
    });
  };

  const handleToggleStatus = (p: Property) => {
    const nextStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    updateMutation.mutate({
      id: p.id,
      data: { status: nextStatus },
    });
  };

  if (error) {
    return (
      <ErrorState
        title="Lỗi tải danh sách nhà trọ"
        message="Không thể kết nối đến máy chủ. Vui lòng thử lại."
        onRetry={() => refetch()}
      />
    );
  }

  const properties = propertiesData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Quản lý nhà trọ</h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Danh sách các dãy trọ, tòa nhà hoặc căn hộ cho thuê của bạn.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Thêm nhà trọ mới
        </Button>
      </div>

      {/* Property Cards / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-7 h-7 text-primary/60" />}
          title="Chưa có nhà trọ nào"
          description="Bắt đầu bằng việc thêm khu trọ đầu tiên của bạn để thiết lập phòng và đón khách thuê."
          actionLabel="Thêm nhà trọ đầu tiên"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p) => {
            const statusInfo = propertyStatusMap[p.status];
            return (
              <Card key={p.id} hoverable className="flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-control bg-primary-soft text-primary flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-ink text-base truncate" title={p.name}>
                        {p.name}
                      </h3>
                    </div>
                    <Badge variant={statusInfo.variant} size="sm" dot className="shrink-0">
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs text-ink-secondary my-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{p.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-ink-muted shrink-0" />
                      <span>Ngày tạo: {formatDate(p.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(p)}
                      title="Chỉnh sửa thông tin"
                      aria-label="Chỉnh sửa thông tin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTariffProperty(p)}
                      title="Cấu hình biểu phí điện nước"
                      className="hover:text-amber-600"
                      aria-label="Cấu hình biểu phí điện nước"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeactivatingProperty(p)}
                      title={p.status === 'ACTIVE' ? 'Tạm ngừng hoạt động' : 'Kích hoạt lại'}
                      className={p.status === 'ACTIVE' ? 'hover:text-status-warning' : 'hover:text-status-success'}
                      aria-label="Thay đổi trạng thái hoạt động"
                    >
                      <Power className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <Link to={`/landlord/properties/${p.id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Xem các phòng
                    </Button>
                  </Link>
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
        totalItems={properties.length}
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Create Property Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Thêm nhà trọ mới"
        description="Điền thông tin tên và địa chỉ khu nhà trọ của bạn."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs">
              {formError}
            </div>
          )}
          <Input
            label="Tên nhà trọ"
            placeholder="Ví dụ: Tòa nhà SmartRent 1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Địa chỉ"
            placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Quận 1, TP.HCM"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
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
              Tạo nhà trọ
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Property Dialog */}
      <Dialog
        isOpen={!!editingProperty}
        onClose={() => setEditingProperty(null)}
        title="Chỉnh sửa thông tin nhà trọ"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs">
              {formError}
            </div>
          )}
          <Input
            label="Tên nhà trọ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Địa chỉ"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingProperty(null)}
              disabled={updateMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Tariff Settings Dialog */}
      <TariffSettingsModal
        isOpen={!!tariffProperty}
        propertyId={tariffProperty?.id ?? null}
        propertyName={tariffProperty?.name}
        onClose={() => setTariffProperty(null)}
      />

      {/* Deactivate/Activate Confirmation */}
      {deactivatingProperty && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeactivatingProperty(null)}
          onConfirm={() => handleToggleStatus(deactivatingProperty)}
          title={
            deactivatingProperty.status === 'ACTIVE'
              ? 'Tạm ngừng hoạt động nhà trọ?'
              : 'Kích hoạt lại nhà trọ?'
          }
          description={
            deactivatingProperty.status === 'ACTIVE'
              ? `Tạm dừng hoạt động "${deactivatingProperty.name}". Tất cả phòng thuộc nhà trọ này sẽ không thể tạo mới hợp đồng.`
              : `Kích hoạt lại hoạt động cho "${deactivatingProperty.name}".`
          }
          variant={deactivatingProperty.status === 'ACTIVE' ? 'danger' : 'primary'}
          confirmLabel={deactivatingProperty.status === 'ACTIVE' ? 'Tạm ngừng' : 'Kích hoạt'}
          isLoading={updateMutation.isPending}
        />
      )}
    </div>
  );
};
