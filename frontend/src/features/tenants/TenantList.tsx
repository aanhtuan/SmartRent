import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantApi } from '../../shared/api';
import { TenantProfile, TenantProfileCreateRequest, TenantProfilePatchRequest } from '../../shared/types';
import {
  Card,
  Button,
  Input,
  Dialog,
  Skeleton,
  EmptyState,
  ErrorState,
  Pagination,
} from '../../shared/components/ui';
import { Users, Plus, Edit2, Phone, User as UserIcon } from 'lucide-react';

export const TenantList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<TenantProfile | null>(null);

  // Form states
  const [userId, setUserId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const {
    data: tenantsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tenants', page],
    queryFn: () => tenantApi.list({ page, page_size: 10 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: TenantProfileCreateRequest) => tenantApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      if (err.status === 403) {
        setFormError('Không có quyền gán người dùng này hoặc người dùng không tồn tại.');
      } else if (err.status === 409) {
        setFormError('Hồ sơ người thuê cho tài khoản này đã tồn tại.');
      } else {
        setFormError(err.message || 'Không thể tạo hồ sơ người thuê.');
      }
    },
  });

  const patchMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TenantProfilePatchRequest }) =>
      tenantApi.patch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setEditingTenant(null);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Cập nhật hồ sơ thất bại.');
    },
  });

  const resetForm = () => {
    setUserId('');
    setFullName('');
    setPhoneNumber('');
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (t: TenantProfile) => {
    resetForm();
    setEditingTenant(t);
    setFullName(t.full_name);
    setPhoneNumber(t.phone_number || '');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !fullName.trim()) {
      setFormError('Vui lòng nhập Mã định danh User ID và Họ tên khách thuê.');
      return;
    }
    createMutation.mutate({
      user_id: userId.trim(),
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim() || undefined,
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    if (!fullName.trim()) {
      setFormError('Vui lòng nhập Họ tên.');
      return;
    }
    patchMutation.mutate({
      id: editingTenant.id,
      data: {
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim() || null,
      },
    });
  };

  if (error) {
    return (
      <ErrorState
        title="Lỗi tải danh sách khách thuê"
        message="Không thể kết nối đến máy chủ. Vui lòng thử lại."
        onRetry={() => refetch()}
      />
    );
  }

  const tenants = tenantsData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Quản lý khách thuê</h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Danh sách hồ sơ khách thuê được phân công quản lý dưới tài khoản của bạn.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Thêm hồ sơ khách thuê
        </Button>
      </div>

      {/* Tenant Profile Cards / Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7 text-primary/60" />}
          title="Chưa có khách thuê nào"
          description="Tạo hồ sơ khách thuê đầu tiên bằng mã định danh tài khoản để bắt đầu ký hợp đồng thuê phòng."
          actionLabel="Tạo hồ sơ khách thuê"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tenants.map((t) => (
            <Card key={t.id} hoverable className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-sm shrink-0">
                      {t.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink text-base line-clamp-1">{t.full_name}</h3>
                      <span className="text-xs text-ink-muted">Khách thuê</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(t)}
                    title="Chỉnh sửa thông tin liên hệ"
                    aria-label="Chỉnh sửa thông tin"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <div className="space-y-2 text-xs text-ink-secondary my-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                    <span>{t.phone_number || 'Chưa cập nhật số điện thoại'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                    <span className="font-mono text-[11px] text-ink-muted truncate" title={t.user_id}>
                      UID: {t.user_id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-ink-muted pt-2 border-t border-border/60">
                Hồ sơ định danh bảo mật
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={page}
        pageSize={10}
        totalItems={tenants.length}
        onPageChange={(p) => setPage(p)}
      />

      {/* Create Tenant Profile Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Thêm hồ sơ khách thuê"
        description="Nhập mã UUID người dùng đã đăng ký và thông tin liên lạc của khách thuê."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs">
              {formError}
            </div>
          )}
          <Input
            label="Mã User ID của tài khoản khách (UUID)"
            placeholder="Ví dụ: e3b0c442-98fc-1c14-9afbf4c8996fb924"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Họ và tên khách thuê"
            placeholder="Ví dụ: Nguyễn Văn A"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <Input
            label="Số điện thoại"
            type="tel"
            placeholder="Ví dụ: 0912345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
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
              Tạo hồ sơ
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Tenant Profile Dialog */}
      <Dialog
        isOpen={!!editingTenant}
        onClose={() => setEditingTenant(null)}
        title="Chỉnh sửa thông tin liên hệ"
        description="Lưu ý: Mã tài khoản và chủ nhà quản lý là bất biến."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs">
              {formError}
            </div>
          )}
          <Input
            label="Họ và tên khách thuê"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoFocus
          />
          <Input
            label="Số điện thoại"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Để trống nếu muốn xóa số điện thoại"
          />
          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingTenant(null)}
              disabled={patchMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={patchMutation.isPending}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
