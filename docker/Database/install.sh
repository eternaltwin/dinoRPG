#!/bin/bash

set -e
set -u

function create_user_and_database() {
	local database=$1
	echo "  Creating user and database '$database'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE USER "$database";
	    CREATE DATABASE "$database";
	    GRANT ALL PRIVILEGES ON DATABASE "$database" TO "$database";
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
	echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
	for db in $(echo "$POSTGRES_MULTIPLE_DATABASES" | tr ',' ' '); do
		create_user_and_database $db
	done
	echo "Multiple databases created"
fi

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE USER "etwin.dev.admin" password 'dev';
		ALTER  USER "etwin.dev.admin" with SUPERUSER;
	    GRANT ALL PRIVILEGES ON DATABASE "etwin.dev" TO "etwin.dev.admin";
EOSQL

#cat /import/drop.sql | psql --username etwin.dev.write etwin.dev
#cat /import/dump_12-01-2021_20_33_41.sql | psql --username etwin.dev.write etwin.dev
cat /import/21211105.sql | psql --username etwin.dev.write eternaldinodb
