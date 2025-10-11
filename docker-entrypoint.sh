#!/bin/sh
set -e

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
  echo "Waiting for PostgreSQL to be ready..."
  
  RETRIES=30
  until PGPASSWORD=${POSTGRES_PASSWORD} psql -h postgres -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo "Waiting for PostgreSQL server, $((RETRIES--)) remaining attempts..."
    sleep 1
  done
  
  if [ $RETRIES -eq 0 ]; then
    echo "PostgreSQL server failed to start. Exiting."
    exit 1
  fi
  
  echo "PostgreSQL is up and running!"
}

# Wait for PostgreSQL
wait_for_postgres

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Run the main container command
echo "Starting application..."
exec "$@"
