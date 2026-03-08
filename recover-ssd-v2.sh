#!/bin/bash
# SSD Recovery Script v2
# Deep analysis and repair for nested partition

set -e

DEVICE="/dev/sda1"
NESTED_DEVICE="/dev/mapper/sda1p1"
MOUNT_POINT="/mnt/ssd-recovery"
NESTED_OFFSET=1048576  # 2048 sectors * 512 bytes

echo "=== SSD Recovery Script v2 ==="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)"
   exit 1
fi

# Check if device exists
if [[ ! -b "$DEVICE" ]]; then
    echo "ERROR: $DEVICE not found"
    lsblk
    exit 1
fi

# Install required tools
echo "=== Installing required tools ==="
apt install -y kpartx e2fsprogs testdisk 2>/dev/null || true
echo ""

# Create mount point
mkdir -p "$MOUNT_POINT"

echo "=== Step 1: Checking for ext4 signature ==="
echo "Looking for ext4 magic (53 ef) at nested partition superblock..."
echo ""

# ext4 superblock is at offset 1024 within the partition
# So total offset = partition offset + 1024 = 1048576 + 1024 = 1049600
# Magic number is at offset 56 within superblock = 1049656

MAGIC_OFFSET=$((NESTED_OFFSET + 1024 + 56))
echo "Checking offset $MAGIC_OFFSET for ext4 magic:"
MAGIC=$(hexdump -C "$DEVICE" -s $MAGIC_OFFSET -n 2 | head -1)
echo "$MAGIC"

if echo "$MAGIC" | grep -q "53 ef"; then
    echo ""
    echo "*** EXT4 FILESYSTEM FOUND! ***"
    echo ""
else
    echo ""
    echo "WARNING: ext4 magic not found at expected location"
    echo "Checking alternate locations..."

    # Check at start of device (in case no nesting)
    echo "At offset 1080 (no nesting):"
    hexdump -C "$DEVICE" -s 1080 -n 2 | head -1

    # Check superblock backup locations
    echo "Checking superblock backup at block 32768:"
    BACKUP_OFFSET=$((NESTED_OFFSET + 32768 * 4096 + 56))
    hexdump -C "$DEVICE" -s $BACKUP_OFFSET -n 2 2>/dev/null | head -1 || echo "Out of range"
fi

echo ""
echo "=== Step 2: Superblock dump ==="
echo "Dumping superblock area:"
hexdump -C "$DEVICE" -s $((NESTED_OFFSET + 1024)) -n 256

echo ""
echo "=== Step 3: Setting up device mapper ==="
kpartx -dv "$DEVICE" 2>/dev/null || true
sleep 1
kpartx -av "$DEVICE"
sleep 1

if [[ ! -b "$NESTED_DEVICE" ]]; then
    echo "ERROR: Failed to create $NESTED_DEVICE"
    exit 1
fi

echo ""
echo "=== Step 4: Filesystem check (read-only first) ==="
echo "Running fsck.ext4 in check-only mode..."
echo ""

# Run fsck in no-modify mode first
if fsck.ext4 -n "$NESTED_DEVICE" 2>&1; then
    echo ""
    echo "Filesystem appears OK!"
else
    echo ""
    echo "Filesystem has errors."
fi

echo ""
echo "=== Step 5: Attempting mount ==="

# Try normal mount
if mount "$NESTED_DEVICE" "$MOUNT_POINT" 2>/dev/null; then
    echo "SUCCESS! Mounted at $MOUNT_POINT"
    echo ""
    echo "=== Contents ==="
    ls -la "$MOUNT_POINT"
    df -h "$MOUNT_POINT"
    echo ""
    echo "To unmount later: sudo umount $MOUNT_POINT && sudo kpartx -dv $DEVICE"
    exit 0
fi

# Try read-only
if mount -o ro "$NESTED_DEVICE" "$MOUNT_POINT" 2>/dev/null; then
    echo "Mounted READ-ONLY at $MOUNT_POINT"
    echo ""
    ls -la "$MOUNT_POINT"
    echo ""
    echo "To unmount later: sudo umount $MOUNT_POINT && sudo kpartx -dv $DEVICE"
    exit 0
fi

# Try with noload (no journal replay)
if mount -o ro,noload "$NESTED_DEVICE" "$MOUNT_POINT" 2>/dev/null; then
    echo "Mounted READ-ONLY (no journal) at $MOUNT_POINT"
    echo ""
    ls -la "$MOUNT_POINT"
    echo ""
    echo "To unmount later: sudo umount $MOUNT_POINT && sudo kpartx -dv $DEVICE"
    exit 0
fi

echo "Mount failed. Filesystem may need repair."
echo ""

echo "=== Step 6: Repair options ==="
echo ""
echo "Choose an option:"
echo "1) Run fsck.ext4 -y (auto-fix errors)"
echo "2) Try superblock backup recovery"
echo "3) Run testdisk (interactive)"
echo "4) Exit without repair"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "Running fsck.ext4 -y ..."
        fsck.ext4 -y "$NESTED_DEVICE" || true
        echo ""
        echo "Attempting mount after repair..."
        if mount "$NESTED_DEVICE" "$MOUNT_POINT" 2>/dev/null; then
            echo "SUCCESS! Mounted at $MOUNT_POINT"
            ls -la "$MOUNT_POINT"
        else
            echo "Mount still failed. Try option 2 or 3."
        fi
        ;;
    2)
        echo ""
        echo "Trying superblock backup recovery..."
        echo "Available backup superblocks (typical locations):"
        echo "  32768, 98304, 163840, 229376, 294912"
        echo ""

        for sb in 32768 98304 163840 229376; do
            echo "Trying superblock at $sb..."
            if fsck.ext4 -b $sb -y "$NESTED_DEVICE" 2>&1 | grep -q "RECOVERED"; then
                echo "Recovery with superblock $sb succeeded!"
                break
            fi
        done

        echo ""
        echo "Attempting mount..."
        if mount "$NESTED_DEVICE" "$MOUNT_POINT" 2>/dev/null; then
            echo "SUCCESS! Mounted at $MOUNT_POINT"
            ls -la "$MOUNT_POINT"
        else
            echo "Mount failed. Try testdisk (option 3)."
        fi
        ;;
    3)
        echo ""
        echo "Launching testdisk..."
        echo ""
        echo "Instructions:"
        echo "1. Select /dev/sda (not sda1)"
        echo "2. Choose 'Intel' partition type"
        echo "3. Select 'Analyse'"
        echo "4. Select 'Quick Search'"
        echo "5. If partitions found, select 'Write' to restore"
        echo ""
        kpartx -dv "$DEVICE" 2>/dev/null || true
        testdisk /dev/sda
        ;;
    4)
        echo "Exiting without repair."
        kpartx -dv "$DEVICE" 2>/dev/null || true
        exit 0
        ;;
    *)
        echo "Invalid choice. Exiting."
        kpartx -dv "$DEVICE" 2>/dev/null || true
        exit 1
        ;;
esac

echo ""
echo "=== Cleanup ==="
echo "To clean up: sudo umount $MOUNT_POINT; sudo kpartx -dv $DEVICE"
