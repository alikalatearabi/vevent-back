# Assets Subdomain Setup Guide

This guide explains how to set up the `assets.veventexpo.ir` subdomain for serving MinIO assets over HTTPS.

## Prerequisites

- Cloudflare account with DNS access
- Server with nginx installed
- MinIO running on port 9000

## Steps

### 1. Cloudflare DNS Configuration

1. Go to Cloudflare Dashboard → DNS
2. Add a new A record:
   - **Type**: A
   - **Name**: `assets`
   - **IPv4 address**: `185.149.192.60`
   - **Proxy status**: Proxied (orange cloud) ✅
   - **TTL**: Auto

This creates `assets.veventexpo.ir` pointing to your server.

### 2. SSL Certificate Setup

You have two options:

#### Option A: Let's Encrypt (Recommended)

```bash
# Install certbot if not already installed
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Get certificate for the subdomain
sudo certbot --nginx -d assets.veventexpo.ir

# Certbot will automatically configure nginx
```

#### Option B: Cloudflare Origin Certificate

1. Go to Cloudflare Dashboard → SSL/TLS → Origin Server
2. Create Certificate
3. Download the certificate and key
4. Update nginx.conf with the paths to these files

### 3. Nginx Configuration

The nginx configuration has been added to `nginx.conf`. It includes:

- HTTP to HTTPS redirect
- SSL configuration
- Proxy to MinIO on `localhost:9000`
- Security headers
- Large file upload support (100MB)

**Important**: Update the SSL certificate paths in `nginx.conf` if using Cloudflare Origin Certificate:

```nginx
ssl_certificate /path/to/cloudflare-origin.pem;
ssl_certificate_key /path/to/cloudflare-origin.key;
```

### 4. Reload Nginx

```bash
# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### 5. Environment Configuration

Add to your `.env` file or environment variables:

```bash
MINIO_PUBLIC_URL=https://assets.veventexpo.ir
```

This tells the backend to generate asset URLs using the subdomain instead of the IP address.

### 6. Update Existing Asset URLs

Run the script to update existing asset URLs in the database:

```bash
npm run update:asset-urls-subdomain
```

This will update all asset URLs from:
- `http://185.149.192.60:9000/...`
- `https://185.149.192.60:9000/...`
- `http://minio:9000/...`

To:
- `https://assets.veventexpo.ir/...`

### 7. Verify Setup

1. Test the subdomain:
   ```bash
   curl -I https://assets.veventexpo.ir/vevent-assets/
   ```

2. Check that images load in the frontend without mixed content errors

3. Upload a new file and verify it uses the new URL format

## Troubleshooting

### SSL Certificate Issues

If you see SSL errors:
- Make sure the certificate paths in nginx.conf are correct
- Verify the certificate is valid: `sudo certbot certificates`
- Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### 502 Bad Gateway

If you get 502 errors:
- Verify MinIO is running: `docker ps | grep minio`
- Check if MinIO is accessible: `curl http://localhost:9000/minio/health/live`
- Verify nginx can reach MinIO: Check firewall rules

### Mixed Content Errors

If you still see mixed content errors:
- Clear browser cache
- Verify `MINIO_PUBLIC_URL` is set correctly
- Check that new uploads use the subdomain URL
- Run the update script to fix existing URLs

## Notes

- The subdomain uses Cloudflare's proxy, which provides DDoS protection
- SSL is handled by Cloudflare (Full or Full Strict mode recommended)
- All asset requests will go through the subdomain with HTTPS
- The nginx proxy forwards requests to MinIO on localhost:9000

