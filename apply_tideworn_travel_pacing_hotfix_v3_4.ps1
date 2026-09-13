param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
    Write-Host ""
    Write-Host "HOTFIX FAILED: $Message" -ForegroundColor Red
    exit 1
}

function Replace-Once(
    [string]$Text,
    [string]$Old,
    [string]$New,
    [string]$Label
) {
    $first = $Text.IndexOf($Old, [System.StringComparison]::Ordinal)
    if ($first -lt 0) {
        Fail "${Label}: expected text was not found."
    }
    $second = $Text.IndexOf($Old, $first + $Old.Length, [System.StringComparison]::Ordinal)
    if ($second -ge 0) {
        Fail "${Label}: expected exactly one match, but found more than one."
    }
    return $Text.Substring(0, $first) + $New + $Text.Substring($first + $Old.Length)
}

$root = (Resolve-Path $ProjectRoot).Path
$srcPath = Join-Path $root "src\alpha\main.ts"
$jsPath  = Join-Path $root "public\alpha\js\alpha\main.js"

if (-not (Test-Path $srcPath)) { Fail "Could not find $srcPath" }
if (-not (Test-Path $jsPath))  { Fail "Could not find $jsPath" }

$src = [System.IO.File]::ReadAllText($srcPath)
$js  = [System.IO.File]::ReadAllText($jsPath)

if (-not $src.Contains("VOYAGE_VISUAL_TWEEN_V3_3") -or -not $js.Contains("VOYAGE_VISUAL_TWEEN_V3_3")) {
    Fail "Continuous-motion navigation v3.3 was not detected. Apply v3.3 first."
}

$alreadyApplied =
    $src.Contains("const VOYAGE_AUTOMATION_TWEEN_TARGET_MS=3000;") -and
    $src.Contains("const VOYAGE_AUTOMATION_TWEEN_MIN_MS=70;") -and
    $src.Contains("const VOYAGE_AUTOMATION_TWEEN_MAX_MS=170;") -and
    $js.Contains("const VOYAGE_AUTOMATION_TWEEN_TARGET_MS = 3000;") -and
    $js.Contains("const VOYAGE_AUTOMATION_TWEEN_MIN_MS = 70;") -and
    $js.Contains("const VOYAGE_AUTOMATION_TWEEN_MAX_MS = 170;")

if ($alreadyApplied) {
    Write-Host "Tideworn travel pacing v3.4 is already applied." -ForegroundColor Green
    exit 0
}

$srcBackup = "$srcPath.pre-tideworn-nav-v3_4.bak"
$jsBackup  = "$jsPath.pre-tideworn-nav-v3_4.bak"
if (-not (Test-Path $srcBackup)) { Copy-Item $srcPath $srcBackup }
if (-not (Test-Path $jsBackup))  { Copy-Item $jsPath $jsBackup }

# Slightly slower visual travel without touching game-time mechanics.
# Long normal voyages move from ~2.3 seconds to ~3.0 seconds.
# Short routes also receive a small increase so they do not look fast-forwarded.
$src = Replace-Once `
    $src `
    "const VOYAGE_AUTOMATION_TWEEN_TARGET_MS=2300;" `
    "const VOYAGE_AUTOMATION_TWEEN_TARGET_MS=3000;" `
    "source target duration"

$src = Replace-Once `
    $src `
    "const VOYAGE_AUTOMATION_TWEEN_MIN_MS=58;" `
    "const VOYAGE_AUTOMATION_TWEEN_MIN_MS=70;" `
    "source minimum segment duration"

$src = Replace-Once `
    $src `
    "const VOYAGE_AUTOMATION_TWEEN_MAX_MS=140;" `
    "const VOYAGE_AUTOMATION_TWEEN_MAX_MS=170;" `
    "source maximum segment duration"

$js = Replace-Once `
    $js `
    "const VOYAGE_AUTOMATION_TWEEN_TARGET_MS = 2300;" `
    "const VOYAGE_AUTOMATION_TWEEN_TARGET_MS = 3000;" `
    "browser target duration"

$js = Replace-Once `
    $js `
    "const VOYAGE_AUTOMATION_TWEEN_MIN_MS = 58;" `
    "const VOYAGE_AUTOMATION_TWEEN_MIN_MS = 70;" `
    "browser minimum segment duration"

$js = Replace-Once `
    $js `
    "const VOYAGE_AUTOMATION_TWEEN_MAX_MS = 140;" `
    "const VOYAGE_AUTOMATION_TWEEN_MAX_MS = 170;" `
    "browser maximum segment duration"

[System.IO.File]::WriteAllText($srcPath, $src, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($jsPath,  $js,  [System.Text.UTF8Encoding]::new($false))

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    Write-Host ""
    Write-Host "Checking browser ESM syntax..."
    & node --check $jsPath
    if ($LASTEXITCODE -ne 0) {
        Copy-Item $srcBackup $srcPath -Force
        Copy-Item $jsBackup $jsPath -Force
        Fail "Browser syntax check failed. Files were restored from backup."
    }
    Write-Host "Browser ESM syntax check passed." -ForegroundColor Green
}

Write-Host ""
Write-Host "Tideworn travel pacing v3.4 applied." -ForegroundColor Green
Write-Host ""
Write-Host "Visual timing:"
Write-Host "  long normal voyage target: ~2.3 sec -> ~3.0 sec"
Write-Host "  minimum visual segment: 58 ms -> 70 ms"
Write-Host "  maximum visual segment: 140 ms -> 170 ms"
Write-Host ""
Write-Host "Continuous route interpolation, camera following, and directional tokens are unchanged."
Write-Host "Gameplay travel time, supplies, weather, encounters, economy, saves, and naval combat are unchanged."
