// Quick Actions Bar - Adds utility buttons to the overlay

LuaToolsMods.registerMod({
    id: 'quick-actions',
    name: 'Quick Actions Bar',
    version: '1.0.0',

    onOverlayOpen: function(data) {
        var overlay = data.overlay;
        var appid = data.appid;
        var gameName = data.gameName || '';

        if (!overlay || overlay.querySelector('#ltmod-quick-actions')) return;

        setTimeout(function() {
            var bar = document.createElement('div');
            bar.id = 'ltmod-quick-actions';
            bar.style.cssText = 'display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;';

            var buttons = [
                {
                    label: '📋 Copy AppID',
                    action: function() {
                        navigator.clipboard.writeText(String(appid)).then(function() {
                            LuaToolsMods.showToast('AppID ' + appid + ' copied!', 2000);
                        });
                    }
                },
                {
                    label: '📂 Install Folder',
                    action: function() {
                        try {
                            Millennium.callServerMethod('luatools', 'OpenInstallFolder', {
                                appid: appid
                            });
                        } catch(e) {
                            LuaToolsMods.showToast('Could not open folder', 2000);
                        }
                    }
                },
                {
                    label: '🔍 SteamDB',
                    action: function() {
                        try {
                            Millennium.callServerMethod('luatools', 'OpenExternalUrl', {
                                url: 'https://steamdb.info/app/' + appid + '/',
                                contentScriptQuery: ''
                            });
                        } catch(_) {}
                    }
                },
                {
                    label: '📖 PCGamingWiki',
                    action: function() {
                        var search = encodeURIComponent(gameName);
                        try {
                            Millennium.callServerMethod('luatools', 'OpenExternalUrl', {
                                url: 'https://www.pcgamingwiki.com/w/index.php?search=' + search,
                                contentScriptQuery: ''
                            });
                        } catch(_) {}
                    }
                }
            ];

            buttons.forEach(function(btn) {
                var el = document.createElement('button');
                el.textContent = btn.label;
                el.style.cssText = 'flex:1;min-width:120px;padding:8px 12px;background:rgba(255,255,255,0.05);' +
                    'border:1px solid rgba(255,255,255,0.1);border-radius:6px;color:#ccc;font-size:12px;' +
                    'cursor:pointer;transition:all 0.2s ease;';
                el.addEventListener('mouseenter', function() {
                    el.style.background = 'rgba(0,255,255,0.1)';
                    el.style.borderColor = 'rgba(0,255,255,0.3)';
                    el.style.color = '#fff';
                });
                el.addEventListener('mouseleave', function() {
                    el.style.background = 'rgba(255,255,255,0.05)';
                    el.style.borderColor = 'rgba(255,255,255,0.1)';
                    el.style.color = '#ccc';
                });
                el.addEventListener('click', btn.action);
                bar.appendChild(el);
            });

            // Insert before the credit section
            var columns = overlay.querySelectorAll('[style*="flex"]');
            var target = columns.length > 0 ? columns[columns.length - 1] : overlay;
            target.appendChild(bar);
        }, 150);
    }
});
