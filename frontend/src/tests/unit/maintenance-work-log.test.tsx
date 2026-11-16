import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MaintenanceWorkLogSection } from '@/features/maintenance/MaintenanceWorkLogSection';
import { maintenanceApi } from '@/shared/api';

const firstWorkLog = {
  id: 'work-log-1',
  performed_by: 'Thợ điện A',
  work_description: 'Thay bóng đèn hành lang.',
  created_at: '2026-11-16T08:30:00Z',
};

describe('MaintenanceWorkLogSection', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderSection = (canAdd: boolean) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MaintenanceWorkLogSection maintenanceRequestId="request-1" canAdd={canAdd} />
      </QueryClientProvider>
    );
  };

  it('lets the related tenant read repair entries without showing the entry form', async () => {
    vi.spyOn(maintenanceApi, 'listWorkLogs').mockResolvedValue({
      items: [firstWorkLog],
      page: 1,
      page_size: 20,
    });

    renderSection(false);

    expect(await screen.findByText('Thợ điện A')).toBeInTheDocument();
    expect(screen.getByText('Thay bóng đèn hành lang.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /Người trực tiếp sửa/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Lưu nhật ký' })).not.toBeInTheDocument();
  });

  it('lets the landlord append a repair entry', async () => {
    const listSpy = vi.spyOn(maintenanceApi, 'listWorkLogs');
    listSpy.mockResolvedValueOnce({ items: [], page: 1, page_size: 20 });
    listSpy.mockResolvedValue({ items: [firstWorkLog], page: 1, page_size: 20 });
    const addSpy = vi.spyOn(maintenanceApi, 'addWorkLog').mockResolvedValue(firstWorkLog);

    renderSection(true);

    fireEvent.change(await screen.findByRole('textbox', { name: /Người trực tiếp sửa/ }), {
      target: { value: 'Thợ điện A' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: /Công việc đã thực hiện/ }), {
      target: { value: 'Thay bóng đèn hành lang.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu nhật ký' }));

    await waitFor(() => {
      expect(addSpy).toHaveBeenCalledWith('request-1', {
        performed_by: 'Thợ điện A',
        work_description: 'Thay bóng đèn hành lang.',
      });
    });
    expect(await screen.findByText('Thay bóng đèn hành lang.')).toBeInTheDocument();
  });
});
