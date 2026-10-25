import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi, contractApi } from '../../shared/api';
import {
  Maintenance,
  MaintenanceCreateRequest,
  MaintenancePreviewRequest,
  MaintenancePreviewResponse,
} from '../../shared/types';
import {
  Card,
  Button,
  Badge,
  Textarea,
  Select,
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
  aiClassificationStatusMap,
} from '../../shared/utils/format';
import {
  Wrench,
  Plus,
  Sparkles,
  AlertTriangle,
  Send,
  RotateCcw,
} from 'lucide-react';

export const TenantMaintenance: React.FC = () => {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<Maintenance | null>(null);

  // Workflow states
  const [step, setStep] = useState<'INPUT' | 'PREVIEW'>('INPUT');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // AI preview result
  const [previewResult, setPreviewResult] = useState<MaintenancePreviewResponse | null>(null);

  const queryClient = useQueryClient();

  // Query tenant's active contracts to determine their room
  const { data: contractsData } = useQuery({
    queryKey: ['contracts', 'for-maintenance'],
    queryFn: () => contractApi.list({ status: 'ACTIVE', page: 1, page_size: 10 }),
    enabled: isCreateOpen,
  });

  React.useEffect(() => {
    if (contractsData?.items && contractsData.items.length > 0 && !selectedRoomId) {
      setSelectedRoomId(contractsData.items[0].room_id);
    }
  }, [contractsData, selectedRoomId]);

  // Query maintenance requests
  const {
    data: maintenanceData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['maintenance', 'tenant-view', page],
    queryFn: () => maintenanceApi.list({ page, page_size: 10 }),
  });

  // AI Preview mutation
  const previewMutation = useMutation({
    mutationFn: (data: MaintenancePreviewRequest) => maintenanceApi.preview(data),
    onSuccess: (result) => {
      setPreviewResult(result);
      setStep('PREVIEW');
      setFormError(null);
    },
    onError: () => {
      // If AI fails or returns error, provide safe fallback
      setFormError(
        'Không thể phân tích bằng AI vào lúc này. Bạn vẫn có thể gửi yêu cầu trực tiếp đến chủ nhà.'
      );
    },
  });

  // Submit maintenance mutation
  const submitMutation = useMutation({
    mutationFn: (data: MaintenanceCreateRequest) => maintenanceApi.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      setIsCreateOpen(false);
      resetWorkflow();
    },
    onError: (err: any) => {
      if (err.status === 409) {
        setFormError('Yêu cầu đã được gửi trước đó hoặc có xung đột dữ liệu.');
      } else {
        setFormError(err.message || 'Không thể tạo yêu cầu sửa chữa.');
      }
    },
  });

  const resetWorkflow = () => {
    setStep('INPUT');
    setSelectedRoomId('');
    setDescription('');
    setPreviewResult(null);
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetWorkflow();
    // Default to the first active contract's room
    if (contractsData?.items?.length) {
      setSelectedRoomId(contractsData.items[0].room_id);
    }
    setIsCreateOpen(true);
  };

  const handleRunAiPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setFormError('Vui lòng chọn phòng cần báo sửa chữa.');
      return;
    }
    if (!description.trim()) {
      setFormError('Vui lòng mô tả chi tiết sự cố gặp phải.');
      return;
    }
    setFormError(null);
    // Exact original description preserved without arbitrary trimming
    previewMutation.mutate({
      room_id: selectedRoomId,
      original_description: description,
    });
  };

  // Explicit confirmation submit (using AI preview token)
  const handleConfirmSubmit = () => {
    if (!selectedRoomId || !description) return;
    const submissionKey = crypto.randomUUID();
    submitMutation.mutate({
      room_id: selectedRoomId,
      original_description: description,
      submission_key: submissionKey,
      preview_token: previewResult?.preview_token || null,
    });
  };

  // Safe manual fallback submit (without AI)
  const handleManualFallbackSubmit = () => {
    if (!selectedRoomId || !description.trim()) {
      setFormError('Vui lòng chọn phòng và mô tả sự cố.');
      return;
    }
    const submissionKey = crypto.randomUUID();
    submitMutation.mutate({
      room_id: selectedRoomId,
      original_description: description,
      submission_key: submissionKey,
      preview_token: null,
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
  const contracts = contractsData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Yêu cầu sửa chữa</h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Báo cáo sự cố thiết bị hoặc yêu cầu bảo trì tiện ích phòng với sự trợ giúp của AI.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleOpenCreate}
        >
          Báo sự cố mới
        </Button>
      </div>

      {/* Requests Listing */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Wrench className="w-7 h-7 text-primary/60" />}
          title="Chưa có yêu cầu sửa chữa nào"
          description="Khi có sự cố về điện, nước, điều hòa hay thiết bị trong phòng, bạn có thể tạo yêu cầu tại đây."
          actionLabel="Tạo yêu cầu sửa chữa"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3">
          {requests.map((item) => {
            const statusInfo = maintenanceStatusMap[item.status];
            const priorityInfo = item.priority ? maintenancePriorityMap[item.priority] : null;

            return (
              <Card
                key={item.id}
                hoverable
                className="p-4 sm:p-5 cursor-pointer"
                onClick={() => setSelectedDetail(item)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-semibold text-ink text-sm sm:text-base line-clamp-1">
                        {item.original_description}
                      </span>
                      <Badge variant={statusInfo.variant} size="sm" dot>
                        {statusInfo.label}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-secondary">
                      {item.category && (
                        <span className="font-medium text-ink">
                          {maintenanceCategoryMap[item.category]}
                        </span>
                      )}
                      {priorityInfo && (
                        <>
                          <span>•</span>
                          <Badge variant={priorityInfo.variant} size="sm">
                            Độ ưu tiên: {priorityInfo.label}
                          </Badge>
                        </>
                      )}
                      <span>•</span>
                      <span>Báo lúc: {formatDate(item.created_at)}</span>
                    </div>

                    {item.ai_summary && (
                      <p className="text-xs text-primary bg-primary-soft/40 p-2 rounded-control border border-primary/20 line-clamp-1">
                        ✨ Tóm tắt: {item.ai_summary}
                      </p>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-primary hover:underline shrink-0">
                    Chi tiết &rarr;
                  </span>
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

      {/* Create / AI Preview Modal */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={step === 'INPUT' ? 'Báo sự cố tiện ích phòng' : 'Xem trước phân tích AI'}
        maxWidth="lg"
      >
        {step === 'INPUT' ? (
          <form onSubmit={handleRunAiPreview} className="space-y-4">
            {formError && (
              <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs">
                {formError}
              </div>
            )}

            <Select
              label="Chọn phòng gặp sự cố"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              options={contracts.map((c) => ({
                value: c.room_id,
                label: `Phòng thuê (HĐ #${c.id.substring(0, 8)})`,
              }))}
              placeholder="Chọn một phòng trọ"
              required
            />

            <Textarea
              label="Mô tả sự cố chi tiết"
              placeholder="Ví dụ: Vòi nước bồn rửa mặt bị rỉ nước liên tục từ tối qua, cần thợ kiểm tra gấp..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              maxCharacters={5000}
              helperText="Mô tả càng chi tiết sẽ giúp AI phân loại chính xác mức độ ưu tiên và vật tư cần chuẩn bị."
            />

            <div className="p-3 bg-surface-subtle border border-border rounded-control flex items-start gap-2.5 text-xs text-ink-secondary">
              <Sparkles className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <span>
                Hệ thống sẽ gửi mô tả đến mô hình AI để tự động phân loại chuyên mục và mức độ ưu tiên trước khi bạn xác nhận gửi.
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleManualFallbackSubmit}
                isLoading={submitMutation.isPending}
                disabled={previewMutation.isPending}
              >
                Gửi trực tiếp không dùng AI
              </Button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={previewMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={previewMutation.isPending}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Phân tích với AI
                </Button>
              </div>
            </div>
          </form>
        ) : (
          /* STEP 2: PREVIEW RESULT & EXPLICIT CONFIRMATION */
          <div className="space-y-5 animate-in fade-in-50 duration-200">
            {formError && (
              <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs">
                {formError}
              </div>
            )}

            {/* AI Suggestion Box */}
            <div className="p-4 bg-primary-soft/30 border border-primary/20 rounded-container space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  Đề xuất từ AI
                </span>
                {previewResult?.ai_classification_status && (
                  <Badge
                    variant={
                      aiClassificationStatusMap[previewResult.ai_classification_status].variant
                    }
                    size="sm"
                  >
                    {aiClassificationStatusMap[previewResult.ai_classification_status].label}
                  </Badge>
                )}
              </div>

              {previewResult?.classification ? (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-ink-muted block">Chuyên mục đề xuất</span>
                      <strong className="text-ink font-semibold text-sm">
                        {maintenanceCategoryMap[previewResult.classification.category]}
                      </strong>
                    </div>
                    <div>
                      <span className="text-ink-muted block">Mức độ ưu tiên</span>
                      <strong className="text-ink font-semibold text-sm">
                        {maintenancePriorityMap[previewResult.classification.priority].label}
                      </strong>
                    </div>
                  </div>

                  {previewResult.classification.summary && (
                    <div>
                      <span className="text-xs text-ink-muted block">Tóm lược sự cố</span>
                      <p className="text-sm font-medium text-ink bg-surface p-2.5 rounded-control border border-border mt-1">
                        {previewResult.classification.summary}
                      </p>
                    </div>
                  )}

                  {/* Missing information warning if any */}
                  {previewResult.classification.missing_information?.length > 0 && (
                    <div className="p-3 bg-status-warning-soft border border-status-warning-border rounded-control text-xs text-status-warning space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>AI khuyến nghị bổ sung thông tin sau để xử lý nhanh hơn:</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-ink-secondary pl-1">
                        {previewResult.classification.missing_information.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-ink-secondary">
                  Mô hình AI chưa thể phân loại chi tiết. Bạn có thể gửi sự cố như mô tả ban đầu.
                </p>
              )}
            </div>

            {/* Original description confirmation */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Nội dung mô tả nguyên bản gửi chủ nhà
              </label>
              <div className="p-3 bg-surface-subtle border border-border rounded-control text-xs text-ink font-mono whitespace-pre-wrap">
                {description}
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-ink-muted italic">
              * Kết quả phân tích của AI chỉ mang tính tham khảo. Chủ nhà sẽ trực tiếp xác nhận và sắp xếp phương án xử lý thực tế.
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep('INPUT')}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                disabled={submitMutation.isPending}
              >
                Sửa lại mô tả
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConfirmSubmit}
                  isLoading={submitMutation.isPending}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Xác nhận gửi yêu cầu
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* Request Details View Dialog */}
      {selectedDetail && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedDetail(null)}
          title="Chi tiết yêu cầu sửa chữa"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <Badge variant={maintenanceStatusMap[selectedDetail.status].variant} size="md" dot>
                {maintenanceStatusMap[selectedDetail.status].label}
              </Badge>
              <span className="text-xs text-ink-muted">
                {formatDate(selectedDetail.created_at)}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-ink-muted block uppercase font-semibold">
                Nội dung báo hỏng
              </span>
              <p className="text-sm text-ink bg-surface-subtle p-3 rounded-control border border-border">
                {selectedDetail.original_description}
              </p>
            </div>

            {selectedDetail.ai_summary && (
              <div className="space-y-1">
                <span className="text-xs text-primary font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Tóm tắt AI
                </span>
                <p className="text-xs text-ink-secondary bg-primary-soft/30 p-2.5 rounded-control border border-primary/20">
                  {selectedDetail.ai_summary}
                </p>
              </div>
            )}

            {selectedDetail.cancellation_reason && (
              <div className="space-y-1">
                <span className="text-xs text-status-error font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Lý do hủy yêu cầu
                </span>
                <p className="text-xs text-status-error bg-status-error-soft p-2.5 rounded-control border border-status-error-border">
                  {selectedDetail.cancellation_reason}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setSelectedDetail(null)}>
                Đóng
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
