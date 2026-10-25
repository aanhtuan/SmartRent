import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../shared/api/client';
import { contractApi } from '../../shared/api/contractApi';
import { Contract } from '../../shared/types';

vi.mock('../../shared/api/client', () => ({
  apiClient: vi.fn(),
}));

describe('Contract E-Signature API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs a contract with digital signature payload', async () => {
    const mockSignedContract: Contract = {
      id: 'contract-123',
      tenant_profile_id: 'profile-456',
      room_id: 'room-789',
      start_date: '2026-11-01',
      end_date: '2027-11-01',
      status: 'ACTIVE',
      landlord_signature: 'data:image/png;base64,sampleSigLandlord',
      landlord_signed_at: '2026-10-26T10:00:00Z',
      tenant_signature: null,
      tenant_signed_at: null,
    };

    vi.mocked(apiClient).mockResolvedValueOnce(mockSignedContract);

    const result = await contractApi.sign(
      'contract-123',
      'data:image/png;base64,sampleSigLandlord'
    );

    expect(apiClient).toHaveBeenCalledWith('/api/contracts/contract-123/sign', {
      method: 'POST',
      body: JSON.stringify({ signature: 'data:image/png;base64,sampleSigLandlord' }),
    });
    expect(result.id).toBe('contract-123');
    expect(result.landlord_signature).toBe('data:image/png;base64,sampleSigLandlord');
    expect(result.landlord_signed_at).toBe('2026-10-26T10:00:00Z');
  });

  it('fetches contract with both landlord and tenant signatures', async () => {
    const fullySigned: Contract = {
      id: 'contract-999',
      tenant_profile_id: 'profile-456',
      room_id: 'room-789',
      start_date: '2026-11-01',
      end_date: '2027-11-01',
      status: 'ACTIVE',
      landlord_signature: 'data:image/png;base64,landlordSig',
      landlord_signed_at: '2026-10-26T10:00:00Z',
      tenant_signature: 'data:image/png;base64,tenantSig',
      tenant_signed_at: '2026-10-26T10:05:00Z',
    };

    vi.mocked(apiClient).mockResolvedValueOnce(fullySigned);

    const result = await contractApi.get('contract-999');

    expect(apiClient).toHaveBeenCalledWith('/api/contracts/contract-999', {
      method: 'GET',
    });
    expect(result.tenant_signature).toBe('data:image/png;base64,tenantSig');
    expect(result.tenant_signed_at).toBe('2026-10-26T10:05:00Z');
  });
});
