param([string]$RepoRoot = ".")
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$PackageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = (Resolve-Path $RepoRoot).Path
if (-not (Test-Path (Join-Path $RepoRoot "package.json"))) { throw "Run this from the Ebbing_Tides repository root." }

$mainPath = Join-Path $RepoRoot "src/alpha/main.ts"
$mainText = [IO.File]::ReadAllText($mainPath)
foreach ($anchor in @(
  'async function runVoyageUntilAttention',
  'VOYAGE_AUTOMATION_TWEEN_TARGET_MS=3000',
  'let navalAudioEncounterId',
  'let navalOpeningRoundVolleyPlayed=false',
  'cue("cannon_round")',
  'cue("cannon")'
)) {
  if (-not $mainText.Contains($anchor)) { throw "Required current nav/audio baseline is missing: $anchor" }
}

$backup = Join-Path $RepoRoot ('.map-finish-master-source-enhancement-pass6-backup-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Force -Path $backup | Out-Null
$payloadRoot = Join-Path $PackageRoot 'payload'
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
foreach ($relative in $touchTargets) {
  $target = Join-Path $RepoRoot $relative
  if (Test-Path $target) {
    $dest = Join-Path $backup $relative
    New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dest) | Out-Null
    Copy-Item -Recurse -Force $target $dest
  }
}

Get-ChildItem -Path $payloadRoot -File -Recurse | ForEach-Object {
  $relative = $_.FullName.Substring($payloadRoot.Length).TrimStart([char]92,[char]47)
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
  $html = $html.Replace($needle, $needle + $newline + '  <link rel="stylesheet" href="/alpha/atlas-quality.css" />')
}
if (-not $html.Contains('/alpha/atlas-lod.js')) {
  $needle = '  <script type="module" src="/alpha/js/alpha/startMenu.js"></script>'
  $insert = '  <script type="module" src="/alpha/atlas-lod.js"></script>'
  if ($html.Contains($needle)) { $html = $html.Replace($needle, $needle + $newline + $insert) }
  else { $html = $html.Replace('</body>', $insert + $newline + '</body>') }
}
[IO.File]::WriteAllText($indexPath, $html, [Text.UTF8Encoding]::new($false))

Push-Location $RepoRoot
try {
  if (-not (Test-Path 'public/art/maps/world_atlas_labeled_v06d_master.webp')) { throw 'Missing public/art/maps/world_atlas_labeled_v06d_master.webp' }
  node --check public/alpha/atlas-lod.js
  node --check scripts/generate-atlas-lod.mjs
  node --check tests/map-finish-git-aligned.test.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Syntax check failed.' }

  node -e "import('sharp').then(()=>process.exit(0)).catch(()=>process.exit(1))"
  if ($LASTEXITCODE -ne 0) {
    Write-Host 'Installing Sharp temporarily for atlas generation...'
    npm install --no-save --package-lock=false sharp@0.35.4
    if ($LASTEXITCODE -ne 0) { throw 'Could not install Sharp.' }
  }

  Write-Host 'Generating enhanced 12k navigation tier from the 6000x4000 master...'
  node scripts/generate-atlas-lod.mjs --level=atlas-12000-nav-tiles --activate --clean
  if ($LASTEXITCODE -ne 0) { throw '12k generation failed.' }
  node scripts/generate-atlas-lod.mjs --level=atlas-12000-nav-tiles --verify-only
  if ($LASTEXITCODE -ne 0) { throw '12k verification failed.' }

  Write-Host 'Generating enhanced 24k close tier from the 6000x4000 master...'
  node scripts/generate-atlas-lod.mjs --level=atlas-24000-close-tiles --activate --clean
  if ($LASTEXITCODE -ne 0) { throw '24k generation failed.' }
  node scripts/generate-atlas-lod.mjs --level=atlas-24000-close-tiles --verify-only
  if ($LASTEXITCODE -ne 0) { throw '24k verification failed.' }

  node --test tests/map-finish-git-aligned.test.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Map guards failed.' }
  npm run typecheck:alpha
  if ($LASTEXITCODE -ne 0) { Write-Warning 'Current project TypeScript check is not green. Atlas files installed without changing gameplay TS.' }
}
finally { Pop-Location }

Write-Host 'MAP FINISH MASTER-SOURCE ENHANCEMENT PASS 6.1 APPLIED: marker-safe atlas runtime preserved, enhanced tiles regenerated from the true 6000x4000 master.'
Write-Host "Backup: $backup"
