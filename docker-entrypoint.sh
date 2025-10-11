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
  
  # First, check if PostgreSQL is accepting connections at all
  RETRIES=10
  echo "Checking if PostgreSQL server is up..."
  until pg_isready -h postgres -t 5 || [ $RETRIES -eq 0 ]; do
    echo "Waiting for PostgreSQL server to accept connections, $((RETRIES--)) remaining attempts..."
    sleep 5
  done
  
  if [ $RETRIES -eq 0 ]; then
    echo "PostgreSQL server not responding. Exiting."
    exit 1
  fi
  
  # Now try to connect to PostgreSQL
  echo "PostgreSQL server is up. Checking if database exists..."
  
  # Try to connect to the postgres default database first
  if ! PGPASSWORD=${POSTGRES_PASSWORD} psql -h postgres -U ${POSTGRES_USER} -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo "Cannot connect to postgres database. Will try to create database ${POSTGRES_DB}..."
    
    # Try connecting as postgres user to create the database
    if PGPASSWORD=postgres psql -h postgres -U postgres -c "SELECT 1" > /dev/null 2>&1; then
      echo "Connected as postgres user. Creating database ${POSTGRES_DB} and user ${POSTGRES_USER}..."
      PGPASSWORD=postgres psql -h postgres -U postgres -c "CREATE DATABASE ${POSTGRES_DB}" || true
      PGPASSWORD=postgres psql -h postgres -U postgres -c "CREATE USER ${POSTGRES_USER} WITH PASSWORD '${POSTGRES_PASSWORD}'" || true
      PGPASSWORD=postgres psql -h postgres -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB} TO ${POSTGRES_USER}" || true
    else
      echo "Cannot connect as postgres user. Trying to create database directly..."
      # Try to create the database directly
      PGPASSWORD=${POSTGRES_PASSWORD} createdb -h postgres -U ${POSTGRES_USER} ${POSTGRES_DB} || true
    fi
  fi
  
  # Final check - try to connect to our database
  RETRIES=30
  until PGPASSWORD=${POSTGRES_PASSWORD} psql -h postgres -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT 1" > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
    echo "Waiting for database ${POSTGRES_DB} to be accessible, $((RETRIES--)) remaining attempts..."
    sleep 5
  done
  
  if [ $RETRIES -eq 0 ]; then
    echo "Could not connect to database ${POSTGRES_DB}. Final connection attempt with debug output:"
    PGPASSWORD=${POSTGRES_PASSWORD} psql -h postgres -U ${POSTGRES_USER} -d ${POSTGRES_DB} -c "SELECT 1" || true
    exit 1
  fi
  
  echo "PostgreSQL is up and running with database ${POSTGRES_DB}!"
}

# Wait for PostgreSQL
wait_for_postgres

# Run Prisma migrations
echo "Running Prisma migrations..."

# Ensure prisma directory has correct permissions
mkdir -p /app/node_modules/.prisma
chmod -R 777 /app/node_modules/.prisma || true
chmod -R 777 /app/node_modules/@prisma || true

# Skip regenerating Prisma client in the entrypoint - it's already generated in the Dockerfile
echo "Skipping Prisma client generation (already done in Dockerfile)"

# Check if there are existing migrations
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
  echo "Running existing migrations..."
  npx prisma migrate deploy --schema=prisma/schema.prisma
else
  echo "No existing migrations found, creating initial migration..."
  # Skip dev and go straight to deploy for production
  echo "Creating migrations from schema..."
  npx prisma db push --schema=prisma/schema.prisma --skip-generate
fi

# If migrations fail, try direct push
if [ $? -ne 0 ]; then
  echo "Migration failed, attempting direct schema push..."
  npx prisma db push --schema=prisma/schema.prisma --skip-generate --accept-data-loss
fi

# Run the main container command
echo "Starting application..."
exec "$@"
