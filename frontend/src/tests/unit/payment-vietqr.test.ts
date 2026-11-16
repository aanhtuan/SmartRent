import { describe, it, expect, vi, beforeEach } from 'vitest';
import { paymentApi } from '../../shared/api/paymentApi';

describe('paymentApi - VietQR & Bank Account', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches landlord bank account', async () => {
    const mockBank = {
      id: 'bank-1',
      landlord_user_id: 'landlord-1',
      bank_bin: '970422',
      bank_name: 'MBBank',
      account_number: '0123456789',
      account_holder_name: 'NGUYEN VAN A',
      updated_at: '2026-10-25T00:00:00Z',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockBank,
    });

    const result = await paymentApi.getBankAccount();
    expect(result?.bank_bin).toBe('970422');
    expect(result?.account_number).toBe('0123456789');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/landlords/bank-account'),
      expect.objectContaining({ method: 'GET' })
    );
  });

  it('simulates webhook payment reconciliation', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true, status: 'PAID' }),
    });

    const result = await paymentApi.simulateWebhook('SR12345678', 3500000);
    expect(result.success).toBe(true);
    expect(result.status).toBe('PAID');
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/webhooks/payment'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
