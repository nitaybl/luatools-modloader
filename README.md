<p align="center">
  <img src="assets/banner.png" alt="LuaTools Mod Loader" width="100%">
</p>

<p align="center">
  <a href="https://github.com/nitaybl/luatools-modloader/stargazers"><img src="https://img.shields.io/github/stars/nitaybl/luatools-modloader?style=for-the-badge&color=00ffff&labelColor=0d1117" alt="Stars"></a>
  <a href="https://github.com/nitaybl/luatools-modloader/releases"><img src="https://img.shields.io/github/v/release/nitaybl/luatools-modloader?style=for-the-badge&color=8b5cf6&labelColor=0d1117" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/nitaybl/luatools-modloader?style=for-the-badge&color=4ade80&labelColor=0d1117" alt="License"></a>
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

```powershell
irm https://raw.githubusercontent.com/nitaybl/luatools-modloader/main/install.ps1 | iex
luatools install
```

Restart Steam. Done.

## 📖 Documentation

Full docs available at **[GitBook →](https://nitaybl.gitbook.io/luatools-modloader)**

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
| **Credits** | Contributor credits panel with clickable GitHub links |
| **Cyberpunk Theme** | Neon gradients, animated glow borders, Orbitron font |
| **Quick Actions** | Copy AppID, Open Folder, SteamDB, PCGamingWiki buttons |
| **Fix Notifications** | Animated toast alerts with sound feedback |
| **Game Stats** | Real-time game info panel (install status, achievements, playtime) |

## 🤝 Contributing

See the [Contributing Guide](https://nitaybl.gitbook.io/luatools-modloader/contributing).

---

<p align="center">
  Made by <a href="https://github.com/nitaybl">nitaybl</a> 💜
</p>
