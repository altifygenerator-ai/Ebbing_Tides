param([string]$RepoRoot = ".")
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$PackageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path $RepoRoot).Path
if (-not (Test-Path (Join-Path $RepoRoot "package.json"))) { throw "Run this from the Ebbing_Tides repository root." }

$mainPath = Join-Path $RepoRoot "src/alpha/main.ts"
if (-not (Test-Path $mainPath)) { throw "Missing src/alpha/main.ts" }
$mainText = [IO.File]::ReadAllText($mainPath)
$requiredAnchors = @(
  'async function runVoyageUntilAttention',
  'VOYAGE_AUTOMATION_TWEEN_TARGET_MS=3000',
  'VOYAGE_AUTOMATION_TWEEN_MIN_MS=70',
  'VOYAGE_AUTOMATION_TWEEN_MAX_MS=170',
  'function applyMapCameraToDom',
  'svg.chart-v04',
  'atlas-art'
)
foreach ($anchor in $requiredAnchors) {
  if (-not $mainText.Contains($anchor)) { throw "Current navigation baseline is not present; missing anchor: $anchor" }
}

# Require the accepted Naval Audio Variation v2 state as part of the certified stack.
$requiredNavalAudioMainAnchors = @(
  'let navalAudioEncounterId',
  'let navalOpeningRoundVolleyPlayed=false',
  'if(!navalOpeningRoundVolleyPlayed)',
  'cue("cannon_round")',
  'cue("cannon")'
)
foreach ($anchor in $requiredNavalAudioMainAnchors) {
  if (-not $mainText.Contains($anchor)) { throw "Naval Audio Variation Hotfix v2 is not present in src/alpha/main.ts; missing anchor: $anchor" }
}

$criticalFiles = @(
  'src/alpha/main.ts',
  'src/alpha/audio.ts',
  'src/game/navigationCamera.ts',
  'src/game/navigation.ts',
  'src/game/travel.ts',
  'src/data/seed/worldMap.ts',
  'src/data/seed/assets.ts',
  'src/data/seed/shipCombatVisuals.ts',
  'public/alpha/js/alpha/main.js',
  'public/alpha/js/game/navigationCamera.js',
  'public/alpha/styles.css'
)

function Get-CriticalHashes {
  $result = @{}
  foreach ($relative in $criticalFiles) {
    $path = Join-Path $RepoRoot $relative
    if (Test-Path $path) { $result[$relative] = (Get-FileHash -Algorithm SHA256 $path).Hash }
  }
  return $result
}

$beforeHashes = Get-CriticalHashes
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = Join-Path $RepoRoot ".map-finish-marker-sharpness-recovery-backup-$stamp"
New-Item -ItemType Directory -Force -Path $backup | Out-Null
$records = @()
function Backup-Target([string]$relative) {
  $target = Join-Path $RepoRoot $relative
  $exists = Test-Path $target
  $kind = if ($exists -and (Get-Item $target).PSIsContainer) { 'directory' } else { 'file' }
  $script:records += [pscustomobject]@{ path = $relative; existed = $exists; kind = $kind }
  if ($exists) {
    $dest = Join-Path $backup $relative
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dest) | Out-Null
    if ($kind -eq 'directory') { Copy-Item -Recurse -Force $target $dest }
    else { Copy-Item -Force $target $dest }
  }
}

$touchTargets = @(
  'public/alpha/atlas-lod.js',
  'public/alpha/atlas-quality.css',
  'public/alpha/atlas-lod-manifest.json',
  'scripts/generate-atlas-lod.mjs',
  'tests/map-finish-git-aligned.test.mjs',
  'docs/handoffs/alpha-06d-map-finish-git-aligned.md',
  'public/alpha/index.html',
  'public/art/maps/lod/atlas-12000',
  'public/art/maps/lod/atlas-24000'
)
foreach ($relative in $touchTargets) { Backup-Target $relative }

