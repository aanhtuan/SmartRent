import { apiClient, getAccessToken } from './client';
import { FinancialSummary, OccupancySummary } from '../types';

export const analyticsApi = {
  getFinancialSummary: async (year?: number): Promise<FinancialSummary> => {
    return apiClient<FinancialSummary>('/api/analytics/financial-summary', {
      params: year ? { year } : undefined,
    });
  },

  getOccupancy: async (): Promise<OccupancySummary> => {
    return apiClient<OccupancySummary>('/api/analytics/occupancy', {
      method: 'GET',
    });
  },

  downloadPaymentsCsv: async (): Promise<void> => {
    const token = getAccessToken();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    const res = await fetch(`${baseUrl}/api/analytics/export/payments.csv`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Không thể tải file báo cáo tài chính');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smartrent-bao-cao-tai-chinh-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
