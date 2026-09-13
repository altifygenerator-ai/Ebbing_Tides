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
        Fail "${Label}: expected exactly 1 match, found $($matches.Count). The file may differ from the accepted v3.2 build."
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

if ($src.Contains("VOYAGE_VISUAL_TWEEN_V3_3") -and $js.Contains("VOYAGE_VISUAL_TWEEN_V3_3")) {
    Write-Host "Tideworn continuous-motion hotfix v3.3 is already applied." -ForegroundColor Green
    exit 0
}

if (-not $src.Contains("TIDEWORN_DIRECTIONAL_TOKEN_ASSETS") -or -not $js.Contains("TIDEWORN_DIRECTIONAL_TOKEN_ASSETS")) {
    Fail "Tideworn directional navigation was not detected. Apply v3.1 and v3.2 first."
}

if (-not $src.Contains("const VOYAGE_AUTOMATION_TARGET_FRAMES=48;") -or
    -not $src.Contains("const VOYAGE_AUTOMATION_FRAME_DELAY_MS=32;") -or
    -not $js.Contains("const VOYAGE_AUTOMATION_TARGET_FRAMES = 48;") -or
    -not $js.Contains("const VOYAGE_AUTOMATION_FRAME_DELAY_MS = 32;")) {
    Fail "The v3.2 smoothing constants were not found. This installer only patches the accepted v3.2 state."
}

$srcBackup = "$srcPath.pre-tideworn-nav-v3_3.bak"
$jsBackup  = "$jsPath.pre-tideworn-nav-v3_3.bak"
if (-not (Test-Path $srcBackup)) { Copy-Item $srcPath $srcBackup }
if (-not (Test-Path $jsBackup))  { Copy-Item $jsPath $jsBackup }

$srcCadence = @'
const VOYAGE_AUTOMATION_TARGET_FRAMES=32;
const VOYAGE_AUTOMATION_TWEEN_TARGET_MS=2300;
const VOYAGE_AUTOMATION_TWEEN_MIN_MS=58;
const VOYAGE_AUTOMATION_TWEEN_MAX_MS=140;
const VOYAGE_AUTOMATION_MAX_STEPS=240;
'@

$src = Replace-RegexOnce `
    $src `
    'const VOYAGE_AUTOMATION_TARGET_FRAMES=48;\s*const VOYAGE_AUTOMATION_FRAME_DELAY_MS=32;\s*const VOYAGE_AUTOMATION_MAX_STEPS=240;' `
    $srcCadence `
    "source voyage cadence"

$jsCadence = @'
const VOYAGE_AUTOMATION_TARGET_FRAMES = 32;
const VOYAGE_AUTOMATION_TWEEN_TARGET_MS = 2300;
const VOYAGE_AUTOMATION_TWEEN_MIN_MS = 58;
const VOYAGE_AUTOMATION_TWEEN_MAX_MS = 140;
const VOYAGE_AUTOMATION_MAX_STEPS = 240;
'@

$js = Replace-RegexOnce `
    $js `
    'const VOYAGE_AUTOMATION_TARGET_FRAMES = 48;\s*const VOYAGE_AUTOMATION_FRAME_DELAY_MS = 32;\s*const VOYAGE_AUTOMATION_MAX_STEPS = 240;' `
    $jsCadence `
    "browser voyage cadence"

$srcFrame = @'
function voyageAutomationFrame():Promise<void> {
  return new Promise((resolve)=>window.requestAnimationFrame(()=>resolve()));
}
'@

$src = Replace-RegexOnce `
    $src `
    'function voyageAutomationFrame\(\):Promise<void>\s*\{\s*return new Promise\(\(resolve\)=>window\.setTimeout\(\(\)=>window\.requestAnimationFrame\(\(\)=>resolve\(\)\),VOYAGE_AUTOMATION_FRAME_DELAY_MS\)\);\s*\}' `
    $srcFrame `
    "source voyage frame helper"

$jsFrame = @'
function voyageAutomationFrame() {
    return new Promise((resolve) => window.requestAnimationFrame(() => resolve()));
}
'@

$js = Replace-RegexOnce `
    $js `
    'function voyageAutomationFrame\(\)\s*\{\s*return new Promise\(\(resolve\)\s*=>\s*window\.setTimeout\(\(\)\s*=>\s*window\.requestAnimationFrame\(\(\)\s*=>\s*resolve\(\)\),\s*VOYAGE_AUTOMATION_FRAME_DELAY_MS\)\);\s*\}' `
    $jsFrame `
    "browser voyage frame helper"

