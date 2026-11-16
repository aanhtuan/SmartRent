import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contractApi, tenantApi, propertyApi, roomApi } from '../../shared/api';
import { Contract, ContractCreateRequest, ContractStatus } from '../../shared/types';
import { ContractPrintModal } from './ContractPrintModal';
import {
  Card,
  Button,
  Badge,
  Input,
  Select,
  Dialog,
  ConfirmDialog,
  Skeleton,
  EmptyState,
  ErrorState,
  Pagination,
} from '../../shared/components/ui';
import { contractStatusMap, formatDate } from '../../shared/utils/format';
import { FileText, Plus, Calendar, Ban, UserCheck, Printer } from 'lucide-react';

export const ContractList: React.FC = () => {
  const [selectedPrintContract, setSelectedPrintContract] = useState<Contract | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [terminatingContract, setTerminatingContract] = useState<Contract | null>(null);

  // Create form state
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Contracts query
  const {
    data: contractsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['contracts', page, statusFilter],
    queryFn: () =>
      contractApi.list({
        page,
        page_size: 10,
        status: (statusFilter || undefined) as ContractStatus | undefined,
      }),
  });

  // Fetch tenants for creation dropdown
  const { data: tenantsData } = useQuery({
    queryKey: ['tenants', 'all'],
    queryFn: () => tenantApi.list({ page: 1, page_size: 100 }),
    enabled: isCreateOpen,
  });

  // Fetch properties for creation dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['properties', 'all'],
    queryFn: () => propertyApi.list({ page: 1, page_size: 100 }),
    enabled: isCreateOpen,
  });

  // Fetch rooms for chosen property
  const { data: roomsData } = useQuery({
    queryKey: ['rooms', selectedPropertyId],
    queryFn: () => roomApi.listByProperty(selectedPropertyId, { page: 1, page_size: 100 }),
    enabled: isCreateOpen && !!selectedPropertyId,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: ContractCreateRequest) => contractApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      if (err.status === 409) {
        setFormError('Phòng này đã có hợp đồng thuê trùng lặp thời gian hoặc đang có khách.');
      } else {
        setFormError(err.message || 'Không thể tạo hợp đồng. Vui lòng kiểm tra lại thời gian.');
      }
    },
  });

  const terminateMutation = useMutation({
    mutationFn: (id: string) => contractApi.patch(id, { status: 'TERMINATED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setTerminatingContract(null);
    },
    onError: (err: any) => {
      alert(err.message || 'Không thể chấm dứt hợp đồng.');
      setTerminatingContract(null);
    },
  });

  const resetForm = () => {
    setSelectedTenantId('');
    setSelectedPropertyId('');
    setSelectedRoomId('');
    setStartDate('');
    setEndDate('');
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !selectedRoomId || !startDate || !endDate) {
      setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setFormError('Ngày bắt đầu không được lớn hơn ngày kết thúc hợp đồng.');
      return;
    }
    createMutation.mutate({
      tenant_profile_id: selectedTenantId,
      room_id: selectedRoomId,
      start_date: startDate,
      end_date: endDate,
    });
  };

  if (error) {
    return (
      <ErrorState
        title="Lỗi tải danh sách hợp đồng"
        message="Không thể kết nối đến máy chủ. Vui lòng thử lại."
        onRetry={() => refetch()}
      />
    );
  }

  const contracts = contractsData?.items ?? [];
  const tenants = tenantsData?.items ?? [];
  const properties = propertiesData?.items ?? [];
  const rooms = roomsData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Quản lý hợp đồng thuê</h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Theo dõi thời hạn thuê phòng, tình trạng hiệu lực và lập hợp đồng mới cho khách.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Tạo hợp đồng mới
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { value: '', label: 'Tất cả trạng thái' },
          { value: 'ACTIVE', label: 'Đang hiệu lực' },
          { value: 'EXPIRED', label: 'Đã hết hạn' },
          { value: 'TERMINATED', label: 'Đã chấm dứt' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setStatusFilter(tab.value);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface border border-border text-ink-secondary hover:text-ink hover:bg-surface-subtle'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contracts Listing */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : contracts.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-7 h-7 text-primary/60" />}
          title="Không tìm thấy hợp đồng nào"
          description="Chưa có hợp đồng nào phù hợp với bộ lọc hiện tại. Bấm nút dưới để tạo hợp đồng thuê mới."
          actionLabel="Tạo hợp đồng"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3.5">
          {contracts.map((c) => {
            const statusInfo = contractStatusMap[c.status];
            return (
              <Card key={c.id} hoverable className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="w-8 h-8 rounded-control bg-primary-soft text-primary flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-ink text-sm sm:text-base font-mono">
                        HĐ-{c.id.substring(0, 8).toUpperCase()}
                      </span>
                      <Badge variant={statusInfo.variant} size="sm" dot>
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-ink-secondary">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                        <span>
                          Thời hạn: <strong>{formatDate(c.start_date)}</strong> đến{' '}
                          <strong>{formatDate(c.end_date)}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-ink-muted" />
                        <span className="font-mono text-[11px] text-ink-muted truncate max-w-[200px]" title={c.tenant_profile_id}>
                          Hồ sơ khách: {c.tenant_profile_id.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Printer className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedPrintContract(c)}
                    >
                      Văn bản / Ký HĐ
                    </Button>
                    {c.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-status-error hover:bg-status-error-soft hover:border-status-error-border"
                      leftIcon={<Ban className="w-3.5 h-3.5" />}
                      onClick={() => setTerminatingContract(c)}
                    >
                      Chấm dứt hợp đồng
                    </Button>
                  )}
                  </div>
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
        totalItems={contracts.length}
        onPageChange={(p) => setPage(p)}
      />

      {/* Create Contract Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tạo hợp đồng thuê mới"
        description="Gán khách thuê vào phòng trọ với khung thời gian thuê cụ thể."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs">
              {formError}
            </div>
          )}

          <Select
            label="Chọn khách thuê"
            value={selectedTenantId}
            onChange={(e) => setSelectedTenantId(e.target.value)}
            options={tenants.map((t) => ({
              value: t.id,
              label: `${t.full_name} (${t.phone_number || 'Chưa có SĐT'})`,
            }))}
            placeholder="Chọn một khách thuê"
            required
          />

          <Select
            label="1. Chọn khu nhà trọ"
            value={selectedPropertyId}
            onChange={(e) => {
              setSelectedPropertyId(e.target.value);
              setSelectedRoomId('');
            }}
            options={properties.map((p) => ({
              value: p.id,
              label: p.name,
            }))}
            placeholder="Chọn nhà trọ"
            required
          />

          <Select
            label="2. Chọn phòng trọ"
            value={selectedRoomId}
            onChange={(e) => setSelectedRoomId(e.target.value)}
            options={rooms.map((r) => ({
              value: r.id,
              label: `Phòng ${r.room_code} (${r.status === 'AVAILABLE' ? 'Còn trống' : r.status})`,
            }))}
            placeholder={
              !selectedPropertyId ? 'Vui lòng chọn nhà trọ trước' : 'Chọn phòng trọ'
            }
            disabled={!selectedPropertyId}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

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
              Tạo hợp đồng
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Terminate Contract Confirm */}
      {terminatingContract && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setTerminatingContract(null)}
          onConfirm={() => terminateMutation.mutate(terminatingContract.id)}
          title="Chấm dứt hợp đồng thuê?"
          description={`Bạn có chắc muốn chấm dứt hợp đồng ${terminatingContract.id.substring(0, 8)}? Phòng sẽ được giải phóng trạng thái cho thuê.`}
          variant="danger"
          confirmLabel="Chấm dứt hợp đồng"
          isLoading={terminateMutation.isPending}
        />
      )}

      {selectedPrintContract && (
        <ContractPrintModal
          contract={selectedPrintContract}
          isOpen={!!selectedPrintContract}
          onClose={() => setSelectedPrintContract(null)}
          isLandlord={true}
        />
      )}
    </div>
  );
};
