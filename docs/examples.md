# Example Mods

The mod loader ships with 4 example mods. Use them as reference for building your own.

---

## 1. Credits Mod

**ID:** `credits-mod` • **Author:** nitaybl

Adds a contributor credits panel to the LuaTools fix overlay with clickable GitHub profile links.

**Hooks used:** `onOverlayOpen`

```js
LuaToolsMods.registerMod({
    id: 'credits-mod',
    onOverlayOpen: function(data) {
        var panel = LuaToolsMods.createPanel({
            id: 'credits',
            title: '💜 Credits',
            content: 'Only possible thanks to ShayneVi & nitaybl 💜'
        });
        data.overlay.appendChild(panel);
    }
});
```

**Techniques demonstrated:**
- `createPanel()` for styled DOM injection
- `setTimeout` for waiting for overlay render
- Wiring click handlers to Millennium's `OpenExternalUrl`

→ [Full source](https://github.com/nitaybl/luatools-modloader/tree/main/mods/credits-mod)

---

## 2. Cyberpunk Theme

**ID:** `cyberpunk-theme` • **Author:** nitaybl

Full visual overhaul: neon border glow animation, gradient backgrounds, button hover effects, custom scrollbars, and Orbitron sci-fi font.

**Hooks used:** `onOverlayOpen`

```js
LuaToolsMods.registerMod({
    id: 'cyberpunk-theme',
    onOverlayOpen: function(data) {
        LuaToolsMods.injectCSS('cyberpunk-theme', `
            [id*="lt-overlay"] {
                background: linear-gradient(135deg, 
                    rgba(10,10,30,0.98), rgba(20,10,40,0.98)) !important;
                border: 1px solid rgba(0,255,255,0.2) !important;
            }
            @keyframes lt-cyber-border {
                0%, 100% { border-color: rgba(0,255,255,0.2); }
                50% { border-color: rgba(139,92,246,0.4); }
            }
        `);
        LuaToolsMods.showToast('🌆 Cyberpunk theme activated', 2000);
    }
});
```

**Techniques demonstrated:**
- `injectCSS()` for runtime style injection
- `showToast()` for user feedback
- `@keyframes` animations via injected CSS
- Loading external fonts via CSS `@import`

→ [Full source](https://github.com/nitaybl/luatools-modloader/tree/main/mods/cyberpunk-theme)

---

## 3. Quick Actions Bar

**ID:** `quick-actions` • **Author:** nitaybl

Adds a row of 4 utility buttons: Copy AppID, Open Install Folder, Open SteamDB, Open PCGamingWiki.

**Hooks used:** `onOverlayOpen`

```js
LuaToolsMods.registerMod({
    id: 'quick-actions',
    onOverlayOpen: function(data) {
        var buttons = [
            { label: '📋 Copy AppID', action: function() {
                navigator.clipboard.writeText(String(data.appid));
                LuaToolsMods.showToast('Copied!', 2000);
            }},
            { label: '🔍 SteamDB', action: function() {
                Millennium.callServerMethod('luatools', 'OpenExternalUrl', {
                    url: 'https://steamdb.info/app/' + data.appid + '/'
                });
            }}
        ];
        // ... render buttons into a flex row
    }
});
```

**Techniques demonstrated:**
- `navigator.clipboard` API for system clipboard access
- Millennium backend method calls
- Dynamic DOM element creation with hover effects
- Responsive flex layout

→ [Full source](https://github.com/nitaybl/luatools-modloader/tree/main/mods/quick-actions)

---

## 4. Fix Notifications

**ID:** `fix-notifications` • **Author:** nitaybl

Shows rich animated toast notifications when fixes succeed, fail, or download. Includes audible feedback using the Web Audio API (success = high sine chime, error = low square buzz).

**Hooks used:** `onFixApplied`, `onFixFailed`, `onDownloadStart`, `onDownloadComplete`

```js
LuaToolsMods.registerMod({
    id: 'fix-notifications',
    
    onFixApplied: function(data) {
        // Play success beep via Web Audio API
        var ctx = new AudioContext();
        var osc = ctx.createOscillator();
        osc.frequency.value = 880;
        // ... connect and play

        // Show green success toast
        LuaToolsMods.showToast('✅ Fix applied!', 5000);
    },

    onFixFailed: function(data) {
        // Play error buzz
        // Show red error toast with error message
    }
});
```

**Techniques demonstrated:**
- Multiple lifecycle hooks in a single mod
- Web Audio API for sound effects
- Custom CSS animations (slide-in from right)
- Rich toast with multi-line content and gradient backgrounds

→ [Full source](https://github.com/nitaybl/luatools-modloader/tree/main/mods/fix-notifications)
