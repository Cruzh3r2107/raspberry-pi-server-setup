# Home Assistant Setup

Docker-based installation of Home Assistant for home automation on Raspberry Pi 5 with Ubuntu Server.

## Overview

Home Assistant is an open-source home automation platform that allows you to control and automate smart home devices from a single dashboard. This setup uses Docker Container installation, which provides a lightweight, isolated environment that integrates seamlessly with the existing Docker services (Immich and Paperless-ngx).

## Prerequisites

- Raspberry Pi 5 running Ubuntu Server 24.04 LTS
- Docker and Docker Compose installed
- Static IP address configured
- 1TB SSD mounted at `/mnt/storage`

## Port Configuration

**Important:** This instance uses port **8124** instead of the default 8123 to avoid conflicts with other Home Assistant instances on the network.

## Installation

### 1. Create Directory Structure

```bash
mkdir -p /mnt/storage/homeassistant
cd /mnt/storage/homeassistant
```

### 2. Create Docker Compose File

Create `docker-compose.yml`:

```yaml
version: '3'
services:
  homeassistant:
    container_name: homeassistant
    image: "ghcr.io/home-assistant/home-assistant:stable"
    volumes:
      - /mnt/storage/homeassistant/config:/config
      - /etc/localtime:/etc/localtime:ro
    restart: unless-stopped
    privileged: true
    network_mode: host
```

### 3. Start Home Assistant

```bash
docker compose up -d
```

Wait approximately 1-2 minutes for initial setup to complete.

### 4. Configure Custom Port

Edit the configuration file:

```bash
nano /mnt/storage/homeassistant/config/configuration.yaml
```

Add at the top of the file:

```yaml
http:
  server_port: 8124
```

Save and restart:

```bash
docker compose restart
```

## Access

### Local Network
```
http://192.168.1.154:8124
```

### Remote Access (via Tailscale)
```
http://100.65.238.8:8124
```

Replace with your actual Tailscale IP address.

## Initial Setup

On first access, you'll see the onboarding wizard:

1. **Create Admin Account**
   - Enter name, username, and password

2. **Set Up Home**
   - Home name
   - Location (for weather, sunrise/sunset)
   - Timezone
   - Unit system (metric/imperial)
   - Currency

3. **Device Discovery**
   - Home Assistant will automatically discover compatible devices on your network

## Managing Home Assistant

### View Logs
```bash
docker logs -f homeassistant
```

### Restart Service
```bash
cd /mnt/storage/homeassistant
docker compose restart
```

### Stop Service
```bash
docker compose down
```

### Update to Latest Version
```bash
cd /mnt/storage/homeassistant
docker compose pull
docker compose up -d
```

### Check Configuration Validity
Before restarting after configuration changes:
```bash
docker exec homeassistant python -m homeassistant --script check_config --config /config
```

## Configuration Files

All configuration files are stored in:
```
/mnt/storage/homeassistant/config/
```

Key files:
- `configuration.yaml` - Main configuration
- `automations.yaml` - Automation rules
- `scripts.yaml` - Custom scripts
- `secrets.yaml` - Sensitive data (API keys, passwords)

### Editing Configuration

```bash
nano /mnt/storage/homeassistant/config/configuration.yaml
```

After editing, check configuration validity and restart:
```bash
docker exec homeassistant python -m homeassistant --script check_config --config /config
docker compose restart
```

## Backup and Restore

### Create Backup

```bash
cd /mnt/storage
sudo tar -czf homeassistant-backup-$(date +%Y%m%d).tar.gz homeassistant/
```

### Restore from Backup

```bash
cd /mnt/storage/homeassistant
docker compose down
cd /mnt/storage
sudo tar -xzf homeassistant-backup-YYYYMMDD.tar.gz
cd /mnt/storage/homeassistant
docker compose up -d
```

## Adding USB Devices

For Z-Wave, Zigbee, or other USB devices:

### 1. Identify Device
```bash
ls -la /dev/tty*
```

