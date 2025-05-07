#!/bin/bash

echo ">>> [1/4] Restoring unattended-upgrades config..."

UA_FILE="/etc/apt/apt.conf.d/50unattended-upgrades"
BACKUP_FILE=$(ls -t /etc/apt/apt.conf.d/50unattended-upgrades.bak.* 2>/dev/null | head -n 1)

if [ -f "$BACKUP_FILE" ]; then
    echo "Found backup: $BACKUP_FILE"
    sudo cp "$BACKUP_FILE" "$UA_FILE"
    echo "Restored original unattended-upgrades config."
else
    # If no backup exists, just remove the Package-Blacklist section
    sudo sed -i '/Unattended-Upgrade::Package-Blacklist/,$d' "$UA_FILE"
    echo "No backup found. Cleaned blacklist section."
fi

echo ">>> [2/4] Removing APT pinning..."

PIN_FILE="/etc/apt/preferences.d/no-kernel-upgrade"
if [ -f "$PIN_FILE" ]; then
    sudo rm "$PIN_FILE"
    echo "Removed pinning file: $PIN_FILE"
else
    echo "No pinning file found."
fi

echo ">>> [3/4] Re-enabling unattended-upgrades service..."
sudo systemctl enable --now unattended-upgrades

echo ">>> [4/4] Re-enabling apt-daily timers..."
sudo systemctl enable --now apt-daily.timer
sudo systemctl enable --now apt-daily-upgrade.timer

echo ">>> Done. Kernel automatic updates have been restored."
