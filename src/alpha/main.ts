import { ASSET_BY_ID } from "../data/seed/assets.js";
import { COMMODITIES, COMMODITY_BY_ID } from "../data/seed/commodities.js";
import { PORT_BY_ID, PORTS } from "../data/seed/ports.js";
import { ROUTES, findRoute } from "../data/seed/routes.js";
import { combatAction, type CombatAction } from "../game/combat.js";
import { acceptContract, fulfillContract, generateContracts } from "../game/contracts.js";
import { DEFAULT_CHARACTER_CHOICES, createGame } from "../game/createGame.js";
import { calculatePrice, cargoUsed, transact } from "../game/economy.js";
import { buildCharacterMindContext, deterministicCharacterMindReply } from "../game/characterMind.js";
import { formatClock } from "../game/clock.js";
import { ALL_SKILLS } from "../game/skills.js";
import { attackEncounter, avoidEncounter, beginVoyage, advanceVoyage, hailEncounter } from "../game/travel.js";
import type { Attributes, CharacterCreationChoices, GameState, SkillId } from "../game/types.js";
import { currentPortName, getPlayerShip } from "../game/stateUtils.js";
import { clearLocalSave, hasLocalSave, loadLocal, saveLocal } from "../services/localSave.js";

const app = document.querySelector<HTMLDivElement>("#app")!;
if (!app) throw new Error("#app not found");

type TabId = "harbor" | "market" | "people" | "journal" | "chart";
let state: GameState | undefined;
let tab: TabId = "harbor";
let selectedDestination = "port.ironhaven";
let dialogueLines: Array<{ speaker: string; text: string }> = [];
let toastTimer: number | undefined;

