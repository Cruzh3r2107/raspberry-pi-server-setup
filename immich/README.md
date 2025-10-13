# Immich Photo Management

Self-hosted photo and video management solution with mobile apps for automatic backup.

## Table of Contents

1. [What is Immich](#what-is-immich)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Initial Setup](#initial-setup)
5. [Mobile App Setup](#mobile-app-setup)
6. [Docker Compose Configuration](#docker-compose-configuration)
7. [Issues and Solutions](#issues-and-solutions)

---

## What is Immich

Immich is a self-hosted backup solution for photos and videos, similar to Google Photos.

**Features:**
- Automatic photo/video backup from mobile
- AI-powered face recognition
- Object detection and search
- Albums and sharing
- Timeline view
- Mobile apps for iOS and Android
- Multi-user support

---

## Prerequisites

### 1. Docker Installation
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker vish

# Install Docker Compose
sudo apt install -y docker-compose

# Enable Docker on boot
sudo systemctl enable docker

# Log out and back in for group changes
exit
```

### 2. Verify Docker
```bash
docker --version
docker compose version
```

### 3. Create Storage Directories
```bash
sudo mkdir -p /mnt/storage/immich/{upload,library,db,model-cache}
sudo chown -R vish:vish /mnt/storage/immich
```

---

## Installation

### 1. Create Setup Directory
```bash
mkdir ~/immich-setup
cd ~/immich-setup
```

### 2. Download Official Compose Files
```bash
wget -O docker-compose.yml https://github.com/immich-app/immich/releases/latest/download/docker-compose.yml
wget -O .env https://github.com/immich-app/immich/releases/latest/download/example.env
```

### 3. Configure Environment
```bash
nano .env
```

**Change these lines:**
```env
# Set upload location to SSD
UPLOAD_LOCATION=/mnt/storage/immich/upload

# Set strong database password
DB_PASSWORD=YOUR_STRONG_PASSWORD_HERE
```

**My configuration:**
- Upload location: `/mnt/storage/immich/upload`
- Database password: `immichpass123` (change this!)

Save the file (Ctrl+O, Enter, Ctrl+X).

### 4. Start Immich
```bash
docker compose up -d
```

**Wait 60-90 seconds** for first-time initialization. Immich downloads ML models on first start.

### 5. Check Status
```bash
docker ps
```

Should show 5 containers running:
- `immich_server`
- `immich_microservices`
- `immich_machine_learning`
- `immich_postgres`
- `immich_redis`

### 6. Check Logs
```bash
docker logs immich_server
```

Wait until you see: `Immich Server is listening on http://[::1]:2283`

---

## Initial Setup

### 1. Access Web Interface

Open browser:
- **Local:** `http://192.168.1.154:2283`
- **Tailscale:** `http://100.65.238.8:2283`

### 2. Create Admin Account

On first visit, you'll see the welcome screen:

1. **Email:** Enter any email (can be fake like `admin@immich.local`)
2. **Password:** Create a strong password
3. **Name:** Your name
4. Click **"Sign Up"**

### 3. Initial Configuration

After signing up, you'll be logged in. You can:
- Skip the onboarding tour or follow it
- Configure settings later

**Important:** Change the admin password if you used a temporary one.

---

## Mobile App Setup

### iPhone/iPad

1. **Install App:**
   - Open App Store
   - Search for **"Immich"**
   - Install the official app

2. **Configure Server:**
   - Open Immich app
   - Tap **"Connect to server"**
   - **Server URL:** `http://100.65.238.8:2283`
   - Tap **"Connect"**

3. **Login:**
   - Enter email and password you created
   - Tap **"Login"**

4. **Enable Auto-Backup:**
   - Go to **Backup** tab
   - Toggle **"Foreground backup"** ON
   - Toggle **"Background backup"** ON
   - Select albums to backup (usually "All Photos")
   - Tap **"Start Backup"**

5. **Ensure Tailscale is Running:**
   - Immich requires Tailscale VPN to work remotely
   - Make sure Tailscale app shows green/connected

### Android

Same process as iOS - Immich app is available on Google Play Store.

---

## Docker Compose Configuration

### File Location

`~/immich-setup/docker-compose.yml`

### Key Services

**immich_server** - Main web server (Port 2283)
**immich_microservices** - Background jobs (ML, thumbnails)
**immich_machine_learning** - AI face recognition, object detection
**immich_postgres** - Database
**immich_redis** - Cache

### Storage Locations

| Purpose | Location |
|---------|----------|
| Uploaded Photos/Videos | `/mnt/storage/immich/upload` |
| Library | `/mnt/storage/immich/library` |
| Database | `/mnt/storage/immich/db` |
| ML Models | `/mnt/storage/immich/model-cache` |

### Auto-Start on Boot

All containers have `restart: unless-stopped` which means they automatically start when the Pi boots.

---

## Issues and Solutions

### Issue 1: "Server not reachable" on Mobile App

**Symptoms:** Mobile app can't connect despite correct URL

**Solutions:**

1. **Verify Tailscale is connected on phone:**
   - Open Tailscale app
   - Should show green checkmark
   - Pi should be listed

2. **Test in browser first:**
   - Open Safari/Chrome on phone
   - Go to: `http://100.65.238.8:2283`
   - If browser works, it's an app issue
   - If browser fails, it's a network issue

3. **Use correct URL format:**
   - Must include `http://` (not https)
   - Must include port `:2283`
   - Correct: `http://100.65.238.8:2283`
   - Wrong: `https://100.65.238.8:2283` or `100.65.238.8`

### Issue 2: Containers Not Starting

**Symptoms:** `docker ps` shows containers restarting or exited

**Solutions:**

1. **Check logs:**
```bash
   docker logs immich_server
   docker logs immich_postgres
```

2. **Database password mismatch:**
   - Make sure password in `.env` matches `docker-compose.yml`
   - If changed, must delete database and restart:
```bash
   docker compose down -v
   sudo rm -rf /mnt/storage/immich/db/*
   docker compose up -d
```

3. **Restart services:**
```bash
   cd ~/immich-setup
   docker compose restart
```

### Issue 3: Web Interface Not Loading

**Symptoms:** Browser shows "Connection refused" or timeout

**Solutions:**

1. **Check containers are running:**
```bash
   docker ps | grep immich
```

2. **Wait for initialization:**
   - First start takes 2-3 minutes
   - ML models need to download
   - Check logs: `docker logs -f immich_server`

3. **Check firewall:**
```bash
   sudo ufw status
   sudo ufw allow 2283
```

### Issue 4: Photos Not Backing Up from Phone

**Symptoms:** Mobile app shows "Waiting" or photos don't appear

**Solutions:**

1. **Check permissions:**
   - iOS: Settings → Immich → Photos → Allow "All Photos"
   - Android: Settings → Apps → Immich → Permissions → Photos

2. **Enable background backup:**
   - Open Immich app → Backup tab
   - Enable both foreground and background backup

3. **Check storage space:**
```bash
   df -h /mnt/storage
```

4. **Force manual sync:**
   - In app, go to Backup tab
   - Pull down to refresh
   - Tap "Start Backup"

### Issue 5: Face Recognition Not Working

**Symptoms:** Faces not detected in photos

**Solution:**

1. **Wait for ML model download:**
```bash
   docker logs immich_machine_learning
```
   
2. **Trigger face detection:**
   - Web interface → Administration → Jobs
   - Click "Recognize Faces" → "Run All"

### Issue 6: High CPU/Memory Usage

**Symptoms:** Pi running hot or slow

**Cause:** ML processing is intensive

**Solutions:**

1. **Normal during initial upload:**
   - Generating thumbnails
   - Running face recognition
   - Processing metadata
   - Will calm down after initial processing

2. **Limit concurrent jobs:**
   - Web interface → Administration → Settings
   - Adjust job concurrency

3. **Monitor resources:**
```bash
   docker stats
```

---

## Maintenance

### Update Immich
```bash
cd ~/immich-setup
docker compose pull
docker compose up -d
```

### Backup

**Important data to backup:**
- `/mnt/storage/immich/upload` - All your photos/videos
- `/mnt/storage/immich/db` - Database with metadata, faces, albums
- `~/immich-setup/.env` - Configuration

### View Logs
```bash
# All services
docker compose logs

# Specific service
docker logs immich_server
docker logs immich_machine_learning

# Follow logs in real-time
docker logs -f immich_server
```

### Restart Services
```bash
cd ~/immich-setup
docker compose restart
```

### Stop Services
```bash
cd ~/immich-setup
docker compose down
```

---

## Performance Tips

- **Storage:** Use SSD for better performance (already configured)
- **Initial upload:** Upload photos gradually to avoid overwhelming the Pi
- **Network:** Use WiFi 5GHz band if available
- **ML Processing:** Will max out CPU initially, but calms down after processing

---

## Next Steps

- **[Paperless-ngx Setup](../paperless/)** for document management
- Configure external libraries
- Set up sharing and albums
- Explore mobile app features
