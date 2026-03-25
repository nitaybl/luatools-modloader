// Game Stats Tracker - Shows game info panel in the LuaTools overlay

LuaToolsMods.registerMod({
    id: 'game-stats',
    name: 'Game Stats Tracker',
    version: '1.0.0',

    _formatBytes: function(bytes) {
        if (bytes === 0) return '0 B';
        var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        var i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    },

    _formatPlaytime: function(minutes) {
        if (!minutes || minutes <= 0) return 'Never played';
        if (minutes < 60) return minutes + ' min';
        var hours = Math.floor(minutes / 60);
        var mins = minutes % 60;
        return hours + 'h ' + mins + 'm';
    },

    onOverlayOpen: function(data) {
        var self = this;
        var overlay = data.overlay;
        var appid = data.appid;

        if (!overlay || overlay.querySelector('#ltmod-game-stats')) return;

        setTimeout(function() {
            // Fetch game info from Steam store API
            var statsPanel = LuaToolsMods.createPanel({
                id: 'game-stats',
                title: '📊 Game Stats'
            });

            var statsContent = document.createElement('div');
            statsContent.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;';

            // Create stat cards
            var stats = [
                { icon: '🎮', label: 'AppID', value: String(appid) },
                { icon: '📦', label: 'Status', value: 'Checking...' },
                { icon: '⏱️', label: 'Playtime', value: 'Loading...' },
                { icon: '🏆', label: 'Achievements', value: 'Loading...' }
            ];

            stats.forEach(function(stat) {
                var card = document.createElement('div');
                card.style.cssText = 'background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);' +
                    'border-radius:6px;padding:10px;text-align:center;transition:all 0.2s ease;';
                card.innerHTML = '<div style="font-size:18px;margin-bottom:4px;">' + stat.icon + '</div>' +
                    '<div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;">' + stat.label + '</div>' +
                    '<div class="ltmod-stat-value" data-stat="' + stat.label.toLowerCase() + '" style="font-size:14px;color:#fff;font-weight:600;margin-top:2px;">' + stat.value + '</div>';
                
                card.addEventListener('mouseenter', function() {
                    card.style.borderColor = 'rgba(139,92,246,0.3)';
                    card.style.background = 'rgba(139,92,246,0.05)';
                });
                card.addEventListener('mouseleave', function() {
                    card.style.borderColor = 'rgba(255,255,255,0.06)';
                    card.style.background = 'rgba(255,255,255,0.03)';
                });
                
                statsContent.appendChild(card);
            });

            statsPanel.appendChild(statsContent);

            var columns = overlay.querySelectorAll('[style*="flex"]');
            var target = columns.length > 0 ? columns[columns.length - 1] : overlay;
            target.appendChild(statsPanel);

            // Try to fetch real data from Steam
            try {
                // Check if game is installed via LuaTools backend
                Millennium.callServerMethod('luatools', 'GetGameInstallPath', {
                    appid: appid
                }).then(function(path) {
                    var statusEl = statsPanel.querySelector('[data-stat="status"]');
                    if (statusEl) {
                        statusEl.textContent = path ? '✅ Installed' : '❌ Not installed';
                        statusEl.style.color = path ? '#4ade80' : '#f87171';
                    }
                }).catch(function() {
                    var statusEl = statsPanel.querySelector('[data-stat="status"]');
                    if (statusEl) statusEl.textContent = 'Unknown';
                });
            } catch(e) {
                // Backend not available
            }

            // Fetch from Steam store API for achievements
            try {
                fetch('https://store.steampowered.com/api/appdetails?appids=' + appid)
                    .then(function(r) { return r.json(); })
                    .then(function(apiData) {
                        var gameData = apiData[appid];
                        if (gameData && gameData.success && gameData.data) {
                            var d = gameData.data;
                            
                            var achieveEl = statsPanel.querySelector('[data-stat="achievements"]');
                            if (achieveEl && d.achievements) {
                                achieveEl.textContent = d.achievements.total + ' total';
                            } else if (achieveEl) {
                                achieveEl.textContent = 'None';
                                achieveEl.style.color = '#666';
                            }

                            var playtimeEl = statsPanel.querySelector('[data-stat="playtime"]');
                            if (playtimeEl) {
                                playtimeEl.textContent = 'See Steam';
                                playtimeEl.style.color = '#888';
                            }
                        }
                    })
                    .catch(function() {});
            } catch(e) {}

        }, 250);
    }
});
