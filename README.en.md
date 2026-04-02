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
- ✅ **Cross-platform**: macOS, Windows, Linux

## 📋 Requirements

- **Python 3.11+** (backend)
- **Node.js 18+** (frontend)
- **npm** or **yarn**

## 🚀 Installation

### Method 1: Automatic Installation (⭐ Recommended)

The easiest way to install Favoxia:

```bash
# Clone the project
git clone https://github.com/barto95100/favoxia.git
cd favoxia

# Run automatic installation
./install.sh
```

The `install.sh` script will automatically:
- ✅ Check that Python 3.11+ and Node.js 18+ are installed
- ✅ Create the Python virtual environment
- ✅ Install all backend dependencies
- ✅ Install all frontend dependencies
- ✅ Create the `start.sh` launch script

### Method 2: Manual Installation

If you prefer manual installation:

<details>
<summary>Click to see detailed instructions</summary>

#### 1. Clone the project

```bash
git clone https://github.com/barto95100/favoxia.git
cd favoxia
```

#### 2. Install the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 3. Install the frontend

```bash
cd ../frontend
npm install
```

</details>

## 🏃 Running

### With automatic script (after install.sh)

```bash
./start.sh
```

The script will automatically launch both backend AND frontend.

### Manual launch

If you did manual installation:

**Terminal 1 - Backend (API):**

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

---

**The application will be accessible at:**
- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:8000

## 📱 Usage

1. **Open** http://localhost:3000 in your browser
2. **Enable** the browsers you want to sync in settings
3. **Synchronize** your bookmarks by clicking the sync button
4. **Enjoy** all your centralized bookmarks!

## ⚙️ Configuration

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
- To change the frequency, see "Advanced Configuration" section below

### Advanced Configuration

**Change automatic sync frequency:**

Edit the `backend/models.py` file:
```python
class BrowserConfig(Base):
    sync_frequency: Mapped[int] = mapped_column(Integer, default=5)  # Change this value (in minutes)
```

Or directly in the `favoxia.db` database after first sync.

**Database:**

Favoxia uses SQLite (`favoxia.db`) - no configuration required, works right out of the box!

## 🌐 Browser Support

| Browser | macOS | Windows | Linux |
|---------|-------|---------|-------|
| Chrome  | ✅    | ✅      | ✅    |
| Firefox | ✅    | ✅      | ✅    |
| Edge    | ✅    | ✅      | ✅    |
| Brave   | ✅    | ✅      | ✅    |
| Safari  | ✅    | ❌      | ❌    |
| Arc     | ✅    | ❌      | ❌    |

## 🛠️ Technologies

**Backend:**
- FastAPI (Python)
- SQLAlchemy (ORM)
- APScheduler (automatic sync)
- Playwright (thumbnails)

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
│   ├── sync/                # Browser sync modules
│   │   ├── chrome.py
│   │   ├── firefox.py
│   │   ├── safari.py
│   │   ├── edge.py
│   │   ├── brave.py
│   │   └── arc.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/             # Next.js routes
    │   ├── components/      # React components
    │   └── styles/
    ├── package.json
    └── tsconfig.json
```

## 🐛 Troubleshooting

### Backend won't start
- Check Python 3.11+ is installed: `python3 --version`
- Check venv is activated: you should see `(venv)` in your terminal

### Frontend won't start
- Check Node.js is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### No bookmarks imported
- Check the browser is installed on your system
- Check backend logs for errors
- Make sure the browser is not running (to avoid file locks)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Open an issue to report a bug
- Propose new features
- Submit a pull request

## 📄 License

MIT License - Free to use and modify

## 🙏 Acknowledgments

Developed with ❤️ to centralize and organize all your bookmarks in one place.

---

**Note:** Favoxia reads bookmarks in read-only mode and never modifies your browser data.
