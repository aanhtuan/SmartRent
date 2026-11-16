CREATE TABLE deposits (
  id uuid PRIMARY KEY,
  contract_id uuid NOT NULL UNIQUE REFERENCES contracts(id) ON DELETE CASCADE,
  amount bigint NOT NULL CHECK (amount >= 0),
  status varchar(30) NOT NULL DEFAULT 'HELD' CHECK (status IN ('HELD', 'REFUNDED', 'DEDUCTED')),
  refund_amount bigint NOT NULL DEFAULT 0 CHECK (refund_amount >= 0),
  deduction_amount bigint NOT NULL DEFAULT 0 CHECK (deduction_amount >= 0),
  deduction_reason text,
  held_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX deposits_contract_idx ON deposits(contract_id);

CREATE TABLE room_assets (
  id uuid PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  asset_code varchar(64),
  condition_status varchar(30) NOT NULL DEFAULT 'GOOD' CHECK (condition_status IN ('EXCELLENT', 'GOOD', 'FAIR', 'DAMAGED')),
  initial_notes text,
  handover_notes text,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX room_assets_room_idx ON room_assets(room_id);

GRANT SELECT,INSERT,UPDATE,DELETE ON deposits TO "${applicationRole}";
GRANT SELECT,INSERT,UPDATE,DELETE ON room_assets TO "${applicationRole}";
