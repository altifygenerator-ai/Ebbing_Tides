param(
    [switch]$RunBuild
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Get-Location).Path
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$payloadMap = Join-Path $scriptRoot '_atlas12k_payload\public\art\maps\world_atlas_labeled_v06d_detail_master_12k.jpg'
$mapDestination = Join-Path $repoRoot 'public\art\maps\world_atlas_labeled_v06d_detail_master_12k.jpg'
$assetsPath = Join-Path $repoRoot 'src\data\seed\assets.ts'
$cameraPath = Join-Path $repoRoot 'src\game\navigationCamera.ts'

Write-Host 'Ebbing Tides — 12K Detail Atlas Integration' -ForegroundColor Cyan
Write-Host "Repo root: $repoRoot"

foreach ($required in @($payloadMap, $assetsPath, $cameraPath)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Required file not found: $required`nExtract this package into the Ebbing_Tides repository root, then run the installer there."
    }
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = Join-Path $repoRoot ".atlas-12k-detail-backup-$stamp"
New-Item -ItemType Directory -Force -Path (Join-Path $backupDir 'src\data\seed') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $backupDir 'src\game') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $backupDir 'public\art\maps') | Out-Null
Copy-Item -LiteralPath $assetsPath -Destination (Join-Path $backupDir 'src\data\seed\assets.ts')
Copy-Item -LiteralPath $cameraPath -Destination (Join-Path $backupDir 'src\game\navigationCamera.ts')

$hadRuntimeMap = Test-Path -LiteralPath $mapDestination
if ($hadRuntimeMap) {
    Copy-Item -LiteralPath $mapDestination -Destination (Join-Path $backupDir 'public\art\maps\world_atlas_labeled_v06d_detail_master_12k.jpg')
}
@{
    hadRuntimeMap = $hadRuntimeMap
    createdAt = (Get-Date).ToString('o')
} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $backupDir 'backup_manifest.json') -Encoding UTF8

# Patch ONLY the registered Alpha 0.6D atlas object. Gameplay/world coordinates remain 120x80.
$assets = Get-Content -LiteralPath $assetsPath -Raw
$atlasPattern = '(?ms)^  \{\r?\n    "assetId": "map\.world_atlas\.labeled_v06d",.*?^  \}(?=,\r?\n  \{)'
$atlasMatch = [regex]::Match($assets, $atlasPattern)
if (-not $atlasMatch.Success) {
    throw 'Could not locate the map.world_atlas.labeled_v06d registry object in src/data/seed/assets.ts. No registry changes were written.'
}

$atlasBlock = $atlasMatch.Value
$replacements = [ordered]@{
    '"displayName":\s*"[^"]*"' = '"displayName": "Labeled World Atlas — Alpha 0.6D 12K Detail Navigation Master"'
    '"artStyleVersion":\s*"[^"]*"' = '"artStyleVersion": "NAV_MAP_LABELED_0.6D_DETAIL_12K"'
    '"path":\s*"[^"]*"' = '"path": "/art/maps/world_atlas_labeled_v06d_detail_master_12k.jpg"'
    '"sourceMaster":\s*"[^"]*"' = '"sourceMaster": "ComfyUI_00002_.png"'
    '"notes":\s*"[^"]*"' = '"notes": "User-approved ComfyUI 2x detail enhancement of the canonical labeled atlas. Runtime art is 12000x8000 and remains registered to the locked 120x80 world grid; terrain/passability remains authoritative in WORLD_TERRAIN_MASK_V06D_LABELED. The original 6000x4000 atlas remains in the repository as a fallback. Runtime JPEG is a visually near-lossless q98 4:4:4 derivative of the lossless 12K source."'
    '"nativePixelWidth":\s*\d+' = '"nativePixelWidth": 12000'
    '"nativePixelHeight":\s*\d+' = '"nativePixelHeight": 8000'
}

foreach ($entry in $replacements.GetEnumerator()) {
    $count = [regex]::Matches($atlasBlock, $entry.Key).Count
    if ($count -ne 1) {
        throw "Expected exactly one atlas metadata match for pattern '$($entry.Key)', found $count. No registry changes were written."
    }
    $atlasBlock = [regex]::Replace($atlasBlock, $entry.Key, $entry.Value, 1)
}

$assets = $assets.Substring(0, $atlasMatch.Index) + $atlasBlock + $assets.Substring($atlasMatch.Index + $atlasMatch.Length)

# Restore the close camera that was temporarily capped while the old 6K art was the limiting factor.
$camera = Get-Content -LiteralPath $cameraPath -Raw
if ($camera -match 'minViewWidth:\s*24,') {
    $camera = [regex]::Replace($camera, 'minViewWidth:\s*24,', 'minViewWidth: 12,', 1)
} elseif ($camera -notmatch 'minViewWidth:\s*12,') {
    throw 'navigationCamera.ts has an unexpected minViewWidth. Refusing to guess.'
}
if ($camera -match 'defaultViewWidth:\s*30,') {
    $camera = [regex]::Replace($camera, 'defaultViewWidth:\s*30,', 'defaultViewWidth: 18,', 1)
} elseif ($camera -notmatch 'defaultViewWidth:\s*18,') {
    throw 'navigationCamera.ts has an unexpected defaultViewWidth. Refusing to guess.'
}

# Write only after every validation above succeeds.
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $mapDestination) | Out-Null
Copy-Item -LiteralPath $payloadMap -Destination $mapDestination -Force
Set-Content -LiteralPath $assetsPath -Value $assets -Encoding UTF8 -NoNewline
Set-Content -LiteralPath $cameraPath -Value $camera -Encoding UTF8 -NoNewline

# Final verification.
$verifyAssets = Get-Content -LiteralPath $assetsPath -Raw
$verifyCamera = Get-Content -LiteralPath $cameraPath -Raw
if ($verifyAssets -notmatch '/art/maps/world_atlas_labeled_v06d_detail_master_12k\.jpg' -or
    $verifyAssets -notmatch '"nativePixelWidth": 12000' -or
    $verifyAssets -notmatch '"nativePixelHeight": 8000') {
    throw 'Atlas registry verification failed after write. Use ROLLBACK_12K_DETAIL_ATLAS.ps1.'
}
if ($verifyCamera -notmatch 'minViewWidth:\s*12,' -or $verifyCamera -notmatch 'defaultViewWidth:\s*18,') {
    throw 'Camera verification failed after write. Use ROLLBACK_12K_DETAIL_ATLAS.ps1.'
}

Write-Host ''
Write-Host '12K atlas integrated successfully.' -ForegroundColor Green
Write-Host '  Visual master: 12000x8000 q98 4:4:4 JPEG'
Write-Host '  Logical world: unchanged 120x80 grid'
Write-Host '  Terrain/passability/ports/routes: untouched'
Write-Host '  Close zoom restored: 12-cell minimum; 18-cell default'
Write-Host "  Backup: $backupDir"
Write-Host '  Original 6000x4000 .webp remains untouched.'

# The 55 MB payload has been copied into the game; remove the temporary extracted payload so it cannot be accidentally committed too.
$payloadRoot = Join-Path $scriptRoot '_atlas12k_payload'
if (Test-Path -LiteralPath $payloadRoot) { Remove-Item -LiteralPath $payloadRoot -Recurse -Force }

if ($RunBuild) {
    Write-Host ''
    Write-Host 'Running npm build...' -ForegroundColor Cyan
    & npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed with exit code $LASTEXITCODE" }
}
