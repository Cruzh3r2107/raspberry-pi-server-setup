# Operating System & Initial Setup

Complete guide for installing Ubuntu Server 24.04 LTS on Raspberry Pi 5 and configuring storage and display.

## Table of Contents

1. [Ubuntu Server Installation](#ubuntu-server-installation)
2. [SSH Configuration](#ssh-configuration)
3. [WiFi Setup](#wifi-setup)
4. [SSD Storage Setup](#ssd-storage-setup)
5. [Touchscreen Display Configuration](#touchscreen-display-configuration)
6. [Auto-Login Setup](#auto-login-setup)

---

## Ubuntu Server Installation

### Download and Flash

1. Download **Ubuntu Server 24.04 LTS** for Raspberry Pi from: https://ubuntu.com/download/raspberry-pi
2. Download and install **Raspberry Pi Imager**: https://www.raspberrypi.com/software/
3. Flash Ubuntu Server to 32GB SD card:
   - Open Raspberry Pi Imager
   - Choose OS → Other → Ubuntu Server 24.04 LTS (64-bit)
   - Choose Storage → Select your SD card
   - Click "Write"

### Initial Boot

1. Insert SD card into Raspberry Pi 5
2. Connect keyboard, monitor, and power
3. Wait for first boot (takes 2-3 minutes)
4. Default login:
   - Username: `ubuntu`
   - Password: `ubuntu`
5. You'll be prompted to change password immediately

### System Update
```bash
sudo apt update && sudo apt upgrade -y
```

---

## SSH Configuration

SSH is enabled by default on Ubuntu Server.

### Find Your Pi's IP Address
```bash
hostname -I
```

**My Pi's IP:** `192.168.1.154`

### Connect from Another Computer
```bash
ssh vish@192.168.1.154
```

---

## WiFi Setup

Ubuntu Server uses Netplan for network configuration.

### Edit Network Configuration
```bash
sudo nano /etc/netplan/50-cloud-init.yaml
```

### Add WiFi Configuration
```yaml
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: true
      optional: true
  wifis:
    wlan0:
      dhcp4: true
      optional: true
      access-points:
        "YOUR-WIFI-NAME":
          password: "YOUR-WIFI-PASSWORD"
```

**Replace:**
- `YOUR-WIFI-NAME` with your WiFi network name
- `YOUR-WIFI-PASSWORD` with your WiFi password

### Apply Changes
```bash
sudo netplan apply
```

### Verify Connection
```bash
ip addr show wlan0
ping google.com
```

---

## SSD Storage Setup

My setup uses a 1TB ORICO SSD for all data storage.

### 1. Identify the SSD
```bash
lsblk
```

Output should show your SSD (typically `/dev/sda`).

### 2. Create Partition
```bash
sudo fdisk /dev/sda
```

Commands in fdisk:
- `n` - New partition
- `p` - Primary
- `1` - Partition number
- Press `Enter` twice (accept defaults)
- `w` - Write changes

### 3. Format as ext4
```bash
sudo mkfs.ext4 /dev/sda1
```

If prompted to remove existing signature, type `y`.

### 4. Create Mount Point
```bash
sudo mkdir /mnt/storage
```

### 5. Get UUID
```bash
sudo blkid /dev/sda1
```

Copy the UUID value (e.g., `3360dce6-9ade-4813-9396-9e7fec373707`).

### 6. Configure Auto-Mount
```bash
sudo nano /etc/fstab
```

Add this line at the end (replace UUID with yours):
```
UUID=YOUR-UUID-HERE /mnt/storage ext4 defaults,nofail 0 2
```

**My SSD UUID:** `3360dce6-9ade-4813-9396-9e7fec373707`

### 7. Mount and Verify
```bash
sudo mount -a
df -h | grep storage
```

### 8. Set Permissions
```bash
sudo chown -R vish:vish /mnt/storage
```

---

## Touchscreen Display Configuration

My 3.5" touchscreen uses the TFT35a driver.

### Edit Boot Configuration
```bash
sudo nano /boot/firmware/config.txt
```

### Add Display Configuration

Scroll to the end, **after the `[all]` section**, and add:
```ini
[all]
# 3.5" LCD Display Configuration
hdmi_force_hotplug=1
dtparam=i2c_arm=on
dtparam=spi=on
enable_uart=1
dtoverlay=tft35a:rotate=270
hdmi_group=2
hdmi_mode=87
hdmi_cvt 480 320 60 6 0 0 0
hdmi_drive=2
```

**Rotation values:**
- `rotate=0` - Normal orientation
- `rotate=90` - 90 degrees clockwise
- `rotate=180` - Upside down
- `rotate=270` - 270 degrees clockwise

**Important:** Configuration MUST be in the `[all]` section, not `[cm4]` or other board-specific sections.

### Enable Console on Touchscreen
```bash
sudo nano /boot/firmware/cmdline.txt
```

At the very end of the single line (don't create new line), add:
```
fbcon=map:10 console=tty1
```

### Reboot
```bash
sudo reboot
```

### Verify Display Works

After reboot, check framebuffers:
```bash
ls /dev/fb*
```

Should show both `/dev/fb0` (HDMI) and `/dev/fb1` (touchscreen).

---

## Auto-Login Setup

Configure automatic login on the touchscreen console.

### Create Auto-Login Override
```bash
sudo mkdir -p /etc/systemd/system/getty@tty1.service.d/
sudo nano /etc/systemd/system/getty@tty1.service.d/autologin.conf
```

### Add Configuration
```ini
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin vish --noclear %I $TERM
```

**Replace** `vish` with your username if different.

### Apply Changes
```bash
sudo systemctl daemon-reload
sudo reboot
```

After reboot, you'll be automatically logged in on the touchscreen.

---

## Troubleshooting

### Issue: SSD I/O Errors

**Symptoms:** `Input/output error` when accessing `/mnt/storage`

**Solution:**
```bash
sudo umount /mnt/storage
sudo mount -a
ls /mnt/storage/
```

### Issue: Touchscreen Shows Black/White Screen

**Symptoms:** Display powered but not showing terminal

**Solutions:**

1. Verify display config is in `[all]` section of config.txt
2. Check framebuffer exists:
```bash
   ls /dev/fb1
```
3. Verify SPI is enabled:
```bash
   ls /dev/spi*
```

### Issue: Touchscreen Wrong Orientation

**Solution:** Change `rotate=270` value in `/boot/firmware/config.txt` to:
- `0`, `90`, `180`, or `270` depending on desired orientation

---

## System Verification

After completing all setup steps, verify:
```bash
# Check storage is mounted
df -h | grep storage

# Check display framebuffers
ls /dev/fb*

# Check WiFi connection
ip addr show wlan0

# Check system info
uname -a
free -h
```

**My System Info:**
- OS: Ubuntu 24.04 LTS
- Kernel: 6.8.0-1040-raspi
- Total RAM: 16GB
- Storage: 1TB SSD at /mnt/storage
- Display: 3.5" touchscreen (480x320)

---

## Next Steps

After OS setup is complete, proceed to:
- **[Tailscale VPN Setup](../tailscale/)** for remote access
- **[Docker Installation](../immich/)** for running services
