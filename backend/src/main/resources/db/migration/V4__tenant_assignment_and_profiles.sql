ALTER TABLE users ADD COLUMN provisioned_by_user_id uuid REFERENCES users(id) ON DELETE RESTRICT;
ALTER TABLE users ADD CONSTRAINT users_not_self_assigned_ck CHECK(provisioned_by_user_id IS NULL OR provisioned_by_user_id<>id);
CREATE INDEX users_provisioned_by_idx ON users(provisioned_by_user_id);
CREATE TABLE tenant_profiles (
 id uuid PRIMARY KEY,user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
 manager_landlord_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 full_name varchar(200) NOT NULL CHECK(btrim(full_name)<>''),phone_number varchar(30),
 created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX tenant_profiles_manager_idx ON tenant_profiles(manager_landlord_id);
GRANT SELECT,INSERT,UPDATE ON tenant_profiles TO "${applicationRole}";