function esc(input: unknown): string {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function titleize(input: string): string {
  return input.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function toast(message: string): void {
  document.querySelector(".toast")?.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.appendChild(node);
  if (toastTimer !== undefined) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => node.remove(), 3600);
}

function renderCreation(): void {
  const c = DEFAULT_CHARACTER_CHOICES;
  const skillChecks = ALL_SKILLS.map((skill) => `
    <label class="check"><input type="checkbox" name="coreSkill" value="${skill}" ${c.coreSkills.includes(skill) ? "checked" : ""}> ${esc(titleize(skill))}</label>
  `).join("");

  app.innerHTML = `
    <main class="creation">
      <section class="creation-box">
        <header class="creation-head">
          <div class="eyebrow">Ebbing Tides · Build 0.1</div>
          <h1>Create a Captain</h1>
          <p class="muted">There is no starter route. Your history determines what you know, where you begin, and what the world already expects of you.</p>
        </header>
        <form id="creation-form" class="creation-body">
          <div class="form-grid">
            <div class="field"><label>Captain name</label><input name="name" required maxlength="40" placeholder="Enter a name"></div>
            <div class="field"><label>Age</label><input name="age" type="number" min="18" max="45" value="${c.age}"></div>
            <div class="field"><label>Home settlement</label><select name="homePortId">
              ${PORTS.map((port) => `<option value="${port.id}" ${port.id === c.homePortId ? "selected" : ""}>${esc(port.name)}</option>`).join("")}
            </select></div>
            <div class="field"><label>Social origin</label><select name="socialOrigin">
              ${["dockside_poor","artisan_household","merchant_family","naval_family"].map((v) => `<option value="${v}" ${v === c.socialOrigin ? "selected" : ""}>${esc(titleize(v))}</option>`).join("")}
            </select></div>
            <div class="field"><label>Background</label><select name="background">
              ${["former_naval_midshipman","foundry_child","raised_among_smugglers","shipwreck_survivor"].map((v) => `<option value="${v}" ${v === c.background ? "selected" : ""}>${esc(titleize(v))}</option>`).join("")}
            </select></div>
            <div class="field"><label>Recent profession</label><select name="recentProfession">
              ${["sailor","merchant_clerk","dockworker","apprentice_engineer"].map((v) => `<option value="${v}" ${v === c.recentProfession ? "selected" : ""}>${esc(titleize(v))}</option>`).join("")}
            </select></div>
            <div class="field"><label>Religion</label><select name="religion">
              <option value="old_gods">Old Gods</option><option value="covenant">Covenant of the One</option><option value="unaffiliated">Unaffiliated / Skeptic</option>
            </select></div>
            <div class="field"><label>Devotion</label><select name="devotion">
              <option value="cultural">Cultural</option><option value="moderate">Moderate</option><option value="devout">Devout</option>
            </select></div>
            <div class="field"><label>Trait</label><select name="trait">
              ${["sea_legs","silver_tongue","superstitious","bookworm"].map((v) => `<option value="${v}" ${v === c.trait ? "selected" : ""}>${esc(titleize(v))}</option>`).join("")}
            </select></div>
            <div class="field"><label>Birth omen</label><select name="birthOmen">
              ${["great_storm","high_tide","first_snow"].map((v) => `<option value="${v}" ${v === c.birthOmen ? "selected" : ""}>${esc(titleize(v))}</option>`).join("")}
            </select></div>
            <div class="field"><label>How you acquired Tideworn</label><select name="shipOrigin">
              ${["inherited","purchased_on_debt","naval_surplus","prize_share"].map((v) => `<option value="${v}" ${v === c.shipOrigin ? "selected" : ""}>${esc(titleize(v))}</option>`).join("")}
            </select></div>
            <div class="field"><label>Arcane ← aptitude → Industrial</label><select name="aptitude">
              <option value="-10">Slightly Arcane (-10)</option><option value="0" selected>Neutral (0)</option><option value="10">Slightly Industrial (+10)</option>
            </select></div>
          </div>

          <hr class="rule">
          <div class="row between"><div><div class="eyebrow">Attributes</div><div class="small muted">1-10. Alpha point budget: 36 total.</div></div><div id="attr-total" class="small"></div></div>
          <div class="attr-grid">
            ${(["strength","dexterity","intelligence","willpower","charisma","perception"] as const).map((attr) => `
              <label class="attr-box"><b>${esc(attr)}</b><input type="number" name="attr_${attr}" min="1" max="10" value="${c.attributes[attr]}"></label>
            `).join("")}
          </div>

          <hr class="rule">
          <div class="row between"><div><div class="eyebrow">Core skills</div><div class="small muted">Choose exactly five. Background and profession add further history-based bonuses.</div></div><div id="skill-count" class="small"></div></div>
          <div class="skills">${skillChecks}</div>

          <div class="creation-foot">
            <div class="notice">Build 0.1 uses a real world seed, persistent IDs, Starting Knowledge, a persistent ship/first mate, markets, moving ships, encounters, contracts and a history ledger. Exact regional map geometry and balance numbers remain alpha-provisional.</div>
            <div class="row">
              ${hasLocalSave() ? `<button type="button" class="btn" data-action="continue-save">Continue saved campaign</button>` : ""}
              <button type="submit" class="btn primary">Enter the world</button>
            </div>
          </div>
        </form>
      </section>
    </main>`;

  const form = document.querySelector<HTMLFormElement>("#creation-form");
  if (!form) return;
  const updateCounters = () => {
    const attrs = (["strength","dexterity","intelligence","willpower","charisma","perception"] as const)
      .map((attr) => Number((form.elements.namedItem(`attr_${attr}`) as HTMLInputElement)?.value ?? 0));
    const total = attrs.reduce((sum, value) => sum + value, 0);
    const attrEl = document.querySelector("#attr-total");
    if (attrEl) { attrEl.textContent = `${total} / 36`; attrEl.className = `small ${total > 36 ? "shortage" : "muted"}`; }
    const count = form.querySelectorAll<HTMLInputElement>('input[name="coreSkill"]:checked').length;
    const skillEl = document.querySelector("#skill-count");
    if (skillEl) { skillEl.textContent = `${count} / 5`; skillEl.className = `small ${count !== 5 ? "shortage" : "muted"}`; }
  };
  form.addEventListener("input", updateCounters);
  updateCounters();
}

function creationFromForm(form: HTMLFormElement): CharacterCreationChoices {
  const fd = new FormData(form);
  const attrs: Attributes = {
    strength: Number(fd.get("attr_strength")),
    dexterity: Number(fd.get("attr_dexterity")),
    intelligence: Number(fd.get("attr_intelligence")),
    willpower: Number(fd.get("attr_willpower")),
    charisma: Number(fd.get("attr_charisma")),
    perception: Number(fd.get("attr_perception"))
  };
  const coreSkills = fd.getAll("coreSkill").map(String) as SkillId[];
  return {
    name: String(fd.get("name") ?? "").trim(),
    age: Number(fd.get("age")),
    homePortId: String(fd.get("homePortId")),
    socialOrigin: String(fd.get("socialOrigin")) as CharacterCreationChoices["socialOrigin"],
    background: String(fd.get("background")) as CharacterCreationChoices["background"],
    religion: String(fd.get("religion")) as CharacterCreationChoices["religion"],
    devotion: String(fd.get("devotion")) as CharacterCreationChoices["devotion"],
    attributes: attrs,
    coreSkills,
    trait: String(fd.get("trait")) as CharacterCreationChoices["trait"],
    birthOmen: String(fd.get("birthOmen")) as CharacterCreationChoices["birthOmen"],
    recentProfession: String(fd.get("recentProfession")) as CharacterCreationChoices["recentProfession"],
    shipOrigin: String(fd.get("shipOrigin")) as CharacterCreationChoices["shipOrigin"],
    aptitude: Number(fd.get("aptitude"))
  };
}

function renderTopBar(s: GameState): string {
  const ship = getPlayerShip(s)!;
  return `<header class="topbar">
    <div class="brand">Ebbing Tides</div><div class="alpha-badge">Alpha 0.1</div>
    <div class="top-stat"><b>${esc(formatClock(s.clock))}</b></div>
    <div class="top-stat hide-small">${esc(currentPortName(s))}</div>
    <div class="top-spacer"></div>
    <div class="top-stat">Crowns <b>${s.player.character.crowns}</b></div>
    <div class="top-stat hide-small">Supplies <b>${ship.supplies}</b></div>
    <div class="top-actions"><button class="btn small" data-action="save">Save</button><button class="btn small" data-action="new-game">New</button></div>
  </header>`;
}

function renderNav(): string {
  const items: Array<[TabId,string]> = [["harbor","Harbor / Ship"],["market","Market"],["people","People"],["journal","Journal"],["chart","Navigation Map"]];
  return `<nav class="navrail">${items.map(([id,label]) => `<button data-tab="${id}" class="${tab === id ? "active" : ""}">${label}</button>`).join("")}</nav>`;
}

function portArtStyle(portId: string): string {
  const port = PORT_BY_ID[portId];
  const asset = port?.artAssetId ? ASSET_BY_ID[port.artAssetId] : undefined;
  return asset ? `style="background-image:url('${asset.path}')"` : "";
}

function renderHarbor(s: GameState): string {
  const portId = s.player.currentPortId!;
  const port = PORT_BY_ID[portId]!;
  const ship = getPlayerShip(s)!;
  const firstMate = s.npcs[s.player.firstMateId]!;
  generateContracts(s);
  const contracts = s.contracts.filter((c) => c.sourcePortId === portId && c.status === "available").slice(0,4);
  const activeHere = s.contracts.filter((c) => c.status === "accepted" && c.destinationPortId === portId);
  const art = port.artAssetId ? ASSET_BY_ID[port.artAssetId] : undefined;

  return `<section class="port-scene" ${portArtStyle(portId)}>
    <div class="port-content">
      <div class="panel soft">
        <div class="eyebrow">${esc(port.role)}</div><h2 class="section-title">${esc(port.name)}</h2>
        <p class="body-copy">${esc(port.description)}</p>
        ${!art ? `<div class="notice">No approved PORT_ESTABLISHING image exists for this alpha port yet. This neutral treatment is intentionally a placeholder, not new visual canon.</div>` : ""}
      </div>
      <div class="two-col" style="margin-top:14px">
        <div>
          <div class="panel">
            <div class="row between"><div><div class="eyebrow">Flagship</div><h2 class="section-title">${esc(ship.name)}</h2></div><span class="alpha-badge">Skeldran Coastal Sloop</span></div>
            <div class="stats-grid">
              <div class="stat"><div class="k">Hull</div><div class="v">${ship.systems.hull} / ${ship.systems.hullMax}</div></div>
              <div class="stat"><div class="k">Sails</div><div class="v">${ship.systems.sails} / ${ship.systems.sailsMax}</div></div>
              <div class="stat"><div class="k">Crew</div><div class="v">${ship.systems.crew} / ${ship.systems.crewMax}</div></div>
              <div class="stat"><div class="k">Morale</div><div class="v">${ship.systems.morale}%</div></div>
              <div class="stat"><div class="k">Speed</div><div class="v">${ship.speed}</div></div>
              <div class="stat"><div class="k">Maneuver</div><div class="v">${ship.maneuverability}</div></div>
              <div class="stat"><div class="k">Firepower</div><div class="v">${ship.firepower}</div></div>
              <div class="stat"><div class="k">Cargo</div><div class="v">${cargoUsed(s)} / ${ship.cargoCapacity}</div></div>
            </div>
            <hr class="rule"><div class="eyebrow">First mate</div><div><b>${esc(firstMate.name)}</b> · ${esc(firstMate.role)}</div><p class="small muted">${esc(firstMate.speakingStyle)}</p>
            <hr class="rule"><div class="row"><button class="btn" data-tab="chart">Leave Port / Navigation Map</button><button class="btn" data-tab="market">Open Market</button></div>
          </div>
          ${activeHere.map((c) => `<div class="panel"><div class="eyebrow">Accepted contract · delivery ready</div><h3>${esc(COMMODITY_BY_ID[c.commodityId]?.name)} to ${esc(port.name)}</h3><p class="small muted">Requires ${c.quantity} units. Reward ${c.reward} crowns.</p><button class="btn primary" data-action="fulfill-contract" data-id="${esc(c.id)}">Fulfill delivery</button></div>`).join("")}
        </div>
        <div class="panel">
          <div class="eyebrow">Current opportunities</div><h2 class="section-title">Work that exists now</h2>
          <p class="small muted">These delivery contracts are derived from current market needs. They can expire or resolve without you.</p>
          ${contracts.length ? contracts.map((c) => `<div class="card"><h3>${c.quantity} ${esc(COMMODITY_BY_ID[c.commodityId]?.name)} → ${esc(PORT_BY_ID[c.destinationPortId]?.name)}</h3><p>${esc(c.reason)} Deadline: hour ${c.deadlineHour}. Reward: ${c.reward} crowns.</p><button class="btn small" data-action="accept-contract" data-id="${esc(c.id)}">Accept</button></div>`).join("") : `<p class="muted">No local factor is offering a viable delivery contract right now.</p>`}
        </div>
      </div>
    </div>
  </section>`;
}

function renderMarket(s: GameState): string {
  const portId = s.player.currentPortId!;
  const port = PORT_BY_ID[portId]!;
  const market = s.markets[portId]!;
  const ship = getPlayerShip(s)!;
  const rows = COMMODITIES.map((good) => {
    const row = market.goods[good.id]!;
    const price = calculatePrice(s, market, good.id);
    const cargo = ship.cargo.find((stack) => stack.commodityId === good.id)?.quantity ?? 0;
    const ratio = row.stock / row.targetStock;
    const status = ratio < .7 ? `<span class="shortage">short</span>` : ratio > 1.25 ? `<span class="surplus">plentiful</span>` : `<span class="muted">steady</span>`;
    return `<tr><td><b>${esc(good.name)}</b></td><td class="price">${price} cr</td><td>${row.stock} / ${row.targetStock} ${status}</td><td>${cargo}</td><td><button class="btn small" data-action="trade" data-dir="buy" data-id="${good.id}">Buy 1</button> <button class="btn small" data-action="trade" data-dir="sell" data-id="${good.id}" ${cargo <= 0 ? "disabled" : ""}>Sell 1</button></td></tr>`;
  }).join("");
  return `<section class="port-scene" ${portArtStyle(portId)}><div class="port-content"><div class="panel">
    <div class="eyebrow">${esc(port.name)} market · observed now</div><div class="row between"><h2 class="section-title">Cargo & Trade</h2><div class="small">Hold ${cargoUsed(s)} / ${ship.cargoCapacity} · ${s.player.character.crowns} crowns</div></div>
    <p class="small muted">Only the current port reveals current prices. Your journal preserves timestamped observations after you leave.</p>
    <table class="market-table"><thead><tr><th>Commodity</th><th>Current price</th><th>Local stock</th><th>In hold</th><th>Action</th></tr></thead><tbody>${rows}</tbody></table>
  </div></div></section>`;
}

function renderPeople(s: GameState): string {
  const portId = s.player.currentPortId!;
  const people = Object.values(s.npcs).filter((npc) => npc.locationPortId === portId);
  const canTalkElias = portId === "port.ironhaven" && Boolean(s.npcs["character.pastor_elias_korr"]);
  return `<section class="port-scene" ${portArtStyle(portId)}><div class="port-content">
    <div class="panel"><div class="eyebrow">People actually present</div><h2 class="section-title">${esc(PORT_BY_ID[portId]?.name)} · People</h2>
    <p class="small muted">Named characters are not teleported to serve a quest. This list is filtered from persistent location data.</p>
    ${people.length ? people.map((npc) => `<div class="card"><h3>${esc(npc.name)}</h3><p>${esc(npc.role)} · ${esc(npc.speakingStyle)}</p>${npc.id === "character.pastor_elias_korr" ? `<button class="btn" data-action="open-dialogue" data-id="${npc.id}">Speak</button>` : ""}</div>`).join("") : `<p class="muted">No major named character in this alpha seed is currently recorded here.</p>`}
    </div>
    ${canTalkElias ? renderDialoguePanel(s, "character.pastor_elias_korr") : ""}
  </div></section>`;
}

function renderDialoguePanel(s: GameState, npcId: string): string {
  const npc = s.npcs[npcId]!;
  const context = buildCharacterMindContext(s, npcId);
  return `<div class="panel" id="dialogue-panel" style="margin-top:14px">
    <div class="eyebrow">Character Mind boundary · structured context</div><h2 class="section-title">${esc(npc.name)}</h2>
    <p class="small muted">${esc(npc.speakingStyle)} The standalone alpha uses a deterministic fallback through the same context/lore-firewall boundary; the Next API adapter can use OpenAI when configured.</p>
    <div class="combat-log" style="max-height:260px">${dialogueLines.length ? dialogueLines.map((line) => `<div><b>${esc(line.speaker)}:</b> ${esc(line.text)}</div>`).join("") : `<div class="muted">Ask naturally about Ironhaven, food, religion, work, or industry.</div>`}</div>
    <form id="dialogue-form" class="row" style="margin-top:10px"><input name="message" autocomplete="off" maxlength="400" placeholder="Type what you say..." style="flex:1;background:#0d1416;color:#eee2c9;border:1px solid #4a5450;padding:9px"><button class="btn primary" type="submit">Speak</button></form>
    <details style="margin-top:10px"><summary class="small muted">Show structured context (dev)</summary><pre class="small" style="white-space:pre-wrap;color:#9fa79f">${esc(JSON.stringify(context,null,2))}</pre></details>
  </div>`;
}

function renderJournal(s: GameState): string {
  const knowledge = [...s.player.knowledge].sort((a,b) => b.learnedAtHour - a.learnedAtHour);
  const contracts = s.contracts.filter((c) => c.status !== "available").sort((a,b) => b.createdAtHour - a.createdAtHour);
  const history = [...s.worldEvents].reverse().slice(0,30);
  return `<div class="map-wrap"><div style="max-width:1100px;margin:0 auto">
    <div class="two-col">
      <div class="panel"><div class="eyebrow">Player-known information only</div><h2 class="section-title">Rumors & Knowledge</h2>
        ${knowledge.map((k) => `<div class="journal-item ${k.category}"><div>${esc(k.text)}</div><div class="journal-meta">${esc(titleize(k.category))} · source: ${esc(k.source)} · confidence ${k.confidence}% · learned hour ${k.learnedAtHour}</div></div>`).join("")}
      </div>
      <div>
        <div class="panel"><div class="eyebrow">Contracts & personal matters</div><h2 class="section-title">Obligations</h2>
          ${contracts.length ? contracts.map((c) => `<div class="card"><h3>${esc(titleize(c.status))}</h3><p>${c.quantity} ${esc(COMMODITY_BY_ID[c.commodityId]?.name)} · ${esc(PORT_BY_ID[c.sourcePortId]?.name)} → ${esc(PORT_BY_ID[c.destinationPortId]?.name)} · reward ${c.reward}</p></div>`).join("") : `<p class="muted">No accepted or resolved contracts yet.</p>`}
        </div>
        <div class="panel"><div class="eyebrow">Canonical ledger</div><h2 class="section-title">Recent History</h2>
          <div class="combat-log">${history.map((e) => `<div><b>H${e.atHour}</b> · ${esc(e.summary)}</div>`).join("")}</div>
        </div>
      </div>
    </div>
  </div></div>`;
}

function pctX(x: number): number { return (x / 12) * 100; }
function pctY(y: number): number { return (y / 8) * 100; }
function lineBetween(a: {x:number;y:number}, b:{x:number;y:number}): string {
  const x1=pctX(a.x), y1=pctY(a.y), x2=pctX(b.x), y2=pctY(b.y);
  const dx=x2-x1, dy=y2-y1; const len=Math.hypot(dx,dy); const angle=Math.atan2(dy,dx)*180/Math.PI;
  return `<div class="route-line" style="left:${x1}%;top:${y1}%;width:${len}%;transform:rotate(${angle}deg)"></div>`;
}

function renderChart(s: GameState): string {
  const ship = getPlayerShip(s)!;
  const routeLines = ROUTES.map((route) => lineBetween(PORT_BY_ID[route.fromPortId]!.point, PORT_BY_ID[route.toPortId]!.point)).join("");
  const ports = PORTS.map((port) => `<button class="port-marker ${s.player.knownPortIds.includes(port.id) ? "" : "unknown"}" data-action="select-destination" data-id="${port.id}" style="left:${pctX(port.point.x)}%;top:${pctY(port.point.y)}%">${esc(port.name)}</button>`).join("");
  const playerToken = ASSET_BY_ID[ship.tokenAssetId ?? ""]?.path;
  const ships = Object.values(s.ships).filter((other) => other.id !== ship.id).map((other) => {
    const known = s.player.knowledge.some((k) => k.subjectId === other.id || k.subjectId === other.ownerCharacterId);
    return known ? `<div class="ship-marker npc" title="Last-known/persistent ship: ${esc(other.name)}" style="left:${pctX(other.position.x)}%;top:${pctY(other.position.y)}%"></div>` : "";
  }).join("");
  const current = s.player.currentPortId;
  const dest = PORT_BY_ID[selectedDestination];
  const route = current && dest ? findRoute(current, dest.id) : undefined;
  const voyage = s.voyage;

  return `<div class="map-wrap"><div class="chart">
    ${routeLines}${ports}${ships}
    <div class="ship-marker" style="left:${pctX(ship.position.x)}%;top:${pctY(ship.position.y)}%">${playerToken ? `<img src="${playerToken}" alt="Player ship">` : `<div class="alpha-badge">Ship</div>`}</div>
  </div>
  <div class="map-side">
    <div class="panel"><div class="eyebrow">Navigation map · coded movement layer</div><h2 class="section-title">Skeldran Alpha Waters</h2>
      <p class="small muted">Square-grid interaction and route geometry are code-driven. The coastline treatment here is deliberately provisional because exact world-map geometry remains an open design item; approved map art is retained as visual DNA, not treated as authoritative coordinates.</p>
      ${voyage ? `<div class="card"><h3>Voyage: ${esc(PORT_BY_ID[voyage.fromPortId]?.name)} → ${esc(PORT_BY_ID[voyage.toPortId]?.name)}</h3><p>${voyage.elapsedHours} / ${voyage.totalHours} hours · ${Math.round(voyage.progress*100)}% · supplies ${ship.supplies}</p><button class="btn primary" data-action="advance-voyage">Advance 4 hours</button></div>` : current ? `<div class="card"><h3>Plot a course</h3><p>Selected: <b>${esc(dest?.name ?? "Choose a port")}</b>${route ? ` · base route ${route.baseHours}h` : " · no direct route"}</p><button class="btn primary" data-action="begin-voyage" ${!route || selectedDestination === current ? "disabled" : ""}>Sail</button></div>` : ""}
    </div>
    <div class="panel"><div class="eyebrow">Selected port</div><h2 class="section-title">${esc(dest?.name ?? "—")}</h2><p class="small muted">${esc(dest?.role ?? "")}</p><p class="small">${esc(dest?.description ?? "")}</p></div>
  </div></div>`;
}

function renderEncounter(s: GameState): string {
  const encounter = s.encounter!;
  const player = getPlayerShip(s)!;
  const other = s.ships[encounter.otherShipId]!;
  const playerArt = ASSET_BY_ID[player.artAssetId ?? ""]?.path;
  const otherLabel = encounter.identified ? other.name : "Unidentified vessel";
  const sighting = encounter.phase === "sighting";
  const combat = encounter.phase === "combat";
  const resolved = encounter.phase === "resolved";
  return `<div class="encounter"><div style="max-width:1080px;margin:0 auto">
    <div class="panel"><div class="eyebrow">Voyage interrupted · persistent entity</div><div class="row between"><h2 class="section-title">${sighting ? "Sails on the horizon" : combat ? "Naval engagement" : "Encounter resolved"}</h2><div class="range-pill">${esc(encounter.range)}</div></div>
      <div class="ship-versus"><div class="ship-card">${playerArt ? `<img src="${playerArt}" alt="${esc(player.name)}">` : ""}<h3>${esc(player.name)}</h3><div class="small">Hull ${player.systems.hull}/${player.systems.hullMax} · Crew ${player.systems.crew} · Morale ${player.systems.morale}</div></div><div class="range-pill">${esc(encounter.range)}</div><div class="ship-card"><h3>${esc(otherLabel)}</h3><div class="small">${encounter.identified ? `${esc(other.classId)} · ${esc(other.disposition)}` : "Silhouette and rig only"}</div><div class="small" style="margin-top:9px">Hull ${encounter.identified || combat ? `${other.systems.hull}/${other.systems.hullMax}` : "?"}</div></div></div>
      <div class="combat-log">${encounter.log.map((line) => `<div>${esc(line)}</div>`).join("")}</div>
      <div class="row" style="margin-top:12px">
        ${sighting ? `<button class="btn" data-action="hail">Hail</button><button class="btn" data-action="avoid">Avoid</button><button class="btn danger" data-action="attack">Attack</button>` : ""}
        ${combat ? `<button class="btn" data-combat="close">Close</button><button class="btn" data-combat="open">Open Range</button><button class="btn primary" data-combat="fire_hull">Fire · Round Shot</button><button class="btn" data-combat="fire_rigging">Fire · Chain Shot</button><button class="btn" data-combat="repair">Damage Control</button><button class="btn" data-combat="flee">Flee</button>` : ""}
        ${resolved ? `<button class="btn primary" data-action="resume-voyage">Return to voyage</button>` : ""}
      </div>
    </div>
  </div></div>`;
}

function renderGame(): void {
  if (!state) { renderCreation(); return; }
  if (state.encounter && state.encounter.phase !== "resolved") {
    app.innerHTML = `<div class="shell">${renderTopBar(state)}${renderEncounter(state)}</div>`;
    return;
  }
  let content: string;
  if (state.voyage || tab === "chart" || !state.player.currentPortId) content = renderChart(state);
  else if (tab === "market") content = renderMarket(state);
  else if (tab === "people") content = renderPeople(state);
  else if (tab === "journal") content = renderJournal(state);
  else content = renderHarbor(state);
  app.innerHTML = `<div class="shell">${renderTopBar(state)}<div class="game-layout">${renderNav()}<main class="main">${content}</main></div></div>`;
}

function handleClick(target: HTMLElement): void {
  const actionEl = target.closest<HTMLElement>("[data-action]");
  const tabEl = target.closest<HTMLElement>("[data-tab]");
  const combatEl = target.closest<HTMLElement>("[data-combat]");

  if (tabEl && state) {
    tab = tabEl.dataset.tab as TabId;
    renderGame();
    return;
  }

  if (combatEl && state) {
    const result = combatAction(state, combatEl.dataset.combat as CombatAction);
    toast(result.message);
    renderGame();
    return;
  }

  if (!actionEl) return;
  const action = actionEl.dataset.action;

  if (action === "continue-save") {
    try {
      state = loadLocal();
      if (!state) throw new Error("No save found");
      tab = state.player.currentPortId ? "harbor" : "chart";
      renderGame();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not load save.");
    }
    return;
  }
  if (!state) return;
  const s = state;

  switch (action) {
    case "save":
      saveLocal(s);
      toast("Campaign saved locally. Reloading the page will preserve world history and state.");
      return;
    case "new-game":
      if (confirm("Start a new campaign? Your existing local save remains until you save over it.")) {
        state = undefined;
        dialogueLines = [];
        renderCreation();
      }
      return;
    case "trade": {
      const result = transact(s, String(actionEl.dataset.id), 1, actionEl.dataset.dir === "sell" ? "sell" : "buy");
      toast(result.message); renderGame(); return;
    }
    case "accept-contract": {
      const result = acceptContract(s, String(actionEl.dataset.id)); toast(result.message); renderGame(); return;
    }
    case "fulfill-contract": {
      const result = fulfillContract(s, String(actionEl.dataset.id)); toast(result.message); renderGame(); return;
    }
    case "select-destination":
      selectedDestination = String(actionEl.dataset.id); renderGame(); return;
    case "begin-voyage": {
      const result = beginVoyage(s, selectedDestination); toast(result.message); if (result.ok) tab = "chart"; renderGame(); return;
    }
    case "advance-voyage": {
      const result = advanceVoyage(s, 4); toast(result.weather ? `${result.message} ${result.weather}` : result.message); if (result.arrived) tab = "harbor"; renderGame(); return;
    }
    case "hail": {
      const result = hailEncounter(s); toast(result.message); renderGame(); return;
    }
    case "avoid": {
      const result = avoidEncounter(s); toast(result.message); renderGame(); return;
    }
    case "attack": {
      const result = attackEncounter(s); toast(result.message); renderGame(); return;
    }
    case "resume-voyage":
      delete s.encounter; tab = "chart"; renderGame(); return;
    case "open-dialogue":
      document.querySelector("#dialogue-panel")?.scrollIntoView({ behavior: "smooth" }); return;
    default:
      return;
  }
}

app.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement) handleClick(target);
});

