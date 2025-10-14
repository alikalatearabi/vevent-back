# SSL/HTTPS Setup Guide

Your frontend is now served over HTTPS (`https://veventexpo.ir`), so the backend needs HTTPS too to avoid mixed content errors.

## Quick Setup (One-Time)

### 1. Get SSL Certificate (First Time Only)

You need to obtain a Let's Encrypt SSL certificate for `veventexpo.ir`:

```bash
# Install certbot if not already installed
sudo apt update
sudo apt install certbot -y

# Stop any service using port 80
sudo systemctl stop nginx  # if nginx is running outside Docker

# Get certificate for your domain
sudo certbot certonly --standalone \
  -d veventexpo.ir \
  -d api.veventexpo.ir \
  --non-interactive \
  --agree-tos \
  --email your-email@example.com
```

This will create certificates in `/etc/letsencrypt/live/veventexpo.ir/`

### 2. Deploy with HTTPS

```bash
cd /home/vevent-back
git pull origin main
docker compose up -d --build
```

### 3. Update Frontend API URL

Change your frontend API base URL from:
```
http://185.149.192.60:3001
```

To:
```
https://veventexpo.ir
```

Or use a subdomain:
```
https://api.veventexpo.ir
```

---

## What Changed?

1. **Added nginx reverse proxy** - Handles SSL termination
2. **Updated CORS** - Now allows HTTPS origins
3. **Backend stays HTTP internally** - nginx converts HTTPS → HTTP → backend

---

## Architecture

```
Browser (HTTPS) → nginx:443 (SSL) → backend:3001 (HTTP)
```

The backend container no longer exposes port 3001 directly. All traffic goes through nginx on ports 80/443.

---

## Certificate Auto-Renewal

Let's Encrypt certificates expire every 90 days. Set up auto-renewal:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Add to crontab for automatic renewal
sudo crontab -e
```

Add this line:
```
0 3 * * * certbot renew --quiet && docker compose -f /home/vevent-back/docker-compose.yml restart nginx
```

This checks for renewal daily at 3 AM and restarts nginx if renewed.

---

## Access URLs

After deployment:

- **Frontend:** https://veventexpo.ir
- **Backend API:** https://veventexpo.ir/api/v1/...
- **API Docs:** https://veventexpo.ir/api/docs
- **Health Check:** https://veventexpo.ir/health

---

## Troubleshooting

### Certificate Not Found Error

If nginx fails to start with certificate errors:

```bash
# Create a temporary self-signed certificate
sudo mkdir -p /etc/letsencrypt/live/veventexpo.ir
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/letsencrypt/live/veventexpo.ir/privkey.pem \
  -out /etc/letsencrypt/live/veventexpo.ir/fullchain.pem \
  -subj "/CN=veventexpo.ir"

# Start nginx
docker compose up -d nginx

# Then get real certificate
sudo certbot certonly --webroot -w /var/www/certbot \
  -d veventexpo.ir -d api.veventexpo.ir \
  --email your-email@example.com \
  --agree-tos --non-interactive

# Restart nginx with real cert
docker compose restart nginx
```

### Mixed Content Error Persists

1. Clear browser cache
2. Check frontend is using `https://` not `http://`
3. Verify nginx is running: `docker compose ps nginx`
4. Check nginx logs: `docker compose logs nginx`

### Port 80 Already in Use

```bash
# Find what's using port 80
sudo lsof -i :80

# If it's nginx or apache
sudo systemctl stop nginx
sudo systemctl stop apache2

# Then start Docker compose
docker compose up -d
```

---

## Alternative: Use Subdomain

If you want a separate subdomain for the API:

1. Add DNS A record: `api.veventexpo.ir` → Your server IP
2. Certificate already includes `api.veventexpo.ir` (see certbot command above)
3. Update frontend to use `https://api.veventexpo.ir`

---

## Production Checklist

- [ ] SSL certificate obtained
- [ ] nginx running and healthy
- [ ] Frontend updated to use HTTPS URL
- [ ] Test login/register works
- [ ] Auto-renewal cron job set up
- [ ] Update `JWT_SECRET` in docker-compose.yml
- [ ] Update `JWT_REFRESH_SECRET` in docker-compose.yml

---

## Need Help?

```bash
# Check all services
docker compose ps

# Check nginx logs
docker compose logs nginx

# Check SSL certificate
sudo certbot certificates

# Test HTTPS
curl -I https://veventexpo.ir/health
```

