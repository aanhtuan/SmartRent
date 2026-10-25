import { apiClient } from './client';
import {
  Deposit,
  RecordDepositRequest,
  ResolveDepositRequest,
  RoomAsset,
  CreateAssetRequest,
  UpdateAssetRequest,
} from '../types';

export const inventoryApi = {
  getDeposit: async (contractId: string): Promise<Deposit> => {
    return apiClient<Deposit>(`/api/contracts/${contractId}/deposit`, {
      method: 'GET',
    });
  },

  recordDeposit: async (
    contractId: string,
    data: RecordDepositRequest
  ): Promise<Deposit> => {
    return apiClient<Deposit>(`/api/contracts/${contractId}/deposit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  resolveDeposit: async (
    depositId: string,
    data: ResolveDepositRequest
  ): Promise<Deposit> => {
    return apiClient<Deposit>(`/api/deposits/${depositId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  listAssets: async (roomId: string): Promise<RoomAsset[]> => {
    return apiClient<RoomAsset[]>(`/api/rooms/${roomId}/assets`, {
      method: 'GET',
    });
  },

  createAsset: async (
    roomId: string,
    data: CreateAssetRequest
  ): Promise<RoomAsset> => {
    return apiClient<RoomAsset>(`/api/rooms/${roomId}/assets`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAsset: async (
    assetId: string,
    data: UpdateAssetRequest
  ): Promise<RoomAsset> => {
    return apiClient<RoomAsset>(`/api/assets/${assetId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAsset: async (assetId: string): Promise<void> => {
    return apiClient<void>(`/api/assets/${assetId}`, {
      method: 'DELETE',
    });
  },
};
