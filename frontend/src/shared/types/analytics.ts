export interface MonthlyRevenue {
  month: number;
  revenue: number;
  pending: number;
  overdue: number;
  transaction_count: number;
}

export interface FinancialSummary {
  year: number;
  total_revenue: number;
  total_pending: number;
  total_overdue: number;
  monthly_breakdown: MonthlyRevenue[];
}

export interface OccupancySummary {
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  occupancy_rate: number;
}