app.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  if (form.id === "creation-form") {
    try {
      state = createGame(creationFromForm(form));
      selectedDestination = state.player.currentPortId === "port.ironhaven" ? "port.veyrholm" : "port.ironhaven";
      tab = "harbor";
      dialogueLines = [];
      renderGame();
      toast("Campaign initialized. The world clock, markets, ships, knowledge and history are now live.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not create campaign.");
    }
    return;
  }
  if (form.id === "dialogue-form" && state) {
    const input = form.elements.namedItem("message") as HTMLInputElement | null;
    const message = input?.value.trim() ?? "";
    if (!message) return;
    const npcId = "character.pastor_elias_korr";
    dialogueLines.push({ speaker: state.player.character.name, text: message });
    const reply = deterministicCharacterMindReply(state, npcId, message);
    dialogueLines.push({ speaker: state.npcs[npcId]?.name ?? "NPC", text: reply.text });
    if (reply.proposedMemory) {
      state.worldEvents.push({
        id: `event.dialogue.${state.absoluteHour}.${state.worldEvents.length}`,
        type: "character_conversation",
        atHour: state.absoluteHour,
        ...(state.player.currentPortId ? { locationId: state.player.currentPortId } : {}),
        participants: [state.player.character.id, npcId],
        summary: reply.proposedMemory,
        canonicalData: { interpretedIntent: reply.interpretedIntent, source: reply.source },
        importance: 1
      });
    }
    renderGame();
    requestAnimationFrame(() => document.querySelector("#dialogue-panel")?.scrollIntoView({ block: "end" }));
  }
});

window.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s" && state) {
    event.preventDefault(); saveLocal(state); toast("Campaign saved.");
  }
});

renderCreation();
