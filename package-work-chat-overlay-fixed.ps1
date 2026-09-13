param(
    [string]$Commit = "20f416b",
    [string]$OutputDir = ".\dist\handoff",
    [string]$PackageName = "Ebbing_Tides_Alpha_0.6D_Work_Chat_Overlay"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Ensure-RepoRoot {
    if (-not (Test-Path ".git")) {
        throw "Run this from the repository root. .git was not found."
    }
}

Ensure-RepoRoot

$commitFull = (git rev-parse $Commit).Trim()
if (-not $commitFull) {
    throw "Could not resolve commit '$Commit'."
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outRoot = Join-Path (Get-Location).Path $OutputDir
$stage = Join-Path $outRoot ("stage-" + $stamp)
$zipPath = Join-Path $outRoot ("{0}_{1}.zip" -f $PackageName, $stamp)
New-Item -ItemType Directory -Force -Path $outRoot | Out-Null
New-Item -ItemType Directory -Force -Path $stage | Out-Null

# Exact changed files from the target commit
$files = git diff-tree --no-commit-id --name-only -r $commitFull | Where-Object { $_ -and $_.Trim() -ne "" }
if (-not $files) {
    throw "No files found for commit $commitFull"
}

$missing = @()
foreach ($rel in $files) {
    $src = Join-Path (Get-Location).Path $rel
    if (-not (Test-Path $src)) {
        $missing += $rel
        continue
    }
    $dst = Join-Path $stage $rel
    New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
    Copy-Item -Path $src -Destination $dst -Force
}

if ($missing.Count -gt 0) {
    $missing | Set-Content -Encoding UTF8 (Join-Path $outRoot "missing-files-$stamp.txt")
    throw "Some files from the commit were missing in the working tree. See missing-files-$stamp.txt"
}

# Basic manifest
$manifest = [ordered]@{
    package_name = $PackageName
    created_at = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss K")
    source_commit = $commitFull
    file_count = @($files).Count
    files = @($files)
}
$manifest | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $stage "PACKAGE_MANIFEST.json")

# Checksums
$hashLines = Get-ChildItem -Path $stage -Recurse -File |
    Sort-Object FullName |
    ForEach-Object {
        $hash = (Get-FileHash -Algorithm SHA256 $_.FullName).Hash.ToLowerInvariant()
        $rel = $_.FullName.Substring($stage.Length).TrimStart([char]92, [char]47)
        "$hash  $rel"
    }
$hashLines | Set-Content -Encoding ASCII (Join-Path $stage "FILE_SHA256SUMS.txt")

if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zipPath -CompressionLevel Optimal

$zipHash = (Get-FileHash -Algorithm SHA256 $zipPath).Hash.ToLowerInvariant()

Write-Host ""
Write-Host "Created package:" -ForegroundColor Green
Write-Host $zipPath
Write-Host "SHA-256: $zipHash"
Write-Host "Source commit: $commitFull"
Write-Host "Files packaged: $(@($files).Count)"
