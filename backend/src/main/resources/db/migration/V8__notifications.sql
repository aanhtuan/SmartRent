CREATE TABLE notifications (
 id uuid PRIMARY KEY,recipient_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 type text NOT NULL CHECK(type IN ('MAINTENANCE_CREATED','MAINTENANCE_UPDATED','PAYMENT_REMINDER','PAYMENT_UPDATED','CONTRACT_EVENT')),
 message text NOT NULL,maintenance_request_id uuid REFERENCES maintenance_requests(id) ON DELETE RESTRICT,
 payment_id uuid REFERENCES payments(id) ON DELETE RESTRICT,contract_id uuid REFERENCES contracts(id) ON DELETE RESTRICT,
 read_at timestamptz,created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK(num_nonnulls(maintenance_request_id,payment_id,contract_id)=1));
CREATE INDEX notifications_recipient_read_created_idx ON notifications(recipient_user_id,read_at,created_at DESC);
CREATE INDEX notifications_maintenance_idx ON notifications(maintenance_request_id);
CREATE INDEX notifications_payment_idx ON notifications(payment_id);
CREATE INDEX notifications_contract_idx ON notifications(contract_id);
GRANT SELECT,INSERT,UPDATE ON notifications TO "${applicationRole}";
