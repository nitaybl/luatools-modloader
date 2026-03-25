// Credits Mod - Adds contributor credits to LuaTools overlay
// Made by nitaybl 💜

LuaToolsMods.registerMod({
    id: 'credits-mod',
    name: 'LuaTools Credits',
    version: '1.0.0',

    onOverlayOpen: function(data) {
        setTimeout(function() {
            var overlay = data.overlay || document.querySelector('[class*="lt-overlay"]');
            if (!overlay) return;
            if (overlay.querySelector('#ltmod-credits')) return;

            var creditPanel = LuaToolsMods.createPanel({
                id: 'credits',
                title: '💜 Credits',
                content: '<div style="text-align:center;padding:8px 0;">' +
                    '<span style="color:#ccc;">Made by </span>' +
                    '<a href="#" id="ltmod-credit-nitaybl" style="color:#8b5cf6;text-decoration:none;font-weight:600;">nitaybl</a>' +
                    '<span style="color:#ccc;"> 💜</span>' +
                '</div>'
            });

            var columns = overlay.querySelectorAll('[style*="flex"]');
            var target = columns.length > 0 ? columns[columns.length - 1] : overlay;
            target.appendChild(creditPanel);

            setTimeout(function() {
                var nitayLink = document.getElementById('ltmod-credit-nitaybl');
                if (nitayLink) {
                    nitayLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        try {
                            Millennium.callServerMethod('luatools', 'OpenExternalUrl', {
                                url: 'https://github.com/nitaybl/', contentScriptQuery: ''
                            });
                        } catch(_) {}
                    });
                }
            }, 100);
        }, 200);
    }
});
