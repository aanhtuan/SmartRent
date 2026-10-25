import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '../../shared/api';
import { Maintenance, MaintenanceStatusUpdateRequest, MaintenanceClassifyRequest } from '../../shared/types';
import {
  Card,
  Button,
  Badge,
  Textarea,
  Dialog,
  Skeleton,
  EmptyState,
  ErrorState,
  Pagination,
} from '../../shared/components/ui';
import {
  formatDate,
  maintenanceCategoryMap,
  maintenancePriorityMap,
  maintenanceStatusMap,
} from '../../shared/utils/format';
import {
  Wrench,
  Sparkles,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';

export const MaintenanceList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  // Dialog states
  const [cancellingRequest, setCancellingRequest] = useState<Maintenance | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [classifyingRequest, setClassifyingRequest] = useState<Maintenance | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Query maintenance requests
  const {
    data: maintenanceData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['maintenance', 'landlord', page, statusFilter, priorityFilter],
    queryFn: () =>
      maintenanceApi.list({
        page,
        page_size: 10,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      }),
  });

  // Status update mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MaintenanceStatusUpdateRequest }) =>
      maintenanceApi.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setCancellingRequest(null);
      setCancellationReason('');
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || 'Không thể chuyển đổi trạng thái.');
    },
  });

  // Reclassify mutation
  const classifyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MaintenanceClassifyRequest }) =>
      maintenanceApi.classify(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setClassifyingRequest(null);
      setAdditionalInfo('');
      setActionError(null);
    },
    onError: (err: any) => {
      setActionError(err.message || 'Không thể phân loại lại bằng AI.');
    },
  });

  const handleStartProcessing = (m: Maintenance) => {
    setActionError(null);
    statusMutation.mutate({
      id: m.id,
      data: { status: 'PROCESSING' },
    });
  };

  const handleComplete = (m: Maintenance) => {
    setActionError(null);
    statusMutation.mutate({
      id: m.id,
      data: { status: 'COMPLETED' },
    });
  };

  const handleConfirmCancel = () => {
    if (!cancellingRequest) return;
    if (!cancellationReason.trim()) {
      setActionError('Vui lòng nhập lý do hủy yêu cầu.');
      return;
    }
    statusMutation.mutate({
      id: cancellingRequest.id,
      data: {
        status: 'CANCELLED',
        cancellation_reason: cancellationReason.trim(),
      },
    });
  };

  const handleConfirmClassify = () => {
    if (!classifyingRequest) return;
    classifyMutation.mutate({
      id: classifyingRequest.id,
      data: {
        additional_information: additionalInfo.trim() || undefined,
      },
    });
  };

  if (error) {
    return (
      <ErrorState
        title="Lỗi tải danh sách yêu cầu sửa chữa"
        message="Không thể kết nối đến máy chủ. Vui lòng thử lại."
        onRetry={() => refetch()}
      />
    );
  }

  const requests = maintenanceData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Quản lý sửa chữa & Bảo trì</h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-1">
          Hộp thư tiếp nhận các báo cáo sự cố từ khách thuê, phân loại ưu tiên và cập nhật tiến độ xử lý.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { value: '', label: 'Tất cả' },
            { value: 'PENDING', label: 'Chờ tiếp nhận' },
            { value: 'PROCESSING', label: 'Đang xử lý' },
            { value: 'COMPLETED', label: 'Đã hoàn thành' },
            { value: 'CANCELLED', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface border border-border text-ink-secondary hover:text-ink hover:bg-surface-subtle'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-ink-muted">Mức ưu tiên:</span>
          {['', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPriorityFilter(p);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-control text-xs font-medium transition-colors ${
                priorityFilter === p
                  ? 'bg-ink text-white'
                  : 'bg-surface border border-border text-ink-secondary hover:text-ink'
              }`}
            >
              {p === '' ? 'Tất cả' : p === 'HIGH' ? 'Khẩn cấp' : p === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs font-medium">
          {actionError}
        </div>
      )}

      {/* Requests List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Wrench className="w-7 h-7 text-primary/60" />}
          title="Không có yêu cầu sửa chữa nào"
          description="Hiện tại không có báo cáo sự cố nào phù hợp với bộ lọc đã chọn."
        />
      ) : (
        <div className="space-y-3.5">
          {requests.map((item) => {
            const statusInfo = maintenanceStatusMap[item.status];
            const priorityInfo = item.priority ? maintenancePriorityMap[item.priority] : null;

            return (
              <Card key={item.id} hoverable className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-semibold text-ink text-sm sm:text-base">
                        {item.original_description}
                      </span>
                      <Badge variant={statusInfo.variant} size="sm" dot>
                        {statusInfo.label}
                      </Badge>
                      {priorityInfo && (
                        <Badge variant={priorityInfo.variant} size="sm">
                          {priorityInfo.label}
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-secondary">
                      {item.category && (
                        <span>
                          Chuyên mục:{' '}
                          <strong className="text-ink">
                            {maintenanceCategoryMap[item.category]}
                          </strong>
                        </span>
                      )}
                      <span>•</span>
                      <span>Ngày gửi: {formatDate(item.created_at)}</span>
                      <span>•</span>
                      <span className="font-mono text-ink-muted">
                        Phòng: {item.room_id.substring(0, 8)}...
                      </span>
                    </div>

                    {item.ai_summary && (
                      <div className="text-xs text-primary bg-primary-soft/40 p-2 rounded-control border border-primary/20 flex items-start gap-1.5 max-w-2xl">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>AI tóm tắt: {item.ai_summary}</span>
                      </div>
                    )}

                    {item.cancellation_reason && (
                      <p className="text-xs text-status-error bg-status-error-soft/60 p-2 rounded-control border border-status-error-border">
                        Lý do hủy: {item.cancellation_reason}
                      </p>
                    )}
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setClassifyingRequest(item);
                        setAdditionalInfo('');
                      }}
                      title="Phân loại lại bằng AI"
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-accent" />}
                    >
                      Phân loại AI
                    </Button>

                    {item.status === 'PENDING' && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<PlayCircle className="w-4 h-4" />}
                        onClick={() => handleStartProcessing(item)}
                        isLoading={statusMutation.isPending}
                      >
                        Tiếp nhận
                      </Button>
                    )}

                    {item.status === 'PROCESSING' && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-status-error hover:bg-status-error-soft"
                          onClick={() => {
                            setCancellingRequest(item);
                            setCancellationReason('');
                          }}
                        >
                          Hủy yêu cầu
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => handleComplete(item)}
                          isLoading={statusMutation.isPending}
                        >
                          Hoàn thành
                        </Button>
                      </div>
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
        totalItems={requests.length}
        onPageChange={(p) => setPage(p)}
      />

      {/* Cancel Reason Dialog */}
      <Dialog
        isOpen={!!cancellingRequest}
        onClose={() => setCancellingRequest(null)}
        title="Hủy yêu cầu sửa chữa"
        description="Vui lòng nêu rõ lý do hủy để thông báo đến khách thuê."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <Textarea
            label="Lý do hủy (Bắt buộc)"
            placeholder="Ví dụ: Thiết bị do khách tự ý tháo lắp / Đã hẹn lịch kiểm tra nhưng khách vắng nhà..."
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            rows={3}
            maxCharacters={500}
            required
            autoFocus
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancellingRequest(null)}
              disabled={statusMutation.isPending}
            >
              Quay lại
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirmCancel}
              isLoading={statusMutation.isPending}
            >
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </Dialog>

      {/* AI Reclassify Dialog */}
      <Dialog
        isOpen={!!classifyingRequest}
        onClose={() => setClassifyingRequest(null)}
        title="Phân loại lại yêu cầu bằng AI"
        description="Gửi lại nội dung sự cố kèm thông tin bổ sung để mô hình AI phân loại lại danh mục và mức độ ưu tiên."
      >
        <div className="space-y-4">
          <div className="p-3 bg-surface-subtle border border-border rounded-control text-xs text-ink-secondary">
            <span className="font-semibold text-ink block mb-1">Mô tả sự cố ban đầu:</span>
            {classifyingRequest?.original_description}
          </div>

          <Textarea
            label="Thông tin bổ sung cho AI (Tùy chọn)"
            placeholder="Ví dụ: Nước tràn ra sàn nhà gây nguy cơ trơn trượt và chập điện..."
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={3}
            maxCharacters={2000}
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setClassifyingRequest(null)}
              disabled={classifyMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirmClassify}
              isLoading={classifyMutation.isPending}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Tiến hành phân loại
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
