<#
.SYNOPSIS
    Kite - PowerShell CLI
.DESCRIPTION
    Install, manage, and update LuaTools mods from the command line.
    Usage: luatools <command> [arguments]
#>

param(
    [Parameter(Position=0)]
    [string]$Command,
    [Parameter(Position=1)]
    [string]$Arg1,
    [Parameter(Position=2)]
    [string]$Arg2
)

$ErrorActionPreference = "Stop"

# ============================================
# CONFIGURATION
# ============================================
$LUATOOLS_DIR = "C:\Program Files (x86)\Steam\plugins\luatools"
$MODS_DIR = Join-Path $LUATOOLS_DIR "mods"
$CONFIG_FILE = Join-Path $MODS_DIR "mods_config.json"
$MODLOADER_REPO = "nitaybl/kite"
$FIXES_REPO = "nitaybl/luatools-fixes"
$VERSION = "1.0.0"

# ============================================
# HELPERS
# ============================================
function Write-Cyan($text) { Write-Host $text -ForegroundColor Cyan }
function Write-Purple($text) { Write-Host $text -ForegroundColor Magenta }
function Write-Success($text) { Write-Host "[+] $text" -ForegroundColor Green }
function Write-Fail($text) { Write-Host "[-] $text" -ForegroundColor Red }
function Write-Info($text) { Write-Host "[*] $text" -ForegroundColor Yellow }

