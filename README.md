# Favoxia

🇫🇷 Version Française | [🇬🇧 English Version](README.en.md)

Application de gestion centralisée de favoris multi-navigateurs avec interface moderne et synchronisation automatique.

## 🌟 Fonctionnalités

- ✅ **Synchronisation multi-navigateurs** : Chrome, Firefox, Safari, Edge, Brave, Arc
- ✅ **Synchronisation automatique** : Fréquence configurable par navigateur
- ✅ **Interface moderne** : Design épuré avec mode sombre
- ✅ **Recherche puissante** : Recherche instantanée dans tous vos favoris
- ✅ **Organisation** : Tags, collections et dossiers
- ✅ **Aperçus visuels** : Thumbnails automatiques des sites
- ✅ **Favicons réels** : Récupération automatique des icônes de chaque site
- ✅ **Multi-plateforme** : macOS et Linux

## 📋 Prérequis

- **Python 3.11+** (backend)
- **Node.js 18+** (frontend)
- **npm**

## 🚀 Installation

### Méthode 1 : Installation automatique (⭐ Recommandé)

La méthode la plus simple, fonctionne sur **macOS** et **Linux** :

```bash
# Cloner le projet
git clone https://github.com/barto95100/favoxia.git
cd favoxia

# Lancer l'installation automatique
chmod +x install.sh
./install.sh
```

Le script `install.sh` détecte automatiquement votre OS et :
- ✅ **Linux** : Installe les dépendances système (apt/dnf/pacman) pour Playwright
- ✅ **macOS** : Vérifie Homebrew, Python et Node.js
- ✅ Crée l'environnement virtuel Python
- ✅ Installe toutes les dépendances backend (y compris Playwright + Chromium)
- ✅ Installe et compile le frontend en mode production
- ✅ Crée les scripts `start.sh` et `stop.sh`

### Méthode 2 : Docker (🐳)

```bash
git clone https://github.com/barto95100/favoxia.git
cd favoxia

# Lancer avec Docker Compose
docker compose up -d
```

L'application sera accessible sur http://localhost:3000

Pour une IP/domaine différent de localhost, modifiez les variables dans `docker-compose.yml` :
```yaml
environment:
  - API_BASE_URL=http://VOTRE-IP:8000
  - CORS_ORIGINS=http://VOTRE-IP:3000
```

### Méthode 3 : Installation manuelle

<details>
<summary>Cliquez pour voir les instructions détaillées</summary>

#### 1. Cloner le projet

```bash
git clone https://github.com/barto95100/favoxia.git
cd favoxia
```

#### 2. Installer les prérequis système

**macOS :**
```bash
# Installer Homebrew si pas déjà fait
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Installer Python et Node.js
brew install python3 node
```

**Ubuntu / Debian :**
```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv curl

# Installer Node.js 20 (les dépôts Ubuntu fournissent souvent une version trop ancienne)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Dépendances système pour Playwright (Chromium headless)
sudo apt-get install -y libnss3 libnspr4 libdbus-1-3 libatk1.0-0 \
  libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libatspi2.0-0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libasound2 libx11-xcb1
```

**Fedora / RHEL :**
```bash
sudo dnf install -y python3 python3-pip nodejs npm \
  nss nspr dbus-libs atk at-spi2-atk cups-libs libdrm \
  libxkbcommon at-spi2-core libXcomposite libXdamage libXfixes \
  libXrandr mesa-libgbm pango cairo alsa-lib libxcb
```

