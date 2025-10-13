# === SYSTEM INFO ===
Local IP: 192.168.1.154
Tailscale IP: 100.65.238.8
Username: vish
SSD Mount: /mnt/storage

# === SERVICES ===
Immich:       http://192.168.1.154:2283 (Tailscale: http://100.65.238.8:2283)
Paperless:    http://192.168.1.154:8000 (Tailscale: http://100.65.238.8:8000)

# === IMPORTANT LOCATIONS ===
Immich setup:     ~/immich-setup
Paperless setup:  ~/paperless-setup
GitHub repo:      ~/raspberry-pi-server-setup
Immich data:      /mnt/storage/immich
Paperless data:   /mnt/storage/paperless

# === COMMON COMMANDS ===
# Check all containers
docker ps

# Restart a service
cd ~/immich-setup && docker compose restart
cd ~/paperless-setup && docker compose restart

# View logs
docker logs immich_server
docker logs paperless-webserver

# Check disk space
df -h /mnt/storage

# Remount SSD if I/O errors
sudo umount /mnt/storage && sudo mount -a

# Update services
cd ~/immich-setup && docker compose pull && docker compose up -d
cd ~/paperless-setup && docker compose pull && docker compose up -d

# GitHub repo
cd ~/raspberry-pi-server-setup && git pull  # Get updates
cd ~/raspberry-pi-server-setup && git add . && git commit -m "message" && git push  # Push changes

# Tailscale status
tailscale status
tailscale ip -4

# === IF SOMETHING BREAKS ===
# 1. Check if containers are running: docker ps
# 2. Check logs: docker logs [container-name]
# 3. Restart: docker compose restart
# 4. Reboot Pi: sudo reboot
