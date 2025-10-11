#!/bin/sh
set -e

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
  echo "Waiting for PostgreSQL to be ready..."
  
  # Print environment variables for debugging
  echo "Database connection details:"
  echo "Host: postgres"
  echo "User: ${POSTGRES_USER}"
  echo "DB: ${POSTGRES_DB}"
  
  RETRIES=30
  until PGPASSWORD=${POSTGRES_PASSWORD} psql -h postgres -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo "Waiting for PostgreSQL server, $((RETRIES--)) remaining attempts..."
    sleep 5
  done
  
  if [ $RETRIES -eq 0 ]; then
    echo "PostgreSQL server failed to start. Exiting."
    echo "Attempting connection with debug output:"
    PGPASSWORD=${POSTGRES_PASSWORD} psql -h postgres -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT 1" || true
    exit 1
  fi
  
  echo "PostgreSQL is up and running!"
}

# Wait for PostgreSQL
wait_for_postgres

# Run Prisma migrations
echo "Running Prisma migrations..."

# First generate the Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Check if there are existing migrations
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
  echo "Running existing migrations..."
  npx prisma migrate deploy
else
  echo "No existing migrations found, creating initial migration..."
  # Create the initial migration and apply it
  npx prisma migrate dev --name initial-migration --create-only
  npx prisma migrate deploy
fi

# Push the schema if migrations fail
if [ $? -ne 0 ]; then
  echo "Migration failed, attempting direct schema push..."
  npx prisma db push --accept-data-loss
fi

# Run the main container command
echo "Starting application..."
exec "$@"
