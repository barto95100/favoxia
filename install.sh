#!/bin/bash

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════╗"
echo "║                                              ║"
echo "║          🦊  FAVOXIA INSTALLER  🦊          ║"
echo "║                                              ║"
echo "║    Installation automatique de Favoxia       ║"
echo "║                                              ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Détecter l'OS
OS="$(uname -s)"
echo -e "${BLUE}📋 Système détecté : ${OS}${NC}"
echo ""

# --- Installation des dépendances système selon l'OS ---

install_linux_deps() {
    echo -e "${BLUE}📦 Installation des dépendances système pour Linux...${NC}"

    if command -v apt-get &> /dev/null; then
        # Debian / Ubuntu
        sudo apt-get update -qq
        sudo apt-get install -y --no-install-recommends \
            python3 python3-pip python3-venv \
            nodejs npm \
            libnss3 libnspr4 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 \
            libcups2 libdrm2 libxkbcommon0 libatspi2.0-0 libxcomposite1 \
            libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
            libcairo2 libasound2 libx11-xcb1
    elif command -v dnf &> /dev/null; then
        # Fedora / RHEL
        sudo dnf install -y python3 python3-pip nodejs npm \
            nss nspr dbus-libs atk at-spi2-atk cups-libs libdrm \
            libxkbcommon at-spi2-core libXcomposite libXdamage libXfixes \
            libXrandr mesa-libgbm pango cairo alsa-lib libxcb
    elif command -v pacman &> /dev/null; then
        # Arch Linux
        sudo pacman -Sy --noconfirm python python-pip nodejs npm \
            nss nspr dbus atk at-spi2-atk libcups libdrm \
            libxkbcommon at-spi2-core libxcomposite libxdamage libxfixes \
            libxrandr mesa pango cairo alsa-lib libxcb
    else
        echo -e "${YELLOW}⚠️  Gestionnaire de paquets non reconnu. Installez manuellement :${NC}"
        echo "   - python3, python3-pip, python3-venv"
        echo "   - nodejs, npm"
        echo "   - Dépendances Chromium pour Playwright (libnss3, libgbm1, etc.)"
    fi
}

install_macos_deps() {
    echo -e "${BLUE}📦 Vérification des dépendances pour macOS...${NC}"

    if ! command -v brew &> /dev/null; then
        echo -e "${YELLOW}⚠️  Homebrew non trouvé. Installation recommandée :${NC}"
        echo '   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    fi

    if ! command -v python3 &> /dev/null; then
        echo -e "${YELLOW}Installation de Python via Homebrew...${NC}"
        brew install python3
    fi

    if ! command -v node &> /dev/null; then
        echo -e "${YELLOW}Installation de Node.js via Homebrew...${NC}"
        brew install node
    fi
}

case "$OS" in
    Linux)
        install_linux_deps
        ;;
    Darwin)
        install_macos_deps
        ;;
    *)
        echo -e "${RED}❌ Système non supporté : $OS${NC}"
        exit 1
        ;;
esac

echo ""

# Vérifier Python
echo -e "${BLUE}📋 Vérification des prérequis...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 n'est pas installé${NC}"
    echo "Installez Python 3.11+ depuis https://www.python.org/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
echo -e "${GREEN}✅ Python $PYTHON_VERSION trouvé${NC}"

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    echo "Installez Node.js 18+ depuis https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js $NODE_VERSION trouvé${NC}"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm $NPM_VERSION trouvé${NC}"
echo ""

# Installation du backend
echo -e "${BLUE}📦 Installation du backend...${NC}"
cd backend

if [ ! -d "venv" ]; then
    echo "Création de l'environnement virtuel Python..."
    python3 -m venv venv
fi

echo "Activation de l'environnement virtuel..."
source venv/bin/activate

echo "Installation des dépendances Python..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de l'installation des dépendances Python${NC}"
    exit 1
fi

# Installer les navigateurs Playwright
echo "Installation du navigateur Chromium pour Playwright..."
playwright install chromium

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend installé avec succès${NC}"
else
    echo -e "${YELLOW}⚠️  Playwright Chromium n'a pas pu être installé (thumbnails/favicons désactivés)${NC}"
fi

cd ..

# Installation du frontend
echo ""
echo -e "${BLUE}🎨 Installation du frontend...${NC}"
cd frontend

if [ -d "node_modules" ]; then
    echo "node_modules existe déjà, nettoyage..."
    rm -rf node_modules
fi

echo "Installation des dépendances Node.js..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erreur lors de l'installation du frontend${NC}"
    exit 1
fi

echo "Compilation de l'application pour la production..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend installé et compilé avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de la compilation du frontend${NC}"
    exit 1
fi

cd ..

# Création du script de lancement
echo ""
echo -e "${BLUE}🚀 Création du script de lancement...${NC}"

cat > start.sh << 'EOF'
#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

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
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📱 Interface :${NC} http://localhost:3000"
echo -e "${BLUE}🔌 API :${NC}      http://localhost:8000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}💡 Pour arrêter : Appuyez sur Ctrl+C${NC}"
echo ""

# Attendre que l'utilisateur arrête
wait
EOF

chmod +x start.sh

# Création du script d'arrêt (compatible Linux + macOS)
cat > stop.sh << 'EOF'
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
EOF

chmod +x stop.sh

# Succès !
echo ""
echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════╗"
echo "║                                              ║"
echo "║        ✅  INSTALLATION TERMINÉE  ✅        ║"
echo "║                                              ║"
echo "╚══════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${BLUE}🚀 Pour lancer Favoxia :${NC}"
echo ""
echo "   ./start.sh"
echo ""
echo -e "${BLUE}⏹  Pour arrêter Favoxia :${NC}"
echo ""
echo "   Ctrl+C (dans le terminal où start.sh est lancé)"
echo "   ou"
echo "   ./stop.sh (pour arrêter depuis un autre terminal)"
echo ""
echo -e "${BLUE}📖 Documentation :${NC}"
echo ""
echo "   - README.md  : Guide complet"
echo "   - INSTALL.md : Guide d'installation détaillé"
echo ""
echo -e "${GREEN}🌐 L'application sera accessible sur :${NC}"
echo ""
echo "   Frontend : http://localhost:3000"
echo "   Backend  : http://localhost:8000"
echo ""
