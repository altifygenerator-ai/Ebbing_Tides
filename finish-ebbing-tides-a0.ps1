param(
    [ValidateSet("A0_2D","A0_3A")]
    [string]$Pass = "A0_3A",
    [string]$OutputDir = ".\dist\handoff"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Run-Step {
    param(
        [Parameter(Mandatory=$true)][string]$Name,
        [Parameter(Mandatory=$true)][scriptblock]$Command,
        [string]$LogPath = $null
    )
    Write-Host "`n=== $Name ===" -ForegroundColor Cyan
    if ($LogPath) {
        & $Command 2>&1 | Tee-Object -FilePath $LogPath
        if ($LASTEXITCODE -ne 0) {
            throw "$Name failed with exit code $LASTEXITCODE. See $LogPath"
        }
    } else {
        & $Command
        if ($LASTEXITCODE -ne 0) {
            throw "$Name failed with exit code $LASTEXITCODE"
        }
    }
}

$Root = (Get-Location).Path
if (-not (Test-Path (Join-Path $Root "package.json"))) {
    throw "Run this script from the Ebbing_Tides repository root (package.json was not found)."
}
if (-not (Test-Path (Join-Path $Root ".git"))) {
    Write-Warning "No .git directory found. Validation can still run, but commit provenance will be unavailable."
}

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$WorkOut = Join-Path $Root $OutputDir
New-Item -ItemType Directory -Force -Path $WorkOut | Out-Null
$LogDir = Join-Path $WorkOut "verification-$Pass-$Stamp"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$Commit = "UNKNOWN"
$Branch = "UNKNOWN"
if (Test-Path (Join-Path $Root ".git")) {
    $Commit = (git rev-parse HEAD).Trim()
    $Branch = (git branch --show-current).Trim()
}

Write-Host "Repository: $Root"
Write-Host "Branch:     $Branch"
Write-Host "Commit:     $Commit"
Write-Host "Pass:       $Pass"

# The prior A0.3A validation was blocked because tsc was unavailable and stale
# public/alpha/js output was then exercised by npm test. Restore the project's
# declared dependencies before doing any validation.
if (Test-Path (Join-Path $Root "package-lock.json")) {
    Run-Step "Install declared npm dependencies (npm ci)" { npm ci } (Join-Path $LogDir "01-npm-ci.log")
} else {
    Run-Step "Install declared npm dependencies (npm install)" { npm install } (Join-Path $LogDir "01-npm-install.log")
}

$TscCmd = Join-Path $Root "node_modules\.bin\tsc.cmd"
$TscUnix = Join-Path $Root "node_modules/.bin/tsc"
if (-not (Test-Path $TscCmd) -and -not (Test-Path $TscUnix)) {
    throw "TypeScript is still unavailable after installing declared dependencies. Check package.json devDependencies before changing the project."
}

Run-Step "Alpha TypeScript typecheck" { npm run typecheck:alpha } (Join-Path $LogDir "02-typecheck-alpha.log")
Run-Step "Alpha compiled JS build" { npm run alpha:build } (Join-Path $LogDir "03-alpha-build.log")

# Full regression suite: this is intentionally run only after a successful build
# so tests cannot silently exercise stale public/alpha/js artifacts.
Run-Step "Full automated regression suite" { npm test } (Join-Path $LogDir "04-full-tests.log")
Run-Step "Art-layout verification" { npm run alpha:art-layouts } (Join-Path $LogDir "05-art-layouts.log")

# Re-run the critical durability/lifecycle tests as a focused gate when present.
$FocusedPatterns = @(
    "tests\*a0-1b*durability*.test.mjs",
    "tests\*a0-2a*durability*.test.mjs",
    "tests\*a0-2d*.test.mjs",
    "tests\*a0-3a*.test.mjs",
    "tests\*crew-mechanics*.test.mjs",
    "tests\*reputation*relationships*law*.test.mjs"
)
$Focused = @()
foreach ($pattern in $FocusedPatterns) {
    $Focused += Get-ChildItem -Path (Join-Path $Root $pattern) -File -ErrorAction SilentlyContinue
}
$Focused = $Focused | Sort-Object FullName -Unique
if ($Focused.Count -gt 0) {
    $Args = @("--test") + ($Focused | ForEach-Object { $_.FullName })
    Run-Step "Focused A0 lifecycle/durability regressions" { node @Args } (Join-Path $LogDir "06-focused-tests.log")
}

$ChecksumFile = Join-Path $Root ("{0}_FILE_SHA256SUMS.txt" -f $Pass)
$ManifestFile = Join-Path $Root ("ALPHA_0.6D_{0}_PACKAGE_MANIFEST.json" -f $Pass)
$ApplyFile = Join-Path $Root ("APPLY_{0}.md" -f $Pass)
$ReadmeFile = Join-Path $Root ("README_{0}.md" -f $Pass)

if (-not (Test-Path $ChecksumFile)) {
    throw "Cannot build the overlay package: $([IO.Path]::GetFileName($ChecksumFile)) is missing."
}

$Stage = Join-Path $WorkOut ("stage-{0}-{1}" -f $Pass, $Stamp)
if (Test-Path $Stage) { Remove-Item -Recurse -Force $Stage }
New-Item -ItemType Directory -Force -Path $Stage | Out-Null

# Parse the project's existing checksum list as the authoritative changed-file list.
$Paths = New-Object System.Collections.Generic.List[string]
foreach ($line in Get-Content $ChecksumFile) {
    if ($line -match '^\s*[0-9a-fA-F]{64}\s+\*?(.+?)\s*$') {
        $rel = $Matches[1].Trim().TrimStart('.','\','/')
        if ($rel) { $Paths.Add($rel) }
    }
}

if ($Paths.Count -eq 0) {
    throw "$([IO.Path]::GetFileName($ChecksumFile)) contained no parseable file paths."
}

$Missing = @()
foreach ($rel in ($Paths | Sort-Object -Unique)) {
    $src = Join-Path $Root $rel
    if (-not (Test-Path $src -PathType Leaf)) {
        $Missing += $rel
        continue
    }
    $dst = Join-Path $Stage $rel
    New-Item -ItemType Directory -Force -Path (Split-Path $dst -Parent) | Out-Null
    Copy-Item -Force $src $dst
}
if ($Missing.Count -gt 0) {
    $Missing | Set-Content (Join-Path $LogDir "missing-package-files.txt")
    throw "Overlay packaging stopped because $($Missing.Count) manifest/checksum-listed file(s) are missing. See missing-package-files.txt."
}

# Include the pass's packaging/provenance documents when present.
$MetaFiles = @($ChecksumFile, $ManifestFile, $ApplyFile, $ReadmeFile)
$MetaFiles += Get-ChildItem -Path $Root -File -Filter "*$Pass*" -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -in @(".md",".txt",".json") } |
    Select-Object -ExpandProperty FullName
foreach ($meta in ($MetaFiles | Where-Object { $_ -and (Test-Path $_) } | Sort-Object -Unique)) {
    Copy-Item -Force $meta (Join-Path $Stage (Split-Path $meta -Leaf))
}

$VerificationSummary = @"
Ebbing Tides Alpha 0.6D - $Pass verification
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss K")
Branch: $Branch
Commit: $Commit

PASS:
- npm dependency restore
- npm run typecheck:alpha
- npm run alpha:build
- npm test
- npm run alpha:art-layouts
$(
if ($Focused.Count -gt 0) { "- focused A0 lifecycle/durability regression rerun ($($Focused.Count) test files)" }
else { "- focused rerun: no matching dedicated files found; full npm test already passed" }
)

Packaging source list:
- $([IO.Path]::GetFileName($ChecksumFile))

Save schema is not modified by this finisher.
"@
$VerificationSummary | Set-Content -Encoding UTF8 (Join-Path $Stage ("VERIFICATION_{0}.txt" -f $Pass))
Copy-Item -Recurse -Force $LogDir (Join-Path $Stage "verification-logs")

# Recalculate hashes for every packaged payload file, excluding the generated hash list itself.
$GeneratedHashPath = Join-Path $Stage ("{0}_PACKAGE_SHA256SUMS_GENERATED.txt" -f $Pass)
$HashLines = Get-ChildItem -Path $Stage -Recurse -File |
    Where-Object { $_.FullName -ne $GeneratedHashPath } |
    Sort-Object FullName |
    ForEach-Object {
        $hash = (Get-FileHash -Algorithm SHA256 $_.FullName).Hash.ToLowerInvariant()
        $rel = $_.FullName.Substring($Stage.Length).TrimStart('\','/')
        "$hash  $rel"
    }
$HashLines | Set-Content -Encoding ASCII $GeneratedHashPath

$ZipName = "Ebbing_Tides_Alpha_0.6D_{0}_VERIFIED_OVERLAY_{1}.zip" -f $Pass, $Stamp
$ZipPath = Join-Path $WorkOut $ZipName
if (Test-Path $ZipPath) { Remove-Item -Force $ZipPath }
Compress-Archive -Path (Join-Path $Stage "*") -DestinationPath $ZipPath -CompressionLevel Optimal

$ZipHash = (Get-FileHash -Algorithm SHA256 $ZipPath).Hash.ToLowerInvariant()
$Final = @"
SUCCESS

Package: $ZipPath
SHA-256: $ZipHash
Branch: $Branch
Commit: $Commit
Pass: $Pass
"@
$Final | Tee-Object -FilePath (Join-Path $WorkOut ("{0}-RESULT-{1}.txt" -f $Pass, $Stamp))

Write-Host "`n$Final" -ForegroundColor Green
