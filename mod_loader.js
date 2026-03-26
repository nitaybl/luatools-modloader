// ============================================
// LUATOOLS MOD LOADER ENGINE
// Loads user mods from the mods/ directory
// without modifying core luatools.js
// ============================================

(function() {
    'use strict';

    // Global mod registry
    window.LuaToolsMods = {
        _mods: {},
        _hooks: {},
        version: '1.0.0',

        // Register a mod
        registerMod: function(modDef) {
            if (!modDef || !modDef.id) {
                console.warn('[ModLoader] Mod registration failed: missing id');
                return;
            }
            this._mods[modDef.id] = modDef;
            console.log('[ModLoader] Registered mod: ' + modDef.id + ' v' + (modDef.version || '?'));

            // Auto-register lifecycle hooks
            var hookNames = ['onOverlayOpen', 'onOverlayClose', 'onFixApplied', 
                           'onFixFailed', 'onGameDetected', 'onSettingsOpen',
                           'onDownloadStart', 'onDownloadComplete', 'onModsPanel'];
            for (var i = 0; i < hookNames.length; i++) {
                var hook = hookNames[i];
                if (typeof modDef[hook] === 'function') {
                    if (!this._hooks[hook]) this._hooks[hook] = [];
                    this._hooks[hook].push({ modId: modDef.id, fn: modDef[hook] });
                }
            }
        },

        // Fire a lifecycle hook
        fireHook: function(hookName, data) {
            var handlers = this._hooks[hookName] || [];
            for (var i = 0; i < handlers.length; i++) {
                try {
                    handlers[i].fn(data);
                } catch (err) {
                    console.error('[ModLoader] Error in ' + handlers[i].modId + '.' + hookName + ':', err);
                }
            }
        },

        // Get list of registered mods
        getMods: function() {
            return Object.keys(this._mods).map(function(id) { return this._mods[id]; }.bind(this));
        },

        // Check if a mod is registered
        hasMod: function(id) {
            return !!this._mods[id];
        },

        // Utility: inject CSS string
        injectCSS: function(id, cssText) {
            var existing = document.getElementById('ltmod-css-' + id);
            if (existing) existing.remove();
            var style = document.createElement('style');
            style.id = 'ltmod-css-' + id;
            style.textContent = cssText;
            document.head.appendChild(style);
        },

        // Utility: create a panel inside the LuaTools overlay
        createPanel: function(options) {
            var panel = document.createElement('div');
            panel.id = 'ltmod-panel-' + (options.id || 'unknown');
            panel.style.cssText = 'background:rgba(30,30,30,0.95);border:1px solid rgba(255,255,255,0.1);' +
                'border-radius:8px;padding:16px;margin-top:12px;';
            if (options.title) {
                var title = document.createElement('div');
                title.style.cssText = 'font-size:14px;font-weight:600;color:#fff;margin-bottom:8px;';
                title.textContent = options.title;
                panel.appendChild(title);
            }
            if (options.content) {
                var content = document.createElement('div');
                content.style.cssText = 'font-size:13px;color:#aaa;line-height:1.5;';
                if (typeof options.content === 'string') {
                    content.innerHTML = options.content;
                } else {
                    content.appendChild(options.content);
                }
                panel.appendChild(content);
            }
            return panel;
        },

        // Utility: show a toast notification
        showToast: function(message, durationMs) {
            var toast = document.createElement('div');
            toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#1a1a2e;color:#00ffff;' +
                'padding:12px 20px;border-radius:8px;border:1px solid #00ffff33;font-size:13px;z-index:99999;' +
                'box-shadow:0 4px 20px rgba(0,255,255,0.15);animation:ltmod-toast-in 0.3s ease;';
            toast.textContent = message;
            
            var style = document.createElement('style');
            style.textContent = '@keyframes ltmod-toast-in{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}' +
                '@keyframes ltmod-toast-out{from{opacity:1}to{opacity:0;transform:translateY(-10px)}}';
            document.head.appendChild(style);
            document.body.appendChild(toast);
            
            setTimeout(function() {
                toast.style.animation = 'ltmod-toast-out 0.3s ease forwards';
                setTimeout(function() { toast.remove(); style.remove(); }, 300);
            }, durationMs || 3000);
        },

        // Utility: add a button to the LuaTools overlay
        addOverlayButton: function(options) {
            return {
                label: options.label || 'Mod Button',
                icon: options.icon || 'fa-puzzle-piece',
                onClick: options.onClick || function() {},
                _modId: options.modId || 'unknown'
            };
        },

        // Utility: sandboxed key-value storage per mod (backed by localStorage)
        getStorage: function(modId) {
            var prefix = 'ltmod_' + modId + '_';
            return {
                get: function(key, defaultValue) {
                    try {
                        var raw = localStorage.getItem(prefix + key);
                        if (raw === null) return defaultValue !== undefined ? defaultValue : null;
                        return JSON.parse(raw);
                    } catch(e) {
                        return defaultValue !== undefined ? defaultValue : null;
                    }
                },
                set: function(key, value) {
                    try {
                        localStorage.setItem(prefix + key, JSON.stringify(value));
                    } catch(e) {
                        console.error('[ModLoader] Storage error for ' + modId + ':', e);
                    }
                },
                remove: function(key) {
                    localStorage.removeItem(prefix + key);
                },
                clear: function() {
                    var toRemove = [];
                    for (var i = 0; i < localStorage.length; i++) {
                        var k = localStorage.key(i);
                        if (k && k.indexOf(prefix) === 0) toRemove.push(k);
                    }
                    toRemove.forEach(function(k) { localStorage.removeItem(k); });
                },
                keys: function() {
                    var result = [];
                    for (var i = 0; i < localStorage.length; i++) {
                        var k = localStorage.key(i);
                        if (k && k.indexOf(prefix) === 0) result.push(k.substring(prefix.length));
                    }
                    return result;
                }
            };
        }
    };

    // Load mods from backend with dependency resolution
    async function loadMods() {
        try {
            var modList = await Millennium.callServerMethod('luatools', 'GetModList', {});
            var mods = JSON.parse(modList);
            console.log('[ModLoader] Found ' + mods.length + ' mod(s) to load');

            // Build a map of available mod IDs for dependency checking
            var modMap = {};
            for (var i = 0; i < mods.length; i++) {
                modMap[mods[i].id] = mods[i];
            }

            // Topological sort: mods with dependencies load after their deps
            var sorted = [];
            var visited = {};
            function visit(mod) {
                if (visited[mod.id]) return;
                visited[mod.id] = true;
                var deps = mod.dependencies || [];
                for (var d = 0; d < deps.length; d++) {
                    if (modMap[deps[d]]) visit(modMap[deps[d]]);
                }
                sorted.push(mod);
            }
            for (var j = 0; j < mods.length; j++) visit(mods[j]);

            for (var i = 0; i < sorted.length; i++) {
                var mod = sorted[i];
                if (!mod.enabled) {
                    console.log('[ModLoader] Skipping disabled mod: ' + mod.id);
                    continue;
                }

                // Check dependencies
                var deps = mod.dependencies || [];
                var missing = [];
                for (var d = 0; d < deps.length; d++) {
                    if (!modMap[deps[d]] || !modMap[deps[d]].enabled) {
                        missing.push(deps[d]);
                    }
                }
                if (missing.length > 0) {
                    console.warn('[ModLoader] Mod ' + mod.id + ' missing dependencies: ' + missing.join(', '));
                    LuaToolsMods.showToast('⚠️ ' + mod.id + ' needs: ' + missing.join(', '), 5000);
                    continue;
                }

                try {
                    // Load CSS if present
                    if (mod.style) {
                        var cssContent = await Millennium.callServerMethod('luatools', 'GetModFile', {
                            mod_id: mod.id, filename: mod.style
                        });
                        if (cssContent) {
                            LuaToolsMods.injectCSS(mod.id, cssContent);
                        }
                    }

                    // Load JS
                    var jsContent = await Millennium.callServerMethod('luatools', 'GetModFile', {
                        mod_id: mod.id, filename: mod.main
                    });
                    if (jsContent) {
                        // Execute in isolated scope
                        var script = document.createElement('script');
                        script.textContent = '(function(){ try {' + jsContent + '} catch(e) { console.error("[ModLoader] Error loading ' + mod.id + ':", e); } })();';
                        script.dataset.modId = mod.id;
                        document.head.appendChild(script);
                    }
                } catch (err) {
                    console.error('[ModLoader] Failed to load mod ' + mod.id + ':', err);
                }
            }

            console.log('[ModLoader] All mods loaded. ' + Object.keys(LuaToolsMods._mods).length + ' registered.');
        } catch (err) {
            // Backend method not available = mod loader not installed on backend
            console.log('[ModLoader] Backend not available, skipping mod loading:', err.message || err);
        }
    }

    // Check for updates and show a banner if available (user must approve)
    async function checkForUpdates() {
        try {
            var result = await Millennium.callServerMethod('luatools', 'check_modloader_update', {});
            var data = JSON.parse(result);

            if (!data.updateAvailable) return;

            // Build the update banner
            var banner = document.createElement('div');
            banner.id = 'ltmod-update-banner';
            banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:100000;' +
                'background:linear-gradient(135deg,#1a1a2e,#16213e);' +
                'border-bottom:1px solid rgba(0,255,255,0.2);' +
                'padding:12px 24px;display:flex;align-items:center;justify-content:space-between;' +
                'font-family:system-ui,-apple-system,sans-serif;font-size:13px;color:#c9d1d9;' +
                'box-shadow:0 4px 20px rgba(0,0,0,0.4);animation:ltmod-banner-in 0.4s ease;';

            var info = document.createElement('div');
            info.innerHTML = '🔄 <strong style="color:#00ffff;">Mod Loader Update Available</strong> — ' +
                '<span style="color:#888;">v' + data.currentVersion + '</span> → ' +
                '<span style="color:#4ade80;font-weight:600;">v' + data.latestVersion + '</span>';

            var buttons = document.createElement('div');
            buttons.style.cssText = 'display:flex;gap:8px;';

            var updateBtn = document.createElement('button');
            updateBtn.textContent = '✅ Update Now';
            updateBtn.style.cssText = 'background:rgba(74,222,128,0.15);color:#4ade80;border:1px solid rgba(74,222,128,0.3);' +
                'padding:6px 16px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;transition:all 0.2s;';
            updateBtn.addEventListener('mouseenter', function() {
                updateBtn.style.background = 'rgba(74,222,128,0.25)';
            });
            updateBtn.addEventListener('mouseleave', function() {
                updateBtn.style.background = 'rgba(74,222,128,0.15)';
            });
            updateBtn.addEventListener('click', async function() {
                updateBtn.textContent = '⏳ Updating...';
                updateBtn.disabled = true;
                try {
                    var res = await Millennium.callServerMethod('luatools', 'apply_modloader_update', {});
                    var r = JSON.parse(res);
                    if (r.success) {
                        info.innerHTML = '✅ <strong style="color:#4ade80;">Updated to v' + r.version + '!</strong> Restart Steam to apply.';
                        updateBtn.remove();
                        dismissBtn.textContent = 'OK';
                    } else {
                        updateBtn.textContent = '❌ Failed';
                        updateBtn.style.borderColor = 'rgba(248,113,113,0.3)';
                        updateBtn.style.color = '#f87171';
                        LuaToolsMods.showToast('Update failed: ' + (r.error || 'Unknown error'), 5000);
                    }
                } catch(e) {
                    updateBtn.textContent = '❌ Error';
                    console.error('[ModLoader] Update error:', e);
                }
            });

            var dismissBtn = document.createElement('button');
            dismissBtn.textContent = '✕ Dismiss';
            dismissBtn.style.cssText = 'background:rgba(255,255,255,0.05);color:#888;border:1px solid rgba(255,255,255,0.1);' +
                'padding:6px 16px;border-radius:6px;cursor:pointer;font-size:12px;transition:all 0.2s;';
            dismissBtn.addEventListener('click', function() {
                banner.style.animation = 'ltmod-banner-out 0.3s ease forwards';
                setTimeout(function() { banner.remove(); bannerStyle.remove(); }, 300);
            });

            buttons.appendChild(updateBtn);
            buttons.appendChild(dismissBtn);
            banner.appendChild(info);
            banner.appendChild(buttons);

            var bannerStyle = document.createElement('style');
            bannerStyle.textContent = '@keyframes ltmod-banner-in{from{transform:translateY(-100%)}to{transform:translateY(0)}}' +
                '@keyframes ltmod-banner-out{from{transform:translateY(0);opacity:1}to{transform:translateY(-100%);opacity:0}}';
            document.head.appendChild(bannerStyle);
            document.body.appendChild(banner);

            console.log('[ModLoader] Update available: v' + data.currentVersion + ' → v' + data.latestVersion);

            // Also check individual mod updates
            try {
                var modResult = await Millennium.callServerMethod('luatools', 'check_mod_updates', {});
                var modUpdates = JSON.parse(modResult);
                if (modUpdates.length > 0) {
                    var names = modUpdates.map(function(m) { return m.modName; }).join(', ');
                    LuaToolsMods.showToast('📦 Mod updates available: ' + names, 5000);
                }
            } catch(e) {}

        } catch (err) {
            // Backend not available or no internet — fail silently
            console.log('[ModLoader] Update check skipped:', err.message || err);
        }
    }

    // Boot the mod loader after a short delay to let core LuaTools initialize
    setTimeout(function() {
        loadMods().then(function() {
            // Check for updates 3 seconds after mods finish loading
            setTimeout(checkForUpdates, 3000);
        });
    }, 500);
})();


