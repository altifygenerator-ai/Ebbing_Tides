param(
  [string]$RepoRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
  throw $Message
}

$mainPath = Join-Path $RepoRoot "src\alpha\main.ts"
if (-not (Test-Path $mainPath)) {
  Fail "Could not find src\alpha\main.ts under: $RepoRoot"
}

$text = [IO.File]::ReadAllText($mainPath)

$old = @'
interface NavalAudioSnapshot {
  encounterId?:string;
  otherShipId?:string;
'@

$new = @'
interface NavalAudioSnapshot {
  encounterId:string|undefined;
  otherShipId:string|undefined;
'@

$count = ([regex]::Matches($text, [regex]::Escape($old))).Count
if ($count -ne 1) {
  Fail "Expected exactly one NavalAudioSnapshot interface anchor, found $count. Refusing to patch the wrong build."
}

$backup = "$mainPath.pre-naval-audio-v2-ts-fix.bak"
Copy-Item $mainPath $backup -Force

$text = $text.Replace($old, $new)
[IO.File]::WriteAllText($mainPath, $text, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ""
Write-Host "Naval Audio Variation v2 TypeScript compatibility fix applied."
Write-Host ""
Write-Host "Changed:"
Write-Host "  src\alpha\main.ts"
Write-Host ""
Write-Host "Runtime behavior: unchanged"
Write-Host "Browser JS: unchanged"
Write-Host "Save schema: unchanged"
Write-Host ""
Write-Host "Backup:"
Write-Host "  $backup"
Write-Host ""

$packageJson = Join-Path $RepoRoot "package.json"
if (Test-Path $packageJson) {
  Push-Location $RepoRoot
  try {
    Write-Host "Running Alpha TypeScript check..."
    npm run typecheck:alpha
    if ($LASTEXITCODE -ne 0) {
      Write-Warning "TypeScript check still reports an error. The compatibility fix was applied, but another unrelated error may remain."
      exit $LASTEXITCODE
    }
    Write-Host ""
    Write-Host "Alpha TypeScript check passed."
  }
  finally {
    Pop-Location
  }
}
