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

if (-not $src.Contains("TIDEWORN_DIRECTIONAL_TOKEN_ASSETS") -or -not $js.Contains("TIDEWORN_DIRECTIONAL_TOKEN_ASSETS")) {
    Fail "Tideworn directional navigation v3.1 was not detected. Apply v3.1 first."
}

$alreadySmooth =
    $src.Contains("const VOYAGE_AUTOMATION_TARGET_FRAMES=48;") -and
    $src.Contains("const VOYAGE_AUTOMATION_FRAME_DELAY_MS=32;") -and
    $js.Contains("const VOYAGE_AUTOMATION_TARGET_FRAMES = 48;") -and
    $js.Contains("const VOYAGE_AUTOMATION_FRAME_DELAY_MS = 32;")

if ($alreadySmooth) {
    Write-Host "Smooth movement hotfix v3.2 is already applied." -ForegroundColor Green
    exit 0
}

$srcBackup = "$srcPath.pre-tideworn-nav-v3_2.bak"
$jsBackup  = "$jsPath.pre-tideworn-nav-v3_2.bak"
if (-not (Test-Path $srcBackup)) { Copy-Item $srcPath $srcBackup }
if (-not (Test-Path $jsBackup))  { Copy-Item $jsPath $jsBackup }

# v3.1 values -> v3.2 values.
# More visible updates means fewer simulation steps are grouped into each draw.
# Lower frame delay keeps the overall voyage around the same couple-second feel.
$src = Replace-Once `
    $src `
    "const VOYAGE_AUTOMATION_TARGET_FRAMES=30;" `
    "const VOYAGE_AUTOMATION_TARGET_FRAMES=48;" `
    "source target frames"

$src = Replace-Once `
    $src `
    "const VOYAGE_AUTOMATION_FRAME_DELAY_MS=75;" `
    "const VOYAGE_AUTOMATION_FRAME_DELAY_MS=32;" `
    "source frame delay"

$js = Replace-Once `
    $js `
    "const VOYAGE_AUTOMATION_TARGET_FRAMES = 30;" `
    "const VOYAGE_AUTOMATION_TARGET_FRAMES = 48;" `
    "browser target frames"

$js = Replace-Once `
    $js `
    "const VOYAGE_AUTOMATION_FRAME_DELAY_MS = 75;" `
    "const VOYAGE_AUTOMATION_FRAME_DELAY_MS = 32;" `
    "browser frame delay"

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
        Fail "Browser syntax check failed. The two files were restored from backup."
    }
    Write-Host "Browser ESM syntax check passed." -ForegroundColor Green
}

Write-Host ""
Write-Host "Tideworn smooth movement hotfix v3.2 applied." -ForegroundColor Green
Write-Host ""
Write-Host "Changed visual pacing:"
Write-Host "  30 target movement updates -> 48"
Write-Host "  75 ms pacing delay -> 32 ms"
Write-Host ""
Write-Host "Result:"
Write-Host "  - smaller position jumps"
Write-Host "  - smoother camera/token movement"
Write-Host "  - direction changes still follow the route"
Write-Host "  - travel should still finish in roughly a couple seconds"
Write-Host "  - no gameplay-time, pathfinding, economy, encounter, or naval-combat changes"
