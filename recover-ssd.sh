#!/bin/bash
# SSD Recovery Script
# Attempts to access nested partition on /dev/sda1

set -e

DEVICE="/dev/sda1"
MOUNT_POINT="/mnt/ssd-recovery"
LOOP_DEVICE="/dev/loop100"

echo "=== SSD Recovery Script ==="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)"
   exit 1
fi

# Check if device exists
if [[ ! -b "$DEVICE" ]]; then
    echo "ERROR: $DEVICE not found"
    echo "Available block devices:"
    lsblk
    exit 1
fi

# Show device info
echo "=== Device Info ==="
blkid "$DEVICE" || true
file -s "$DEVICE"
echo ""

# Create mount point
mkdir -p "$MOUNT_POINT"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "=== Cleanup Instructions ==="
    echo "When done, run:"
    echo "  sudo umount $MOUNT_POINT"
    echo "  sudo kpartx -dv $DEVICE"
    echo "  sudo losetup -d $LOOP_DEVICE 2>/dev/null"
}

# Try Method 1: kpartx
echo "=== Method 1: Trying kpartx ==="
if command -v kpartx &> /dev/null; then
    kpartx -av "$DEVICE" 2>/dev/null || true
    sleep 1

    if [[ -b /dev/mapper/sda1p1 ]]; then
        echo "Found nested partition: /dev/mapper/sda1p1"
        blkid /dev/mapper/sda1p1 || true
        file -s /dev/mapper/sda1p1

        echo ""
        echo "Attempting to mount..."
        if mount /dev/mapper/sda1p1 "$MOUNT_POINT" 2>/dev/null; then
            echo "SUCCESS! Mounted at $MOUNT_POINT"
            echo ""
            echo "=== Contents ==="
            ls -la "$MOUNT_POINT"
            echo ""
            df -h "$MOUNT_POINT"
            cleanup
            exit 0
        else
            echo "Mount failed, trying read-only..."
            if mount -o ro /dev/mapper/sda1p1 "$MOUNT_POINT" 2>/dev/null; then
                echo "SUCCESS! Mounted read-only at $MOUNT_POINT"
                echo ""
                echo "=== Contents ==="
                ls -la "$MOUNT_POINT"
                cleanup
                exit 0
            fi
        fi
    fi
    kpartx -dv "$DEVICE" 2>/dev/null || true
else
    echo "kpartx not installed. Installing..."
    apt install -y kpartx
    echo "Please re-run this script"
    exit 1
fi

# Try Method 2: losetup with offset
echo ""
echo "=== Method 2: Trying losetup with offset ==="

# Get partition start from fdisk
OFFSET=$(fdisk -l "$DEVICE" 2>/dev/null | grep "^${DEVICE}" | awk '{print $2}')
if [[ -z "$OFFSET" ]] || [[ "$OFFSET" == "*" ]]; then
    OFFSET=$(fdisk -l "$DEVICE" 2>/dev/null | grep "^${DEVICE}" | awk '{print $3}')
fi

if [[ -z "$OFFSET" ]]; then
    # Default offset from previous output: 2048 sectors
    OFFSET=2048
fi

OFFSET_BYTES=$((OFFSET * 512))
echo "Using offset: $OFFSET sectors ($OFFSET_BYTES bytes)"

# Remove existing loop if present
losetup -d "$LOOP_DEVICE" 2>/dev/null || true

# Create loop device with offset
losetup -o "$OFFSET_BYTES" "$LOOP_DEVICE" "$DEVICE"
echo "Created loop device: $LOOP_DEVICE"

file -s "$LOOP_DEVICE"

echo ""
echo "Attempting to mount..."
if mount "$LOOP_DEVICE" "$MOUNT_POINT" 2>/dev/null; then
    echo "SUCCESS! Mounted at $MOUNT_POINT"
    echo ""
    echo "=== Contents ==="
    ls -la "$MOUNT_POINT"
    echo ""
    df -h "$MOUNT_POINT"
    cleanup
    exit 0
fi

echo "Trying read-only mount..."
if mount -o ro "$LOOP_DEVICE" "$MOUNT_POINT" 2>/dev/null; then
    echo "SUCCESS! Mounted read-only at $MOUNT_POINT"
    echo ""
    echo "=== Contents ==="
    ls -la "$MOUNT_POINT"
    cleanup
    exit 0
fi

# Try Method 3: Force ext4
echo ""
echo "=== Method 3: Trying force ext4 ==="
if mount -t ext4 "$LOOP_DEVICE" "$MOUNT_POINT" 2>/dev/null; then
    echo "SUCCESS! Mounted as ext4 at $MOUNT_POINT"
    ls -la "$MOUNT_POINT"
    cleanup
    exit 0
fi

# Cleanup failed attempts
losetup -d "$LOOP_DEVICE" 2>/dev/null || true

echo ""
echo "=== All methods failed ==="
echo ""
echo "Diagnostic info:"
echo "--- fdisk output ---"
fdisk -l "$DEVICE"
echo ""
echo "--- First 512 bytes (hex) ---"
hexdump -C "$DEVICE" -n 512 | head -20
echo ""
echo "--- Checking for ext4 superblock at offset 1024 ---"
hexdump -C "$DEVICE" -s 1024 -n 64

echo ""
echo "You may need to use testdisk or photorec for deeper recovery:"
echo "  sudo apt install testdisk"
echo "  sudo testdisk /dev/sda"
