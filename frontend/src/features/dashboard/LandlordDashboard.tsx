import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../shared/context/AuthContext';
import { propertyApi, contractApi, paymentApi, maintenanceApi } from '../../shared/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Skeleton,
  ErrorState,
} from '../../shared/components/ui';
import {
  formatVND,
  formatDate,
  maintenanceCategoryMap,
  maintenancePriorityMap,
  maintenanceStatusMap,
  paymentStatusMap,
} from '../../shared/utils/format';
import {
  Building2,
  FileText,
  Wrench,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandlordDashboard: React.FC = () => {
  const { user } = useAuth();

  const {
    data: propertiesData,
    isLoading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: () => propertyApi.list({ page: 1, page_size: 100 }),
  });

  const { data: contractsData, isLoading: contractsLoading } = useQuery({
    queryKey: ['contracts', user?.id],
    queryFn: () => contractApi.list({ page: 1, page_size: 100 }),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: () => paymentApi.list({ page: 1, page_size: 100 }),
  });

  const { data: maintenanceData, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['maintenance', user?.id],
    queryFn: () => maintenanceApi.list({ page: 1, page_size: 5 }),
  });

  const isLoading =
    propertiesLoading || contractsLoading || paymentsLoading || maintenanceLoading;

  if (propertiesError) {
    return (
      <ErrorState
        title="Lỗi tải dữ liệu tổng quan"
        message="Không thể kết nối đến máy chủ. Vui lòng thử lại."
        onRetry={() => refetchProperties()}
      />
    );
  }

  const propertiesCount = propertiesData?.items?.length ?? 0;
  const activeContracts =
    contractsData?.items?.filter((c) => c.status === 'ACTIVE')?.length ?? 0;

  const payments = paymentsData?.items ?? [];
  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const pendingPayments = payments.filter(
    (p) => p.status === 'PENDING' || p.status === 'OVERDUE'
  );
  const totalPendingAmount = pendingPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  const pendingMaintenanceCount =
    maintenanceData?.items?.filter((m) => m.status === 'PENDING')?.length ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Welcome header & quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Trang quản lý chủ nhà
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-0.5">
            Xin chào, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            Tổng hợp tình trạng kinh doanh nhà trọ và các hoạt động cần lưu ý hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/landlord/properties">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Building2 className="w-4 h-4 text-primary" />}
            >
              Nhà trọ
            </Button>
          </Link>
          <Link to="/landlord/contracts">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Tạo hợp đồng
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Properties */}
        <Card hoverable className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
              Bất động sản
            </span>
            <div className="w-9 h-9 rounded-control bg-primary-soft text-primary flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-ink">{propertiesCount} khu trọ</div>
            )}
            <p className="text-xs text-ink-muted mt-1">Đang được quản lý trong hệ thống</p>
          </div>
        </Card>

        {/* KPI 2: Active Contracts */}
        <Card hoverable className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
              Hợp đồng hiệu lực
            </span>
            <div className="w-9 h-9 rounded-control bg-status-info-soft text-status-info flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold text-ink">{activeContracts} phòng thuê</div>
            )}
            <p className="text-xs text-ink-muted mt-1">Đang có khách thuê sinh sống</p>
          </div>
        </Card>

        {/* KPI 3: Revenue */}
        <Card hoverable className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
              Doanh thu đã thu
            </span>
            <div className="w-9 h-9 rounded-control bg-status-success-soft text-status-success flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold text-status-success">
                {formatVND(totalPaid)}
              </div>
            )}
            <p className="text-xs text-ink-muted mt-1">
              Chờ thu: <span className="font-semibold">{formatVND(totalPendingAmount)}</span>
            </p>
          </div>
        </Card>

        {/* KPI 4: Pending Maintenance */}
        <Card hoverable className="relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
              Sự cố chờ xử lý
            </span>
            <div className="w-9 h-9 rounded-control bg-status-warning-soft text-status-warning flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold text-ink">
                {pendingMaintenanceCount} yêu cầu
              </div>
            )}
            <p className="text-xs text-ink-muted mt-1">Khách thuê vừa báo cần tiếp nhận</p>
          </div>
        </Card>
      </div>

      {/* Two columns: Recent Maintenance and Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Recent Maintenance Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Yêu cầu sửa chữa gần đây</CardTitle>
              <CardDescription>Các báo cáo hư hỏng mới nhất từ khách thuê</CardDescription>
            </div>
            <Link to="/landlord/maintenance">
              <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                Xem tất cả
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 pt-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : maintenanceData?.items?.length ? (
              <div className="divide-y divide-border">
                {maintenanceData.items.map((item) => {
                  const statusInfo = maintenanceStatusMap[item.status];
                  const priorityInfo = item.priority
                    ? maintenancePriorityMap[item.priority]
                    : null;
                  return (
                    <div
                      key={item.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">
                          {item.original_description}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                          {item.category && (
                            <span className="font-medium text-ink-secondary">
                              {maintenanceCategoryMap[item.category]}
                            </span>
                          )}
                          <span>•</span>
                          <span>{formatDate(item.created_at)}</span>
                          {priorityInfo && (
                            <Badge variant={priorityInfo.variant} size="sm">
                              {priorityInfo.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge variant={statusInfo.variant} size="sm" dot>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-ink-muted text-center py-8">
                Không có yêu cầu sửa chữa nào đang chờ xử lý.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Hóa đơn & Thu phí gần đây</CardTitle>
              <CardDescription>Theo dõi các khoản thanh toán tiền phòng</CardDescription>
            </div>
            <Link to="/landlord/payments">
              <Button variant="ghost" size="sm" rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>
                Xem tất cả
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 pt-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : payments.length ? (
              <div className="divide-y divide-border">
                {payments.slice(0, 5).map((payment) => {
                  const statusInfo = paymentStatusMap[payment.status];
                  return (
                    <div
                      key={payment.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-semibold text-ink">
                          {formatVND(payment.amount)}
                        </p>
                        <p className="text-xs text-ink-muted">
                          Kỳ: {formatDate(payment.billing_period)} • Hạn:{' '}
                          {formatDate(payment.due_date)}
                        </p>
                      </div>
                      <Badge variant={statusInfo.variant} size="sm" dot>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-ink-muted text-center py-8">
                Chưa có hóa đơn nào được tạo.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
