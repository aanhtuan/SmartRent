import React, { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '../../shared/api';
import { Button, Input, Textarea } from '../../shared/components/ui';
import { formatDateTime } from '../../shared/utils/format';

const PAGE_SIZE = 20;

interface MaintenanceWorkLogSectionProps {
  maintenanceRequestId: string;
  canAdd: boolean;
}

export const MaintenanceWorkLogSection: React.FC<MaintenanceWorkLogSectionProps> = ({
  maintenanceRequestId,
  canAdd,
}) => {
  const [page, setPage] = useState(1);
  const [performedBy, setPerformedBy] = useState('');
  const [workDescription, setWorkDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const workLogsQuery = useQuery({
    queryKey: ['maintenance-work-logs', maintenanceRequestId, page],
    queryFn: () =>
      maintenanceApi.listWorkLogs(maintenanceRequestId, { page, page_size: PAGE_SIZE }),
  });

  const addWorkLogMutation = useMutation({
    mutationFn: () =>
      maintenanceApi.addWorkLog(maintenanceRequestId, {
        performed_by: performedBy.trim(),
        work_description: workDescription.trim(),
      }),
    onSuccess: async () => {
      setPerformedBy('');
      setWorkDescription('');
      setFormError(null);
      setPage(1);
      await queryClient.invalidateQueries({
        queryKey: ['maintenance-work-logs', maintenanceRequestId],
      });
    },
    onError: () => {
      setFormError('Không thể lưu nhật ký sửa chữa. Vui lòng thử lại.');
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!performedBy.trim() || !workDescription.trim()) {
      setFormError('Vui lòng nhập người thực hiện và công việc đã làm.');
      return;
    }
    setFormError(null);
    addWorkLogMutation.mutate();
  };

  const workLogs = workLogsQuery.data?.items ?? [];

  return (
    <section className="space-y-4" aria-labelledby="maintenance-work-log-title">
      <div>
        <h3 id="maintenance-work-log-title" className="text-sm font-bold text-ink">
          Nhật ký sửa chữa
        </h3>
        <p className="text-xs text-ink-secondary mt-1">
          Lưu người trực tiếp sửa chữa, nội dung công việc và thời điểm ghi nhận.
        </p>
      </div>

      {canAdd && (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-control border border-border p-3">
          <Input
            label="Người trực tiếp sửa"
            value={performedBy}
            onChange={(event) => setPerformedBy(event.target.value)}
            maxLength={200}
            required
          />
          <Textarea
            label="Công việc đã thực hiện"
            value={workDescription}
            onChange={(event) => setWorkDescription(event.target.value)}
            maxLength={2000}
            maxCharacters={2000}
            rows={3}
            required
          />
          {formError && (
            <p role="alert" className="text-xs text-status-error">
              {formError}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" size="sm" isLoading={addWorkLogMutation.isPending}>
              Lưu nhật ký
            </Button>
          </div>
        </form>
      )}

      {workLogsQuery.isLoading ? (
        <p role="status" className="text-xs text-ink-muted">
          Đang tải lịch sử sửa chữa...
        </p>
      ) : workLogsQuery.error ? (
        <div className="space-y-2">
          <p role="alert" className="text-xs text-status-error">
            Không thể tải lịch sử sửa chữa.
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => workLogsQuery.refetch()}>
            Thử tải lại
          </Button>
        </div>
      ) : workLogs.length === 0 ? (
        <p className="text-xs text-ink-muted">Chưa có nhật ký sửa chữa.</p>
      ) : (
        <div className="space-y-3">
          {workLogs.map((workLog) => (
            <article key={workLog.id} className="border-l-2 border-primary/30 pl-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h4 className="text-sm font-semibold text-ink">{workLog.performed_by}</h4>
                <time
                  className="text-xs text-ink-muted"
                  dateTime={workLog.created_at}
                >
                  {formatDateTime(workLog.created_at)}
                </time>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink-secondary">
                {workLog.work_description}
              </p>
            </article>
          ))}
        </div>
      )}

      {!workLogsQuery.error && (page > 1 || workLogs.length > 0) && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Mới hơn
          </Button>
          <span className="text-xs text-ink-muted">Trang {page}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={workLogs.length < PAGE_SIZE}
            onClick={() => setPage((current) => current + 1)}
          >
            Cũ hơn
          </Button>
        </div>
      )}
    </section>
  );
};
