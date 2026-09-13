param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
    Write-Host ""
    Write-Host "HOTFIX FAILED: $Message" -ForegroundColor Red
    exit 1
}

function Replace-RegexOnce(
    [string]$Text,
    [string]$Pattern,
    [string]$Replacement,
    [string]$Label
) {
    $regex = [System.Text.RegularExpressions.Regex]::new(
        $Pattern,
        [System.Text.RegularExpressions.RegexOptions]::Singleline
    )
    $matches = $regex.Matches($Text)
    if ($matches.Count -ne 1) {
        Fail "${Label}: expected exactly 1 match, found $($matches.Count). The file may already be changed or differs from the audited build."
    }
    return $regex.Replace(
        $Text,
        [System.Text.RegularExpressions.MatchEvaluator]{
            param($m)
            return $Replacement
        },
        1
    )
}

$root = (Resolve-Path $ProjectRoot).Path
$srcPath = Join-Path $root "src\alpha\main.ts"
$jsPath  = Join-Path $root "public\alpha\js\alpha\main.js"

if (-not (Test-Path $srcPath)) { Fail "Could not find $srcPath" }
if (-not (Test-Path $jsPath))  { Fail "Could not find $jsPath" }

$src = [System.IO.File]::ReadAllText($srcPath)
$js  = [System.IO.File]::ReadAllText($jsPath)

$marker = "VOYAGE_AUTOMATION_CHUNK_STEPS"
if ($src.Contains($marker) -and $js.Contains($marker)) {
    Write-Host "Second navigation hotfix is already applied." -ForegroundColor Green
    exit 0
}
if ($src.Contains($marker) -xor $js.Contains($marker)) {
    Fail "Only one of source/browser runtime appears patched. Restore the pair from backup or a clean project copy before retrying."
}

$srcBackup = "$srcPath.pre-nav-chunk-hotfix.bak"
$jsBackup  = "$jsPath.pre-nav-chunk-hotfix.bak"
if (-not (Test-Path $srcBackup)) { Copy-Item $srcPath $srcBackup }
if (-not (Test-Path $jsBackup))  { Copy-Item $jsPath $jsBackup }

# ---------------------------------------------------------------------------
# 1) Source globals
# ---------------------------------------------------------------------------
$srcGlobalsOld = 'let toastTimer: number | undefined;'
$srcGlobalsNew = @'
let toastTimer: number | undefined;

// Long voyages used to run the complete deep-simulation loop inside one click
// handler. Keep the same 240-step safety ceiling, but process it in small browser
// chunks so rendering/input can run between simulation bursts.
const VOYAGE_AUTOMATION_CHUNK_STEPS=6;
const VOYAGE_AUTOMATION_RENDER_EVERY_STEPS=12;
const VOYAGE_AUTOMATION_MAX_STEPS=240;
let voyageAutomationActive=false;
let voyageAutomationRunId=0;
'@

if (-not $src.Contains($srcGlobalsOld)) { Fail "Source globals anchor not found." }
$src = $src.Replace($srcGlobalsOld, $srcGlobalsNew)

# ---------------------------------------------------------------------------
# 2) Source voyage runner
# ---------------------------------------------------------------------------
$srcVoyageReplacement = @'
function voyageAutomationFrame():Promise<void> {
  return new Promise((resolve)=>window.requestAnimationFrame(()=>resolve()));
}

function followVoyageCamera(s:GameState):void {
  const ship=getPlayerShip(s);
  if(!ship)return;
  if(mapCameraState){
    const center=clampCameraCenter(ship.position,mapCameraState.targetViewWidth);
    mapCameraState.targetX=center.x;
    mapCameraState.targetY=center.y;
  } else {
    mapCameraState=cameraForPoint(ship.position,initialCameraWidth(s));
  }
  scheduleMapCameraFrame();
}