function Show-Banner {
    Write-Cyan @"

  _                _____           _     
 | |   _   _  __ |_   _|__   ___ | |___ 
 | |  | | | |/ _`  | |/ _ \ / _ \| / __|
 | |__| |_| | (_|  | | (_) | (_) | \__ \
 |_____\__,_|\__,| |_|\___/ \___/|_|___/
                                          
"@
    Write-Purple "  MOD LOADER CLI v$VERSION"
    Write-Host ""
}

function Ensure-ModsDir {
    if (!(Test-Path $MODS_DIR)) {
        New-Item -ItemType Directory -Path $MODS_DIR -Force | Out-Null
    }
}

function Get-ModConfig {
    if (Test-Path $CONFIG_FILE) {
        return Get-Content $CONFIG_FILE -Raw | ConvertFrom-Json
    }
    return @{}
}

function Save-ModConfig($config) {
    Ensure-ModsDir
    $config | ConvertTo-Json -Depth 5 | Set-Content $CONFIG_FILE -Encoding UTF8
}

function Get-InstalledMods {
    Ensure-ModsDir
    $mods = @()
    
    # Folder mods
    Get-ChildItem $MODS_DIR -Directory | ForEach-Object {
        $manifest = Join-Path $_.FullName "manifest.json"
        if (Test-Path $manifest) {
            $data = Get-Content $manifest -Raw | ConvertFrom-Json
            $mods += [PSCustomObject]@{
                Id = $data.id
                Name = $data.name
                Version = $data.version
                Author = $data.author
                Type = "folder"
                Path = $_.FullName
            }
        }
    }
    
    # Single-file mods
    Get-ChildItem $MODS_DIR -Filter "*.js" | ForEach-Object {
        $mods += [PSCustomObject]@{
            Id = $_.BaseName
            Name = $_.BaseName
            Version = "?"
            Author = "?"
            Type = "single-file"
            Path = $_.FullName
        }
    }
    
    return $mods
}

# ============================================
# COMMANDS
# ============================================
function Install-Mod {
    param([string]$Source)
    
    if (!$Source) {
        Write-Fail "Usage: luatools mod install <github-url|local-path>"
        return
    }

    Ensure-ModsDir

    if ($Source -match "^https?://github\.com/") {
        # GitHub repo install
        $repoPath = $Source -replace "https?://github\.com/", "" -replace "\.git$", "" -replace "/$", ""
        $zipUrl = "https://github.com/$repoPath/archive/refs/heads/main.zip"
        $tempZip = Join-Path $env:TEMP "ltmod_download.zip"
        $tempDir = Join-Path $env:TEMP "ltmod_extract"

        Write-Info "Downloading from $zipUrl..."
        Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing

        if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
        Expand-Archive -Path $tempZip -DestinationPath $tempDir -Force

        # Find the manifest inside
        $extracted = Get-ChildItem $tempDir -Directory | Select-Object -First 1
        $manifest = Get-ChildItem $extracted.FullName -Filter "manifest.json" -Recurse | Select-Object -First 1
        
        if ($manifest) {
            $data = Get-Content $manifest.FullName -Raw | ConvertFrom-Json
            $destDir = Join-Path $MODS_DIR $data.id
            
            if (Test-Path $destDir) {
                Write-Info "Updating existing mod: $($data.name)"
                Remove-Item $destDir -Recurse -Force
            }
            
            Copy-Item $manifest.Directory.FullName $destDir -Recurse
            Write-Success "Installed '$($data.name)' v$($data.version) by $($data.author)"
        } else {
            Write-Fail "No manifest.json found in repository"
        }

        Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue

    } elseif (Test-Path $Source) {
        # Local install
        if ((Get-Item $Source).PSIsContainer) {
            $manifest = Join-Path $Source "manifest.json"
            if (Test-Path $manifest) {
                $data = Get-Content $manifest -Raw | ConvertFrom-Json
                $dest = Join-Path $MODS_DIR $data.id
                Copy-Item $Source $dest -Recurse -Force
                Write-Success "Installed '$($data.name)' from local path"
            } else {
                Write-Fail "No manifest.json found in $Source"
            }
        } elseif ($Source.EndsWith(".js")) {
            Copy-Item $Source $MODS_DIR -Force
            Write-Success "Installed single-file mod: $(Split-Path $Source -Leaf)"
        }
    } else {
        Write-Fail "Source not found: $Source"
    }
}

function Remove-Mod {
    param([string]$ModId)
    
    if (!$ModId) {
        Write-Fail "Usage: luatools mod remove <mod-id>"
        return
    }

    $modPath = Join-Path $MODS_DIR $ModId
    $singleFile = Join-Path $MODS_DIR "$ModId.js"

    if (Test-Path $modPath) {
        Remove-Item $modPath -Recurse -Force
        Write-Success "Removed mod: $ModId"
    } elseif (Test-Path $singleFile) {
        Remove-Item $singleFile -Force
        Write-Success "Removed single-file mod: $ModId"
    } else {
        Write-Fail "Mod '$ModId' not found"
    }
}

function Show-ModList {
    $mods = Get-InstalledMods
    if ($mods.Count -eq 0) {
        Write-Info "No mods installed. Use 'luatools mod install <source>' to add one."
        return
    }
    
    $config = Get-ModConfig
    
    Write-Cyan "`n  Installed Mods ($($mods.Count)):"
    Write-Host "  $('-' * 60)"
    foreach ($mod in $mods) {
        $enabled = if ($config.PSObject.Properties[$mod.Id]) { $config.($mod.Id) } else { $true }
        $status = if ($enabled) { "[ON]" } else { "[OFF]" }
        $statusColor = if ($enabled) { "Green" } else { "Red" }
        Write-Host "  " -NoNewline
        Write-Host $status -ForegroundColor $statusColor -NoNewline
        Write-Host " $($mod.Name) v$($mod.Version) " -NoNewline -ForegroundColor White
        Write-Host "by $($mod.Author) " -NoNewline -ForegroundColor DarkGray
        Write-Host "($($mod.Type))" -ForegroundColor DarkGray
    }
    Write-Host ""
}

function Toggle-Mod {
    param([string]$ModId, [bool]$Enabled)
    
    $config = Get-ModConfig
    # Convert to hashtable if it's a PSCustomObject
    $hash = @{}
    if ($config -is [PSCustomObject]) {
        $config.PSObject.Properties | ForEach-Object { $hash[$_.Name] = $_.Value }
    } else {
        $hash = $config
    }
    $hash[$ModId] = $Enabled
    Save-ModConfig $hash
    
    $state = if ($Enabled) { "enabled" } else { "disabled" }
    Write-Success "Mod '$ModId' $state. Restart Steam to apply."
}

