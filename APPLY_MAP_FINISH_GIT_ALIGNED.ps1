param([string]$RepoRoot = ".")
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$PackageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path $RepoRoot).Path
if (-not (Test-Path (Join-Path $RepoRoot "package.json"))) { throw "Run this from the Ebbing_Tides repository root." }

$ExpectedAuditedCommit = "c358ee003d71ad5ac18b77f79bcea1dab7ea9853"
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
  'atlas-art',
  'SKELDRA_DEVELOPED_BOUNDS'
)
foreach ($anchor in $requiredAnchors) {
  if (-not $mainText.Contains($anchor)) { throw "Current navigation baseline is not the audited Git-aligned shape; missing anchor: $anchor" }
}

# This Pass 3 package is intentionally certified for the current Git baseline
# PLUS the local Naval Audio Variation Hotfix v2. It never overwrites these files,
# but it refuses to install if those presentation/audio anchors are missing.
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

$audioPath = Join-Path $RepoRoot "src/alpha/audio.ts"
if (-not (Test-Path $audioPath)) { throw "Missing src/alpha/audio.ts" }
$audioText = [IO.File]::ReadAllText($audioPath)
$requiredNavalAudioAnchors = @(
  '/audio/combat/naval/round_shot_volley.ogg',
  '/audio/combat/naval/cannon_round_shot.ogg',
  '/audio/combat/naval/chain_shot_volley.ogg',
  '/audio/combat/naval/maneuver_crew_cue.ogg',
  '/audio/combat/naval/naval_combat_music_loop.ogg',
  'chance: 0.42',
  'chance: 0.68',
  'chance: 0.50',
  'const firstUnlock = !this.unlocked;'
)
foreach ($anchor in $requiredNavalAudioAnchors) {
  if (-not $audioText.Contains($anchor)) { throw "Naval Audio Variation Hotfix v2 is not present in src/alpha/audio.ts; missing anchor: $anchor" }
}

$requiredNavalAudioFiles = @(
  "public/audio/combat/naval/round_shot_volley.ogg",
  "public/audio/combat/naval/cannon_round_shot.ogg",
  "public/audio/combat/naval/chain_shot_volley.ogg",
  "public/audio/combat/naval/maneuver_crew_cue.ogg",
  "public/audio/combat/naval/naval_combat_music_loop.ogg",
  "public/audio/combat/naval/naval_victory_cheer_sting.ogg",
  "public/audio/combat/naval/naval_defeat_explosion_sting.ogg"
)
foreach ($relative in $requiredNavalAudioFiles) {
  if (-not (Test-Path (Join-Path $RepoRoot $relative))) { throw "Required real naval audio asset is missing: $relative" }
}

$currentCommit = $null
try { $currentCommit = (git -C $RepoRoot rev-parse HEAD 2>$null).Trim() } catch {}
if ($currentCommit) {
  Write-Host "Git HEAD: $currentCommit"
  if ($currentCommit -ne $ExpectedAuditedCommit) {
    Write-Warning "HEAD differs from the exact audited commit. Compatibility anchors passed, so installation may continue without overwriting movement code."
  } else {
    Write-Host "Exact audited Git baseline detected."
  }
}

$criticalMovementFiles = @(
  "src/alpha/main.ts",
  "src/alpha/audio.ts",
  "src/game/navigationCamera.ts",
  "src/game/navigation.ts",
  "src/game/travel.ts",
  "src/data/seed/worldMap.ts",
  "src/data/seed/assets.ts",
  "src/data/seed/shipCombatVisuals.ts",
  "public/alpha/js/alpha/main.js",
  "public/alpha/js/game/navigationCamera.js",
  "public/alpha/styles.css"
)

function Get-CriticalHashes {
  $result = @{}
  foreach ($relative in $criticalMovementFiles) {
    $path = Join-Path $RepoRoot $relative
    if (Test-Path $path) { $result[$relative] = (Get-FileHash -Algorithm SHA256 $path).Hash }
  }
  return $result
}

$beforeHashes = Get-CriticalHashes
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = Join-Path $RepoRoot ".map-finish-git-aligned-backup-$stamp"
New-Item -ItemType Directory -Force -Path $backup | Out-Null
$records = @()

function Backup-Target([string]$relative) {
  $target = Join-Path $RepoRoot $relative
  $exists = Test-Path $target
  $kind = if ($exists -and (Get-Item $target).PSIsContainer) { "directory" } else { "file" }
  $script:records += [pscustomobject]@{ path = $relative; existed = $exists; kind = $kind }
  if ($exists) {
    $dest = Join-Path $backup $relative
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dest) | Out-Null
    if ($kind -eq "directory") { Copy-Item -Recurse -Force $target $dest }
    else { Copy-Item -Force $target $dest }
  }
}