function finishVoyageAutomation(result:ReturnType<typeof sailUntilInterrupted>,prefix:string|undefined,weatherEvents:string[],s:GameState):void {
  followVoyageCamera(s);
  lastSearchWatersResult=undefined;
  if(result.stopReason==="arrival"){ cue("bell"); selectedMapTarget=undefined; }
  else if(result.stopReason==="encounter") cue("bell");
  else cue("sail");
  const report=result.voyageReport;
  const reportNote=report?` · ${Math.round(report.distanceTravelledNm)} nm sailed · supplies ${report.suppliesUsed} used${report.suppliesExhausted?" / exhausted":""} · ${report.hullDamage||report.sailsDamage||report.riggingDamage?`damage H${report.hullDamage} S${report.sailsDamage} R${report.riggingDamage}`:"no ship damage"}`:weatherEvents.length?` · ${weatherEvents.length} weather event${weatherEvents.length===1?"":"s"} passed underway.`:"";
  toast(`${prefix?`${prefix} `:""}${result.message}${reportNote}`);
  tab="chart";
  renderGame();
  scheduleMapCameraFrame();
}

async function runVoyageUntilAttention(s:GameState,prefix?:string):Promise<void> {
  if(voyageAutomationActive){toast("Voyage simulation is already underway.");return;}
  voyageAutomationActive=true;
  const runId=++voyageAutomationRunId;
  const weatherEvents:string[]=[];
  let completedSteps=0;

  // Paint the chart immediately, retaining the player's existing zoom level.
  followVoyageCamera(s);
  lastSearchWatersResult=undefined;
  tab="chart";
  renderGame();
  scheduleMapCameraFrame();

  try {
    await voyageAutomationFrame();

    while(s===state && s.voyage && runId===voyageAutomationRunId && completedSteps<VOYAGE_AUTOMATION_MAX_STEPS){
      const chunkSteps=Math.min(VOYAGE_AUTOMATION_CHUNK_STEPS,VOYAGE_AUTOMATION_MAX_STEPS-completedSteps);
      const result=sailUntilInterrupted(s,undefined,chunkSteps);
      weatherEvents.push(...result.weatherEvents);

      // sailUntilInterrupted reports its normal maxSteps exhaustion as a guard
      // stop. Treat only that exact result as "yield and continue"; real voyage
      // failures still surface immediately.
      const chunkExhausted=result.stopReason==="guard"
        && !result.ok
        && result.message==="Voyage automation stopped at its safety limit."
        && Boolean(s.voyage);

      if(!chunkExhausted){
        finishVoyageAutomation(result,prefix,weatherEvents,s);
        return;
      }

      completedSteps+=chunkSteps;

      // Repaint periodically so the chart visibly follows long voyages without
      // resetting the user's chosen zoom level.
      if(completedSteps%VOYAGE_AUTOMATION_RENDER_EVERY_STEPS===0){
        followVoyageCamera(s);
        renderGame();
        scheduleMapCameraFrame();
      }

      await voyageAutomationFrame();
    }

    // A Stop action, loaded campaign, or other state replacement cancels this
    // async runner without letting a stale voyage repaint the new state.
    if(s!==state || runId!==voyageAutomationRunId || !s.voyage)return;

    followVoyageCamera(s);
    lastSearchWatersResult=undefined;
    cue("sail");
    const weatherNote=weatherEvents.length?` · ${weatherEvents.length} weather event${weatherEvents.length===1?"":"s"} passed underway.`:"";
    toast(`${prefix?`${prefix} `:""}Voyage automation paused after ${VOYAGE_AUTOMATION_MAX_STEPS} steps for safety.${weatherNote}`);
    tab="chart";
    renderGame();
    scheduleMapCameraFrame();
  } finally {
    if(runId===voyageAutomationRunId)voyageAutomationActive=false;
  }
}
'@

