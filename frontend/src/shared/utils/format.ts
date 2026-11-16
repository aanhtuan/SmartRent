import {
  PropertyStatus,
  RoomStatus,
  ContractStatus,
  PaymentStatus,
  MaintenanceStatus,
  MaintenanceCategory,
  MaintenancePriority,
  AiClassificationStatus,
} from '../types';

export function formatVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const parts = dateString.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export const propertyStatusMap: Record<PropertyStatus, { label: string; variant: 'success' | 'inactive' }> = {
  ACTIVE: { label: 'Đang hoạt động', variant: 'success' },
  INACTIVE: { label: 'Ngừng hoạt động', variant: 'inactive' },
};

export const roomStatusMap: Record<RoomStatus, { label: string; variant: 'success' | 'info' | 'inactive' }> = {
  AVAILABLE: { label: 'Còn trống', variant: 'success' },
  OCCUPIED: { label: 'Đang cho thuê', variant: 'info' },
  INACTIVE: { label: 'Tạm khóa', variant: 'inactive' },
};

export const contractStatusMap: Record<ContractStatus, { label: string; variant: 'success' | 'warning' | 'inactive' }> = {
  ACTIVE: { label: 'Đang hiệu lực', variant: 'success' },
  TERMINATED: { label: 'Đã chấm dứt', variant: 'inactive' },
  EXPIRED: { label: 'Đã hết hạn', variant: 'warning' },
};

export const paymentStatusMap: Record<PaymentStatus, { label: string; variant: 'success' | 'warning' | 'error' }> = {
  PENDING: { label: 'Chờ thanh toán', variant: 'warning' },
  PAID: { label: 'Đã thanh toán', variant: 'success' },
  OVERDUE: { label: 'Quá hạn', variant: 'error' },
};

export const maintenanceStatusMap: Record<
  MaintenanceStatus,
  { label: string; variant: 'warning' | 'info' | 'success' | 'inactive' }
> = {
  PENDING: { label: 'Chờ tiếp nhận', variant: 'warning' },
  PROCESSING: { label: 'Đang xử lý', variant: 'info' },
  COMPLETED: { label: 'Đã hoàn thành', variant: 'success' },
  CANCELLED: { label: 'Đã hủy', variant: 'inactive' },
};

export const maintenanceCategoryMap: Record<MaintenanceCategory, string> = {
  ELECTRICITY: 'Điện dân dụng',
  PLUMBING: 'Nước / Vệ sinh',
  INTERNET: 'Mạng Internet',
  AIR_CONDITIONER: 'Điều hòa / Máy lạnh',
  FURNITURE: 'Nội thất & Gia dụng',
  CLEANING: 'Vệ sinh & Môi trường',
  OTHER: 'Khác',
};

export const maintenancePriorityMap: Record<
  MaintenancePriority,
  { label: string; variant: 'info' | 'warning' | 'error' }
> = {
  LOW: { label: 'Thấp', variant: 'info' },
  MEDIUM: { label: 'Trung bình', variant: 'warning' },
  HIGH: { label: 'Khẩn cấp', variant: 'error' },
};

export const aiClassificationStatusMap: Record<
  AiClassificationStatus,
  { label: string; variant: 'inactive' | 'success' | 'warning' | 'error' }
> = {
  NOT_REQUESTED: { label: 'Thủ công', variant: 'inactive' },
  CLASSIFIED: { label: 'AI đã phân loại', variant: 'success' },
  NEEDS_INFORMATION: { label: 'AI cần thêm thông tin', variant: 'warning' },
  INVALID: { label: 'Mô tả chưa rõ', variant: 'warning' },
  UNAVAILABLE: { label: 'AI tạm ngưng', variant: 'inactive' },
};
