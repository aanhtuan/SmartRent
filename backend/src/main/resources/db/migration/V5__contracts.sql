CREATE TABLE contracts (
 id uuid PRIMARY KEY,tenant_profile_id uuid NOT NULL REFERENCES tenant_profiles(id) ON DELETE RESTRICT,
 room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,start_date date NOT NULL,end_date date NOT NULL,
 status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','EXPIRED','TERMINATED')),
 created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(start_date<=end_date));
CREATE INDEX contracts_tenant_status_idx ON contracts(tenant_profile_id,status);
CREATE INDEX contracts_room_status_idx ON contracts(room_id,status);
GRANT SELECT,INSERT,UPDATE ON contracts TO "${applicationRole}";