$srcTweenHelpers = @'
// VOYAGE_VISUAL_TWEEN_V3_3
interface RouteProjectionSample { distance:number; distanceSq:number; }
interface RouteVisualSample { position:GridPoint; heading:CardinalHeading; }

let tidewornTokensPreloaded=false;

function preloadTidewornDirectionalTokens():void {
  if(tidewornTokensPreloaded)return;
  tidewornTokensPreloaded=true;
  for(const assetId of Object.values(TIDEWORN_DIRECTIONAL_TOKEN_ASSETS)){
    const path=ASSET_BY_ID[assetId]?.path;
    if(!path)continue;
    const image=new Image();
    image.src=path;
  }
}

function projectPointToRoute(position:GridPoint,path:GridPoint[]):RouteProjectionSample {
  if(path.length<2)return {distance:0,distanceSq:0};
  let cumulative=0;
  let bestDistance=0;
  let bestDistanceSq=Number.POSITIVE_INFINITY;

  for(let i=0;i<path.length-1;i+=1){
    const a=path[i]!;
    const b=path[i+1]!;
    const dx=b.x-a.x;
    const dy=b.y-a.y;
    const segmentLength=Math.hypot(dx,dy);
    if(segmentLength<=1e-9)continue;
    const lengthSq=segmentLength*segmentLength;
    const t=Math.max(0,Math.min(1,((position.x-a.x)*dx+(position.y-a.y)*dy)/lengthSq));
    const px=a.x+dx*t;
    const py=a.y+dy*t;
    const distanceSq=(position.x-px)*(position.x-px)+(position.y-py)*(position.y-py);
    const routeDistance=cumulative+segmentLength*t;

    if(distanceSq<=bestDistanceSq+1e-9){
      bestDistanceSq=distanceSq;
      bestDistance=routeDistance;
    }
    cumulative+=segmentLength;
  }

  return {distance:bestDistance,distanceSq:bestDistanceSq};
}

function sampleRouteAtDistance(path:GridPoint[],distance:number,fallback:CardinalHeading):RouteVisualSample {
  if(path.length<2){
    const point=path[0]??{x:0,y:0};
    return {position:{...point},heading:fallback};
  }

  let remaining=Math.max(0,distance);
  for(let i=0;i<path.length-1;i+=1){
    const a=path[i]!;
    const b=path[i+1]!;
    const dx=b.x-a.x;
    const dy=b.y-a.y;
    const length=Math.hypot(dx,dy);
    if(length<=1e-9)continue;
    const isLast=i===path.length-2;
    if(remaining<=length||isLast){
      const t=Math.max(0,Math.min(1,remaining/length));
      return {
        position:{x:a.x+dx*t,y:a.y+dy*t},
        heading:cardinalHeadingForDelta(dx,dy,fallback)
      };
    }
    remaining-=length;
  }

  const last=path[path.length-1]!;
  return {position:{...last},heading:fallback};
}

function applyTidewornVisualState(position:GridPoint,heading:CardinalHeading):void {
  playerMapHeading=heading;
  const token=document.querySelector<SVGImageElement>(".player-map-token");
  if(token){
    const tokenPath=ASSET_BY_ID[TIDEWORN_DIRECTIONAL_TOKEN_ASSETS[heading]]?.path;
    if(tokenPath&&token.getAttribute("href")!==tokenPath)token.setAttribute("href",tokenPath);
    token.setAttribute("x",String(position.x-.25));
    token.setAttribute("y",String(position.y-.35));
  }

  if(mapCameraState){
    const center=clampCameraCenter(position,mapCameraState.targetViewWidth);
    mapCameraState.targetX=center.x;
    mapCameraState.targetY=center.y;
    scheduleMapCameraFrame();
  }
}

