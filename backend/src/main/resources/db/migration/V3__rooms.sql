CREATE TABLE rooms (
 id uuid PRIMARY KEY,property_id uuid NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
 room_code varchar(80) NOT NULL CHECK(btrim(room_code)<>''),status text NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE','OCCUPIED','INACTIVE')),
 created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT rooms_property_room_code_uq UNIQUE(property_id,room_code));
GRANT SELECT,INSERT,UPDATE ON rooms TO "${applicationRole}";