$touchTargets = @(
  "public/alpha/atlas-lod.js",
  "public/alpha/atlas-quality.css",
  "public/alpha/atlas-lod-manifest.json",
  "scripts/generate-atlas-lod.mjs",
  "tests/map-finish-git-aligned.test.mjs",
  "tests/fixtures/atlas-registration-v06d.json",
  "docs/handoffs/alpha-06d-map-finish-git-aligned.md",
  "public/alpha/index.html",
  "public/art/maps/lod"
)
foreach ($relative in $touchTargets) { Backup-Target $relative }

$beforeHashes | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 (Join-Path $backup "movement-hashes-before.json")
$records | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 (Join-Path $backup "backup-manifest.json")
Set-Content -Encoding UTF8 (Join-Path $RepoRoot ".map-finish-git-aligned-last-backup.txt") $backup

$payloadRoot = Join-Path $PackageRoot "payload"
Get-ChildItem -Path $payloadRoot -File -Recurse | ForEach-Object {
  $relative = $_.FullName.Substring($payloadRoot.Length).TrimStart('\','/')
  $target = Join-Path $RepoRoot $relative
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
  Copy-Item -Force $_.FullName $target
}

# Patch the launcher shell only; do not replace it.
$indexPath = Join-Path $RepoRoot "public/alpha/index.html"
$html = [IO.File]::ReadAllText($indexPath)
$newline = [Environment]::NewLine
if (-not $html.Contains('/alpha/atlas-quality.css')) {
  $needle = '  <link rel="stylesheet" href="/alpha/start-menu.css" />'
  if (-not $html.Contains($needle)) { $needle = '  <link rel="stylesheet" href="/alpha/styles.css" />' }
  if (-not $html.Contains($needle)) { throw "Could not find stylesheet insertion point in public/alpha/index.html" }
  $html = $html.Replace($needle, $needle + $newline + '  <link rel="stylesheet" href="/alpha/atlas-quality.css" />')
}
if (-not $html.Contains('/alpha/atlas-lod.js')) {
  $needle = '  <script type="module" src="/alpha/js/alpha/startMenu.js"></script>'
  $insert = '  <script type="module" src="/alpha/atlas-lod.js"></script>'
  if ($html.Contains($needle)) { $html = $html.Replace($needle, $needle + $newline + $insert) }
  elseif ($html.Contains('</body>')) { $html = $html.Replace('</body>', $insert + $newline + '</body>') }
  else { throw "Could not find script insertion point in public/alpha/index.html" }
}
[IO.File]::WriteAllText($indexPath, $html, [Text.UTF8Encoding]::new($false))

Push-Location $RepoRoot
try {
  if (-not (Test-Path "public/art/maps/world_atlas_labeled_v06d_master.webp")) { throw "Missing canonical atlas public/art/maps/world_atlas_labeled_v06d_master.webp" }
  node --check public/alpha/atlas-lod.js
  if ($LASTEXITCODE -ne 0) { throw "Atlas runtime syntax check failed." }

  node -e "import('sharp').then(()=>process.exit(0)).catch(()=>process.exit(1))"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Installing Sharp temporarily for deterministic atlas generation..."
    npm install --no-save --package-lock=false sharp@0.35.4
    if ($LASTEXITCODE -ne 0) { throw "Could not install Sharp." }
  }

  Write-Host "Generating registered 12k atlas tiles..."
  node scripts/generate-atlas-lod.mjs --level=atlas-12000-nav-tiles --activate --clean
  if ($LASTEXITCODE -ne 0) { throw "Atlas generation failed." }
  node scripts/generate-atlas-lod.mjs --level=atlas-12000-nav-tiles --verify-only
  if ($LASTEXITCODE -ne 0) { throw "Atlas verification failed." }

  Write-Host "Running Git-alignment / registration guard..."
  node --test tests/map-finish-git-aligned.test.mjs
  if ($LASTEXITCODE -ne 0) { throw "Map alignment tests failed." }

  # Read-only check of current TypeScript baseline. A failure is reported but the atlas package
  # does not rewrite TS sources, so it is not used to mutate or 'repair' unrelated systems.
  npm run typecheck:alpha
  if ($LASTEXITCODE -ne 0) { Write-Warning "Current project TypeScript check is not green. Atlas files installed without changing gameplay TS." }
} finally {
  Pop-Location
}

$afterHashes = Get-CriticalHashes
foreach ($relative in $beforeHashes.Keys) {
  if (-not $afterHashes.ContainsKey($relative)) { throw "Movement-critical file disappeared during install: $relative" }
  if ($beforeHashes[$relative] -ne $afterHashes[$relative]) { throw "Movement-critical file changed during atlas install: $relative" }
}
$afterHashes | ConvertTo-Json -Depth 4 | Set-Content -Encoding UTF8 (Join-Path $backup "movement-hashes-after.json")
Write-Host "MAP FINISH PASS 3 APPLIED: current Git navigation + Naval Audio Variation v2 preserved byte-for-byte; atlas LOD installed separately."
Write-Host "Backup: $backup"
