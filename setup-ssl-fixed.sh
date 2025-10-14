#!/bin/bash

# SSL Certificate Setup Script for VEvent Backend - Fixed Version
# This script handles port conflicts and sets up Let's Encrypt SSL certificates

set -e

echo "🔐 Setting up SSL certificates for VEvent Backend..."

# Configuration
DOMAIN="api.veventexpo.ir"
EMAIL="admin@veventexpo.ir"  # Change this to your email

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

# Check if domain resolves to this server
print_status "Checking DNS resolution for $DOMAIN..."
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
SERVER_IP=$(curl -s ifconfig.me)

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    print_warning "Domain $DOMAIN resolves to $DOMAIN_IP but server IP is $SERVER_IP"
    print_warning "Make sure your DNS is properly configured"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Install certbot if not installed
if ! command -v certbot &> /dev/null; then
    print_status "Installing certbot..."
    apt-get update
    apt-get install -y certbot
fi

# Stop any services that might be using port 80
print_status "Stopping services that might conflict with port 80..."

# Stop Apache if running
systemctl stop apache2 2>/dev/null || true
systemctl stop httpd 2>/dev/null || true

# Stop Nginx if running
systemctl stop nginx 2>/dev/null || true

# Stop any Docker containers using port 80
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep ":80->" | awk '{print $1}' | xargs -r docker stop

# Stop our own services temporarily
print_status "Stopping VEvent services temporarily..."
cd /home/vevent-back
docker compose down 2>/dev/null || true

# Wait a moment for ports to be released
sleep 3

# Get certificate using standalone mode
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    print_status "Obtaining SSL certificate for $DOMAIN..."
    certbot certonly \
        --standalone \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --domains $DOMAIN \
        --non-interactive \
        --preferred-challenges http
    
    if [ $? -eq 0 ]; then
        print_status "✅ SSL certificate obtained successfully!"
    else
        print_error "❌ Failed to obtain SSL certificate"
        print_error "Check the logs at /var/log/letsencrypt/letsencrypt.log"
        exit 1
    fi
else
    print_status "SSL certificate already exists for $DOMAIN"
fi

# Set up automatic renewal
print_status "Setting up automatic certificate renewal..."
cat > /etc/cron.d/certbot-renew << EOF
# Renew Let's Encrypt certificates twice daily
0 12 * * * root certbot renew --quiet --pre-hook "docker compose -f /home/vevent-back/docker-compose.yml down" --post-hook "docker compose -f /home/vevent-back/docker-compose.yml up -d"
0 0 * * * root certbot renew --quiet --pre-hook "docker compose -f /home/vevent-back/docker-compose.yml down" --post-hook "docker compose -f /home/vevent-back/docker-compose.yml up -d"
EOF

# Create dhparam for additional security
if [ ! -f "/etc/letsencrypt/ssl-dhparams.pem" ]; then
    print_status "Generating DH parameters (this may take a while)..."
    openssl dhparam -out /etc/letsencrypt/ssl-dhparams.pem 2048
fi

# Set proper permissions
chmod 644 /etc/letsencrypt/live/$DOMAIN/fullchain.pem
chmod 600 /etc/letsencrypt/live/$DOMAIN/privkey.pem

print_status "🎉 SSL setup complete!"
print_status "Certificate location: /etc/letsencrypt/live/$DOMAIN/"
print_status "Starting VEvent services with HTTPS support..."

# Start our services
cd /home/vevent-back
docker compose up -d

echo
print_status "✅ All done! Your services are now running with HTTPS support."
echo
print_warning "⚠️  Important Notes:"
echo "1. Your backend is now available at: https://$DOMAIN"
echo "2. HTTP requests will be redirected to HTTPS automatically"
echo "3. Update your frontend to use https://$DOMAIN"
echo "4. The certificate will auto-renew every 12 hours"
echo
print_status "Test your setup:"
echo "curl -I https://$DOMAIN/api/v1/events"
