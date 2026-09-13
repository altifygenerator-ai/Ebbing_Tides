param(
    [string]$ProjectRoot = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

function Fail([string]$Message) {
    Write-Host ""
    Write-Host "HOTFIX FAILED: $Message" -ForegroundColor Red
    exit 1
}

function Replace-LiteralOnce(
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
        Fail "${Label}: expected exactly 1 match, found $($matches.Count). The file may differ from the audited build."
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

function Insert-BeforeFinalArrayClose(
    [string]$Text,
    [string]$Insertion,
    [string]$Label
) {
    $marker = "];"
    $index = $Text.LastIndexOf($marker, [System.StringComparison]::Ordinal)
    if ($index -lt 0) {
        Fail "${Label}: could not find final array close."
    }
    return $Text.Substring(0, $index) + $Insertion + "`r`n" + $Text.Substring($index)
}

$root = (Resolve-Path $ProjectRoot).Path

$srcMain       = Join-Path $root "src\alpha\main.ts"
$jsMain        = Join-Path $root "public\alpha\js\alpha\main.js"
$srcAssets     = Join-Path $root "src\data\seed\assets.ts"
$jsAssets      = Join-Path $root "public\alpha\js\data\seed\assets.js"
$srcCreateGame = Join-Path $root "src\game\createGame.ts"
$jsCreateGame  = Join-Path $root "public\alpha\js\game\createGame.js"

$targets = @($srcMain,$jsMain,$srcAssets,$jsAssets,$srcCreateGame,$jsCreateGame)
foreach ($path in $targets) {
    if (-not (Test-Path $path)) { Fail "Could not find $path" }
}

# The art already exists in the repository. Refuse to wire dead paths.
$requiredArt = @(
    "public\art\ships\production1h\tideworn\tideworn_fjord_cutter_portrait_pristine.png",
    "public\art\ships\production1h\tideworn\128px\tideworn_token_north_128.png",
    "public\art\ships\production1h\tideworn\128px\tideworn_token_east_128.png",
    "public\art\ships\production1h\tideworn\128px\tideworn_token_south_128.png",
    "public\art\ships\production1h\tideworn\128px\tideworn_token_west_128.png"
)
foreach ($relative in $requiredArt) {
    $full = Join-Path $root $relative
    if (-not (Test-Path $full)) {
        Fail "Required Tideworn art is missing: $relative. Pull the current git files before applying this hotfix."
    }
}

$srcMainText       = [System.IO.File]::ReadAllText($srcMain)
$jsMainText        = [System.IO.File]::ReadAllText($jsMain)
$srcAssetsText     = [System.IO.File]::ReadAllText($srcAssets)
$jsAssetsText      = [System.IO.File]::ReadAllText($jsAssets)
$srcCreateGameText = [System.IO.File]::ReadAllText($srcCreateGame)
$jsCreateGameText  = [System.IO.File]::ReadAllText($jsCreateGame)

$marker = "TIDEWORN_DIRECTIONAL_TOKEN_ASSETS"
if ($srcMainText.Contains($marker) -and $jsMainText.Contains($marker)) {
    Write-Host "Tideworn directional navigation hotfix is already applied." -ForegroundColor Green
    exit 0
}
if ($srcMainText.Contains($marker) -xor $jsMainText.Contains($marker)) {
    Fail "Only one runtime copy appears patched. Restore the pair from backup before retrying."
}

# Require the previous non-blocking voyage hotfix, because this patch refines it.
if (-not $srcMainText.Contains("voyageAutomationActive") -or -not $jsMainText.Contains("voyageAutomationActive")) {
    Fail "Navigation Hotfix 2.1 was not detected. Apply that first, then run this patch."
}

# Back up every file before making changes.
foreach ($path in $targets) {
    $backup = "$path.pre-tideworn-nav-v3_1.bak"
    if (-not (Test-Path $backup)) {
        Copy-Item $path $backup
    }
}

# ---------------------------------------------------------------------------
# 1) Register the canonical Tideworn portrait and four runtime directional tokens.
# ---------------------------------------------------------------------------
$assetEntries = @'
,
  {
    assetId: "ship.named.tideworn.portrait.pristine",
    displayName: "Tideworn Fjord Cutter — Pristine Portrait",
    type: "SHIP_REFERENCE",
    category: "ship_portrait",
    subcategory: "named_ship_portrait",
    region: "skeldra",
    status: "APPROVED_ANCHOR",
    artStyleVersion: "PRODUCTION_1H",
    regionalStyleVersion: "skeldra.ship.production1h",
    era: "628 CR",
    gameplayRole: ["ship_management","inspection","combat_portrait"],
    path: "/art/ships/production1h/tideworn/tideworn_fjord_cutter_portrait_pristine.png",
    sourceMaster: "Production 1H Tideworn approval set",
    notes: "Canonical pristine Tideworn portrait. Named-ship art overrides generic Fjord Cutter inspection art."
  },
  {
    assetId: "ship.named.tideworn.token.north",
    displayName: "Tideworn Token — North",
    type: "SHIP_TOKEN",
    category: "ship_token",
    subcategory: "named_ship_directional_token",
    region: "skeldra",
    status: "APPROVED",
    artStyleVersion: "PRODUCTION_1H",
    regionalStyleVersion: "skeldra.ship.production1h",
    era: "628 CR",
    gameplayRole: ["navigation","directional_ship_token"],
    path: "/art/ships/production1h/tideworn/128px/tideworn_token_north_128.png",
    sourceMaster: "Production 1H Tideworn approval set",
    notes: "Runtime 128px Tideworn token; bow at 12 o'clock."
  },
  {
    assetId: "ship.named.tideworn.token.east",
    displayName: "Tideworn Token — East",
    type: "SHIP_TOKEN",
    category: "ship_token",
    subcategory: "named_ship_directional_token",
    region: "skeldra",
    status: "APPROVED",
    artStyleVersion: "PRODUCTION_1H",
    regionalStyleVersion: "skeldra.ship.production1h",
    era: "628 CR",
    gameplayRole: ["navigation","directional_ship_token"],
    path: "/art/ships/production1h/tideworn/128px/tideworn_token_east_128.png",
    sourceMaster: "Production 1H Tideworn approval set",
    notes: "Runtime 128px Tideworn token; bow at 3 o'clock."
  },
  {
    assetId: "ship.named.tideworn.token.south",
    displayName: "Tideworn Token — South",
    type: "SHIP_TOKEN",
    category: "ship_token",
    subcategory: "named_ship_directional_token",
    region: "skeldra",
    status: "APPROVED",
    artStyleVersion: "PRODUCTION_1H",
    regionalStyleVersion: "skeldra.ship.production1h",
    era: "628 CR",
    gameplayRole: ["navigation","directional_ship_token"],
    path: "/art/ships/production1h/tideworn/128px/tideworn_token_south_128.png",
    sourceMaster: "Production 1H Tideworn approval set",
    notes: "Runtime 128px Tideworn token; bow at 6 o'clock."
  },
  {
    assetId: "ship.named.tideworn.token.west",
    displayName: "Tideworn Token — West",
    type: "SHIP_TOKEN",
    category: "ship_token",
    subcategory: "named_ship_directional_token",
    region: "skeldra",
    status: "APPROVED",
    artStyleVersion: "PRODUCTION_1H",
    regionalStyleVersion: "skeldra.ship.production1h",
    era: "628 CR",
    gameplayRole: ["navigation","directional_ship_token"],
    path: "/art/ships/production1h/tideworn/128px/tideworn_token_west_128.png",
    sourceMaster: "Production 1H Tideworn approval set",
    notes: "Runtime 128px Tideworn token; bow at 9 o'clock."
  }
'@

if (-not $srcAssetsText.Contains('assetId: "ship.named.tideworn.portrait.pristine"')) {
    $srcAssetsText = Insert-BeforeFinalArrayClose $srcAssetsText $assetEntries "source asset registry"
}
if (-not $jsAssetsText.Contains('assetId: "ship.named.tideworn.portrait.pristine"')) {
    $jsAssetsText = Insert-BeforeFinalArrayClose $jsAssetsText $assetEntries "browser asset registry"
}

# ---------------------------------------------------------------------------
# 2) New games store the named portrait and north token as their canonical defaults.
# Existing saves are also handled by render-time Tideworn overrides below.
# ---------------------------------------------------------------------------
$srcCreateGameText = Replace-LiteralOnce `
    $srcCreateGameText `
    'artAssetId: "ship.named.tideworn.token",' `
    'artAssetId: "ship.named.tideworn.portrait.pristine",' `
    "source Tideworn portrait id"

$srcCreateGameText = Replace-LiteralOnce `
    $srcCreateGameText `
    'tokenAssetId: "ship.named.tideworn.token",' `
    'tokenAssetId: "ship.named.tideworn.token.north",' `
    "source Tideworn token id"

$jsCreateGameText = Replace-LiteralOnce `
    $jsCreateGameText `
    'artAssetId: "ship.named.tideworn.token",' `
    'artAssetId: "ship.named.tideworn.portrait.pristine",' `
    "browser Tideworn portrait id"

$jsCreateGameText = Replace-LiteralOnce `
    $jsCreateGameText `
    'tokenAssetId: "ship.named.tideworn.token",' `
    'tokenAssetId: "ship.named.tideworn.token.north",' `
    "browser Tideworn token id"

# ---------------------------------------------------------------------------
# 3) Import the authoritative two-hour player voyage step for adaptive pacing.
# ---------------------------------------------------------------------------
$srcImportPattern = 'import \{([^}]*)currentVoyageEtaHours,([^}]*)estimateVoyageSupplyUnits,([^}]*)\} from "\.\./game/travel\.js";'
$srcImportMatch = [System.Text.RegularExpressions.Regex]::Match($srcMainText, $srcImportPattern)
if (-not $srcImportMatch.Success) { Fail "source travel import anchor not found." }
if (-not $srcImportMatch.Value.Contains("PLAYER_VOYAGE_SUPPLY_STEP_HOURS")) {
    $newImport = $srcImportMatch.Value.Replace(
        "currentVoyageEtaHours,",
        "currentVoyageEtaHours, PLAYER_VOYAGE_SUPPLY_STEP_HOURS,"
    )
    $srcMainText = $srcMainText.Substring(0,$srcImportMatch.Index) + $newImport + $srcMainText.Substring($srcImportMatch.Index + $srcImportMatch.Length)
}

$jsImportPattern = 'import \{([^}]*)currentVoyageEtaHours,([^}]*)estimateVoyageSupplyUnits,([^}]*)\} from "\.\./game/travel\.js";'
$jsImportMatch = [System.Text.RegularExpressions.Regex]::Match($jsMainText, $jsImportPattern)
if (-not $jsImportMatch.Success) { Fail "browser travel import anchor not found." }
if (-not $jsImportMatch.Value.Contains("PLAYER_VOYAGE_SUPPLY_STEP_HOURS")) {
    $newImport = $jsImportMatch.Value.Replace(
        "currentVoyageEtaHours,",
        "currentVoyageEtaHours, PLAYER_VOYAGE_SUPPLY_STEP_HOURS,"
    )
    $jsMainText = $jsMainText.Substring(0,$jsImportMatch.Index) + $newImport + $jsMainText.Substring($jsImportMatch.Index + $jsImportMatch.Length)
}

# ---------------------------------------------------------------------------
# 4) Replace Hotfix 2.1's fixed six-step cadence with a ~30-frame voyage pass.
# Long routes remain only a couple seconds; shorter routes visibly move.
# ---------------------------------------------------------------------------
$srcCadenceReplacement = @'
const VOYAGE_AUTOMATION_TARGET_FRAMES=30;
const VOYAGE_AUTOMATION_FRAME_DELAY_MS=75;
const VOYAGE_AUTOMATION_MAX_STEPS=240;
let voyageAutomationActive=false;
let voyageAutomationRunId=0;

type CardinalHeading="north"|"east"|"south"|"west";
const TIDEWORN_DIRECTIONAL_TOKEN_ASSETS:Record<CardinalHeading,string>={
  north:"ship.named.tideworn.token.north",
  east:"ship.named.tideworn.token.east",
  south:"ship.named.tideworn.token.south",
  west:"ship.named.tideworn.token.west"
};
let playerMapHeading:CardinalHeading="north";
'@

$srcMainText = Replace-RegexOnce `
    $srcMainText `
    'const VOYAGE_AUTOMATION_CHUNK_STEPS\s*=\s*6;\s*const VOYAGE_AUTOMATION_RENDER_EVERY_STEPS\s*=\s*12;\s*const VOYAGE_AUTOMATION_MAX_STEPS\s*=\s*240;\s*let voyageAutomationActive\s*=\s*false;\s*let voyageAutomationRunId\s*=\s*0;' `
    $srcCadenceReplacement `
    "source Hotfix 2.1 cadence"

$jsCadenceReplacement = @'
const VOYAGE_AUTOMATION_TARGET_FRAMES = 30;
const VOYAGE_AUTOMATION_FRAME_DELAY_MS = 75;
const VOYAGE_AUTOMATION_MAX_STEPS = 240;
let voyageAutomationActive = false;
let voyageAutomationRunId = 0;
const TIDEWORN_DIRECTIONAL_TOKEN_ASSETS = {
    north: "ship.named.tideworn.token.north",
    east: "ship.named.tideworn.token.east",
    south: "ship.named.tideworn.token.south",
    west: "ship.named.tideworn.token.west"
};
let playerMapHeading = "north";
'@

$jsMainText = Replace-RegexOnce `
    $jsMainText `
    'const VOYAGE_AUTOMATION_CHUNK_STEPS\s*=\s*6;\s*const VOYAGE_AUTOMATION_RENDER_EVERY_STEPS\s*=\s*12;\s*const VOYAGE_AUTOMATION_MAX_STEPS\s*=\s*240;\s*let voyageAutomationActive\s*=\s*false;\s*let voyageAutomationRunId\s*=\s*0;' `
    $jsCadenceReplacement `
    "browser Hotfix 2.1 cadence"

# Slow each visual frame slightly so the token can actually be watched moving.
$srcFrameReplacement = @'
function voyageAutomationFrame():Promise<void> {
  return new Promise((resolve)=>window.setTimeout(()=>window.requestAnimationFrame(()=>resolve()),VOYAGE_AUTOMATION_FRAME_DELAY_MS));
}
'@
$srcMainText = Replace-RegexOnce `
    $srcMainText `
    'function voyageAutomationFrame\(\):Promise<void>\s*\{\s*return new Promise\(\(resolve\)=>window\.requestAnimationFrame\(\(\)=>resolve\(\)\)\);\s*\}' `
    $srcFrameReplacement `
    "source voyage frame delay"

$jsFrameReplacement = @'
function voyageAutomationFrame() {
    return new Promise((resolve) => window.setTimeout(() => window.requestAnimationFrame(() => resolve()), VOYAGE_AUTOMATION_FRAME_DELAY_MS));
}
'@
$jsMainText = Replace-RegexOnce `
    $jsMainText `
    'function voyageAutomationFrame\(\)\s*\{\s*return new Promise\(\(resolve\)\s*=>\s*window\.requestAnimationFrame\(\(\)\s*=>\s*resolve\(\)\)\);\s*\}' `
    $jsFrameReplacement `
    "browser voyage frame delay"

# ---------------------------------------------------------------------------
# 5) Direction resolver. At a route turn, equal-distance ties intentionally
# choose the later segment so the token flips to the outgoing heading.
# ---------------------------------------------------------------------------
$srcDirectionHelpers = @'
function cardinalHeadingForDelta(dx:number,dy:number,fallback:CardinalHeading):CardinalHeading {
  const ax=Math.abs(dx);
  const ay=Math.abs(dy);
  if(ax>ay)return dx>=0?"east":"west";
  if(ay>ax)return dy>=0?"south":"north";

  // Diagonal path cells have no diagonal token. If the current facing is one
  // of the diagonal's components, retain it to avoid visual chatter.
  if(dx>0&&fallback==="east")return fallback;
  if(dx<0&&fallback==="west")return fallback;
  if(dy>0&&fallback==="south")return fallback;
  if(dy<0&&fallback==="north")return fallback;
  if(ax>0)return dx>=0?"east":"west";
  if(ay>0)return dy>=0?"south":"north";
  return fallback;
}

function tidewornHeadingForPath(position:GridPoint,path:GridPoint[],fallback:CardinalHeading):CardinalHeading {
  if(path.length<2)return fallback;
  let bestIndex=0;
  let bestDistance=Number.POSITIVE_INFINITY;

  for(let i=0;i<path.length-1;i+=1){
    const a=path[i]!;
    const b=path[i+1]!;
    const dx=b.x-a.x;
    const dy=b.y-a.y;
    const lengthSq=dx*dx+dy*dy;
    if(lengthSq<=0)continue;
    const t=Math.max(0,Math.min(1,((position.x-a.x)*dx+(position.y-a.y)*dy)/lengthSq));
    const px=a.x+dx*t;
    const py=a.y+dy*t;
    const distance=(position.x-px)*(position.x-px)+(position.y-py)*(position.y-py);

    // <= means an exact turn node selects the outgoing/later segment.
    if(distance<=bestDistance+1e-9){
      bestDistance=distance;
      bestIndex=i;
    }
  }

  const a=path[bestIndex]!;
  const b=path[Math.min(path.length-1,bestIndex+1)]!;
  return cardinalHeadingForDelta(b.x-a.x,b.y-a.y,fallback);
}

function updateTidewornHeading(s:GameState,path?:GridPoint[]):void {
  const ship=getPlayerShip(s);
  if(!ship||ship.id!=="ship.player.flagship")return;
  const route=path??s.voyage?.path;
  if(route?.length)playerMapHeading=tidewornHeadingForPath(ship.position,route,playerMapHeading);
}

function playerMapTokenPath(s:GameState,ship:ShipEntity):string|undefined {
  if(ship.id!=="ship.player.flagship")return ASSET_BY_ID[ship.tokenAssetId??""]?.path;
  updateTidewornHeading(s);
  const directional=ASSET_BY_ID[TIDEWORN_DIRECTIONAL_TOKEN_ASSETS[playerMapHeading]]?.path;
  return directional??ASSET_BY_ID[ship.tokenAssetId??""]?.path;
}

'@

$srcFinishAnchor = "function finishVoyageAutomation("
if (-not $srcMainText.Contains($srcFinishAnchor)) { Fail "source finishVoyageAutomation anchor not found." }
$srcMainText = $srcMainText.Replace($srcFinishAnchor, $srcDirectionHelpers + $srcFinishAnchor)

$jsDirectionHelpers = @'
function cardinalHeadingForDelta(dx, dy, fallback) {
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (ax > ay)
        return dx >= 0 ? "east" : "west";
    if (ay > ax)
        return dy >= 0 ? "south" : "north";
    if (dx > 0 && fallback === "east")
        return fallback;
    if (dx < 0 && fallback === "west")
        return fallback;
    if (dy > 0 && fallback === "south")
        return fallback;
    if (dy < 0 && fallback === "north")
        return fallback;
    if (ax > 0)
        return dx >= 0 ? "east" : "west";
    if (ay > 0)
        return dy >= 0 ? "south" : "north";
    return fallback;
}
function tidewornHeadingForPath(position, path, fallback) {
    if (path.length < 2)
        return fallback;
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let i = 0; i < path.length - 1; i += 1) {
        const a = path[i];
        const b = path[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const lengthSq = dx * dx + dy * dy;
        if (lengthSq <= 0)
            continue;
        const t = Math.max(0, Math.min(1, ((position.x - a.x) * dx + (position.y - a.y) * dy) / lengthSq));
        const px = a.x + dx * t;
        const py = a.y + dy * t;
        const distance = (position.x - px) * (position.x - px) + (position.y - py) * (position.y - py);
        if (distance <= bestDistance + 1e-9) {
            bestDistance = distance;
            bestIndex = i;
        }
    }
    const a = path[bestIndex];
    const b = path[Math.min(path.length - 1, bestIndex + 1)];
    return cardinalHeadingForDelta(b.x - a.x, b.y - a.y, fallback);
}
function updateTidewornHeading(s, path) {
    const ship = getPlayerShip(s);
    if (!ship || ship.id !== "ship.player.flagship")
        return;
    const route = path ?? s.voyage?.path;
    if (route?.length)
        playerMapHeading = tidewornHeadingForPath(ship.position, route, playerMapHeading);
}
function playerMapTokenPath(s, ship) {
    if (ship.id !== "ship.player.flagship")
        return ASSET_BY_ID[ship.tokenAssetId ?? ""]?.path;
    updateTidewornHeading(s);
    const directional = ASSET_BY_ID[TIDEWORN_DIRECTIONAL_TOKEN_ASSETS[playerMapHeading]]?.path;
    return directional ?? ASSET_BY_ID[ship.tokenAssetId ?? ""]?.path;
}

'@

$jsFinishAnchor = "function finishVoyageAutomation("
if (-not $jsMainText.Contains($jsFinishAnchor)) { Fail "browser finishVoyageAutomation anchor not found." }
$jsMainText = $jsMainText.Replace($jsFinishAnchor, $jsDirectionHelpers + $jsFinishAnchor)

# ---------------------------------------------------------------------------
# 6) Use directional token selection in the chart.
# ---------------------------------------------------------------------------
$srcMainText = Replace-LiteralOnce `
    $srcMainText `
    'const playerToken=ASSET_BY_ID[ship.tokenAssetId??""]?.path;' `
    'const playerToken=playerMapTokenPath(s,ship);' `
    "source chart Tideworn token"

$jsMainText = Replace-RegexOnce `
    $jsMainText `
    'const playerToken\s*=\s*ASSET_BY_ID\[ship\.tokenAssetId\s*\?\?\s*""\]\?\.path;' `
    'const playerToken = playerMapTokenPath(s, ship);' `
    "browser chart Tideworn token"

# ---------------------------------------------------------------------------
# 7) Existing saves get the canonical portrait immediately; new saves also
# carry the new art id from createGame.
# ---------------------------------------------------------------------------
$srcShipArtReplacement = @'
const namedShipArt=ship.id==="ship.player.flagship"?ASSET_BY_ID["ship.named.tideworn.portrait.pristine"]:undefined;
  const shipArt = namedShipArt?.path ?? inspectionAsset?.path ?? ASSET_BY_ID[ship.artAssetId ?? ""]?.path;
'@
$srcMainText = Replace-LiteralOnce `
    $srcMainText `
    'const shipArt = inspectionAsset?.path ?? ASSET_BY_ID[ship.artAssetId ?? ""]?.path;' `
    $srcShipArtReplacement `
    "source Tideworn ship portrait"

$jsShipArtReplacement = @'
const namedShipArt = ship.id === "ship.player.flagship" ? ASSET_BY_ID["ship.named.tideworn.portrait.pristine"] : undefined;
    const shipArt = namedShipArt?.path ?? inspectionAsset?.path ?? ASSET_BY_ID[ship.artAssetId ?? ""]?.path;
'@
$jsMainText = Replace-RegexOnce `
    $jsMainText `
    'const shipArt\s*=\s*inspectionAsset\?\.path\s*\?\?\s*ASSET_BY_ID\[ship\.artAssetId\s*\?\?\s*""\]\?\.path;' `
    $jsShipArtReplacement `
    "browser Tideworn ship portrait"

# ---------------------------------------------------------------------------
# 8) Replace Hotfix 2.1's voyage runner with adaptive visual pacing.
# It targets ~30 visible movement frames instead of completing immediately.
# ---------------------------------------------------------------------------
$srcVoyageRunner = @'
async function runVoyageUntilAttention(s:GameState,prefix?:string):Promise<void> {
  if(voyageAutomationActive){toast("Voyage simulation is already underway.");return;}
  voyageAutomationActive=true;
  const runId=++voyageAutomationRunId;
  const weatherEvents:string[]=[];
  let completedSteps=0;

  // Aim for roughly thirty visible map updates. Short routes move in smaller
  // increments; very long routes group more simulation steps so they still
  // finish in only a couple of seconds instead of taking real-time minutes.
  const estimatedSteps=Math.max(1,Math.min(
    VOYAGE_AUTOMATION_MAX_STEPS,
    Math.ceil(currentVoyageEtaHours(s)/PLAYER_VOYAGE_SUPPLY_STEP_HOURS)
  ));
  const stepsPerFrame=Math.max(1,Math.ceil(estimatedSteps/VOYAGE_AUTOMATION_TARGET_FRAMES));

  followVoyageCamera(s);
  updateTidewornHeading(s);
  lastSearchWatersResult=undefined;
  tab="chart";
  renderGame();
  scheduleMapCameraFrame();

  try {
    await voyageAutomationFrame();

    while(s===state&&s.voyage&&runId===voyageAutomationRunId&&completedSteps<VOYAGE_AUTOMATION_MAX_STEPS){
      const activePath=s.voyage.path;
      const chunkSteps=Math.min(stepsPerFrame,VOYAGE_AUTOMATION_MAX_STEPS-completedSteps);
      const result=sailUntilInterrupted(s,undefined,chunkSteps);
      weatherEvents.push(...result.weatherEvents);
      updateTidewornHeading(s,activePath);

      const chunkExhausted=result.stopReason==="guard"
        && !result.ok
        && result.message==="Voyage automation stopped at its safety limit."
        && Boolean(s.voyage);

      if(!chunkExhausted){
        finishVoyageAutomation(result,prefix,weatherEvents,s);
        return;
      }

      completedSteps+=chunkSteps;
      followVoyageCamera(s);
      renderGame();
      scheduleMapCameraFrame();
      await voyageAutomationFrame();
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

$srcMainText = Replace-RegexOnce `
    $srcMainText `
    'async function runVoyageUntilAttention\(s:GameState,\s*prefix\?:string\):Promise<void>\s*\{.*?\r?\n\}(?=\r?\n\r?\nfunction resolveEncounterAndResume)' `
    $srcVoyageRunner `
    "source adaptive voyage runner"

$jsVoyageRunner = @'
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
    followVoyageCamera(s);
    updateTidewornHeading(s);
    lastSearchWatersResult = undefined;
    tab = "chart";
    renderGame();
    scheduleMapCameraFrame();
    try {
        await voyageAutomationFrame();
        while (s === state && s.voyage && runId === voyageAutomationRunId && completedSteps < VOYAGE_AUTOMATION_MAX_STEPS) {
            const activePath = s.voyage.path;
            const chunkSteps = Math.min(stepsPerFrame, VOYAGE_AUTOMATION_MAX_STEPS - completedSteps);
            const result = sailUntilInterrupted(s, undefined, chunkSteps);
            weatherEvents.push(...result.weatherEvents);
            updateTidewornHeading(s, activePath);
            const chunkExhausted = result.stopReason === "guard"
                && !result.ok
                && result.message === "Voyage automation stopped at its safety limit."
                && Boolean(s.voyage);
            if (!chunkExhausted) {
                finishVoyageAutomation(result, prefix, weatherEvents, s);
                return;
            }
            completedSteps += chunkSteps;
            followVoyageCamera(s);
            renderGame();
            scheduleMapCameraFrame();
            await voyageAutomationFrame();
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

$jsMainText = Replace-RegexOnce `
    $jsMainText `
    'async function runVoyageUntilAttention\(s,\s*prefix\)\s*\{.*?\r?\n\}(?=\r?\nfunction resolveEncounterAndResume)' `
    $jsVoyageRunner `
    "browser adaptive voyage runner"

# ---------------------------------------------------------------------------
# 9) Write only after all transformations have succeeded in memory.
# ---------------------------------------------------------------------------
[System.IO.File]::WriteAllText($srcMain,       $srcMainText,       [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($jsMain,        $jsMainText,        [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($srcAssets,     $srcAssetsText,     [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($jsAssets,      $jsAssetsText,      [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($srcCreateGame, $srcCreateGameText, [System.Text.UTF8Encoding]::new($false))
[System.IO.File]::WriteAllText($jsCreateGame,  $jsCreateGameText,  [System.Text.UTF8Encoding]::new($false))

Write-Host ""
Write-Host "Tideworn art + directional navigation hotfix v3.1 applied." -ForegroundColor Green
Write-Host ""
Write-Host "Wired:"
Write-Host "  - canonical Tideworn pristine ship portrait"
Write-Host "  - north/east/south/west 128px navigation tokens"
Write-Host "  - heading changes automatically as the plotted route turns"
Write-Host "  - adaptive voyage animation targets about 30 visible movement frames"
Write-Host "  - long travel remains roughly a couple seconds instead of real-time sailing"
Write-Host "  - existing camera zoom-follow behavior is preserved"
Write-Host ""

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) {
    Write-Host "Checking browser ESM syntax..."
    foreach ($path in @($jsMain,$jsAssets,$jsCreateGame)) {
        & node --check $path
        if ($LASTEXITCODE -ne 0) {
            Fail "node --check failed for $path. Restore its .pre-tideworn-nav-v3_1.bak backup before launching."
        }
    }
    Write-Host "Browser ESM syntax checks passed." -ForegroundColor Green
} else {
    Write-Host "Node was not found, so browser syntax checks were skipped." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Recommended test:"
Write-Host "  1. Open Ship and confirm the new Tideworn painting."
Write-Host "  2. Plot a route with at least one major turn."
Write-Host "  3. Sail and watch the token change N/E/S/W as the path changes direction."
Write-Host "  4. Confirm the trip takes a short visible animation rather than finishing instantly."
Write-Host "  5. Confirm zoom level stays fixed while the map follows Tideworn."
Write-Host ""
Write-Host "No naval-combat mechanics were changed."
