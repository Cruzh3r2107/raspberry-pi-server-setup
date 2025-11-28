#!/bin/bash
set -e

echo "Setting up SSL certificates for Actual Budget..."

# Create certs directory with proper permissions
sudo rm -rf /mnt/storage/actual-budget/certs /mnt/storage/actual-budget/nginx
sudo mkdir -p /mnt/storage/actual-budget/certs
sudo chown -R 1000:1000 /mnt/storage/actual-budget/certs

# Get current local IP
LOCAL_IP=$(ip addr show wlan0 | grep "inet " | awk '{print $2}' | cut -d/ -f1)
echo "Detected local IP: $LOCAL_IP"

# Generate self-signed certificate (valid for 10 years)
sudo openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout /mnt/storage/actual-budget/certs/key.pem \
  -out /mnt/storage/actual-budget/certs/cert.pem \
  -subj "/C=US/ST=Illinois/L=Chicago/O=HomeServer/CN=actual-budget.local" \
  -addext "subjectAltName=IP:${LOCAL_IP},IP:100.126.21.128,DNS:actual-budget.local,DNS:localhost"

# Fix permissions
sudo chown -R 1000:1000 /mnt/storage/actual-budget/certs
sudo chmod 644 /mnt/storage/actual-budget/certs/cert.pem
sudo chmod 600 /mnt/storage/actual-budget/certs/key.pem

echo "SSL certificates created successfully!"
echo "Certificate includes: $LOCAL_IP, 100.126.21.128, actual-budget.local, localhost"
echo ""
echo "You can now start Actual Budget with: cd ~/home-server/actual-budget && docker compose up -d"
