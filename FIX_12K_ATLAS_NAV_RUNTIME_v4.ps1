$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Get-Location).Path
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$payloadMap = Join-Path $scriptRoot '_atlas12k_nav_payload\public\art\maps\world_atlas_labeled_v06d_detail_master_12k.jpg'
$runtimeMap = Join-Path $repoRoot 'public\art\maps\world_atlas_labeled_v06d_detail_master_12k.jpg'
$srcAssets = Join-Path $repoRoot 'src\data\seed\assets.ts'
$jsAssets = Join-Path $repoRoot 'public\alpha\js\data\seed\assets.js'
$srcCamera = Join-Path $repoRoot 'src\game\navigationCamera.ts'
$jsCamera = Join-Path $repoRoot 'public\alpha\js\game\navigationCamera.js'

Write-Host 'Ebbing Tides - 12K Atlas REAL Navigation Runtime Fix v4' -ForegroundColor Cyan
Write-Host "Repo root: $repoRoot"
Write-Host ''
Write-Host 'This fixes the actual Alpha navigation runtime, not the Next/demo viewer.' -ForegroundColor Yellow

foreach ($required in @($payloadMap,$srcAssets,$jsAssets,$srcCamera,$jsCamera)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "Required file not found: $required"
    }
}

$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDir = Join-Path $repoRoot ".atlas-12k-nav-runtime-backup-$stamp"
New-Item -ItemType Directory -Force -Path (Join-Path $backupDir 'src\data\seed') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $backupDir 'src\game') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $backupDir 'public\alpha\js\data\seed') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $backupDir 'public\alpha\js\game') | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $backupDir 'public\art\maps') | Out-Null

Copy-Item -LiteralPath $srcAssets -Destination (Join-Path $backupDir 'src\data\seed\assets.ts')
Copy-Item -LiteralPath $jsAssets -Destination (Join-Path $backupDir 'public\alpha\js\data\seed\assets.js')
Copy-Item -LiteralPath $srcCamera -Destination (Join-Path $backupDir 'src\game\navigationCamera.ts')
Copy-Item -LiteralPath $jsCamera -Destination (Join-Path $backupDir 'public\alpha\js\game\navigationCamera.js')
if (Test-Path -LiteralPath $runtimeMap) {
    Copy-Item -LiteralPath $runtimeMap -Destination (Join-Path $backupDir 'public\art\maps\world_atlas_labeled_v06d_detail_master_12k.jpg')
}

function Read-Text([string]$Path) {
    return [System.IO.File]::ReadAllText($Path)
}
function Write-NoBom([string]$Path,[string]$Text) {
    [System.IO.File]::WriteAllText($Path,$Text,$utf8NoBom)
}
function Patch-Atlas-Path([string]$Text,[string]$Label) {
    $assetAnchor = '"assetId": "map.world_atlas.labeled_v06d"'
    $idx = $Text.IndexOf($assetAnchor)
    if ($idx -lt 0) { throw "$Label: map.world_atlas.labeled_v06d not found" }
    $windowLen = [Math]::Min(3500, $Text.Length - $idx)
    $window = $Text.Substring($idx,$windowLen)
    $pathPattern = '"path"\s*:\s*"[^"]+"'
    $m = [regex]::Match($window,$pathPattern)
    if (-not $m.Success) { throw "$Label: atlas path field not found near asset anchor" }
    $absoluteMatchIndex = $idx + $m.Index
    $replacement = '"path": "/art/maps/world_atlas_labeled_v06d_detail_master_12k.jpg"'
    return $Text.Substring(0,$absoluteMatchIndex) + $replacement + $Text.Substring($absoluteMatchIndex + $m.Length)
}
function Patch-Camera([string]$Text,[string]$Label) {
    if ($Text -match 'minViewWidth:\s*24,') {
        $Text = [regex]::Replace($Text,'minViewWidth:\s*24,','minViewWidth: 12,',1)
    } elseif ($Text -notmatch 'minViewWidth:\s*12,') {
        throw "$Label: unexpected minViewWidth"
    }
    if ($Text -match 'defaultViewWidth:\s*30,') {
        $Text = [regex]::Replace($Text,'defaultViewWidth:\s*30,','defaultViewWidth: 18,',1)
    } elseif ($Text -notmatch 'defaultViewWidth:\s*18,') {
        throw "$Label: unexpected defaultViewWidth"
    }
    return $Text
}

