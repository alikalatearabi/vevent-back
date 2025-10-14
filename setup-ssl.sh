#!/bin/bash

# SSL Certificate Setup Script for VEvent Backend
# This script sets up Let's Encrypt SSL certificates for the backend API

set -e

echo "🔐 Setting up SSL certificates for VEvent Backend..."

# Configuration
DOMAIN="api.veventexpo.ir"
EMAIL="admin@veventexpo.ir"  # Change this to your email
WEBROOT="/var/www/certbot"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    print_status "Installing certbot..."
    apt-get update
    apt-get install -y certbot
fi

# Create webroot directory
print_status "Creating webroot directory..."
mkdir -p $WEBROOT

# Stop nginx if running (we'll use standalone mode first)
print_status "Stopping any running nginx containers..."
docker compose down nginx 2>/dev/null || true

# Get certificate using webroot method (works with running web servers)
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    print_status "Obtaining SSL certificate for $DOMAIN using webroot method..."
    
    # First, start a temporary nginx container to serve the webroot
    print_status "Starting temporary nginx for certificate validation..."
    docker run -d --name temp-nginx \
        -p 80:80 \
        -v $WEBROOT:/usr/share/nginx/html \
        nginx:alpine
    
    # Wait a moment for nginx to start
    sleep 3
    
    # Get the certificate
    certbot certonly \
        --webroot \
        --webroot-path=$WEBROOT \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --domains $DOMAIN \
        --non-interactive
    
    # Stop the temporary nginx
    docker stop temp-nginx
    docker rm temp-nginx
    
    if [ $? -eq 0 ]; then
        print_status "✅ SSL certificate obtained successfully!"
    else
        print_error "❌ Failed to obtain SSL certificate"
        print_error "Cleaning up temporary nginx..."
        docker stop temp-nginx 2>/dev/null || true
        docker rm temp-nginx 2>/dev/null || true
        exit 1
    fi
else
    print_status "SSL certificate already exists for $DOMAIN"
fi

# Set up automatic renewal
print_status "Setting up automatic certificate renewal..."
cat > /etc/cron.d/certbot-renew << EOF
# Renew Let's Encrypt certificates twice daily
0 12 * * * root certbot renew --quiet --deploy-hook "docker compose -f $(pwd)/docker-compose.yml restart nginx"
0 0 * * * root certbot renew --quiet --deploy-hook "docker compose -f $(pwd)/docker-compose.yml restart nginx"
EOF

# Create dhparam for additional security
if [ ! -f "/etc/letsencrypt/ssl-dhparams.pem" ]; then
    print_status "Generating DH parameters (this may take a while)..."
    openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
fi

print_status "🎉 SSL setup complete!"
print_status "Certificate location: /etc/letsencrypt/live/$DOMAIN/"
print_status "You can now start your services with: docker compose up -d"

echo
print_warning "⚠️  Important Notes:"
echo "1. Make sure your domain $DOMAIN points to this server's IP"
echo "2. Ensure ports 80 and 443 are open in your firewall"
echo "3. The certificate will auto-renew every 12 hours"
echo "4. Update your frontend to use https://$DOMAIN instead of http://..."
