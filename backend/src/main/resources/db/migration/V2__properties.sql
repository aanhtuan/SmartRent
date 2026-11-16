CREATE TABLE properties (
 id uuid PRIMARY KEY,owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 name varchar(200) NOT NULL CHECK(btrim(name)<>''),address text NOT NULL CHECK(btrim(address)<>''),
 status text NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE')),
 created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX properties_owner_user_id_idx ON properties(owner_user_id);
GRANT SELECT,INSERT,UPDATE ON properties TO "${applicationRole}";
