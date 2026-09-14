$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Get-Location).Path
$backups = Get-ChildItem -LiteralPath $repoRoot -Directory -Filter '.atlas-12k-detail-backup-*' | Sort-Object Name -Descending
if (-not $backups -or $backups.Count -eq 0) {
    throw 'No .atlas-12k-detail-backup-* folder was found in this repository root.'
}

$backup = $backups[0].FullName
Write-Host "Restoring latest atlas backup: $backup" -ForegroundColor Cyan

$assetsBackup = Join-Path $backup 'src\data\seed\assets.ts'
$cameraBackup = Join-Path $backup 'src\game\navigationCamera.ts'
$manifestPath = Join-Path $backup 'backup_manifest.json'
$mapBackup = Join-Path $backup 'public\art\maps\world_atlas_labeled_v06d_detail_master_12k.jpg'
$mapDestination = Join-Path $repoRoot 'public\art\maps\world_atlas_labeled_v06d_detail_master_12k.jpg'

if (-not (Test-Path -LiteralPath $assetsBackup) -or -not (Test-Path -LiteralPath $cameraBackup)) {
    throw 'Backup is incomplete; refusing partial rollback.'
}

Copy-Item -LiteralPath $assetsBackup -Destination (Join-Path $repoRoot 'src\data\seed\assets.ts') -Force
Copy-Item -LiteralPath $cameraBackup -Destination (Join-Path $repoRoot 'src\game\navigationCamera.ts') -Force

$hadRuntimeMap = $false
if (Test-Path -LiteralPath $manifestPath) {
    $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    $hadRuntimeMap = [bool]$manifest.hadRuntimeMap
}
if ($hadRuntimeMap -and (Test-Path -LiteralPath $mapBackup)) {
    Copy-Item -LiteralPath $mapBackup -Destination $mapDestination -Force
} elseif (Test-Path -LiteralPath $mapDestination) {
    Remove-Item -LiteralPath $mapDestination -Force
}

Write-Host 'Rollback complete.' -ForegroundColor Green
