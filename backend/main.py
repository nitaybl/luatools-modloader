"""
Kite - Backend Module
Scans the mods/ directory, serves mod files to the frontend,
and provides enable/disable toggles via mods_config.json.
"""
import os
import json

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
PLUGIN_DIR = os.path.dirname(BACKEND_DIR)
MODS_DIR = os.path.join(PLUGIN_DIR, 'mods')
CONFIG_FILE = os.path.join(MODS_DIR, 'mods_config.json')


def _ensure_mods_dir():
    if not os.path.exists(MODS_DIR):
        os.makedirs(MODS_DIR, exist_ok=True)


def _load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def _save_config(config):
    _ensure_mods_dir()
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)


class Plugin:
    """Millennium requires a Plugin class with _load/_unload methods."""

    def _load(self):
        print("Kite Mod Loader backend loaded!")
        _ensure_mods_dir()

    def _unload(self):
        print("Kite Mod Loader backend unloaded.")

    def GetModList(self):
        _ensure_mods_dir()
        config = _load_config()
        mods = []

        if not os.path.exists(MODS_DIR):
            return json.dumps([])

        for entry in os.listdir(MODS_DIR):
            entry_path = os.path.join(MODS_DIR, entry)

            if entry == 'mods_config.json':
                continue

            if os.path.isfile(entry_path) and entry.endswith('.js'):
                mod_id = entry[:-3]
                mods.append({
                    'id': mod_id,
                    'name': mod_id,
                    'version': '1.0.0',
                    'author': 'Unknown',
                    'description': 'Single-file mod',
                    'main': entry,
                    'style': None,
                    'enabled': config.get(mod_id, True),
                    'type': 'single-file'
                })

            elif os.path.isdir(entry_path):
                manifest_path = os.path.join(entry_path, 'manifest.json')
                if os.path.exists(manifest_path):
                    try:
                        with open(manifest_path, 'r', encoding='utf-8') as f:
                            manifest = json.load(f)
                        mod_id = manifest.get('id', entry)
                        manifest['enabled'] = config.get(mod_id, True)
                        manifest['type'] = 'folder'
                        manifest.setdefault('main', 'mod.js')
                        mods.append(manifest)
                    except (json.JSONDecodeError, IOError) as e:
                        print(f'[Kite] Skipping {entry}: bad manifest.json ({e})')

        return json.dumps(mods)

    def GetModFile(self, mod_id: str, filename: str):
        if '..' in filename or '..' in mod_id:
            return ''
        if '/' in mod_id or '\\' in mod_id:
            return ''
        if '/' in filename or '\\' in filename:
            return ''

        folder_path = os.path.join(MODS_DIR, mod_id, filename)
        real_mods = os.path.realpath(MODS_DIR)
        real_target = os.path.realpath(folder_path)

        if not real_target.startswith(real_mods):
            return ''
        if os.path.isfile(real_target):
            with open(real_target, 'r', encoding='utf-8') as f:
                return f.read()

        if filename.endswith('.js'):
            single_path = os.path.join(MODS_DIR, filename)
            real_single = os.path.realpath(single_path)
            if not real_single.startswith(real_mods):
                return ''
            if os.path.isfile(real_single):
                with open(real_single, 'r', encoding='utf-8') as f:
                    return f.read()

        return ''

    def ToggleMod(self, mod_id: str, enabled: bool):
        config = _load_config()
        config[mod_id] = enabled
        _save_config(config)
        return json.dumps({'success': True, 'mod_id': mod_id, 'enabled': enabled})

    def GetModLoaderVersion(self):
        return json.dumps({'version': '1.0.0', 'modsDir': MODS_DIR})

    def RestartSteam(self):
        import subprocess
        subprocess.Popen('taskkill /IM steam.exe /F >nul 2>&1 && start steam://open/main', shell=True)
        return json.dumps({'success': True})

    def TerminateSteam(self):
        import subprocess
        subprocess.Popen('taskkill /IM steam.exe /F >nul 2>&1', shell=True)
        return json.dumps({'success': True})
