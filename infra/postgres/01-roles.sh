#!/bin/sh
# Official entrypoint runs this only when initializing an empty data directory.
set -eu
: "${DB_PASSWORD:?DB_PASSWORD is required}"
: "${DB_MIGRATION_PASSWORD:?DB_MIGRATION_PASSWORD is required}"
psql --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" --set ON_ERROR_STOP=1 <<'SQL'
\getenv database POSTGRES_DB
\getenv migration_password DB_MIGRATION_PASSWORD
\getenv application_password DB_PASSWORD
CREATE ROLE smartrent_migrator LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD :'migration_password';
CREATE ROLE smartrent_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION PASSWORD :'application_password';
REVOKE ALL ON DATABASE :"database" FROM PUBLIC;
GRANT CONNECT ON DATABASE :"database" TO smartrent_migrator, smartrent_app;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE, CREATE ON SCHEMA public TO smartrent_migrator;
GRANT USAGE ON SCHEMA public TO smartrent_app;
SQL
