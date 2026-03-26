<#
.SYNOPSIS
    One-liner installer for Kite CLI
.DESCRIPTION
    Run: irm https://raw.githubusercontent.com/nitaybl/kite/main/install.ps1 | iex
#>

$ErrorActionPreference = "Stop"
Write-Host ""
Write-Host "  Installing Kite CLI..." -ForegroundColor Cyan
Write-Host ""

$installDir = Join-Path $env:LOCALAPPDATA "KiteLoader"
$scriptPath = Join-Path $installDir "kiteloader.ps1"

# Create install directory
if (!(Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# Download the CLI script
$url = "https://raw.githubusercontent.com/nitaybl/kite/main/kiteloader.ps1"
Write-Host "  Downloading CLI from GitHub..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $url -OutFile $scriptPath -UseBasicParsing
Write-Host "  [+] CLI downloaded to: $scriptPath" -ForegroundColor Green

# Create a batch wrapper so 'kiteloader' works from anywhere
$batPath = Join-Path $installDir "kiteloader.cmd"
$batContent = "@echo off`npowershell -ExecutionPolicy Bypass -File `"$scriptPath`" %*"
Set-Content -Path $batPath -Value $batContent -Encoding ASCII

# Add to PATH if not already there
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$installDir*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$installDir", "User")
    Write-Host "  [+] Added to PATH. Restart your terminal to use 'kiteloader' globally." -ForegroundColor Green
} else {
    Write-Host "  [*] Already in PATH." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "  Installation complete!" -ForegroundColor Green
Write-Host "  Usage: kiteloader help" -ForegroundColor Cyan
Write-Host "  First run: kiteloader install  (installs the mod loader onto LuaTools)" -ForegroundColor DarkGray
Write-Host ""