function Apply-Fix {
    param([string]$AppId)
    Write-Info "Requesting fix for AppID: $AppId..."
    try {
        $body = @{ appid = [int]$AppId; gameName = "CLI-Request" } | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "https://8000-firebase-nitayv-1774433595291.cluster-iusnsmywp5clov45nv5gsxt5he.cloudworkstations.dev/api/request-fix" `
            -Method POST -Body $body -ContentType "application/json"
        
        if ($result.success) {
            Write-Success "Fix found! URL: $($result.downloadUrl)"
            Write-Success "Article: $($result.articleUrl)"
        } else {
            Write-Fail $result.message
        }
    } catch {
        Write-Fail "API request failed: $_"
    }
}

function Search-Mods {
    param([string]$Query)
    
    Write-Info "Searching mod registry..."
    try {
        $registryUrl = "https://raw.githubusercontent.com/$MODLOADER_REPO/main/mods.json"
        $registry = Invoke-RestMethod -Uri $registryUrl -UseBasicParsing
        $mods = $registry.mods
        
        if ($Query) {
            $q = $Query.ToLower()
            $mods = $mods | Where-Object {
                $_.name.ToLower().Contains($q) -or
                $_.id.ToLower().Contains($q) -or
                $_.description.ToLower().Contains($q) -or
                ($_.tags -join ',').ToLower().Contains($q)
            }
        }
        
        if ($mods.Count -eq 0) {
            Write-Info "No mods found$(if ($Query) { " matching '$Query'" })."
            return
        }
        
        $installed = (Get-InstalledMods).Id
        
        Write-Cyan "`n  Available Mods ($($mods.Count)):"
        Write-Host "  $('-' * 65)"
        foreach ($mod in $mods) {
            $status = if ($installed -contains $mod.id) { "[INSTALLED]" } else { "           " }
            $statusColor = if ($installed -contains $mod.id) { "Green" } else { "DarkGray" }
            Write-Host "  " -NoNewline
            Write-Host $status -ForegroundColor $statusColor -NoNewline
            Write-Host " $($mod.name)" -ForegroundColor White -NoNewline
            Write-Host " v$($mod.version)" -ForegroundColor DarkCyan -NoNewline
            Write-Host " by $($mod.author)" -ForegroundColor DarkGray
            Write-Host "              $($mod.description)" -ForegroundColor Gray
            if ($mod.tags) {
                $tagStr = ($mod.tags | ForEach-Object { "#$_" }) -join ' '
                Write-Host "              $tagStr" -ForegroundColor DarkMagenta
            }
            Write-Host ""
        }
    } catch {
        Write-Fail "Could not fetch mod registry: $_"
    }
}

function Show-ModInfo {
    param([string]$ModId)
    
    if (!$ModId) {
        Write-Fail "Usage: luatools mod info <mod-id>"
        return
    }
    
    # Check local first
    $modPath = Join-Path $MODS_DIR $ModId
    $manifest = Join-Path $modPath "manifest.json"
    if (Test-Path $manifest) {
        $data = Get-Content $manifest -Raw | ConvertFrom-Json
        Write-Cyan "`n  $($data.name) (installed)"
        Write-Host "  $('-' * 40)"
        Write-Host "  ID:           $($data.id)"
        Write-Host "  Version:      $($data.version)"
        Write-Host "  Author:       $($data.author)"
        Write-Host "  Description:  $($data.description)"
        if ($data.repository) { Write-Host "  Repository:   $($data.repository)" }
        if ($data.hooks) { Write-Host "  Hooks:        $($data.hooks -join ', ')" }
        if ($data.dependencies) { Write-Host "  Dependencies: $($data.dependencies -join ', ')" }
        Write-Host ""
    } else {
        Write-Fail "Mod '$ModId' not installed. Use 'luatools mod search' to find available mods."
    }
}

function Update-Mods {
    Write-Info "Checking for mod updates..."
    $mods = Get-InstalledMods
    $updatesFound = $false
    
    foreach ($mod in $mods) {
        $manifest = Join-Path $mod.Path "manifest.json"
        if (!(Test-Path $manifest)) { continue }
        $data = Get-Content $manifest -Raw | ConvertFrom-Json
        if (!$data.repository) { continue }
        
        $repoPath = $data.repository -replace "https?://github\.com/", "" -replace "/$", ""
        try {
            $release = Invoke-RestMethod -Uri "https://api.github.com/repos/$repoPath/releases/latest" -UseBasicParsing -Headers @{'User-Agent'='LuaTools-CLI'}
            $remoteVer = $release.tag_name -replace '^v', ''
            $localVer = $data.version
            if ($remoteVer -ne $localVer) {
                $updatesFound = $true
                Write-Host "  " -NoNewline
                Write-Host "[UPDATE] " -ForegroundColor Yellow -NoNewline
                Write-Host "$($data.name): v$localVer -> v$remoteVer" -ForegroundColor White
            }
        } catch { }
    }
    
    if (!$updatesFound) {
        Write-Success "All mods are up to date!"
    } else {
        Write-Host ""
        Write-Info "Use 'luatools mod install <repo-url>' to update a specific mod."
    }
}

