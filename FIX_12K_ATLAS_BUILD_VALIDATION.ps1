$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Get-Location).Path
$tsconfigPath = Join-Path $repoRoot 'tsconfig.json'
$atlasPath = Join-Path $repoRoot 'public\art\maps\world_atlas_labeled_v06d_detail_master_12k.jpg'
$assetsPath = Join-Path $repoRoot 'src\data\seed\assets.ts'
$cameraPath = Join-Path $repoRoot 'src\game\navigationCamera.ts'

Write-Host 'Ebbing Tides - 12K Atlas Build Validation Fix' -ForegroundColor Cyan
Write-Host "Repo root: $repoRoot"

if (-not (Test-Path -LiteralPath $tsconfigPath)) {
    throw "tsconfig.json not found at $tsconfigPath. Run this from the Ebbing_Tides repository root."
}

# Confirm the atlas integration itself already landed. The previous installer reported success
# before npm build started, so this script does not reinstall or touch map/gameplay files.
if (Test-Path -LiteralPath $atlasPath) {
    Write-Host '12K atlas runtime image is present.' -ForegroundColor Green
} else {
    Write-Warning '12K atlas runtime image was not found. This script only fixes build validation; it does not reinstall the atlas payload.'
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
$backupPath = Join-Path $repoRoot "tsconfig.pre-atlas-build-fix-$stamp.json"
Copy-Item -LiteralPath $tsconfigPath -Destination $backupPath -Force

$ts = Get-Content -LiteralPath $tsconfigPath -Raw | ConvertFrom-Json

# The project intentionally keeps handoff snapshots under dist/handoff. The root tsconfig includes
# **/*.ts, so without this exclusion Next's type-check phase compiles those incomplete snapshots as
# if they were live source and reports hundreds of missing-module errors.
$exclude = @()
if ($null -ne $ts.exclude) { $exclude = @($ts.exclude) }

foreach ($entry in @('dist', '.atlas-12k-detail-backup-*')) {
    if ($exclude -notcontains $entry) { $exclude += $entry }
}
$ts.exclude = $exclude

# Keep whatever Next.js already added to include; only update exclude.
$json = $ts | ConvertTo-Json -Depth 100
Set-Content -LiteralPath $tsconfigPath -Value $json -Encoding UTF8

Write-Host ''
Write-Host 'Updated tsconfig excludes:' -ForegroundColor Green
$exclude | ForEach-Object { Write-Host "  - $_" }
Write-Host "Backup: $backupPath"

Write-Host ''
Write-Host 'Running npm build...' -ForegroundColor Cyan
& npm run build
if ($LASTEXITCODE -ne 0) {
    throw "npm run build still failed with exit code $LASTEXITCODE. The dist/handoff false-positive path is now excluded; inspect the remaining errors as live-project errors."
}

Write-Host ''
Write-Host 'Build passed.' -ForegroundColor Green
Write-Host 'The 12K atlas integration remains installed; no map, terrain, route, combat, save, or gameplay files were changed by this fix.'
