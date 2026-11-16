CREATE TABLE landlord_bank_accounts (
  id uuid PRIMARY KEY,
  landlord_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  bank_bin varchar(20) NOT NULL,
  bank_name varchar(100) NOT NULL,
  account_number varchar(50) NOT NULL,
  account_holder_name varchar(150) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT landlord_bank_accounts_user_uq UNIQUE(landlord_user_id)
);
CREATE INDEX landlord_bank_accounts_user_idx ON landlord_bank_accounts(landlord_user_id);
GRANT SELECT,INSERT,UPDATE ON landlord_bank_accounts TO "${applicationRole}";

ALTER TABLE payments ADD COLUMN payment_reference varchar(30);
UPDATE payments SET payment_reference = 'SR' || upper(substr(replace(id::text, '-', ''), 1, 8)) WHERE payment_reference IS NULL;
ALTER TABLE payments ALTER COLUMN payment_reference SET NOT NULL;
ALTER TABLE payments ADD CONSTRAINT payments_payment_reference_uq UNIQUE(payment_reference);
