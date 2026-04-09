# Favoxia

[🇫🇷 Version Française](README.md) | 🇬🇧 English Version

Multi-browser bookmark management application with modern interface and automatic synchronization.

## 🌟 Features

- ✅ **Multi-browser sync**: Chrome, Firefox, Safari, Edge, Brave, Arc
- ✅ **Automatic synchronization**: Configurable frequency per browser
- ✅ **Modern interface**: Clean design with dark mode
- ✅ **Powerful search**: Instant search across all your bookmarks
- ✅ **Organization**: Tags, collections, and folders
- ✅ **Visual previews**: Automatic website thumbnails
- ✅ **Real favicons**: Automatic icon fetching for each site
- ✅ **Cross-platform**: macOS and Linux

## 📋 Requirements

- **Python 3.11+** (backend)
- **Node.js 18+** (frontend)
- **npm**

## 🚀 Installation

### Method 1: Automatic Installation (⭐ Recommended)

The easiest way, works on both **macOS** and **Linux**:

```bash
# Clone the project
git clone https://github.com/barto95100/favoxia.git
cd favoxia

# Run automatic installation
chmod +x install.sh
./install.sh
```

The `install.sh` script automatically detects your OS and:
- ✅ **Linux**: Installs system dependencies (apt/dnf/pacman) for Playwright
- ✅ **macOS**: Checks Homebrew, Python and Node.js
- ✅ Creates the Python virtual environment
- ✅ Installs all backend dependencies (including Playwright + Chromium)
- ✅ Installs and builds the frontend for production
- ✅ Creates `start.sh` and `stop.sh` scripts

### Method 2: Docker (🐳)

```bash
git clone https://github.com/barto95100/favoxia.git
cd favoxia

# Launch with Docker Compose
docker compose up -d
```

The application will be available at http://localhost:3000

For a different IP/domain, edit the variables in `docker-compose.yml`:
```yaml
environment:
  - API_BASE_URL=http://YOUR-IP:8000
  - CORS_ORIGINS=http://YOUR-IP:3000
```

### Method 3: Manual Installation

<details>
<summary>Click to see detailed instructions</summary>

#### 1. Clone the project

```bash
git clone https://github.com/barto95100/favoxia.git
cd favoxia
```

#### 2. Install system dependencies (Linux only)

On Ubuntu/Debian:
```bash
sudo apt-get install -y libnss3 libnspr4 libdbus-1-3 libatk1.0-0 \
  libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libatspi2.0-0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 \
  libpango-1.0-0 libcairo2 libasound2 libx11-xcb1
```

On Fedora/RHEL:
```bash
sudo dnf install -y nss nspr dbus-libs atk at-spi2-atk cups-libs libdrm \
  libxkbcommon at-spi2-core libXcomposite libXdamage libXfixes \
  libXrandr mesa-libgbm pango cairo alsa-lib libxcb
```

> On macOS, no additional system dependencies are needed.

#### 3. Install the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium
cd ..
```

#### 4. Install the frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

</details>

## 🏃 Running

### With automatic script (after install.sh)

```bash
./start.sh
```

The script will automatically launch both backend AND frontend.

### Manual launch

**Terminal 1 - Backend (API):**

```bash
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

---

**The application will be accessible at:**
- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:8000

## ⏹️ Stopping

### With start.sh

If you launched Favoxia with `./start.sh`, simply press **Ctrl+C** in the terminal.

### With stop.sh

You can also stop Favoxia from any terminal:

```bash
./stop.sh
```

This script will automatically stop all backend and frontend processes.

## 📱 Usage

1. **Open** http://localhost:3000 in your browser
2. **Enable** the browsers you want to sync in settings
3. **Synchronize** your bookmarks by clicking the sync button
4. **Enjoy** all your centralized bookmarks!

## ⚙️ Configuration

### Interface

In the settings interface, you can configure:

**"Browsers" Tab:**
- ✅ Enable/disable each browser
- 🔄 Re-synchronize manually
- 🗑️ Delete all bookmarks from a browser

**"Interface" Tab:**
- 👁️ Show/hide Tags section
- 👁️ Show/hide Collections section

**Automatic synchronization:**
- Automatic sync is enabled by default (every 5 minutes)

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite connection URL | `sqlite+aiosqlite:///./favoxia.db` |
| `API_BASE_URL` | Public backend URL | `http://localhost:8000` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | Backend URL for frontend | `http://localhost:8000` |

### Advanced Configuration

**Change automatic sync frequency:**

Edit the `backend/models.py` file:
```python
class BrowserConfig(Base):
    sync_frequency: Mapped[int] = mapped_column(Integer, default=5)  # in minutes
```

**Database:**

Favoxia uses SQLite - no configuration required, works right out of the box!

## 🌐 Browser Support

| Browser | macOS | Linux |
|---------|-------|-------|
| Chrome  | ✅    | ✅    |
| Firefox | ✅    | ✅    |
| Edge    | ✅    | ✅    |
| Brave   | ✅    | ✅    |
| Safari  | ✅    | ❌    |
| Arc     | ✅    | ❌    |

> Safari and Arc are macOS-exclusive and are not available on Linux.

## 🛠️ Technologies

**Backend:**
- FastAPI (Python)
- SQLAlchemy (ORM)
- APScheduler (automatic sync)
- Playwright (thumbnails & favicons)
- Pillow (image resizing)

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

## 📝 Project Structure

```
favoxia/
├── backend/
│   ├── main.py              # FastAPI API
│   ├── models.py            # Data models
│   ├── database.py          # DB configuration
│   ├── scheduler.py         # Auto-sync
│   ├── favicon_service.py   # Favicon fetching
│   ├── thumbnail_service.py # Thumbnail generation
│   ├── sync/                # Browser sync modules
│   │   ├── chrome.py
│   │   ├── firefox.py
│   │   ├── safari.py
│   │   ├── edge.py
│   │   ├── brave.py
│   │   └── arc.py
│   ├── data/                # Data (favicons, thumbnails, DB)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js routes
│   │   ├── components/      # React components
│   │   └── lib/             # API client
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
├── install.sh               # Automatic installation
├── start.sh                 # Launch (generated by install.sh)
└── stop.sh                  # Stop (generated by install.sh)
```

## 🐛 Troubleshooting

### Backend won't start
- Check Python 3.11+ is installed: `python3 --version`
- Check venv is activated: you should see `(venv)` in your terminal
- On Linux, check Playwright dependencies: `playwright install-deps`

### Thumbnails/favicons don't work
- Check Chromium is installed: `playwright install chromium`
- On Linux, install system dependencies (see Manual Installation section)

### Frontend won't start
- Check Node.js 18+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### No bookmarks imported
- Check the browser is installed on your system
- Check backend logs for errors
- Make sure the browser is not running (to avoid file locks)

### Frontend/backend connection issues
- Check ports 3000 and 8000 are free
- If accessing from another machine, configure `CORS_ORIGINS` and `NEXT_PUBLIC_API_URL`

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Open an issue to report a bug
- Propose new features
- Submit a pull request

## 📄 License

MIT License - Free to use and modify

---

**Note:** Favoxia reads bookmarks in read-only mode and never modifies your browser data.
