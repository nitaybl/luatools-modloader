<p align="center">
  <img src="assets/banner.png" alt="Kite" width="100%">
</p>

<p align="center">
  <a href="https://github.com/nitaybl/kite/stargazers"><img src="https://img.shields.io/github/stars/nitaybl/kite?style=for-the-badge&color=00ffff&labelColor=0d1117" alt="Stars"></a>
  <a href="https://nitaybl.gitbook.io/kite"><img src="https://img.shields.io/badge/Documentation-8b5cf6?style=for-the-badge&logo=gitbook&logoColor=white&labelColor=0d1117" alt="Docs"></a>
  <a href="#"><img src="https://img.shields.io/badge/Version-v1.0.0-4ade80?style=for-the-badge&labelColor=0d1117" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-ff6b6b?style=for-the-badge&labelColor=0d1117" alt="License"></a>
</p>

---

> ⚠️ **USE AT YOUR OWN RISK.** This is an unofficial community project. Not affiliated with, endorsed by, or supported by Valve, Steam, or the original LuaTools developers. No warranty of any kind.

> 🛡️ **MOD SAFETY.** We do **NOT** review, verify, or guarantee the safety of third-party mods. Always inspect source code before installing. Scan files for malware. Only install mods from sources you trust. Never install mods that ask for your credentials.

> 🚫 **NO SUPPORT.** We are **not responsible** for providing support for third-party mods. If a mod breaks your setup, use `luatools mod disable <mod-id>` or `luatools uninstall` to revert.

---

<p align="center">
  <strong>Extend LuaTools with community mods — without modifying the core plugin.</strong>
</p>

## ⚡ Quick Start

### Option 1: One-Line Install (Recommended)
```powershell
irm https://raw.githubusercontent.com/nitaybl/kite/main/install.ps1 | iex
luatools install
```

### Option 2: Manual Installation
1. **Download** the repository as a ZIP.
2. **Copy Core Files**:
   - Move `mod_loader.js` to `Steam/plugins/luatools/public/`
   - Move `mod_loader.py` and `mod_auto_update.py` to `Steam/plugins/luatools/backend/`
3. **Create Mods Folder**: Create a folder named `mods` inside `Steam/plugins/luatools/`.
4. **Restart Steam**: LuaTools will now detect the mod loader and load your mods.

## 📖 Documentation

Full guides, API reference, and examples at **[GitBook →](https://nitaybl.gitbook.io/kite)**

## 🧩 How It Works

The mod loader installs **on top of** LuaTools. It adds two files — core LuaTools is **never modified**. Uninstalling leaves your setup exactly as it was.

```
Steam/plugins/luatools/
├── public/luatools.js         ← untouched
├── public/mod_loader.js       ← mod loader (removable)
├── backend/mod_loader.py      ← backend (removable)
├── backend/mod_auto_update.py ← auto-updater (removable)
└── mods/                      ← your mods go here
    ├── credits-mod/
    ├── cyberpunk-theme/
    ├── quick-actions/
    ├── fix-notifications/
    └── game-stats/
```

## 💻 CLI

```
luatools install                Install mod loader onto LuaTools
luatools uninstall              Remove mod loader (LuaTools untouched)
luatools mod install <url>      Install a mod from GitHub
luatools mod remove <id>        Uninstall a mod
luatools mod list               List installed mods
luatools mod enable/disable     Toggle mods
luatools fix apply <appid>      Request auto-fix for a game
luatools doctor                 Diagnose issues
```

## 🎨 Example Mods

| Mod | Description |
|-----|-------------|
| **Credits** | Contributor credits panel with clickable GitHub link |
| **Cyberpunk Theme** | Neon gradients, animated glow borders, Orbitron font |
| **Quick Actions** | Copy AppID, Open Folder, SteamDB, PCGamingWiki buttons |
| **Fix Notifications** | Animated toast alerts with sound feedback |
| **Game Stats** | Real-time game info panel (install status, achievements, playtime) |

## 🤝 Contributing

See the [Contributing Guide](https://nitaybl.gitbook.io/kite/contributing).

---

<p align="center">
  Made by <a href="https://github.com/nitaybl">nitaybl</a> 💜
</p>
