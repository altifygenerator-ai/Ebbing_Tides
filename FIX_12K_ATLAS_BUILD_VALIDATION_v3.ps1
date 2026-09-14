$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Get-Location).Path
$tsconfigPath = Join-Path $repoRoot 'tsconfig.json'
$atlasPath = Join-Path $repoRoot 'public\art\maps\world_atlas_labeled_v06d_detail_master_12k.jpg'
$assetsPath = Join-Path $repoRoot 'src\data\seed\assets.ts'
$cameraPath = Join-Path $repoRoot 'src\game\navigationCamera.ts'

Write-Host 'Ebbing Tides - 12K Atlas Build Validation Fix v3' -ForegroundColor Cyan
Write-Host "Repo root: $repoRoot"

if (-not (Test-Path -LiteralPath $tsconfigPath)) {
    throw "tsconfig.json not found at $tsconfigPath. Run this from the Ebbing_Tides repository root."
}

# The atlas installer completed before its build-validation step failed.
# This script does not reinstall or modify atlas/gameplay files.
if (Test-Path -LiteralPath $atlasPath) {
    Write-Host '12K atlas runtime image is present.' -ForegroundColor Green
} else {
    Write-Warning '12K atlas runtime image was not found. This script only repairs build validation.'
}

if (Test-Path -LiteralPath $assetsPath) {
    $assets = Get-Content -LiteralPath $assetsPath -Raw
    if ($assets -match '/art/maps/world_atlas_labeled_v06d_detail_master_12k\.jpg') {
        Write-Host 'Atlas registry points to the 12K detail master.' -ForegroundColor Green
    } else {
        Write-Warning 'Atlas registry does not appear to point to the 12K detail master.'
    }
}

if (Test-Path -LiteralPath $cameraPath) {
    $camera = Get-Content -LiteralPath $cameraPath -Raw
    if ($camera -match 'minViewWidth:\s*12,' -and $camera -match 'defaultViewWidth:\s*18,') {
        Write-Host 'Navigation close-zoom settings are present (12 min / 18 default).' -ForegroundColor Green
    } else {
        Write-Warning 'Expected 12K atlas close-zoom settings were not detected.'
    }
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupPath = Join-Path $repoRoot "tsconfig.pre-atlas-build-fix-v3-$stamp.json"
Copy-Item -LiteralPath $tsconfigPath -Destination $backupPath -Force

# Read using PowerShell's BOM-aware reader, then parse.
$raw = Get-Content -LiteralPath $tsconfigPath -Raw
$ts = $raw | ConvertFrom-Json

# Root tsconfig includes **/*.ts / **/*.tsx. Handoff snapshots under dist are not
# live source and must not participate in Next/TypeScript validation.
$exclude = @()
if ($null -ne $ts.exclude) { $exclude = @($ts.exclude) }

foreach ($entry in @('node_modules', 'public/alpha/js', 'dist', '.atlas-12k-detail-backup-*')) {
    if ($exclude -notcontains $entry) { $exclude += $entry }
}
$ts.exclude = $exclude

$json = $ts | ConvertTo-Json -Depth 100

# IMPORTANT: Windows PowerShell 5.1's `Set-Content -Encoding UTF8` writes a UTF-8
# BOM. Turbopack's tsconfig parser in this setup rejects that BOM at byte 1.
# Write explicit UTF-8 WITHOUT BOM instead.
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($tsconfigPath, $json + [Environment]::NewLine, $utf8NoBom)

Write-Host ''
Write-Host 'Rewrote tsconfig.json as UTF-8 without BOM.' -ForegroundColor Green
Write-Host 'Updated tsconfig excludes:' -ForegroundColor Green
$exclude | ForEach-Object { Write-Host "  - $_" }
Write-Host "Backup: $backupPath"

# Verify the exact file that Turbopack will read is valid JSON before building.
Write-Host ''
Write-Host 'Validating tsconfig.json with Node...' -ForegroundColor Cyan
& node -e "const fs=require('fs'); JSON.parse(fs.readFileSync('tsconfig.json','utf8')); console.log('tsconfig JSON parse passed');"
if ($LASTEXITCODE -ne 0) {
    throw "Node could not parse tsconfig.json after UTF-8-no-BOM rewrite."
}

Write-Host ''
Write-Host 'Running npm build...' -ForegroundColor Cyan
& npm run build
if ($LASTEXITCODE -ne 0) {
    throw "npm run build failed with exit code $LASTEXITCODE. The UTF-8/BOM problem and dist/handoff inclusion are repaired; review the remaining build output."
}

Write-Host ''
Write-Host 'Build passed.' -ForegroundColor Green
Write-Host '12K atlas integration remains installed. No map geometry, terrain, ports, routes, travel, combat, save, economy, or gameplay mechanics were changed by this validation fix.'
