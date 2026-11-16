import { apiClient } from './client';
import {
  ServiceTariff,
  ServiceTariffUpdateRequest,
  MeterReading,
  MeterReadingCreateRequest,
} from '../types';

export const utilityApi = {
  getTariff: async (propertyId: string): Promise<ServiceTariff> => {
    return apiClient<ServiceTariff>(`/api/properties/${propertyId}/tariffs`, {
      method: 'GET',
    });
  },

  updateTariff: async (
    propertyId: string,
    data: ServiceTariffUpdateRequest
  ): Promise<ServiceTariff> => {
    return apiClient<ServiceTariff>(`/api/properties/${propertyId}/tariffs`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getLatestReading: async (roomId: string): Promise<MeterReading> => {
    return apiClient<MeterReading>(`/api/rooms/${roomId}/latest-meter-reading`, {
      method: 'GET',
    });
  },

  recordReading: async (data: MeterReadingCreateRequest): Promise<MeterReading> => {
    return apiClient<MeterReading>('/api/meter-readings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getContractReadings: async (contractId: string): Promise<MeterReading[]> => {
    return apiClient<MeterReading[]>(`/api/contracts/${contractId}/meter-readings`, {
      method: 'GET',
    });
  },
};
