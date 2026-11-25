#!/bin/bash
# CyberPeace Attack Map - Stop Script

cd "$(dirname "$0")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

stop_process() {
    local pattern="$1"
    local label="$2"

    local pids
    pids=$(pgrep -f "$pattern" || true)

    if [ -z "$pids" ]; then
        echo -e "${YELLOW}[!] ${label} not running${NC}"
        return
    fi

    echo -e "${GREEN}[✓] Stopping ${label} (${pids})${NC}"
    pkill -f "$pattern" 2>/dev/null || true
    sleep 1
    pkill -9 -f "$pattern" 2>/dev/null || true
}

echo -e "${BLUE}=== CyberPeace Attack Map - Stopping Services ===${NC}"
echo

stop_process "AttackMapServer.py" "AttackMapServer"
stop_process "DataServer.py" "DataServer"
stop_process "syslog-gen-file.sh" "Syslog Generator"

echo
echo -e "${GREEN}[✓] All requested services stopped!${NC}"
echo -e "${BLUE}Redis is left running (if started separately).${NC}"
echo -e "${BLUE}To stop Redis:${NC} ${YELLOW}redis-cli shutdown${NC}"
echo
