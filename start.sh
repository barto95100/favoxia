#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Se placer dans le dossier du script
cd "$(dirname "$0")"

# Détecter l'IP locale
if command -v hostname &> /dev/null && hostname -I &> /dev/null; then
    LOCAL_IP=$(hostname -I | awk '{print $1}')
elif command -v ipconfig &> /dev/null; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
fi
LOCAL_IP=${LOCAL_IP:-localhost}

# Fonction pour arrêter proprement les serveurs
cleanup() {
    echo ""
    echo -e "${RED}⏹  Arrêt de Favoxia...${NC}"

    if [ ! -z "$BACKEND_PID" ]; then
        echo "Arrêt du backend..."
        kill $BACKEND_PID 2>/dev/null
    fi

    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Arrêt du frontend..."
        kill $FRONTEND_PID 2>/dev/null
    fi

    # Attendre que les processus se terminent
    sleep 2

    # Forcer l'arrêt si nécessaire
    kill -9 $BACKEND_PID 2>/dev/null
    kill -9 $FRONTEND_PID 2>/dev/null

    echo -e "${GREEN}✅ Favoxia arrêté${NC}"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}🦊 Démarrage de Favoxia...${NC}"
echo ""

# Démarrer le backend
echo -e "${GREEN}🔧 Démarrage du backend (port 8000)...${NC}"
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Attendre que le backend démarre
sleep 3

# Démarrer le frontend
echo -e "${GREEN}🎨 Démarrage du frontend (port 3000)...${NC}"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Favoxia est en cours de démarrage !${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📱 Interface (local) :${NC}  http://localhost:3000"
if [ "$LOCAL_IP" != "localhost" ]; then
echo -e "${BLUE}📱 Interface (réseau) :${NC} http://${LOCAL_IP}:3000"
fi
echo -e "${BLUE}🔌 API :${NC}               http://localhost:8000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}💡 Pour arrêter : Appuyez sur Ctrl+C${NC}"
echo ""

# Attendre que l'utilisateur arrête
wait
