export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'INACTIVE';

export interface Room {
  id: string;
  property_id: string;
  room_code: string;
  status: RoomStatus;
}

export interface RoomCreateRequest {
  room_code: string;
}

export interface RoomUpdateRequest {
  room_code?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}
