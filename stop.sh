#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}⏹  Arrêt de Favoxia...${NC}"

# Fonction portable pour trouver les PID par port
find_pids_by_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        lsof -ti:$port 2>/dev/null
    elif command -v ss &> /dev/null; then
        ss -tlnp 2>/dev/null | grep ":$port " | grep -oP 'pid=\K[0-9]+'
    elif command -v fuser &> /dev/null; then
        fuser $port/tcp 2>/dev/null
    fi
}

# Trouver et arrêter les processus backend
BACKEND_PIDS=$(find_pids_by_port 8000)
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "Arrêt du backend (port 8000)..."
    kill $BACKEND_PIDS 2>/dev/null
fi

# Trouver et arrêter les processus frontend
FRONTEND_PIDS=$(find_pids_by_port 3000)
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "Arrêt du frontend (port 3000)..."
    kill $FRONTEND_PIDS 2>/dev/null
fi

sleep 2
echo -e "${GREEN}✅ Favoxia arrêté${NC}"
