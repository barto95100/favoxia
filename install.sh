#!/bin/bash

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
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

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend installé avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'installation du backend${NC}"
    exit 1
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

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend installé avec succès${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'installation du frontend${NC}"
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
NC='\033[0m'

echo -e "${BLUE}🦊 Démarrage de Favoxia...${NC}"
echo ""

# Démarrer le backend
echo -e "${GREEN}🔧 Démarrage du backend (port 8000)...${NC}"
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Attendre que le backend démarre
sleep 3

# Démarrer le frontend
echo -e "${GREEN}🎨 Démarrage du frontend (port 3000)...${NC}"
cd frontend
npm run dev &
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
echo "Appuyez sur Ctrl+C pour arrêter les serveurs"

# Attendre que l'utilisateur arrête
wait
EOF

chmod +x start.sh

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
