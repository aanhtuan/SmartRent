CREATE TABLE service_tariffs (
  id uuid PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  electricity_rate numeric(12,2) NOT NULL DEFAULT 0 CHECK(electricity_rate >= 0),
  water_rate numeric(12,2) NOT NULL DEFAULT 0 CHECK(water_rate >= 0),
  internet_fee numeric(12,2) NOT NULL DEFAULT 0 CHECK(internet_fee >= 0),
  garbage_fee numeric(12,2) NOT NULL DEFAULT 0 CHECK(garbage_fee >= 0),
  other_fees numeric(12,2) NOT NULL DEFAULT 0 CHECK(other_fees >= 0),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT service_tariffs_property_uq UNIQUE(property_id)
);
CREATE INDEX service_tariffs_property_idx ON service_tariffs(property_id);
GRANT SELECT,INSERT,UPDATE ON service_tariffs TO "${applicationRole}";

CREATE TABLE meter_readings (
  id uuid PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
  billing_period date NOT NULL CHECK(extract(day FROM billing_period)=1),
  recorded_date date NOT NULL,
  old_electricity_kwh numeric(10,2) NOT NULL CHECK(old_electricity_kwh >= 0),
  new_electricity_kwh numeric(10,2) NOT NULL CHECK(new_electricity_kwh >= old_electricity_kwh),
  old_water_m3 numeric(10,2) NOT NULL CHECK(old_water_m3 >= 0),
  new_water_m3 numeric(10,2) NOT NULL CHECK(new_water_m3 >= old_water_m3),
  electricity_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK(electricity_amount >= 0),
  water_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK(water_amount >= 0),
  services_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK(services_amount >= 0),
  total_utility_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK(total_utility_amount >= 0),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT meter_readings_contract_period_uq UNIQUE(contract_id, billing_period)
);
CREATE INDEX meter_readings_room_period_idx ON meter_readings(room_id, billing_period);
CREATE INDEX meter_readings_contract_idx ON meter_readings(contract_id);
GRANT SELECT,INSERT,UPDATE ON meter_readings TO "${applicationRole}";
