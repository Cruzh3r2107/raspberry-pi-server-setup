# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **home server configuration repository** for a Raspberry Pi 5 running self-hosted services. It serves as both documentation and version control for docker-compose configurations, with comprehensive setup guides for reproducibility.

**Active Services:**
- **Immich** (Port 2283): Photo/video management with mobile auto-backup
- **Paperless-ngx** (Port 8000): Document management with OCR
- **Tailscale VPN**: Secure remote access (100.126.21.128)

**Planned Services:**
- **Home Assistant** (Port 8124): Smart home automation (configured, not running)

## Architecture

### Service Stack

```
Internet → Tailscale VPN (100.126.21.128)
    ↓
Raspberry Pi 5 (192.168.1.154)
    ↓
    ├── Immich → PostgreSQL + Redis → /mnt/storage/immich
    ├── Paperless → PostgreSQL + Redis → /mnt/storage/paperless
    └── Home Assistant (future) → /mnt/storage/homeassistant
```

### Storage Architecture

All persistent data lives on a **1TB SSD** mounted at `/mnt/storage` (not SD card):

```
/mnt/storage/
├── immich/                    # Current photo uploads
├── immich-db/                 # Immich PostgreSQL database
├── immich-old-library/        # External library (976 photos, read-only)
├── paperless/                 # Document storage + database
│   ├── consume/              # Auto-import folder
│   ├── media/                # Original documents (253MB)
│   └── database/             # PostgreSQL (69MB)
├── backups/                  # Database backups
└── docker/                   # Docker system data
```

**Critical:** The SSD must be mounted before starting services. Auto-mounted via fstab with UUID `3360dce6-9ade-4813-9396-9e7fec373707`.

### Docker Compose Locations

| Service | Path | Environment |
|---------|------|-------------|
| Immich | `~/home-server/immich/docker-compose.yml` | `.env` file |
| Paperless | `~/home-server/paperless/docker-compose.yml` | Inline env vars |

## Common Commands

### Service Management

```bash
# Start services
cd ~/home-server/immich && docker compose up -d
cd ~/home-server/paperless && docker compose up -d

# Stop services
cd ~/home-server/immich && docker compose down
cd ~/home-server/paperless && docker compose down

# Restart services
cd ~/home-server/immich && docker compose restart
cd ~/home-server/paperless && docker compose restart

# View logs
docker logs immich_server
docker logs paperless-webserver
docker logs -f immich_server  # Follow in real-time

# Monitor resources
docker stats
docker stats immich_server
```

### Updates

```bash
# Update Immich
cd ~/home-server/immich
docker compose pull
docker compose up -d

# Update Paperless
cd ~/home-server/paperless
docker compose pull
docker compose up -d
```

### Troubleshooting

```bash
# Check all containers
docker ps

# Check disk space
df -h /mnt/storage

# Remount SSD if needed
sudo umount /mnt/storage
sudo mount -a

# Check Tailscale
tailscale status
tailscale ip -4

# Database backups
docker exec immich_postgres pg_dump -U postgres immich | gzip > /mnt/storage/backups/immich-backup-$(date +%Y%m%d).sql.gz
docker exec paperless-db pg_dump -U paperless paperless | gzip > /mnt/storage/backups/paperless-backup-$(date +%Y%m%d).sql.gz
```

## Configuration Details

### Network Access

| Service | Local | Remote (Tailscale) |
|---------|-------|-------------------|
| Immich | http://192.168.1.154:2283 | http://100.126.21.128:2283 |
| Paperless | http://192.168.1.154:8000 | http://100.126.21.128:8000 |
| Home Assistant | http://192.168.1.154:8124 | http://100.126.21.128:8124 |

**Important:** All services use HTTP (not HTTPS). Tailscale provides encrypted tunneling.

### Immich Configuration

**Location:** `~/home-server/immich/`

**Key Settings (`.env`):**
- `UPLOAD_LOCATION=/mnt/storage/immich`
- `DB_DATA_LOCATION=/mnt/storage/immich-db`
- `DB_PASSWORD=immichSecurePass2024`
- `TZ=America/Chicago`
- `IMMICH_MACHINE_LEARNING_ENABLED=false` (disabled for performance)

**Docker Compose Notes:**
- Machine learning service commented out to save CPU/RAM
- External library mounted: `/mnt/storage/immich-old-library:/old-photos:ro` (read-only)
- Video transcoding disabled via Admin UI (not .env)
- Restart policy: `always`