// Kite Plugin Injection Loop
function InitializeKitePlugins() {
    console.log('[Kite Loader] Booting dynamic plugin scanner...');
    if (typeof Millennium !== 'undefined' && typeof Millennium.callServerMethod === 'function') {
        const pluginAlias = window.__KiteAlias || 'kiteloader';
        Millennium.callServerMethod(pluginAlias, 'GetModList', {
            contentScriptQuery: ''
        }).then(function(res) {
            try {
                const mods = typeof res === 'string' ? JSON.parse(res) : res;
                if (!Array.isArray(mods)) {
                    if (pluginAlias === 'kiteloader') {
                        window.__KiteAlias = 'luatools';
                        InitializeKitePlugins();
                    }
                    return;
                }
                mods.forEach(function(mod) {
                    if (mod.enabled) {
                        console.log('[Kite Loader] Injecting sandbox for ' + mod.id);
                        const mainFile = mod.main || 'main.js';
                        Millennium.callServerMethod(window.__KiteAlias, 'GetModFile', {
                            mod_id: mod.id,
                            filename: mainFile,
                            contentScriptQuery: ''
                        }).then(function(fileRes) {
                            try {
                                const payload = typeof fileRes === 'string' ? fileRes : null;
                                if (payload) {
                                    const script = document.createElement('script');
                                    script.textContent = payload;
                                    document.head.appendChild(script);
                                }
                            } catch(e) {
                                console.error('[Kite Loader] Failed to execute plugin ' + mod.id, e);
                            }
                        });
                    }
                });
            } catch(e) {
                console.error('[Kite Loader] Failed to parse mod list', e);
            }
        }).catch(function(e) {
            if (pluginAlias === 'kiteloader') {
                window.__KiteAlias = 'luatools';
                InitializeKitePlugins();
            } else {
                console.error('[Kite Loader] Backend error reading plugins', e);
            }
        });
    }
}
setTimeout(InitializeKitePlugins, 1500);
