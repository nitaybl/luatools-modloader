// Fix Notifications - Toast alerts for fix lifecycle events

LuaToolsMods.registerMod({
    id: 'fix-notifications',
    name: 'Fix Notifications',
    version: '1.0.0',

    _playSuccessBeep: function() {
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.3);
        } catch(e) {}
    },

    _playErrorBeep: function() {
        try {
            var ctx = new (window.AudioContext || window.webkitAudioContext)();
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 220;
            osc.type = 'square';
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } catch(e) {}
    },

    onDownloadStart: function(data) {
        LuaToolsMods.showToast('⬇️ Downloading fix for AppID ' + data.appid + '...', 3000);
    },

    onDownloadComplete: function(data) {
        LuaToolsMods.showToast('📦 Download complete for AppID ' + data.appid, 3000);
    },

    onFixApplied: function(data) {
        this._playSuccessBeep();

        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:linear-gradient(135deg,#0d2b1a,#1a3d2a);' +
            'color:#4ade80;padding:16px 24px;border-radius:12px;border:1px solid rgba(74,222,128,0.3);' +
            'font-size:14px;z-index:99999;box-shadow:0 8px 32px rgba(74,222,128,0.15);' +
            'animation:ltmod-toast-in 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:350px;';
        toast.innerHTML = '<div style="font-weight:700;margin-bottom:4px;">✅ Fix Applied</div>' +
            '<div style="font-size:12px;opacity:0.8;">AppID ' + data.appid + ' • ' + (data.fixType || 'Fix') + '</div>';

        var style = document.createElement('style');
        style.textContent = '@keyframes ltmod-toast-in{from{transform:translateX(100px);opacity:0}to{transform:translateX(0);opacity:1}}';
        document.head.appendChild(style);
        document.body.appendChild(toast);

        setTimeout(function() {
            toast.style.transition = 'all 0.3s ease';
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(function() { toast.remove(); style.remove(); }, 300);
        }, 5000);
    },

    onFixFailed: function(data) {
        this._playErrorBeep();

        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:linear-gradient(135deg,#2b0d0d,#3d1a1a);' +
            'color:#f87171;padding:16px 24px;border-radius:12px;border:1px solid rgba(248,113,113,0.3);' +
            'font-size:14px;z-index:99999;box-shadow:0 8px 32px rgba(248,113,113,0.15);' +
            'animation:ltmod-toast-in 0.4s cubic-bezier(0.175,0.885,0.32,1.275);max-width:350px;';
        toast.innerHTML = '<div style="font-weight:700;margin-bottom:4px;">❌ Fix Failed</div>' +
            '<div style="font-size:12px;opacity:0.8;">AppID ' + data.appid + '</div>' +
            '<div style="font-size:11px;opacity:0.6;margin-top:4px;">' + (data.error || 'Unknown error') + '</div>';

        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.transition = 'all 0.3s ease';
            toast.style.opacity = '0';
            setTimeout(function() { toast.remove(); }, 300);
        }, 7000);
    }
});
