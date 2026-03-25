# API Reference

## LuaToolsMods Global Object

The `LuaToolsMods` object is available globally to all mods. It provides registration, hooks, and utilities.

---

## Registration

### `LuaToolsMods.registerMod(modDefinition)`

Register a mod with the loader. Must be called from your mod's main script.

```js
LuaToolsMods.registerMod({
    id: 'my-mod',           // required, unique string
    name: 'My Mod',         // optional display name
    version: '1.0.0',       // optional version string
    
    // lifecycle hooks (all optional)
    onOverlayOpen: function(data) {},
    onOverlayClose: function(data) {},
    onFixApplied: function(data) {},
    onFixFailed: function(data) {},
    onGameDetected: function(data) {},
    onSettingsOpen: function(data) {},
    onDownloadStart: function(data) {},
    onDownloadComplete: function(data) {},
    onModsPanel: function(data) {}
});
```

---

## Lifecycle Hooks

Hooks are called automatically by LuaTools at specific moments. Each receives a `data` object.

### `onOverlayOpen(data)`
Fired when the fix overlay opens for a game.

| Property | Type | Description |
|----------|------|-------------|
| `data.overlay` | `HTMLElement` | The overlay DOM container |
| `data.appid` | `number` | Steam App ID |
| `data.gameName` | `string` | Game title |

### `onOverlayClose(data)`
Fired when the overlay is closed.

| Property | Type | Description |
|----------|------|-------------|
| `data.appid` | `number` | Steam App ID |

### `onFixApplied(data)`
Fired after a fix downloads and extracts successfully.

| Property | Type | Description |
|----------|------|-------------|
| `data.appid` | `number` | Steam App ID |
| `data.fixType` | `string` | Fix type name |

### `onFixFailed(data)`
Fired when a fix fails to apply.

| Property | Type | Description |
|----------|------|-------------|
| `data.appid` | `number` | Steam App ID |
| `data.error` | `string` | Error message |

### `onGameDetected(data)`
Fired when LuaTools detects a Steam game page.

| Property | Type | Description |
|----------|------|-------------|
| `data.appid` | `number` | Steam App ID |
| `data.gameName` | `string` | Game title |

### `onDownloadStart(data)` / `onDownloadComplete(data)`
Fired when a fix download begins or finishes.

| Property | Type | Description |
|----------|------|-------------|
| `data.appid` | `number` | Steam App ID |

### `onSettingsOpen(data)`
Fired when LuaTools settings panel opens.

### `onModsPanel(data)`
Reserved for future mod management UI panel.

---

## Utility Methods

### `LuaToolsMods.injectCSS(id, cssText)`

Inject a CSS stylesheet into the page. If a stylesheet with the same `id` already exists, it gets replaced.

```js
LuaToolsMods.injectCSS('my-mod', `
    .my-custom-class {
        color: #00ffff;
        font-weight: bold;
    }
`);
```

| Param | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique CSS block identifier |
| `cssText` | `string` | Raw CSS content |

### `LuaToolsMods.createPanel(options)`

Create a styled panel element for use in the overlay.

```js
var panel = LuaToolsMods.createPanel({
    id: 'stats-panel',
    title: 'Game Stats',
    content: '<p>Downloads: 1,234</p>'
});
overlay.appendChild(panel);
```

| Option | Type | Description |
|--------|------|-------------|
| `id` | `string` | Panel CSS id suffix |
| `title` | `string` | Panel heading text |
| `content` | `string\|HTMLElement` | HTML string or DOM element |

**Returns:** `HTMLElement` — styled panel div.

### `LuaToolsMods.showToast(message, durationMs)`

Show a temporary toast notification in the bottom-right corner.

```js
LuaToolsMods.showToast('Fix downloaded!', 3000);
```

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `message` | `string` | — | Text to display |
| `durationMs` | `number` | `3000` | How long to show (ms) |

### `LuaToolsMods.getMods()`

Returns an array of all registered mod definitions.

```js
var allMods = LuaToolsMods.getMods();
allMods.forEach(function(mod) {
    console.log(mod.id, mod.version);
});
```

**Returns:** `Array<Object>`

### `LuaToolsMods.hasMod(id)`

Check if a mod with the given ID is registered.

```js
if (LuaToolsMods.hasMod('theme-mod')) {
    // theme-mod is installed, adjust our UI accordingly
}
```

**Returns:** `boolean`

### `LuaToolsMods.fireHook(hookName, data)`

Manually fire a lifecycle hook. Useful for mod-to-mod communication.

```js
LuaToolsMods.fireHook('onCustomEvent', { message: 'hello from my mod' });
```

---

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `LuaToolsMods.version` | `string` | Mod loader version |
| `LuaToolsMods._mods` | `object` | Internal mod registry (read-only) |
| `LuaToolsMods._hooks` | `object` | Internal hook registry (read-only) |
