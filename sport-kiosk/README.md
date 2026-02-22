# Sport Kiosk

Live sports scores kiosk for tablet display.

**Repository:** https://github.com/Cruzh3r2107/sport-kiosk

---

## Deploy

```bash
# Clone the repo
cd ~/home-server
git clone https://github.com/Cruzh3r2107/sport-kiosk.git
cd sport-kiosk

# Create storage
mkdir -p /mnt/storage/sport-kiosk/redis

# Start services
docker-compose up -d --build
```

---

## Access

| Interface | URL |
|-----------|-----|
| Local | http://<local-ip>:3000 |
| Tailscale | http://<tailscale-ip>:3000 |

---

## Commands

```bash
cd ~/home-server/sport-kiosk

# Start
docker-compose up -d

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build

# Logs
docker logs -f sport-kiosk-backend
```

---

## Storage

| Purpose | Path |
|---------|------|
| Redis cache | `/mnt/storage/sport-kiosk/redis/` |
