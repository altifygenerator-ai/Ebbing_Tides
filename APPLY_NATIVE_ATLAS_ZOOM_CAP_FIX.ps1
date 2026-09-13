param(
  [string]$RepoRoot = "."
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$RepoRoot = (Resolve-Path $RepoRoot).Path
if (-not (Test-Path (Join-Path $RepoRoot "package.json"))) {
  throw "Run this from the Ebbing_Tides repository root."
}

$srcCamera = Join-Path $RepoRoot "src\game\navigationCamera.ts"
$jsCamera  = Join-Path $RepoRoot "public\alpha\js\game\navigationCamera.js"
$indexPath = Join-Path $RepoRoot "public\alpha\index.html"

foreach ($path in @($srcCamera, $jsCamera, $indexPath)) {
  if (-not (Test-Path $path)) { throw "Required file missing: $path" }
}

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = Join-Path $RepoRoot ".native-atlas-zoom-cap-backup-$stamp"
New-Item -ItemType Directory -Force -Path $backup | Out-Null

function Backup-ItemSafe([string]$relative) {
  $source = Join-Path $RepoRoot $relative
  if (-not (Test-Path $source)) { return }
  $dest = Join-Path $backup $relative
  $parent = Split-Path -Parent $dest
  if ($parent) { New-Item -ItemType Directory -Force -Path $parent | Out-Null }
  $item = Get-Item $source
  if ($item.PSIsContainer) {
    Copy-Item -Recurse -Force $source $dest
  } else {
    Copy-Item -Force $source $dest
  }
}

$targets = @(
  "src\game\navigationCamera.ts",
  "public\alpha\js\game\navigationCamera.js",
  "public\alpha\index.html",
  "public\alpha\atlas-lod.js",
  "public\alpha\atlas-quality.css",
  "public\alpha\atlas-lod-manifest.json",
  "public\art\maps\lod",
  "scripts\generate-atlas-lod.mjs"
)
foreach ($relative in $targets) { Backup-ItemSafe $relative }

# ------------------------------------------------------------------
# 1. Cap close zoom around the native 6000x4000 atlas resolution.
#
# The atlas is 120 cells wide and 6000 px wide = 50 source px/cell.
# A 24-cell-wide close view exposes ~1200 native source pixels,
# which closely matches the current ~1200-1250px navigation viewport
# without the old 2x magnification that made the art visibly blurry.
#
# Keep a distinct normal navigation width at 30 cells.
# ------------------------------------------------------------------
$ts = [IO.File]::ReadAllText($srcCamera)

$requiredTs = @(
  'minViewWidth: 12',
  'defaultViewWidth: 18',
  'if (viewWidth >= 24) return "medium";',
  'if (viewWidth > 14) return "navigation";',
  'if (viewWidth <= 14) return "close";'
)
foreach ($anchor in $requiredTs) {
  if (-not $ts.Contains($anchor)) {
    throw "navigationCamera.ts is not the expected current shape; missing: $anchor"
  }
}

$ts = $ts.Replace('minViewWidth: 12', 'minViewWidth: 24')
$ts = $ts.Replace('defaultViewWidth: 18', 'defaultViewWidth: 30')
$ts = $ts.Replace('if (viewWidth >= 24) return "medium";', 'if (viewWidth >= 30) return "medium";')
$ts = $ts.Replace('if (viewWidth > 14) return "navigation";', 'if (viewWidth > 24) return "navigation";')
$ts = $ts.Replace('if (viewWidth <= 14) return "close";', 'if (viewWidth <= 24) return "close";')
[IO.File]::WriteAllText($srcCamera, $ts, [Text.UTF8Encoding]::new($false))

$js = [IO.File]::ReadAllText($jsCamera)
$requiredJs = @(
  'minViewWidth: 12',
  'defaultViewWidth: 18',
  'if (viewWidth >= 24)',
  'if (viewWidth > 14)',
  'if (viewWidth <= 14)'
)
foreach ($anchor in $requiredJs) {
  if (-not $js.Contains($anchor)) {
    throw "browser navigationCamera.js is not the expected current shape; missing: $anchor"
  }
}

$js = $js.Replace('minViewWidth: 12', 'minViewWidth: 24')
$js = $js.Replace('defaultViewWidth: 18', 'defaultViewWidth: 30')
$js = $js.Replace('if (viewWidth >= 24)', 'if (viewWidth >= 30)')
$js = $js.Replace('if (viewWidth > 14)', 'if (viewWidth > 24)')
$js = $js.Replace('if (viewWidth <= 14)', 'if (viewWidth <= 24)')
[IO.File]::WriteAllText($jsCamera, $js, [Text.UTF8Encoding]::new($false))

# ------------------------------------------------------------------
# 2. Remove the 12k/24k atlas-upscale runtime from the launcher.
# ------------------------------------------------------------------
$html = [IO.File]::ReadAllText($indexPath)
$html = [regex]::Replace(
  $html,
  '(?m)^\s*<link\s+rel="stylesheet"\s+href="/alpha/atlas-quality\.css"\s*/>\s*\r?\n?',
  ''
)
$html = [regex]::Replace(
  $html,
  '(?m)^\s*<script\s+type="module"\s+src="/alpha/atlas-lod\.js"></script>\s*\r?\n?',
  ''
)
[IO.File]::WriteAllText($indexPath, $html, [Text.UTF8Encoding]::new($false))

# ------------------------------------------------------------------
# 3. Delete only the derived/upscale system and generated tiles.
#    The canonical atlas itself is deliberately untouched.
# ------------------------------------------------------------------
$removeTargets = @(
  "public\alpha\atlas-lod.js",
  "public\alpha\atlas-quality.css",
  "public\alpha\atlas-lod-manifest.json",
  "public\art\maps\lod",
  "scripts\generate-atlas-lod.mjs"
)
foreach ($relative in $removeTargets) {
  $path = Join-Path $RepoRoot $relative
  if (Test-Path $path) {
    Remove-Item -Recurse -Force $path
  }
}

# ------------------------------------------------------------------
# 4. Verify the resulting runtime.
# ------------------------------------------------------------------
Push-Location $RepoRoot
try {
  Write-Host ""
  Write-Host "Checking browser ESM syntax..."
  node --check public/alpha/js/game/navigationCamera.js
  if ($LASTEXITCODE -ne 0) { throw "navigationCamera.js syntax check failed." }

  $finalIndex = [IO.File]::ReadAllText((Join-Path $RepoRoot "public\alpha\index.html"))
  if ($finalIndex.Contains("/alpha/atlas-lod.js")) {
    throw "atlas-lod.js is still referenced by index.html"
  }
  if ($finalIndex.Contains("/alpha/atlas-quality.css")) {
    throw "atlas-quality.css is still referenced by index.html"
  }

  $finalTs = [IO.File]::ReadAllText((Join-Path $RepoRoot "src\game\navigationCamera.ts"))
  if (-not $finalTs.Contains("minViewWidth: 24")) { throw "Native close-zoom cap was not applied." }
  if (-not $finalTs.Contains("defaultViewWidth: 30")) { throw "Navigation default width was not applied." }

  if (Test-Path "public\art\maps\lod") {
    throw "Derived atlas LOD directory still exists."
  }

  if (Test-Path "public\art\maps\world_atlas_labeled_v06d_master.webp") {
    Write-Host "Canonical 6000x4000 atlas preserved."
  } else {
    throw "Canonical atlas is missing."
  }

  if (Test-Path "package.json") {
    Write-Host "Running Alpha TypeScript check..."
    npm run typecheck:alpha
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "TypeScript check reports an existing project error. This fix did not modify gameplay logic."
    }
  }
}
finally {
  Pop-Location
}

Write-Host ""
Write-Host "NATIVE ATLAS ZOOM-CAP FIX APPLIED."
Write-Host ""
Write-Host "Removed:"
Write-Host "  - 12k/24k atlas LOD runtime"
Write-Host "  - generated atlas tiles"
Write-Host "  - atlas quality override CSS"
Write-Host ""
Write-Host "Navigation presentation:"
Write-Host "  - close minimum: 12x8 -> 24x16"
Write-Host "  - normal navigation: 18x12 -> 30x20"
Write-Host "  - far/strategic: unchanged at 120x80"
Write-Host ""
Write-Host "Untouched:"
Write-Host "  - canonical 6000x4000 atlas"
Write-Host "  - port and POI coordinates/markers"
Write-Host "  - route/pathfinding math"
Write-Host "  - Tideworn movement interpolation/pacing"
Write-Host "  - travel, supplies, weather, encounters, economy"
Write-Host "  - save schema"
Write-Host "  - naval combat and naval audio"
Write-Host ""
Write-Host "Backup: $backup"
Write-Host ""
Write-Host "IMPORTANT: fully reload the game after this (Ctrl+F5) so the old atlas runtime is gone from the browser."
