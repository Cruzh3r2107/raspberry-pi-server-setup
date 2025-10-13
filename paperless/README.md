# Paperless-ngx Document Management

Self-hosted document management system with OCR, tagging, and full-text search.

## Table of Contents

1. [What is Paperless-ngx](#what-is-paperless-ngx)
2. [Installation](#installation)
3. [Initial Setup](#initial-setup)
4. [Mobile App Setup](#mobile-app-setup)
5. [Using Paperless](#using-paperless)
6. [Docker Compose Configuration](#docker-compose-configuration)
7. [Issues and Solutions](#issues-and-solutions)

---

## What is Paperless-ngx

Paperless-ngx is a document management system that scans, indexes, and archives all your documents.

**Features:**
- **OCR** - Extracts text from scanned documents
- **Full-text search** - Find documents by their content
- **Auto-tagging** - Automatically organize documents
- **Correspondents** - Track who sent documents
- **Document types** - Categorize (invoice, contract, receipt, etc.)
- **Email integration** - Email documents directly
- **Multi-user** - Share with family/team
- **Mobile apps** - Scan with your phone

**Perfect for:**
- Bills and receipts
- Contracts and agreements
- Medical records
- Tax documents
- Manuals and warranties
- Any paper you want to digitize

---

## Installation

### Prerequisites

Docker must be installed (see [Immich setup](../immich/) for Docker installation).

### 1. Create Directories
```bash
sudo mkdir -p /mnt/storage/paperless/{consume,data,media,export,database}
sudo chown -R vish:vish /mnt/storage/paperless

mkdir ~/paperless-setup
cd ~/paperless-setup
```

### 2. Create docker-compose.yml
```bash
nano docker-compose.yml
```

Paste this configuration:
```yaml
services:
  paperless-broker:
    image: docker.io/library/redis:7
    container_name: paperless-broker
    restart: unless-stopped
    volumes:
      - /mnt/storage/paperless/redisdata:/data

  paperless-db:
    image: docker.io/library/postgres:16
    container_name: paperless-db
    restart: unless-stopped
    volumes:
      - /mnt/storage/paperless/database:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: paperless
      POSTGRES_USER: paperless
      POSTGRES_PASSWORD: paperlesspass123

  paperless-webserver:
    image: ghcr.io/paperless-ngx/paperless-ngx:latest
    container_name: paperless-webserver
    restart: unless-stopped
    depends_on:
      - paperless-db
      - paperless-broker
    ports:
      - "8000:8000"
    volumes:
      - /mnt/storage/paperless/data:/usr/src/paperless/data
      - /mnt/storage/paperless/media:/usr/src/paperless/media
      - /mnt/storage/paperless/export:/usr/src/paperless/export
      - /mnt/storage/paperless/consume:/usr/src/paperless/consume
    environment:
      PAPERLESS_REDIS: redis://paperless-broker:6379
      PAPERLESS_DBHOST: paperless-db
      PAPERLESS_DBNAME: paperless
      PAPERLESS_DBUSER: paperless
      PAPERLESS_DBPASS: paperlesspass123
      PAPERLESS_SECRET_KEY: change-this-to-a-random-string
      PAPERLESS_URL: http://192.168.1.154:8000
      PAPERLESS_TIME_ZONE: America/Los_Angeles
      PAPERLESS_OCR_LANGUAGE: eng
      PAPERLESS_ADMIN_USER: admin
      PAPERLESS_ADMIN_PASSWORD: changeme123
      USERMAP_UID: 1000
      USERMAP_GID: 1000
```

**Important:** Change these values:
- `PAPERLESS_SECRET_KEY` - Set to a random string
- `PAPERLESS_ADMIN_PASSWORD` - Change from default
- `PAPERLESS_TIME_ZONE` - Your timezone
- `PAPERLESS_OCR_LANGUAGE` - Your language (eng, deu, fra, spa, etc.)

Save (Ctrl+O, Enter, Ctrl+X).

### 3. Start Paperless
```bash
docker compose up -d
```

**First start takes 2-3 minutes:**
- Downloading OCR models
- Setting up database
- Creating admin user

### 4. Monitor Startup
```bash
docker logs -f paperless-webserver
```

Wait until you see: `Booting worker with pid: XXX`

Press Ctrl+C to exit logs.

---

## Initial Setup

### 1. Access Web Interface

Open browser:
- **Local:** `http://192.168.1.154:8000`
- **Tailscale:** `http://100.65.238.8:8000`

### 2. Login

Default credentials:
- **Username:** `admin`
- **Password:** `changeme123`

### 3. Change Password (Important!)

After logging in:
1. Click your username (top right)
2. Click **"Profile"** or **"Settings"**
3. Click **"Change Password"**
4. Enter new strong password
5. Save

### 4. Initial Configuration

Go to **Settings** (⚙️ icon):

**General:**
- Set your timezone
- Configure date format

**OCR:**
- Language: English (or your language)
- OCR mode: Auto (recommended)

**Consume:**
- Enable "Delete documents after consumption" if desired
- Configure filename handling

---

## Mobile App Setup

### iOS

**App Options:**
1. **Paperless Mobile** (Recommended)
   - Search "Paperless Mobile" in App Store
   - Free and open source

2. **Swift Paperless**
   - Alternative option
   - Also available on App Store

**Setup:**
1. Install Paperless Mobile app
2. **Ensure Tailscale is running** on your phone (green checkmark)
3. Open Paperless Mobile
4. Tap **"Add Server"**
5. **Server URL:** `http://100.65.238.8:8000`
6. **Username:** `admin`
7. **Password:** Your password
8. Tap **"Connect"**

**Scan Documents:**
1. Tap **"+"** button
2. Select **"Scan Document"**
3. Take photo of document
4. Adjust edges if needed
5. Add title/tags (optional)
6. Tap **"Upload"**

### Android

Same process - Paperless Mobile available on Google Play Store.

---

## Using Paperless

### Upload Methods

**1. Via Web Interface:**
- Click **"Upload"** button
- Select PDF or image files
- Drag and drop also works

**2. Via Consume Folder:**
```bash
# Copy files to consume folder
cp /path/to/document.pdf /mnt/storage/paperless/consume/
```

Paperless automatically imports files from this folder.

**3. Via Mobile App:**
- Use camera to scan documents
- Upload from phone's files

**4. Via Email (Advanced):**
- Can be configured to receive documents via email

### Organization

**Tags:**
- Create tags like: `Receipt`, `Bill`, `Medical`, `Tax`, `Important`
- Auto-assign tags based on filename or content

**Correspondents:**
- Track who sent each document
- Example: `Bank of America`, `Electric Company`, `Dr. Smith`

**Document Types:**
- Categorize documents: `Invoice`, `Contract`, `Receipt`, `Letter`

**Custom Fields:**
- Add metadata like amount, date, category

### Search

**Full-text search:**
- Search for any word in document content (OCR extracted)
- Use filters: tags, correspondents, dates, types

**Advanced search:**
- Combine multiple filters
- Date ranges
- Boolean operators

---

## Docker Compose Configuration

### File Location

`~/paperless-setup/docker-compose.yml`

### Services

**paperless-webserver** - Main web application (Port 8000)
**paperless-db** - PostgreSQL database
**paperless-broker** - Redis for task queue

### Storage Locations

| Purpose | Location |
|---------|----------|
| Consume folder (auto-import) | `/mnt/storage/paperless/consume` |
| Original documents | `/mnt/storage/paperless/media` |
| OCR processed documents | `/mnt/storage/paperless/data` |
| Database | `/mnt/storage/paperless/database` |
| Exports | `/mnt/storage/paperless/export` |

### Auto-Start

Containers have `restart: unless-stopped` - automatically start on boot.

---

## Issues and Solutions

### Issue 1: Can't Connect from Mobile App

**Symptoms:** "Connection error" or "Server not reachable"

**Solutions:**

1. **Verify Tailscale is running:**
   - Open Tailscale app on phone
   - Should show green/connected
   - Pi should be listed

2. **Test in browser first:**
   - Open Safari/Chrome on phone
   - Go to: `http://100.65.238.8:8000`
   - Should see Paperless login

3. **Check URL format:**
   - Must include `http://` (not https)
   - Must include port `:8000`
   - Correct: `http://100.65.238.8:8000`

4. **Restart containers:**
```bash
   cd ~/paperless-setup
   docker compose restart
```

### Issue 2: OCR Not Working

**Symptoms:** Documents uploaded but text not searchable

**Solutions:**

1. **Check OCR language is set:**
   - Settings → OCR → Language
   - Should match document language

2. **Wait for processing:**
   - OCR takes time (1-2 min per document)
   - Check Tasks page for progress

3. **Check logs:**
```bash
   docker logs paperless-webserver | grep OCR
```

4. **Reprocess document:**
   - Click document
   - Actions → "Redo OCR"

### Issue 3: Documents Not Auto-Importing

**Symptoms:** Files in consume folder but not imported

**Solutions:**

1. **Check permissions:**
```bash
   ls -la /mnt/storage/paperless/consume
   sudo chown -R 1000:1000 /mnt/storage/paperless/consume
```

2. **Check logs:**
```bash
   docker logs paperless-webserver | grep consume
```

3. **Restart consumer:**
```bash
   docker compose restart
```

### Issue 4: Login Failed / Password Wrong

**Symptoms:** Can't login with credentials

**Solutions:**

1. **Reset admin password:**
```bash
   docker exec -it paperless-webserver python3 manage.py changepassword admin
```

2. **Create new superuser:**
```bash
   docker exec -it paperless-webserver python3 manage.py createsuperuser
```

### Issue 5: High CPU Usage

**Symptoms:** Pi running hot

**Cause:** OCR processing is CPU intensive

**Solutions:**

- **Normal during document processing**
- Will calm down after processing queue is empty
- Upload documents gradually
- Monitor: `docker stats paperless-webserver`

### Issue 6: Out of Storage Space

**Symptoms:** "No space left" errors

**Solutions:**

1. **Check disk space:**
```bash
   df -h /mnt/storage
```

2. **Delete old documents:**
   - Via web interface
   - Or manually: `rm /mnt/storage/paperless/media/*`

3. **Clean up originals:**
   - Settings → Configure to delete originals after OCR

---

## Maintenance

### Update Paperless
```bash
cd ~/paperless-setup
docker compose pull
docker compose up -d
```

### Backup

**Critical data to backup:**
- `/mnt/storage/paperless/data` - OCR processed documents
- `/mnt/storage/paperless/media` - Original documents
- `/mnt/storage/paperless/database` - Metadata, tags, search index

**Backup command:**
```bash
sudo tar -czf paperless-backup-$(date +%Y%m%d).tar.gz /mnt/storage/paperless
```

### Export All Documents

Via web interface:
- Settings → Export
- Downloads zip with all documents and metadata

### View Logs
```bash
docker logs paperless-webserver
docker logs paperless-db
docker logs -f paperless-webserver  # Follow logs
```

### Restart Services
```bash
cd ~/paperless-setup
docker compose restart
```

---

## Advanced Features

### Email Integration

Configure Paperless to receive documents via email.

### Workflows

Set up automatic actions based on document content.

### API Access

Paperless has a full REST API for automation.

### Multi-user

Create additional users with different permissions.

---

## Performance Tips

- **Batch uploads:** Don't upload 100s of documents at once
- **Storage:** SSD is essential for good performance
- **CPU:** OCR is intensive - be patient on first upload
- **Organization:** Create tags and types early, apply consistently

---

## Useful Links

- Official Documentation: https://docs.paperless-ngx.com/
- GitHub: https://github.com/paperless-ngx/paperless-ngx
- Mobile App: Search app stores for "Paperless Mobile"
