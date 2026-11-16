ALTER TABLE maintenance_requests ADD CONSTRAINT maintenance_cancel_reason_required_ck CHECK(status<>'CANCELLED' OR (cancellation_reason IS NOT NULL AND length(btrim(cancellation_reason))>0));
