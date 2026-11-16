CREATE TABLE maintenance_requests (
 id uuid PRIMARY KEY,tenant_profile_id uuid NOT NULL REFERENCES tenant_profiles(id) ON DELETE RESTRICT,
 room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
 original_description text NOT NULL CHECK(length(btrim(original_description))>0 AND length(original_description)<=5000),
 submission_key uuid NOT NULL,submission_digest text NOT NULL,
 category text CHECK(category IN ('ELECTRICITY','PLUMBING','INTERNET','AIR_CONDITIONER','FURNITURE','CLEANING','OTHER')),
 priority text CHECK(priority IN ('LOW','MEDIUM','HIGH')),ai_summary text,
 ai_confidence numeric(4,3) CHECK(ai_confidence>=0 AND ai_confidence<=1),ai_missing_information text[] NOT NULL DEFAULT '{}',
 ai_classification_status text NOT NULL DEFAULT 'NOT_REQUESTED' CHECK(ai_classification_status IN ('NOT_REQUESTED','CLASSIFIED','NEEDS_INFORMATION','UNAVAILABLE','INVALID')),
 status text NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','PROCESSING','COMPLETED','CANCELLED')),
 updated_by_user_id uuid REFERENCES users(id) ON DELETE RESTRICT,cancellation_reason varchar(500),
 created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT maintenance_submission_uq UNIQUE(tenant_profile_id,submission_key),
 CHECK((status='CANCELLED' AND length(btrim(cancellation_reason))>0) OR (status<>'CANCELLED' AND cancellation_reason IS NULL)),
 CHECK((ai_classification_status IN ('CLASSIFIED','NEEDS_INFORMATION') AND category IS NOT NULL AND priority IS NOT NULL AND ai_summary IS NOT NULL AND ai_confidence IS NOT NULL) OR (ai_classification_status NOT IN ('CLASSIFIED','NEEDS_INFORMATION') AND category IS NULL AND priority IS NULL AND ai_summary IS NULL AND ai_confidence IS NULL)));
CREATE INDEX maintenance_tenant_created_idx ON maintenance_requests(tenant_profile_id,created_at DESC);
CREATE INDEX maintenance_room_status_created_idx ON maintenance_requests(room_id,status,created_at DESC);
CREATE INDEX maintenance_updated_by_idx ON maintenance_requests(updated_by_user_id);
GRANT SELECT,INSERT,UPDATE ON maintenance_requests TO "${applicationRole}";
