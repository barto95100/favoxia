# Guide d'installation rapide - Favoxia

## 📦 Méthode 1 : Partage via GitHub (Recommandé)

### Étape 1 : Créer un dépôt GitHub

1. Allez sur https://github.com/new
2. Nommez votre projet : `favoxia`
3. Choisissez **Public** ou **Private**
4. Ne cochez RIEN (pas de README, pas de .gitignore)
5. Cliquez sur "Create repository"

### Étape 2 : Pousser le code

```bash
cd /Users/l.ramos/BookmarkHub

# Initialiser git si pas déjà fait
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Favoxia v1.0"

# Lier au dépôt GitHub (remplacez VOTRE-USERNAME)
git remote add origin https://github.com/VOTRE-USERNAME/favoxia.git

# Pousser le code
git push -u origin main
```

### Étape 3 : Partager avec votre testeur

Envoyez-lui simplement le lien GitHub !

**Instructions pour le testeur :**

```bash
# Cloner le projet
git clone https://github.com/VOTRE-USERNAME/favoxia.git
cd favoxia

# Installer le backend
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Dans un nouveau terminal, installer le frontend
cd frontend
npm install

# Lancer le backend (terminal 1)
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Lancer le frontend (terminal 2)
cd frontend
npm run dev
```

Puis ouvrir http://localhost:3000

---

## 📂 Méthode 2 : Partage via ZIP

### Créer une archive

```bash
cd /Users/l.ramos
tar -czf favoxia.tar.gz BookmarkHub/ \
  --exclude='BookmarkHub/backend/venv' \
  --exclude='BookmarkHub/backend/__pycache__' \
  --exclude='BookmarkHub/backend/*.db' \
  --exclude='BookmarkHub/frontend/node_modules' \
  --exclude='BookmarkHub/frontend/.next'
```

Vous aurez un fichier `favoxia.tar.gz` à partager (par email, Dropbox, etc.)

**Instructions pour le testeur :**

```bash
# Extraire
tar -xzf favoxia.tar.gz
cd BookmarkHub

# Suivre les mêmes étapes d'installation que la méthode GitHub
```

---

## 🌐 Méthode 3 : Déploiement sur serveur (Pour usage réel)

### A. Hébergement gratuit - Render.com

**Backend :**
1. Créer un compte sur https://render.com
2. "New +" → "Web Service"
3. Connecter votre repo GitHub
4. Configurer :
   - **Build Command:** `cd backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Déployer

**Frontend :**
1. "New +" → "Static Site"
2. Même repo
3. Configurer :
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/out`
4. Déployer

### B. Hébergement gratuit - Vercel (Frontend) + Railway (Backend)

**Frontend sur Vercel :**
```bash
cd frontend
npm install -g vercel
vercel
```

**Backend sur Railway :**
1. https://railway.app
2. "New Project" → "Deploy from GitHub"
3. Sélectionner votre repo
4. Automatique !

---

## 🚀 Méthode 4 : Script d'installation automatique

Créez ce fichier `install.sh` à la racine :

```bash
#!/bin/bash

echo "🦊 Installation de Favoxia..."

# Backend
echo "📦 Installation du backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Frontend
echo "🎨 Installation du frontend..."
cd frontend
npm install
cd ..

echo "✅ Installation terminée !"
echo ""
echo "Pour lancer Favoxia :"
echo "  Terminal 1: cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Puis ouvrez http://localhost:3000"
```

Rendre exécutable :
```bash
chmod +x install.sh
```

Le testeur lance simplement :
```bash
./install.sh
```

---

## 📝 Checklist avant de partager

- ✅ README.md créé avec instructions
- ✅ .gitignore configuré
- ✅ Pas de fichiers sensibles (.env, .db)
- ✅ requirements.txt à jour
- ✅ package.json à jour
- ✅ Application testée en local

---

## 🆘 Support

Si votre testeur rencontre des problèmes, vérifiez :

1. **Python** : Version 3.11+ installée
2. **Node.js** : Version 18+ installée
3. **Navigateurs** : Au moins Chrome ou Firefox installé
4. **Ports** : 3000 et 8000 libres

**Problèmes courants :**

- "Module not found" → `pip install -r requirements.txt`
- "Port 8000 already in use" → Tuer le processus : `lsof -ti:8000 | xargs kill`
- "Cannot find module" → `rm -rf node_modules && npm install`
