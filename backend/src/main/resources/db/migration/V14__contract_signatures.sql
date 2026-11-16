ALTER TABLE contracts
  ADD COLUMN tenant_signature text,
  ADD COLUMN tenant_signed_at timestamptz,
  ADD COLUMN landlord_signature text,
  ADD COLUMN landlord_signed_at timestamptz;
