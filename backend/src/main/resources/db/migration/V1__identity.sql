CREATE TABLE users (
    id uuid CONSTRAINT users_pk PRIMARY KEY,
    email varchar(320) NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_email_uq UNIQUE (email),
    CONSTRAINT users_email_canonical_ck CHECK (email <> '' AND email = lower(btrim(email))),
    CONSTRAINT users_password_hash_nonblank_ck CHECK (btrim(password_hash) <> ''),
    CONSTRAINT users_role_ck CHECK (role IN ('LANDLORD', 'TENANT'))
);

-- Runtime identity access has no DDL, hard deletion or migration-history access.
GRANT SELECT, INSERT, UPDATE ON users TO "${applicationRole}";
