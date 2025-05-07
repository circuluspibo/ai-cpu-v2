#!/bin/bash

echo ">>> [1/4] Updating unattended-upgrades config..."

UA_FILE="/etc/apt/apt.conf.d/50unattended-upgrades"
BACKUP_FILE="${UA_FILE}.bak.$(date +%s)"
sudo cp "$UA_FILE" "$BACKUP_FILE"
echo "Backed up original to: $BACKUP_FILE"

# 블랙리스트 추가 (중복 방지)
sudo sed -i '/Unattended-Upgrade::Package-Blacklist/,$d' "$UA_FILE"
sudo tee -a "$UA_FILE" > /dev/null <<EOF
Unattended-Upgrade::Package-Blacklist {
    "linux-image";
    "linux-headers";
    "linux-generic";
};
EOF

echo ">>> [2/4] Adding APT pinning to block kernel updates..."

PIN_FILE="/etc/apt/preferences.d/no-kernel-upgrade"
sudo tee "$PIN_FILE" > /dev/null <<EOF
Package: linux-image*
Pin: release a=*
Pin-Priority: -1

Package: linux-headers*
Pin: release a=*
Pin-Priority: -1
EOF

echo "Created APT pinning at: $PIN_FILE"

echo ">>> [3/4] Disabling unattended-upgrades service..."
sudo systemctl disable --now unattended-upgrades

echo ">>> [4/4] Disabling apt-daily timers..."
sudo systemctl disable --now apt-daily.timer
sudo systemctl disable --now apt-daily-upgrade.timer

echo ">>> Done. Kernel automatic updates are now disabled."