Common devices:
- `/dev/ttyUSB0` - USB serial adapters
- `/dev/ttyACM0` - USB modem devices

### 2. Update docker-compose.yml

Add the `devices` section:

```yaml
version: '3'
services:
  homeassistant:
    container_name: homeassistant
    image: "ghcr.io/home-assistant/home-assistant:stable"
    volumes:
      - /mnt/storage/homeassistant/config:/config
      - /etc/localtime:/etc/localtime:ro
    devices:
      - /dev/ttyUSB0:/dev/ttyUSB0  # Add your device
    restart: unless-stopped
    privileged: true
    network_mode: host
```

### 3. Restart Container
```bash
docker compose up -d
```

## Integrations

Home Assistant supports thousands of integrations. Popular ones include:

- **Smart Lights:** Philips Hue, LIFX, TP-Link
- **Smart Speakers:** Google Home, Amazon Alexa
- **Climate:** Nest, Ecobee
- **Media:** Plex, Spotify, Sonos
- **Security:** Ring, Arlo
- **Weather:** OpenWeatherMap, Met.no
- **And many more...**

Browse integrations in the web UI: **Settings > Devices & Services**

## Mobile Apps

Home Assistant has official mobile apps:

- **iOS:** Available on App Store
- **Android:** Available on Google Play Store

Configure mobile app integration through: **Settings > Devices & Services > Add Integration > Mobile App**

## Important Notes

### Container Limitations

- **No Add-ons Store:** Home Assistant Container doesn't support the add-on store
- **Manual Add-ons:** If you need add-on functionality (like Node-RED, Mosquitto MQTT), run them as separate Docker containers
- **Manual Updates:** Updates must be performed manually using Docker commands

### Network Mode

- Using `network_mode: host` is essential for device discovery
- This allows Home Assistant to see all devices on your local network
- Required for protocols like mDNS, SSDP, and local device scanning

## Troubleshooting

### Can't Access Web Interface

1. Check container status:
   ```bash
   docker ps
   ```

2. Check logs for errors:
   ```bash
   docker logs homeassistant
   ```

3. Verify firewall allows port:
   ```bash
   sudo ufw allow 8124/tcp
   ```

4. Ensure correct IP and port

### Container Won't Start

```bash
docker logs homeassistant
```

Common issues:
- Port already in use
- Invalid configuration.yaml
- Permission issues with config directory

### Device Not Detected

- Ensure `privileged: true` is set
- Verify device path: `ls -la /dev/ttyUSB0`
- Check device permissions
- Add device mapping in docker-compose.yml

### Configuration Errors

Always validate before restarting:
```bash
docker exec homeassistant python -m homeassistant --script check_config --config /config
```

## Complementary Services

Consider adding these services as separate containers:

### Mosquitto MQTT Broker
For MQTT-based smart devices

### Node-RED
Visual automation and flow programming

### Zigbee2MQTT
Zigbee device support without proprietary hubs

### Z-Wave JS UI
Z-Wave device management

## Service Information

| Service | Port | Access |
|---------|------|--------|
| Home Assistant | 8124 | http://192.168.1.154:8124 |

**Remote Access (Tailscale):**
- Home Assistant: http://100.65.238.8:8124

## Directory Structure

```
/mnt/storage/homeassistant/
├── docker-compose.yml
└── config/
    ├── configuration.yaml
    ├── automations.yaml
    ├── scripts.yaml
    ├── secrets.yaml
    └── ... (other config files)
```

## Resources

- **Official Documentation:** https://www.home-assistant.io/docs/
- **Community Forum:** https://community.home-assistant.io/
- **Integrations:** https://www.home-assistant.io/integrations/
- **Blueprint Exchange:** https://community.home-assistant.io/c/blueprints-exchange/

## Future Plans

This Home Assistant instance will be activated when moving to the new house.

---

**Last Updated:** October 2025  
**Home Assistant Version:** Stable (Latest)  
**Docker Image:** `ghcr.io/home-assistant/home-assistant:stable`
