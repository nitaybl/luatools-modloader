# Fix API

The LuaTools Auto-Fix system automatically scrapes, downloads, and applies game repair archives. This page documents how it works and how to add custom fix sources.

## Architecture

```
User clicks "Request Auto-Fix" in Steam
  ↓
Frontend sends POST to cloud API
  ↓
Cloud API searches online-fix.me
  ↓
Crawls the open FTP directory for Fix Repair archives
  ↓
Returns a proxy download URL
  ↓
Local LuaTools downloads via proxy → extracts with 7-Zip → replaces game files
```

## Endpoints

### `POST /api/request-fix`

Request a fix for a game.

**Request Body:**
```json
{
    "appid": 246620,
    "gameName": "Plague Inc: Evolved"
}
```

**Response (success):**
```json
{
    "success": true,
    "message": "Successfully scraped Plague Inc Evolved!",
    "downloadUrl": "https://.../api/proxy?url=...&referer=...",
    "articleUrl": "https://online-fix.me/games/..."
}
```

**Response (not found):**
```json
{
    "success": false,
    "message": "Game 'PEAK' not found on online-fix.me database.",
    "downloadUrl": null
}
```

### `GET/HEAD /api/proxy?url=...&referer=...`

Streams an authenticated download through the API server. Injects the correct `Referer` header to bypass CDN hotlink protection.

**Security:** This endpoint only proxies URLs from `uploads.online-fix.me`. All other domains are blocked (SSRF protection).

## Search Matching

The API uses fuzzy matching to find games:

1. **Normalize** both the search query and article titles:
   - Convert to lowercase
   - Strip Russian suffixes (`по сети`, `by online-fix.me`)
   - Remove all punctuation
   - Collapse whitespace
2. **Exact match** first — normalized query equals normalized title
3. **Containment match** fallback — query is contained within title or vice versa

This means `Plague Inc: Evolved` matches `Plague Inc Evolved по сети`.

## Adding Custom Fix Sources

To extend the fix system for your own sources, you can create a mod that adds a new fix button:

```js
LuaToolsMods.registerMod({
    id: 'my-fix-source',
    onOverlayOpen: function(data) {
        var btn = document.createElement('button');
        btn.textContent = 'My Custom Fix Source';
        btn.addEventListener('click', function() {
            // Hit your own API or download directly
            fetch('https://my-api.com/fix/' + data.appid)
                .then(function(r) { return r.json(); })
                .then(function(fixData) {
                    // Apply fix via Millennium backend
                    Millennium.callServerMethod('luatools', 'ApplyGameFix', {
                        appid: data.appid,
                        fixType: 'MySource',
                        downloadUrl: fixData.url
                    });
                });
        });
        data.overlay.appendChild(btn);
    }
});
```

## File Extraction

The local plugin extracts downloaded archives using 7-Zip:

| Archive Type | Detection | Password |
|---|---|---|
| `.rar` | Checks for `.rar` anywhere in the URL string | `online-fix.me` |
| `.7z` | Checks for `.7z` anywhere in the URL string | `online-fix.me` |
| `.zip` | Default fallback | None |

Extraction command:
```
"C:\Program Files\7-Zip\7z.exe" x <archive> -ponline-fix.me -o<game_dir> -y
```
