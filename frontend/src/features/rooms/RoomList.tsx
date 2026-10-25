import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertyApi, roomApi } from '../../shared/api';
import {
  Card,
  Button,
  Badge,
  Select,
  Skeleton,
  EmptyState,
  ErrorState,
} from '../../shared/components/ui';
import { roomStatusMap } from '../../shared/utils/format';
import { DoorOpen, Building2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RoomList: React.FC = () => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  // Fetch properties to populate the dropdown
  const { data: propertiesData, isLoading: isPropertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => propertyApi.list({ page: 1, page_size: 100 }),
  });

  const properties = propertiesData?.items ?? [];

  // Automatically select the first property when loaded if none selected
  React.useEffect(() => {
    if (propertiesData?.items && propertiesData.items.length > 0 && !selectedPropertyId) {
      setSelectedPropertyId(propertiesData.items[0].id);
    }
  }, [propertiesData, selectedPropertyId]);

  // Fetch rooms for the selected property
  const {
    data: roomsData,
    isLoading: isRoomsLoading,
    error: roomsError,
    refetch,
  } = useQuery({
    queryKey: ['rooms', selectedPropertyId],
    queryFn: () => roomApi.listByProperty(selectedPropertyId, { page: 1, page_size: 100 }),
    enabled: !!selectedPropertyId,
  });

  const rooms = roomsData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Quản lý phòng trọ</h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1">
            Xem danh sách phòng, trạng thái cho thuê và quản lý phòng theo từng nhà trọ.
          </p>
        </div>
        {selectedPropertyId && (
          <Link to={`/landlord/properties/${selectedPropertyId}`}>
            <Button
              variant="outline"
              size="sm"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Xem chi tiết khu trọ
            </Button>
          </Link>
        )}
      </div>

      {/* Property Selector Filter */}
      <Card className="p-4 sm:p-5">
        <div className="max-w-md">
          <Select
            label="Chọn khu nhà trọ"
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            options={properties.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.address})`,
            }))}
            placeholder={isPropertiesLoading ? 'Đang tải danh sách nhà trọ...' : 'Chọn một nhà trọ'}
          />
        </div>
      </Card>

      {/* Room Listing Grid */}
      {isRoomsLoading || isPropertiesLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : roomsError ? (
        <ErrorState
          title="Lỗi tải danh sách phòng"
          message="Không thể kết nối đến máy chủ. Vui lòng thử lại."
          onRetry={() => refetch()}
        />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-7 h-7 text-primary/60" />}
          title="Chưa có nhà trọ nào"
          description="Bạn cần tạo một nhà trọ trước khi thêm các phòng trọ."
          actionLabel="Tạo nhà trọ mới"
          onAction={() => window.location.assign('/landlord/properties')}
        />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={<DoorOpen className="w-7 h-7 text-primary/60" />}
          title="Nhà trọ này chưa có phòng"
          description="Vào trang chi tiết nhà trọ để thêm các phòng mới."
          actionLabel="Đi đến chi tiết nhà trọ"
          onAction={() => window.location.assign(`/landlord/properties/${selectedPropertyId}`)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {rooms.map((room) => {
            const statusInfo = roomStatusMap[room.status];
            return (
              <Card key={room.id} hoverable className="p-4 flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-ink-muted uppercase tracking-wider font-semibold">
                      Phòng
                    </span>
                    <h3 className="text-xl font-bold text-ink mt-0.5">{room.room_code}</h3>
                  </div>
                  <Badge variant={statusInfo.variant} size="sm" dot>
                    {statusInfo.label}
                  </Badge>
                </div>

                <div className="pt-3 border-t border-border mt-4 flex items-center justify-between text-xs text-ink-secondary">
                  <span>Trạng thái</span>
                  <span className="font-medium text-ink">{statusInfo.label}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
