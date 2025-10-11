# Deployment Guide

## Super Simple Workflow

### First Time Setup

```bash
git clone <repo-url>
cd vevent-back
docker compose up -d --build
```

**That's it!** Everything happens automatically:
- Database starts
- Schema is created
- Backend starts
- API is ready

---

## Daily Workflow

### Deploy Updates

```bash
git pull
docker compose up -d --build
```

### View Logs

```bash
docker compose logs -f backend
```

### Restart

```bash
docker compose restart backend
```

### Stop Everything

```bash
docker compose down
```

---

## Configuration

Edit `docker-compose.yml` to change:
- JWT secrets
- Database credentials
- Port numbers

Then restart:
```bash
docker compose up -d --build
```

---

## Access

- **API:** http://YOUR_SERVER:3001
- **Health:** http://YOUR_SERVER:3001/health
- **API Docs:** http://YOUR_SERVER:3001/api/docs

---

## Troubleshooting

**Database issues?**
```bash
docker compose down -v  # Remove old data
docker compose up -d --build
```

**Backend not starting?**
```bash
docker compose logs backend
```

**Update schema?**
```bash
# Edit prisma/schema.prisma
docker compose exec backend npx prisma db push
docker compose restart backend
```

---

That's all you need to know!

