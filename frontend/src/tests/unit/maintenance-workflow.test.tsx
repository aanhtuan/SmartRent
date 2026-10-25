import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantMaintenance } from '@/features/maintenance/TenantMaintenance';
import { maintenanceApi, contractApi } from '@/shared/api';

describe('Tenant Maintenance AI Workflow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.restoreAllMocks();

    // Mock active contracts query
    vi.spyOn(contractApi, 'list').mockResolvedValue({
      items: [
        {
          id: 'contract-1',
          tenant_profile_id: 'tenant-1',
          room_id: 'room-101',
          start_date: '2026-01-01',
          end_date: '2026-12-31',
          status: 'ACTIVE',
        },
      ],
      page: 1,
      page_size: 10,
    });

    // Mock maintenance list
    vi.spyOn(maintenanceApi, 'list').mockResolvedValue({
      items: [],
      page: 1,
      page_size: 10,
    });
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <TenantMaintenance />
      </QueryClientProvider>
    );

  it('allows tenant to open modal, run AI preview, and explicitly confirm submission', async () => {
    const previewSpy = vi.spyOn(maintenanceApi, 'preview').mockResolvedValue({
      room_id: 'room-101',
      original_description: 'Vòi sen tắm bị rỉ nước liên tục',
      ai_classification_status: 'CLASSIFIED',
      classification: {
        category: 'PLUMBING',
        priority: 'MEDIUM',
        summary: 'Vòi sen phòng tắm bị rò rỉ nước, cần kiểm tra van xả',
        missing_information: [],
        confidence: 0.95,
      },
      preview_token: 'hmac-preview-token-xyz',
      expires_at: '2026-10-25T14:35:00Z',
    });

    const submitSpy = vi.spyOn(maintenanceApi, 'submit').mockResolvedValue({
      id: 'maint-1',
      room_id: 'room-101',
      original_description: 'Vòi sen tắm bị rỉ nước liên tục',
      category: 'PLUMBING',
      priority: 'MEDIUM',
      ai_summary: 'Vòi sen phòng tắm bị rò rỉ nước, cần kiểm tra van xả',
      ai_confidence: 0.95,
      ai_missing_information: [],
      ai_classification_status: 'CLASSIFIED',
      status: 'PENDING',
      cancellation_reason: null,
      created_at: '2026-10-25T14:30:00Z',
      updated_at: '2026-10-25T14:30:00Z',
    });

    renderComponent();

    // Click "Báo sự cố mới"
    const openBtn = screen.getByRole('button', { name: /Báo sự cố mới/i });
    fireEvent.click(openBtn);

    // Fill form
    await waitFor(() => {
      expect(screen.getByLabelText(/Mô tả sự cố chi tiết/i)).toBeInTheDocument();
    });

    const roomSelect = screen.getByLabelText(/Chọn phòng gặp sự cố/i);
    fireEvent.change(roomSelect, { target: { value: 'room-101' } });

    const descInput = screen.getByLabelText(/Mô tả sự cố chi tiết/i);
    fireEvent.change(descInput, {
      target: { value: 'Vòi sen tắm bị rỉ nước liên tục' },
    });

    // Step 2: Click "Phân tích với AI"
    const aiPreviewBtn = screen.getByRole('button', { name: /Phân tích với AI/i });
    fireEvent.click(aiPreviewBtn);

    // Verify AI preview was called
    await waitFor(() => {
      expect(previewSpy).toHaveBeenCalledWith({
        room_id: 'room-101',
        original_description: 'Vòi sen tắm bị rỉ nước liên tục',
      });
    });

    // Step 3: Verify preview cards are displayed
    await waitFor(() => {
      expect(screen.getByText('Xem trước phân tích AI')).toBeInTheDocument();
      expect(screen.getByText('Nước / Vệ sinh')).toBeInTheDocument();
      expect(screen.getByText(/Vòi sen phòng tắm bị rò rỉ nước/i)).toBeInTheDocument();
    });

    // Step 4: Click "Xác nhận gửi yêu cầu"
    const confirmBtn = screen.getByRole('button', { name: /Xác nhận gửi yêu cầu/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledTimes(1);
      const callArg = submitSpy.mock.calls[0][0];
      expect(callArg.room_id).toBe('room-101');
      expect(callArg.original_description).toBe('Vòi sen tắm bị rỉ nước liên tục');
      expect(callArg.preview_token).toBe('hmac-preview-token-xyz');
      expect(callArg.submission_key).toBeTruthy();
    });
  });

  it('supports safe manual fallback submission without AI', async () => {
    const submitSpy = vi.spyOn(maintenanceApi, 'submit').mockResolvedValue({
      id: 'maint-2',
      room_id: 'room-101',
      original_description: 'Bóng đèn trần bị cháy',
      category: null,
      priority: null,
      ai_summary: null,
      ai_confidence: null,
      ai_missing_information: [],
      ai_classification_status: 'NOT_REQUESTED',
      status: 'PENDING',
      cancellation_reason: null,
      created_at: '2026-10-25T14:30:00Z',
      updated_at: '2026-10-25T14:30:00Z',
    });

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /Báo sự cố mới/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Mô tả sự cố chi tiết/i)).toBeInTheDocument();
    });

    const roomSelect = screen.getByLabelText(/Chọn phòng gặp sự cố/i);
    fireEvent.change(roomSelect, { target: { value: 'room-101' } });

    fireEvent.change(screen.getByLabelText(/Mô tả sự cố chi tiết/i), {
      target: { value: 'Bóng đèn trần bị cháy' },
    });

    // Click safe manual fallback button
    const fallbackBtn = screen.getByRole('button', { name: /Gửi trực tiếp không dùng AI/i });
    fireEvent.click(fallbackBtn);

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledTimes(1);
      const callArg = submitSpy.mock.calls[0][0];
      expect(callArg.original_description).toBe('Bóng đèn trần bị cháy');
      expect(callArg.preview_token).toBeNull();
    });
  });
});
