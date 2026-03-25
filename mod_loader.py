"""
Kite - Backend Module
Scans the mods/ directory, serves mod files to the frontend,
and provides enable/disable toggles via mods_config.json.
"""
import os
import json

MODS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'mods')
CONFIG_FILE = os.path.join(MODS_DIR, 'mods_config.json')


def _ensure_mods_dir():
    """Create mods/ directory if it doesn't exist"""
    os.makedirs(MODS_DIR, exist_ok=True)


def _load_config():
    """Load the mods enable/disable config"""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def _save_config(config):
    """Save the mods enable/disable config"""
    _ensure_mods_dir()
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2)


def GetModList():
    """Scan the mods/ directory and return a JSON array of mod manifests"""
    _ensure_mods_dir()
    config = _load_config()
    mods = []

    for entry in os.listdir(MODS_DIR):
        entry_path = os.path.join(MODS_DIR, entry)

        # Skip config file and non-mod files
        if entry == 'mods_config.json':
            continue

        # Single-file mod (just a .js file)
        if os.path.isfile(entry_path) and entry.endswith('.js'):
            mod_id = entry[:-3]  # strip .js
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

        # Folder mod (with manifest.json)
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
                    print(f'[ModLoader] Skipping {entry}: bad manifest.json ({e})')

    return json.dumps(mods)


def GetModFile(mod_id: str, filename: str):
    """Serve a specific file from a mod's directory"""
    _ensure_mods_dir()
    
    # Security: block directory traversal and encoded slashes
    if '..' in filename or '..' in mod_id:
        return ''
    if '/' in mod_id or '\\' in mod_id:
        return ''
    if '/' in filename or '\\' in filename:
        return ''

    # Check folder mod first
    folder_path = os.path.join(MODS_DIR, mod_id, filename)
    # Realpath containment: ensure resolved path is still inside mods/
    real_mods = os.path.realpath(MODS_DIR)
    real_target = os.path.realpath(folder_path)
    if not real_target.startswith(real_mods):
        return ''
    if os.path.isfile(real_target):
        with open(real_target, 'r', encoding='utf-8') as f:
            return f.read()

    # Check single-file mod
    if filename.endswith('.js'):
        single_path = os.path.join(MODS_DIR, filename)
        real_single = os.path.realpath(single_path)
        if not real_single.startswith(real_mods):
            return ''
        if os.path.isfile(real_single):
            with open(real_single, 'r', encoding='utf-8') as f:
                return f.read()

    return ''


def ToggleMod(mod_id: str, enabled: bool):
    """Enable or disable a mod"""
    config = _load_config()
    config[mod_id] = enabled
    _save_config(config)
    return json.dumps({'success': True, 'mod_id': mod_id, 'enabled': enabled})


def GetModLoaderVersion():
    """Returns the mod loader version"""
    return json.dumps({'version': '1.0.0', 'modsDir': MODS_DIR})