**Performance:**
- Normal idle: 1-5% CPU, 400-600MB RAM
- If CPU >200%: Check for runaway transcoding, restart containers to clear Redis queue

### Paperless Configuration

**Location:** `~/home-server/paperless/`

**Key Settings (inline in docker-compose.yml):**
- `PAPERLESS_URL=http://192.168.1.154:8000`
- `PAPERLESS_DBPASS=paperlessSecurePass2024`
- `PAPERLESS_ADMIN_USER=admin`
- `PAPERLESS_ADMIN_PASSWORD=adminpass123`
- `PAPERLESS_TIME_ZONE=America/Chicago`
- `PAPERLESS_OCR_LANGUAGE=eng`
- `USERMAP_UID=1000`, `USERMAP_GID=1000`

**Docker Compose Notes:**
- Three services: webserver, postgres, redis
- All volumes directly mounted (no .env file)
- Restart policy: `unless-stopped`

### System Information

**Hardware:**
- Raspberry Pi 5, 16GB RAM
- 1TB ORICO SSD (USB 3.0) for data
- 32GB SD card for OS only
- Ubuntu Server 24.04 LTS (kernel 6.8.0-1041-raspi)

**Timezone:** America/Chicago (all services)

**User:** vish (UID 1000)

## Documentation Structure

Each service has a comprehensive README in its subdirectory:

- **`hardware/README.md`** - Hardware specs and network config
- **`os-setup/README.md`** - Ubuntu installation, WiFi, SSD mounting, display setup
- **`tailscale/README.md`** - VPN setup and mobile app configuration
- **`immich/README.md`** - Photo management setup, external library import, performance tuning
- **`paperless/README.md`** - Document management setup and usage
- **`homeassistant/README.md`** - Smart home setup (future use)
- **`myserverinformation/README.md`** - Quick reference cheatsheet

All READMEs include:
- Feature overview
- Step-by-step installation
- Initial setup instructions
- Mobile app configuration
- Docker compose details
- Troubleshooting guides
- Maintenance commands

## Important Patterns

### When Adding New Services

1. Create service directory: `mkdir ~/home-server/{service-name}`
2. Add docker-compose.yml with volumes pointing to `/mnt/storage/{service-name}/`
3. Set timezone: `TZ=America/Chicago`
4. Use restart policy: `unless-stopped` or `always`
5. Document in comprehensive README.md
6. Update main README.md service table

### When Updating Documentation

- **Always update Tailscale IP** if it changes (currently `100.126.21.128`)
- **Update paths** to use `~/home-server/{service}/` not `~/{service}-setup/`
- **Include actual values** (IPs, passwords) - this is a personal repo
- **Add troubleshooting sections** based on real issues encountered
- **Document performance optimizations** (e.g., ML disabled in Immich)

### When Modifying Services

- **Read existing data first**: Check `/mnt/storage/` for existing databases/files
- **Preserve data**: Never delete database directories without backup
- **Check container logs**: `docker logs {container}` before restarting
- **Monitor resources**: Use `docker stats` to verify performance impact
- **Update README**: Document configuration changes immediately

## Git Workflow

This repository tracks:
- ✅ docker-compose.yml files
- ✅ .env files (passwords are acceptable for personal server)
- ✅ README documentation
- ❌ Actual media/documents (stored on SSD only)

```bash
cd ~/home-server
git status
git add immich/docker-compose.yml immich/.env immich/README.md
git commit -m "Update Immich configuration"
git push
```

## Common Issues

**Immich high CPU:**
- Video transcoding running despite UI setting disabled
- **Fix:** Restart containers to clear Redis queue: `docker compose down && docker compose up -d`
- Verify in logs: `docker logs immich_server | grep -i transcod`

**Database password mismatch:**
- Existing database has different password than .env
- **Fix:** Either match password in .env or wipe database and start fresh
- Fresh start: `docker compose down && docker run --rm -v /mnt/storage/{service}-db:/data alpine sh -c "rm -rf /data/*"`

**SSD not mounted:**
- Services fail to start, can't find volumes
- **Check:** `df -h /mnt/storage`
- **Fix:** `sudo mount -a`

**Tailscale connection issues:**
- Mobile apps can't reach services
- **Check:** `tailscale status` shows device connected
- **Restart:** `sudo tailscale down && sudo tailscale up`

## Future Enhancements

Based on repository state:
- Home Assistant activation (when moving to new house)
- Automated backup cron jobs (currently manual)
- Monitoring stack (Prometheus/Grafana) if needed
- Watchtower for automatic container updates (optional)
