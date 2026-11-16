CREATE TABLE maintenance_work_logs (
  id uuid PRIMARY KEY,
  maintenance_request_id uuid NOT NULL
    REFERENCES maintenance_requests(id) ON DELETE RESTRICT,
  recorded_by_user_id uuid NOT NULL
    REFERENCES users(id) ON DELETE RESTRICT,
  performed_by varchar(200) NOT NULL
    CHECK (length(btrim(performed_by)) > 0),
  work_description varchar(2000) NOT NULL
    CHECK (length(btrim(work_description)) > 0),
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX maintenance_work_logs_request_created_idx
  ON maintenance_work_logs (maintenance_request_id, created_at DESC, id DESC);
CREATE INDEX maintenance_work_logs_recorded_by_idx
  ON maintenance_work_logs (recorded_by_user_id);

GRANT SELECT, INSERT ON maintenance_work_logs TO "${applicationRole}";