#### 3. Installer le backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
cd ..
```

#### 4. Installer le frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

</details>

## 🏃 Lancement

### Avec le script automatique (après install.sh)

```bash
./start.sh
```

Le script lancera automatiquement le backend ET le frontend.

### Lancement manuel

**Terminal 1 - Backend (API) :**

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

---

**L'application sera accessible sur :**
- 🌐 Frontend : http://localhost:3000
- 🔌 API : http://localhost:8000

## ⏹️ Arrêt

### Avec start.sh

Si vous avez lancé Favoxia avec `./start.sh`, appuyez simplement sur **Ctrl+C** dans le terminal.

### Avec stop.sh

Vous pouvez aussi arrêter Favoxia depuis n'importe quel terminal :

```bash
./stop.sh
```

Ce script arrêtera automatiquement tous les processus backend et frontend.

## 📱 Utilisation

1. **Ouvrez** http://localhost:3000 dans votre navigateur
2. **Activez** les navigateurs que vous souhaitez synchroniser dans les paramètres
3. **Synchronisez** vos favoris en cliquant sur le bouton de synchronisation
4. **Profitez** de tous vos favoris centralisés !

## ⚙️ Configuration

### Interface

Dans l'interface des paramètres, vous pouvez configurer :

**Onglet "Navigateurs" :**
- ✅ Activer/désactiver chaque navigateur
- 🔄 Re-synchroniser manuellement
- 🗑️ Supprimer tous les favoris d'un navigateur

**Onglet "Interface" :**
- 👁️ Afficher/masquer la section Tags
- 👁️ Afficher/masquer la section Collections

**Synchronisation automatique :**
- La synchronisation automatique est active par défaut (toutes les 5 minutes)

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `DATABASE_URL` | URL de connexion SQLite | `sqlite+aiosqlite:///./favoxia.db` |
| `API_BASE_URL` | URL publique du backend | `http://localhost:8000` |
| `CORS_ORIGINS` | Origines autorisées (séparées par `,`) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | URL du backend pour le frontend | `http://localhost:8000` |

### Configuration avancée

**Modifier la fréquence de synchronisation automatique :**

Éditez le fichier `backend/models.py` :
```python
class BrowserConfig(Base):
    sync_frequency: Mapped[int] = mapped_column(Integer, default=5)  # en minutes
```

**Base de données :**

Favoxia utilise SQLite - aucune configuration requise, fonctionne directement !

## 🌐 Support navigateurs

| Navigateur | macOS | Linux |
|------------|-------|-------|
| Chrome     | ✅    | ✅    |
| Firefox    | ✅    | ✅    |
| Edge       | ✅    | ✅    |
| Brave      | ✅    | ✅    |
| Safari     | ✅    | ❌    |
| Arc        | ✅    | ❌    |

> Safari et Arc sont exclusifs à macOS et ne sont pas disponibles sur Linux.

## 🛠️ Technologies

**Backend :**
- FastAPI (Python)
- SQLAlchemy (ORM)
- APScheduler (synchronisation automatique)
- Playwright (thumbnails & favicons)
- Pillow (redimensionnement d'images)

**Frontend :**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

## 📝 Structure du projet

```
favoxia/
├── backend/
│   ├── main.py              # API FastAPI
│   ├── models.py            # Modèles de données
│   ├── database.py          # Configuration DB
│   ├── scheduler.py         # Synchronisation auto
│   ├── favicon_service.py   # Récupération des favicons
│   ├── thumbnail_service.py # Génération des thumbnails
│   ├── sync/                # Modules de synchro par navigateur
│   │   ├── chrome.py
│   │   ├── firefox.py
│   │   ├── safari.py
│   │   ├── edge.py
│   │   ├── brave.py
│   │   └── arc.py
│   ├── data/                # Données (favicons, thumbnails, DB)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Routes Next.js
│   │   ├── components/      # Composants React
│   │   └── lib/             # API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── install.sh               # Installation automatique
├── start.sh                 # Lancement (généré par install.sh)
└── stop.sh                  # Arrêt (généré par install.sh)
```

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez que Python 3.11+ est installé : `python3 --version`
- Vérifiez que le venv est activé : vous devriez voir `(venv)` dans votre terminal
- Sur Linux, vérifiez les dépendances Playwright : `playwright install-deps`

### Les thumbnails/favicons ne fonctionnent pas
- Vérifiez que Chromium est installé : `playwright install chromium`
- Sur Linux, installez les dépendances système (voir section Installation manuelle)

### Le frontend ne démarre pas
- Vérifiez que Node.js 18+ est installé : `node --version`
- Supprimez `node_modules` et réinstallez : `rm -rf node_modules && npm install`

### Aucun favori n'est importé
- Vérifiez que le navigateur est bien installé sur votre système
- Vérifiez les logs du backend pour voir les erreurs éventuelles
- Assurez-vous que le navigateur n'est pas en cours d'exécution (pour éviter les verrous de fichiers)

### Problèmes de connexion frontend/backend
- Vérifiez que les ports 3000 et 8000 sont libres
- Si vous accédez depuis une autre machine, configurez `CORS_ORIGINS` et `NEXT_PUBLIC_API_URL`

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer de nouvelles fonctionnalités
- Soumettre une pull request

## 📄 Licence

MIT License - Libre d'utilisation et de modification

---

**Note :** Favoxia lit les favoris en lecture seule et ne modifie jamais les données de vos navigateurs.
