// Cyberpunk Theme Mod - Neon visual overhaul for LuaTools overlay

LuaToolsMods.registerMod({
    id: 'cyberpunk-theme',
    name: 'Cyberpunk Theme',
    version: '1.0.0',

    onOverlayOpen: function(data) {
        LuaToolsMods.injectCSS('cyberpunk-theme', `
            /* Overlay backdrop */
            [id*="lt-overlay"], [class*="lt-overlay"] {
                background: linear-gradient(135deg, rgba(10, 10, 30, 0.98), rgba(20, 10, 40, 0.98)) !important;
                border: 1px solid rgba(0, 255, 255, 0.2) !important;
                box-shadow: 0 0 40px rgba(0, 255, 255, 0.1), inset 0 0 80px rgba(139, 92, 246, 0.05) !important;
            }

            /* Animated border glow */
            @keyframes lt-cyber-border {
                0%, 100% { border-color: rgba(0, 255, 255, 0.2); }
                50% { border-color: rgba(139, 92, 246, 0.4); }
            }
            [id*="lt-overlay"], [class*="lt-overlay"] {
                animation: lt-cyber-border 4s ease-in-out infinite !important;
            }

            /* Button glow effect */
            [id*="lt-overlay"] a[style*="display:flex"],
            [id*="lt-overlay"] a[style*="background"] {
                border: 1px solid rgba(0, 255, 255, 0.15) !important;
                transition: all 0.3s ease !important;
            }
            [id*="lt-overlay"] a[style*="display:flex"]:hover,
            [id*="lt-overlay"] a[style*="background"]:hover {
                border-color: rgba(0, 255, 255, 0.5) !important;
                box-shadow: 0 0 15px rgba(0, 255, 255, 0.2) !important;
                transform: translateY(-1px) !important;
            }

            /* Heading neon glow */
            [id*="lt-overlay"] div[style*="font-size:24px"],
            [id*="lt-overlay"] div[style*="font-size:20px"] {
                text-shadow: 0 0 10px rgba(0, 255, 255, 0.3) !important;
            }

            /* Scrollbar styling */
            [id*="lt-overlay"]::-webkit-scrollbar { width: 6px; }
            [id*="lt-overlay"]::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
            [id*="lt-overlay"]::-webkit-scrollbar-thumb {
                background: linear-gradient(180deg, #00ffff, #8b5cf6);
                border-radius: 3px;
            }
        `);

        LuaToolsMods.showToast('🌆 Cyberpunk theme activated', 2000);
    }
});
