# Tailscale VPN Setup

Secure remote access to your Raspberry Pi services from anywhere using Tailscale.

## Table of Contents

1. [What is Tailscale](#what-is-tailscale)
2. [Installation on Raspberry Pi](#installation-on-raspberry-pi)
3. [iOS App Setup](#ios-app-setup)
4. [Accessing Services](#accessing-services)
5. [Troubleshooting](#troubleshooting)

---

## What is Tailscale

Tailscale creates a secure, encrypted VPN network between your devices using WireGuard. Key benefits:

- **No port forwarding required** - Works behind any firewall/NAT
- **Encrypted connection** - All traffic is secured
- **Easy setup** - Install and authenticate, that's it
- **Cross-platform** - Works on iOS, Android, Windows, Mac, Linux
- **Free tier** - Up to 100 devices

---

## Installation on Raspberry Pi

### Install Tailscale
```bash
curl -fsSL https://tailscale.com/install.sh | sh
```

### Start and Authenticate
```bash
sudo tailscale up
```

This will output a URL like:
```
To authenticate, visit:
https://login.tailscale.com/a/xxxxxxxxxxxxx
```

1. Copy the URL and open it in a browser
2. Login with Google, Microsoft, or GitHub account
3. Authorize the device (name it something like "raspberry-pi" or "vish")

### Get Your Tailscale IP
```bash
tailscale ip -4
```

**My Tailscale IP:** `100.65.238.8`

Save this IP - you'll use it to access services remotely.

### Verify Connection
```bash
tailscale status
```

Should show your device as connected.

### Enable on Boot (Already done by installer)

Tailscale automatically starts on boot. Verify:
```bash
sudo systemctl status tailscaled
```

---

## iOS App Setup

### Install Tailscale on iPhone

1. Open **App Store**
2. Search for **"Tailscale"**
3. Install the official Tailscale app

### Login and Connect

1. Open Tailscale app
2. Tap **"Sign in"**
3. Login with the same account you used on the Pi (Google/Microsoft/GitHub)
4. Toggle Tailscale **ON** (should show green checkmark)
5. You should see your Raspberry Pi listed as a connected device

### Verify Connection

1. Open **Safari** on your iPhone
2. Make sure Tailscale is connected (green)
3. Navigate to: `http://100.65.238.8:2283`
4. You should see Immich login page

---

## Accessing Services

Once Tailscale is connected on both Pi and your phone/computer, use these URLs:

### From Anywhere (via Tailscale):

| Service | Tailscale URL |
|---------|---------------|
| Immich | `http://100.65.238.8:2283` |
| Paperless-ngx | `http://100.65.238.8:8000` |

### Local Network Only:

| Service | Local URL |
|---------|-----------|
| Immich | `http://192.168.1.154:2283` |
| Paperless-ngx | `http://192.168.1.154:8000` |

**Important:** Always use `http://` not `https://` - services are not configured with SSL.

---

## Troubleshooting

### Issue: Can't Access Services from Phone

**Symptoms:** "Server not reachable" in mobile apps

**Solutions:**

1. **Verify Tailscale is connected:**
   - Open Tailscale app on phone
   - Should show green checkmark/connected status
   - Pi should be listed in devices

2. **Test in browser first:**
   - Open Safari/Chrome on phone
   - Try: `http://100.65.238.8:2283`
   - If browser works but app doesn't, it's an app configuration issue

3. **Check Pi's Tailscale status:**
```bash
   tailscale status
```

4. **Restart Tailscale on Pi:**
```bash
   sudo tailscale down
   sudo tailscale up
```

### Issue: Tailscale Not Starting on Boot

**Solution:**
```bash
sudo systemctl enable tailscaled
sudo systemctl start tailscaled
sudo tailscale up
```

### Issue: "Not connected" Despite Green Checkmark

**Solution:**
- Force quit Tailscale app
- Reopen and wait 10 seconds
- Try accessing service again

### Issue: Wrong IP Address

**Solution:**

Get current Tailscale IP:
```bash
tailscale ip -4
```

Update mobile apps with new IP if it changed.

---

## Security Notes

- **Tailscale is secure:** All traffic is encrypted end-to-end
- **No passwords exposed:** Services are only accessible via Tailscale network
- **Device authentication:** Only your authenticated devices can connect
- **Still change default passwords:** Always change service passwords from defaults

---

## Next Steps

After Tailscale is set up, proceed to:
- **[Immich Setup](../immich/)** for photo management
- **[Paperless-ngx Setup](../paperless/)** for document management
