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

Write-Host 'Ebbing Tides - 12K Atlas REAL Navigation Runtime Fix v5' -ForegroundColor Cyan
Write-Host "Repo root: $repoRoot"
Write-Host ''
Write-Host 'Patches the actual Alpha browser runtime plus matching TS source.' -ForegroundColor Yellow

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
function Get-Atlas-Window([string]$Text,[string]$Label) {
    $anchorMatch = [regex]::Match($Text, '"assetId"\s*:\s*"map\.world_atlas\.labeled_v06d"')
    if (-not $anchorMatch.Success) {
        throw "${Label}: map.world_atlas.labeled_v06d not found"
    }
    $idx = $anchorMatch.Index
    $windowLen = [Math]::Min(5000, $Text.Length - $idx)
    return @($idx, $Text.Substring($idx,$windowLen))
}
function Patch-Atlas-Registry([string]$Text,[string]$Label) {
    $atlasInfo = Get-Atlas-Window $Text $Label
    $idx = [int]$atlasInfo[0]
    $window = [string]$atlasInfo[1]

    $pathMatch = [regex]::Match($window, '"path"\s*:\s*"[^"]+"')
    if (-not $pathMatch.Success) {
        throw "${Label}: atlas path field not found near asset anchor"
    }
    $absolutePathIndex = $idx + $pathMatch.Index
    $pathReplacement = '"path": "/art/maps/world_atlas_labeled_v06d_detail_master_12k.jpg"'
    $Text = $Text.Substring(0,$absolutePathIndex) + $pathReplacement + $Text.Substring($absolutePathIndex + $pathMatch.Length)

    # Keep metadata truthful for the new visual master. Geometry/global bounds remain 120x80.
    $atlasInfo2 = Get-Atlas-Window $Text $Label
    $idx2 = [int]$atlasInfo2[0]
    $window2 = [string]$atlasInfo2[1]
    $window2 = [regex]::Replace($window2, '"nativePixelWidth"\s*:\s*(?:6000|12000)', '"nativePixelWidth": 12000', 1)
    $window2 = [regex]::Replace($window2, '"nativePixelHeight"\s*:\s*(?:4000|8000)', '"nativePixelHeight": 8000', 1)
    return $Text.Substring(0,$idx2) + $window2 + $Text.Substring($idx2 + $atlasInfo2[1].Length)
}
function Patch-Camera([string]$Text,[string]$Label) {
    $navMatch = [regex]::Match($Text, 'NAV_CAMERA\s*=\s*\{')
    if (-not $navMatch.Success) {
        throw "${Label}: NAV_CAMERA block not found"
    }
    $idx = $navMatch.Index
    $windowLen = [Math]::Min(1800, $Text.Length - $idx)
    $window = $Text.Substring($idx,$windowLen)

    if ($window -notmatch 'minViewWidth:\s*(?:12|24),') {
        throw "${Label}: unexpected minViewWidth in NAV_CAMERA block"
    }
    if ($window -notmatch 'defaultViewWidth:\s*(?:18|30),') {
        throw "${Label}: unexpected defaultViewWidth in NAV_CAMERA block"
    }

    $window = [regex]::Replace($window, 'minViewWidth:\s*(?:12|24),', 'minViewWidth: 12,', 1)
    $window = [regex]::Replace($window, 'defaultViewWidth:\s*(?:18|30),', 'defaultViewWidth: 18,', 1)
    return $Text.Substring(0,$idx) + $window + $Text.Substring($idx + $windowLen)
}

# Install the actual 12000x8000 user-approved ComfyUI atlas into the public runtime path.
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $runtimeMap) | Out-Null
Copy-Item -LiteralPath $payloadMap -Destination $runtimeMap -Force

# Patch source and the already-compiled Alpha browser runtime.
$srcAssetsText = Patch-Atlas-Registry (Read-Text $srcAssets) 'src/data/seed/assets.ts'
$jsAssetsText = Patch-Atlas-Registry (Read-Text $jsAssets) 'public/alpha/js/data/seed/assets.js'
$srcCameraText = Patch-Camera (Read-Text $srcCamera) 'src/game/navigationCamera.ts'
$jsCameraText = Patch-Camera (Read-Text $jsCamera) 'public/alpha/js/game/navigationCamera.js'

Write-NoBom $srcAssets $srcAssetsText
Write-NoBom $jsAssets $jsAssetsText
Write-NoBom $srcCamera $srcCameraText
Write-NoBom $jsCamera $jsCameraText

# Verify the actual runtime files the Alpha browser loads.
$verifyJsAssets = Read-Text $jsAssets
$verifyJsCamera = Read-Text $jsCamera
$atlasVerify = Get-Atlas-Window $verifyJsAssets 'runtime assets verification'
$atlasWindow = [string]$atlasVerify[1]

if ($atlasWindow -notmatch '/art/maps/world_atlas_labeled_v06d_detail_master_12k\.jpg') {
    throw 'Runtime asset registry still does not point to the 12K detail atlas.'
}
if ($atlasWindow -match '/art/maps/world_atlas_labeled_v06d_master\.webp') {
    throw 'Old 6K atlas path is still present inside the active runtime atlas block.'
}
if ($atlasWindow -notmatch '"nativePixelWidth"\s*:\s*12000' -or $atlasWindow -notmatch '"nativePixelHeight"\s*:\s*8000') {
    throw 'Runtime atlas metadata was not updated to 12000x8000.'
}
if ($verifyJsCamera -notmatch 'minViewWidth:\s*12,' -or $verifyJsCamera -notmatch 'defaultViewWidth:\s*18,') {
    throw 'Compiled navigation camera did not receive the 12/18 close-zoom settings.'
}
if (-not (Test-Path -LiteralPath $runtimeMap)) {
    throw '12K runtime painting is missing after copy.'
}

$mapBytes = (Get-Item -LiteralPath $runtimeMap).Length
if ($mapBytes -lt 50000000) {
    throw "12K runtime atlas file is unexpectedly small ($mapBytes bytes)."
}

# Syntax-check browser ESM only. No Next build is needed for this direct Alpha runtime repair.
& node --check $jsAssets
if ($LASTEXITCODE -ne 0) { throw 'Browser ESM syntax failed for compiled assets.js' }
& node --check $jsCamera
if ($LASTEXITCODE -ne 0) { throw 'Browser ESM syntax failed for compiled navigationCamera.js' }

Write-Host ''
Write-Host 'REAL 12K NAVIGATION RUNTIME FIX APPLIED.' -ForegroundColor Green
Write-Host '  Visual atlas: public/art/maps/world_atlas_labeled_v06d_detail_master_12k.jpg'
Write-Host '  Actual file size: ' -NoNewline
Write-Host ("{0:N1} MiB" -f ($mapBytes / 1MB)) -ForegroundColor Green
Write-Host '  Runtime registry: public/alpha/js/data/seed/assets.js -> 12K detail atlas'
Write-Host '  Runtime camera: public/alpha/js/game/navigationCamera.js -> 12 min / 18 default'
Write-Host '  Source TS mirrors the same path/settings.'
Write-Host '  Logical world remains 120x80. Ports/POIs/grid/passability/routes are untouched.'
Write-Host "  Backup: $backupDir"
Write-Host ''
Write-Host 'NEXT: hard-refresh the running game with Ctrl+F5.' -ForegroundColor Yellow
Write-Host 'Do NOT run npm build for this fix.' -ForegroundColor Yellow
