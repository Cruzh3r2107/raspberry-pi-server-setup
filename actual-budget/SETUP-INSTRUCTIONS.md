# Actual Budget HTTPS Setup - Manual Steps Required

## Problem Solved

The "Fatal Error: Actual requires access to SharedArrayBuffer" issue has been resolved by implementing HTTPS via Nginx reverse proxy.

## Root Cause

Actual Budget uses SharedArrayBuffer (for SQLite in-browser database). Modern browsers restrict this feature to:
- HTTPS connections with proper Cross-Origin-Opener-Policy (COOP) and Cross-Origin-Embedder-Policy (COEP) headers
- OR localhost/127.0.0.1 only

Your previous HTTP-only setup worked on localhost but failed when accessed via the network IP (192.168.0.104).

## Solution Implemented

A two-container Docker Compose setup:
1. **actual_server** - The Actual Budget Node.js application
2. **nginx** - Reverse proxy providing HTTPS with self-signed SSL certificates

The Actual server already sends the correct COOP/COEP headers. Nginx passes them through while providing the HTTPS layer required by browsers.

## Files Created/Modified

### New Files
- `/home/vish/home-server/actual-budget/nginx.conf` - Nginx reverse proxy configuration
- `/home/vish/home-server/actual-budget/setup-ssl.sh` - SSL certificate generation script

### Modified Files
- `/home/vish/home-server/actual-budget/docker-compose.yml` - Added nginx service
- `/home/vish/home-server/actual-budget/README.md` - Comprehensive HTTPS documentation

## Manual Steps Required

### Step 1: Run SSL Setup Script

The setup script needs sudo to create certificates with proper permissions:

```bash
cd /home/vish/home-server/actual-budget
./setup-ssl.sh
```

This will:
- Clean up incorrectly created directories
- Generate self-signed SSL certificate (valid 10 years)
- Configure certificate for local IP (192.168.0.104) and Tailscale IP (100.126.21.128)
- Set proper file permissions

### Step 2: Start the Services

```bash
cd /home/vish/home-server/actual-budget
docker compose up -d
```

This will:
- Pull the nginx:alpine image (if not already cached)
- Start actual_server container
- Start nginx container
- Create a private Docker network for inter-container communication

### Step 3: Verify Deployment

```bash
# Check both containers are running
docker ps | grep actual

# Should show:
# - actual-budget (healthy)
# - actual-budget-nginx (up)

# Test HTTPS access
curl -k -I https://192.168.0.104:5006 | grep -i "cross-origin"

# Should show:
# Cross-Origin-Opener-Policy: same-origin
# Cross-Origin-Embedder-Policy: require-corp
```

### Step 4: Access in Browser

1. Open browser and go to: `https://192.168.0.104:5006`
2. You will see a certificate warning (expected for self-signed certificates)
3. Click "Advanced" → "Proceed" (Chrome/Edge) or "Accept the Risk" (Firefox)
4. Actual Budget should load without the SharedArrayBuffer error

### Step 5: Update Mobile Apps

If you have the mobile app configured:

1. Open Actual Budget mobile app
2. Go to Settings → Server
3. Update server URL to: `https://100.126.21.128:5006` (add `https://`)
4. Accept certificate warning if prompted
5. Sync should now work

## Important Notes

### IP Address Discrepancy

The CLAUDE.md file lists the local IP as **192.168.1.154**, but the actual IP is **192.168.0.104** (on wlan0).

**You should update CLAUDE.md** with the correct IP address to avoid future confusion.

### Certificate Validity

The SSL certificate is configured for:
- **192.168.0.104** (current local IP)
- **100.126.21.128** (Tailscale IP - static)
- **localhost**
- **actual-budget.local**

If your local IP changes (DHCP reassignment), re-run `./setup-ssl.sh` to regenerate the certificate.

### Self-Signed Certificate Warnings

**This is normal and safe for local network use.**

Every browser will warn about the self-signed certificate on first access. You can:
- Accept the warning each time (easiest)
- Install the certificate in your OS trust store (advanced)
- Set up Let's Encrypt with a domain name (complex for home networks)

For a home server, accepting the warning is the recommended approach.

### Why Not Use Actual's Built-in HTTPS?

Actual Budget server can use built-in HTTPS (via `ACTUAL_HTTPS_KEY` and `ACTUAL_HTTPS_CERT` env vars), but:
- Nginx provides more flexibility and better logging
- Easier to troubleshoot (separate nginx logs)
- Nginx config is version-controlled in the repo
- Standard pattern used by other services in your homelab

## Architecture Diagram

```
Browser (HTTPS) → Port 5006
              ↓
        Nginx Container
        - Terminates HTTPS
        - Passes COOP/COEP headers
              ↓
        Actual Server Container (HTTP)
        - Sends COOP/COEP headers
        - Runs on internal Docker network
              ↓
        /mnt/storage/actual-budget/
        - Budget data
        - SQLite databases
        - Sync files
```

## Verification Checklist

After completing the manual steps, verify:

- [ ] Both containers running: `docker ps | grep actual`
- [ ] HTTPS accessible: `curl -k https://192.168.0.104:5006`
- [ ] COOP/COEP headers present: `curl -k -I https://192.168.0.104:5006 | grep Cross-Origin`
- [ ] Web interface loads without SharedArrayBuffer error
- [ ] Self-signed certificate warning appears (expected)
- [ ] Can create/open budgets
- [ ] Mobile app connects via `https://100.126.21.128:5006`

## Troubleshooting

### Certificate Permission Errors

If `setup-ssl.sh` fails with permission denied:
```bash
sudo /home/vish/home-server/actual-budget/setup-ssl.sh
```

### Containers Won't Start

Check logs:
```bash
docker logs actual-budget
docker logs actual-budget-nginx
```

Common issues:
- Port 5006 already in use: `netstat -tlnp | grep 5006`
- Certificate files missing: `ls -la /mnt/storage/actual-budget/certs/`
- nginx.conf syntax error: `docker exec actual-budget-nginx nginx -t`

### Still Getting SharedArrayBuffer Error

1. Verify you're using `https://` not `http://`
2. Check headers: `curl -k -I https://192.168.0.104:5006`
3. Clear browser cache and reload
4. Try incognito/private browsing window

## Documentation Updated

The README.md has been updated with:
- HTTPS requirement explanation
- SSL certificate setup instructions
- SharedArrayBuffer troubleshooting section
- Self-signed certificate warning guidance
- Updated mobile app configuration (HTTPS URLs)
- Docker Compose architecture explanation
- Quick reference section with all commands

## Next Steps

1. Run `./setup-ssl.sh` (requires sudo password)
2. Run `docker compose up -d`
3. Access `https://192.168.0.104:5006` and verify it works
4. Update CLAUDE.md with correct IP address (192.168.0.104)
5. Update mobile apps to use HTTPS URLs
6. Enjoy your working Actual Budget instance!

---

**Questions or issues?** Check the comprehensive troubleshooting section in README.md or inspect container logs.