$payloadRoot = Join-Path $PackageRoot 'payload'
Get-ChildItem -Path $payloadRoot -File -Recurse | ForEach-Object {
  $relative = $_.FullName.Substring($payloadRoot.Length).TrimStart('\','/')
  $target = Join-Path $RepoRoot $relative
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
  Copy-Item -Force $_.FullName $target
}

$indexPath = Join-Path $RepoRoot 'public/alpha/index.html'
$html = [IO.File]::ReadAllText($indexPath)
$newline = [Environment]::NewLine
if (-not $html.Contains('/alpha/atlas-quality.css')) {
  $needle = '  <link rel="stylesheet" href="/alpha/start-menu.css" />'
  if (-not $html.Contains($needle)) { $needle = '  <link rel="stylesheet" href="/alpha/styles.css" />' }
  if (-not $html.Contains($needle)) { throw 'Could not find stylesheet insertion point in public/alpha/index.html' }
  $html = $html.Replace($needle, $needle + $newline + '  <link rel="stylesheet" href="/alpha/atlas-quality.css" />')
}
if (-not $html.Contains('/alpha/atlas-lod.js')) {
  $needle = '  <script type="module" src="/alpha/js/alpha/startMenu.js"></script>'
  $insert = '  <script type="module" src="/alpha/atlas-lod.js"></script>'
  if ($html.Contains($needle)) { $html = $html.Replace($needle, $needle + $newline + $insert) }
  elseif ($html.Contains('</body>')) { $html = $html.Replace('</body>', $insert + $newline + '</body>') }
  else { throw 'Could not find script insertion point in public/alpha/index.html' }
}
[IO.File]::WriteAllText($indexPath, $html, [Text.UTF8Encoding]::new($false))

Push-Location $RepoRoot
try {
  if (-not (Test-Path 'public/art/maps/world_atlas_labeled_v06d_master.webp')) { throw 'Missing canonical atlas public/art/maps/world_atlas_labeled_v06d_master.webp' }
  node --check public/alpha/atlas-lod.js
  if ($LASTEXITCODE -ne 0) { throw 'Atlas runtime syntax check failed.' }
  node --check scripts/generate-atlas-lod.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Atlas generator syntax check failed.' }

  node -e "import('sharp').then(()=>process.exit(0)).catch(()=>process.exit(1))"
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'Installing Sharp temporarily for deterministic atlas generation...'
    npm install --no-save --package-lock=false sharp@0.35.4
    if ($LASTEXITCODE -ne 0) { throw 'Could not install Sharp.' }
  }

  Write-Host 'Regenerating marker-safe 12k atlas tiles...'
  node scripts/generate-atlas-lod.mjs --level=atlas-12000-nav-tiles --activate --clean
  if ($LASTEXITCODE -ne 0) { throw '12k atlas generation failed.' }
  node scripts/generate-atlas-lod.mjs --level=atlas-12000-nav-tiles --verify-only
  if ($LASTEXITCODE -ne 0) { throw '12k atlas verification failed.' }

  Write-Host 'Generating 24k close atlas tiles for sharper close zoom...'
  node scripts/generate-atlas-lod.mjs --level=atlas-24000-close-tiles --activate --clean
  if ($LASTEXITCODE -ne 0) { throw '24k atlas generation failed.' }
  node scripts/generate-atlas-lod.mjs --level=atlas-24000-close-tiles --verify-only
  if ($LASTEXITCODE -ne 0) { throw '24k atlas verification failed.' }

  Write-Host 'Running registration / compatibility guards...'
  node --test tests/map-finish-git-aligned.test.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Map alignment tests failed.' }

  npm run typecheck:alpha
  if ($LASTEXITCODE -ne 0) { Write-Warning 'Current project TypeScript check is not green. Map recovery files installed without changing gameplay TS.' }
}
finally {
  Pop-Location
}

$afterHashes = Get-CriticalHashes
foreach ($relative in $beforeHashes.Keys) {
  if (-not $afterHashes.ContainsKey($relative)) { throw "Movement-critical file disappeared during install: $relative" }
  if ($beforeHashes[$relative] -ne $afterHashes[$relative]) { throw "Movement-critical file changed during map recovery install: $relative" }
}
Write-Host 'MAP FINISH MARKER/SHARPNESS RECOVERY PASS 4 APPLIED: marker styles preserved, sharper close LOD generated, navigation/audio stack unchanged.'
Write-Host "Backup: $backup"