$src = Replace-RegexOnce `
    $src `
    'function runVoyageUntilAttention\(s:GameState,\s*prefix\?:string\):void\s*\{.*?\r?\n\}(?=\r?\n\r?\nfunction resolveEncounterAndResume)' `
    $srcVoyageReplacement `
    "source voyage runner"

# Block a double-click before beginNavigation mutates voyage state.
$srcBeginPattern = 'case\s+"begin-navigation":\s*\{\s*\r?\n\s*if\(!selectedMapTarget\)'
$srcBeginReplacement = @'
case "begin-navigation": {
      if(voyageAutomationActive){toast("Voyage simulation is already underway.");return;}
      if(!selectedMapTarget)
'@
$src = Replace-RegexOnce $src $srcBeginPattern $srcBeginReplacement "source begin-navigation guard"

# ---------------------------------------------------------------------------
# 3) Browser ESM globals
# ---------------------------------------------------------------------------
$jsGlobalsOld = 'let toastTimer;'
$jsGlobalsNew = @'
let toastTimer;
// Long voyages are advanced in small browser chunks so the UI can repaint and
// accept input between deep-simulation bursts.
const VOYAGE_AUTOMATION_CHUNK_STEPS = 6;
const VOYAGE_AUTOMATION_RENDER_EVERY_STEPS = 12;
const VOYAGE_AUTOMATION_MAX_STEPS = 240;
let voyageAutomationActive = false;
let voyageAutomationRunId = 0;
'@

if (-not $js.Contains($jsGlobalsOld)) { Fail "Browser runtime globals anchor not found." }
$js = $js.Replace($jsGlobalsOld, $jsGlobalsNew)

# ---------------------------------------------------------------------------
# 4) Browser ESM voyage runner
# ---------------------------------------------------------------------------
$jsVoyageReplacement = @'
function voyageAutomationFrame() {
    return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
}
function followVoyageCamera(s) {
    const ship = getPlayerShip(s);
    if (!ship)
        return;
    if (mapCameraState) {
        const center = clampCameraCenter(ship.position, mapCameraState.targetViewWidth);
        mapCameraState.targetX = center.x;
        mapCameraState.targetY = center.y;
    }
    else {
        mapCameraState = cameraForPoint(ship.position, initialCameraWidth(s));
    }
    scheduleMapCameraFrame();
}
function finishVoyageAutomation(result, prefix, weatherEvents, s) {
    followVoyageCamera(s);
    lastSearchWatersResult = undefined;
    if (result.stopReason === "arrival") {
        cue("bell");
        selectedMapTarget = undefined;
    }
    else if (result.stopReason === "encounter")
        cue("bell");
    else
        cue("sail");
    const report = result.voyageReport;
    const reportNote = report ? ` · ${Math.round(report.distanceTravelledNm)} nm sailed · supplies ${report.suppliesUsed} used${report.suppliesExhausted ? " / exhausted" : ""} · ${report.hullDamage || report.sailsDamage || report.riggingDamage ? `damage H${report.hullDamage} S${report.sailsDamage} R${report.riggingDamage}` : "no ship damage"}` : weatherEvents.length ? ` · ${weatherEvents.length} weather event${weatherEvents.length === 1 ? "" : "s"} passed underway.` : "";
    toast(`${prefix ? `${prefix} ` : ""}${result.message}${reportNote}`);
    tab = "chart";
    renderGame();
    scheduleMapCameraFrame();
}
async function runVoyageUntilAttention(s, prefix) {
    if (voyageAutomationActive) {
        toast("Voyage simulation is already underway.");
        return;
    }
    voyageAutomationActive = true;
    const runId = ++voyageAutomationRunId;
    const weatherEvents = [];
    let completedSteps = 0;
    followVoyageCamera(s);
    lastSearchWatersResult = undefined;
    tab = "chart";
    renderGame();
    scheduleMapCameraFrame();
    try {
        await voyageAutomationFrame();
        while (s === state && s.voyage && runId === voyageAutomationRunId && completedSteps < VOYAGE_AUTOMATION_MAX_STEPS) {
            const chunkSteps = Math.min(VOYAGE_AUTOMATION_CHUNK_STEPS, VOYAGE_AUTOMATION_MAX_STEPS - completedSteps);
            const result = sailUntilInterrupted(s, undefined, chunkSteps);
            weatherEvents.push(...result.weatherEvents);
            const chunkExhausted = result.stopReason === "guard"
                && !result.ok
                && result.message === "Voyage automation stopped at its safety limit."
                && Boolean(s.voyage);
            if (!chunkExhausted) {
                finishVoyageAutomation(result, prefix, weatherEvents, s);
                return;
            }
            completedSteps += chunkSteps;
            if (completedSteps % VOYAGE_AUTOMATION_RENDER_EVERY_STEPS === 0) {
                followVoyageCamera(s);
                renderGame();
                scheduleMapCameraFrame();
            }
            await voyageAutomationFrame();
        }
        if (s !== state || runId !== voyageAutomationRunId || !s.voyage)
            return;
        followVoyageCamera(s);
        lastSearchWatersResult = undefined;
        cue("sail");
        const weatherNote = weatherEvents.length ? ` · ${weatherEvents.length} weather event${weatherEvents.length === 1 ? "" : "s"} passed underway.` : "";
        toast(`${prefix ? `${prefix} ` : ""}Voyage automation paused after ${VOYAGE_AUTOMATION_MAX_STEPS} steps for safety.${weatherNote}`);
        tab = "chart";
        renderGame();
        scheduleMapCameraFrame();
    }
    finally {
        if (runId === voyageAutomationRunId)
            voyageAutomationActive = false;
    }
}
'@

$js = Replace-RegexOnce `
    $js `
    'function runVoyageUntilAttention\(s,\s*prefix\)\s*\{.*?\r?\n\}(?=\r?\nfunction resolveEncounterAndResume)' `
    $jsVoyageReplacement `
    "browser voyage runner"

$jsBeginPattern = 'case\s+"begin-navigation":\s*\{\s*\r?\n\s*if\s*\(!selectedMapTarget\)\s*\{'
$jsBeginReplacement = @'
case "begin-navigation": {
            if (voyageAutomationActive) {
                toast("Voyage simulation is already underway.");
                return;
            }
            if (!selectedMapTarget) {
'@
$js = Replace-RegexOnce $js $jsBeginPattern $jsBeginReplacement "browser begin-navigation guard"

# ---------------------------------------------------------------------------
# 5) Write both runtime/source copies after all transformations succeed.
# ---------------------------------------------------------------------------
[System.IO.File]::WriteAllText($srcPath, $src, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($jsPath,  $js,  [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "Second navigation hotfix applied." -ForegroundColor Green
Write-Host "Changed:"
Write-Host "  src\alpha\main.ts"
Write-Host "  public\alpha\js\alpha\main.js"
Write-Host ""
Write-Host "Backups:"
Write-Host "  $srcBackup"
Write-Host "  $jsBackup"

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    Write-Host ""
    Write-Host "Checking browser ESM syntax..."
    & node --check $jsPath
    if ($LASTEXITCODE -ne 0) {
        Fail "node --check failed. Restore the .bak files before launching the game."
    }
    Write-Host "Browser ESM syntax check passed." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Node was not found, so the optional browser syntax check was skipped." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "What changed:"
Write-Host "  - Same 240-step voyage safety ceiling"
Write-Host "  - Simulation runs 6 steps at a time"
Write-Host "  - Browser gets a frame between chunks"
Write-Host "  - Chart repaints every 12 steps"
Write-Host "  - Camera follows the ship without changing zoom"
Write-Host "  - Double-click voyage starts are guarded"
Write-Host "  - Stop/new state replacement cancels a stale async runner safely"
Write-Host ""
Write-Host "This hotfix does not change naval combat, route costs, economy logic, encounters, or world coordinates."
