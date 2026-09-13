param(
  [string]$RepoRoot = ".",
  [string]$BackupPath = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$RepoRoot = (Resolve-Path $RepoRoot).Path

if (-not $BackupPath) {
  $candidate = Get-ChildItem -Path $RepoRoot -Directory -Filter ".native-atlas-zoom-cap-backup-*" |
    Sort-Object Name -Descending |
    Select-Object -First 1
  if (-not $candidate) { throw "No native-atlas zoom-cap backup found." }
  $BackupPath = $candidate.FullName
}

$BackupPath = (Resolve-Path $BackupPath).Path

# Restore everything that was backed up.
Get-ChildItem -Path $BackupPath -File -Recurse | ForEach-Object {
  $relative = $_.FullName.Substring($BackupPath.Length).TrimStart([char]92, [char]47)
  $target = Join-Path $RepoRoot $relative
  $parent = Split-Path -Parent $target
  if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
  Copy-Item -Force $_.FullName $target
}

Write-Host "Native-atlas zoom-cap rollback restored from:"
Write-Host "  $BackupPath"
