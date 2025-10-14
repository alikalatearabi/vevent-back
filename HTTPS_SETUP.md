# HTTPS SSL Setup Guide

## Overview
This guide helps you set up HTTPS for your VEvent backend to fix the mixed content error when your frontend (https://veventexpo.ir) tries to access your backend.

## The Problem
- Frontend: `https://veventexpo.ir` (HTTPS)
- Backend: `http://185.149.192.60:3001` (HTTP)
- **Mixed Content Error**: Browsers block HTTPS → HTTP requests

## The Solution
Set up SSL certificates and Nginx reverse proxy for your backend.

## Prerequisites
1. Domain name pointing to your server (e.g., `api.veventexpo.ir`)
2. Server with ports 80 and 443 open
3. Root access to the server

## Step 1: Set up DNS
Point your subdomain to your server:
```
api.veventexpo.ir → 185.149.192.60
```

## Step 2: Run SSL Setup Script
On your server, run:
```bash
cd /home/vevent-back
sudo ./setup-ssl.sh
```

This script will:
- Install certbot if needed
- Get SSL certificates from Let's Encrypt
- Set up automatic renewal
- Generate DH parameters for security

## Step 3: Deploy with HTTPS
```bash
# Stop current services
docker compose down

# Build and start with Nginx
docker compose up -d

# Check status
docker compose ps
```

## Step 4: Update Frontend Configuration
Change your frontend API calls from:
```javascript
// OLD - HTTP (causes mixed content error)
const API_BASE_URL = 'http://185.149.192.60:3001'

// NEW - HTTPS (works with HTTPS frontend)
const API_BASE_URL = 'https://api.veventexpo.ir'
```

## Step 5: Test the Setup
```bash
# Test HTTP redirect to HTTPS
curl -I http://api.veventexpo.ir
# Should return: 301 Moved Permanently, Location: https://...

# Test HTTPS endpoint
curl -I https://api.veventexpo.ir/api/v1/events
# Should return: 200 OK

# Test from frontend
fetch('https://api.veventexpo.ir/api/v1/events', { credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log('✅ HTTPS Working!', d))
```

## Architecture
```
Frontend (HTTPS) → Nginx (SSL) → Backend (HTTP internal)
https://veventexpo.ir → https://api.veventexpo.ir → backend:3001
```

## Security Features
- **SSL/TLS encryption** for all API traffic
- **Automatic HTTP → HTTPS redirect**
- **Security headers** (HSTS, X-Frame-Options, etc.)
- **Rate limiting** (10 requests/second per IP)
- **Gzip compression** for better performance

## Certificate Renewal
Certificates auto-renew via cron job:
```bash
# Check renewal status
sudo certbot certificates

# Test renewal (dry run)
sudo certbot renew --dry-run
```

## Troubleshooting

### Certificate Issues
```bash
# Check certificate
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal
```

### Nginx Issues
```bash
# Check Nginx logs
docker compose logs nginx

# Test Nginx config
docker compose exec nginx nginx -t
```

### Port Issues
```bash
# Check if ports are open
sudo netstat -tlnp | grep -E ':80|:443'

# Check firewall
sudo ufw status
```

## Files Created
- `nginx/nginx.conf` - Nginx configuration with SSL
- `setup-ssl.sh` - SSL certificate setup script
- Updated `docker-compose.yml` with Nginx service
- Updated `src/main.ts` with HTTPS CORS origins

## Next Steps
1. Run the SSL setup script on your server
2. Update your frontend to use `https://api.veventexpo.ir`
3. Test all API endpoints with HTTPS
4. Monitor certificate renewal

## Support
If you encounter issues:
1. Check the logs: `docker compose logs`
2. Verify DNS: `nslookup api.veventexpo.ir`
3. Test SSL: `openssl s_client -connect api.veventexpo.ir:443`
