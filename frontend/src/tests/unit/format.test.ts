import { describe, it, expect } from 'vitest';
import {
  formatVND,
  formatDate,
  propertyStatusMap,
  roomStatusMap,
  contractStatusMap,
  paymentStatusMap,
  maintenanceStatusMap,
  maintenanceCategoryMap,
  maintenancePriorityMap,
  aiClassificationStatusMap,
} from '@/shared/utils/format';

describe('formatVND', () => {
  it('formats positive whole numbers in VND without decimals', () => {
    const formatted = formatVND(5000000);
    expect(formatted).toContain('5.000.000');
    expect(formatted).toContain('₫');
  });

  it('handles zero, null, and undefined safely', () => {
    expect(formatVND(0)).toContain('0');
    expect(formatVND(null)).toBe('0 ₫');
    expect(formatVND(undefined)).toBe('0 ₫');
  });
});

describe('formatDate', () => {
  it('formats YYYY-MM-DD to DD/MM/YYYY', () => {
    expect(formatDate('2026-10-25')).toBe('25/10/2026');
    expect(formatDate('2026-01-05')).toBe('05/01/2026');
  });

  it('handles null or empty date gracefully', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
  });
});

describe('Status and Category Maps', () => {
  it('maps property statuses correctly', () => {
    expect(propertyStatusMap.ACTIVE.label).toBe('Đang hoạt động');
    expect(propertyStatusMap.INACTIVE.label).toBe('Ngừng hoạt động');
  });

  it('maps room statuses correctly', () => {
    expect(roomStatusMap.AVAILABLE.label).toBe('Còn trống');
    expect(roomStatusMap.OCCUPIED.label).toBe('Đang cho thuê');
    expect(roomStatusMap.INACTIVE.label).toBe('Tạm khóa');
  });

  it('maps contract statuses correctly', () => {
    expect(contractStatusMap.ACTIVE.label).toBe('Đang hiệu lực');
    expect(contractStatusMap.EXPIRED.label).toBe('Đã hết hạn');
    expect(contractStatusMap.TERMINATED.label).toBe('Đã chấm dứt');
  });

  it('maps payment statuses correctly', () => {
    expect(paymentStatusMap.PENDING.label).toBe('Chờ thanh toán');
    expect(paymentStatusMap.PAID.label).toBe('Đã thanh toán');
    expect(paymentStatusMap.OVERDUE.label).toBe('Quá hạn');
  });

  it('maps maintenance categories and priorities correctly', () => {
    expect(maintenanceCategoryMap.ELECTRICITY).toBe('Điện dân dụng');
    expect(maintenanceCategoryMap.PLUMBING).toBe('Nước / Vệ sinh');
    expect(maintenancePriorityMap.HIGH.label).toBe('Khẩn cấp');
    expect(maintenanceStatusMap.PENDING.label).toBe('Chờ tiếp nhận');
    expect(aiClassificationStatusMap.CLASSIFIED.label).toBe('AI đã phân loại');
  });
});
