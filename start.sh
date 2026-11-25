#!/bin/bash
# CyberPeace Attack Map - Headless starter
set -e

cd "$(dirname "$0")"
ROOT_DIR="$(pwd)"
LOG_DIR="$ROOT_DIR/logs"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

mkdir -p "$LOG_DIR"
SYSLOG_LOG="$LOG_DIR/syslog-gen.log"
DATA_LOG="$LOG_DIR/dataserver.log"
WEB_LOG="$LOG_DIR/attackmap.log"

banner() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  CyberPeace Attack Map - Launcher     ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo
}

already_running() {
    local needle="$1"
    local pid cwd
    for pid in $(pgrep -f "$needle" || true); do
        cwd=$(readlink -f "/proc/$pid/cwd" 2>/dev/null || true)
        case "$cwd" in
            "$ROOT_DIR"|"$ROOT_DIR"/*) return 0 ;;
        esac
    done
    return 1
}

banner

if already_running "AttackMapServer.py" || \
   already_running "DataServer.py" || \
   already_running "syslog-gen-file.sh"; then
    echo -e "${RED}[!] Services already running. Run ./stop.sh first.${NC}"
    exit 1
fi

if [ ! -d "myenv-test" ]; then
    echo -e "${YELLOW}[!] Virtual environment missing. Creating...${NC}"
    python3 -m venv myenv-test
    echo -e "${YELLOW}[ ] Installing dependencies...${NC}"
    myenv-test/bin/pip install --upgrade pip >/dev/null
    myenv-test/bin/pip install -r requirements.txt >/dev/null
    echo -e "${GREEN}[✓] Virtual environment ready${NC}"
fi

PYTHON_BIN="$ROOT_DIR/myenv-test/bin/python3"
if [ ! -x "$PYTHON_BIN" ]; then
    echo -e "${RED}[!] Python interpreter not found at $PYTHON_BIN${NC}"
    exit 1
fi

# Ensure Redis is running
echo -e "${BLUE}[*] Checking Redis server...${NC}"
if ! pgrep -x "redis-server" >/dev/null 2>&1; then
    echo -e "${YELLOW}[!] Redis not running. Attempting to start...${NC}"
    redis-server --daemonize yes >/dev/null 2>&1 || true
    sleep 2
    if pgrep -x "redis-server" >/dev/null 2>&1; then
        echo -e "${GREEN}[✓] Redis started${NC}"
    else
        echo -e "${RED}[!] Could not start Redis automatically. Start it manually and retry.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}[✓] Redis is running${NC}"
fi

touch "$ROOT_DIR/DataServer/test-syslog.log"

start_service() {
    local name="$1"
    local command="$2"
    local log="$3"

    echo -e "${GREEN}[*] Starting ${name}...${NC}"
    nohup bash -c "$command" >"$log" 2>&1 &
    sleep 1
    if ps -p $! >/dev/null 2>&1; then
        echo -e "${GREEN}[✓] ${name} running (PID $!) - log: $log${NC}"
    else
        echo -e "${RED}[!] Failed to start ${name}. Check $log for details.${NC}"
        exit 1
    fi
}

start_service "Syslog Generator" "cd '$ROOT_DIR/DataServer' && exec ./syslog-gen-file.sh" "$SYSLOG_LOG"
start_service "DataServer" "cd '$ROOT_DIR/DataServer' && exec '$PYTHON_BIN' -u DataServer.py ./test-syslog.log" "$DATA_LOG"
start_service "AttackMapServer" "cd '$ROOT_DIR/AttackMapServer' && exec '$PYTHON_BIN' -u AttackMapServer.py" "$WEB_LOG"

echo
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ All services started!               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo
echo -e "${BLUE}Access the Attack Map:${NC}  ${YELLOW}http://localhost:3306/${NC}"
echo -e "${BLUE}Logs directory:${NC}        ${YELLOW}$LOG_DIR${NC}"
echo -e "${BLUE}Stop services:${NC}         ${YELLOW}./stop.sh${NC}"
echo
