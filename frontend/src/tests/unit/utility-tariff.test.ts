import { describe, it, expect, vi, beforeEach } from 'vitest';
import { utilityApi } from '../../shared/api/utilityApi';

describe('utilityApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches tariff for a property correctly', async () => {
    const mockTariff = {
      id: 'tariff-1',
      property_id: 'prop-1',
      electricity_rate: 3500,
      water_rate: 25000,
      internet_fee: 100000,
      garbage_fee: 30000,
      other_fees: 0,
      updated_at: '2026-10-25T00:00:00Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockTariff,
    });

    const result = await utilityApi.getTariff('prop-1');
    expect(result.electricity_rate).toBe(3500);
    expect(result.water_rate).toBe(25000);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/properties/prop-1/tariffs'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('records meter reading with valid payload', async () => {
    const mockReading = {
      id: 'reading-1',
      property_id: 'prop-1',
      room_id: 'room-1',
      contract_id: 'contract-1',
      billing_period: '2026-10-01',
      recorded_date: '2026-10-02',
      old_electricity_kwh: 100,
      new_electricity_kwh: 150,
      old_water_m3: 10,
      new_water_m3: 14,
      electricity_amount: 175000,
      water_amount: 100000,
      services_amount: 150000,
      total_utility_amount: 425000,
      created_at: '2026-10-25T00:00:00Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockReading,
    });

    const result = await utilityApi.recordReading({
      room_id: 'room-1',
      contract_id: 'contract-1',
      billing_period: '2026-10-01',
      recorded_date: '2026-10-02',
      old_electricity_kwh: 100,
      new_electricity_kwh: 150,
      old_water_m3: 10,
      new_water_m3: 14,
    });

    expect(result.total_utility_amount).toBe(425000);
    expect(result.electricity_amount).toBe(175000);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/meter-readings'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
