"""
Kite - Auto Update Module
Checks GitHub releases for newer versions of the mod loader
and individual mods, then applies updates silently.
"""
import os
import json
import urllib.request
import urllib.error
import zipfile
import shutil
import tempfile

MODLOADER_REPO = "nitaybl/kite"
GITHUB_API = "https://api.github.com"

LUATOOLS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
MODS_DIR = os.path.join(LUATOOLS_DIR, 'mods')
VERSION_FILE = os.path.join(LUATOOLS_DIR, 'modloader_version.json')


def _get_current_version():
    """Read the locally stored mod loader version"""
    if os.path.exists(VERSION_FILE):
        with open(VERSION_FILE, 'r') as f:
            return json.load(f).get('version', '0.0.0')
    return '0.0.0'


def _save_version(version):
    """Write the current version to disk"""
    with open(VERSION_FILE, 'w') as f:
        json.dump({'version': version}, f)


def _github_get(url):
    """Make a GET request to GitHub API with proper headers"""
    req = urllib.request.Request(url, headers={
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'LuaTools-ModLoader/1.0'
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except (urllib.error.URLError, urllib.error.HTTPError) as e:
        print(f'[ModLoader-Update] GitHub API error: {e}')
        return None


def _download_file(url, dest):
    """Download a file from URL to dest path"""
    req = urllib.request.Request(url, headers={'User-Agent': 'LuaTools-ModLoader/1.0'})
    with urllib.request.urlopen(req, timeout=30) as resp:
        with open(dest, 'wb') as f:
            f.write(resp.read())


def _version_tuple(v):
    """Convert version string to comparable tuple"""
    try:
        return tuple(int(x) for x in v.strip('v').split('.'))
    except (ValueError, AttributeError):
        return (0, 0, 0)


def check_modloader_update():
    """Check if a newer version of the mod loader is available on GitHub"""
    current = _get_current_version()
    data = _github_get(f'{GITHUB_API}/repos/{MODLOADER_REPO}/releases/latest')
    
    if not data:
        return json.dumps({'updateAvailable': False, 'error': 'Could not reach GitHub'})
    
    latest = data.get('tag_name', '0.0.0')
    
    if _version_tuple(latest) > _version_tuple(current):
        return json.dumps({
            'updateAvailable': True,
            'currentVersion': current,
            'latestVersion': latest,
            'releaseUrl': data.get('html_url', ''),
            'releaseNotes': data.get('body', '')[:500]
        })
    
    return json.dumps({'updateAvailable': False, 'currentVersion': current, 'latestVersion': latest})


def apply_modloader_update():
    """Download and apply the latest mod loader update from GitHub releases"""
    data = _github_get(f'{GITHUB_API}/repos/{MODLOADER_REPO}/releases/latest')
    
    if not data:
        return json.dumps({'success': False, 'error': 'Could not reach GitHub'})
    
    latest = data.get('tag_name', '0.0.0')
    assets = data.get('assets', [])
    
    # Look for a zip asset
    zip_asset = None
    for asset in assets:
        if asset['name'].endswith('.zip'):
            zip_asset = asset
            break
    
    if not zip_asset:
        # Fall back to source zip
        zip_url = data.get('zipball_url')
        if not zip_url:
            return json.dumps({'success': False, 'error': 'No downloadable assets found'})
    else:
        zip_url = zip_asset['browser_download_url']
    
    try:
        temp_dir = tempfile.mkdtemp(prefix='ltmod_update_')
        zip_path = os.path.join(temp_dir, 'update.zip')
        
        print(f'[ModLoader-Update] Downloading v{latest}...')
        _download_file(zip_url, zip_path)
        
        # Extract
        extract_dir = os.path.join(temp_dir, 'extracted')
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(extract_dir)
        
        # Find the root directory inside the zip
        entries = os.listdir(extract_dir)
        root = os.path.join(extract_dir, entries[0]) if len(entries) == 1 else extract_dir
        
        # Update core files (never touch mods/ directory)
        for filename in ['mod_loader.js']:
            src = os.path.join(root, filename)
            if os.path.exists(src):
                dst = os.path.join(LUATOOLS_DIR, 'public', filename)
                shutil.copy2(src, dst)
                print(f'[ModLoader-Update] Updated {filename}')
        
        for filename in ['mod_loader.py', 'mod_auto_update.py']:
            src = os.path.join(root, filename)
            if os.path.exists(src):
                dst = os.path.join(LUATOOLS_DIR, 'backend', filename)
                shutil.copy2(src, dst)
                print(f'[ModLoader-Update] Updated {filename}')
        
        _save_version(latest)
        
        # Cleanup
        shutil.rmtree(temp_dir, ignore_errors=True)
        
        return json.dumps({'success': True, 'version': latest})
    
    except Exception as e:
        print(f'[ModLoader-Update] Update failed: {e}')
        return json.dumps({'success': False, 'error': str(e)})


def check_mod_updates():
    """Check each installed mod for updates if they have a 'repository' field in manifest"""
    results = []
    
    if not os.path.exists(MODS_DIR):
        return json.dumps(results)
    
    for entry in os.listdir(MODS_DIR):
        manifest_path = os.path.join(MODS_DIR, entry, 'manifest.json')
        if not os.path.exists(manifest_path):
            continue
        
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest = json.load(f)
            
            repo = manifest.get('repository')
            if not repo:
                continue
            
            # Extract owner/repo from GitHub URL
            repo_path = repo.replace('https://github.com/', '').rstrip('/')
            
            # Check latest release
            release_data = _github_get(f'{GITHUB_API}/repos/{repo_path}/releases/latest')
            if not release_data:
                continue
            
            remote_version = release_data.get('tag_name', '0.0.0')
            local_version = manifest.get('version', '0.0.0')
            
            if _version_tuple(remote_version) > _version_tuple(local_version):
                results.append({
                    'modId': manifest.get('id', entry),
                    'modName': manifest.get('name', entry),
                    'currentVersion': local_version,
                    'latestVersion': remote_version,
                    'repository': repo
                })
        except (json.JSONDecodeError, IOError):
            continue
    
    return json.dumps(results)