function animateTidewornVisualTravel(
  s:GameState,
  from:GridPoint,
  to:GridPoint,
  path:GridPoint[],
  durationMs:number,
  runId:number
):Promise<boolean> {
  const startProjection=projectPointToRoute(from,path);
  const endProjection=projectPointToRoute(to,path);
  const useRoute=path.length>1
    && Number.isFinite(startProjection.distance)
    && Number.isFinite(endProjection.distance)
    && endProjection.distance>=startProjection.distance-1e-6;
  const duration=Math.max(1,durationMs);

  return new Promise((resolve)=>{
    const startedAt=performance.now();

    const tick=(now:number)=>{
      if(s!==state||runId!==voyageAutomationRunId){
        resolve(false);
        return;
      }

      const t=Math.max(0,Math.min(1,(now-startedAt)/duration));
      let sample:RouteVisualSample;

      if(useRoute){
        const routeDistance=startProjection.distance+(endProjection.distance-startProjection.distance)*t;
        sample=sampleRouteAtDistance(path,routeDistance,playerMapHeading);
      }else{
        const dx=to.x-from.x;
        const dy=to.y-from.y;
        sample={
          position:{x:from.x+dx*t,y:from.y+dy*t},
          heading:cardinalHeadingForDelta(dx,dy,playerMapHeading)
        };
      }

      applyTidewornVisualState(sample.position,sample.heading);

      if(t>=1){
        resolve(true);
        return;
      }
      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  });
}
'@

if (-not $src.Contains("function finishVoyageAutomation(")) { Fail "source finishVoyageAutomation anchor not found." }
$src = $src.Replace("function finishVoyageAutomation(", $srcTweenHelpers + "function finishVoyageAutomation(")

$jsTweenHelpers = @'
// VOYAGE_VISUAL_TWEEN_V3_3
let tidewornTokensPreloaded = false;
function preloadTidewornDirectionalTokens() {
    if (tidewornTokensPreloaded)
        return;
    tidewornTokensPreloaded = true;
    for (const assetId of Object.values(TIDEWORN_DIRECTIONAL_TOKEN_ASSETS)) {
        const path = ASSET_BY_ID[assetId]?.path;
        if (!path)
            continue;
        const image = new Image();
        image.src = path;
    }
}
function projectPointToRoute(position, path) {
    if (path.length < 2)
        return { distance: 0, distanceSq: 0 };
    let cumulative = 0;
    let bestDistance = 0;
    let bestDistanceSq = Number.POSITIVE_INFINITY;
    for (let i = 0; i < path.length - 1; i += 1) {
        const a = path[i];
        const b = path[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const segmentLength = Math.hypot(dx, dy);
        if (segmentLength <= 1e-9)
            continue;
        const lengthSq = segmentLength * segmentLength;
        const t = Math.max(0, Math.min(1, ((position.x - a.x) * dx + (position.y - a.y) * dy) / lengthSq));
        const px = a.x + dx * t;
        const py = a.y + dy * t;
        const distanceSq = (position.x - px) * (position.x - px) + (position.y - py) * (position.y - py);
        const routeDistance = cumulative + segmentLength * t;
        if (distanceSq <= bestDistanceSq + 1e-9) {
            bestDistanceSq = distanceSq;
            bestDistance = routeDistance;
        }
        cumulative += segmentLength;
    }
    return { distance: bestDistance, distanceSq: bestDistanceSq };
}
function sampleRouteAtDistance(path, distance, fallback) {
    if (path.length < 2) {
        const point = path[0] ?? { x: 0, y: 0 };
        return { position: { ...point }, heading: fallback };
    }
    let remaining = Math.max(0, distance);
    for (let i = 0; i < path.length - 1; i += 1) {
        const a = path[i];
        const b = path[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.hypot(dx, dy);
        if (length <= 1e-9)
            continue;
        const isLast = i === path.length - 2;
        if (remaining <= length || isLast) {
            const t = Math.max(0, Math.min(1, remaining / length));
            return {
                position: { x: a.x + dx * t, y: a.y + dy * t },
                heading: cardinalHeadingForDelta(dx, dy, fallback)
            };
        }
        remaining -= length;
    }
    const last = path[path.length - 1];
    return { position: { ...last }, heading: fallback };
}
function applyTidewornVisualState(position, heading) {
    playerMapHeading = heading;
    const token = document.querySelector(".player-map-token");
    if (token) {
        const tokenPath = ASSET_BY_ID[TIDEWORN_DIRECTIONAL_TOKEN_ASSETS[heading]]?.path;
        if (tokenPath && token.getAttribute("href") !== tokenPath)
            token.setAttribute("href", tokenPath);
        token.setAttribute("x", String(position.x - .25));
        token.setAttribute("y", String(position.y - .35));
    }
    if (mapCameraState) {
        const center = clampCameraCenter(position, mapCameraState.targetViewWidth);
        mapCameraState.targetX = center.x;
        mapCameraState.targetY = center.y;
        scheduleMapCameraFrame();
    }
}
function animateTidewornVisualTravel(s, from, to, path, durationMs, runId) {
    const startProjection = projectPointToRoute(from, path);
    const endProjection = projectPointToRoute(to, path);
    const useRoute = path.length > 1
        && Number.isFinite(startProjection.distance)
        && Number.isFinite(endProjection.distance)
        && endProjection.distance >= startProjection.distance - 1e-6;
    const duration = Math.max(1, durationMs);
    return new Promise((resolve) => {
        const startedAt = performance.now();
        const tick = (now) => {
            if (s !== state || runId !== voyageAutomationRunId) {
                resolve(false);
                return;
            }
            const t = Math.max(0, Math.min(1, (now - startedAt) / duration));
            let sample;
            if (useRoute) {
                const routeDistance = startProjection.distance + (endProjection.distance - startProjection.distance) * t;
                sample = sampleRouteAtDistance(path, routeDistance, playerMapHeading);
            }
            else {
                const dx = to.x - from.x;
                const dy = to.y - from.y;
                sample = {
                    position: { x: from.x + dx * t, y: from.y + dy * t },
                    heading: cardinalHeadingForDelta(dx, dy, playerMapHeading)
                };
            }
            applyTidewornVisualState(sample.position, sample.heading);
            if (t >= 1) {
                resolve(true);
                return;
            }
            window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
    });
}
'@

if (-not $js.Contains("function finishVoyageAutomation(")) { Fail "browser finishVoyageAutomation anchor not found." }
$js = $js.Replace("function finishVoyageAutomation(", $jsTweenHelpers + "function finishVoyageAutomation(")

$srcRunner = @'
async function runVoyageUntilAttention(s:GameState,prefix?:string):Promise<void> {
  if(voyageAutomationActive){toast("Voyage simulation is already underway.");return;}
  voyageAutomationActive=true;
  const runId=++voyageAutomationRunId;
  const weatherEvents:string[]=[];
  let completedSteps=0;

  const estimatedSteps=Math.max(1,Math.min(
    VOYAGE_AUTOMATION_MAX_STEPS,
    Math.ceil(currentVoyageEtaHours(s)/PLAYER_VOYAGE_SUPPLY_STEP_HOURS)
  ));
  const stepsPerFrame=Math.max(1,Math.ceil(estimatedSteps/VOYAGE_AUTOMATION_TARGET_FRAMES));
  const plannedSegments=Math.max(1,Math.ceil(estimatedSteps/stepsPerFrame));
  const tweenDurationMs=Math.max(
    VOYAGE_AUTOMATION_TWEEN_MIN_MS,
    Math.min(VOYAGE_AUTOMATION_TWEEN_MAX_MS,VOYAGE_AUTOMATION_TWEEN_TARGET_MS/plannedSegments)
  );

  preloadTidewornDirectionalTokens();
  followVoyageCamera(s);
  updateTidewornHeading(s);
  lastSearchWatersResult=undefined;
  tab="chart";
  renderGame();
  scheduleMapCameraFrame();

  try {
    await voyageAutomationFrame();

    while(s===state&&s.voyage&&runId===voyageAutomationRunId&&completedSteps<VOYAGE_AUTOMATION_MAX_STEPS){
      const ship=getPlayerShip(s);
      if(!ship)return;

      const from={...ship.position};
      const activePath=s.voyage.path.map((point)=>({...point}));
      const chunkSteps=Math.min(stepsPerFrame,VOYAGE_AUTOMATION_MAX_STEPS-completedSteps);
      const result=sailUntilInterrupted(s,undefined,chunkSteps);
      weatherEvents.push(...result.weatherEvents);
      const to={...ship.position};

      const visualCompleted=await animateTidewornVisualTravel(
        s,from,to,activePath,tweenDurationMs,runId
      );
      if(!visualCompleted)return;

      const chunkExhausted=result.stopReason==="guard"
        && !result.ok
        && result.message==="Voyage automation stopped at its safety limit."
        && Boolean(s.voyage);

      if(!chunkExhausted){
        finishVoyageAutomation(result,prefix,weatherEvents,s);
        return;
      }

      completedSteps+=chunkSteps;
      if(!s.voyage)return;
    }

    if(s!==state||runId!==voyageAutomationRunId||!s.voyage)return;

    followVoyageCamera(s);
    updateTidewornHeading(s);
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
    'async function runVoyageUntilAttention\(s:GameState,\s*prefix\?:string\):Promise<void>\s*\{.*?\r?\n\}(?=\r?\n\r?\nfunction resolveEncounterAndResume)' `
    $srcRunner `
    "source continuous voyage runner"

$jsRunner = @'
async function runVoyageUntilAttention(s, prefix) {
    if (voyageAutomationActive) {
        toast("Voyage simulation is already underway.");
        return;
    }
    voyageAutomationActive = true;
    const runId = ++voyageAutomationRunId;
    const weatherEvents = [];
    let completedSteps = 0;
    const estimatedSteps = Math.max(1, Math.min(VOYAGE_AUTOMATION_MAX_STEPS, Math.ceil(currentVoyageEtaHours(s) / PLAYER_VOYAGE_SUPPLY_STEP_HOURS)));
    const stepsPerFrame = Math.max(1, Math.ceil(estimatedSteps / VOYAGE_AUTOMATION_TARGET_FRAMES));
    const plannedSegments = Math.max(1, Math.ceil(estimatedSteps / stepsPerFrame));
    const tweenDurationMs = Math.max(VOYAGE_AUTOMATION_TWEEN_MIN_MS, Math.min(VOYAGE_AUTOMATION_TWEEN_MAX_MS, VOYAGE_AUTOMATION_TWEEN_TARGET_MS / plannedSegments));
    preloadTidewornDirectionalTokens();
    followVoyageCamera(s);
    updateTidewornHeading(s);
    lastSearchWatersResult = undefined;
    tab = "chart";
    renderGame();
    scheduleMapCameraFrame();
    try {
        await voyageAutomationFrame();
        while (s === state && s.voyage && runId === voyageAutomationRunId && completedSteps < VOYAGE_AUTOMATION_MAX_STEPS) {
            const ship = getPlayerShip(s);
            if (!ship)
                return;
            const from = { ...ship.position };
            const activePath = s.voyage.path.map((point) => ({ ...point }));
            const chunkSteps = Math.min(stepsPerFrame, VOYAGE_AUTOMATION_MAX_STEPS - completedSteps);
            const result = sailUntilInterrupted(s, undefined, chunkSteps);
            weatherEvents.push(...result.weatherEvents);
            const to = { ...ship.position };
            const visualCompleted = await animateTidewornVisualTravel(s, from, to, activePath, tweenDurationMs, runId);
            if (!visualCompleted)
                return;
            const chunkExhausted = result.stopReason === "guard"
                && !result.ok
                && result.message === "Voyage automation stopped at its safety limit."
                && Boolean(s.voyage);
            if (!chunkExhausted) {
                finishVoyageAutomation(result, prefix, weatherEvents, s);
                return;
            }
            completedSteps += chunkSteps;
            if (!s.voyage)
                return;
        }
        if (s !== state || runId !== voyageAutomationRunId || !s.voyage)
            return;
        followVoyageCamera(s);
        updateTidewornHeading(s);
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
    'async function runVoyageUntilAttention\(s,\s*prefix\)\s*\{.*?\r?\n\}(?=\r?\nfunction resolveEncounterAndResume)' `
    $jsRunner `
    "browser continuous voyage runner"

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
Write-Host "Tideworn continuous-motion hotfix v3.3 applied." -ForegroundColor Green
Write-Host ""
Write-Host "Movement changes:"
Write-Host "  - Tideworn now moves continuously at animation-frame cadence"
Write-Host "  - visual movement follows the actual plotted route through turns"
Write-Host "  - N/E/S/W token art switches as Tideworn enters each route leg"
Write-Host "  - camera follows the interpolated ship position instead of simulation jumps"
Write-Host "  - directional token images are preloaded before travel"
Write-Host "  - the full chart DOM is no longer rebuilt at every movement tick"
Write-Host "  - long normal voyages still target about 2.3 seconds visually"
Write-Host ""
Write-Host "No travel math, supplies, weather, encounters, economy, save schema, or naval-combat mechanics were changed."
