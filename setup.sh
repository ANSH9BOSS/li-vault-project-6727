#!/data/data/com.termux/files/usr/bin/bash

# ==========================================
# LI-HUB: NEURAL IDE DEPLOYER (TERMUX)
# ==========================================

clear
echo -e "\033[35m"
echo "    __    _         __  __      __  "
echo "   / /   (_)       / / / /_  __/ /_ "
echo "  / /   / /       / /_/ / / / / __ \\"
echo " / /___/ /       / __  / /_/ / /_/ /"
echo "/_____/_/       /_/ /_/\\__,_/_.___/ "
echo -e "\033[0m"
echo -e "\033[36m[SYSTEM]\033[0m Made by Li - Initializing IDE..."

# 1. Define Paths
WORK_DIR="$HOME/li-hub-ultimate"
CURRENT_DIR=$(pwd)

# 2. Check if we are in restricted storage
if [[ "$CURRENT_DIR" == *"/storage/emulated/"* ]]; then
    echo -e "\033[33m[NOTICE]\033[0m Detected restricted Android storage (Downloads)."
    echo -e "\033[36m[ACTION]\033[0m Migrating to Internal Termux Storage for full permissions..."
    
    mkdir -p "$WORK_DIR"
    cp -r "$CURRENT_DIR"/* "$WORK_DIR/"
    cd "$WORK_DIR"
    
    echo -e "\033[32m[SUCCESS]\033[0m Migration complete. We are now in: $WORK_DIR"
fi

# 3. System Handshake
echo -e "\033[33m[STEP 1/3]\033[0m Checking environment..."
termux-setup-storage
pkg update -y
pkg install nodejs python clang git -y

# 4. Neural Dependencies
echo -e "\033[33m[STEP 2/3]\033[0m Installing Node modules (this fixes EACCES)..."
npm install --no-audit --no-fund

# 5. Launch Protocol
echo -e "\033[33m[STEP 3/3]\033[0m Finalizing Neural Handshake..."
echo -e "\033[32m"
echo "=========================================="
echo "      LI-HUB IS READY TO LAUNCH           "
echo "=========================================="
echo -e "\033[0m"

npm start