function Show-Doctor {
    Write-Cyan "`n  LuaTools Doctor"
    Write-Host "  $('-' * 40)"
    
    # Check LuaTools installation
    $ltExists = Test-Path $LUATOOLS_DIR
    Write-Host "  LuaTools installed: " -NoNewline
    Write-Host $(if ($ltExists) { "YES" } else { "NO" }) -ForegroundColor $(if ($ltExists) { "Green" } else { "Red" })
    
    # Check mods directory
    $modsExists = Test-Path $MODS_DIR
    Write-Host "  Mods directory: " -NoNewline
    Write-Host $(if ($modsExists) { "YES" } else { "NO" }) -ForegroundColor $(if ($modsExists) { "Green" } else { "Red" })
    
    # Check mod loader files
    $loaderJs = Test-Path (Join-Path $LUATOOLS_DIR "public\mod_loader.js")
    Write-Host "  Mod Loader (JS): " -NoNewline
    Write-Host $(if ($loaderJs) { "YES" } else { "NO" }) -ForegroundColor $(if ($loaderJs) { "Green" } else { "Red" })
    
    $loaderPy = Test-Path (Join-Path $LUATOOLS_DIR "backend\mod_loader.py")
    Write-Host "  Mod Loader (Backend): " -NoNewline
    Write-Host $(if ($loaderPy) { "YES" } else { "NO" }) -ForegroundColor $(if ($loaderPy) { "Green" } else { "Red" })
    
    # Count mods
    if ($modsExists) {
        $modCount = (Get-InstalledMods).Count
        Write-Host "  Installed mods: $modCount"
    }
    
    # Check 7-Zip
    $sevenZ = Test-Path "C:\Program Files\7-Zip\7z.exe"
    Write-Host "  7-Zip: " -NoNewline
    Write-Host $(if ($sevenZ) { "YES" } else { "NO" }) -ForegroundColor $(if ($sevenZ) { "Green" } else { "Red" })
    
    Write-Host ""
}

function Install-ModLoader {
    Write-Info "Installing Kite..."
    
    if (!(Test-Path $LUATOOLS_DIR)) {
        Write-Fail "LuaTools not found at $LUATOOLS_DIR. Install LuaTools first!"
        return
    }

    # Use current directory as source for local installation
    $sourceDir = $PSScriptRoot
    if (!(Test-Path $sourceDir)) {
        Write-Fail "Source directory not found: $sourceDir"
        return
    }
    
    # Copy plugin.json to root
    $jsonSource = Join-Path $sourceDir "plugin.json"
    if (Test-Path $jsonSource) {
        Copy-Item $jsonSource $LUATOOLS_DIR -Force
        Write-Success "Installed plugin.json"
        
        # Force correct backend path if it's somehow wrong
        $json = Get-Content (Join-Path $LUATOOLS_DIR "plugin.json") -Raw | ConvertFrom-Json
        if ($json.backend -ne "backend") {
            $json.backend = "backend"
            $json | ConvertTo-Json | Set-Content (Join-Path $LUATOOLS_DIR "plugin.json") -Encoding UTF8
            Write-Success "Fixed backend path in plugin.json"
        }
    }

    # Copy mod_loader.js to .millennium/Dist/index.js for Millennium 2.35.0 compliance
    $jsSource = Join-Path $sourceDir "mod_loader.js"
    if (Test-Path $jsSource) {
        $distDir = Join-Path $LUATOOLS_DIR ".millennium\Dist"
        if (!(Test-Path $distDir)) { New-Item -ItemType Directory -Path $distDir -Force | Out-Null }
        Copy-Item $jsSource (Join-Path $distDir "index.js") -Force
        Write-Success "Installed mod_loader.js to Millennium Dist"
    }
    
    # Copy mod_loader.py to backend/main.py
    $pySource = Join-Path $sourceDir "mod_loader.py"
    if (Test-Path $pySource) {
        $backendDir = Join-Path $LUATOOLS_DIR "backend"
        if (!(Test-Path $backendDir)) { New-Item -ItemType Directory -Path $backendDir -Force | Out-Null }
        Copy-Item $pySource (Join-Path $backendDir "main.py") -Force
        Write-Success "Installed backend/main.py"
    }
    
    # Create mods/ dir with example mods
    Ensure-ModsDir
    $modsSource = Join-Path $sourceDir "mods"
    if (Test-Path $modsSource) {
        Copy-Item "$modsSource\*" $MODS_DIR -Recurse -Force
        Write-Success "Installed example mods"
    }
    
    # Auto-enable in Millennium config.json
    $millenniumConfig = "C:\Program Files (x86)\Steam\ext\config.json"
    if (Test-Path $millenniumConfig) {
        try {
            $config = Get-Content $millenniumConfig -Raw | ConvertFrom-Json
            if ($config.plugins.enabledPlugins -notcontains "luatools") {
                $config.plugins.enabledPlugins += "luatools"
                # Remove redundant depth and fix serialization
                $config | ConvertTo-Json -Depth 10 | Set-Content $millenniumConfig -Encoding UTF8
                Write-Success "Auto-enabled kiteloader (luatools identifier) in Millennium config"
            }
        } catch {
            Write-Fail "Failed to auto-enable plugin: $_"
        }
    }
    
    # Cleanup
    Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
    Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Success "Mod Loader installed! Restart Steam to activate."
    Write-Info "Mods directory: $MODS_DIR"
}

