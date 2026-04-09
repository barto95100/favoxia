# Guide d'installation - Favoxia

## Installation rapide

```bash
git clone https://github.com/barto95100/favoxia.git
cd favoxia
chmod +x install.sh
./install.sh
./start.sh
```

Ouvrir http://localhost:3000

---

## Installation avec Docker

```bash
git clone https://github.com/barto95100/favoxia.git
cd favoxia
docker compose up -d
```

Ouvrir http://localhost:3000

### Personnaliser l'adresse

Si vous voulez accéder a Favoxia depuis une autre machine (ex: VM Linux avec IP `192.168.1.50`), modifiez `docker-compose.yml` :

```yaml
environment:
  - API_BASE_URL=http://192.168.1.50:8000
  - CORS_ORIGINS=http://192.168.1.50:3000
  - NEXT_PUBLIC_API_URL=http://192.168.1.50:8000
```

Puis reconstruire :
```bash
docker compose up -d --build
```

---

## Installation manuelle pas a pas

### 1. Prerequis

**macOS :**
```bash
# Installer Homebrew si pas deja fait
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer Python et Node.js
brew install python3 node
```

**Ubuntu / Debian :**
```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv curl git

# Installer Node.js 20 (la version des depots Ubuntu est souvent trop ancienne)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Dependances pour Playwright (Chromium headless)
sudo apt-get install -y libnss3 libnspr4 libdbus-1-3 libatk1.0-0 \
  libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libatspi2.0-0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libasound2 libx11-xcb1
```

> **Note :** Sur Ubuntu 22.04, le paquet `nodejs` des depots officiels est en version 12, trop ancienne pour Favoxia. L'installation via NodeSource ci-dessus fournit Node.js 20.

**Fedora / RHEL :**
```bash
sudo dnf install -y python3 python3-pip nodejs npm \
  nss nspr dbus-libs atk at-spi2-atk cups-libs libdrm \
  libxkbcommon at-spi2-core libXcomposite libXdamage libXfixes \
  libXrandr mesa-libgbm pango cairo alsa-lib libxcb
```

### 2. Cloner le projet

```bash
git clone https://github.com/barto95100/favoxia.git
cd favoxia
```

### 3. Backend

```bash
cd backend

# Creer l'environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les dependances Python
pip install -r requirements.txt

# Installer le navigateur Chromium pour les thumbnails/favicons
playwright install chromium

cd ..
```

### 4. Frontend

```bash
cd frontend

# Installer les dependances
npm install

# Compiler pour la production
npm run build

cd ..
```

### 5. Lancer

**Terminal 1 - Backend :**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm start
```

Ouvrir http://localhost:3000

---

## Partage via ZIP (sans Git)

Pour partager le projet sans passer par Git :

```bash
cd ..
tar -czf favoxia.tar.gz favoxia/ \
  --exclude='favoxia/backend/venv' \
  --exclude='favoxia/backend/__pycache__' \
  --exclude='favoxia/backend/*.db' \
  --exclude='favoxia/backend/data' \
  --exclude='favoxia/frontend/node_modules' \
  --exclude='favoxia/frontend/.next'
```

Le destinataire extrait et lance `./install.sh`.

---

## Verifications

| Verification | Commande |
|-------------|---------|
| Python installe | `python3 --version` (3.11+) |
| Node.js installe | `node --version` (18+) |
| npm installe | `npm --version` |
| Chromium Playwright | `playwright install chromium` |
| Port 8000 libre | `lsof -i:8000` (macOS) ou `ss -tlnp \| grep 8000` (Linux) |
| Port 3000 libre | `lsof -i:3000` (macOS) ou `ss -tlnp \| grep 3000` (Linux) |

## Problemes courants

| Probleme | Solution |
|----------|---------|
| `ImportError: No module named 'playwright'` | `pip install -r requirements.txt` dans le venv |
| Thumbnails/favicons ne marchent pas | `playwright install chromium` + dependances systeme sur Linux |
| CORS error dans le navigateur | Configurer `CORS_ORIGINS` avec la bonne adresse |
| Port deja utilise | Arreter le processus existant avec `./stop.sh` |
| `npm: command not found` | Installer Node.js 18+ |
