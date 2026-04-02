# Favoxia 🦊

Application de gestion centralisée de favoris multi-navigateurs avec interface moderne et synchronisation automatique.

## 🌟 Fonctionnalités

- ✅ **Synchronisation multi-navigateurs** : Chrome, Firefox, Safari, Edge, Brave, Arc
- ✅ **Synchronisation automatique** : Fréquence configurable par navigateur
- ✅ **Interface moderne** : Design épuré avec mode sombre
- ✅ **Recherche puissante** : Recherche instantanée dans tous vos favoris
- ✅ **Organisation** : Tags, collections et dossiers
- ✅ **Aperçus visuels** : Thumbnails automatiques des sites
- ✅ **Multi-plateforme** : macOS, Windows, Linux

## 📋 Prérequis

- **Python 3.11+** (backend)
- **Node.js 18+** (frontend)
- **npm** ou **yarn**

## 🚀 Installation

### Méthode 1 : Installation automatique (⭐ Recommandé)

La méthode la plus simple pour installer Favoxia :

```bash
# Cloner le projet
git clone https://github.com/votre-username/favoxia.git
cd favoxia

# Lancer l'installation automatique
./install.sh
```

Le script `install.sh` va automatiquement :
- ✅ Vérifier que Python 3.11+ et Node.js 18+ sont installés
- ✅ Créer l'environnement virtuel Python
- ✅ Installer toutes les dépendances backend
- ✅ Installer toutes les dépendances frontend
- ✅ Créer le script de lancement `start.sh`

### Méthode 2 : Installation manuelle

Si vous préférez installer manuellement :

<details>
<summary>Cliquez pour voir les instructions détaillées</summary>

#### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/favoxia.git
cd favoxia
```

#### 2. Installer le backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. Installer le frontend

```bash
cd ../frontend
npm install
```

</details>

## 🏃 Lancement

### Avec le script automatique (après install.sh)

```bash
./start.sh
```

Le script lancera automatiquement le backend ET le frontend.

### Lancement manuel

Si vous avez fait l'installation manuelle :

**Terminal 1 - Backend (API) :**

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend :**

```bash
cd frontend
npm run dev
```

---

**L'application sera accessible sur :**
- 🌐 Frontend : http://localhost:3000
- 🔌 API : http://localhost:8000

## 📱 Utilisation

1. **Ouvrez** http://localhost:3000 dans votre navigateur
2. **Activez** les navigateurs que vous souhaitez synchroniser dans les paramètres
3. **Synchronisez** vos favoris en cliquant sur le bouton de synchronisation
4. **Profitez** de tous vos favoris centralisés !

## ⚙️ Configuration

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
- Pour modifier la fréquence, voir la section "Configuration avancée" ci-dessous

### Configuration avancée

**Modifier la fréquence de synchronisation automatique :**

Éditez le fichier `backend/models.py` :
```python
class BrowserConfig(Base):
    sync_frequency: Mapped[int] = mapped_column(Integer, default=5)  # Modifier cette valeur (en minutes)
```

Ou directement dans la base de données `favoxia.db` après la première synchronisation.

**Base de données :**

Favoxia utilise SQLite (`favoxia.db`) - aucune configuration requise, fonctionne directement !

## 🌐 Support navigateurs

| Navigateur | macOS | Windows | Linux |
|------------|-------|---------|-------|
| Chrome     | ✅    | ✅      | ✅    |
| Firefox    | ✅    | ✅      | ✅    |
| Edge       | ✅    | ✅      | ✅    |
| Brave      | ✅    | ✅      | ✅    |
| Safari     | ✅    | ❌      | ❌    |
| Arc        | ✅    | ❌      | ❌    |

## 🛠️ Technologies

**Backend :**
- FastAPI (Python)
- SQLAlchemy (ORM)
- APScheduler (synchronisation automatique)
- Playwright (thumbnails)

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
│   ├── sync/                # Modules de synchro par navigateur
│   │   ├── chrome.py
│   │   ├── firefox.py
│   │   ├── safari.py
│   │   ├── edge.py
│   │   ├── brave.py
│   │   └── arc.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/             # Routes Next.js
    │   ├── components/      # Composants React
    │   └── styles/
    ├── package.json
    └── tsconfig.json
```

## 🐛 Dépannage

### Le backend ne démarre pas
- Vérifiez que Python 3.11+ est installé : `python3 --version`
- Vérifiez que le venv est activé : vous devriez voir `(venv)` dans votre terminal

### Le frontend ne démarre pas
- Vérifiez que Node.js est installé : `node --version`
- Supprimez `node_modules` et réinstallez : `rm -rf node_modules && npm install`

### Aucun favori n'est importé
- Vérifiez que le navigateur est bien installé sur votre système
- Vérifiez les logs du backend pour voir les erreurs éventuelles
- Assurez-vous que le navigateur n'est pas en cours d'exécution (pour éviter les verrous de fichiers)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer de nouvelles fonctionnalités
- Soumettre une pull request

## 📄 Licence

MIT License - Libre d'utilisation et de modification

## 🙏 Remerciements

Développé avec ❤️ pour centraliser et organiser tous vos favoris en un seul endroit.

---

**Note :** Favoxia lit les favoris en lecture seule et ne modifie jamais les données de vos navigateurs.