# Copy the actual user-approved ComfyUI-derived 12K runtime painting.
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $runtimeMap) | Out-Null
Copy-Item -LiteralPath $payloadMap -Destination $runtimeMap -Force

# Patch BOTH authoring source AND the already-compiled browser runtime.
$srcAssetsText = Patch-Atlas-Path (Read-Text $srcAssets) 'src/data/seed/assets.ts'
$jsAssetsText = Patch-Atlas-Path (Read-Text $jsAssets) 'public/alpha/js/data/seed/assets.js'
$srcCameraText = Patch-Camera (Read-Text $srcCamera) 'src/game/navigationCamera.ts'
$jsCameraText = Patch-Camera (Read-Text $jsCamera) 'public/alpha/js/game/navigationCamera.js'

Write-NoBom $srcAssets $srcAssetsText
Write-NoBom $jsAssets $jsAssetsText
Write-NoBom $srcCamera $srcCameraText
Write-NoBom $jsCamera $jsCameraText

# Verify the REAL browser runtime files, not only src/.
$verifyJsAssets = Read-Text $jsAssets
$verifyJsCamera = Read-Text $jsCamera
if ($verifyJsAssets -notmatch '/art/maps/world_atlas_labeled_v06d_detail_master_12k\.jpg') {
    throw 'Runtime asset registry still does not point to the 12K atlas.'
}
if ($verifyJsAssets -match '/art/maps/world_atlas_labeled_v06d_master\.webp') {
    $atlasIdx = $verifyJsAssets.IndexOf('"assetId": "map.world_atlas.labeled_v06d"')
    $atlasWindow = $verifyJsAssets.Substring($atlasIdx,[Math]::Min(3500,$verifyJsAssets.Length-$atlasIdx))
    if ($atlasWindow -match '/art/maps/world_atlas_labeled_v06d_master\.webp') {
        throw 'Old 6K atlas path is still present inside the active runtime atlas registry block.'
    }
}
if ($verifyJsCamera -notmatch 'minViewWidth:\s*12,' -or $verifyJsCamera -notmatch 'defaultViewWidth:\s*18,') {
    throw 'Compiled navigation camera did not receive the 12/18 close-zoom settings.'
}
if (-not (Test-Path -LiteralPath $runtimeMap)) {
    throw '12K runtime painting is missing after copy.'
}

# Syntax-check the actual ESM files loaded by the Alpha browser runtime.
& node --check $jsAssets
if ($LASTEXITCODE -ne 0) { throw 'Browser ESM syntax failed for compiled assets.js' }
& node --check $jsCamera
if ($LASTEXITCODE -ne 0) { throw 'Browser ESM syntax failed for compiled navigationCamera.js' }

Write-Host ''
Write-Host 'REAL NAVIGATION RUNTIME FIX APPLIED.' -ForegroundColor Green
Write-Host '  Runtime map file: public/art/maps/world_atlas_labeled_v06d_detail_master_12k.jpg'
Write-Host '  Alpha browser registry: public/alpha/js/data/seed/assets.js -> 12K atlas'
Write-Host '  Alpha browser camera: public/alpha/js/game/navigationCamera.js -> 12 min / 18 default'
Write-Host '  Source TS mirrors the same settings.'
Write-Host '  World/grid/ports/POIs/passability/routes were NOT changed.'
Write-Host "  Backup: $backupDir"
Write-Host ''
Write-Host 'IMPORTANT: hard-refresh the game after this (Ctrl+F5).' -ForegroundColor Yellow
Write-Host 'Do NOT run npm build for this fix. The Alpha navigation runtime uses public/alpha/js.' -ForegroundColor Yellow

# Remove extracted temporary payload after successful installation.
$payloadRoot = Join-Path $scriptRoot '_atlas12k_nav_payload'
if (Test-Path -LiteralPath $payloadRoot) { Remove-Item -LiteralPath $payloadRoot -Recurse -Force }
