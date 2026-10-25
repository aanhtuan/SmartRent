import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsApi } from '../../shared/api/analyticsApi';
import * as client from '../../shared/api/client';

describe('Financial Analytics and CSV Export API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches financial summary breakdown for specified year', async () => {
    const mockSummary = {
      year: 2026,
      total_revenue: 15000000,
      total_pending: 4000000,
      total_overdue: 0,
      monthly_breakdown: [
        { month: 1, revenue: 5000000, pending: 0, overdue: 0, transaction_count: 1 },
        { month: 2, revenue: 10000000, pending: 4000000, overdue: 0, transaction_count: 2 },
      ],
    };

    const spy = vi.spyOn(client, 'apiClient').mockResolvedValueOnce(mockSummary as any);

    const res = await analyticsApi.getFinancialSummary(2026);

    expect(spy).toHaveBeenCalledWith('/api/analytics/financial-summary', {
      params: { year: 2026 },
    });
    expect(res.year).toBe(2026);
    expect(res.total_revenue).toBe(15000000);
    expect(res.monthly_breakdown).toHaveLength(2);
  });

  it('fetches occupancy metrics for landlord properties', async () => {
    const mockOccupancy = {
      total_rooms: 10,
      occupied_rooms: 8,
      available_rooms: 2,
      occupancy_rate: 80.0,
    };

    const spy = vi.spyOn(client, 'apiClient').mockResolvedValueOnce(mockOccupancy as any);

    const res = await analyticsApi.getOccupancy();

    expect(spy).toHaveBeenCalledWith('/api/analytics/occupancy', {
      method: 'GET',
    });
    expect(res.total_rooms).toBe(10);
    expect(res.occupancy_rate).toBe(80.0);
    expect(res.occupied_rooms).toBe(8);
  });

  it('downloads payments CSV report triggering browser download blob', async () => {
    const mockBlob = new Blob(['\uFEFFMã hóa đơn,Kỳ,Hạn,Số tiền\n'], { type: 'text/csv' });
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      blob: vi.fn().mockResolvedValueOnce(mockBlob),
    });

    const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/test');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    const clickMock = vi.fn();
    HTMLAnchorElement.prototype.click = clickMock;

    const appendChildSpy = vi.spyOn(document.body, 'appendChild');
    const removeChildSpy = vi.spyOn(document.body, 'removeChild');

    await analyticsApi.downloadPaymentsCsv();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/analytics/export/payments.csv'),
      expect.any(Object)
    );
    expect(createObjectURLMock).toHaveBeenCalledWith(mockBlob);
    expect(clickMock).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });
});
