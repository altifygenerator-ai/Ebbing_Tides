param([string]$RepoRoot = ".")
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$RepoRoot = (Resolve-Path $RepoRoot).Path
$pointer = Join-Path $RepoRoot ".map-finish-git-aligned-last-backup.txt"
if (-not (Test-Path $pointer)) { throw "No Git-aligned map-finish backup pointer found." }
$backup = ([IO.File]::ReadAllText($pointer)).Trim()
if (-not (Test-Path $backup)) { throw "Backup directory not found: $backup" }
$manifestPath = Join-Path $backup "backup-manifest.json"
if (-not (Test-Path $manifestPath)) { throw "Backup manifest missing: $manifestPath" }
$records = @(Get-Content -Raw $manifestPath | ConvertFrom-Json)
foreach ($record in $records) {
  $target = Join-Path $RepoRoot $record.path
  if (Test-Path $target) { Remove-Item -Recurse -Force $target }
  if ($record.existed) {
    $source = Join-Path $backup $record.path
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
    if ($record.kind -eq "directory") { Copy-Item -Recurse -Force $source $target }
    else { Copy-Item -Force $source $target }
  }
}
Write-Host "Rolled back Git-aligned atlas presentation changes from: $backup"
