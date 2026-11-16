CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token varchar(100) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX password_reset_tokens_user_idx ON password_reset_tokens(user_id);
CREATE INDEX password_reset_tokens_token_idx ON password_reset_tokens(token);

ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name varchar(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number varchar(30);

GRANT SELECT,INSERT,UPDATE,DELETE ON password_reset_tokens TO "${applicationRole}";
