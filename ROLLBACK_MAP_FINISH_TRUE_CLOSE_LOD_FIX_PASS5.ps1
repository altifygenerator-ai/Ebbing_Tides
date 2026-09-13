param([string]$RepoRoot = ".", [string]$BackupPath = "")
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$RepoRoot = (Resolve-Path $RepoRoot).Path
if (-not $BackupPath) {
  $candidates = Get-ChildItem -Path $RepoRoot -Directory -Filter '.map-finish-true-close-lod-fix-backup-*' | Sort-Object Name -Descending
  if (-not $candidates) { throw 'No marker/sharpness recovery backup directory found.' }
  $BackupPath = $candidates[0].FullName
}
if (-not (Test-Path $BackupPath)) { throw "Backup path does not exist: $BackupPath" }

Get-ChildItem -Path $BackupPath -Recurse -File | ForEach-Object {
  $relative = $_.FullName.Substring($BackupPath.Length).TrimStart('\','/')
  $target = Join-Path $RepoRoot $relative
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
  Copy-Item -Force $_.FullName $target
}
Write-Host "Rollback restored files from: $BackupPath"
