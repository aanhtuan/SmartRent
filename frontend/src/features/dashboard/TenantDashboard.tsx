import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../shared/context/AuthContext';
import { contractApi, paymentApi, maintenanceApi } from '../../shared/api';
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
  paymentStatusMap,
  maintenanceStatusMap,
  maintenanceCategoryMap,
} from '../../shared/utils/format';
import {
  Home,
  CreditCard,
  Bot,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TenantDashboard: React.FC = () => {
  const { user } = useAuth();

  const {
    data: contractsData,
    isLoading: contractsLoading,
    error: contractsError,
    refetch: refetchContracts,
  } = useQuery({
    queryKey: ['contracts', user?.id],
    queryFn: () => contractApi.list({ page: 1, page_size: 10 }),
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', user?.id],
    queryFn: () => paymentApi.list({ page: 1, page_size: 10 }),
  });

  const { data: maintenanceData, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['maintenance', user?.id],
    queryFn: () => maintenanceApi.list({ page: 1, page_size: 5 }),
  });

  const isLoading = contractsLoading || paymentsLoading || maintenanceLoading;

  if (contractsError) {
    return (
      <ErrorState
        title="Lỗi tải dữ liệu phòng thuê"
        message="Không thể kết nối đến máy chủ. Vui lòng thử lại."
        onRetry={() => refetchContracts()}
      />
    );
  }

  const activeContract = contractsData?.items?.find((c) => c.status === 'ACTIVE');
  const pendingPayments =
    paymentsData?.items?.filter(
      (p) => p.status === 'PENDING' || p.status === 'OVERDUE'
    ) ?? [];
  const latestPendingBill = pendingPayments[0];

  const activeMaintenance =
    maintenanceData?.items?.filter(
      (m) => m.status === 'PENDING' || m.status === 'PROCESSING'
    ) ?? [];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Không gian khách thuê
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-0.5">
            Xin chào, {user?.email?.split('@')[0]}
          </h1>
          <p className="text-sm text-ink-secondary mt-1">
            Theo dõi trạng thái hợp đồng thuê, hóa đơn tiền phòng và yêu cầu sửa chữa tiện ích.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/tenant/maintenance">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Báo sửa chữa
            </Button>
          </Link>
          <Link to="/assistant">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Bot className="w-4 h-4 text-primary" />}
            >
              Hỏi Trợ lý AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary Highlights: Current Rental & Payment Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Contract Info */}
        <Card className="border-primary/20 bg-gradient-to-br from-surface to-primary-soft/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-control bg-primary-soft text-primary flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">Phòng thuê hiện tại</h3>
                <p className="text-xs text-ink-muted">Thông tin hợp đồng đang hiệu lực</p>
              </div>
            </div>
            {activeContract ? (
              <Badge variant="success" size="sm" dot>
                Đang hiệu lực
              </Badge>
            ) : (
              <Badge variant="inactive" size="sm">
                Chưa có hợp đồng
              </Badge>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : activeContract ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-ink-muted block">Ngày bắt đầu</span>
                  <span className="text-sm font-semibold text-ink">
                    {formatDate(activeContract.start_date)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-ink-muted block">Ngày kết thúc</span>
                  <span className="text-sm font-semibold text-ink">
                    {formatDate(activeContract.end_date)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-ink-secondary">
                Bạn hiện chưa có hợp đồng thuê nhà nào đang có hiệu lực.
              </p>
            )}
          </div>
        </Card>

        {/* Payment Due Card */}
        <Card
          className={
            latestPendingBill?.status === 'OVERDUE'
              ? 'border-status-error-border bg-status-error-soft/20'
              : 'border-border'
          }
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-control flex items-center justify-center ${
                  latestPendingBill?.status === 'OVERDUE'
                    ? 'bg-status-error-soft text-status-error'
                    : 'bg-accent-soft text-accent'
                }`}
              >
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">Hóa đơn tiền phòng</h3>
                <p className="text-xs text-ink-muted">Tình trạng thanh toán kỳ này</p>
              </div>
            </div>
            {latestPendingBill ? (
              <Badge
                variant={paymentStatusMap[latestPendingBill.status].variant}
                size="sm"
                dot
              >
                {paymentStatusMap[latestPendingBill.status].label}
              </Badge>
            ) : (
              <Badge variant="success" size="sm" dot>
                Đã hoàn thành
              </Badge>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-border">
            {isLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : latestPendingBill ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-ink-muted block">Số tiền cần đóng</span>
                  <span className="text-xl font-bold text-ink">
                    {formatVND(latestPendingBill.amount)}
                  </span>
                  <p className="text-xs text-ink-secondary mt-0.5">
                    Hạn nộp: {formatDate(latestPendingBill.due_date)}
                  </p>
                </div>
                <Link to="/tenant/payments">
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Chi tiết
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-status-success text-xs font-medium py-1">
                <span>Bạn không có hóa đơn nào còn nợ. Cảm ơn bạn!</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Two columns: Maintenance status and AI Assistant hint */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {/* Active Maintenance Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Yêu cầu sửa chữa tiện ích</CardTitle>
              <CardDescription>Tiến độ kiểm tra và xử lý sự cố thiết bị phòng</CardDescription>
            </div>
            <Link to="/tenant/maintenance">
              <Button variant="ghost" size="sm">
                Xem tất cả
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3 pt-2">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : activeMaintenance.length ? (
              <div className="divide-y divide-border">
                {activeMaintenance.map((item) => {
                  const statusInfo = maintenanceStatusMap[item.status];
                  return (
                    <div
                      key={item.id}
                      className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">
                          {item.original_description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-ink-muted">
                          {item.category && (
                            <span className="text-ink-secondary font-medium">
                              {maintenanceCategoryMap[item.category]}
                            </span>
                          )}
                          <span>•</span>
                          <span>{formatDate(item.created_at)}</span>
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
              <div className="text-center py-8">
                <p className="text-sm text-ink-muted mb-3">
                  Mọi tiện ích trong phòng đang hoạt động bình thường.
                </p>
                <Link to="/tenant/maintenance">
                  <Button variant="outline" size="sm">
                    Gửi yêu cầu sửa chữa mới
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Assistant Quick card */}
        <Card className="bg-gradient-to-br from-surface to-accent-soft/20 border-accent/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-control bg-accent/20 text-accent flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <CardTitle>Trợ lý AI SmartRent</CardTitle>
            </div>
            <CardDescription>
              Giải đáp nhanh các câu hỏi về hợp đồng, hạn nộp tiền hoặc tình trạng sửa chữa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-xs">
              <p className="text-ink-secondary">Bạn có thể hỏi những câu hỏi như:</p>
              <div className="space-y-1.5">
                <Link
                  to="/assistant"
                  className="block p-2 bg-surface rounded-control border border-border text-ink hover:border-primary/40 transition-colors"
                >
                  💬 "Hạn nộp tiền phòng kỳ này của tôi là ngày nào?"
                </Link>
                <Link
                  to="/assistant"
                  className="block p-2 bg-surface rounded-control border border-border text-ink hover:border-primary/40 transition-colors"
                >
                  💬 "Tình trạng yêu cầu sửa điều hòa của tôi hiện tại ra sao?"
                </Link>
              </div>
            </div>

            <div className="pt-2">
              <Link to="/assistant">
                <Button variant="primary" size="sm" className="w-full">
                  Mở Trợ lý AI
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
