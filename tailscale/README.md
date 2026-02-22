# Tailscale VPN Setup

Secure remote access to your Raspberry Pi from anywhere.

**Official Docs:** https://tailscale.com/kb

---

## Install

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```

Follow the URL to authenticate, then get your IP:

```bash
tailscale ip -4
```

**Current Tailscale IP:** `100.126.21.128`

---

## Service Access (via Tailscale)

| Service | URL |
|---------|-----|
| Sport Kiosk | http://100.126.21.128:3000 |
| Immich | http://100.126.21.128:2283 |
| Paperless | http://100.126.21.128:8000 |
| Actual Budget | https://100.126.21.128:5006 |

---

## Troubleshooting

```bash
# Check status
tailscale status

# Restart connection
sudo tailscale down && sudo tailscale up

# Verify service is running
sudo systemctl status tailscaled
```
