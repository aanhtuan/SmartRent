CREATE TABLE media_files (
  id uuid PRIMARY KEY,
  uploader_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  target_type varchar(30) NOT NULL CHECK(target_type IN ('MAINTENANCE', 'ROOM', 'PROPERTY')),
  target_id uuid,
  file_name varchar(255) NOT NULL,
  file_path varchar(500) NOT NULL,
  mime_type varchar(100) NOT NULL,
  file_size bigint NOT NULL CHECK(file_size > 0),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX media_files_target_idx ON media_files(target_type, target_id);
CREATE INDEX media_files_uploader_idx ON media_files(uploader_user_id);
GRANT SELECT,INSERT,UPDATE,DELETE ON media_files TO "${applicationRole}";
