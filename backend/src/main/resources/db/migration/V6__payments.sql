CREATE TABLE payments (
 id uuid PRIMARY KEY,contract_id uuid NOT NULL REFERENCES contracts(id) ON DELETE RESTRICT,
 billing_period date NOT NULL CHECK(extract(day FROM billing_period)=1),due_date date NOT NULL,
 amount numeric(12,2) NOT NULL CHECK(amount>=0 AND amount=trunc(amount)),
 status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','PAID','OVERDUE')),
 created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(due_date>=billing_period),CONSTRAINT payments_contract_period_uq UNIQUE(contract_id,billing_period));
CREATE INDEX payments_contract_status_period_idx ON payments(contract_id,status,billing_period);
GRANT SELECT,INSERT,UPDATE ON payments TO "${applicationRole}";
