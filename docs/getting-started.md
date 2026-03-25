# Getting Started

## Prerequisites

- **Steam** installed on Windows
- **[Millennium](https://steambrew.app/)** client mod installed
- **[LuaTools](https://github.com/madoiscool/ltsteamplugin)** plugin installed via Millennium

## Installation

### Option 1: One-Line PowerShell Install

```powershell
irm https://raw.githubusercontent.com/nitaybl/luatools-modloader/main/install.ps1 | iex
```

This installs the `luatools` CLI globally. Then install the mod loader:

```powershell
luatools install
```

### Option 2: Manual Install

1. Download the [latest release](https://github.com/nitaybl/luatools-modloader/releases)
2. Copy `mod_loader.js` to `Steam/plugins/luatools/public/`
3. Copy `mod_loader.py` and `mod_auto_update.py` to `Steam/plugins/luatools/backend/`
4. Create a `mods/` folder in `Steam/plugins/luatools/`
5. Restart Steam

## Verify Installation

Run the built-in diagnostic:

```powershell
luatools doctor
```

You should see all green checkmarks:

```
  LuaTools installed:      YES
  Mods directory:           YES
  Mod Loader (JS):          YES
  Mod Loader (Backend):     YES
```

## Installing Your First Mod

```powershell
# Install the credits mod that ships with the mod loader
luatools mod install https://github.com/nitaybl/luatools-modloader
```

Or manually copy a mod folder into `Steam/plugins/luatools/mods/`.

## Uninstalling

The mod loader can be cleanly removed without affecting LuaTools:

```powershell
luatools uninstall
```

This removes only the mod loader files (`mod_loader.js`, `mod_loader.py`). You'll be asked if you want to also remove installed mods.
