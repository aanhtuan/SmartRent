import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../shared/api/client';
import { inventoryApi } from '../../shared/api/inventoryApi';
import { Deposit, RoomAsset } from '../../shared/types';

vi.mock('../../shared/api/client', () => ({
  apiClient: vi.fn(),
}));

describe('Inventory & Deposit API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches deposit details by contract id', async () => {
    const mockDeposit: Deposit = {
      id: 'dep-101',
      contract_id: 'contract-555',
      amount: 5000000,
      status: 'HELD',
      refund_amount: 0,
      deduction_amount: 0,
      deduction_reason: null,
      held_at: '2026-10-25T10:00:00Z',
      resolved_at: null,
      created_at: '2026-10-25T10:00:00Z',
    };

    vi.mocked(apiClient).mockResolvedValueOnce(mockDeposit);

    const result = await inventoryApi.getDeposit('contract-555');

    expect(apiClient).toHaveBeenCalledWith('/api/contracts/contract-555/deposit', {
      method: 'GET',
    });
    expect(result.amount).toBe(5000000);
    expect(result.status).toBe('HELD');
  });

  it('resolves deposit with partial deduction and refund', async () => {
    const mockResolved: Deposit = {
      id: 'dep-101',
      contract_id: 'contract-555',
      amount: 5000000,
      status: 'DEDUCTED',
      refund_amount: 4000000,
      deduction_amount: 1000000,
      deduction_reason: 'Khấu trừ tiền vệ sinh phòng',
      held_at: '2026-10-25T10:00:00Z',
      resolved_at: '2026-10-26T10:00:00Z',
      created_at: '2026-10-25T10:00:00Z',
    };

    vi.mocked(apiClient).mockResolvedValueOnce(mockResolved);

    const result = await inventoryApi.resolveDeposit('dep-101', {
      refund_amount: 4000000,
      deduction_amount: 1000000,
      deduction_reason: 'Khấu trừ tiền vệ sinh phòng',
    });

    expect(apiClient).toHaveBeenCalledWith('/api/deposits/dep-101/resolve', {
      method: 'POST',
      body: JSON.stringify({
        refund_amount: 4000000,
        deduction_amount: 1000000,
        deduction_reason: 'Khấu trừ tiền vệ sinh phòng',
      }),
    });
    expect(result.status).toBe('DEDUCTED');
    expect(result.deduction_amount).toBe(1000000);
  });

  it('creates room asset inventory record', async () => {
    const mockAsset: RoomAsset = {
      id: 'asset-1',
      room_id: 'room-99',
      name: 'Tủ lạnh Panasonic Inverter',
      asset_code: 'TL-01',
      condition_status: 'EXCELLENT',
      initial_notes: 'Mới 100%, nguyên hộp',
      handover_notes: null,
      created_at: '2026-10-25T10:00:00Z',
      updated_at: '2026-10-25T10:00:00Z',
    };

    vi.mocked(apiClient).mockResolvedValueOnce(mockAsset);

    const result = await inventoryApi.createAsset('room-99', {
      name: 'Tủ lạnh Panasonic Inverter',
      asset_code: 'TL-01',
      condition_status: 'EXCELLENT',
      initial_notes: 'Mới 100%, nguyên hộp',
    });

    expect(apiClient).toHaveBeenCalledWith('/api/rooms/room-99/assets', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Tủ lạnh Panasonic Inverter',
        asset_code: 'TL-01',
        condition_status: 'EXCELLENT',
        initial_notes: 'Mới 100%, nguyên hộp',
      }),
    });
    expect(result.name).toBe('Tủ lạnh Panasonic Inverter');
    expect(result.condition_status).toBe('EXCELLENT');
  });

  it('deletes a room asset by id', async () => {
    vi.mocked(apiClient).mockResolvedValueOnce(undefined);

    await inventoryApi.deleteAsset('asset-1');

    expect(apiClient).toHaveBeenCalledWith('/api/assets/asset-1', {
      method: 'DELETE',
    });
  });
});
