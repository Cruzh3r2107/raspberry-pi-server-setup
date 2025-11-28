# Raspberry Pi 5 Home Server Setup

Personal home server setup running Immich (photo management), Paperless-ngx (document management), Sport Kiosk (live sports scores), and Actual Budget (personal finance) with Tailscale VPN for remote access.

## 📑 Table of Contents

1. **[Hardware](./hardware/)** - Complete hardware specifications
2. **[Operating System & Initial Setup](./os-setup/)** - Ubuntu Server installation and configuration
3. **[Tailscale VPN](./tailscale/)** - Secure remote access setup
4. **[Immich](./immich/)** - Photo management system
5. **[Paperless-ngx](./paperless/)** - Document management system
6. **[Sport Kiosk](./sport-kiosk/)** - Live sports scores kiosk display
7. **[Actual Budget](./actual-budget/)** - Personal finance and budget management
8. **[Homeassistant](./homeassistant/)** - Smart Home Operating System

## 🚀 Quick Overview

This repository documents my complete Raspberry Pi 5 home server setup, including:

- **Photo Management** with Immich - Self-hosted Google Photos alternative
- **Document Management** with Paperless-ngx - OCR-enabled document organization
- **Sports Kiosk** with Sport Kiosk - Live sports scores display for tablets
- **Personal Finance** with Actual Budget - Zero-based budgeting and expense tracking
- **Remote Access** via Tailscale - Secure VPN for accessing services anywhere
- **Touchscreen Display** - 3.5" display showing system information

## 📊 Services Running

| Service | Port | Access URL |
|---------|------|------------|
| Immich | 2283 | http://192.168.1.154:2283 |
| Paperless-ngx | 8000 | http://192.168.1.154:8000 |
| Sport Kiosk | 3000 | http://192.168.1.154:3000 |
| Actual Budget | 5006 | https://192.168.1.154:5006 (HTTPS required) |
| Homeassistant | 8124 | http://192.168.1.154:8124 |

**Remote Access (via Tailscale):**
- Immich: `http://100.126.21.128:2283`
- Paperless: `http://100.126.21.128:8000`
- Sport Kiosk: `http://100.126.21.128:3000`
- Actual Budget: `https://100.126.21.128:5006` (HTTPS required)

## 🛠️ Tech Stack

- **OS:** Ubuntu Server 24.04 LTS
- **Containerization:** Docker & Docker Compose
- **VPN:** Tailscale
- **Storage:** 1TB SSD mounted at `/mnt/storage`

## 📱 Mobile Apps

- **Immich** - Available on iOS & Android App Stores
- **Paperless Mobile** - Available on iOS & Android App Stores
- **Actual Budget** - Available on iOS & Android App Stores
- **Tailscale** - Required for remote access

---

Detailed instructions for each component are in their respective directories.
