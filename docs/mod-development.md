# Mod Development Guide

## Mod Structure

A mod can be either a **single JS file** or a **folder with a manifest**.

### Single-File Mod
```
mods/
  my-mod.js
```
Drop a `.js` file in the `mods/` folder. The filename becomes the mod ID.

### Folder Mod (Recommended)
```
mods/
  my-mod/
    manifest.json    ← required
    mod.js           ← main script
    style.css        ← optional styles
```

## manifest.json

```json
{
    "id": "my-awesome-mod",
    "name": "My Awesome Mod",
    "version": "1.0.0",
    "author": "YourName",
    "description": "Adds cool features to LuaTools",
    "main": "mod.js",
    "style": "style.css",
    "hooks": ["onOverlayOpen", "onFixApplied"],
    "repository": "https://github.com/you/my-awesome-mod",
    "minLuaToolsVersion": "7.1"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `id` | ✅ | Unique identifier. Use lowercase with hyphens. |
| `name` | ✅ | Human-readable display name |
| `version` | ✅ | [SemVer](https://semver.org/) version string |
| `author` | ✅ | Your name or username |
| `description` | ❌ | Short description of what the mod does |
| `main` | ✅ | Entry JavaScript file (relative to mod folder) |
| `style` | ❌ | Optional CSS file to inject |
| `hooks` | ❌ | Array of lifecycle hook names your mod uses |
| `repository` | ❌ | GitHub URL — enables auto-updates via releases |
| `minLuaToolsVersion` | ❌ | Minimum LuaTools version required |

## Writing Your Mod

Every mod registers itself using `LuaToolsMods.registerMod()`:

```js
LuaToolsMods.registerMod({
    id: 'my-mod',
    name: 'My Mod',
    version: '1.0.0',

    onOverlayOpen: function(data) {
        // Called when the LuaTools fix overlay opens
        // data.overlay = DOM element
        // data.appid = Steam App ID
        // data.gameName = game name
        
        var panel = LuaToolsMods.createPanel({
            id: 'my-custom-panel',
            title: 'My Custom Panel',
            content: '<p>Hello from my mod!</p>'
        });
        
        data.overlay.appendChild(panel);
    }
});
```

## Execution Environment

- Mods run inside an **IIFE sandbox** — your variables don't leak into global scope
- Mods load **after** core LuaTools initializes (~500ms delay)
- CSS is injected into `<head>` with a unique ID: `ltmod-css-{mod-id}`
- Errors in one mod don't crash other mods — each hook call is wrapped in try/catch

## Enabling Auto-Updates

If your `manifest.json` includes a `repository` field:

1. The mod loader checks your GitHub repo for new releases
2. Tag your releases with SemVer versions (e.g., `v1.0.1`, `v2.0.0`)
3. Include a zip with the mod folder contents as a release asset
4. The mod loader compares local vs remote versions and prompts for update

## Testing Your Mod

1. Copy your mod folder to `Steam/plugins/luatools/mods/`
2. Restart Steam (or use the LuaTools restart button)
3. Open any game's store page — click the LuaTools icon
4. Your mod's `onOverlayOpen` hook fires when the overlay appears
5. Check the browser console (F12 in Steam) for `[ModLoader]` log messages

## Tips

- Use `LuaToolsMods.showToast()` for quick feedback during development
- Use `LuaToolsMods.injectCSS()` for dynamic style changes
- Check `LuaToolsMods.hasMod('other-mod-id')` for inter-mod compatibility
- Access all registered mods via `LuaToolsMods.getMods()`
