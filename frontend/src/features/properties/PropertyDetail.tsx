import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi, roomApi } from '../../shared/api';
import { Room, RoomCreateRequest, RoomUpdateRequest } from '../../shared/types';
import {
  Card,
  Button,
  Badge,
  Input,
  Dialog,
  ConfirmDialog,
  Skeleton,
  EmptyState,
  ErrorState,
  Pagination,
} from '../../shared/components/ui';
import { propertyStatusMap, roomStatusMap } from '../../shared/utils/format';
import {
  ArrowLeft,
  Building2,
  DoorOpen,
  Plus,
  MapPin,
  Edit2,
  Trash2,
} from 'lucide-react';

export const PropertyDetail: React.FC = () => {
  const { id: propertyId } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<Room | null>(null);

  // Form states
  const [roomCode, setRoomCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Query property details
  const {
    data: property,
    isLoading: isPropertyLoading,
    error: propertyError,
    refetch: refetchProperty,
  } = useQuery({
    queryKey: ['property', propertyId],
    queryFn: () => propertyApi.get(propertyId!),
    enabled: !!propertyId,
  });

  // Query rooms for this property
  const {
    data: roomsData,
    isLoading: isRoomsLoading,
    error: roomsError,
    refetch: refetchRooms,
  } = useQuery({
    queryKey: ['rooms', propertyId, page],
    queryFn: () => roomApi.listByProperty(propertyId!, { page, page_size: 20 }),
    enabled: !!propertyId,
  });

  // Mutations
  const createRoomMutation = useMutation({
    mutationFn: (data: RoomCreateRequest) => roomApi.create(propertyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', propertyId] });
      setIsCreateOpen(false);
      setRoomCode('');
      setFormError(null);
    },
    onError: (err: any) => {
      if (err.status === 409) {
        setFormError('Mã phòng này đã tồn tại trong nhà trọ. Vui lòng chọn mã khác.');
      } else {
        setFormError(err.message || 'Không thể tạo phòng trọ.');
      }
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoomUpdateRequest }) =>
      roomApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', propertyId] });
      setEditingRoom(null);
      setRoomCode('');
      setFormError(null);
    },
    onError: (err: any) => {
      if (err.status === 409) {
        setFormError('Mã phòng bị trùng lặp hoặc đang có xung đột hợp đồng.');
      } else {
        setFormError(err.message || 'Cập nhật phòng thất bại.');
      }
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: (id: string) => roomApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', propertyId] });
      setDeletingRoom(null);
    },
    onError: (err: any) => {
      alert(err.message || 'Không thể khóa phòng trọ này.');
      setDeletingRoom(null);
    },
  });

  const handleOpenCreate = () => {
    setRoomCode('');
    setFormError(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (r: Room) => {
    setEditingRoom(r);
    setRoomCode(r.room_code);
    setFormError(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setFormError('Vui lòng nhập mã phòng.');
      return;
    }
    createRoomMutation.mutate({ room_code: roomCode.trim() });
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    if (!roomCode.trim()) {
      setFormError('Vui lòng nhập mã phòng.');
      return;
    }
    updateRoomMutation.mutate({
      id: editingRoom.id,
      data: { room_code: roomCode.trim() },
    });
  };

  if (propertyError) {
    return (
      <ErrorState
        title="Không tìm thấy nhà trọ"
        message="Nhà trọ này không tồn tại hoặc bạn không có quyền truy cập."
        onRetry={() => refetchProperty()}
      />
    );
  }

  const rooms = roomsData?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/landlord/properties"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-secondary hover:text-ink transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại danh sách nhà trọ</span>
        </Link>
      </div>

      {/* Property Details Header Card */}
      {isPropertyLoading || !property ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <Card className="bg-surface border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-container bg-primary-soft text-primary flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
                    {property.name}
                  </h1>
                  <Badge variant={propertyStatusMap[property.status].variant} size="sm" dot>
                    {propertyStatusMap[property.status].label}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-ink-secondary flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-ink-muted shrink-0" />
                  <span>{property.address}</span>
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              Thêm phòng mới
            </Button>
          </div>
        </Card>
      )}

      {/* Rooms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-ink">Danh sách phòng trọ</h2>
            <span className="text-xs font-semibold text-ink-muted px-2 py-0.5 bg-surface-subtle border border-border rounded-full">
              {rooms.length} phòng
            </span>
          </div>
        </div>

        {isRoomsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : roomsError ? (
          <ErrorState
            title="Lỗi tải danh sách phòng"
            message="Không thể lấy danh sách phòng trọ. Vui lòng thử lại."
            onRetry={() => refetchRooms()}
          />
        ) : rooms.length === 0 ? (
          <EmptyState
            icon={<DoorOpen className="w-7 h-7 text-primary/60" />}
            title="Chưa có phòng nào trong nhà trọ này"
            description="Hãy tạo phòng đầu tiên (ví dụ: Phòng 101, Phòng 102...) để bắt đầu quản lý hợp đồng cho thuê."
            actionLabel="Thêm phòng mới"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {rooms.map((room) => {
              const statusInfo = roomStatusMap[room.status];
              return (
                <Card key={room.id} hoverable className="p-4 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs text-ink-muted block uppercase tracking-wider font-semibold">
                        Số phòng
                      </span>
                      <h4 className="text-xl font-bold text-ink mt-0.5">{room.room_code}</h4>
                    </div>
                    <Badge variant={statusInfo.variant} size="sm" dot>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  <div className="pt-3 border-t border-border mt-4 flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(room)}
                      title="Sửa tên phòng"
                      aria-label="Sửa tên phòng"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingRoom(room)}
                      title="Khóa phòng trọ"
                      className="hover:text-status-error"
                      aria-label="Khóa phòng trọ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Pagination
          currentPage={page}
          pageSize={20}
          totalItems={rooms.length}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Create Room Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Thêm phòng mới"
        description={`Tạo phòng trọ mới trong khu "${property?.name}".`}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs">
              {formError}
            </div>
          )}
          <Input
            label="Mã phòng / Tên phòng"
            placeholder="Ví dụ: P.101 hoặc A-01"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={createRoomMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={createRoomMutation.isPending}>
              Tạo phòng
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        title="Chỉnh sửa mã phòng"
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-status-error-soft text-status-error border border-status-error-border rounded-control text-xs">
              {formError}
            </div>
          )}
          <Input
            label="Mã phòng / Tên phòng"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            required
            autoFocus
          />
          <div className="flex justify-end gap-2.5 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingRoom(null)}
              disabled={updateRoomMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" isLoading={updateRoomMutation.isPending}>
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Soft Delete/Deactivate Room Confirm */}
      {deletingRoom && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeletingRoom(null)}
          onConfirm={() => deleteRoomMutation.mutate(deletingRoom.id)}
          title="Tạm khóa phòng trọ này?"
          description={`Phòng "${deletingRoom.room_code}" sẽ được chuyển sang trạng thái Tạm khóa (INACTIVE).`}
          variant="danger"
          confirmLabel="Khóa phòng"
          isLoading={deleteRoomMutation.isPending}
        />
      )}
    </div>
  );
};