function Uninstall-ModLoader {
    Write-Info "Removing Kite..."
    
    $jsFile = Join-Path $LUATOOLS_DIR "public\mod_loader.js"
    $pyFile = Join-Path $LUATOOLS_DIR "backend\mod_loader.py"
    
    if (Test-Path $jsFile) { Remove-Item $jsFile -Force; Write-Success "Removed mod_loader.js" }
    if (Test-Path $pyFile) { Remove-Item $pyFile -Force; Write-Success "Removed mod_loader.py" }
    
    $removeMods = Read-Host "Remove all installed mods too? (y/N)"
    if ($removeMods -eq 'y') {
        if (Test-Path $MODS_DIR) { Remove-Item $MODS_DIR -Recurse -Force; Write-Success "Removed mods/ directory" }
    }
    
    Write-Success "Mod Loader uninstalled. Core LuaTools is untouched."
}

function Show-Help {
    Show-Banner
    Write-Host "  USAGE:" -ForegroundColor White
    Write-Host "    luatools <command> [arguments]" -ForegroundColor DarkGray
    Write-Host ""
    Write-Cyan "  MODLOADER:"
    Write-Host "    install                    Install the mod loader onto LuaTools"
    Write-Host "    uninstall                  Remove the mod loader (keeps LuaTools)"
    Write-Host ""
    Write-Cyan "  MODS:"
    Write-Host "    mod install <url|path>     Install a mod from GitHub or local path"
    Write-Host "    mod remove <mod-id>        Uninstall a mod"
    Write-Host "    mod list                   List all installed mods"
    Write-Host "    mod search [query]         Search the community mod registry"
    Write-Host "    mod info <mod-id>          Show detailed info about a mod"
    Write-Host "    mod update                 Check all mods for updates"
    Write-Host "    mod enable <mod-id>        Enable a mod"
    Write-Host "    mod disable <mod-id>       Disable a mod"
    Write-Host ""
    Write-Cyan "  FIXES:"
    Write-Host "    fix apply <appid>          Request auto-fix for a game"
    Write-Host ""
    Write-Cyan "  UTILITY:"
    Write-Host "    doctor                     Diagnose common issues"
    Write-Host "    version                    Show version info"
    Write-Host "    help                       Show this help message"
    Write-Host ""
}

# ============================================
# MAIN ROUTER
# ============================================
switch ($Command) {
    "install"   { Install-ModLoader }
    "uninstall" { Uninstall-ModLoader }
    "mod" {
        switch ($Arg1) {
            "install" { Install-Mod -Source $Arg2 }
            "remove"  { Remove-Mod -ModId $Arg2 }
            "list"    { Show-ModList }
            "search"  { Search-Mods -Query $Arg2 }
            "info"    { Show-ModInfo -ModId $Arg2 }
            "update"  { Update-Mods }
            "enable"  { Toggle-Mod -ModId $Arg2 -Enabled $true }
            "disable" { Toggle-Mod -ModId $Arg2 -Enabled $false }
            default   { Write-Fail "Unknown mod command. Use: install, remove, list, search, info, update, enable, disable" }
        }
    }
    "fix" {
        switch ($Arg1) {
            "apply"  { Apply-Fix -AppId $Arg2 }
            default  { Write-Fail "Unknown fix command. Use: apply" }
        }
    }
    "doctor"  { Show-Doctor }
    "version" { Show-Banner; Write-Host "  v$VERSION" }
    "help"    { Show-Help }
    default   { Show-Help }
}
