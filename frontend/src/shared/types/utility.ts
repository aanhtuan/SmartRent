export interface ServiceTariff {
  id: string;
  property_id: string;
  electricity_rate: number;
  water_rate: number;
  internet_fee: number;
  garbage_fee: number;
  other_fees: number;
  updated_at: string;
}

export interface ServiceTariffUpdateRequest {
  electricity_rate: number;
  water_rate: number;
  internet_fee: number;
  garbage_fee: number;
  other_fees: number;
}

export interface MeterReading {
  id: string;
  property_id: string;
  room_id: string;
  contract_id: string;
  billing_period: string;
  recorded_date: string;
  old_electricity_kwh: number;
  new_electricity_kwh: number;
  old_water_m3: number;
  new_water_m3: number;
  electricity_amount: number;
  water_amount: number;
  services_amount: number;
  total_utility_amount: number;
  created_at: string;
}

export interface MeterReadingCreateRequest {
  room_id: string;
  contract_id: string;
  billing_period: string;
  recorded_date: string;
  old_electricity_kwh: number;
  new_electricity_kwh: number;
  old_water_m3: number;
  new_water_m3: number;
}
