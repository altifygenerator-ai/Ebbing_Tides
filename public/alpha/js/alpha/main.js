import { ASSET_BY_ID } from "../data/seed/assets.js";
import { COMMODITIES, COMMODITY_BY_ID } from "../data/seed/commodities.js";
import { ITEM_BY_ID, availableItemDefinitionsAtSettlement, itemPurchasePriceAtSettlement } from "../data/seed/items.js";
import { PORT_BY_ID, PORTS } from "../data/seed/ports.js";
import { POI_BY_ID, POINTS_OF_INTEREST } from "../data/seed/pois.js";
import { combatAction } from "../game/combat.js";
import { acceptContract, fulfillContract, generateContracts } from "../game/contracts.js";
import { DEFAULT_CHARACTER_CHOICES, createGame, startingCrownsForChoices, startingShipOriginImpact } from "../game/createGame.js";
import { calculatePrice, cargoUsed, transact } from "../game/economy.js";
import { quoteShipSupplies } from "../game/economySimulation.js";
import { buildInitialPortMarkets } from "../game/marketGeneration.js";
import { buildCharacterMindContext, deterministicCharacterMindReply } from "../game/characterMind.js";
import { clockFromAbsoluteHour, formatClock } from "../game/clock.js";
import { shipClassDefinition } from "../data/seed/contentRegistry.js";
import { COMPANION_EQUIPMENT_SLOTS, PLAYER_EQUIPMENT_SLOTS, equipItem, equipmentForOwner, inventoryForOwner, isItemEquipped, purchaseItem, slotLabel, unequipItem } from "../game/inventory.js";
import { intelFreshnessLabel } from "../game/intelligence.js";
import { beginBoardingCombat, beginDeckDrill, personalCombatAction, treatInjuries } from "../game/personalCombat.js";
import { assessPort, gatherRumor, restCrew } from "../game/portActions.js";
import { checkTavernDesertion, crewRecruitOffers, recruitCrewOffer, sharePrizeWithCrew, shoreLeaveCost } from "../game/crewMechanics.js";
import { crewLoyaltyLabel, crewMoraleLabel, crewSummary, crewUnrestProfile, ensureCrewCommunity } from "../game/crewState.js";
import { SHIP_REFITS, buySupplies, installRefit, quoteRefitAtPort, repairShip } from "../game/shipyard.js";
import { portServiceSummary, quoteMedicalTreatment, quoteShipRepair } from "../game/portServices.js";
import { ALL_SKILLS, SKILL_LABELS, skillRatingLabel, startingSkillContributions } from "../game/skills.js";
import { PORTRAIT_BY_ID, PORTRAIT_CHOICES } from "../data/seed/portraits.js";
import { attunementBand, calculateInterference, strainBand } from "../game/attunement.js";
import { usePlayerAbility } from "../game/abilitiesRuntime.js";
import { attackEncounter, avoidEncounter, beginNavigation, cancelVoyage, currentVoyageEtaHours, estimateVoyageSupplyUnits, hailEncounter, observeEncounter, sailUntilInterrupted, searchWaters, submitToAuthorityEncounter } from "../game/travel.js";
import { MAX_TACTICAL_RANGE_YARDS, yardsToNm } from "../game/physicalDistance.js";
import { deterministicUnit } from "../game/rng.js";
import { currentPortName, getPlayerShip } from "../game/stateUtils.js";
import { getWorldCell, GLOBAL_ATLAS, REGIONAL_MAP_LAYERS, WORLD_DEVELOPED_BOUNDS } from "../data/seed/worldMap.js";
import { navigationTargetForPoi, navigationTargetForPort, navigationTargetForSea, plotCourse } from "../game/navigation.js";
import { NAV_CAMERA, cameraForPoint, cameraForPoints, cameraLod, cameraViewBox, clampCameraCenter, clampViewWidth, legacyZoomBand, panCameraTarget, regionalLayerOpacity, viewHeightForWidth, zoomAroundAnchor } from "../game/navigationCamera.js";
import { hasLocalSave, loadLocal, saveLocal } from "../services/localSave.js";
import { audio } from "./audio.js";
import { advanceWorld } from "../game/worldSimulation.js";
import { mutinyPressure } from "../game/npcBrain.js";
import { currentPlaceLabel, knowledgeConfidenceBand, marketSignals, portReadLens, relationshipStatus, shipBuildRole } from "../game/playerFacing.js";
import { learningSourcesAtCurrentContext, participateInReligiousLife, religiousParticipationProfile, studyLearningSource } from "../game/characterConsequences.js";
import { ATTRIBUTE_DESCRIPTIONS, SKILL_DESCRIPTIONS, SYSTEM_DESCRIPTIONS } from "../game/descriptions.js";
import { availableGeneralPerks, canFocusSkill, experienceLevelTitle, experienceThresholdForLevel, GENERAL_PERKS, skillProgressPercent, spendDevelopmentPointOnSkill, startingLevelFromAge, takeGeneralPerk } from "../game/progression.js";
import { ABILITY_BY_ID } from "../data/seed/abilities.js";
import { HOMELAND_REGION_LABELS, ORIGIN_SETTLEMENTS, originSettlementName } from "../data/seed/origins.js";
import { affiliationMarkForCharacter, homelandMarkForRegion, primaryIdentityMark, resolveIdentityPresentation, shipIdentityMarkForContext } from "../data/seed/identitySymbols.js";
import { rankCuratedPortraits } from "../game/portraits.js";
import { CONTEXT_LOCATION_SCENE_ART, LOCATION_PRESENTATION_ART } from "../data/seed/presentationArt.js";
import { CANON_WORLD_LOCATION_BY_ID } from "../data/seed/settlementCanon.js";
import { politicalPowerForRegion } from "../data/seed/politicalPowers.js";
import { activeWarrants, legalStateForFaction, legalStatusLabel, portStanding, powerLabel, satisfyActiveWarrant, standingLabel, unresolvedReportedCrimes, vesselPostureTowardPlayer } from "../game/reputationLaw.js";
import { artCalibrationEnabled, initializeArtDirectedCanvases, installArtCalibrationShortcut } from "../artLayouts/ArtDirectedCanvas.js";
import { initializeArtScreenHosts, renderArtScreenHost } from "../artLayouts/ArtScreenHost.js";
import { initializeReferenceGhosts, installReferenceGhostShortcut, renderReferenceGhost } from "../artLayouts/ReferenceGhost.js";
import { artLayoutById } from "../artLayouts/registry.js";
import { initializeGameViewport } from "../ui/GameViewport.js";
import { buildCapabilityState } from "../game/characterSystem.js";
import { activeWorldCauses, worldCauseAppliesToPort } from "../game/worldCauses.js";
import { eventInformationCanReachPort } from "../game/information.js";
import { attemptSmuggledTransaction, concealFromCustoms, obtainCustomsPermit, obtainLetterOfMarque, presentCustomsPapers } from "../game/customs.js";
import { activeLetterOfMarque, activePolicyEnemyFactions, activeTradeCredential, blackMarketAccess, evaluateCommodityTradeLaw, privateeringOpenForFaction, tradePolicyForPort } from "../game/tradeLaw.js";
const app = document.querySelector("#app");
if (!app)
    throw new Error("#app not found");
let state;
let tab = "ship";
let selectedMapTarget;
let selectedInventoryOwnerId = "player";
let selectedInventoryItemId;
let captainPanelTab = "sheet";
let crewPanelTab = "sheet";
let inventoryFilters = { player: "all" };
let shipPanelTab = "overview";
let marketPage = 0;
let marketTradeQuantities = {};
let lastRenderedGameViewKey;
let crewPage = 0;
let journalTab = "knowledge";
let journalPage = 0;
let creatorStep = 0;
let inventoryPages = { player: 0 };
let dialogueLines = [];
let activeDialogueNpcId;
let inspectedCrewNpcId;
let mapCameraState;
let mapCameraFrame;
let mapDragState;
let suppressNextMapClick = false;
let lastSearchWatersResult;
let poiFocusAction;
let toastTimer;
const LAUNCHER_READY_EVENT = "ebbing-tides:runtime-ready";
const LAUNCHER_REQUEST_EVENT = "ebbing-tides:launch-request";
const LAUNCHER_RESULT_EVENT = "ebbing-tides:launch-result";
function esc(input) {
    return String(input ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function titleize(input) { return input.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "); }
function pct(value) { return `${Math.max(0, Math.min(100, Math.round(value)))}%`; }
function tip(text) { return `data-tooltip="${esc(text)}" tabindex="0"`; }
// Character presentation packs are deliberately assembled around the locked runtime UI.
// Culture owns the primary frame/material treatment. Religion only supplies the small
// accent mounted into purpose-built sockets in that culture frame. Unimplemented packs
// fall back to the neutral structural UI rather than borrowing another culture's art.
const IMPLEMENTED_CHARACTER_CULTURE_PACKS = new Set(["skeldran"]);
const IMPLEMENTED_CHARACTER_RELIGION_PACKS = new Set(["old_gods", "covenant"]);
function characterThemeAttributes(culture, religion) {
    const culturePack = IMPLEMENTED_CHARACTER_CULTURE_PACKS.has(culture) ? culture : "neutral";
    const religionPack = IMPLEMENTED_CHARACTER_RELIGION_PACKS.has(religion) ? religion : "none";
    return `data-character-art="culture-religion-v2" data-character-production="reference-locked-v1" data-character-production1f="shipwright-ledger" data-culture-theme="${esc(culture)}" data-culture-pack="${esc(culturePack)}" data-religion-accent="${esc(religion)}" data-religion-pack="${esc(religionPack)}"`;
}
function syncCreatorCharacterTheme(form) {
    const root = app.querySelector(".creator-production-screen");
    if (!root)
        return;
    const culture = String(form.elements.namedItem("culture")?.value ?? "skeldran");
    const religion = String(form.elements.namedItem("religion")?.value ?? "unaffiliated");
    root.dataset.cultureTheme = culture;
    root.dataset.culturePack = IMPLEMENTED_CHARACTER_CULTURE_PACKS.has(culture) ? culture : "neutral";
    root.dataset.religionAccent = religion;
    root.dataset.religionPack = IMPLEMENTED_CHARACTER_RELIGION_PACKS.has(religion) ? religion : "none";
}
function effectiveTradeCredentials(s) {
    return s.player.tradeCredentials.filter(row => {
        if (row.status !== "active" || (row.expiresAtHour !== undefined && s.absoluteHour >= row.expiresAtHour))
            return false;
        if (row.kind === "customs_permit")
            return true;
        return activeLetterOfMarque(s, row.factionId)?.id === row.id;
    });
}
function tradeCredentialSummary(row) {
    const issuer = powerLabel(row.factionId);
    const expiry = row.expiresAtHour !== undefined ? ` · current through ${formatClock(clockFromAbsoluteHour(row.expiresAtHour))}` : "";
    if (row.kind === "customs_permit")
        return { title: `Customs Permit · ${issuer}`, detail: `Current trade papers${expiry}` };
    const enemies = row.authorizedEnemyFactionIds.length ? row.authorizedEnemyFactionIds.map(powerLabel).join(", ") : "No current enemy flags";
    return { title: `Letter of Marque · ${issuer}`, detail: `Authorized prize flags: ${enemies}${expiry}` };
}
function toast(message) {
    document.querySelector(".toast")?.remove();
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = message;
    document.body.appendChild(node);
    if (toastTimer !== undefined)
        window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => node.remove(), 4200);
}
function crewReactionSnapshot(s) {
    const ship = getPlayerShip(s);
    const company = ensureCrewCommunity(ship);
    return { morale: ship.systems.morale, loyalty: company.loyalty };
}
function crewReactionDelta(before, s) {
    const after = crewReactionSnapshot(s);
    return { morale: Math.round(after.morale - before.morale), loyalty: Math.round(after.loyalty - before.loyalty) };
}
function showCrewReaction(delta, context = "generic") {
    if (Math.abs(delta.morale) < 1 && Math.abs(delta.loyalty) < 1)
        return;
    const positive = delta.morale > 0 || delta.loyalty > 0;
    const negative = delta.morale < 0 || delta.loyalty < 0;
    const title = context === "shore_leave"
        ? "The crew appreciates the time ashore."
        : context === "prize_share"
            ? "The crew remembers your fairness."
            : context === "underprovisioned"
                ? "The crew didn't like putting to sea without stores."
                : context === "battle" && positive && !negative
                    ? "Victory lifts the crew."
                    : context === "battle" && negative && !positive
                        ? "The crew is shaken by the outcome."
                        : negative && !positive
                            ? "The crew didn't like that."
                            : positive && !negative
                                ? "The crew approved of your decision."
                                : "The crew has mixed feelings about that.";
    const changes = [delta.morale ? `Morale ${delta.morale > 0 ? "+" : ""}${delta.morale}` : "", delta.loyalty ? `Loyalty ${delta.loyalty > 0 ? "+" : ""}${delta.loyalty}` : ""].filter(Boolean).join(" · ");
    window.setTimeout(() => {
        document.querySelector(".toast")?.remove();
        const node = document.createElement("div");
        node.className = `toast crew-reaction-toast ${negative && !positive ? "negative" : positive && !negative ? "positive" : "mixed"}`;
        node.innerHTML = `<b>${esc(title)}</b><span>${esc(changes)}</span>`;
        document.body.appendChild(node);
        if (toastTimer !== undefined)
            window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => node.remove(), 3600);
    }, 650);
}
function handleCrewResult(s, before, result, context = "generic", sound) {
    const delta = result.ok ? crewReactionDelta(before, s) : { morale: 0, loyalty: 0 };
    if (sound && result.ok)
        cue(sound);
    toast(result.message);
    renderGame();
    if (result.ok)
        showCrewReaction(delta, context);
}
function revealWithinLocalPane(selector, align = "center") {
    const target = document.querySelector(selector);
    if (!target)
        return;
    let pane = target.parentElement;
    while (pane && pane !== app) {
        const overflowY = getComputedStyle(pane).overflowY;
        if ((overflowY === "auto" || overflowY === "scroll") && pane.scrollHeight > pane.clientHeight)
            break;
        pane = pane.parentElement;
    }
    if (!pane || pane === app)
        return;
    const paneRect = pane.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const desired = align === "end"
        ? targetRect.bottom - paneRect.bottom + pane.scrollTop
        : targetRect.top - paneRect.top + pane.scrollTop - (pane.clientHeight - targetRect.height) / 2;
    pane.scrollTo({ top: Math.max(0, desired), behavior: "smooth" });
}
function itemSummaryLine(defId) {
    const def = ITEM_BY_ID[defId];
    if (!def)
        return "Unknown item";
    const parts = [titleize(def.category)];
    if (def.attack)
        parts.push(`ATK ${def.attack}`);
    if (def.defense)
        parts.push(`DEF ${def.defense}`);
    return parts.join(" · ");
}
function ownerDisplayName(s, ownerId) {
    return ownerId === "player" ? s.player.character.name : s.npcs[ownerId]?.name ?? "Companion";
}
function playerIdentityPresentation(s) {
    const captain = s.player.character;
    return resolveIdentityPresentation({
        ancestry: captain.ancestry,
        culture: captain.culture,
        homelandRegion: captain.homelandRegion,
        religion: captain.religion
    });
}
function npcIdentityPresentation(npc) {
    const presentation = resolveIdentityPresentation({
        ancestry: npc.ancestry,
        culture: npc.culture,
        homelandRegion: npc.homelandRegion,
        religion: npc.religion
    });
    const affiliationMark = affiliationMarkForCharacter(npc);
    if (affiliationMark)
        presentation.affiliationMark = affiliationMark;
    return presentation;
}
function identityMarkHtml(mark, className = "") {
    return `<span class="identity-mark-chip ${esc(className)} ${esc(mark.kind)}" title="${esc(mark.label)}"><img src="${esc(mark.path)}" alt="${esc(mark.label)}"></span>`;
}
function identityMarkImage(mark, className = "") {
    return `<img class="context-symbol-image ${esc(className)}" src="${esc(mark.path)}" alt="${esc(mark.label)}" title="${esc(mark.label)}">`;
}
function uniqueMarks(marks) {
    const seen = new Set();
    return marks.filter((mark) => {
        if (!mark || seen.has(mark.id))
            return false;
        seen.add(mark.id);
        return true;
    });
}
function markStripHtml(marks, className = "") {
    const resolved = uniqueMarks(marks);
    if (!resolved.length)
        return "";
    return `<span class="context-symbol-strip ${esc(className)}" aria-label="Identity symbols">${resolved.map((mark) => identityMarkHtml(mark, "compact")).join("")}</span>`;
}
function npcPublicMarks(npc) {
    const identity = npcIdentityPresentation(npc);
    const explicitlyReligiousRole = npc.profession === "priest" || /priest|preacher|cleric|temple|monk|religious/i.test(npc.role);
    return uniqueMarks([primaryIdentityMark(identity), explicitlyReligiousRole ? identity.religionMark : undefined]);
}
function npcDetailMarks(npc) {
    const identity = npcIdentityPresentation(npc);
    return uniqueMarks([primaryIdentityMark(identity), identity.religionMark]);
}
function portPrimaryMark(portId) {
    const port = PORT_BY_ID[portId];
    return port ? homelandMarkForRegion(port.region) : undefined;
}
function shipIdentityMark(s, shipId) {
    const ship = s.ships[shipId];
    if (!ship)
        return undefined;
    const ownerIsPlayer = ship.ownerCharacterId === s.player.character.id;
    const owner = ownerIsPlayer ? undefined : s.npcs[ship.ownerCharacterId];
    const ownerPresentation = ownerIsPlayer ? playerIdentityPresentation(s) : owner ? npcIdentityPresentation(owner) : undefined;
    return shipIdentityMarkForContext({
        ...(ownerPresentation ? { ownerPresentation } : {}),
        ...(owner ? { ownerProfession: owner.profession, ownerRole: owner.role } : {}),
        fallbackRegion: ship.region
    });
}
function identityStyle(presentation) {
    return `--identity-banner:${presentation.bannerColor};--identity-accent:${presentation.accentColor};--identity-ancestry:${presentation.ancestryAccent}`;
}
function displaySlotName(slot) {
    return slot === "back" ? "Back / Cloak"
        : slot === "relic" ? "Relic / Charm"
            : slot === "tool" ? "Tool"
                : slotLabel(slot);
}
function itemVisual(definitionId) {
    const def = definitionId ? ITEM_BY_ID[definitionId] : undefined;
    const art = def?.artAssetId ? ASSET_BY_ID[def.artAssetId] : undefined;
    return { def, art };
}
function inventoryFilterFor(ownerId) {
    return inventoryFilters[ownerId] ?? "all";
}
function inventoryFilterLabel(filter) {
    return filter === "all" ? "All"
        : filter === "weapons" ? "Weapons"
            : filter === "clothing" ? "Clothing"
                : filter === "tools" ? "Tools"
                    : filter === "goods" ? "Goods"
                        : filter === "charts" ? "Charts"
                            : filter === "quest" ? "Quest Items"
                                : "Documents";
}
function itemMatchesFilter(definitionId, filter) {
    if (filter === "all")
        return true;
    const def = ITEM_BY_ID[definitionId];
    if (!def)
        return false;
    if (filter === "weapons")
        return def.category === "weapon" || def.category === "firearm";
    if (filter === "clothing")
        return def.category === "armor" || def.category === "clothing" || def.slot === "head" || def.slot === "feet" || def.slot === "hands" || def.slot === "legs";
    if (filter === "tools")
        return def.category === "tool";
    if (filter === "charts")
        return def.category === "document" && (def.tags.includes("map") || def.tags.includes("chart") || def.name.toLowerCase().includes("chart"));
    if (filter === "documents")
        return def.category === "document" || def.category === "book";
    if (filter === "quest")
        return def.tags.includes("quest") || def.tags.includes("quest_item") || def.tags.includes("key_item");
    return def.category === "consumable" || def.category === "misc" || def.category === "trinket" || def.category === "relic";
}
function filteredInventory(s, ownerId) {
    const filter = inventoryFilterFor(ownerId);
    return inventoryForOwner(s, ownerId).filter((item) => itemMatchesFilter(item.definitionId, filter));
}
function ensureSelectedInventoryItem(s, ownerId) {
    const items = filteredInventory(s, ownerId);
    if (!items.length) {
        if (selectedInventoryOwnerId === ownerId)
            selectedInventoryItemId = undefined;
        return undefined;
    }
    if (selectedInventoryOwnerId === ownerId && selectedInventoryItemId && items.some((item) => item.id === selectedInventoryItemId))
        return selectedInventoryItemId;
    selectedInventoryOwnerId = ownerId;
    selectedInventoryItemId = items[0]?.id;
    return selectedInventoryItemId;
}
function inventoryTooltip(s, ownerId, instanceId) {
    const inst = inventoryForOwner(s, ownerId).find((item) => item.id === instanceId);
    const def = inst ? ITEM_BY_ID[inst.definitionId] : undefined;
    if (!inst || !def)
        return "Unavailable item data.";
    const parts = [def.name, itemSummaryLine(def.id), `${titleize(inst.quality)} quality`, `${titleize(inst.condition)} condition`];
    if (def.description)
        parts.push(def.description);
    return parts.join(" · ");
}
function equipmentTemplateVariantForOwner(s, ownerId) {
    const sex = ownerId === "player" ? s.player.character.sex : s.npcs[ownerId]?.sex;
    return sex === "female" ? "female" : "male";
}
function itemAllowedSlots(definitionId, slots) {
    const def = definitionId ? ITEM_BY_ID[definitionId] : undefined;
    if (!def)
        return [];
    return (def.allowedSlots ?? (def.slot ? [def.slot] : [])).filter((slot) => slots.includes(slot));
}
function ownerStatsForGearScreen(s, ownerId) {
    if (ownerId === "player") {
        return {
            title: "Captain",
            name: s.player.character.name,
            subtitle: `${titleize(s.player.character.recentProfession)} · ${currentPortName(s)}`,
            shipName: getPlayerShip(s)?.name ?? "Ship pending",
            health: s.player.character.condition.health,
            fatigue: s.player.character.condition.fatigue,
            carried: inventoryForOwner(s, ownerId).length,
            coin: s.player.character.crowns,
            motto: "Same sea. Different sorts of men."
        };
    }
    const npc = s.npcs[ownerId];
    return {
        title: "Companion",
        name: npc.name,
        subtitle: `${titleize(npc.profession)} · ${titleize(npc.role)}`,
        shipName: getPlayerShip(s)?.name ?? "Tideworn",
        health: npc.condition.health,
        fatigue: npc.condition.fatigue,
        carried: inventoryForOwner(s, ownerId).length,
        coin: undefined,
        motto: npc.speakingStyle
    };
}
function equipmentManifestForOwner(s, ownerId) {
    const variant = equipmentTemplateVariantForOwner(s, ownerId);
    const layoutId = `ui.character.equipment.${variant}`;
    const manifest = artLayoutById(layoutId);
    if (!manifest)
        throw new Error(`Missing art layout manifest: ${layoutId}`);
    return manifest;
}
function manifestFor(layoutId) {
    const manifest = artLayoutById(layoutId);
    if (!manifest)
        throw new Error(`Missing art layout manifest: ${layoutId}`);
    return manifest;
}
function runtimeArtPathFor(manifest) {
    const assetId = manifest.runtimeBaseAssetId ?? manifest.assetId;
    const asset = ASSET_BY_ID[assetId];
    if (!asset?.path)
        throw new Error(`Missing runtime art asset for ${manifest.layoutId}: ${assetId}`);
    if (asset.artUsage === "reference")
        throw new Error(`Reference-only art cannot be used as runtime base: ${assetId}`);
    return asset.path;
}
function renderMappedArtScreen(layoutId, layers, options = {}) {
    const manifest = manifestFor(layoutId);
    const referenceArtPath = manifest.referenceAssetId ? ASSET_BY_ID[manifest.referenceAssetId]?.path : undefined;
    return renderArtScreenHost({
        manifest,
        artPath: runtimeArtPathFor(manifest),
        ...(referenceArtPath ? { referenceArtPath, referenceLabel: ASSET_BY_ID[manifest.referenceAssetId]?.displayName ?? "Approved reference" } : {}),
        layers,
        debugMode: artCalibrationEnabled(),
        ...(options.className ? { className: options.className } : {}),
        ...(options.hostClassName ? { hostClassName: options.hostClassName } : {}),
        ...(options.ariaLabel ? { ariaLabel: options.ariaLabel } : {}),
        ...(options.screenId ? { screenId: options.screenId } : {})
    });
}
function regionIdForEquipmentSlot(slot) {
    return slot === "back" ? "cloak"
        : slot === "feet" ? "boots"
            : slot === "ring1" ? "accessory1"
                : slot === "ring2" ? "accessory2"
                    : slot;
}
function renderEquipmentIdentityLayers(s, ownerId) {
    const npc = ownerId === "player" ? undefined : s.npcs[ownerId];
    const presentation = ownerId === "player" ? playerIdentityPresentation(s) : npc ? npcIdentityPresentation(npc) : undefined;
    if (!presentation)
        return [];
    const mark = presentation.homelandMark;
    const homeland = ownerId === "player" ? s.player.character.homelandRegion : npc?.homelandRegion ?? "skeldra";
    return [{
            regionId: "identityBanner",
            className: "equipment-identity-region",
            pointerEvents: "none",
            html: `<div class="equipment-identity-banner" style="${identityStyle(presentation)}" ${mark ? `title="${esc(mark.label)}"` : `title="${esc(titleize(homeland))} identity"`}>${mark ? `<img src="${esc(mark.path)}" alt="">` : `<span class="equipment-identity-blank" aria-hidden="true"></span>`}</div>`
        }];
}
function renderEquipmentSummaryLayers(s, ownerId) {
    const summary = ownerStatsForGearScreen(s, ownerId);
    return [
        { regionId: "captainName", className: "equipment-template-text equipment-template-name", pointerEvents: "none", html: `<span>${esc(summary.name)}</span>` },
        { regionId: "shipName", className: "equipment-template-text equipment-template-ship", pointerEvents: "none", html: `<span>${esc(summary.shipName)}</span>` },
        { regionId: "healthValue", className: "equipment-template-text equipment-template-value", pointerEvents: "none", html: `<span>${summary.health}/100</span>` },
        { regionId: "fatigueValue", className: "equipment-template-text equipment-template-value", pointerEvents: "none", html: `<span>${summary.fatigue}/100</span>` },
        { regionId: "carryValue", className: "equipment-template-text equipment-template-value", pointerEvents: "none", html: `<span>${summary.carried} items</span>` },
        { regionId: "coinValue", className: "equipment-template-text equipment-template-value", pointerEvents: "none", html: `<span>${summary.coin === undefined ? "—" : `${summary.coin}`}</span>` },
        { regionId: "healthBar", className: "equipment-meter-layer health", pointerEvents: "none", html: `<span style="width:${pct(summary.health)}"></span>` },
        { regionId: "fatigueBar", className: "equipment-meter-layer fatigue", pointerEvents: "none", html: `<span style="width:${pct(summary.fatigue)}"></span>` }
    ];
}
function renderEquipmentPrimaryLayers(ownerId) {
    const current = inventoryFilterFor(ownerId);
    const modes = [
        ["primaryInventory", "all", "Inventory"],
        ["primaryGoods", "goods", "Goods"],
        ["primaryQuest", "quest", "Quest Items"],
        ["primaryDocuments", "documents", "Documents"]
    ];
    return modes.map(([regionId, filter, label]) => ({
        regionId,
        className: "equipment-primary-region",
        html: `<button class="equipment-primary-hit ${current === filter || (filter === "all" && ["weapons", "clothing", "tools", "charts"].includes(current)) ? "active" : ""}" data-action="set-inventory-filter" data-owner="${esc(ownerId)}" data-filter="${filter}" aria-label="${esc(label)}"><span>${esc(label)}</span></button>`
    }));
}
function renderEquipmentFilterLayers(ownerId) {
    const current = inventoryFilterFor(ownerId);
    const filters = [
        ["all", "filterAll"],
        ["weapons", "filterWeapons"],
        ["clothing", "filterClothing"],
        ["tools", "filterTools"],
        ["goods", "filterGoods"],
        ["charts", "filterCharts"],
        ["documents", "filterDocuments"]
    ];
    return filters.map(([filter, regionId]) => ({
        regionId,
        className: "equipment-filter-region",
        html: `<button class="equipment-filter-hit ${current === filter ? "active" : ""}" data-action="set-inventory-filter" data-owner="${esc(ownerId)}" data-filter="${filter}" aria-label="${esc(inventoryFilterLabel(filter))}"><span>${esc(inventoryFilterLabel(filter))}</span></button>`
    }));
}
function renderEquipmentSlotLayers(s, ownerId, slots, equipment) {
    const selectedInst = selectedInventoryOwnerId === ownerId && selectedInventoryItemId ? inventoryForOwner(s, ownerId).find((item) => item.id === selectedInventoryItemId) : undefined;
    const selectedAllowed = itemAllowedSlots(selectedInst?.definitionId, slots);
    return slots.map((slot) => {
        const instanceId = equipment[slot];
        const inst = instanceId ? inventoryForOwner(s, ownerId).find((item) => item.id === instanceId) : undefined;
        const { def, art } = itemVisual(inst?.definitionId);
        const compatible = !instanceId && selectedInst && selectedAllowed.includes(slot);
        const action = instanceId ? "unequip-slot" : compatible ? "quick-equip-slot" : "inspect-slot";
        const tooltipText = instanceId
            ? `${displaySlotName(slot)} · ${def?.name ?? "Equipped item"}. Click to unequip.`
            : compatible
                ? `${displaySlotName(slot)} · click to equip selected item here.`
                : `${displaySlotName(slot)} slot.`;
        return {
            regionId: regionIdForEquipmentSlot(slot),
            className: `equipment-slot-region ${instanceId ? "filled" : "empty"} ${compatible ? "compatible" : ""}`,
            html: `<button class="equipment-slot-hit has-tooltip" ${tip(tooltipText)} data-action="${action}" data-owner="${esc(ownerId)}" data-slot="${slot}" ${compatible && selectedInst ? `data-id="${esc(selectedInst.id)}"` : ""} ${!instanceId && !compatible ? "tabindex='-1'" : ""}>${instanceId && art?.path ? `<img class="equipment-slot-icon" src="${art.path}" alt="${esc(def?.name ?? displaySlotName(slot))}">` : ""}${instanceId ? `<span class="visually-hidden">${esc(def?.name ?? displaySlotName(slot))}</span>` : ""}</button>`
        };
    });
}
function renderInventoryGridContent(s, ownerId, slots) {
    const items = filteredInventory(s, ownerId);
    const cellCount = 30;
    const maxPage = Math.max(0, Math.ceil(items.length / cellCount) - 1);
    const page = Math.max(0, Math.min(maxPage, inventoryPages[ownerId] ?? 0));
    inventoryPages[ownerId] = page;
    const pageItems = items.slice(page * cellCount, page * cellCount + cellCount);
    if (selectedInventoryOwnerId !== ownerId || !selectedInventoryItemId || !pageItems.some((item) => item.id === selectedInventoryItemId)) {
        selectedInventoryOwnerId = ownerId;
        selectedInventoryItemId = pageItems[0]?.id;
    }
    const selectedId = selectedInventoryItemId;
    return `<div class="equipment-grid-inside-art">${Array.from({ length: cellCount }, (_, index) => {
        const inst = pageItems[index];
        if (!inst)
            return `<div class="equipment-grid-cell empty"></div>`;
        const { def, art } = itemVisual(inst.definitionId);
        const equipped = isItemEquipped(s, inst.id, ownerId);
        return `<button class="equipment-grid-cell ${selectedId === inst.id ? "selected" : ""} ${equipped ? "equipped" : ""} has-tooltip" ${tip(inventoryTooltip(s, ownerId, inst.id))} data-action="inspect-item" data-owner="${esc(ownerId)}" data-id="${esc(inst.id)}">${art?.path ? `<img src="${art.path}" alt="${esc(def?.name ?? inst.definitionId)}">` : `<span class="item-placeholder">Item</span>`}${equipped ? `<span class="grid-cell-marker" aria-label="Equipped">◆</span>` : ""}</button>`;
    }).join("")}</div>`;
}
function renderSelectedItemPanelContent(s, ownerId, slots) {
    const selectedId = ensureSelectedInventoryItem(s, ownerId);
    if (!selectedId)
        return `<div class="equipment-detail-inside-art empty"><div class="equipment-detail-title">No item selected</div><p>Select an item in the grid to inspect it or equip it.</p></div>`;
    const inst = inventoryForOwner(s, ownerId).find((item) => item.id === selectedId);
    const { def, art } = itemVisual(inst?.definitionId);
    if (!inst || !def)
        return `<div class="equipment-detail-inside-art empty"><div class="equipment-detail-title">Item unavailable</div></div>`;
    const allowed = itemAllowedSlots(def.id, slots);
    const actions = allowed.length ? allowed.map((slot) => `<button class="btn small" data-action="equip-item" data-owner="${esc(ownerId)}" data-id="${esc(inst.id)}" data-slot="${slot}">Equip ${esc(displaySlotName(slot))}</button>`).join("") : `<span class="muted small">This item is carried only.</span>`;
    const total = filteredInventory(s, ownerId).length;
    const pages = Math.max(1, Math.ceil(total / 30));
    const page = Math.max(0, Math.min(pages - 1, inventoryPages[ownerId] ?? 0));
    const pager = pages > 1 ? `<div class="equipment-page-controls"><button class="btn small" data-action="inventory-page" data-owner="${esc(ownerId)}" data-dir="-1" ${page <= 0 ? "disabled" : ""}>‹</button><span>${page + 1}/${pages}</span><button class="btn small" data-action="inventory-page" data-owner="${esc(ownerId)}" data-dir="1" ${page >= pages - 1 ? "disabled" : ""}>›</button></div>` : "";
    return `<div class="equipment-detail-inside-art"><div class="equipment-detail-main">${art?.path ? `<img class="equipment-detail-art" src="${art.path}" alt="${esc(def.name)}">` : `<div class="equipment-detail-art placeholder">Item</div>`}<div class="equipment-detail-copy"><div class="equipment-detail-type">${esc(titleize(def.category))}</div><div class="equipment-detail-title">${esc(def.name)}</div><div class="equipment-detail-meta">${esc(itemSummaryLine(def.id))} · ${esc(titleize(inst.quality))} · ${esc(titleize(inst.condition))}</div><div class="equipment-detail-desc">${esc(def.description)}</div><div class="equipment-detail-actions">${actions}${pager}</div></div></div></div>`;
}
function renderArtFirstEquipmentScreen(s, ownerId, slots) {
    const manifest = equipmentManifestForOwner(s, ownerId);
    const equipment = equipmentForOwner(s, ownerId);
    if (!equipment)
        return `<div class="panel"><p class="muted">No equipment state available for this character.</p></div>`;
    const artPath = runtimeArtPathFor(manifest);
    const layers = [
        ...renderEquipmentIdentityLayers(s, ownerId),
        ...renderEquipmentSummaryLayers(s, ownerId),
        ...renderEquipmentPrimaryLayers(ownerId),
        ...renderEquipmentFilterLayers(ownerId),
        { regionId: "inventoryGrid", className: "equipment-grid-region", html: renderInventoryGridContent(s, ownerId, slots) },
        { regionId: "itemDetail", className: "equipment-detail-region", html: renderSelectedItemPanelContent(s, ownerId, slots) },
        ...renderEquipmentSlotLayers(s, ownerId, slots, equipment)
    ];
    const referenceArtPath = manifest.referenceAssetId ? ASSET_BY_ID[manifest.referenceAssetId]?.path : undefined;
    return renderArtScreenHost({ manifest, artPath, layers, debugMode: artCalibrationEnabled(), ...(referenceArtPath ? { referenceArtPath, referenceLabel: `${equipmentTemplateVariantForOwner(s, ownerId)} approved equipment reference` } : {}), className: "equipment-art-canvas", hostClassName: "equipment-art-host", ariaLabel: `${equipmentTemplateVariantForOwner(s, ownerId)} equipment and inventory layout` });
}
function shipPortraitCard(s) {
    const ship = getPlayerShip(s);
    const art = ASSET_BY_ID[ship.artAssetId ?? ""];
    const className = shipClassDefinition(ship.classId)?.name ?? titleize(ship.classId.split(".").pop() ?? ship.classId);
    return `<div class="ship-hero">${art?.path ? `<img class="ship-portrait" src="${art.path}" alt="${esc(ship.name)}">` : `<div class="ship-portrait placeholder">Ship Portrait</div>`}<div><div class="eyebrow">Flagship</div><h2 class="section-title">${esc(ship.name)}</h2><p class="small muted">${esc(className)} · your flagship</p></div></div>`;
}
function seaAudioScene(s) {
    const voyage = s.voyage;
    if (!voyage)
        return "sea_coastal";
    const progress = Number.isFinite(voyage.progress)
        ? voyage.progress
        : (voyage.routeDistanceNm > 0 ? voyage.distanceTravelledNm / voyage.routeDistanceNm : 0.5);
    const nearCoast = progress <= 0.18 || progress >= 0.82 || Boolean(voyage.fromPortId || voyage.toPortId);
    const weatherRoll = deterministicUnit(s.worldSeed, `audio-sea:${voyage.routeId}:${Math.floor(s.absoluteHour / 4)}`);
    if (weatherRoll > 0.9)
        return "sea_storm";
    if (weatherRoll > 0.72)
        return "sea_rough";
    if (nearCoast)
        return "sea_coastal";
    return weatherRoll > 0.52 ? "sea_rough" : "sea_calm";
}
function audioScene(s) {
    if (s.personalCombat && !s.personalCombat.resolved)
        return "personal_combat";
    if (s.encounter?.phase === "combat")
        return "naval_combat";
    if (s.voyage || !s.player.currentPortId)
        return seaAudioScene(s);
    if (s.player.currentPortId === "port.ironhaven")
        return "ironhaven";
    if (s.player.currentPortId === "port.stormvik")
        return "stormvik";
    if (s.player.currentPortId === "port.thorenfjord")
        return "thorenfjord";
    if (tab === "market")
        return "veyrholm_market";
    if (tab === "tavern")
        return "veyrholm_tavern";
    return "veyrholm_street";
}
function syncAudio() {
    if (!state) {
        audio.setScene("silent");
        return;
    }
    audio.configure(state.settings.audioEnabled, state.settings.masterVolume);
    audio.setScene(audioScene(state));
}
function cue(name) { audio.play(name); }
function initializePresentation() {
    initializeGameViewport(app);
    initializeArtScreenHosts(app);
    initializeArtDirectedCanvases(app);
    initializeReferenceGhosts(app);
}
function setCreatorStepInDom(nextStep) {
    creatorStep = Math.max(0, Math.min(5, nextStep));
    document.querySelectorAll("[data-creator-pane]").forEach(node => { node.hidden = Number(node.dataset.creatorPane) !== creatorStep; });
    document.querySelectorAll("[data-creator-step-button]").forEach(node => node.classList.toggle("active", Number(node.dataset.creatorStepButton) === creatorStep));
    const prev = document.querySelector("[data-creator-prev]");
    const next = document.querySelector("[data-creator-next]");
    const begin = document.querySelector("[data-creator-begin]");
    if (prev)
        prev.disabled = creatorStep === 0;
    if (next)
        next.hidden = creatorStep === 5;
    if (begin)
        begin.hidden = creatorStep !== 5;
    const current = document.querySelector("[data-creator-current]");
    if (current)
        current.textContent = `${creatorStep + 1} / 6`;
}
function creatorReligionLabel(religion) {
    if (religion === "covenant")
        return "Covenant of the One";
    if (religion === "pantheon")
        return "Central Pantheon";
    if (religion === "turning_wheel")
        return "Turning Wheel";
    if (religion === "unaffiliated")
        return "Unaffiliated / Skeptic";
    return titleize(religion);
}
function creatorBonusText(bonuses) {
    return ALL_SKILLS.filter(skill => (bonuses[skill] ?? 0) !== 0).map(skill => `+${bonuses[skill]} ${SKILL_LABELS[skill]}`).join(" · ");
}
function creatorChoiceEffects(choices) {
    const contributionBySource = new Map(startingSkillContributions(choices).map(row => [row.source, row]));
    const social = contributionBySource.get("social_origin")?.bonuses ?? {};
    const background = contributionBySource.get("background")?.bonuses ?? {};
    const profession = contributionBySource.get("profession")?.bonuses ?? {};
    const trait = contributionBySource.get("trait")?.bonuses ?? {};
    const shipImpact = startingShipOriginImpact(choices);
    const rows = [];
    const socialExtras = [];
    if (choices.socialOrigin === "merchant_family")
        socialExtras.push("starts with 320 crowns");
    else if (choices.socialOrigin === "naval_family")
        socialExtras.push("starts with 270 crowns", "+8 Skeldran standing", "Heavy Weather specialization", "easier Admiralty instruction");
    if (creatorBonusText(social) || socialExtras.length)
        rows.push({ label: `Social origin · ${titleize(choices.socialOrigin)}`, value: [creatorBonusText(social), ...socialExtras].filter(Boolean).join(" · ") });
    const backgroundExtras = [];
    if (choices.background === "former_naval_midshipman")
        backgroundExtras.push("Naval Discipline specialization", "Precision Bore Sighting", "easier Admiralty instruction");
    if (["foundry_child", "engineers_apprentice"].includes(choices.background))
        backgroundExtras.push("Naval Machinery specialization", "Emergency Hull Shoring", "faster/cheaper industrial instruction");
    if (choices.background === "raised_among_smugglers")
        backgroundExtras.push("Smuggling specialization");
    if (choices.background === "temple_educated")
        backgroundExtras.push("Read Wind", "Sense Resonance");
    if (creatorBonusText(background) || backgroundExtras.length)
        rows.push({ label: `Background · ${titleize(choices.background)}`, value: [creatorBonusText(background), ...backgroundExtras].filter(Boolean).join(" · ") });
    const professionExtras = [];
    if (choices.recentProfession === "navigator")
        professionExtras.push("Coastal Navigation specialization", "Calibrated Sextant Method");
    if (choices.recentProfession === "gunner")
        professionExtras.push("Long-Range Gunnery specialization", "Precision Bore Sighting");
    if (choices.recentProfession === "apprentice_engineer")
        professionExtras.push("Naval Machinery specialization", "Emergency Hull Shoring", "faster/cheaper industrial instruction");
    if (choices.recentProfession === "shipwright")
        professionExtras.push("faster/cheaper industrial instruction");
    if (choices.recentProfession === "smuggler")
        professionExtras.push("Smuggling specialization");
    if (choices.recentProfession === "sailor")
        professionExtras.push("Heavy Weather specialization");
    if (["scholar", "priest"].includes(choices.recentProfession))
        professionExtras.push("Read Wind", "Sense Resonance");
    if (creatorBonusText(profession) || professionExtras.length)
        rows.push({ label: `Profession · ${titleize(choices.recentProfession)}`, value: [creatorBonusText(profession), ...professionExtras].filter(Boolean).join(" · ") });
    const traitExtras = [];
    if (choices.trait === "bookworm")
        traitExtras.push("written study takes 2 fewer hours");
    if (choices.trait === "superstitious")
        traitExtras.push("no stat bonus; notices omen/sailor interpretations in relevant conversations");
    if (creatorBonusText(trait) || traitExtras.length)
        rows.push({ label: `Trait · ${titleize(choices.trait)}`, value: [creatorBonusText(trait), ...traitExtras].filter(Boolean).join(" · ") });
    const core = choices.coreSkills.map(skill => `${SKILL_LABELS[skill]} +15`).join(" · ");
    const coreExtras = choices.coreSkills.includes("arcana") ? ` · starts with ${choices.culture === "skeldran" ? "Warding" : "Divination"} specialization` : "";
    rows.push({ label: "Core training", value: `${core}${coreExtras}` });
    const shipExtras = [];
    if (shipImpact.hullBonus)
        shipExtras.push(`Tideworn +${shipImpact.hullBonus} current/max hull`);
    if (shipImpact.crownAdjustment)
        shipExtras.push(`${shipImpact.crownAdjustment} starting crowns`);
    if (shipImpact.cargo.length)
        shipExtras.push(shipImpact.cargo.map(row => `${row.quantity} ${COMMODITY_BY_ID[row.commodityId]?.name ?? titleize(row.commodityId)}`).join(", ") + " starting cargo");
    if (choices.shipOrigin === "naval_surplus")
        shipExtras.push("Former Naval Surplus recognition", "easier Admiralty instruction");
    else if (choices.shipOrigin === "prize_share")
        shipExtras.push("prize-service history can matter with veteran sailors");
    else if (choices.shipOrigin === "inherited")
        shipExtras.push("family/local ship history can matter in the home port");
    else if (choices.shipOrigin === "purchased_on_debt")
        shipExtras.push("freight and idle-time pressure affect how opportunities are read; no separate debt meter yet");
    rows.push({ label: `Ship origin · ${titleize(choices.shipOrigin)}`, value: shipExtras.join(" · ") || "No direct starting modifier." });
    const level = startingLevelFromAge(choices.age);
    rows.push({ label: `Age · ${choices.age}`, value: `Starts at Experience Level ${level} · ${experienceLevelTitle(level)}` });
    if (choices.religion !== "unaffiliated") {
        const religionEffects = ["own-faith rites, institutions and taboos begin as known context"];
        if (choices.religion === "old_gods" && choices.devotion === "moderate")
            religionEffects.push("matching religious instruction: −1h / −4 crowns");
        if (choices.religion === "old_gods" && choices.devotion === "devout")
            religionEffects.push("matching religious instruction: −2h / −8 crowns");
        rows.push({ label: `Faith · ${creatorReligionLabel(choices.religion)} / ${titleize(choices.devotion)}`, value: religionEffects.join(" · "), kind: "situational" });
    }
    else
        rows.push({ label: "Faith · Unaffiliated / Skeptic", value: "No own-faith starting knowledge; religious institutions are approached as an observer.", kind: "situational" });
    rows.push({ label: `Home · ${originSettlementName(choices.homeSettlementId)}`, value: "Ordinary districts, customs and approaches begin as familiar knowledge.", kind: "situational" });
    rows.push({ label: `Culture · ${titleize(choices.culture)}`, value: choices.coreSkills.includes("arcana") ? `Your Arcana core training begins with ${choices.culture === "skeldran" ? "Warding" : "Divination"}; culture also affects contextual familiarity.` : "Affects contextual familiarity and some social interpretation; no direct stat bonus.", kind: "situational" });
    rows.push({ label: `Ancestry · ${titleize(choices.ancestry)}`, value: "No direct stat or ability modifiers; ancestry remains identity, appearance and contextual recognition.", kind: "situational" });
    rows.push({ label: `Birth omen · ${titleize(choices.birthOmen)}`, value: "No numeric bonus; some religious and sailor interactions interpret it differently.", kind: "situational" });
    return rows;
}
function creatorToolboxHtml(choices) {
    const capability = buildCapabilityState(choices);
    const attributes = Object.entries(capability.attributes).map(([id, value]) => `<span><small>${esc(titleize(id))}</small><b>${value}</b></span>`).join("");
    const trained = ALL_SKILLS.map(skill => ({ skill, value: capability.skills[skill] })).filter(row => row.value > 5).sort((a, b) => b.value - a.value || SKILL_LABELS[a.skill].localeCompare(SKILL_LABELS[b.skill]));
    const topSkills = trained.slice(0, 6);
    const skills = topSkills.map(row => `<span><small>${esc(SKILL_LABELS[row.skill])}</small><b>${row.value}</b><em>${esc(skillRatingLabel(row.value))}</em></span>`).join("");
    const remaining = trained.length - topSkills.length;
    const core = choices.coreSkills.map(skill => `<span><b>${esc(SKILL_LABELS[skill])}</b> +15</span>`).join("");
    const specs = capability.specializations.length ? `<div class="creator-toolbox-subhead">Starting specializations</div><div class="creator-toolbox-tags">${capability.specializations.map(spec => `<span>${esc(SKILL_LABELS[spec.skillId])}: <b>${esc(spec.name)} +${spec.rating}</b></span>`).join("")}</div>` : "";
    const abilities = capability.abilities.length ? `<div class="creator-toolbox-subhead">Starting abilities</div><div class="creator-toolbox-tags">${capability.abilities.map(row => `<span><b>${esc(ABILITY_BY_ID[row.abilityId]?.name ?? titleize(row.abilityId))}</b></span>`).join("")}</div>` : "";
    const schematics = capability.schematics.length ? `<div class="creator-toolbox-subhead">Starting schematics</div><div class="creator-toolbox-tags">${capability.schematics.map(row => `<span><b>${esc(titleize(row.schematicId.split(".").pop() ?? row.schematicId))}</b></span>`).join("")}</div>` : "";
    const shipImpact = startingShipOriginImpact(choices);
    const level = startingLevelFromAge(choices.age);
    return `<section class="creator-toolbox-panel"><div class="creator-review-section-title"><span>Starting toolbox</span><small>The main things you begin able to use</small></div><div class="creator-toolbox-resources"><span><small>Crowns</small><b>${startingCrownsForChoices(choices)}</b></span><span><small>Tideworn hull</small><b>${54 + shipImpact.hullBonus}/${60 + shipImpact.hullBonus}</b></span><span><small>Supplies</small><b>18</b></span><span><small>Experience</small><b>Level ${level}</b></span></div><div class="creator-toolbox-subhead">Attributes</div><div class="creator-toolbox-attributes">${attributes}</div><div class="creator-toolbox-subhead">Core training</div><div class="creator-toolbox-tags creator-core-training-tags">${core}</div>${abilities}${specs}${schematics}<div class="creator-toolbox-subhead">Strongest starting skills</div><div class="creator-toolbox-skills">${skills || `<span class="muted">No developed skills above everyday familiarity.</span>`}</div>${remaining > 0 ? `<p class="creator-toolbox-more">+${remaining} other developed skill${remaining === 1 ? "" : "s"}; the Captain sheet shows every rating.</p>` : ""}</section>`;
}
function creatorEffectRowsHtml(choices, kind) {
    const rows = creatorChoiceEffects(choices).filter(row => (row.kind ?? "direct") === kind);
    return rows.map(row => `<div class="creator-effect-row"><b>${esc(row.label)}</b><span>${esc(row.value)}</span></div>`).join("");
}
function creatorImpactSummary(choices) {
    const capability = buildCapabilityState(choices);
    const strongest = ALL_SKILLS.map(skill => ({ skill, value: capability.skills[skill] })).sort((a, b) => b.value - a.value).slice(0, 3);
    return `Strongest starting tools: ${strongest.map(row => `${SKILL_LABELS[row.skill]} ${row.value}`).join(" · ")}. ${capability.abilities.length ? `${capability.abilities.length} starting ${capability.abilities.length === 1 ? "ability" : "abilities"}.` : "No starting special ability."}`;
}
function relationshipImportance(npc) {
    const r = npc.relationshipToPlayer;
    return Math.abs(r.trust - 25) + Math.abs(r.respect - 25) + r.affection + r.obligation + r.fear + r.suspicion + r.hatred;
}
function knownRelationshipCharacters(s) {
    const crewIds = new Set(s.player.crew.map(member => member.npcId).filter((id) => Boolean(id)));
    return Object.values(s.npcs)
        .filter(npc => crewIds.has(npc.id) || npc.locationPortId === s.player.currentPortId || relationshipStatus(npc) !== "Neutral")
        .sort((a, b) => { const crewDelta = Number(crewIds.has(b.id)) - Number(crewIds.has(a.id)); return crewDelta || relationshipImportance(b) - relationshipImportance(a) || a.name.localeCompare(b.name); });
}
function knownRelationshipRows(s, limit) {
    const all = knownRelationshipCharacters(s);
    const known = typeof limit === "number" ? all.slice(0, Math.max(0, limit)) : all;
    if (!known.length)
        return `<p class="manuscript-empty">No significant personal relationships have entered the captain's record yet.</p>`;
    return `<div class="relationship-ledger">${known.map(npc => `<div class="relationship-ledger-row"><div><b>${esc(npc.name)}</b><small>${esc(npc.role)}</small></div><span class="relationship-badge">${esc(relationshipStatus(npc))}</span></div>`).join("")}</div>`;
}
function companyFeelingTowardCaptain(s) {
    const ship = getPlayerShip(s);
    if (!ship)
        return "Unknown";
    const community = ensureCrewCommunity(ship);
    const unrest = crewUnrestProfile(s);
    if (unrest.level === "defiant")
        return "Resentful";
    if (unrest.level === "discontented")
        return "Uneasy";
    const score = ship.systems.morale * .34 + community.loyalty * .36 + community.paySatisfaction * .12 + community.foodSatisfaction * .08 + community.discipline * .06 - community.fatigue * .04;
    if (score >= 76)
        return "Supportive";
    if (score >= 62)
        return "Content";
    if (score >= 48)
        return "Reserved";
    if (score >= 34)
        return "Uneasy";
    return "Resentful";
}
const STRUCTURAL_NPC_PORTRAIT_PATHS = {
    "character.mira_holst": "/art/characters/portraits/skeldra/skeldra_f_captain_cabin_01.webp",
    "character.ulf_brenn": "/art/characters/portraits/skeldra/skeldra_m_naval_officer_studio_01.webp",
    "character.elsa_tarn": "/art/characters/portraits/skeldra/skeldra_f_shipowner_studio_01.webp",
    "character.nils_orr": "/art/characters/portraits/skeldra/skeldra_m_weathered_sailor_01.webp"
};
function structuralNpcPortrait(npc, variant = "crew") {
    if (!npc)
        return `<span class="crew-portrait-fallback npc-portrait-fallback" aria-hidden="true">?</span>`;
    const path = STRUCTURAL_NPC_PORTRAIT_PATHS[npc.id];
    const className = variant === "crew" ? "crew-row-portrait" : variant === "dialogue" ? "dialogue-npc-portrait" : "npc-context-portrait";
    return path
        ? `<img class="${className}" src="${esc(path)}" alt="${esc(npc.name)} portrait">`
        : `<span class="crew-portrait-fallback npc-portrait-fallback" aria-label="Portrait not yet assigned">${esc(npc.name.charAt(0))}</span>`;
}
function structuralCrewPortrait(npc) { return structuralNpcPortrait(npc, "crew"); }
function npcPresentAtPort(s, npc, portId) {
    if (npc.locationPortId === portId)
        return true;
    const ship = npc.shipId ? s.ships[npc.shipId] : undefined;
    return ship?.dockedAtPortId === portId;
}
function playerKnowsNpc(s, npc) {
    if (s.player.crew.some(member => member.npcId === npc.id))
        return true;
    if (relationshipStatus(npc) !== "Neutral")
        return true;
    if (s.player.knowledge.some(row => row.subjectId === npc.id))
        return true;
    if (npc.shipId && s.player.shipIntel[npc.shipId]?.identified)
        return true;
    return s.worldEvents.some(event => event.type === "character_conversation" && event.participants?.includes(npc.id));
}
function npcInstitutionMatch(npc, kind) {
    const profession = npc.profession.toLowerCase();
    const role = npc.role.toLowerCase();
    if (kind === "religion")
        return profession === "priest" || /priest|preacher|cleric|temple|monk|religious|chaplain/.test(role);
    return profession === "naval_captain" || /governor|official|admiral|royal|court|magistrate|minister|council|harbormaster/.test(role);
}
function compactNpcContextCard(npc, buttonLabel = "Speak") {
    return `<div class="card npc-public-card npc-context-card"><div class="npc-context-card-layout"><div class="npc-context-portrait-frame">${structuralNpcPortrait(npc, "context")}</div><div class="npc-context-card-copy"><div class="row between"><h3>${esc(npc.name)}</h3><span class="relationship-badge">${esc(relationshipStatus(npc))}</span></div><p>${esc(npc.role)}</p><p class="small muted">${esc(npc.speakingStyle)}</p><button class="btn small" data-action="open-dialogue" data-id="${esc(npc.id)}">${esc(buttonLabel)}</button></div></div></div>`;
}
function characterManuscriptHousing(extraClass = "") {
    return `<span class="character-manuscript-housing ${extraClass}" aria-hidden="true"><span class="manuscript-edge manuscript-edge-top"></span><span class="manuscript-edge manuscript-edge-bottom"></span><span class="manuscript-edge manuscript-edge-left"></span><span class="manuscript-edge manuscript-edge-right"></span><span class="manuscript-corner manuscript-corner-tl"></span><span class="manuscript-corner manuscript-corner-tr"></span><span class="manuscript-corner manuscript-corner-bl"></span><span class="manuscript-corner manuscript-corner-br"></span></span>`;
}
function renderCreation() {
    lastRenderedGameViewKey = undefined;
    const c = DEFAULT_CHARACTER_CHOICES;
    const attrs = ["might", "agility", "perception", "intellect", "will", "presence"];
    const skillChecks = ALL_SKILLS.map(skill => `<label class="check creator-training-choice creator-skill-choice" data-training-label="${esc(SKILL_LABELS[skill])}" data-training-description="${esc(SKILL_DESCRIPTIONS[skill])}"><input type="checkbox" name="coreSkill" value="${skill}" ${c.coreSkills.includes(skill) ? "checked" : ""}><span class="creator-skill-box" aria-hidden="true"></span>${structuralCharacterIconSlot("skill", skill)}<span class="creator-training-label">${esc(SKILL_LABELS[skill])}</span></label>`).join("");
    const portraitCards = PORTRAIT_CHOICES.map(portrait => { const art = ASSET_BY_ID[portrait.assetId]; const home = portrait.homeSettlementTags?.[0] ? originSettlementName(portrait.homeSettlementTags[0]) : undefined; const role = portrait.presentationTags?.[0] ?? portrait.professionTags[0] ?? "skeldran"; return `<label class="portrait-choice" data-portrait-id="${portrait.portraitId}"><input type="radio" name="portraitId" value="${portrait.portraitId}" ${portrait.portraitId === c.portraitId ? "checked" : ""}><span class="portrait-card">${art ? `<img src="${art.path}" alt="${esc(art.displayName)}">` : `<span class="portrait-placeholder">Portrait</span>`}<b>${esc(art?.displayName ?? titleize(role))}</b><small>${titleize(portrait.ageBand)} · ${esc(home ?? "Skeldra")}</small></span></label>`; }).join("");
    const identity = `<section class="creator-step-pane" data-creator-pane="0"><div class="creator-page-title">Identity</div><div class="form-grid creator-form-grid"><div class="field"><label>Captain name</label><input name="name" required maxlength="40" placeholder="Enter a name"></div><div class="field"><label>Age</label><input name="age" type="number" min="18" max="45" value="${c.age}"></div><div class="field"><label>Sex</label><select name="sex"><option value="male" ${c.sex === "male" ? "selected" : ""}>Male</option><option value="female" ${c.sex === "female" ? "selected" : ""}>Female</option></select></div><div class="field"><label>Ancestry</label><select name="ancestry">${["skeldran", "asterian", "serathi", "kaishin", "mixed"].map(v => `<option value="${v}" ${v === c.ancestry ? "selected" : ""}>${titleize(v)}</option>`).join("")}</select></div><div class="field"><label>Secondary ancestry</label><select name="secondaryAncestry"><option value="">None</option>${["skeldran", "asterian", "serathi", "kaishin"].map(v => `<option value="${v}">${titleize(v)}</option>`).join("")}</select><small>Used only for Mixed ancestry.</small></div></div><div class="creator-choice-impact creator-current-effects"><span>Mechanical impact</span><div id="creator-identity-effects" class="creator-impact-list"></div></div></section>`;
    const origin = `<section class="creator-step-pane" data-creator-pane="1" hidden><div class="creator-page-title">Homeland · Culture · Faith</div><div class="form-grid creator-form-grid"><div class="field"><label>Homeland</label><select name="homelandRegion">${Object.entries(HOMELAND_REGION_LABELS).map(([id, label]) => `<option value="${id}" ${id === c.homelandRegion ? "selected" : ""}>${esc(label)}</option>`).join("")}</select></div><div class="field"><label>Home settlement</label><select name="homeSettlementId">${ORIGIN_SETTLEMENTS.map(settlement => `<option value="${settlement.id}" data-region="${settlement.region}" ${settlement.id === c.homeSettlementId ? "selected" : ""}>${esc(settlement.name)}</option>`).join("")}</select></div><div class="field"><label>Starting location</label><select name="startingLocationId">${PORTS.map(port => `<option value="${port.id}" ${port.id === c.startingLocationId ? "selected" : ""}>${esc(port.name)}</option>`).join("")}</select><small>Where the campaign begins; it does not rewrite your homeland.</small></div><div class="field"><label>Culture</label><select name="culture">${["skeldran", "asterian", "serathi", "kaishin", "vesperan", "outer_isles"].map(v => `<option value="${v}" ${v === c.culture ? "selected" : ""}>${titleize(v)}</option>`).join("")}</select></div><div class="field"><label>Religion</label><select name="religion">${[["old_gods", "Old Gods"], ["covenant", "Covenant of the One"], ["pantheon", "Central Pantheon"], ["turning_wheel", "Turning Wheel"], ["unaffiliated", "Unaffiliated / Skeptic"]].map(([v, l]) => `<option value="${v}" ${v === c.religion ? "selected" : ""}>${l}</option>`).join("")}</select></div><div class="field"><label>Devotion</label><select name="devotion">${["cultural", "moderate", "devout"].map(v => `<option value="${v}" ${v === c.devotion ? "selected" : ""}>${titleize(v)}</option>`).join("")}</select></div></div><div class="creator-choice-impact creator-current-effects"><span>Current gameplay effects</span><div id="creator-origin-effects" class="creator-impact-list"></div></div></section>`;
    const history = `<section class="creator-step-pane" data-creator-pane="2" hidden><div class="creator-page-title">Background · Profession</div><div class="creator-rubric">Life Before Command</div><div class="form-grid creator-form-grid"><div class="field"><label>Social origin</label><select name="socialOrigin">${["dockside_poor", "artisan_household", "merchant_family", "naval_family", "minor_nobility", "clerical_household", "rural_household", "criminal_household"].map(v => `<option value="${v}" ${v === c.socialOrigin ? "selected" : ""}>${esc(titleize(v))}</option>`).join("")}</select></div><div class="field"><label>Background</label><select name="background">${["former_naval_midshipman", "foundry_child", "raised_among_smugglers", "shipwreck_survivor", "temple_educated", "disgraced_noble", "raised_by_monks", "engineers_apprentice"].map(v => `<option value="${v}" ${v === c.background ? "selected" : ""}>${esc(titleize(v))}</option>`).join("")}</select></div><div class="field"><label>Recent profession</label><select name="recentProfession">${["sailor", "merchant_clerk", "dockworker", "apprentice_engineer", "navigator", "marine", "shipwright", "healer", "scholar", "smuggler", "priest", "gunner"].map(v => `<option value="${v}" ${v === c.recentProfession ? "selected" : ""}>${esc(titleize(v))}</option>`).join("")}</select></div><div class="field"><label>Trait</label><select name="trait">${["sea_legs", "silver_tongue", "superstitious", "bookworm", "calm_under_fire", "old_salt"].map(v => `<option value="${v}" ${v === c.trait ? "selected" : ""}>${esc(titleize(v))}</option>`).join("")}</select></div><div class="field"><label>Birth omen</label><select name="birthOmen">${["great_storm", "high_tide", "first_snow"].map(v => `<option value="${v}" ${v === c.birthOmen ? "selected" : ""}>${esc(titleize(v))}</option>`).join("")}</select></div><div class="field"><label>How you acquired Tideworn</label><select name="shipOrigin">${["inherited", "purchased_on_debt", "naval_surplus", "prize_share"].map(v => `<option value="${v}" ${v === c.shipOrigin ? "selected" : ""}>${esc(titleize(v))}</option>`).join("")}</select></div></div><div class="creator-choice-impact creator-current-effects"><span>Current gameplay effects</span><div id="creator-history-effects" class="creator-impact-list"></div></div></section>`;
    const training = `<section class="creator-step-pane creator-training-pane" data-creator-pane="3" hidden><div class="row between"><div class="creator-page-title">Attributes · Skills</div><div class="creator-counters"><span id="attr-total"></span><span id="skill-total"></span></div></div><div class="attr-grid creator-attr-grid">${attrs.map(attr => `<label class="attr-box creator-training-choice" data-training-label="${esc(titleize(attr))}" data-training-description="${esc(ATTRIBUTE_DESCRIPTIONS[attr])}"><span class="creator-attr-label">${structuralCharacterIconSlot("attribute", attr)}<span>${esc(titleize(attr))}</span></span><input name="attr_${attr}" type="number" min="1" max="10" value="${c.attributes[attr]}"></label>`).join("")}</div><div class="creator-page-subtitle">Core Training · choose exactly five</div><div class="skill-checks creator-skill-checks">${skillChecks}</div><div class="creator-training-help" id="creator-training-help" aria-live="polite"><span>Training notes</span><b>Core skills receive +15</b><p>Click anywhere on a skill row to select it. Hover or focus an attribute or skill to see what it is used for.</p></div></section>`;
    const portraits = `<section class="creator-step-pane" data-creator-pane="4" hidden><div class="row between"><div class="creator-page-title">Portrait</div><span class="small">${PORTRAIT_CHOICES.length} curated</span></div><div id="portrait-library-note" class="notice portrait-library-note" hidden></div><div class="portrait-gallery creator-portrait-gallery">${portraitCards}<label class="portrait-choice pending-portrait" data-pending-portrait><input type="radio" name="portraitId" value="portrait.pending.regional"><span class="portrait-card"><span class="portrait-placeholder">Portrait not available</span><b>Regional Portrait</b><small>Your character can still be created with the chosen identity and appearance.</small></span></label></div><details class="custom-portrait-panel"><summary><b>Generate Custom Portrait</b> · optional</summary><label class="check"><input type="checkbox" name="customPortraitEnabled"> Use a custom generated portrait</label><input type="hidden" name="customPortraitId"><input type="hidden" name="customPortraitAssetPath"><div class="form-grid compact-form"><div class="field"><label>Build</label><select name="customBuild">${["slender", "lean", "average", "athletic", "broad", "heavy", "muscular", "wiry"].map(v => `<option value="${v}">${titleize(v)}</option>`).join("")}</select></div><div class="field"><label>Complexion</label><input name="customComplexion" value="lore-grounded for ancestry"></div><div class="field"><label>Face character</label><select name="customFace">${["angular", "round", "long", "broad", "soft", "weathered"].map(v => `<option value="${v}">${titleize(v)}</option>`).join("")}</select></div><div class="field"><label>Eyes</label><input name="customEyes" value="ancestry-compatible"></div><div class="field"><label>Hair color</label><input name="customHairColor" value="ancestry-compatible"></div><div class="field"><label>Hair style</label><input name="customHairStyle" value="working practical"></div><div class="field"><label>Facial hair</label><input name="customFacialHair" value="none"></div><div class="field"><label>Marks</label><input name="customMarks" placeholder="freckles, modest scar, weathering"></div></div><div class="custom-generation-row"><button type="button" class="btn" id="generate-custom-portrait">Generate Portrait</button><span id="custom-generation-status" class="small">Custom portrait generation is optional and may be unavailable in this build.</span></div><div id="custom-portrait-preview" class="custom-portrait-preview" hidden></div></details></section>`;
    const review = `<section class="creator-step-pane creator-review-pane" data-creator-pane="5" hidden><div class="creator-page-title">Review · Begin</div><div id="creator-review" class="creator-review creator-review-scroll" aria-label="Captain starting toolbox and choice effects"></div></section>`;
    const formHtml = `<form id="creation-form" class="creator-form">${identity}${origin}${history}${training}${portraits}${review}</form>`;
    const stepLabels = ["Identity", "Homeland", "Background", "Training", "Portrait", "Review"];
    const navHtml = `<div class="creator-step-list">${stepLabels.map((label, index) => `<button class="creator-step-button ${index === creatorStep ? "active" : ""}" data-action="creator-step" data-step="${index}" data-creator-step-button="${index}"><span>${index + 1}</span>${label}</button>`).join("")}</div>`;
    const defaultPortrait = PORTRAIT_BY_ID[c.portraitId];
    const defaultPortraitArt = defaultPortrait ? ASSET_BY_ID[defaultPortrait.assetId] : undefined;
    const portraitHtml = `<div class="creator-preview-frame" id="creator-portrait-preview">${defaultPortraitArt?.path ? `<img src="${defaultPortraitArt.path}" alt="Selected portrait">` : `<div class="portrait-placeholder">Portrait</div>`}<div class="creator-identity-caption" id="creator-identity-caption" aria-label="Selected homeland culture and faith"></div></div>`;
    const footerHtml = `<div class="creator-footer-controls"><div class="creator-footer-main"><button class="et-button" type="button" data-creator-prev data-action="creator-step-delta" data-dir="-1">‹ Previous</button><span data-creator-current>${creatorStep + 1} / 6</span><button class="et-button" type="button" data-creator-next data-action="creator-step-delta" data-dir="1">Next ›</button><button class="et-button" type="submit" form="creation-form" data-creator-begin hidden>Enter the world</button></div>${hasLocalSave() ? `<div class="creator-footer-secondary"><button type="button" class="et-button small" data-action="continue-save">Continue Save</button></div>` : ""}</div>`;
    const referencePath = ASSET_BY_ID["ui.reference.character_creator"]?.path;
    app.innerHTML = `<main class="creation creator-production-screen character-structure-screen" data-character-structure="purpose-painted-lock-candidate" data-character-refinement="frame-vignette-1e" ${characterThemeAttributes(c.culture, c.religion)} data-game-viewport><div class="creator-production-surface character-structure-grid reference-ghost-surface"><span class="character-culture-outer-frame" aria-hidden="true"></span><div class="character-art-cell character-art-rail"><aside class="creator-production-rail character-structure-rail"><div class="creator-brand"><span class="eyebrow">Ebbing Tides</span><b>Captain's Record</b><small>Character setup</small></div>${navHtml}<div class="character-culture-rail-gallery" aria-hidden="true"><span class="character-culture-banner-art"></span><span class="character-culture-lantern-art"></span></div></aside><span class="character-culture-frame" aria-hidden="true"></span></div><div class="character-art-cell character-art-pane">${characterManuscriptHousing("creator-manuscript-housing")}<section class="creator-production-form character-structure-pane">${formHtml}<span class="character-culture-manuscript-watermark" aria-hidden="true"></span><span class="character-faith-socket" aria-hidden="true"></span></section><span class="character-culture-frame" aria-hidden="true"></span></div><div class="character-art-cell character-art-side"><aside class="creator-production-side"><div class="creator-production-portrait character-structure-portrait">${portraitHtml}</div><div class="character-culture-side-vignette" aria-hidden="true"></div><div class="creator-production-footer character-structure-footer">${footerHtml}</div></aside><span class="character-culture-frame" aria-hidden="true"></span></div>${referencePath ? renderReferenceGhost(referencePath, "Approved character creator reference") : ""}</div></main><div class="toast-host"></div>`;
    initializePresentation();
    const form = document.querySelector("#creation-form");
    const updateCounters = () => { const fd = new FormData(form); const attrTotal = attrs.reduce((sum, a) => sum + Number(fd.get(`attr_${a}`)), 0); const selected = fd.getAll("coreSkill").length; const attrNode = form.querySelector("#attr-total"); const skillNode = form.querySelector("#skill-total"); if (attrNode)
        attrNode.textContent = `Attributes ${attrTotal} / 36`; if (skillNode)
        skillNode.textContent = `Skills ${selected} / 5`; };
    const syncHomeSettlement = () => { const homeland = String(form.elements.namedItem("homelandRegion").value); const select = form.elements.namedItem("homeSettlementId"); let firstVisible; let selectedVisible = false; for (const option of Array.from(select.options)) {
        const visible = option.dataset.region === homeland;
        option.hidden = !visible;
        option.disabled = !visible;
        if (visible && !firstVisible)
            firstVisible = option;
        if (visible && option.selected)
            selectedVisible = true;
    } if (!selectedVisible && firstVisible)
        select.value = firstVisible.value; };
    const syncPortraitPreview = () => { const selected = form.querySelector('input[name="portraitId"]:checked'); const node = document.querySelector("#creator-portrait-preview"); if (!node)
        return; const caption = node.querySelector("#creator-identity-caption"); const captionHtml = caption?.outerHTML ?? `<div class="creator-identity-caption" id="creator-identity-caption" aria-label="Selected homeland culture and faith"></div>`; if (!selected || selected.value === "portrait.pending.regional") {
        node.innerHTML = `<div class="portrait-placeholder">Regional portrait unavailable</div>${captionHtml}`;
        return;
    } const portrait = PORTRAIT_BY_ID[selected.value]; const art = portrait ? ASSET_BY_ID[portrait.assetId] : undefined; node.innerHTML = (art?.path ? `<img src="${art.path}" alt="${esc(art.displayName)}">` : `<div class="portrait-placeholder">Portrait unavailable</div>`) + captionHtml; };
    const syncIdentityPreview = () => {
        const choices = creationFromForm(form, true);
        const caption = document.querySelector("#creator-identity-caption");
        const homeland = HOMELAND_REGION_LABELS[choices.homelandRegion] ?? titleize(String(choices.homelandRegion));
        const culture = titleize(String(choices.culture));
        const faith = creatorReligionLabel(choices.religion);
        if (caption)
            caption.innerHTML = `<span><small>Homeland</small><b>${esc(homeland)}</b></span><span><small>Culture</small><b>${esc(culture)}</b></span><span><small>Faith</small><b>${esc(faith)}</b></span>`;
        const effects = creatorChoiceEffects(choices);
        const renderMini = (labels) => effects.filter(row => labels.some(label => row.label.startsWith(label))).map(row => `<div><b>${esc(row.label)}</b><span>${esc(row.value)}</span></div>`).join("");
        const identityImpact = form.querySelector("#creator-identity-effects");
        const originImpact = form.querySelector("#creator-origin-effects");
        const historyImpact = form.querySelector("#creator-history-effects");
        if (identityImpact)
            identityImpact.innerHTML = renderMini(["Age ·", "Ancestry ·"]);
        if (originImpact)
            originImpact.innerHTML = renderMini(["Faith ·", "Home ·", "Culture ·"]);
        if (historyImpact)
            historyImpact.innerHTML = renderMini(["Social origin ·", "Background ·", "Profession ·", "Trait ·", "Ship origin ·", "Birth omen ·"]);
    };
    const updateReview = () => {
        const node = form.querySelector("#creator-review");
        if (!node)
            return;
        const choices = creationFromForm(form, true);
        const home = originSettlementName(choices.homeSettlementId);
        const start = PORT_BY_ID[choices.startingLocationId]?.name ?? choices.startingLocationId;
        const identityBits = [`${choices.age} · ${titleize(choices.sex)}`, titleize(choices.ancestry), HOMELAND_REGION_LABELS[choices.homelandRegion] ?? titleize(String(choices.homelandRegion)), `${titleize(choices.culture)} · ${creatorReligionLabel(choices.religion)}`, home === start ? `Home & start · ${home}` : `Home ${home} · Start ${start}`];
        const directRows = creatorChoiceEffects(choices).filter(row => (row.kind ?? "direct") === "direct" && !row.label.startsWith("Core training") && !row.label.startsWith("Age ·"));
        const directHtml = directRows.map(row => `<div class="creator-effect-row"><b>${esc(row.label)}</b><span>${esc(row.value)}</span></div>`).join("");
        node.innerHTML = `<div class="creator-review-intro"><div class="character-culture-review-scene" aria-hidden="true"></div><span>Captain at a glance</span><b>${esc(choices.name || "Unnamed Captain")}</b><div class="creator-review-identity-strip">${identityBits.map(bit => `<span>${esc(bit)}</span>`).join("")}</div></div><div class="creator-review-columns">${creatorToolboxHtml(choices)}<section class="creator-effects-panel"><div class="creator-review-section-title"><span>Major choice effects</span><small>Bonuses, starting gear/capability, and live access</small></div><div class="creator-effects-direct">${directHtml}</div><details class="creator-situational-effects"><summary>Other contextual effects</summary>${creatorEffectRowsHtml(choices, "situational")}</details></section></div>`;
    };
    const rankPortraits = () => { const fd = new FormData(form); const context = { ancestry: String(fd.get("ancestry")), sex: String(fd.get("sex")), age: Number(fd.get("age")), homelandRegion: String(fd.get("homelandRegion")), culture: String(fd.get("culture")), religion: String(fd.get("religion")), background: String(fd.get("background")), profession: String(fd.get("recentProfession")) }; const ranked = rankCuratedPortraits(context); const rankById = new Map(ranked.map((row, index) => [row.portrait.portraitId, { index, row }])); const ancestryMatches = ranked.filter(row => row.ancestryMatch).length; form.querySelectorAll("[data-portrait-id]").forEach(card => { const row = rankById.get(card.dataset.portraitId ?? ""); if (!row) {
        card.style.display = "none";
        return;
    } card.style.display = ""; card.style.order = String(row.index + 1); }); const pendingCard = form.querySelector("[data-pending-portrait]"); if (pendingCard) {
        pendingCard.style.display = ancestryMatches ? "none" : "";
        pendingCard.style.order = "0";
    } const note = form.querySelector("#portrait-library-note"); if (note) {
        note.hidden = ancestryMatches > 0;
        note.textContent = ancestryMatches ? "" : `No curated ${titleize(context.ancestry)} portrait library is shipped yet. The canonical Visual-DNA placeholder is recommended.`;
    } const selected = form.querySelector('input[name="portraitId"]:checked'); const selectedCard = selected?.closest("[data-portrait-id]"); const selectedStillVisible = Boolean(selectedCard && selectedCard.style.display !== "none"); if (!selectedStillVisible || (!ancestryMatches && selected?.value !== "portrait.pending.regional")) {
        const fallback = form.querySelector('input[name="portraitId"][value="portrait.pending.regional"]');
        const best = ranked[0] ? form.querySelector(`input[name="portraitId"][value="${ranked[0].portrait.portraitId}"]`) : undefined;
        if (!ancestryMatches && fallback)
            fallback.checked = true;
        else if (best)
            best.checked = true;
    } syncPortraitPreview(); };
    form.addEventListener("input", () => { updateCounters(); updateReview(); });
    form.addEventListener("input", () => { syncIdentityPreview(); });
    const updateTrainingHelp = (choice) => { const help = form.querySelector("#creator-training-help"); if (!help)
        return; const label = choice.dataset.trainingLabel ?? "Training"; const description = choice.dataset.trainingDescription ?? ""; help.innerHTML = `<span>Training notes</span><b>${esc(label)}</b><p>${esc(description)}</p>`; };
    const trainingChoiceFromEvent = (event) => event.target instanceof Element ? event.target.closest(".creator-training-choice") ?? undefined : undefined;
    form.addEventListener("pointerover", event => { const choice = trainingChoiceFromEvent(event); if (choice)
        updateTrainingHelp(choice); });
    form.addEventListener("focusin", event => { const choice = trainingChoiceFromEvent(event); if (choice)
        updateTrainingHelp(choice); });
    form.addEventListener("change", event => { const target = event.target; if (!target)
        return; if (target.name === "homelandRegion")
        syncHomeSettlement(); if (["sex", "ancestry", "age", "homelandRegion", "culture", "religion", "background", "recentProfession"].includes(target.name))
        rankPortraits(); if (target.name === "portraitId")
        syncPortraitPreview(); if (target.name === "culture" || target.name === "religion")
        syncCreatorCharacterTheme(form); updateReview(); syncIdentityPreview(); });
    updateCounters();
    syncHomeSettlement();
    rankPortraits();
    updateReview();
    syncIdentityPreview();
    syncCreatorCharacterTheme(form);
    setCreatorStepInDom(creatorStep);
    const generateButton = form.querySelector("#generate-custom-portrait");
    generateButton?.addEventListener("click", async () => { const status = form.querySelector("#custom-generation-status"); const preview = form.querySelector("#custom-portrait-preview"); const enabled = form.elements.namedItem("customPortraitEnabled"); if (enabled)
        enabled.checked = true; const choices = creationFromForm(form, true); if (!choices.customPortrait) {
        toast("Enable and define the custom portrait first.");
        return;
    } generateButton.disabled = true; if (status)
        status.textContent = "Generating a lore-constrained portrait…"; try {
        const response = await fetch("/api/portrait/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ request: choices.customPortrait, character: { name: choices.name, age: choices.age, homelandRegion: choices.homelandRegion, homeSettlementId: choices.homeSettlementId, startingLocationId: choices.startingLocationId, culture: choices.culture, religion: choices.religion, profession: choices.recentProfession, socialOrigin: choices.socialOrigin } }) });
        const data = await response.json();
        if (!response.ok || !data.portraitId || !data.path)
            throw new Error(data.error ?? "Portrait generation failed.");
        form.elements.namedItem("customPortraitId").value = data.portraitId;
        form.elements.namedItem("customPortraitAssetPath").value = data.path;
        if (preview) {
            preview.hidden = false;
            preview.innerHTML = `<img src="${esc(data.path)}" alt="Generated custom portrait"><div><b>Generated custom portrait</b><small>${esc(data.portraitId)}</small></div>`;
        }
        const big = document.querySelector("#creator-portrait-preview");
        if (big) {
            const caption = big.querySelector("#creator-identity-caption");
            big.innerHTML = `<img src="${esc(data.path)}" alt="Generated custom portrait">${caption?.outerHTML ?? `<div class="creator-identity-caption" id="creator-identity-caption" aria-label="Selected homeland culture and faith"></div>`}`;
            syncIdentityPreview();
        }
        if (status)
            status.textContent = "Generated and cached locally.";
    }
    catch (error) {
        if (status)
            status.textContent = error instanceof Error ? error.message : "Portrait generation failed.";
    }
    finally {
        generateButton.disabled = false;
    } });
}
function creationFromForm(form, allowUngeneratedCustom = false) {
    const fd = new FormData(form);
    const attributes = { might: Number(fd.get("attr_might")), agility: Number(fd.get("attr_agility")), perception: Number(fd.get("attr_perception")), intellect: Number(fd.get("attr_intellect")), will: Number(fd.get("attr_will")), presence: Number(fd.get("attr_presence")) };
    const ancestry = String(fd.get("ancestry"));
    const secondary = String(fd.get("secondaryAncestry") ?? "") || undefined;
    const customEnabled = fd.get("customPortraitEnabled") === "on";
    const customPortrait = customEnabled ? {
        enabled: true, ancestryPrimary: (ancestry === "mixed" ? "skeldran" : ancestry), ...(secondary ? { ancestrySecondary: secondary } : {}),
        sex: String(fd.get("sex")), ageBand: Number(fd.get("age")) >= 38 ? "mature" : Number(fd.get("age")) <= 23 ? "young_adult" : "adult",
        homelandRegion: String(fd.get("homelandRegion")), homeSettlementId: String(fd.get("homeSettlementId")), startingLocationId: String(fd.get("startingLocationId")), culture: String(fd.get("culture")), religion: String(fd.get("religion")), profession: String(fd.get("recentProfession")), socialOrigin: String(fd.get("socialOrigin")),
        build: String(fd.get("customBuild")), complexion: String(fd.get("customComplexion")), faceCharacter: String(fd.get("customFace")), eyeColor: String(fd.get("customEyes")), hairColor: String(fd.get("customHairColor")), hairStyle: String(fd.get("customHairStyle")), facialHair: String(fd.get("customFacialHair")), marks: String(fd.get("customMarks") ?? "").split(",").map(v => v.trim()).filter(Boolean)
    } : undefined;
    const generatedPortraitId = String(fd.get("customPortraitId") ?? "");
    const generatedPortraitPath = String(fd.get("customPortraitAssetPath") ?? "");
    if (customEnabled && !allowUngeneratedCustom && (!generatedPortraitId || !generatedPortraitPath))
        throw new Error("Generate the custom portrait before entering the world, or turn off the custom portrait option.");
    return {
        name: String(fd.get("name") ?? "").trim(), age: Number(fd.get("age")), sex: String(fd.get("sex")), ancestry, ...(secondary ? { secondaryAncestry: secondary } : {}), homelandRegion: String(fd.get("homelandRegion")), homeSettlementId: String(fd.get("homeSettlementId")), startingLocationId: String(fd.get("startingLocationId")), culture: String(fd.get("culture")), socialOrigin: String(fd.get("socialOrigin")), background: String(fd.get("background")), religion: String(fd.get("religion")), devotion: String(fd.get("devotion")), attributes, coreSkills: fd.getAll("coreSkill").map(String), trait: String(fd.get("trait")), birthOmen: String(fd.get("birthOmen")), recentProfession: String(fd.get("recentProfession")), shipOrigin: String(fd.get("shipOrigin")), startingAttunement: 0, portraitId: customEnabled && generatedPortraitId ? generatedPortraitId : String(fd.get("portraitId") ?? "portrait.pending.regional"), ...(customPortrait ? { customPortrait } : {}), ...(customEnabled && generatedPortraitPath ? { customPortraitAssetPath: generatedPortraitPath } : {})
    };
}
function renderTopBar(s) {
    const ship = getPlayerShip(s);
    const location = s.player.currentPortId ? currentPortName(s) : s.player.currentPoiId ? (POI_BY_ID[s.player.currentPoiId]?.name ?? "Point of Interest") : `Sea ${Math.round(ship.position.x)},${Math.round(ship.position.y)}`;
    const crew = crewSummary(s);
    const unrest = crewUnrestProfile(s);
    const crewHint = [unrest.summary, ...unrest.reasons.slice(0, 2)].join(" ");
    const navigationCrewState = tab === "chart" ? `<div class="top-stat crew-hud-stat morale ${crew.unrestLevel}" title="${esc(crewHint)}">Morale <b>${esc(crew.morale)}</b></div><div class="top-stat crew-hud-stat loyalty ${crew.unrestLevel}" title="${esc(crewHint)}">Loyalty <b>${esc(crew.loyalty)}</b></div>` : "";
    return `<header class="topbar ${tab === "chart" ? "crew-nav-hud" : ""}"><div class="brand">Ebbing Tides</div><div class="top-stat"><b>${esc(formatClock(s.clock))}</b></div><div class="top-stat hide-small">${esc(location)}</div><div class="top-spacer"></div><div class="top-stat">Crowns <b>${s.player.character.crowns}</b></div><div class="top-stat hide-small">Crew <b>${ship.systems.crew}/${ship.systems.crewMax}</b></div><div class="top-stat navigation-supplies ${ship.supplies <= 0 ? "stores-empty" : ""}" ${ship.supplies <= 0 ? `title="No ship stores remain. Sailing is still possible, but prolonged shortage will wear down the crew."` : ""}>Supplies <b>${ship.supplies}</b></div>${navigationCrewState}<div class="top-actions"><button class="btn small" data-action="toggle-audio">Audio ${s.settings.audioEnabled ? "On" : "Off"}</button><button class="btn small" data-action="volume-down" title="Lower procedural audio">−</button><span class="top-stat audio-level">${Math.round(s.settings.masterVolume * 100)}%</span><button class="btn small" data-action="volume-up" title="Raise procedural audio">+</button><button class="btn small" data-action="save">Save</button><button class="btn small" data-action="new-game">New</button></div></header>`;
}
function renderNav() {
    const items = [];
    if (state?.player.currentPortId)
        items.push(["town", PORT_BY_ID[state.player.currentPortId]?.name ?? "Port"]);
    if (state?.player.currentPoiId)
        items.push(["poi", POI_BY_ID[state.player.currentPoiId]?.name ?? "Point of Interest"]);
    items.push(["inventory", "Captain"], ["ship", "Ship"], ["crew", "Crew"], ["journal", "Journal"], ["chart", "Navigation"]);
    return `<nav class="navrail" aria-label="Personal navigation">${items.map(([id, label]) => `<button data-tab="${id}" class="${tab === id ? "active" : ""}">${esc(label)}</button>`).join("")}</nav>`;
}
function portArtPath(portId) {
    const mapped = LOCATION_PRESENTATION_ART[portId];
    if (mapped)
        return mapped;
    const asset = PORT_BY_ID[portId]?.artAssetId ? ASSET_BY_ID[PORT_BY_ID[portId].artAssetId] : undefined;
    return asset?.path;
}
function poiArtPath(poiId) {
    const mapped = LOCATION_PRESENTATION_ART[poiId];
    if (mapped)
        return mapped;
    const asset = POI_BY_ID[poiId]?.artAssetId ? ASSET_BY_ID[POI_BY_ID[poiId].artAssetId] : undefined;
    return asset?.path;
}
function portArtStyle(portId) { const path = portArtPath(portId); return path ? `style="background-image:url('${path}')"` : ""; }
function poiArtStyle(poiId) { const path = poiArtPath(poiId); return path ? `style="background-image:url('${path}')"` : ""; }
function contextLocationScenePath(portId, kind) {
    const region = PORT_BY_ID[portId]?.region;
    const regional = region ? CONTEXT_LOCATION_SCENE_ART[region]?.[kind] : undefined;
    // Skeldra owns a complete category-specific scene set. Other regions use the correct
    // port/region painting rather than falling back to Skeldran art until their own market,
    // tavern, government, temple, people, and harbor paintings are supplied.
    return regional ?? LOCATION_PRESENTATION_ART[portId] ?? portArtPath(portId);
}
function contextLocationHero(portId, kind, dynamicTitle, options = {}) {
    const path = contextLocationScenePath(portId, kind);
    const art = path ? `<div class="context-scene-frame"><img src="${esc(path)}" alt="${esc(titleize(kind))} scene"></div>` : "";
    const region = PORT_BY_ID[portId]?.region ?? "crossroads";
    return `<div class="context-location-hero region-${esc(region)}" data-location-region="${esc(region)}" data-location-id="${esc(portId)}">${art}<div class="context-dynamic-heading"><div class="context-heading-copy">${options.kicker ? `<div class="eyebrow">${esc(options.kicker)}</div>` : ""}<h1>${esc(dynamicTitle)}</h1>${options.subline ? `<p>${esc(options.subline)}</p>` : ""}</div>${options.controls ? `<div class="context-heading-actions">${options.controls}</div>` : ""}</div></div>`;
}
function sceneProps(paths) {
    return `<div class="scene-prop-strip">${paths.map(([path, label]) => `<img src="${path}" alt="${esc(label)}" title="${esc(label)}">`).join("")}</div>`;
}
function statusIcon(path, label) { return `<img class="mini-status-icon" src="${path}" alt="${esc(label)}">`; }
function structuralCharacterIconSlot(kind, key) {
    return `<span class="character-icon-slot ${kind}-icon-slot" data-${kind}-icon-slot="${esc(key)}" aria-hidden="true"></span>`;
}
function shipStatusIconSlot(path, label) {
    return `<span class="ship-status-icon-slot" aria-hidden="true">${path ? statusIcon(path, label) : `<span class="ship-status-icon-empty"></span>`}</span>`;
}
const SHIP_REFIT_ICON_PATHS = {
    "refit.storm_rigging": "/art/ui/ability-library/Ship_Damage/03_Rigging_Damage.png",
    "refit.reinforced_pumps": "/art/ui/ability-library/Ship_Damage/04_Flooding.png"
};
function shipRefitIcon(id, name) {
    const path = SHIP_REFIT_ICON_PATHS[id];
    if (path)
        return `<img src="${esc(path)}" alt="${esc(name)} fitting icon">`;
    const initials = name.split(/\s+/).slice(0, 2).map(word => word.charAt(0)).join("");
    return `<span aria-hidden="true">${esc(initials)}</span>`;
}
function knowledgeStatusIcon(truthStatus, hardRumor) {
    if (truthStatus === "confirmed")
        return "/art/ui/ability-library/Knowledge_Legality/01_Known.png";
    if (truthStatus === "disproved")
        return "/art/ui/ability-library/Knowledge_Legality/03_Uncertain.png";
    return hardRumor ? "/art/ui/ability-library/Knowledge_Legality/02_Rumored.png" : "/art/ui/ability-library/Knowledge_Legality/03_Uncertain.png";
}
function meter(label, value, max) { return `<div class="meter"><div class="row between"><span>${esc(label)}</span><span>${value}/${max}</span></div><div class="meter-track"><i style="width:${pct(max ? value / max * 100 : 0)}"></i></div></div>`; }
function portReturnBar(portId, currentLabel) {
    const port = PORT_BY_ID[portId];
    return `<div class="port-context-bar"><button class="et-button small" data-tab="town">‹ ${esc(port?.name ?? "Port")}</button><span>${esc(currentLabel)}</span></div>`;
}
function settlementHubTitle(portId) {
    const port = PORT_BY_ID[portId];
    if (!port)
        return "Port";
    const canon = CANON_WORLD_LOCATION_BY_ID[portId];
    if (canon?.category === "major_capital_great_port")
        return `Capital of ${port.name}`;
    if (canon?.category === "sacred_city_fortress")
        return `City of ${port.name}`;
    if (canon?.category === "city_regional_port")
        return `City of ${port.name}`;
    return `Port of ${port.name}`;
}
function renderTown(s) {
    const portId = s.player.currentPortId;
    const port = PORT_BY_ID[portId];
    const lens = portReadLens(s);
    const actions = port.arrivalActions
        .filter((action) => action.id !== "town")
        .map((action) => `<button class="destination-card" data-action="port-action" data-id="${action.id}"><b>${esc(action.label)}</b><span>${esc(action.description)}</span></button>`)
        .join("");
    const title = settlementHubTitle(portId);
    const hero = contextLocationHero(portId, "arrival_port", title, { subline: port.role });
    const power = politicalPowerForRegion(port.region);
    const legal = legalStateForFaction(s, power.factionId);
    const legalNotice = legal.status !== "clear" ? `<div class="legal-status-notice"><span>${esc(power.jurisdictionLabel)}</span><b>${esc(legalStatusLabel(legal.status))}${legal.bounty > 0 ? ` · ${legal.bounty} cr bounty` : ""}</b><small>Local standing: ${esc(standingLabel(portStanding(s, port.id)))}</small></div>` : "";
    return `<section class="fixed-screen utility-screen contextual-location-screen settlement-hub-screen"><div class="context-location-scroll">${hero}<div class="context-location-mechanics"><div class="context-mechanics-shell settlement-hub-shell"><section class="settlement-intro"><p class="body-copy">${esc(port.description)}</p>${legalNotice}<div class="port-read-action"><button class="btn primary" data-action="assess-port">Read the Waterfront · 1h</button><small>${esc(lens.label)} · ${esc(SKILL_LABELS[lens.skillId])} and your lived experience may reveal something useful.</small></div></section><div class="settlement-destinations-heading"><div class="eyebrow">Places & districts</div><h3>Where will you go?</h3></div><div class="town-actions settlement-town-actions">${actions}</div></div></div></div></section>`;
}
function learningSourceKindLabel(kind) {
    return kind === "book" ? "Manual / text" : kind === "officer" ? "Officer instruction" : kind === "teacher" ? "Teacher" : kind === "institution" ? "Institution" : kind === "discovery" ? "Discovery" : "Training";
}
function renderLearningSourcePanel(s, kinds, title = "Instruction & Study", venue) {
    const quotes = learningSourcesAtCurrentContext(s, kinds, venue);
    if (!quotes.length)
        return "";
    const cards = quotes.map(quote => {
        const status = quote.known ? "Known" : quote.available ? `${quote.hours}h${quote.costCrowns ? ` · ${quote.costCrowns} cr` : ""}` : "Locked";
        const detail = quote.known ? "Already part of your training." : quote.available ? (quote.modifiers[0] ?? "Requirements met.") : (quote.reasons[0] ?? "Requirements not met.");
        return `<div class="card learning-source-card"><div class="row between"><div><div class="eyebrow">${esc(learningSourceKindLabel(quote.source.kind))}</div><h3>${esc(quote.source.name)}</h3></div><span class="relationship-badge">${esc(status)}</span></div><p>${esc(quote.source.description)}</p><small class="muted">${esc(detail)}</small><div class="row action-row"><button class="btn small ${quote.available ? "primary" : ""}" data-action="study-learning-source" data-id="${esc(quote.source.id)}" ${quote.available ? "" : "disabled"}>${quote.known ? "Already Learned" : quote.available ? `Study / Train · ${quote.hours}h${quote.costCrowns ? ` / ${quote.costCrowns} cr` : ""}` : "Not Available Yet"}</button></div></div>`;
    }).join("");
    return `<section class="panel learning-source-panel"><div class="eyebrow">Character development</div><h2 class="section-title">${esc(title)}</h2><p class="body-copy">Abilities and specializations come from people, institutions, texts, and discoveries in the world. Training uses actual campaign time and any stated cost.</p><div class="context-people-grid">${cards}</div></section>`;
}
function renderWorldCauseNotices(s, portId, kind) {
    const notices = activeWorldCauses(s).filter(cause => {
        if (!cause.publicInformation || !worldCauseAppliesToPort(cause, portId))
            return false;
        if (kind === "religion" && cause.kind !== "religious_policy")
            return false;
        const event = s.worldEvents.find(row => row.id === `event.world_cause.started.${cause.id}`);
        return Boolean(event && eventInformationCanReachPort(s, event, portId));
    }).slice(0, 3);
    if (!notices.length)
        return "";
    return `<div class="world-cause-notices"><div class="eyebrow">Current public notices</div>${notices.map(cause => `<div class="legal-status-notice world-cause-notice"><span>${esc(cause.title)}</span><b>${esc(cause.summary)}</b><small>${esc(cause.reason)}</small></div>`).join("")}</div>`;
}
function renderTradeAuthorityPanel(s, portId) {
    const port = PORT_BY_ID[portId];
    if (!port)
        return "";
    const power = politicalPowerForRegion(port.region);
    const policy = tradePolicyForPort(portId);
    const permit = activeTradeCredential(s, "customs_permit", power.jurisdictionId);
    const commission = activeTradeCredential(s, "letter_of_marque", power.jurisdictionId);
    const enemies = activePolicyEnemyFactions(s, power.factionId);
    const privateeringOpen = privateeringOpenForFaction(s, power.factionId) && enemies.length > 0;
    const permitText = permit ? `Current through day ${Math.floor((permit.expiresAtHour ?? s.absoluteHour) / 24) + 1}` : `${policy.customsPermitCost} cr · ${policy.customsPermitHours}h · valid 180 days`;
    const commissionText = commission ? `Active against ${commission.authorizedEnemyFactionIds.map(id => powerLabel(id)).join(", ")}` : privateeringOpen ? `${policy.commissionCost} cr · ${policy.commissionHours}h · current authorized enemies: ${enemies.map(id => powerLabel(id)).join(", ")}` : "No current policy authorizes privateering commissions.";
    return `<section class="panel trade-authority-panel"><div class="eyebrow">Trade papers & commissions</div><div class="context-people-grid"><div class="card"><b>Customs permit</b><p class="small muted">Covers cargo classes that current ${esc(policy.label)} allows only with papers.</p><p class="small">${esc(permitText)}</p>${permit ? "" : `<button class="btn small" data-action="obtain-customs-permit">Obtain Permit</button>`}</div><div class="card"><b>Letter of marque</b><p class="small muted">A commission only has force while live state policy authorizes privateering against named enemy flags.</p><p class="small">${esc(commissionText)}</p>${!commission && privateeringOpen ? `<button class="btn small" data-action="obtain-letter-marque">Request Commission</button>` : ""}</div></div></section>`;
}
function renderInstitution(s, kind) {
    const portId = s.player.currentPortId;
    const port = PORT_BY_ID[portId];
    const title = kind === "government" ? port.governmentName : port.religionName;
    const sceneKind = kind === "government" ? "royal_palace" : "temple";
    const copy = kind === "government"
        ? `${title} handles the authority, law, commissions, warrants, and political business that reach ${port.name}'s waterfront.`
        : `${title} reflects ${port.name}'s living religious landscape: worship, charity, local custom, disputes, and the people whose faith carries influence here.`;
    const kicker = kind === "government" ? "Government" : "Sacred district";
    const power = politicalPowerForRegion(port.region);
    const legal = legalStateForFaction(s, power.factionId);
    const warrant = activeWarrants(s, power.jurisdictionId);
    const governmentRecord = kind === "government" ? `<div class="legal-status-notice"><span>${esc(power.jurisdictionLabel)}</span><b>${esc(legalStatusLabel(legal.status))}${legal.bounty > 0 ? ` · ${legal.bounty} cr bounty` : ""}</b><small>${esc(standingLabel(portStanding(s, port.id)))} standing in ${esc(port.name)}</small>${warrant.length ? `<button class="btn small" data-action="settle-local-warrant" data-jurisdiction-id="${esc(power.jurisdictionId)}">Answer Warrant · ${legal.bounty} cr</button>` : ""}</div>` : "";
    const worldNotices = renderWorldCauseNotices(s, portId, kind);
    const participation = kind === "religion" ? religiousParticipationProfile(s, portId) : undefined;
    const participationAction = participation ? `<button class="destination-card" data-action="participate-religion"><b>${esc(participation.label)} · 2h</b><span>${esc(participation.summary)}</span></button>` : "";
    const tradeAuthority = kind === "government" ? renderTradeAuthorityPanel(s, portId) : "";
    const training = kind === "government" ? renderLearningSourcePanel(s, ["book", "institution"], "Institutional Training", "government") : renderLearningSourcePanel(s, ["institution"], "Ritual & Institutional Learning", "religion");
    const knownHere = Object.values(s.npcs).filter(npc => npcPresentAtPort(s, npc, portId) && playerKnowsNpc(s, npc) && npcInstitutionMatch(npc, kind));
    const peoplePanel = knownHere.length ? `<section class="panel institution-known-people"><div class="eyebrow">Known people here</div><div class="context-people-grid">${knownHere.map(npc => compactNpcContextCard(npc)).join("")}</div></section>` : "";
    const activeHere = activeDialogueNpcId && knownHere.some(npc => npc.id === activeDialogueNpcId) ? renderDialoguePanel(s, activeDialogueNpcId) : "";
    return `<section class="fixed-screen utility-screen contextual-location-screen">${portReturnBar(portId, title)}<div class="context-location-scroll">${contextLocationHero(portId, sceneKind, title, { kicker, subline: port.name })}<div class="context-location-mechanics"><div class="context-mechanics-shell"><section class="panel soft context-description-panel"><div class="eyebrow">${kind === "government" ? "Authority & petitions" : "Worship & counsel"}</div><p class="body-copy">${esc(copy)}</p>${governmentRecord}${worldNotices}<div class="context-action-grid"><button class="destination-card" data-tab="people"><b>${knownHere.length ? "Browse Other People" : "Find Someone Here"}</b><span>${kind === "government" ? "Seek officials, petitioners, officers, or court figures currently present." : "Seek priests, attendants, pilgrims, or other people currently present."}</span></button>${participationAction}</div></section>${tradeAuthority}${peoplePanel}${activeHere}${training}</div></div></div></section>`;
}
function renderVoyageReport(report) {
    if (!report)
        return "";
    const damage = report.hullDamage || report.sailsDamage || report.riggingDamage
        ? [`Hull ${report.hullDamage}`, `Sails ${report.sailsDamage}`, `Rigging ${report.riggingDamage}`].filter(value => !value.endsWith(" 0")).join(" · ")
        : "No ship damage";
    const supplies = report.suppliesExhausted ? `Supplies exhausted · ${report.suppliesUsed} used` : `Supplies ${report.suppliesUsed} used · ${report.suppliesRemaining} remaining`;
    const shortageHours = report.zeroSupplyHours ?? 0;
    const crewImpact = shortageHours > 0
        ? `${formatVoyageHours(shortageHours)} without stores · morale -${report.crewMoraleLoss ?? 0}${(report.crewHealthLoss ?? 0) > 0 ? ` · health -${report.crewHealthLoss}` : ""}`
        : "No shortage hardship";
    return `<div class="arrival-voyage-report" aria-label="Voyage report"><div><span>Voyage</span><b>${Math.round(report.distanceTravelledNm)} nm · ${formatVoyageHours(report.elapsedHours)}</b></div><div><span>Stores</span><b>${esc(supplies)}</b></div>${shortageHours > 0 ? `<div><span>Crew</span><b>${esc(crewImpact)}</b></div>` : ""}<div><span>Condition</span><b>${esc(damage)}</b></div></div>`;
}
function renderArrival(s) {
    const arrival = s.arrival;
    if (arrival.destination.type === "port") {
        const port = PORT_BY_ID[arrival.destination.id];
        if (!port)
            return "";
        const portMark = portPrimaryMark(port.id);
        const inspection = arrival.customsInspection?.status === "pending" ? arrival.customsInspection : undefined;
        const customsBlock = inspection ? `<section class="panel arrival-customs"><div class="eyebrow">Harbor customs · inspection ${inspection.intensity}</div><h3>Declare cargo or risk concealment</h3><p>${esc(inspection.reason)}</p><div class="row action-row"><button class="btn primary" data-action="customs-present">Present Papers / Declare Cargo</button>${inspection.controlledCommodityIds.length + inspection.prohibitedCommodityIds.length > 0 ? `<button class="btn" data-action="customs-conceal">Attempt Concealment</button>` : ""}</div></section>` : "";
        const portActions = inspection ? "" : `<div class="arrival-actions">${port.arrivalActions.map((action) => `<button class="destination-card" data-action="port-action" data-id="${action.id}"><b>${esc(action.label)}</b><span>${esc(action.description)}</span></button>`).join("")}</div><button class="btn chart-return" data-action="leave-port">Remain aboard / return to chart</button>`;
        return `<section class="arrival-screen" ${portArtStyle(port.id)}><div class="arrival-shade"><div class="arrival-card symbol-context-panel">${markStripHtml([portMark], "context-overlay arrival")}<div class="eyebrow">Landfall · ${esc(formatClock(s.clock))}</div><div class="arrival-kicker">You arrived at</div><h1>${esc(port.name)}</h1><p>${esc(port.description)}</p>${renderVoyageReport(arrival.voyageReport)}${customsBlock}${portActions}</div></div></section>`;
    }
    if (arrival.destination.type === "poi") {
        const poi = POI_BY_ID[arrival.destination.id];
        if (!poi)
            return "";
        const art = poiArtPath(poi.id);
        const style = art ? `style="background-image:linear-gradient(rgba(4,9,10,.34),rgba(4,9,10,.64)),url('${art}')"` : "";
        return `<section class="arrival-screen poi-arrival" ${style}><div class="arrival-shade"><div class="arrival-card"><div class="eyebrow">Point of Interest · ${esc(formatClock(s.clock))}</div><div class="arrival-kicker">You arrived at</div><h1>${esc(poi.name)}</h1><p>${esc(poi.description)}</p>${renderVoyageReport(arrival.voyageReport)}<div class="arrival-actions">${poi.arrivalActions.map((action) => `<button class="destination-card" data-action="poi-action" data-id="${action.id}"><b>${esc(action.label)}</b><span>${esc(action.description)}</span></button>`).join("")}</div><button class="btn chart-return" data-action="leave-poi">Remain aboard / return to chart</button></div></div></section>`;
    }
    return "";
}
function renderPoi(s) {
    const poiId = s.player.currentPoiId;
    const poi = poiId ? POI_BY_ID[poiId] : undefined;
    if (!poi)
        return renderChart(s);
    const focus = poiFocusAction ? poi.arrivalActions.find((action) => action.id === poiFocusAction) : poi.arrivalActions[0];
    const discoveries = renderLearningSourcePanel(s, ["discovery"], "Site Knowledge & Discovery", "poi");
    return `<section class="poi-site" ${poiArtStyle(poi.id)}><div class="poi-site-shade"><div class="panel soft poi-site-card"><div class="eyebrow">${esc(poi.role)}</div><h2 class="section-title">${esc(poi.name)}</h2><p class="body-copy">${esc(poi.description)}</p>${focus ? `<div class="poi-focus"><div class="eyebrow">Current action</div><h3>${esc(focus.label)}</h3><p>${esc(focus.description)}</p><div class="notice">What you find here depends on the site, your skills, and what has already happened in the world.</div></div>` : ""}<div class="arrival-actions">${poi.arrivalActions.map((action) => `<button class="destination-card" data-action="poi-action" data-id="${action.id}"><b>${esc(action.label)}</b><span>${esc(action.description)}</span></button>`).join("")}</div>${discoveries}<div class="row action-row"><button class="btn primary" data-action="leave-poi">Return Aboard / Navigation Map</button></div></div></div></section>`;
}
function renderShip(s) {
    const ship = getPlayerShip(s);
    const portId = s.player.currentPortId;
    const port = portId ? PORT_BY_ID[portId] : undefined;
    const firstMate = s.npcs[s.player.firstMateId];
    if (portId)
        generateContracts(s);
    const contracts = portId ? s.contracts.filter((c) => c.sourcePortId === portId && c.status === "available").slice(0, 8) : [];
    const activeHere = portId ? s.contracts.filter((c) => c.status === "accepted" && c.destinationPortId === portId) : [];
    const classDef = shipClassDefinition(ship.classId);
    const inspectionAsset = classDef?.inspectionAssetId ? ASSET_BY_ID[classDef.inspectionAssetId] : undefined;
    const shipArt = inspectionAsset?.path ?? ASSET_BY_ID[ship.artAssetId ?? ""]?.path;
    const refits = Object.entries(SHIP_REFITS);
    const cargo = ship.cargo.slice(0, 12);
    const shipSwitcher = `<div class="screen-local-tabs context-ship-switcher"><button class="subtab ${shipPanelTab === "overview" ? "active" : ""}" data-action="ship-subtab" data-view="overview">Ship</button><button class="subtab ${shipPanelTab === "work" ? "active" : ""}" data-action="ship-subtab" data-view="work" ${portId ? "" : "disabled"}>Harbor</button></div>`;
    const atSeaToolbar = `<div class="screen-local-bar"><div><div class="eyebrow">${esc(ship.name)}</div><h2 class="screen-local-title">Ship</h2></div>${shipSwitcher}</div>`;
    const portContextBar = portId && port ? portReturnBar(portId, "Harbor & Shipyard") : "";
    const portContextHero = portId && port ? contextLocationHero(portId, "harbor", ship.name, { kicker: "Ship", subline: `${classDef?.name ?? ship.classId} · Docked at ${port.name}`, controls: shipSwitcher }) : "";
    const portContextHeader = portId && port ? `${portContextBar}${portContextHero}` : atSeaToolbar;
    const repairQuote = portId ? quoteShipRepair(s, portId) : undefined;
    const repairCost = repairQuote?.ok ? repairQuote.cost : 0;
    const repairLabel = repairQuote?.ok
        ? (repairQuote.fullRestoration ? `Full Repair · ${repairCost} cr` : `Yard Repair · ${repairCost} cr`)
        : (repairQuote?.message.includes("does not need") ? "No Repairs Needed" : "Repairs unavailable");
    const supplyQuote = portId ? quoteShipSupplies(s, portId, 6) : undefined;
    const supplyLabel = supplyQuote?.ok ? `Load 6 · ${supplyQuote.cost} cr` : "Stores unavailable";
    const serviceSummary = portId ? portServiceSummary(s, portId) : undefined;
    if (shipPanelTab === "work" && portId) {
        const yardRefits = refits.slice(0, 4).map(([id, refit]) => {
            const installed = ship.refits.includes(id);
            const quote = quoteRefitAtPort(s, id);
            const stateText = installed ? "Installed" : quote.ok ? `${quote.cost} cr · ${quote.hours}h` : "Unavailable here";
            return `<button class="ship-production-refit ${installed ? "installed" : ""}" data-action="install-refit" data-id="${esc(id)}" ${quote.ok ? tip(quote.message) : `title="${esc(quote.message)}"`} ${installed || !quote.ok ? "disabled" : ""}><span class="ship-refit-icon-slot">${shipRefitIcon(id, refit.name)}</span><span class="ship-refit-copy"><b>${esc(refit.name)}</b><small>${esc(refit.description)}</small><span>${esc(stateText)}</span></span></button>`;
        }).join("");
        return `<section class="fixed-screen utility-screen contextual-location-screen contextual-ship-screen">${portContextBar}<div class="context-location-scroll">${portContextHero}<div class="context-location-mechanics"><div class="context-mechanics-shell"><div class="two-col harbor-work-grid"><section class="panel"><div class="eyebrow">Harbormaster's board</div><h3>Work & Deliveries</h3>${contracts.length ? contracts.map(c => `<div class="card"><b>${c.quantity} ${esc(COMMODITY_BY_ID[c.commodityId]?.name)} → ${esc(PORT_BY_ID[c.destinationPortId]?.name)}</b><p class="small muted">${esc(c.reason)} · reward ${c.reward} cr</p><button class="btn small" data-action="accept-contract" data-id="${esc(c.id)}">Accept</button></div>`).join("") : `<p class="muted">No worthwhile delivery work is posted right now.</p>`}${activeHere.length ? `<hr class="rule"><div class="eyebrow">Cargo ready to turn in</div>${activeHere.map(c => `<div class="card"><b>${esc(COMMODITY_BY_ID[c.commodityId]?.name)}</b><p>${c.quantity} units · ${c.reward} crowns</p><button class="btn primary" data-action="fulfill-contract" data-id="${esc(c.id)}">Deliver Cargo</button></div>`).join("")}` : ""}</section><div><section class="panel harbor-services-panel"><div class="eyebrow">Shipyard services</div><h3>Stores & Repairs</h3>${serviceSummary ? `<p class="small muted">${esc(serviceSummary.yard)} · ${esc(serviceSummary.provisions)}</p>` : ""}<div class="harbor-service-state"><div class="harbor-service-row ${ship.supplies <= 6 ? "attention" : ""}"><span>Supplies aboard</span><b>${ship.supplies}</b><small>${esc(supplyLabel)}</small></div><div class="harbor-service-row ${ship.systems.hull < ship.systems.hullMax ? "damaged" : ""}"><span>Hull</span><b>${ship.systems.hull}/${ship.systems.hullMax}</b><small>${ship.systems.hull < ship.systems.hullMax ? "Damaged" : "Sound"}</small></div><div class="harbor-service-row ${ship.systems.sails < ship.systems.sailsMax ? "damaged" : ""}"><span>Sails</span><b>${ship.systems.sails}/${ship.systems.sailsMax}</b><small>${ship.systems.sails < ship.systems.sailsMax ? "Damaged" : "Ready"}</small></div><div class="harbor-service-row ${ship.systems.rigging < ship.systems.riggingMax ? "damaged" : ""}"><span>Rigging</span><b>${ship.systems.rigging}/${ship.systems.riggingMax}</b><small>${ship.systems.rigging < ship.systems.riggingMax ? "Damaged" : "Ready"}</small></div></div><div class="harbor-service-actions"><button class="btn primary" data-action="buy-supplies" ${supplyQuote?.ok ? "" : "disabled"}>${supplyQuote?.ok ? `Load 6 Supplies · ${supplyQuote.cost} cr` : `Stores unavailable`}</button><button class="btn ${repairQuote?.ok ? "primary" : ""}" data-action="repair-ship" title="${esc(repairQuote?.message ?? repairLabel)}" ${repairQuote?.ok ? "" : "disabled"}>${esc(repairLabel)}</button></div></section><section class="panel"><div class="eyebrow">Available refits</div><h3>Yard Work</h3><div class="ship-production-refit-grid">${yardRefits}</div></section></div></div></div></div></div></section>`;
    }
    const buildRole = shipBuildRole(ship);
    const companySummary = crewSummary(s);
    const repairQuick = (label) => portId && repairQuote?.ok ? `<button class="ship-status-quick-action" data-action="repair-ship" title="Repair eligible ship damage · ${repairQuote.cost} cr" aria-label="Repair ${esc(label)} and other eligible ship damage for ${repairQuote.cost} crowns">+</button>` : "";
    const supplyQuick = portId && supplyQuote?.ok ? `<button class="ship-status-quick-action" data-action="buy-supplies" title="Load 6 supplies · ${supplyQuote.cost} cr" aria-label="Load 6 supplies for ${supplyQuote.cost} crowns">+</button>` : "";
    const vesselStatus = [
        ["/art/ui/ability-library/Ship_Damage/01_Hull_Damage.png", "Hull", `${ship.systems.hull}/${ship.systems.hullMax}`, ship.systems.hull < ship.systems.hullMax ? repairQuick("hull") : ""],
        ["/art/ui/ability-library/Ship_Damage/02_Sails_Damaged.png", "Sails", `${ship.systems.sails}/${ship.systems.sailsMax}`, ship.systems.sails < ship.systems.sailsMax ? repairQuick("sails") : ""],
        ["/art/ui/ability-library/Ship_Damage/03_Rigging_Damage.png", "Rigging", `${ship.systems.rigging}/${ship.systems.riggingMax}`, ship.systems.rigging < ship.systems.riggingMax ? repairQuick("rigging") : ""],
        ["", "Guns", `Battery ${ship.firepower}`]
    ];
    if (ship.systems.flooding > 0)
        vesselStatus.push(["/art/ui/ability-library/Ship_Damage/04_Flooding.png", "Flooding", String(ship.systems.flooding), repairQuick("flooding")]);
    if (ship.systems.fire > 0)
        vesselStatus.push(["/art/ui/ability-library/Ship_Damage/05_Fire.png", "Fire", String(ship.systems.fire), repairQuick("fire damage")]);
    const companyStatus = [
        ["", "Crew", `${ship.systems.crew}/${ship.systems.crewMax}`],
        ["/art/ui/ability-library/Character_Conditions/08_Morale.png", "Morale", companySummary.morale],
        ["", "Loyalty", companySummary.loyalty],
        ["", "Crew quality", `${companySummary.experience} · ${companySummary.discipline}`]
    ];
    const storesStatus = [
        ["/art/props/Port_Dock/01_cargo_crate.png", "Cargo", `${cargoUsed(s)}/${ship.cargoCapacity}`],
        ["/art/props/Port_Dock/02_barrel.png", "Supplies", String(ship.supplies), supplyQuick]
    ];
    const renderStatusGroup = (label, rows) => `<section class="ship-status-group"><div class="ship-status-group-label">${esc(label)}</div><div class="ship-status-group-rows">${rows.map(([icon, rowLabel, value, action]) => `<div class="ship-production-status-row"><span class="ship-status-label">${shipStatusIconSlot(icon || undefined, rowLabel)}<span>${esc(rowLabel)}</span></span><span class="ship-status-value-actions"><b>${esc(value)}</b>${action ?? ""}</span></div>`).join("")}</div></section>`;
    const statusRows = [renderStatusGroup("Vessel", vesselStatus), renderStatusGroup("Company", companyStatus), renderStatusGroup("Stores", storesStatus)].join("");
    const refitCards = refits.slice(0, 8).map(([id, refit]) => {
        const installed = ship.refits.includes(id);
        const quote = portId ? quoteRefitAtPort(s, id) : undefined;
        const stateText = installed ? "Installed" : quote?.ok ? `${quote.cost} cr · ${quote.hours}h` : portId ? "Unavailable here" : `${refit.cost} cr · ${refit.hours}h`;
        return `<button class="ship-production-refit ${installed ? "installed" : ""}" data-action="install-refit" data-id="${esc(id)}" title="${esc(quote?.message ?? (portId ? "No yard service" : "Dock at a capable yard to install."))}" ${installed || !portId || !quote?.ok ? "disabled" : ""}><span class="ship-refit-icon-slot">${shipRefitIcon(id, refit.name)}</span><span class="ship-refit-copy"><b>${esc(refit.name)}</b><small>${esc(refit.description)}</small><span>${esc(stateText)}</span></span></button>`;
    }).join("");
    const cargoCells = Array.from({ length: 12 }, (_, i) => { const stack = cargo[i]; return stack ? `<div class="ship-production-cargo-cell"><b>${esc(COMMODITY_BY_ID[stack.commodityId]?.name ?? stack.commodityId)}</b><span>x${stack.quantity}</span></div>` : `<div class="ship-production-cargo-cell empty"></div>`; }).join("");
    const referencePath = ASSET_BY_ID["ui.reference.ship_management"]?.path;
    const shipDockStatus = port ? `Docked at ${esc(port.name)}` : "At sea";
    const shipArtHtml = shipArt ? `<div class="ship-production-art-image" role="img" aria-label="${esc(ship.name)}" style="background-image:url('${shipArt}')"></div>` : `<div class="ship-art-placeholder">Ship reference art pending</div>`;
    const shipParticulars = `<div class="ship-production-particulars"><span><small>Cruise</small><b>${Math.round((ship.cruiseSpeedKnots ?? ship.speed) * 10) / 10} kn</b></span><span><small>Maneuver</small><b>${ship.maneuverability}</b></span><span><small>Seaworthiness</small><b>${ship.seaworthiness}</b></span><span><small>Firepower</small><b>${ship.firepower}</b></span><span><small>Crew capacity</small><b>${ship.systems.crewMax}</b></span><span><small>Cargo capacity</small><b>${ship.cargoCapacity}</b></span></div>`;
    const shipOverviewBody = `<div class="ship-production-body reference-ghost-surface"><div class="ship-production-backdrop" aria-hidden="true"></div><div class="ship-production-top"><section class="et-frame ship-production-hero"><div class="ship-production-title"><div><span class="eyebrow">Flagship</span><h3>${esc(ship.name)}</h3></div><span>${esc(classDef?.name ?? ship.classId)} · ${esc(buildRole)} · ${shipDockStatus}</span></div><div class="ship-production-artwell">${shipArtHtml}</div>${shipParticulars}</section><aside class="et-frame dark ship-production-status"><div class="ship-production-panel-heading"><span class="eyebrow">Condition</span><h3>Ship Status</h3></div><div class="ship-production-status-grid">${statusRows}</div><div class="ship-production-officer"><span>First Mate</span><b>${esc(firstMate.name)}</b></div></aside></div><div class="ship-production-bottom"><section class="et-frame dark ship-production-refits"><div class="ship-production-panel-heading"><span class="eyebrow">Fitted systems</span><h3>Refits & Modules</h3></div><div class="ship-production-refit-grid">${refitCards}</div></section><section class="et-frame dark ship-production-cargo"><div class="ship-production-panel-heading"><span class="eyebrow">Ship stores</span><h3>Cargo Hold · ${cargoUsed(s)}/${ship.cargoCapacity}</h3></div><div class="ship-production-cargo-grid">${cargoCells}</div><div class="ship-production-actions"><button class="et-button small" data-tab="chart">Navigation</button><button class="et-button small" data-action="buy-supplies" title="${esc(supplyQuote?.message ?? supplyLabel)}" ${supplyQuote?.ok ? "" : "disabled"}>${supplyQuote?.ok ? `Supplies +6 · ${supplyQuote.cost} cr` : esc(supplyLabel)}</button><button class="et-button small" data-action="repair-ship" title="${esc(repairQuote?.message ?? repairLabel)}" ${repairQuote?.ok ? "" : "disabled"}>${repairQuote?.ok ? `Repair · ${repairQuote.cost} cr` : esc(repairLabel)}</button></div></section></div>${referencePath ? renderReferenceGhost(referencePath, "Approved ship management reference") : ""}</div>`;
    return portId && port
        ? `<section class="fixed-screen ship-production-screen contextual-ship-screen">${portContextBar}<div class="context-location-scroll">${portContextHero}${shipOverviewBody}</div></section>`
        : `<section class="fixed-screen ship-production-screen">${atSeaToolbar}${shipOverviewBody}</section>`;
}
function renderMarket(s) {
    const portId = s.player.currentPortId;
    const port = PORT_BY_ID[portId];
    const market = s.markets[portId];
    const ship = getPlayerShip(s);
    const goods = COMMODITIES.filter((good) => Boolean(market.goods[good.id]));
    const pageSize = 7;
    const pageCount = Math.max(1, Math.ceil(goods.length / pageSize));
    marketPage = Math.max(0, Math.min(pageCount - 1, marketPage));
    const visible = goods.slice(marketPage * pageSize, marketPage * pageSize + pageSize);
    const rows = visible.map((good) => {
        const row = market.goods[good.id];
        const price = calculatePrice(s, market, good.id);
        const cargo = ship.cargo.find((stack) => stack.commodityId === good.id)?.quantity ?? 0;
        const ratio = row.stock / row.targetStock;
        const status = ratio < .7 ? `<span class="shortage">scarce</span>` : ratio > 1.25 ? `<span class="surplus">plentiful</span>` : `<span class="market-stock-steady">steady</span>`;
        const quantity = Math.max(1, Math.min(999, Math.floor(marketTradeQuantities[good.id] ?? 1)));
        marketTradeQuantities[good.id] = quantity;
        const law = evaluateCommodityTradeLaw(s, portId, good.id);
        const backChannel = law.status !== "open" ? blackMarketAccess(s, portId) : undefined;
        const legalBlocked = law.status !== "open";
        const lawLine = `<small class="market-law-line" title="${esc(law.reason)}">${esc(law.label)}${law.causeIds.length ? " · current order" : ""}</small>`;
        const smuggleButtons = backChannel?.available ? `<button class="et-button small" data-action="smuggle-trade" data-dir="buy" data-id="${good.id}" ${row.stock <= 0 ? "disabled" : ""}>Smuggle Buy</button><button class="et-button small" data-action="smuggle-trade" data-dir="sell" data-id="${good.id}" ${cargo <= 0 ? "disabled" : ""}>Smuggle Sell</button>` : "";
        return `<tr><td><b>${esc(good.name)}</b>${lawLine}</td><td class="price">${price} cr</td><td>${status}</td><td>${cargo}</td><td class="market-trade-actions"><div class="market-trade-control"><div class="market-quantity-stepper" aria-label="${esc(good.name)} trade quantity"><button type="button" class="market-qty-button" data-action="trade-quantity" data-id="${good.id}" data-delta="-1" aria-label="Reduce ${esc(good.name)} quantity">−</button><input class="market-quantity-input" data-market-quantity="${good.id}" type="number" inputmode="numeric" min="1" max="999" value="${quantity}" aria-label="${esc(good.name)} quantity"><button type="button" class="market-qty-button" data-action="trade-quantity" data-id="${good.id}" data-delta="1" aria-label="Increase ${esc(good.name)} quantity">+</button></div><div class="market-trade-buttons"><button class="et-button small" data-action="trade" data-dir="buy" data-id="${good.id}" ${row.stock <= 0 || legalBlocked ? "disabled" : ""}>Buy</button><button class="et-button small" data-action="trade" data-dir="sell" data-id="${good.id}" ${cargo <= 0 || legalBlocked ? "disabled" : ""}>Sell</button>${smuggleButtons}</div></div></td></tr>`;
    }).join("");
    const signals = marketSignals(s, portId);
    const signalHtml = signals.map(signal => `<div class="market-intel-line ${signal.tone}"><b>${esc(signal.label)}</b><span>${esc(signal.text)}</span></div>`).join("");
    const referencePath = ASSET_BY_ID["ui.reference.market.veyrholm"]?.path;
    const marketTitle = `${port.name} Exchange`;
    return `<section class="fixed-screen market-production-screen contextual-location-screen">${portReturnBar(portId, "Market")}<div class="context-location-scroll">${contextLocationHero(portId, "market", marketTitle, { subline: "Harbor trade and current local stock" })}<div class="market-production-body reference-ghost-surface"><div class="et-frame market-ledger-frame"><div class="market-ledger-heading"><div><span class="eyebrow">Trade board</span><h3>Current Prices</h3></div><div class="market-page-counter">Page ${marketPage + 1} / ${pageCount}</div></div><div class="market-table-wrap"><table class="market-production-table"><colgroup><col class="commodity"><col class="price"><col class="stock"><col class="hold"><col class="trade"></colgroup><thead><tr><th>Commodity</th><th>Price</th><th>Availability</th><th>Hold</th><th>Trade</th></tr></thead><tbody>${rows}</tbody></table></div><div class="market-ledger-footer"><span class="market-ledger-note">Set a quantity, then buy or sell what the port is actually carrying now.</span><div class="market-pager"><button class="et-button small" data-action="market-page" data-dir="-1" ${marketPage <= 0 ? "disabled" : ""}>‹ Previous</button><button class="et-button small" data-action="market-page" data-dir="1" ${marketPage >= pageCount - 1 ? "disabled" : ""}>Next ›</button></div></div></div><aside class="et-frame market-summary-card"><div class="eyebrow">Captain's read</div><div class="market-intel-list">${signalHtml}</div><div class="market-summary-divider"></div><div class="market-summary-row"><span>Hold</span><b>${cargoUsed(s)}/${ship.cargoCapacity}</b></div><div class="market-summary-row"><span>Crowns</span><b>${s.player.character.crowns}</b></div><div class="market-summary-row"><span>Customs</span><b>${activeTradeCredential(s, "customs_permit", politicalPowerForRegion(port.region).jurisdictionId) ? "Permit current" : "No permit"}</b></div><div class="market-summary-row"><span>Commerce</span><b>${skillRatingLabel(s.player.character.skills.commerce)}</b></div></aside>${renderReferenceGhost(referencePath, "Approved market reference")}</div></div></section>`;
}
function renderSpecializationStatus(s) {
    const c = s.player.character;
    const band = attunementBand(c.attunement.value);
    const ship = s.ships[s.player.shipId];
    const interference = calculateInterference(c.attunement, ship?.attunementLoad ? [ship.attunementLoad] : []);
    const strain = c.attunement.arcaneStrain;
    if (band === "Neutral" && strain < 20 && interference.severity === "none")
        return "";
    const notes = [];
    if (strain >= 20)
        notes.push(`Arcane strain: ${titleize(strainBand(strain))}`);
    if (interference.severity !== "none")
        notes.push(`Current ship compatibility: ${titleize(interference.severity)}`);
    return `<div class="specialization-status has-tooltip" ${tip(SYSTEM_DESCRIPTIONS.attunement)}><div><div class="eyebrow">Specialization</div><h3>${esc(band)}</h3></div>${notes.length ? `<p class="small muted">${esc(notes.join(" · "))}</p>` : ""}</div>`;
}
function renderAdvancementPanel(s) {
    const c = s.player.character;
    const a = c.advancement;
    const currentFloor = experienceThresholdForLevel(a.level);
    const next = experienceThresholdForLevel(a.level + 1);
    const span = Math.max(1, next - currentFloor);
    const progress = Math.max(0, Math.min(100, ((a.lifeExperience - currentFloor) / span) * 100));
    const recent = [...a.history].reverse().slice(0, 6);
    const focusRows = a.developmentPoints > 0 ? ALL_SKILLS.map(skill => { const eligible = canFocusSkill(c, skill, s.absoluteHour); return `<div class="development-row"><div><b class="has-tooltip" ${tip(SKILL_DESCRIPTIONS[skill])}>${esc(SKILL_LABELS[skill])}</b><small>${c.skills[skill]} · ${skillRatingLabel(c.skills[skill])}</small></div><button class="btn small" data-action="focus-skill" data-id="${skill}" ${eligible.ok ? "" : `disabled title="${esc(eligible.reason)}"`}>Focus 1 DP</button></div>`; }).join("") : `<p class="muted">Development Points are earned at overall experience milestones.</p>`;
    const perkOptions = a.generalPerkPoints > 0 ? availableGeneralPerks(c).map(perk => `<div class="card"><b>${esc(perk.name)}</b><p class="small muted">${esc(perk.description)}</p>${perk.effectText ? `<p class="small"><b>Current use:</b> ${esc(perk.effectText)}</p>` : ""}<button class="btn small" data-action="take-perk" data-id="${esc(perk.id)}">Choose perk</button></div>`).join("") : "";
    return `<div class="advancement-card"><div class="row between"><div><div class="eyebrow">Life & development</div><h3>Experience Level ${a.level} · ${esc(experienceLevelTitle(a.level))}</h3></div><div class="advancement-points"><span class="has-tooltip" ${tip(SYSTEM_DESCRIPTIONS.developmentPoints)}><b>${a.developmentPoints}</b> DP</span>${a.generalPerkPoints ? `<span class="has-tooltip" ${tip(SYSTEM_DESCRIPTIONS.generalPerks)}><b>${a.generalPerkPoints}</b> Perk</span>` : ""}</div></div><div class="life-xp has-tooltip" ${tip(SYSTEM_DESCRIPTIONS.lifeExperience)}><div class="row between"><span>Life Experience</span><span>${a.lifeExperience} / ${next}</span></div><div class="xp-track"><div class="xp-fill" style="width:${progress}%"></div></div></div><p class="small muted">Overall level measures breadth of lived experience. It does not raise every stat, increase enemy power, or scale the world around you.</p>${a.generalPerks.length ? `<div class="life-talents"><div class="eyebrow">Earned life talents</div>${a.generalPerks.map(id => { const perk = GENERAL_PERKS.find(row => row.id === id); return perk ? `<span class="alpha-badge has-tooltip" ${tip(perk.effectText || perk.description)}>${esc(perk.name)}</span>` : ""; }).join(" ")}</div>` : ""}<details><summary>Focused Development ${a.developmentPoints ? `· ${a.developmentPoints} DP available` : ""}</summary><p class="small muted">Development Points accelerate a believable line of growth; they cannot turn an untouched skill into expertise from nowhere.</p><div class="development-list">${focusRows}</div></details>${a.generalPerkPoints ? `<details open><summary>General Perk opportunity</summary>${perkOptions || `<p class="muted">No perk currently matches your skills, attributes, and lived experience.</p>`}</details>` : ""}${recent.length ? `<details><summary>Recent advancement history</summary><div class="combat-log">${recent.map(row => `<div><b>H${row.atHour}</b> · ${esc(row.detail)} <span class="muted">${esc(row.source)}</span></div>`).join("")}</div></details>` : ""}</div>`;
}
function characterPanelTabs(owner, active) {
    return `<div class="character-subtabs"><button class="subtab ${active === "sheet" ? "active" : ""}" data-action="set-character-subtab" data-owner="${owner}" data-view="sheet">Character Sheet</button><button class="subtab ${active === "gear" ? "active" : ""}" data-action="set-character-subtab" data-owner="${owner}" data-view="gear">Inventory / Equipment</button></div>`;
}
function renderCaptainSummary(s) {
    const captain = s.player.character;
    const portrait = PORTRAIT_BY_ID[captain.portraitId];
    const portraitArt = portrait ? ASSET_BY_ID[portrait.assetId] : undefined;
    const portraitPath = captain.customPortraitAssetPath ?? portraitArt?.path;
    const homeland = HOMELAND_REGION_LABELS[captain.homelandRegion] ?? titleize(captain.homelandRegion);
    return `<aside class="character-sidebar character-structure-sidebar"><div class="character-sidebar-card player-identity-card character-structure-profile"><div class="manuscript-cornerwork" aria-hidden="true"></div><div class="manuscript-rubric">Captain's Record</div><h2 class="section-title manuscript-name">${esc(captain.name)}</h2><div class="manuscript-byline">${esc(titleize(captain.recentProfession))} · ${esc(homeland)}</div>${portraitPath ? `<div class="manuscript-portrait-mat"><img class="character-portrait" src="${portraitPath}" alt="${esc(captain.name)} portrait"></div>` : `<div class="portrait-placeholder large manuscript-portrait-mat">Portrait pending</div>`}<p class="character-role">${titleize(captain.background)}</p><div class="manuscript-divider"><span></span></div><div class="sidebar-stat"><span>${statusIcon("/art/ui/ability-library/Character_Conditions/01_Health.png", "Health")}Health</span><b>${captain.condition.health}/${captain.condition.healthMax}</b></div><div class="sidebar-stat"><span>${statusIcon("/art/ui/ability-library/Character_Conditions/03_Fatigue.png", "Fatigue")}Fatigue</span><b>${captain.condition.fatigue}</b></div><div class="sidebar-stat"><span>${statusIcon("/art/ui/ability-library/Character_Conditions/06_Stress_Strain.png", "Stress")}Stress</span><b>${captain.condition.stress}</b></div><div class="sidebar-stat"><span>${statusIcon("/art/ui/ability-library/Character_Conditions/02_Injury.png", "Pain")}Pain</span><b>${captain.condition.pain}</b></div><div class="sidebar-stat"><span>Crowns</span><b>${captain.crowns}</b></div><div class="manuscript-divider"><span></span></div><p class="small identity-heritage-line">${titleize(captain.ancestry)} ancestry · ${titleize(captain.culture)} culture · ${titleize(captain.religion)}</p><p class="small">Home: ${esc(originSettlementName(captain.homeSettlementId))}</p><div class="character-culture-profile-vignette" aria-hidden="true"></div></div></aside>`;
}
function renderCaptainOverview(s) {
    const captain = s.player.character;
    const treatmentQuote = s.player.currentPortId ? quoteMedicalTreatment(s, s.player.currentPortId) : undefined;
    const treatmentButton = s.player.currentPortId
        ? `<button class="btn" data-action="treat-injuries" title="${esc(treatmentQuote?.message ?? "Treatment unavailable")}" ${treatmentQuote?.ok ? "" : "disabled"}>${treatmentQuote?.ok ? `Treat Injuries · ${treatmentQuote.cost} cr · ${treatmentQuote.hours}h` : s.player.injuries.every(injury => injury.treated) ? "No Untreated Injuries" : "Treatment unavailable"}</button>${treatmentQuote?.ok && treatmentQuote.unsupportedInjuryIds.length ? `<p class="small muted">Some serious injuries require a stronger medical facility.</p>` : ""}`
        : "";
    const injuries = s.player.injuries.length
        ? s.player.injuries.map(inj => `<div class="journal-item danger manuscript-note"><b>${titleize(inj.type)} · ${titleize(inj.bodyPart)}</b><div class="small">Severity ${inj.severity} · ${inj.treated ? "treated / historical" : "untreated / active penalty"} · ${esc(inj.source)}</div></div>`).join("")
        : `<p class="manuscript-empty">No recorded injuries.</p>`;
    const attributeRows = Object.entries(captain.attributes).map(([id, value]) => `<div class="attribute-stat has-tooltip" ${tip(ATTRIBUTE_DESCRIPTIONS[id])}><span class="attribute-name">${structuralCharacterIconSlot("attribute", id)}<span>${titleize(id)}</span></span><b class="attribute-value">${value}</b></div>`).join("");
    const skillRows = ALL_SKILLS.map(id => { const progress = skillProgressPercent(captain, id); return `<div class="skill-stat has-tooltip" ${tip(SKILL_DESCRIPTIONS[id])}><div class="skill-row"><span class="skill-name">${structuralCharacterIconSlot("skill", id)}<span>${esc(SKILL_LABELS[id])}</span></span><b class="skill-value">${captain.skills[id]}</b><small class="skill-rank">${skillRatingLabel(captain.skills[id])}</small></div><div class="skill-progress"><span style="width:${progress}%"></span></div></div>`; }).join("");
    const specs = captain.specializations.length ? `<div class="specialization-list">${captain.specializations.map(sp => `<div class="specialization-row has-tooltip" ${tip(`${SYSTEM_DESCRIPTIONS.specializations} ${sp.name} focuses ${SKILL_LABELS[sp.skillId]}.`)}><b>${esc(sp.name)}</b><span>${SKILL_LABELS[sp.skillId]} <strong>+${sp.rating}</strong></span><small>${esc(sp.source)}</small></div>`).join("")}</div>` : `<p class="manuscript-empty">No specialization recorded.</p>`;
    const abilities = captain.abilities.length ? captain.abilities.map(ab => { const def = ABILITY_BY_ID[ab.abilityId]; const icon = def?.iconAssetId ? ASSET_BY_ID[def.iconAssetId] : undefined; return `<div class="card ability-card manuscript-ability has-tooltip" ${tip(def?.description ?? "A learned practice or technique grounded in training, tools, and world conditions.")}>${icon?.path ? `<img class="ability-icon" src="${icon.path}" alt="${esc(def?.name ?? ab.abilityId)}">` : ""}<div><b>${esc(def?.name ?? titleize(ab.abilityId.split(".").slice(-1)[0] ?? ab.abilityId))}</b><p class="small muted">${titleize(ab.status)} · mastery ${ab.mastery} · ${esc(ab.source)}</p><button class="btn small" data-action="use-ability" data-id="${esc(ab.abilityId)}">Use</button></div></div>`; }).join("") : `<p class="manuscript-empty">No learned practices or techniques.</p>`;
    const homeland = HOMELAND_REGION_LABELS[captain.homelandRegion] ?? titleize(captain.homelandRegion);
    const originRows = [
        ["Age", String(captain.age)], ["Ancestry", titleize(captain.ancestry)], ["Homeland", homeland], ["Home", originSettlementName(captain.homeSettlementId)],
        ["Culture", titleize(captain.culture)], ["Faith", titleize(captain.religion)], ["Social Origin", titleize(captain.socialOrigin)], ["Background", titleize(captain.background)],
        ["Profession", titleize(captain.recentProfession)], ["Trait", titleize(captain.trait)], ["Birth Omen", titleize(captain.birthOmen)], ["Tideworn", titleize(captain.shipOrigin)]
    ].map(([label, value]) => `<div class="manuscript-fact"><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join("");
    const reputationEntries = Object.entries(captain.reputation);
    const legalFactionIds = new Set(Object.values(s.player.legal).map(entry => entry.factionId));
    const currentPort = s.player.currentPortId ? PORT_BY_ID[s.player.currentPortId] : undefined;
    const currentFactionId = currentPort ? politicalPowerForRegion(currentPort.region).factionId : undefined;
    const legalPriority = { clear: 0, watched: 1, wanted: 2, outlawed: 3 };
    const knownFactionIds = [...new Set([...reputationEntries.map(([key]) => key), ...legalFactionIds])].sort((a, b) => {
        const aLegal = legalStateForFaction(s, a);
        const bLegal = legalStateForFaction(s, b);
        const legalDelta = (legalPriority[bLegal.status] ?? 0) - (legalPriority[aLegal.status] ?? 0);
        if (legalDelta)
            return legalDelta;
        const currentDelta = Number(b === currentFactionId) - Number(a === currentFactionId);
        if (currentDelta)
            return currentDelta;
        const repDelta = Math.abs(Number(captain.reputation[b] ?? 0)) - Math.abs(Number(captain.reputation[a] ?? 0));
        return repDelta || powerLabel(a).localeCompare(powerLabel(b));
    });
    const standingRows = knownFactionIds.length ? knownFactionIds.map((key) => { const value = Number(captain.reputation[key] ?? 0); const legal = legalStateForFaction(s, key); const legalText = legal.status === "clear" ? "Clear" : `${legalStatusLabel(legal.status)}${legal.bounty > 0 ? ` · ${legal.bounty} cr` : ""}`; return `<div class="standing-row"><div><b>${esc(powerLabel(key))}</b><small>Regional standing · ${esc(legalText)}</small></div><span class="standing-label">${esc(standingLabel(value))}</span></div>`; }).join("") : `<p class="manuscript-empty">No regional standing has been established yet.</p>`;
    const tradePapers = effectiveTradeCredentials(s);
    const tradePaperRows = tradePapers.map(row => { const copy = tradeCredentialSummary(row); return `<div class="standing-row"><div><b>${esc(copy.title)}</b><small>${esc(copy.detail)}</small></div><span class="standing-label">Current</span></div>`; }).join("");
    const tradePaperBlock = tradePaperRows ? `<div class="manuscript-section-heading"><span>Trade papers</span><h3>Current Credentials</h3></div>${tradePaperRows}` : "";
    const activeWarrantCount = s.player.warrants.filter(warrant => warrant.status === "active").length;
    const urgentFactionId = knownFactionIds.find(key => legalStateForFaction(s, key).status !== "clear");
    const urgentLegal = urgentFactionId ? legalStateForFaction(s, urgentFactionId) : undefined;
    const standingSummaryPrimary = activeWarrantCount > 0 ? `${activeWarrantCount} active warrant${activeWarrantCount === 1 ? "" : "s"}` : `${knownFactionIds.length} known power${knownFactionIds.length === 1 ? "" : "s"}`;
    const standingSummarySecondary = urgentFactionId && urgentLegal ? `${legalStatusLabel(urgentLegal.status)} · ${powerLabel(urgentFactionId)}` : "No active legal trouble";
    const standingOpen = knownFactionIds.length <= 3 || Boolean(urgentFactionId);
    const knownRelationships = knownRelationshipCharacters(s);
    const relationshipLead = knownRelationships[0];
    const relationshipSummaryPrimary = `${knownRelationships.length} known ${knownRelationships.length === 1 ? "person" : "people"}`;
    const relationshipSummarySecondary = relationshipLead ? `${relationshipLead.name} · ${relationshipStatus(relationshipLead)}` : "No significant ties";
    const relationshipsOpen = knownRelationships.length <= 4;
    const knownPorts = s.player.knownPortIds.map(id => PORT_BY_ID[id]).filter((port) => Boolean(port)).sort((a, b) => { const current = Number(b.id === s.player.currentPortId) - Number(a.id === s.player.currentPortId); return current || Math.abs(portStanding(s, b.id)) - Math.abs(portStanding(s, a.id)) || a.name.localeCompare(b.name); });
    const localStandingRows = knownPorts.length ? knownPorts.map(port => `<div class="standing-row"><div><b>${esc(port.name)}</b><small>${port.id === s.player.currentPortId ? "Current port" : "Local standing"}</small></div><span class="standing-label">${esc(standingLabel(portStanding(s, port.id)))}</span></div>`).join("") : `<p class="manuscript-empty">No local port standing is recorded yet.</p>`;
    const currentKnownPort = s.player.currentPortId ? knownPorts.find(port => port.id === s.player.currentPortId) : undefined;
    const localSummaryPrimary = `${knownPorts.length} known port${knownPorts.length === 1 ? "" : "s"}`;
    const localSummarySecondary = currentKnownPort ? `${currentKnownPort.name} · ${standingLabel(portStanding(s, currentKnownPort.id))}` : "No current known port";
    const localOpen = knownPorts.length <= 4;
    const accordion = (label, title, primary, secondary, body, open, extraClass = "") => `<details class="record-accordion ${extraClass}" ${open ? "open" : ""}><summary class="record-accordion-summary"><span class="record-accordion-heading"><small>${esc(label)}</small><strong>${esc(title)}</strong></span><span class="record-accordion-meta"><b>${esc(primary)}</b><small>${esc(secondary)}</small></span></summary><div class="record-accordion-body">${body}</div></details>`;
    const standingAccordion = accordion("Standing & Law", "Known Powers", standingSummaryPrimary, standingSummarySecondary, `${standingRows}${tradePaperBlock}<p class="manuscript-footnote">Political standing, legal status, and current trade credentials remain separate records.</p>`, standingOpen, "standing-law-accordion");
    const relationshipAccordion = accordion("Personal Relationships", "People Who Know You", relationshipSummaryPrimary, relationshipSummarySecondary, knownRelationshipRows(s), relationshipsOpen, "relationships-accordion");
    const localAccordion = accordion("Ports", "Local Standing", localSummaryPrimary, localSummarySecondary, localStandingRows, localOpen, "local-standing-accordion");
    return `<div class="character-main character-structure-main"><section class="character-structure-page captain-page-history">${characterManuscriptHousing("captain-manuscript-housing")}<div class="manuscript-cornerwork" aria-hidden="true"></div><header class="manuscript-record-header"><div><div class="manuscript-rubric">Personal History</div><h2 class="section-title">Origins & Circumstances</h2></div><span class="manuscript-folio-mark">I</span></header><div class="manuscript-fact-grid">${originRows}</div><div class="manuscript-divider"><span></span></div><div class="manuscript-two-up"><section class="manuscript-section record-accordion-host">${standingAccordion}</section><section class="manuscript-section record-accordion-host">${relationshipAccordion}</section></div><section class="manuscript-section record-accordion-host local-standing-host">${localAccordion}</section></section><section class="character-structure-page captain-page-capabilities">${characterManuscriptHousing("captain-manuscript-housing")}<div class="manuscript-cornerwork" aria-hidden="true"></div><header class="manuscript-record-header"><div><div class="manuscript-rubric">Capabilities</div><h2 class="section-title">Attributes & Skills</h2></div><span class="manuscript-folio-mark">II</span></header>${renderAdvancementPanel(s)}${renderSpecializationStatus(s)}<div class="sheet-columns manuscript-sheet-columns"><section class="sheet-section"><div class="sheet-column-head"><span>Attribute</span><span>Rating</span></div>${attributeRows}</section><section class="sheet-section skill-sheet"><div class="sheet-column-head skill-head"><span>Skill</span><span>Rating</span><span>Training</span></div>${skillRows}</section></div><div class="manuscript-divider"><span></span></div><section class="sheet-subsection manuscript-section"><div class="manuscript-section-heading"><span>Focused Training</span><h3>Specializations</h3></div>${specs}</section><section class="sheet-subsection manuscript-section"><div class="manuscript-section-heading"><span>Learned Work</span><h3>Practices & Techniques</h3></div><div class="ability-grid">${abilities}</div></section></section><section class="character-structure-page character-condition-page captain-page-condition">${characterManuscriptHousing("captain-manuscript-housing")}<div class="manuscript-cornerwork" aria-hidden="true"></div><header class="manuscript-record-header"><div><div class="manuscript-rubric">Condition</div><h2 class="section-title">Body & Injury History</h2></div><span class="manuscript-folio-mark">III</span></header>${injuries}${treatmentButton}</section></div>`;
}
function renderCaptainGear(s) {
    ensureSelectedInventoryItem(s, "player");
    return `<div class="fixed-art-content">${renderArtFirstEquipmentScreen(s, "player", PLAYER_EQUIPMENT_SLOTS)}</div>`;
}
function renderInventory(s) {
    const portId = s.player.currentPortId;
    const toolbar = `<div class="screen-local-bar character-structure-local-bar"><div><div class="eyebrow">${esc(s.player.character.name)}</div><h2 class="screen-local-title">Captain</h2></div><div class="character-subtabs">${characterPanelTabs("captain", captainPanelTab)}${portId ? `<button class="subtab ${captainPanelTab === "outfitter" ? "active" : ""}" data-action="set-character-subtab" data-owner="captain" data-view="outfitter">Port Outfitter</button>` : ""}</div></div>`;
    if (captainPanelTab === "gear")
        return `<section class="fixed-screen art-fixed-screen captain-gear-screen">${toolbar}${renderCaptainGear(s)}</section>`;
    if (captainPanelTab === "outfitter" && portId) {
        const stock = availableItemDefinitionsAtSettlement(portId);
        return `<section class="fixed-screen utility-screen outfitter-structural-screen">${toolbar}<div class="utility-scroll-host"><div class="outfitter-structural-shell"><div class="outfitter-heading"><div><div class="eyebrow">${esc(PORT_BY_ID[portId]?.name ?? "Port")} outfitter</div><h2 class="section-title">Equipment Available</h2></div><p class="small muted">Ordinary weapons, protection, and working gear currently offered in port.</p></div><div class="outfitter-stock-grid">${stock.map(def => { const price = itemPurchasePriceAtSettlement(def.id, portId) ?? def.baseValue; const art = ASSET_BY_ID[def.artAssetId ?? def.id]; return `<article class="outfitter-stock-item"><div class="outfitter-item-icon">${art?.path ? `<img src="${esc(art.path)}" alt="${esc(def.name)}">` : `<span aria-hidden="true">${esc(def.name.charAt(0))}</span>`}</div><div class="outfitter-item-copy"><div class="outfitter-item-title"><div><small>${esc(titleize(def.category))}</small><h3>${esc(def.name)}</h3></div><b>${price} cr</b></div><p>${esc(def.description)}</p><button class="btn small" data-action="buy-item" data-id="${esc(def.id)}">Purchase</button></div></article>`; }).join("") || `<p class="muted">No ordinary outfitter stock is available here.</p>`}</div></div></div></section>`;
    }
    return `<section class="fixed-screen utility-screen captain-sheet-screen character-structure-screen" data-character-structure="purpose-painted-lock-candidate" data-character-refinement="frame-vignette-1e" ${characterThemeAttributes(s.player.character.culture, s.player.character.religion)}><div class="character-culture-captain-stage" aria-hidden="true"><span class="character-culture-captain-margin-left"></span><span class="character-culture-captain-margin-right"></span><span class="character-culture-captain-chart"></span></div>${toolbar}<div class="utility-scroll-host character-structure-scroll"><div class="character-page-layout character-structure-layout">${renderCaptainSummary(s)}${renderCaptainOverview(s)}</div></div></section>`;
}
function renderCrewInspector(s, npcId) {
    const npc = s.npcs[npcId];
    if (!npc)
        return "";
    const topSkills = ALL_SKILLS.map(id => ({ id, value: npc.skills[id] })).sort((a, b) => b.value - a.value).slice(0, 10);
    const equipment = equipmentForOwner(s, npcId);
    const npcSpecialization = attunementBand(npc.attunement.value);
    ensureSelectedInventoryItem(s, npcId);
    const specs = npc.specializations.length ? npc.specializations.map(sp => `<div class="specialization-row"><b>${esc(sp.name)}</b><span>${esc(SKILL_LABELS[sp.skillId])} <strong>+${sp.rating}</strong></span></div>`).join("") : `<p class="manuscript-empty">No recorded specialization.</p>`;
    const abilities = npc.abilities.length ? npc.abilities.slice(0, 6).map(ab => { const def = ABILITY_BY_ID[ab.abilityId]; return `<div class="manuscript-note"><b>${esc(def?.name ?? titleize(ab.abilityId.split(".").at(-1) ?? ab.abilityId))}</b><small>${esc(def?.description ?? ab.source)}</small></div>`; }).join("") : `<p class="manuscript-empty">No learned practices are recorded.</p>`;
    const summary = `<aside class="character-sidebar character-structure-sidebar"><div class="character-sidebar-card npc-identity-card character-structure-profile"><div class="manuscript-cornerwork" aria-hidden="true"></div><div class="manuscript-rubric">Company Record</div><div class="row between"><h2 class="section-title manuscript-name">${esc(npc.name)}</h2><span class="relationship-badge">${esc(relationshipStatus(npc))}</span></div><div class="crew-inspector-portrait manuscript-portrait-mat">${structuralCrewPortrait(npc)}</div><p class="character-role">${esc(npc.role)}</p><div class="manuscript-divider"><span></span></div><div class="sidebar-stat"><span>Age</span><b>${npc.age}</b></div><div class="sidebar-stat"><span>Level</span><b>${npc.advancement.level}</b></div><div class="sidebar-stat"><span>Life Experience</span><b>${npc.advancement.lifeExperience}</b></div>${npcSpecialization !== "Neutral" ? `<div class="sidebar-stat"><span>Specialization</span><b>${esc(npcSpecialization)}</b></div>` : ""}<div class="manuscript-divider"><span></span></div><p class="small">${titleize(npc.ancestry)} ancestry · ${titleize(npc.culture)} culture</p><p class="small">${titleize(npc.religion)} · ${esc(HOMELAND_REGION_LABELS[npc.homelandRegion] ?? titleize(npc.homelandRegion))}</p></div></aside>`;
    const attributes = Object.entries(npc.attributes).map(([id, value]) => `<div class="stat-row has-tooltip character-stat-row" ${tip(ATTRIBUTE_DESCRIPTIONS[id])}><span>${structuralCharacterIconSlot("attribute", id)}<span>${titleize(id)}</span></span><b>${value}</b></div>`).join("");
    const skills = topSkills.map(row => `<div class="stat-row has-tooltip character-stat-row" ${tip(SKILL_DESCRIPTIONS[row.id])}><span>${structuralCharacterIconSlot("skill", row.id)}<span>${esc(SKILL_LABELS[row.id])}</span></span><b>${row.value} <small>${skillRatingLabel(row.value)}</small></b></div>`).join("");
    const overview = `<div class="character-main character-structure-main"><section class="character-structure-page"><div class="manuscript-cornerwork" aria-hidden="true"></div><header class="manuscript-record-header"><div><div class="manuscript-rubric">Officer / Specialist</div><h2 class="section-title">Capabilities</h2></div><span class="manuscript-folio-mark">I</span></header><div class="sheet-columns manuscript-sheet-columns"><section class="manuscript-section"><div class="manuscript-section-heading"><span>Attributes</span><h3>Natural Aptitude</h3></div>${attributes}</section><section class="manuscript-section"><div class="manuscript-section-heading"><span>Skills</span><h3>Best Training</h3></div>${skills}</section></div><div class="manuscript-divider"><span></span></div><div class="manuscript-two-up"><section class="manuscript-section"><div class="manuscript-section-heading"><span>Condition</span><h3>Current State</h3></div><div class="manuscript-fact-grid compact"><div class="manuscript-fact"><span>Health</span><b>${npc.condition.health}/${npc.condition.healthMax}</b></div><div class="manuscript-fact"><span>Fatigue</span><b>${npc.condition.fatigue}</b></div><div class="manuscript-fact"><span>Stress</span><b>${npc.condition.stress}</b></div><div class="manuscript-fact"><span>Pain</span><b>${npc.condition.pain}</b></div></div></section><section class="manuscript-section"><div class="manuscript-section-heading"><span>Captain</span><h3>Relationship</h3></div><div class="relationship-ledger-row single"><div><b>${esc(relationshipStatus(npc))}</b><small>Shown qualitatively; private relationship dimensions remain under the simulation.</small></div></div></section></div></section><section class="character-structure-page"><div class="manuscript-cornerwork" aria-hidden="true"></div><header class="manuscript-record-header"><div><div class="manuscript-rubric">Training</div><h2 class="section-title">Specializations & Practices</h2></div><span class="manuscript-folio-mark">II</span></header><section class="manuscript-section">${specs}</section><div class="manuscript-divider"><span></span></div><section class="manuscript-section">${abilities}</section><div class="manuscript-divider"><span></span></div><section class="manuscript-section"><div class="manuscript-section-heading"><span>Voice & Bearing</span><h3>Crew Notes</h3></div><p class="manuscript-note-text">${esc(npc.speakingStyle)}</p><button class="btn small" data-action="open-dialogue" data-id="${esc(npc.id)}">Talk to ${esc(npc.name)}</button></section></section></div>`;
    if (crewPanelTab === "gear")
        return equipment ? `<div class="fixed-art-content">${renderArtFirstEquipmentScreen(s, npcId, COMPANION_EQUIPMENT_SLOTS)}</div>` : `<div class="panel"><p class="muted">No personal equipment state is available for this crew member.</p></div>`;
    return `<div class="utility-scroll-host character-structure-scroll"><div class="character-page-layout character-structure-layout">${summary}${overview}</div></div>`;
}
function renderCrew(s) {
    const ship = getPlayerShip(s);
    const inspected = inspectedCrewNpcId && s.player.crew.some(member => member.npcId === inspectedCrewNpcId) ? inspectedCrewNpcId : undefined;
    if (inspected) {
        const npc = s.npcs[inspected];
        const toolbar = `<div class="screen-local-bar character-structure-local-bar"><div class="row"><button class="et-button small" data-action="crew-back">‹ Crew Roster</button><div><div class="eyebrow">${esc(npc.role)}</div><h2 class="screen-local-title">${esc(npc.name)}</h2></div></div>${characterPanelTabs("crew", crewPanelTab)}</div>`;
        return `<section class="fixed-screen character-structure-screen ${crewPanelTab === "gear" ? "art-fixed-screen" : "utility-screen"}" data-character-structure="pre-art">${toolbar}${renderCrewInspector(s, inspected)}</section>`;
    }
    const pageSize = 4;
    const pageCount = Math.max(1, Math.ceil(s.player.crew.length / pageSize));
    crewPage = Math.max(0, Math.min(pageCount - 1, crewPage));
    const visible = s.player.crew.slice(crewPage * pageSize, crewPage * pageSize + pageSize);
    const rows = visible.map(member => {
        const npc = member.npcId ? s.npcs[member.npcId] : undefined;
        const towardCaptain = npc ? relationshipStatus(npc) : "Company";
        return `<div class="crew-production-row"><div class="crew-production-person"><span class="crew-production-portrait">${structuralCrewPortrait(npc)}</span><span class="crew-production-person-copy"><b>${esc(member.name)}</b><small>${titleize(member.role)}</small></span></div><b class="crew-number">${member.skill}</b><b class="crew-number">${crewMoraleLabel(member.morale)}</b><b class="crew-number">${crewLoyaltyLabel(member.loyalty)}</b><b class="crew-relationship-state">${esc(towardCaptain)}</b><div class="crew-row-action">${member.npcId ? `<button class="et-button small" data-action="inspect-crew" data-id="${esc(member.npcId)}">Inspect</button>` : `<span class="crew-ordinary-label">Crew</span>`}</div></div>`;
    }).join("");
    const emptyRows = Array.from({ length: Math.max(0, pageSize - visible.length) }, () => `<div class="crew-production-row empty" aria-hidden="true"><div></div><div></div><div></div><div></div><div></div><div></div></div>`).join("");
    const referencePath = ASSET_BY_ID["ui.reference.crew_roster"]?.path;
    const summary = crewSummary(s);
    const community = ensureCrewCommunity(ship);
    const unrest = crewUnrestProfile(s);
    const prize = community.outstandingPrizeShare > 0 ? `<span class="crew-summary-item warning"><small>Prize share due</small><b>${community.outstandingPrizeShare} cr</b></span>` : "";
    const unrestSummary = unrest.level !== "quiet" ? `<div class="crew-unrest-note ${esc(unrest.level)}"><b>${esc(unrest.label)}</b><span>${esc(unrest.summary)}${unrest.reasons[0] ? ` ${esc(titleize(unrest.reasons[0]))}.` : ""}</span></div>` : "";
    const companyFeeling = companyFeelingTowardCaptain(s);
    const summaryStrip = `<section class="crew-company-block"><div class="crew-company-heading"><div><span class="eyebrow">Ordinary company</span><h4>${summary.ordinary} unnamed hand${summary.ordinary === 1 ? "" : "s"}</h4></div><div class="crew-company-attitude"><small>Feeling toward captain</small><b>${esc(companyFeeling)}</b></div></div><div class="crew-community-summary"><span class="crew-summary-item"><small>Morale</small><b>${esc(summary.morale)}</b></span><span class="crew-summary-item"><small>Loyalty</small><b>${esc(summary.loyalty)}</b></span><span class="crew-summary-item"><small>Experience</small><b>${esc(summary.experience)}</b></span><span class="crew-summary-item"><small>Health</small><b>${esc(summary.health)}</b></span><span class="crew-summary-item"><small>Discipline</small><b>${esc(summary.discipline)}</b></span><span class="crew-summary-item"><small>Unrest</small><b>${esc(summary.unrest)}</b></span>${prize}</div>${unrestSummary}</section>`;
    return `<section class="fixed-screen crew-production-screen character-structure-screen" data-character-structure="pre-art"><div class="screen-local-bar character-structure-local-bar"><div><div class="eyebrow">${esc(ship.name)}</div><h2 class="screen-local-title">Crew Roster</h2></div><span class="alpha-badge">Ship's company</span></div><div class="crew-production-body reference-ghost-surface"><div class="crew-production-ledger character-structure-ledger"><div class="manuscript-cornerwork" aria-hidden="true"></div><div class="crew-production-heading"><div><span class="eyebrow">Muster book</span><h3>${esc(ship.name)} · Ship's Company</h3></div><div class="crew-production-count">${ship.systems.crew}/${ship.systems.crewMax} aboard</div></div>${summaryStrip}<div class="crew-officers-heading"><div><span class="eyebrow">Named company</span><h4>Officers & Specialists</h4></div><small>Individual morale and loyalty can differ from their personal relationship with the captain.</small></div><div class="crew-production-table"><div class="crew-production-header"><span>Officer / Specialist</span><span>Skill</span><span>Morale</span><span>Loyalty</span><span>Toward Captain</span><span></span></div>${rows}${emptyRows}</div><div class="crew-production-footer"><div class="crew-production-pager"><button class="et-button small" data-action="crew-page" data-dir="-1" ${crewPage <= 0 ? "disabled" : ""}>‹ Previous</button><span>Page ${crewPage + 1} / ${pageCount}</span><button class="et-button small" data-action="crew-page" data-dir="1" ${crewPage >= pageCount - 1 ? "disabled" : ""}>Next ›</button></div>${s.player.currentPortId ? `<div class="crew-production-actions"><button class="et-button small" data-action="recruit">Recruit</button><button class="et-button small" data-action="rest-crew">Shore Leave</button><button class="et-button small" data-action="deck-drill">Deck Drill</button></div>` : ""}</div></div>${referencePath ? renderReferenceGhost(referencePath, "Crew roster approved direction") : ""}</div></section>`;
}
function renderPeople(s) {
    const portId = s.player.currentPortId;
    const port = PORT_BY_ID[portId];
    const people = Object.values(s.npcs).filter((npc) => npcPresentAtPort(s, npc, portId) && playerKnowsNpc(s, npc));
    const activeHere = activeDialogueNpcId && people.some(npc => npc.id === activeDialogueNpcId) ? renderDialoguePanel(s, activeDialogueNpcId) : "";
    const peopleCards = people.length
        ? people.map((npc) => compactNpcContextCard(npc)).join("")
        : `<p class="muted">No major named character you know is here right now.</p>`;
    const learning = renderLearningSourcePanel(s, ["teacher", "officer"], "Teachers & Officers", "people");
    return `<section class="fixed-screen utility-screen contextual-location-screen">${portReturnBar(portId, "People")}<div class="context-location-scroll">${contextLocationHero(portId, "people", `People of ${port.name}`, { subline: "Captains, officials, merchants, sailors, and other known figures" })}<div class="context-location-mechanics"><div class="context-mechanics-shell"><section class="panel"><div class="eyebrow">Known people presently here</div><div class="context-people-grid">${peopleCards}</div></section>${activeHere}${learning}</div></div></div></section>`;
}
function renderDialoguePanel(s, npcId) {
    const npc = s.npcs[npcId];
    const context = buildCharacterMindContext(s, npcId);
    const dev = devInterfaceEnabled() ? `<details style="margin-top:10px"><summary class="small muted">Developer context</summary><pre class="context-json">${esc(JSON.stringify(context, null, 2))}</pre></details>` : "";
    return `<div class="panel dialogue-character-panel" id="dialogue-panel"><div class="dialogue-character-layout"><div class="dialogue-character-portrait-frame">${structuralNpcPortrait(npc, "dialogue")}</div><div class="dialogue-character-content"><div class="row between"><div><div class="eyebrow">Conversation</div><h2 class="section-title">${esc(npc.name)}</h2><p class="small muted dialogue-character-role">${esc(npc.role)}</p></div><span class="relationship-badge">${esc(relationshipStatus(npc))}</span></div><div class="combat-log dialogue-log">${dialogueLines.length ? dialogueLines.map((line) => `<div><b>${esc(line.speaker)}:</b> ${esc(line.text)}</div>`).join("") : `<div class="muted">Speak naturally. ${esc(npc.name)} answers from what they know, believe, remember, and are willing to tell you.</div>`}</div><form id="dialogue-form" class="row dialogue-form-row"><input name="message" autocomplete="off" maxlength="400" placeholder="What do you say?" class="dialogue-input"><button class="btn primary" type="submit">Speak</button></form></div></div>${dev}</div>`;
}
function renderTavern(s) {
    const portId = s.player.currentPortId;
    const port = PORT_BY_ID[portId];
    const ship = getPlayerShip(s);
    const community = ensureCrewCommunity(ship);
    const summary = crewSummary(s);
    const leaveCost = shoreLeaveCost(s);
    const offers = crewRecruitOffers(s);
    const berths = Math.max(0, ship.systems.crewMax - ship.systems.crew);
    const offerCards = offers.map(offer => `<div class="crew-hire-card"><div><b>${esc(offer.label)}</b><small>${esc(titleize(offer.band))} · Seamanship ${Math.round(offer.seamanship)} · Gunnery ${Math.round(offer.gunnery)}</small><p>${esc(offer.description)}</p></div><button class="btn small" data-action="hire-crew" data-id="${esc(offer.id)}" ${berths <= 0 ? "disabled" : ""}>Sign · ${offer.signing} cr</button></div>`).join("");
    const prizeAction = community.outstandingPrizeShare > 0
        ? `<button class="btn" data-action="share-prize">Share Prize Money · ${community.outstandingPrizeShare} cr</button>`
        : `<div class="crew-tavern-note">No unsettled prize share.</div>`;
    const unrest = crewUnrestProfile(s);
    const companyStrip = `<div class="crew-tavern-summary"><span><small>Crew</small><b>${ship.systems.crew}/${ship.systems.crewMax}</b></span><span><small>Morale</small><b>${esc(summary.morale)}</b></span><span><small>Loyalty</small><b>${esc(summary.loyalty)}</b></span><span><small>Experience</small><b>${esc(summary.experience)}</b></span></div>${unrest.level !== "quiet" ? `<div class="crew-unrest-note ${esc(unrest.level)}"><b>${esc(unrest.label)}</b><span>${esc(unrest.summary)}</span></div>` : ""}`;
    return `<section class="fixed-screen utility-screen contextual-location-screen">${portReturnBar(portId, "Tavern & Dockside")}<div class="context-location-scroll">${contextLocationHero(portId, "tavern", `${port.name} Tavern`, { subline: "Rumors, food, bunks, shore leave, and sailors looking for work" })}<div class="context-location-mechanics"><div class="context-mechanics-shell"><div class="two-col context-two-col tavern-crew-layout"><section class="panel"><div class="eyebrow">Dockside talk</div><h2 class="section-title">Rumors & Conversation</h2><p class="body-copy">Spend an hour listening, asking questions, and deciding which stories are worth carrying with you.</p><div class="context-panel-actions"><button class="btn primary" data-action="gather-rumor">Listen & Ask Around · 1h</button></div></section><section class="panel crew-ashore-panel"><div class="eyebrow">Crew ashore</div><h2 class="section-title">Ship's Company</h2>${companyStrip}<p class="body-copy">Food, rest, and fair shares shape how willing the company is to follow you back to sea.</p><div class="context-action-stack context-panel-actions"><button class="btn" data-action="rest-crew">Food, Bunks & Shore Leave · 8h / ${leaveCost} cr</button>${prizeAction}</div></section></div><section class="panel crew-hire-panel"><div class="row between"><div><div class="eyebrow">Hands looking for work</div><h2 class="section-title">Recruit Sailors</h2></div><div class="crew-berths"><b>${berths}</b><small>berth${berths === 1 ? "" : "s"} open</small></div></div><p class="body-copy">New hands join the ordinary ship's company. Better sailors cost more and immediately affect the crew's overall experience.</p><div class="crew-hire-list">${offerCards}</div></section></div></div></div></section>`;
}
function renderSimulationInspector(s) {
    const rows = Object.values(s.npcs).map((npc) => {
        const plan = npc.brain.currentPlan;
        const destination = plan?.destinationPortId ? PORT_BY_ID[plan.destinationPortId]?.name ?? plan.destinationPortId : "—";
        const needs = npc.brain.needs;
        return `<tr><td><b>${esc(npc.name)}</b><br><small>${esc(npc.role)}</small></td><td>${titleize(npc.brain.simulationLod)}</td><td>${plan ? `${titleize(plan.type)} · ${titleize(plan.status)}<br><small>${esc(destination)} · ${Math.round(plan.progress * 100)}%</small>` : "No active plan"}</td><td>Food ${needs.foodDays.toFixed(1)}d<br>Water ${needs.waterDays.toFixed(1)}d<br>Fatigue ${Math.round(needs.crewFatigue)}</td><td>${mutinyPressure(npc)}</td><td>${npc.brain.nextDecisionAtHour ?? "—"}</td></tr>`;
    }).join("");
    const scheduled = s.simulationEvents.filter((event) => event.status === "scheduled").sort((a, b) => a.scheduledAtHour - b.scheduledAtHour).slice(0, 12);
    return `<details class="panel sim-inspector"><summary><b>Simulation Inspector</b> · NPC brains, plans, needs & scheduled wakeups</summary><p class="small muted">Development observability from NPC Simulation & Character Brain Spec 1.0. Persistent people execute plans until completion or a meaningful interrupt; this view exposes state without giving it to the player character as knowledge.</p><div class="row"><button class="btn small" data-action="dev-advance-world" data-hours="24">Simulate 1 Day</button><button class="btn small" data-action="dev-advance-world" data-hours="168">Simulate 7 Days</button></div><div class="table-scroll"><table class="market-table"><thead><tr><th>NPC</th><th>LOD</th><th>Current plan</th><th>Needs</th><th>Mutiny</th><th>Next decision H</th></tr></thead><tbody>${rows}</tbody></table></div><h3>Scheduled simulation events</h3>${scheduled.length ? `<div class="combat-log">${scheduled.map(event => `<div><b>H${event.scheduledAtHour}</b> · ${esc(event.eventType)} · ${esc(s.npcs[event.entityId]?.name ?? event.entityId)}</div>`).join("")}</div>` : `<p class="muted">No scheduled wakeups.</p>`}</details>`;
}
function devInterfaceEnabled() {
    if (typeof window === "undefined")
        return false;
    return artCalibrationEnabled() || new URLSearchParams(window.location.search).get("dev") === "1";
}
function renderJournal(s) {
    const knowledge = [...s.player.knowledge].sort((a, b) => (b.refreshedAtHour ?? b.learnedAtHour) - (a.refreshedAtHour ?? a.learnedAtHour));
    const contacts = Object.values(s.player.shipIntel).sort((a, b) => b.lastKnownAtHour - a.lastKnownAtHour);
    const contracts = s.contracts.filter(c => c.status !== "available").sort((a, b) => b.createdAtHour - a.createdAtHour);
    // A0.3C live-cause events are world truth, not automatic player knowledge. Only journal them
    // after the A0.2A knowledge ledger records that the captain actually learned that report.
    const learnedEventIds = new Set(s.player.knowledge.map(record => record.sourceEventId).filter((id) => Boolean(id)));
    const history = s.worldEvents.filter(event => !event.type.startsWith("world_cause_") || learnedEventIds.has(event.id)).reverse();
    const tabs = ["knowledge", "contacts", "obligations", "law", "history"];
    const labels = { knowledge: "What I Know", contacts: "Contacts", obligations: "Promises & Work", law: "Standing & Law", history: "What Happened" };
    const tabHtml = tabs.map(id => `<button class="journal-production-tab ${journalTab === id ? "active" : ""}" data-action="journal-tab" data-tab-id="${id}">${labels[id]}</button>`).join("");
    const asEntries = () => {
        if (journalTab === "knowledge")
            return knowledge.map(k => `<article class="journal-production-entry"><img src="${knowledgeStatusIcon(k.truthStatus, k.hardRumor)}" alt=""><div><b>${esc(k.text)}</b><small>${esc(knowledgeConfidenceBand(k, s.absoluteHour))} · ${esc(k.source)}</small></div></article>`);
        if (journalTab === "contacts")
            return contacts.map(intel => { const contactMark = intel.identified ? shipIdentityMark(s, intel.shipId) : undefined; return `<article class="journal-production-entry">${contactMark ? identityMarkImage(contactMark, "journal-contact-symbol") : ""}<div><b>${esc(intel.identified ? intel.name ?? intel.shipId : "Unidentified contact")}</b><small>${titleize(intelFreshnessLabel(s, intel.shipId))} · ${esc(intel.source)} · last seen ${esc(formatClock(clockFromAbsoluteHour(intel.lastKnownAtHour)))}</small></div></article>`; });
        if (journalTab === "obligations")
            return contracts.map(c => `<article class="journal-production-entry"><div><b>${titleize(c.status)} · ${c.quantity} ${esc(COMMODITY_BY_ID[c.commodityId]?.name)}</b><small>${esc(PORT_BY_ID[c.sourcePortId]?.name)} → ${esc(PORT_BY_ID[c.destinationPortId]?.name)} · ${c.reward} cr · due ${esc(formatClock(clockFromAbsoluteHour(c.deadlineHour)))}</small></div></article>`);
        if (journalTab === "law") {
            const factionIds = [...new Set([...Object.keys(s.player.character.reputation), ...Object.values(s.player.legal).map(entry => entry.factionId)])];
            const powers = factionIds.map(factionId => { const standing = standingLabel(Number(s.player.character.reputation[factionId] ?? 0)); const legal = legalStateForFaction(s, factionId); const legalText = legalStatusLabel(legal.status); return `<article class="journal-production-entry"><div><b>Power · ${esc(powerLabel(factionId))}</b><small>${esc(standing)} standing · ${esc(legalText)}${legal.bounty > 0 ? ` · ${legal.bounty} cr bounty` : ""}</small></div></article>`; });
            const ports = s.player.knownPortIds.map(portId => PORT_BY_ID[portId]).filter((port) => Boolean(port)).map(port => `<article class="journal-production-entry"><div><b>Port · ${esc(port.name)}</b><small>${esc(standingLabel(portStanding(s, port.id)))} local standing</small></div></article>`);
            const warrants = activeWarrants(s).map(w => `<article class="journal-production-entry"><div><b>Active Warrant · ${esc(powerLabel(w.factionId))}</b><small>${w.bounty} cr · ${w.crimeIds.length} ${w.crimeIds.length === 1 ? "reported offense" : "reported offenses"}</small></div></article>`);
            const credentials = effectiveTradeCredentials(s).map(row => { const copy = tradeCredentialSummary(row); return `<article class="journal-production-entry"><div><b>${esc(copy.title)}</b><small>${esc(copy.detail)}</small></div></article>`; });
            const crimes = unresolvedReportedCrimes(s).slice().sort((a, b) => b.atHour - a.atHour).slice(0, 8).map(crime => `<article class="journal-production-entry"><div><b>${esc(crime.summary)}</b><small>Reported · ${esc(formatClock(clockFromAbsoluteHour(crime.atHour)))}</small></div></article>`);
            return [...warrants, ...credentials, ...powers, ...ports, ...crimes];
        }
        return history.map(e => `<article class="journal-production-entry"><div><b>${esc(e.summary)}</b><small>${esc(formatClock(clockFromAbsoluteHour(e.atHour)))}</small></div></article>`);
    };
    const entries = asEntries();
    const perPage = 4;
    const pageCount = Math.max(1, Math.ceil(entries.length / perPage));
    journalPage = Math.max(0, Math.min(pageCount - 1, journalPage));
    const visible = entries.slice(journalPage * perPage, journalPage * perPage + perPage);
    const left = visible.slice(0, 2).join("") || `<p class="journal-production-empty">Nothing recorded here yet.</p>`;
    const right = visible.slice(2, 4).join("") || `<p class="journal-production-empty">No further entries.</p>`;
    const referencePath = ASSET_BY_ID["ui.reference.journal"]?.path;
    const dev = devInterfaceEnabled() ? `<div class="dev-floating-panel">${renderSimulationInspector(s)}</div>` : "";
    const sectionHeading = journalPage === 0 ? labels[journalTab] : `${labels[journalTab]} · Continued`;
    const sectionEyebrow = journalPage === 0 ? labels[journalTab] : "Continued";
    return `<section class="fixed-screen journal-production-screen character-structure-screen" data-character-structure="pre-art"><div class="screen-local-bar character-structure-local-bar"><div><div class="eyebrow">Captain's records</div><h2 class="screen-local-title">Ship's Journal</h2></div><span class="alpha-badge">${esc(s.player.character.name)} · ${esc(formatClock(s.clock))}</span></div><div class="journal-production-body reference-ghost-surface"><div class="journal-production-book character-structure-journal"><nav class="journal-production-tabs character-structure-tabs" aria-label="Journal sections">${tabHtml}</nav><div class="journal-book-spread"><section class="journal-production-page character-structure-journal-page"><div class="manuscript-cornerwork" aria-hidden="true"></div><div class="journal-page-heading"><span class="eyebrow">${esc(sectionEyebrow)}</span><h3>${esc(sectionHeading)}</h3><small class="journal-folio-meta">${esc(getPlayerShip(s)?.name ?? "Ship")} · ${esc(currentPlaceLabel(s))}</small></div><div class="journal-page-entries">${left}</div><span class="journal-folio-number">${journalPage * 2 + 1}</span></section><div class="journal-book-spine" aria-hidden="true"></div><section class="journal-production-page character-structure-journal-page journal-continuation-page"><div class="manuscript-cornerwork" aria-hidden="true"></div><div class="journal-page-heading journal-continuation-heading"><small class="journal-folio-meta">Captain ${esc(s.player.character.name)}</small></div><div class="journal-page-entries">${right}</div><span class="journal-folio-number">${journalPage * 2 + 2}</span></section></div><footer class="journal-production-footer"><button class="et-button small" data-action="journal-page" data-dir="-1" ${journalPage <= 0 ? "disabled" : ""}>‹ Previous</button><span>Folio ${journalPage + 1} / ${pageCount}</span><button class="et-button small" data-action="journal-page" data-dir="1" ${journalPage >= pageCount - 1 ? "disabled" : ""}>Next ›</button></footer></div>${referencePath ? renderReferenceGhost(referencePath, "Journal approved direction") : ""}</div>${dev}</section>`;
}
function pathPoints(points) { return points.map((point) => `${point.x + 0.5},${point.y + 0.5}`).join(" "); }
function formatVoyageHours(hours) {
    const rounded = Math.max(1, Math.ceil(hours));
    const days = Math.floor(rounded / 24);
    const rest = rounded % 24;
    return days ? `${days}d${rest ? ` ${rest}h` : ""}` : `${rest}h`;
}
function initialCameraWidth(s) {
    return s.settings.navigationZoom === "far" ? NAV_CAMERA.farViewWidth : s.settings.navigationZoom === "close" ? NAV_CAMERA.minViewWidth : NAV_CAMERA.defaultViewWidth;
}
function ensureMapCamera(s) {
    const ship = getPlayerShip(s);
    if (!mapCameraState) {
        const knownPorts = PORTS.filter(port => s.player.knownPortIds.includes(port.id)).map(port => port.point);
        const shouldOpenRegionalOverview = !s.voyage && !selectedMapTarget && Boolean(s.player.currentPortId) && s.settings.navigationZoom === "navigation";
        mapCameraState = shouldOpenRegionalOverview ? cameraForPoints([...knownPorts, ship.position], 30, 2) : cameraForPoint(ship.position, initialCameraWidth(s));
    }
    return mapCameraState;
}
function applyMapCameraToDom() {
    if (!mapCameraState)
        return;
    const svg = document.querySelector("svg.chart-v04");
    if (!svg)
        return;
    const box = cameraViewBox(mapCameraState);
    svg.setAttribute("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);
    const lod = cameraLod(box.width);
    svg.dataset.mapLod = lod;
    document.querySelectorAll("[data-regional-map-layer]").forEach(node => node.style.opacity = String(regionalLayerOpacity(box.width)));
    const readout = document.querySelector("[data-camera-readout]");
    if (readout)
        readout.textContent = `${GLOBAL_ATLAS.cellScaleNm} nm / cell · ${Math.round(box.width)}×${Math.round(box.height)} · ${lod === "far" ? "Strategic" : lod === "medium" ? "Regional" : lod === "navigation" ? "Navigation" : "Close"}`;
}
function scheduleMapCameraFrame() {
    if (mapCameraFrame !== undefined)
        return;
    const tick = () => {
        mapCameraFrame = undefined;
        if (!mapCameraState)
            return;
        const c = mapCameraState;
        const damping = NAV_CAMERA.damping;
        c.x += (c.targetX - c.x) * damping;
        c.y += (c.targetY - c.y) * damping;
        c.viewWidth += (c.targetViewWidth - c.viewWidth) * damping;
        const center = clampCameraCenter({ x: c.x, y: c.y }, c.viewWidth);
        c.x = center.x;
        c.y = center.y;
        applyMapCameraToDom();
        if (Math.abs(c.targetX - c.x) > .002 || Math.abs(c.targetY - c.y) > .002 || Math.abs(c.targetViewWidth - c.viewWidth) > .002)
            mapCameraFrame = requestAnimationFrame(tick);
        else {
            c.x = c.targetX;
            c.y = c.targetY;
            c.viewWidth = c.targetViewWidth;
            applyMapCameraToDom();
        }
    };
    mapCameraFrame = requestAnimationFrame(tick);
}
function centerMapOnPlayer(s) {
    const ship = getPlayerShip(s);
    const c = ensureMapCamera(s);
    const center = clampCameraCenter(ship.position, c.targetViewWidth);
    c.targetX = center.x;
    c.targetY = center.y;
    scheduleMapCameraFrame();
}
function setMapZoom(direction) {
    if (!state)
        return;
    const c = ensureMapCamera(state);
    const factor = direction === "in" ? .78 : 1.28;
    const width = clampViewWidth(c.targetViewWidth * factor);
    const center = clampCameraCenter({ x: c.targetX, y: c.targetY }, width);
    c.targetX = center.x;
    c.targetY = center.y;
    c.targetViewWidth = width;
    state.settings.navigationZoom = legacyZoomBand(width);
    scheduleMapCameraFrame();
}
function routeHazardSummary(path) {
    const hazards = new Set(path.flatMap(point => getWorldCell(point).hazards));
    if (hazards.has("grounding"))
        return "Reef / grounding risk along the route";
    if (hazards.has("shoal_water"))
        return "Shoal and coastal water along the route";
    return "No known route hazards";
}
function searchResultPanel(result) {
    if (!result)
        return "";
    const title = result.kind === "ship" ? "Sail sighted" : result.kind === "discovery" ? "Discovery" : result.kind === "wreckage" ? "Wreckage" : result.kind === "smoke" ? "Smoke on the horizon" : result.kind === "traffic" ? "Signs of traffic" : "Quiet waters";
    return `<div class="search-waters-result"><div class="eyebrow">Search Waters · ${result.hours}h</div><h3>${esc(title)}</h3><p>${esc(result.message)}</p></div>`;
}
function renderChart(s) {
    const ship = getPlayerShip(s);
    const voyage = s.voyage;
    const target = voyage?.destination ?? selectedMapTarget;
    const preview = !voyage && target ? plotCourse(s, target) : undefined;
    const trail = voyage?.path ?? preview?.path ?? [];
    const selectedCell = target?.point;
    const camera = ensureMapCamera(s);
    const box = cameraViewBox(camera);
    const lod = cameraLod(box.width);
    const playerToken = ASSET_BY_ID[ship.tokenAssetId ?? ""]?.path;
    const mapArtSvg = REGIONAL_MAP_LAYERS.filter(layer => layer.development === "active").map(layer => { const art = ASSET_BY_ID[layer.assetId]; if (!art?.path)
        return ""; const b = layer.globalBounds; const regional = layer.priority > 0; return `<image class="map-layer-art ${regional ? "regional-map-art" : "atlas-art"}" ${regional ? `data-regional-map-layer="${esc(layer.id)}" style="opacity:${regionalLayerOpacity(box.width)}"` : ""} href="${art.path}" x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" preserveAspectRatio="none"></image>`; }).join("");
    const cells = [];
    for (let y = WORLD_DEVELOPED_BOUNDS.y; y < WORLD_DEVELOPED_BOUNDS.y + WORLD_DEVELOPED_BOUNDS.height; y += 1) {
        for (let x = WORLD_DEVELOPED_BOUNDS.x; x < WORLD_DEVELOPED_BOUNDS.x + WORLD_DEVELOPED_BOUNDS.width; x += 1) {
            const cell = getWorldCell({ x, y });
            const selected = selectedCell?.x === x && selectedCell?.y === y;
            const label = cell.terrain === "land" ? "Land" : titleize(cell.terrain);
            cells.push(`<rect x="${x}" y="${y}" width="1" height="1" class="map-cell-svg ${cell.navigable ? "navigable" : "blocked"} terrain-${cell.terrain} ${selected ? "selected" : ""}" ${cell.navigable && !voyage ? `data-action="select-map-cell" data-x="${x}" data-y="${y}"` : ""}><title>${esc(label)}</title></rect>`);
        }
    }
    const ports = PORTS.map(port => { const known = s.player.knownPortIds.includes(port.id); const selected = target?.type === "port" && target.id === port.id; const major = CANON_WORLD_LOCATION_BY_ID[port.id]?.category === "major_capital_great_port"; const radius = major ? .5 : .39; return `<g class="port-glyph ${major ? "major-port" : "normal-port"} ${known ? "known" : "unknown"} ${selected ? "selected" : ""}" ${known && !voyage ? `data-action="select-port" data-id="${port.id}"` : ""} transform="translate(${port.point.x + .5} ${port.point.y + .5})"><circle class="port-hit-target" r=".72"></circle><circle class="port-medallion" r="${radius}"></circle><path d="M0,-.28 L0,.28 M-.22,.02 L.22,.02 M-.16,.20 Q0,.36 .16,.20" class="anchor-mark"></path><text class="map-label" x="${major ? .66 : .56}" y=".14">${esc(port.name)}</text><title>${esc(port.name)} · ${esc(port.role)}</title></g>`; }).join("");
    const pois = POINTS_OF_INTEREST.filter(poi => s.player.knownPoiIds.includes(poi.id)).map(poi => { const selected = target?.type === "poi" && target.id === poi.id; const seaSite = poi.point.x === poi.approachPoint.x && poi.point.y === poi.approachPoint.y; return `<g class="poi-glyph ${selected ? "selected" : ""} ${seaSite ? "sea-site" : "land-site"}" ${!voyage ? `data-action="select-poi" data-id="${poi.id}"` : ""} transform="translate(${poi.point.x + .5} ${poi.point.y + .5})"><path d="M0,-.34 L.34,0 L0,.34 L-.34,0 Z"></path><circle r=".09"></circle><text class="map-label" x=".52" y=".14">${esc(poi.name)}</text><title>${esc(poi.name)} · ${esc(poi.role)}</title></g>`; }).join("");
    const contacts = Object.values(s.player.shipIntel).map(intel => { const age = s.absoluteHour - intel.lastKnownAtHour; const opacity = Math.max(.24, 1 - age / 80); return `<circle class="map-contact ${intel.identified ? "identified" : "unknown-contact"}" cx="${intel.lastKnownPosition.x + .5}" cy="${intel.lastKnownPosition.y + .5}" r=".19" opacity="${opacity}"><title>${esc(intel.identified ? intel.name ?? "Known contact" : "Unidentified contact")}</title></circle>`; }).join("");
    const reefCells = [];
    for (let y = WORLD_DEVELOPED_BOUNDS.y; y < WORLD_DEVELOPED_BOUNDS.y + WORLD_DEVELOPED_BOUNDS.height; y += 1) {
        for (let x = WORLD_DEVELOPED_BOUNDS.x; x < WORLD_DEVELOPED_BOUNDS.x + WORLD_DEVELOPED_BOUNDS.width; x += 1) {
            if (getWorldCell({ x, y }).terrain === "reef")
                reefCells.push(`<circle cx="${x + .25}" cy="${y + .32}" r=".07" class="reef-dot"></circle><circle cx="${x + .62}" cy="${y + .7}" r=".06" class="reef-dot"></circle>`);
        }
    }
    const routeSvg = trail.length > 1 ? `<polyline class="plotted-course ${voyage ? "active" : "preview"}" points="${pathPoints(trail)}"></polyline>${trail.filter((_, index) => index % 3 === 0 || index === trail.length - 1).map(point => `<circle class="route-knot" cx="${point.x + .5}" cy="${point.y + .5}" r=".08"></circle>`).join("")}` : "";
    const shipSvg = playerToken ? `<image class="player-map-token" href="${playerToken}" x="${ship.position.x - .25}" y="${ship.position.y - .35}" width="1.5" height="1.5" preserveAspectRatio="xMidYMid meet"></image>` : `<circle class="player-map-dot" cx="${ship.position.x + .5}" cy="${ship.position.y + .5}" r=".28"></circle>`;
    const selectionRing = selectedCell ? `<circle class="selected-target-ring" cx="${selectedCell.x + .5}" cy="${selectedCell.y + .5}" r=".62"></circle>` : "";
    const targetCell = target ? getWorldCell(target.point) : undefined;
    const targetPort = target?.type === "port" ? PORT_BY_ID[target.id] : undefined;
    const targetPortMark = targetPort ? portPrimaryMark(targetPort.id) : undefined;
    const targetPoi = target?.type === "poi" ? POI_BY_ID[target.id] : undefined;
    const facilities = targetPort ? targetPort.arrivalActions.filter(action => action.id !== "town").slice(0, 4).map(action => action.label).join(" · ") : "";
    const destinationCopy = !target ? `<p class="muted">Choose a known port, point of interest, or open water.</p>` : targetPort ? `<div class="eyebrow">${esc(targetPort.role.split("/")[0]?.trim() ?? "Port")}</div><h2 class="section-title">${esc(targetPort.name)}</h2><p>${esc(targetPort.description)}</p>${facilities ? `<div class="destination-facilities">${esc(facilities)}</div>` : ""}` : targetPoi ? `<div class="eyebrow">${esc(targetPoi.role)}</div><h2 class="section-title">${esc(targetPoi.name)}</h2><p>${esc(targetPoi.description)}</p>` : `<div class="eyebrow">Open water</div><h2 class="section-title">${esc(titleize(targetCell?.terrain ?? "sea"))}</h2>${targetCell?.hazards.length ? `<div class="notice">${esc(targetCell.hazards.map(titleize).join(" · "))}</div>` : `<p class="muted">Hold position, search the surrounding water, or use this point as a course destination.</p>`}`;
    const plannedSupplies = preview ? estimateVoyageSupplyUnits(preview.estimatedHours) : 0;
    const suppliesShort = preview ? Math.max(0, plannedSupplies - ship.supplies) : 0;
    const supplyPlan = preview ? (suppliesShort > 0 ? `~${plannedSupplies} supplies · ${suppliesShort} short` : `~${plannedSupplies} supplies · ${ship.supplies} aboard`) : "";
    const voyageRemainingHours = voyage ? currentVoyageEtaHours(s) : 0;
    const voyageRemainingSupplies = voyage ? estimateVoyageSupplyUnits(voyageRemainingHours) : 0;
    const routeSummary = voyage ? `<div class="course-summary"><div class="eyebrow">Voyage interrupted</div><b>${esc(voyage.destination.name)}</b><span>${Math.round(voyage.routeDistanceNm - voyage.distanceTravelledNm)} nm remaining · ~${formatVoyageHours(voyageRemainingHours)} · ~${voyageRemainingSupplies} supplies</span></div>` : target && preview ? `<div class="course-summary ${suppliesShort > 0 ? "stores-warning" : ""}"><div class="eyebrow">Course ready</div><b>${esc(target.name)}</b><span>${Math.round(preview.routeDistanceNm)} nm · ~${formatVoyageHours(preview.estimatedHours)} · ${esc(supplyPlan)}</span></div>` : `<div class="course-summary"><div class="eyebrow">Chart</div><b>Choose a destination</b><span>Click a marker or navigable water.</span></div>`;
    const canSearch = !s.player.currentPortId && !s.player.currentPoiId && !voyage && !s.encounter;
    const searchUnavailableReason = s.player.currentPortId ? "Available after leaving harbor" : s.player.currentPoiId ? "Leave the point of interest before searching" : voyage ? "Stop the active voyage to conduct a deliberate search" : s.encounter ? "Resolve the current contact first" : "Search surrounding waters";
    const searchAction = `<button class="btn search-waters-action" data-action="search-waters" ${canSearch ? "" : `disabled title="${esc(searchUnavailableReason)}"`}>Search Waters</button>`;
    const dockAction = voyage ? `<button class="btn" data-action="cancel-voyage">Stop</button><button class="btn primary voyage-primary" data-action="continue-voyage">Continue Sail</button>` : target && preview ? `<button class="btn primary voyage-primary" data-action="begin-navigation" ${preview.path.length <= 1 ? "disabled" : ""}>Sail</button>` : `<button class="btn primary voyage-primary" disabled>Sail</button>`;
    const locationName = s.player.currentPortId ? PORT_BY_ID[s.player.currentPortId]?.name ?? "Port" : s.player.currentPoiId ? POI_BY_ID[s.player.currentPoiId]?.name ?? "Point of Interest" : "Open Water";
    return `<section class="navigation-screen map-v04"><div class="navigation-workspace"><div class="navigation-map-pane"><div class="chart-frame"><div class="chart-title"><span>Navigation Chart</span><div class="chart-controls"><button class="map-control zoom-button" data-action="map-zoom-step" data-direction="out" title="Zoom out" aria-label="Zoom out">−</button><button class="map-control center" data-action="map-center" title="Center on Tideworn" aria-label="Center on Tideworn">◎</button><button class="map-control zoom-button" data-action="map-zoom-step" data-direction="in" title="Zoom in" aria-label="Zoom in">+</button></div></div><svg class="chart chart-v04" data-map-lod="${lod}" viewBox="${box.x} ${box.y} ${box.width} ${box.height}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Illustrated Ebbing Tides navigation chart"><defs><pattern id="navGrid04" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0H0V1" fill="none" stroke="#efe2b7" stroke-opacity=".34" stroke-width=".025"/></pattern></defs>${mapArtSvg || `<rect x="0" y="0" width="${GLOBAL_ATLAS.width}" height="${GLOBAL_ATLAS.height}" fill="#234f5d"></rect>`}<rect class="atlas-wash" x="0" y="0" width="${GLOBAL_ATLAS.width}" height="${GLOBAL_ATLAS.height}"></rect>${reefCells.join("")}<rect x="0" y="0" width="${GLOBAL_ATLAS.width}" height="${GLOBAL_ATLAS.height}" fill="url(#navGrid04)" class="grid-overlay"></rect><g class="map-hit-cells">${cells.join("")}</g>${routeSvg}${contacts}${pois}${ports}${selectionRing}${shipSvg}</svg><div class="map-compass">✥<span>N</span></div><div class="map-scale" data-camera-readout>${GLOBAL_ATLAS.cellScaleNm} nm / cell · ${Math.round(box.width)}×${Math.round(box.height)} · ${titleize(lod)}</div><div class="map-drag-hint">Drag chart · Wheel to zoom</div></div></div><aside class="navigation-context-pane"><div class="panel navigation-context-card symbol-context-panel">${markStripHtml([targetPortMark], "context-overlay navigation-destination")}<div class="eyebrow">${target ? "Selected destination" : "At a glance"}</div>${destinationCopy}${target && preview && !voyage ? `<div class="route-facts ${suppliesShort > 0 ? "stores-warning" : ""}"><b>${Math.round(preview.routeDistanceNm)} nm</b><span>~${formatVoyageHours(preview.estimatedHours)}</span><span class="route-supplies">~${plannedSupplies} supplies</span><small>${suppliesShort > 0 ? `${suppliesShort} more than current stores · voyage can continue if exhausted` : `${ship.supplies} aboard · ${ship.supplies - plannedSupplies} estimated remaining`}<br>${esc(routeHazardSummary(preview.path))}</small></div>` : ""}${searchResultPanel(lastSearchWatersResult)}</div></aside></div><footer class="voyage-dock" aria-label="Voyage controls"><div class="voyage-dock-status"><span class="eyebrow">Position</span><b>${esc(locationName)}</b><small>Supplies ${ship.supplies}${preview ? ` · route ~${plannedSupplies}` : ""}</small></div><div class="voyage-dock-route">${routeSummary}</div><div class="voyage-dock-actions">${searchAction}<button class="btn" data-action="map-center">Recenter</button>${dockAction}</div></footer></section>`;
}
function combatConditionCell(label, value, max, concealed = false) {
    if (concealed)
        return `<div class="combat-condition-cell concealed"><span>${esc(label)}</span><b>?</b><small>Unknown</small></div>`;
    const percent = max > 0 ? Math.round((value / max) * 100) : 0;
    const stateClass = percent <= 25 ? "critical" : percent <= 50 ? "damaged" : percent <= 75 ? "worn" : "sound";
    return `<div class="combat-condition-cell ${stateClass}"><span>${esc(label)}</span><b>${Math.round(value)}/${Math.round(max)}</b><span class="combat-condition-track" aria-hidden="true"><i style="width:${pct(percent)}"></i></span></div>`;
}
function combatShipStatus(ship, concealed = false) {
    const systems = ship.systems;
    const danger = [systems.fire > 0 ? `Fire ${systems.fire}` : "", systems.flooding > 0 ? `Flooding ${systems.flooding}` : ""].filter(Boolean).join(" · ");
    return `<div class="combat-condition-grid">
    ${combatConditionCell("Hull", systems.hull, systems.hullMax, concealed)}
    ${combatConditionCell("Sails", systems.sails, systems.sailsMax, concealed)}
    ${combatConditionCell("Rigging", systems.rigging, systems.riggingMax, concealed)}
    ${combatConditionCell("Crew", systems.crew, systems.crewMax, concealed)}
    ${combatConditionCell("Morale", systems.morale, 100, concealed)}
    <div class="combat-condition-cell battery ${concealed ? "concealed" : ""}"><span>Battery</span><b>${concealed ? "?" : ship.firepower}</b><small>${concealed ? "Unknown" : "Firepower"}</small></div>
  </div>${!concealed && danger ? `<div class="combat-damage-alert">${esc(danger)}</div>` : ""}`;
}
function renderEncounter(s) {
    const e = s.encounter;
    const player = getPlayerShip(s);
    const other = s.ships[e.otherShipId];
    const playerClass = shipClassDefinition(player.classId);
    const otherClass = shipClassDefinition(other.classId);
    const playerArt = (playerClass?.inspectionAssetId ? ASSET_BY_ID[playerClass.inspectionAssetId]?.path : undefined) ?? ASSET_BY_ID[player.artAssetId ?? ""]?.path;
    const otherArt = e.identified ? ((otherClass?.inspectionAssetId ? ASSET_BY_ID[otherClass.inspectionAssetId]?.path : undefined) ?? (other.artAssetId ? ASSET_BY_ID[other.artAssetId]?.path : undefined)) : undefined;
    const tacticalStage = ASSET_BY_ID["ui.combat.skeldra_tactical_sea"]?.path ?? "/art/ui/combat/skeldra_tactical_sea_stage.svg";
    const playerMark = shipIdentityMark(s, player.id);
    const otherMark = e.identified ? shipIdentityMark(s, other.id) : undefined;
    const sighting = e.phase === "sighting";
    const combat = e.phase === "combat";
    const outsideTactical = e.rangeYards > MAX_TACTICAL_RANGE_YARDS;
    const rangeBand = outsideTactical ? "CONTACT" : titleize(e.range).toUpperCase();
    const exactRange = outsideTactical ? `${yardsToNm(e.rangeYards).toFixed(1)} nm` : `${Math.round(e.rangeYards).toLocaleString()} yd`;
    const canFire = combat && !e.shipsSecured && e.rangeYards <= 1500;
    const canGrapple = combat && !e.shipsSecured && e.rangeYards <= 50;
    const canDemand = combat && other.systems.hull < other.systems.hullMax * .55;
    const enemyConditionConcealed = sighting && !e.identified;
    const newestLog = [...e.log].reverse();
    const posture = vesselPostureTowardPlayer(s, other);
    const postureVisible = e.identified || e.authorityDemanded;
    const postureSummary = e.authorityDemanded ? `${posture.label}: ${posture.summary}` : postureVisible ? `${posture.label}: ${posture.summary}` : posture.willPursue ? "The contact is altering course toward you." : "Intent is not yet established.";
    const authorityAction = e.authorityDemanded && posture.kind === "detain" ? `<button class="naval-action primary" data-action="submit-authority"><b>Heave To</b><span>Answer the active warrant</span></button>` : "";
    const sightingActions = `${authorityAction}<button class="naval-action" data-action="observe"><b>Observe</b><span>Study the vessel</span></button><button class="naval-action" data-action="hail"><b>Hail / Signal</b><span>Test its intent</span></button><button class="naval-action" data-action="avoid"><b>Avoid</b><span>Break contact</span></button><button class="naval-action danger" data-action="attack"><b>Approach</b><span>Clear for action</span></button>`;
    const combatActions = `<button class="naval-action" data-combat="close" ${e.shipsSecured ? "disabled" : ""}><b>Close</b><span>Reduce range</span></button><button class="naval-action" data-combat="open" ${e.shipsSecured ? "disabled" : ""}><b>Open Range</b><span>Increase separation</span></button><button class="naval-action primary" data-combat="fire_hull" ${!canFire ? "disabled" : ""}><b>Fire Hull</b><span>${canFire ? "Round shot" : "Out of range"}</span></button><button class="naval-action" data-combat="fire_rigging" ${!canFire ? "disabled" : ""}><b>Fire Rigging</b><span>${canFire ? "Chain shot" : "Out of range"}</span></button><button class="naval-action" data-combat="repair"><b>Repair</b><span>Damage control</span></button><button class="naval-action" data-combat="demand_surrender" ${!canDemand ? "disabled title=\"Enemy hull must be below 55% before a surrender demand can succeed.\"" : ""}><b>Demand Surrender</b><span>${canDemand ? "Press the advantage" : "Enemy still fighting"}</span></button>${e.shipsSecured ? `<button class="naval-action danger" data-action="board"><b>Board</b><span>Cross the rail</span></button>` : `<button class="naval-action danger" data-combat="grapple" ${!canGrapple ? "disabled" : ""}><b>Grapple</b><span>${canGrapple ? "Secure alongside" : "Inside 50 yd"}</span></button>`}<button class="naval-action" data-combat="flee" ${e.shipsSecured ? "disabled" : ""}><b>Flee</b><span>Break tactical contact</span></button>`;
    return `<section class="naval-combat-screen" style="--naval-tactical-stage:url('${esc(tacticalStage)}')">
    <header class="naval-combat-header"><div><span class="eyebrow">${sighting ? "Vessel sighted" : "Naval engagement"}</span><h1>${sighting ? "Contact on the Water" : "Battle Stations"}</h1></div><div class="naval-round-chip"><span>${outsideTactical ? "Visual contact" : `Round ${e.round}`}</span><b>${e.elapsedMinutes} min</b></div></header>
    <div class="naval-stage-shell">
      <div class="naval-stage-art" aria-hidden="true"></div>
      <article class="naval-ship-panel player">
        <div class="naval-ship-heading">${markStripHtml([playerMark], "naval-identity-mark")}<div><span>Your ship</span><h2>${esc(player.name)}</h2><small>${esc(playerClass?.name ?? player.classId)}</small></div></div>
        <div class="naval-ship-visual">${playerArt ? `<img src="${esc(playerArt)}" alt="${esc(player.name)}">` : `<div class="naval-ship-silhouette">SHIP</div>`}</div>
        ${combatShipStatus(player)}
      </article>
      <div class="naval-engagement-plaque" aria-label="Current engagement range"><span>${sighting ? "Contact" : "Range"}</span><b>${esc(rangeBand)}</b><strong>${esc(exactRange)}</strong><small>${outsideTactical ? "Sighting / signaling / pursuit" : e.shipsSecured ? "Ships secured together" : `Tactical separation · ${e.elapsedMinutes} min elapsed`}</small></div>
      <article class="naval-ship-panel enemy">
        <div class="naval-ship-heading enemy">${markStripHtml([otherMark], "naval-identity-mark")}<div><span>${e.identified ? titleize(other.disposition) : "Unknown contact"}</span><h2>${esc(e.identified ? other.name : "Unidentified vessel")}</h2><small>${esc(e.identified ? (otherClass?.name ?? other.classId) : "Rig and silhouette only")}</small></div></div>
        <div class="naval-ship-visual enemy">${otherArt ? `<img src="${esc(otherArt)}" alt="${esc(other.name)}">` : `<div class="naval-ship-silhouette"><span>SAILS</span><small>Identity unknown</small></div>`}</div>
        ${combatShipStatus(other, enemyConditionConcealed)}
      </article>
    </div>
    <section class="naval-action-band" aria-label="Naval combat actions"><div class="naval-action-band-title"><span class="eyebrow">Orders</span><small>${sighting ? esc(postureSummary) : e.shipsSecured ? "The ships are secured. Board or resolve the grapple." : canFire ? "Battery is within effective range." : "Main battery is outside effective range."}</small></div><div class="naval-action-grid">${sighting ? sightingActions : combat ? combatActions : ""}</div></section>
    <section class="battle-report-panel"><div class="battle-report-heading"><div><span class="eyebrow">Battle Report</span><h2>Most recent action first</h2></div><span class="battle-report-count">${e.log.length} ${e.log.length === 1 ? "entry" : "entries"}</span></div><div class="battle-report-list" data-order="newest-first">${newestLog.length ? newestLog.map((line, index) => `<div class="battle-report-entry ${index === 0 ? "latest" : ""}"><span>${index === 0 ? "Latest" : `-${index}`}</span><p>${esc(line)}</p></div>`).join("") : `<div class="battle-report-entry latest"><span>Latest</span><p>No combat action has been resolved yet.</p></div>`}</div></section>
  </section>`;
}
function renderPersonalCombat(s) {
    const c = s.personalCombat;
    const mainId = s.player.equipment.mainHand;
    const main = ITEM_BY_ID[s.player.inventory.find((i) => i.id === mainId)?.definitionId ?? ""];
    const sideId = s.player.equipment.offHand;
    const side = ITEM_BY_ID[s.player.inventory.find((i) => i.id === sideId)?.definitionId ?? ""];
    const opponent = s.npcs[c.opponentId];
    const playerMark = primaryIdentityMark(playerIdentityPresentation(s));
    const opponentMarks = opponent ? npcPublicMarks(opponent) : [];
    return `<div class="personal-combat"><div class="encounter-inner"><div class="panel"><div class="eyebrow">Turn-based personal combat · ${titleize(c.source)}</div><div class="row between"><h2 class="section-title">${esc(s.player.character.name)} vs ${esc(c.opponentName)}</h2><span class="alpha-badge">Round ${c.round}</span></div><div class="combatants"><div class="combatant-card symbol-context-panel">${markStripHtml([playerMark], "context-overlay combatant")}<h3>${esc(s.player.character.name)}</h3>${meter("Health", c.playerHealth, c.playerHealthMax)}<p>AP <b>${c.playerAP}/6</b> · stance <b>${titleize(c.playerStance)}</b></p><p class="small muted">Main hand: ${esc(main?.name ?? "Unarmed")} · Off hand: ${esc(side?.name ?? "Empty")} · pistol ${c.pistolLoaded ? "loaded" : "empty"}</p></div><div class="combatant-card symbol-context-panel">${markStripHtml(opponentMarks, "context-overlay combatant")}<h3>${esc(c.opponentName)}</h3>${meter("Health", c.opponentHealth, c.opponentHealthMax)}<p>Stance <b>${titleize(c.opponentStance)}</b> · armor ${c.opponentArmor}</p></div></div><div class="combat-log personal-log">${c.log.map((line) => `<div>${esc(line)}</div>`).join("")}</div>${c.resolved ? `<div class="row action-row"><button class="btn primary" data-action="leave-personal">Return</button></div>` : `<div class="row action-row combat-primary-actions"><button class="btn primary" data-personal="slash">Attack · ${main?.name ?? "Melee"}</button>${side ? c.pistolLoaded ? `<button class="btn" data-personal="pistol">Fire Pistol</button>` : `<button class="btn" data-personal="reload">Reload · 3 AP</button>` : ""}<button class="btn" data-personal="defend">Defend · 2 AP</button><details class="stance-menu"><summary class="btn">Stance · ${titleize(c.playerStance)}</summary><div class="stance-menu-actions"><button class="btn small" data-personal="stance_aggressive">Aggressive</button><button class="btn small" data-personal="stance_balanced">Balanced</button><button class="btn small" data-personal="stance_defensive">Defensive</button></div></details><button class="btn" data-personal="end_turn">End Turn</button></div>`}</div></div></div>`;
}
const PRESERVED_SCROLL_SELECTORS = [
    ".context-location-scroll",
    ".context-location-mechanics",
    ".market-production-body",
    ".character-structure-scroll",
    ".character-structure-pane",
    ".crew-production-body",
    ".journal-production-body",
    ".journal-layout > .panel",
    ".journal-layout > div",
    ".utility-scroll-host",
    ".manuscript-scroll-host",
    ".port-content",
    ".poi-site-shade",
    ".arrival-shade",
    ".personal-combat",
    ".encounter",
    ".naval-combat-screen",
    ".navigation-context-card",
    ".navrail",
    ".table-scroll",
    ".dialogue-log",
    ".combat-log",
    ".encounter-log-region",
    ".battle-report-list",
    ".development-list",
    ".ship-production-status-grid",
    ".art-screen-host[data-art-screen-scroll=\"host\"]"
];
function captureGameScrollPositions() {
    const snapshot = new Map();
    for (const selector of PRESERVED_SCROLL_SELECTORS) {
        app.querySelectorAll(selector).forEach((node, index) => snapshot.set(`${selector}:${index}`, { top: node.scrollTop, left: node.scrollLeft }));
    }
    return snapshot;
}
function restoreGameScrollPositions(snapshot, viewKey) {
    const apply = () => {
        if (lastRenderedGameViewKey !== viewKey)
            return;
        for (const selector of PRESERVED_SCROLL_SELECTORS) {
            app.querySelectorAll(selector).forEach((node, index) => {
                const position = snapshot.get(`${selector}:${index}`);
                if (!position)
                    return;
                node.scrollTop = position.top;
                node.scrollLeft = position.left;
            });
        }
    };
    apply();
    requestAnimationFrame(apply);
}
function gameViewKey(s) {
    if (s.personalCombat)
        return `personal:${s.personalCombat.opponentId}`;
    if (s.encounter && s.encounter.phase !== "resolved")
        return `encounter:${s.encounter.otherShipId}:${s.encounter.phase}`;
    if (s.arrival)
        return `arrival:${s.player.currentPortId ?? s.player.currentPoiId ?? "unknown"}`;
    const place = s.player.currentPortId ?? s.player.currentPoiId ?? "sea";
    if (tab === "ship")
        return `${place}:ship:${shipPanelTab}`;
    if (tab === "inventory")
        return `${place}:captain:${captainPanelTab}`;
    if (tab === "crew")
        return `${place}:crew:${inspectedCrewNpcId ?? "roster"}:${crewPanelTab}`;
    if (tab === "journal")
        return `${place}:journal:${journalTab}`;
    return `${place}:${tab}`;
}
function renderGame() {
    if (!state) {
        renderCreation();
        syncAudio();
        return;
    }
    const viewKey = gameViewKey(state);
    const scrollSnapshot = lastRenderedGameViewKey === viewKey ? captureGameScrollPositions() : undefined;
    if (state.personalCombat)
        app.innerHTML = `<div class="shell">${renderTopBar(state)}${renderPersonalCombat(state)}</div>`;
    else if (state.encounter && state.encounter.phase !== "resolved")
        app.innerHTML = `<div class="shell">${renderTopBar(state)}${renderEncounter(state)}</div>`;
    else if (state.arrival)
        app.innerHTML = `<div class="shell">${renderTopBar(state)}${renderArrival(state)}</div>`;
    else {
        let content;
        const portOnlyTab = tab === "town" || tab === "market" || tab === "tavern" || tab === "people" || tab === "government" || tab === "religion";
        if (state.player.currentPoiId && tab === "poi")
            content = renderPoi(state);
        else if (state.voyage || tab === "chart" || (!state.player.currentPortId && portOnlyTab))
            content = renderChart(state);
        else if (tab === "town")
            content = renderTown(state);
        else if (tab === "market")
            content = renderMarket(state);
        else if (tab === "inventory")
            content = renderInventory(state);
        else if (tab === "crew")
            content = renderCrew(state);
        else if (tab === "people")
            content = renderPeople(state);
        else if (tab === "tavern")
            content = renderTavern(state);
        else if (tab === "government")
            content = renderInstitution(state, "government");
        else if (tab === "religion")
            content = renderInstitution(state, "religion");
        else if (tab === "journal")
            content = renderJournal(state);
        else
            content = renderShip(state);
        app.innerHTML = `<div class="shell">${renderTopBar(state)}<div class="game-layout">${renderNav()}<main class="main" data-game-viewport>${content}</main></div></div>`;
    }
    syncAudio();
    initializePresentation();
    lastRenderedGameViewKey = viewKey;
    if (scrollSnapshot)
        restoreGameScrollPositions(scrollSnapshot, viewKey);
}
function handleResult(result, sound) { if (sound && result.ok)
    cue(sound); toast(result.message); renderGame(); }
function runVoyageUntilAttention(s, prefix) {
    const result = sailUntilInterrupted(s);
    mapCameraState = undefined;
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
    const reportNote = report ? ` · ${Math.round(report.distanceTravelledNm)} nm sailed · supplies ${report.suppliesUsed} used${report.suppliesExhausted ? " / exhausted" : ""} · ${report.hullDamage || report.sailsDamage || report.riggingDamage ? `damage H${report.hullDamage} S${report.sailsDamage} R${report.riggingDamage}` : "no ship damage"}` : result.weatherEvents.length ? ` · ${result.weatherEvents.length} weather event${result.weatherEvents.length === 1 ? "" : "s"} passed underway.` : "";
    toast(`${prefix ? `${prefix} ` : ""}${result.message}${reportNote}`);
    tab = "chart";
    renderGame();
}
function resolveEncounterAndResume(s, result, sound) {
    if (sound && result.ok)
        cue(sound);
    if (result.ok && s.encounter?.phase === "resolved") {
        delete s.encounter;
        if (s.voyage) {
            runVoyageUntilAttention(s, result.message);
            return;
        }
    }
    toast(result.message);
    renderGame();
}
function resetRuntimeForNewVoyage() {
    state = undefined;
    dialogueLines = [];
    activeDialogueNpcId = undefined;
    inspectedCrewNpcId = undefined;
    selectedMapTarget = undefined;
    mapCameraState = undefined;
    lastSearchWatersResult = undefined;
    poiFocusAction = undefined;
    captainPanelTab = "sheet";
    crewPanelTab = "sheet";
    selectedInventoryOwnerId = "player";
    selectedInventoryItemId = undefined;
    inventoryFilters = { player: "all" };
    inventoryPages = { player: 0 };
    creatorStep = 0;
    renderCreation();
}
function activateExpandedWorld(s) {
    const knownPorts = PORTS.filter(port => port.knownByDefault).map(port => port.id);
    const knownPois = POINTS_OF_INTEREST.filter(poi => poi.knownByDefault).map(poi => poi.id);
    s.player.knownPortIds = [...new Set([...s.player.knownPortIds, ...knownPorts])];
    s.player.knownPoiIds = [...new Set([...s.player.knownPoiIds, ...knownPois])];
    for (const port of PORTS) {
        if (s.player.portStanding[port.id] === undefined)
            s.player.portStanding[port.id] = 0;
    }
    const generated = buildInitialPortMarkets();
    for (const [portId, market] of Object.entries(generated)) {
        if (!s.markets[portId])
            s.markets[portId] = market;
    }
}
function continueLocalCampaign() {
    try {
        state = loadLocal();
        if (!state)
            throw new Error("No save found");
        activateExpandedWorld(state);
        selectedMapTarget = undefined;
        mapCameraState = undefined;
        lastSearchWatersResult = undefined;
        tab = state.player.currentPoiId ? "poi" : state.player.currentPortId ? "town" : "chart";
        captainPanelTab = "sheet";
        crewPanelTab = "sheet";
        selectedInventoryOwnerId = "player";
        selectedInventoryItemId = undefined;
        renderGame();
        return { ok: true, message: "Campaign loaded." };
    }
    catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : "Could not load save." };
    }
}
function publishLauncherReadiness() {
    const canContinue = hasLocalSave();
    document.documentElement.dataset.etRuntimeReady = "true";
    document.documentElement.dataset.etHasLocalSave = canContinue ? "true" : "false";
    window.dispatchEvent(new CustomEvent(LAUNCHER_READY_EVENT, { detail: { hasLocalSave: canContinue } }));
}
function respondToLauncher(detail, ok, message) {
    const hasSave = hasLocalSave();
    document.documentElement.dataset.etHasLocalSave = hasSave ? "true" : "false";
    const result = { requestId: detail.requestId, mode: detail.mode, ok, hasLocalSave: hasSave, ...(message ? { message } : {}) };
    window.dispatchEvent(new CustomEvent(LAUNCHER_RESULT_EVENT, { detail: result }));
}
window.addEventListener(LAUNCHER_REQUEST_EVENT, (event) => {
    const detail = event.detail;
    if (!detail || typeof detail.requestId !== "string" || (detail.mode !== "new" && detail.mode !== "continue"))
        return;
    if (detail.mode === "new") {
        resetRuntimeForNewVoyage();
        respondToLauncher(detail, true, "Character Creator ready.");
        return;
    }
    const result = continueLocalCampaign();
    respondToLauncher(detail, result.ok, result.message);
});
function handleClick(target) {
    const actionEl = target.closest("[data-action]");
    const tabEl = target.closest("[data-tab]");
    const combatEl = target.closest("[data-combat]");
    const personalEl = target.closest("[data-personal]");
    const d = (el, key) => el.getAttribute(`data-${key}`) ?? "";
    void audio.unlock();
    if (tabEl && state) {
        tab = d(tabEl, "tab");
        cue(tab === "journal" ? "page" : "ui");
        renderGame();
        return;
    }
    if (personalEl && state) {
        const action = d(personalEl, "personal");
        const sound = action === "pistol" ? "pistol" : action === "slash" ? "blade" : action === "defend" ? "hit" : "ui";
        handleResult(personalCombatAction(state, action), sound);
        return;
    }
    if (combatEl && state) {
        const action = d(combatEl, "combat");
        const sound = action.startsWith("fire") ? "cannon" : action === "repair" ? "repair" : "ui";
        const before = crewReactionSnapshot(state);
        const result = combatAction(state, action);
        const reaction = result.ok ? crewReactionDelta(before, state) : { morale: 0, loyalty: 0 };
        resolveEncounterAndResume(state, result, sound);
        if (result.ok)
            showCrewReaction(reaction, "battle");
        return;
    }
    if (!actionEl)
        return;
    const action = d(actionEl, "action");
    if (action === "creator-step") {
        setCreatorStepInDom(Number(d(actionEl, "step")) || 0);
        return;
    }
    if (action === "creator-step-delta") {
        setCreatorStepInDom(creatorStep + (Number(d(actionEl, "dir")) || 0));
        return;
    }
    if (action === "continue-save") {
        const result = continueLocalCampaign();
        toast(result.message);
        return;
    }
    if (!state)
        return;
    const s = state;
    switch (action) {
        case "save":
            saveLocal(s);
            cue("page");
            toast("Campaign saved with global-grid position, plotted navigation state, world history, crew, injuries, equipment and intelligence.");
            return;
        case "new-game":
            if (confirm("Start a new campaign? Your current local save remains until you save over it."))
                resetRuntimeForNewVoyage();
            return;
        case "toggle-audio":
            s.settings.audioEnabled = !s.settings.audioEnabled;
            audio.configure(s.settings.audioEnabled, s.settings.masterVolume);
            if (s.settings.audioEnabled) {
                void audio.unlock();
                cue("bell");
            }
            renderGame();
            return;
        case "volume-down":
            s.settings.masterVolume = Math.max(0, Math.round((s.settings.masterVolume - 0.08) * 100) / 100);
            audio.configure(s.settings.audioEnabled, s.settings.masterVolume);
            cue("ui");
            renderGame();
            return;
        case "volume-up":
            s.settings.masterVolume = Math.min(1, Math.round((s.settings.masterVolume + 0.08) * 100) / 100);
            audio.configure(s.settings.audioEnabled, s.settings.masterVolume);
            cue("ui");
            renderGame();
            return;
        case "trade-quantity": {
            const id = d(actionEl, "id");
            const delta = Number(d(actionEl, "delta")) || 0;
            const input = app.querySelector(`[data-market-quantity="${CSS.escape(id)}"]`);
            const current = Math.max(1, Math.floor(Number(input?.value) || marketTradeQuantities[id] || 1));
            const next = Math.max(1, Math.min(999, current + delta));
            marketTradeQuantities[id] = next;
            if (input)
                input.value = String(next);
            cue("ui");
            return;
        }
        case "trade": {
            const id = d(actionEl, "id");
            const input = actionEl.closest("td")?.querySelector("[data-market-quantity]");
            const quantity = Math.max(1, Math.min(999, Math.floor(Number(input?.value) || marketTradeQuantities[id] || 1)));
            marketTradeQuantities[id] = quantity;
            handleResult(transact(s, id, quantity, d(actionEl, "dir") === "sell" ? "sell" : "buy"), "coin");
            return;
        }
        case "smuggle-trade": {
            const id = d(actionEl, "id");
            const input = actionEl.closest("td")?.querySelector("[data-market-quantity]");
            const quantity = Math.max(1, Math.min(999, Math.floor(Number(input?.value) || marketTradeQuantities[id] || 1)));
            marketTradeQuantities[id] = quantity;
            handleResult(attemptSmuggledTransaction(s, id, quantity, d(actionEl, "dir") === "sell" ? "sell" : "buy"), "coin");
            return;
        }
        case "obtain-customs-permit":
            handleResult(obtainCustomsPermit(s), "page");
            return;
        case "obtain-letter-marque":
            handleResult(obtainLetterOfMarque(s), "page");
            return;
        case "customs-present":
            handleResult(presentCustomsPapers(s), "page");
            return;
        case "customs-conceal":
            handleResult(concealFromCustoms(s), "page");
            return;
        case "accept-contract":
            handleResult(acceptContract(s, d(actionEl, "id")), "page");
            return;
        case "fulfill-contract":
            handleResult(fulfillContract(s, d(actionEl, "id")), "coin");
            return;
        case "buy-supplies":
            handleResult(buySupplies(s), "coin");
            return;
        case "repair-ship":
            handleResult(repairShip(s), "repair");
            return;
        case "install-refit":
            handleResult(installRefit(s, d(actionEl, "id")), "repair");
            return;
        case "set-character-subtab": {
            const owner = d(actionEl, "owner");
            const view = (d(actionEl, "view") || "sheet");
            if (owner === "crew")
                crewPanelTab = view;
            else
                captainPanelTab = view;
            cue("ui");
            renderGame();
            return;
        }
        case "set-inventory-filter": {
            const owner = (d(actionEl, "owner") || "player");
            const filter = (d(actionEl, "filter") || "all");
            inventoryFilters[owner] = filter;
            inventoryPages[owner] = 0;
            selectedInventoryOwnerId = owner;
            selectedInventoryItemId = undefined;
            cue("ui");
            renderGame();
            return;
        }
        case "inventory-page": {
            const owner = (d(actionEl, "owner") || "player");
            inventoryPages[owner] = Math.max(0, (inventoryPages[owner] ?? 0) + (Number(d(actionEl, "dir")) || 0));
            selectedInventoryOwnerId = owner;
            selectedInventoryItemId = undefined;
            cue("page");
            renderGame();
            return;
        }
        case "inspect-item":
            selectedInventoryOwnerId = (d(actionEl, "owner") || "player");
            selectedInventoryItemId = d(actionEl, "id") || undefined;
            cue("ui");
            renderGame();
            return;
        case "inspect-slot":
            cue("ui");
            toast("Select an item in the inventory grid, then click a highlighted compatible slot or use the Equip button.");
            return;
        case "equip-item": {
            selectedInventoryOwnerId = (d(actionEl, "owner") || "player");
            selectedInventoryItemId = d(actionEl, "id") || undefined;
            handleResult(equipItem(s, d(actionEl, "id"), selectedInventoryOwnerId, (d(actionEl, "slot") || undefined)), "ui");
            return;
        }
        case "quick-equip-slot": {
            selectedInventoryOwnerId = (d(actionEl, "owner") || "player");
            const itemId = d(actionEl, "id") || selectedInventoryItemId || "";
            if (!itemId) {
                toast("Select an item first.");
                return;
            }
            selectedInventoryItemId = itemId;
            handleResult(equipItem(s, itemId, selectedInventoryOwnerId, (d(actionEl, "slot") || undefined)), "ui");
            return;
        }
        case "unequip-slot": {
            selectedInventoryOwnerId = (d(actionEl, "owner") || "player");
            handleResult(unequipItem(s, (d(actionEl, "slot") || "mainHand"), selectedInventoryOwnerId), "ui");
            return;
        }
        case "buy-item":
            handleResult(purchaseItem(s, d(actionEl, "id")), "coin");
            return;
        case "use-ability":
            handleResult(usePlayerAbility(s, d(actionEl, "id")), "ui");
            return;
        case "focus-skill":
            handleResult(spendDevelopmentPointOnSkill(s, d(actionEl, "id")), "page");
            return;
        case "take-perk":
            handleResult(takeGeneralPerk(s, d(actionEl, "id")), "page");
            return;
        case "ship-subtab":
            shipPanelTab = (d(actionEl, "view") === "work" ? "work" : "overview");
            cue("ui");
            renderGame();
            return;
        case "market-page":
            marketPage = Math.max(0, marketPage + (Number(d(actionEl, "dir")) || 0));
            cue("page");
            renderGame();
            return;
        case "crew-page":
            crewPage = Math.max(0, crewPage + (Number(d(actionEl, "dir")) || 0));
            cue("page");
            renderGame();
            return;
        case "crew-back":
            inspectedCrewNpcId = undefined;
            activeDialogueNpcId = undefined;
            crewPanelTab = "sheet";
            cue("page");
            renderGame();
            return;
        case "journal-tab":
            journalTab = (d(actionEl, "tab-id") || "knowledge");
            journalPage = 0;
            cue("page");
            renderGame();
            return;
        case "journal-page":
            journalPage = Math.max(0, journalPage + (Number(d(actionEl, "dir")) || 0));
            cue("page");
            renderGame();
            return;
        case "inspect-crew":
            inspectedCrewNpcId = d(actionEl, "id");
            crewPanelTab = "sheet";
            selectedInventoryOwnerId = inspectedCrewNpcId;
            selectedInventoryItemId = undefined;
            inventoryFilters[inspectedCrewNpcId] ??= "all";
            inventoryPages[inspectedCrewNpcId] ??= 0;
            tab = "crew";
            cue("page");
            renderGame();
            return;
        case "dev-advance-world": {
            const hours = Math.max(1, Number(d(actionEl, "hours")) || 24);
            if (s.voyage || s.encounter || s.personalCombat) {
                toast("Resolve the active player voyage/encounter before accelerated simulation.");
                return;
            }
            advanceWorld(s, hours);
            cue("page");
            toast(`Advanced the persistent world ${hours} hours.`);
            renderGame();
            return;
        }
        case "treat-injuries":
            handleResult(treatInjuries(s), "ui");
            return;
        case "settle-local-warrant":
            handleResult(satisfyActiveWarrant(s, d(actionEl, "jurisdiction-id")), "coin");
            return;
        case "recruit": {
            tab = "tavern";
            const desertion = checkTavernDesertion(s);
            cue("bell");
            renderGame();
            if (desertion.left > 0)
                toast(desertion.message);
            return;
        }
        case "hire-crew":
            handleResult(recruitCrewOffer(s, d(actionEl, "id")), "coin");
            return;
        case "share-prize": {
            const before = crewReactionSnapshot(s);
            handleCrewResult(s, before, sharePrizeWithCrew(s), "prize_share", "coin");
            return;
        }
        case "rest-crew": {
            const before = crewReactionSnapshot(s);
            handleCrewResult(s, before, restCrew(s), "shore_leave", "bell");
            return;
        }
        case "gather-rumor":
            handleResult(gatherRumor(s), "page");
            return;
        case "assess-port":
            handleResult(assessPort(s), "page");
            return;
        case "study-learning-source":
            handleResult(studyLearningSource(s, d(actionEl, "id")), "page");
            return;
        case "participate-religion":
            handleResult(participateInReligiousLife(s), "bell");
            return;
        case "deck-drill":
            handleResult(beginDeckDrill(s), "blade");
            return;
        case "select-port":
            selectedMapTarget = navigationTargetForPort(d(actionEl, "id"));
            lastSearchWatersResult = undefined;
            cue("page");
            renderGame();
            return;
        case "select-poi":
            selectedMapTarget = navigationTargetForPoi(d(actionEl, "id"));
            lastSearchWatersResult = undefined;
            cue("page");
            renderGame();
            return;
        case "map-center":
            centerMapOnPlayer(s);
            cue("ui");
            return;
        case "map-zoom-step": {
            const direction = String(d(actionEl, "direction")) === "in" ? "in" : "out";
            setMapZoom(direction);
            cue("page");
            return;
        }
        case "select-map-cell": {
            const x = Number(d(actionEl, "x"));
            const y = Number(d(actionEl, "y"));
            selectedMapTarget = navigationTargetForSea({ x, y });
            lastSearchWatersResult = undefined;
            if (selectedMapTarget)
                cue("ui");
            renderGame();
            return;
        }
        case "begin-navigation": {
            if (!selectedMapTarget) {
                toast("Select a destination first.");
                return;
            }
            const before = crewReactionSnapshot(s);
            const result = beginNavigation(s, selectedMapTarget);
            if (!result.ok) {
                toast(result.message);
                renderGame();
                return;
            }
            const departureReaction = crewReactionDelta(before, s);
            cue("sail");
            runVoyageUntilAttention(s, result.message);
            showCrewReaction(departureReaction, "underprovisioned");
            return;
        }
        case "continue-voyage": {
            if (!s.voyage) {
                toast("No voyage is active.");
                return;
            }
            runVoyageUntilAttention(s);
            return;
        }
        case "cancel-voyage": {
            const result = cancelVoyage(s);
            if (result.ok) {
                mapCameraState = undefined;
                lastSearchWatersResult = undefined;
                tab = "chart";
            }
            handleResult(result, "sail");
            return;
        }
        case "search-waters": {
            const result = searchWaters(s);
            lastSearchWatersResult = result;
            if (result.ok)
                cue(result.kind === "ship" ? "bell" : "page");
            toast(result.message);
            renderGame();
            return;
        }
        case "port-action": {
            const id = d(actionEl, "id");
            delete s.arrival;
            if (id === "harbor") {
                shipPanelTab = "work";
                tab = "ship";
            }
            else
                tab = id === "town" ? "town" : id;
            const desertion = id === "tavern" ? checkTavernDesertion(s) : undefined;
            cue(id === "tavern" ? "bell" : id === "market" ? "coin" : "ui");
            renderGame();
            if (desertion && desertion.left > 0)
                toast(desertion.message);
            return;
        }
        case "poi-action": {
            const id = d(actionEl, "id");
            const poi = s.player.currentPoiId ? POI_BY_ID[s.player.currentPoiId] : undefined;
            delete s.arrival;
            poiFocusAction = id;
            tab = "poi";
            if (poi) {
                s.worldEvents.push({ id: `event.poi_action.${poi.id}.${s.absoluteHour}.${s.worldEvents.length}`, type: "poi_action", atHour: s.absoluteHour, locationId: poi.id, participants: [s.player.character.id, s.player.shipId], summary: `${s.player.character.name}: ${poi.arrivalActions.find((a) => a.id === id)?.label ?? titleize(id)} at ${poi.name}.`, canonicalData: { poiId: poi.id, action: id }, importance: 0 });
            }
            cue(id === "salvage" ? "repair" : "ui");
            renderGame();
            return;
        }
        case "leave-poi":
            delete s.arrival;
            tab = "chart";
            mapCameraState = undefined;
            cue("sail");
            renderGame();
            return;
        case "leave-port":
            delete s.arrival;
            tab = "chart";
            cue("sail");
            renderGame();
            return;
        case "observe":
            handleResult(observeEncounter(s), "ui");
            return;
        case "hail":
            resolveEncounterAndResume(s, hailEncounter(s), "bell");
            return;
        case "submit-authority":
            resolveEncounterAndResume(s, submitToAuthorityEncounter(s), "bell");
            return;
        case "avoid":
            resolveEncounterAndResume(s, avoidEncounter(s), "sail");
            return;
        case "attack":
            handleResult(attackEncounter(s), "cannon");
            return;
        case "board":
            handleResult(beginBoardingCombat(s), "blade");
            return;
        case "leave-personal":
            delete s.personalCombat;
            if (s.encounter?.phase === "resolved")
                delete s.encounter;
            if (s.voyage) {
                runVoyageUntilAttention(s, "Boarding resolved.");
                return;
            }
            tab = s.player.currentPortId ? "ship" : "chart";
            renderGame();
            return;
        case "open-dialogue": {
            const npcId = d(actionEl, "id");
            if (!s.npcs[npcId]) {
                toast("That person is not available.");
                return;
            }
            if (activeDialogueNpcId !== npcId)
                dialogueLines = [];
            activeDialogueNpcId = npcId;
            cue("ui");
            renderGame();
            requestAnimationFrame(() => revealWithinLocalPane("#dialogue-panel", "center"));
            return;
        }
    }
}
app.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement))
        return;
    const id = target.dataset.marketQuantity;
    if (!id)
        return;
    const quantity = Math.max(1, Math.min(999, Math.floor(Number(target.value) || 1)));
    marketTradeQuantities[id] = quantity;
});
app.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element))
        return;
    if (suppressNextMapClick && target.closest("svg.chart-v04")) {
        event.preventDefault();
        event.stopPropagation();
        suppressNextMapClick = false;
        return;
    }
    handleClick(target);
});
app.addEventListener("pointerdown", (event) => {
    const target = event.target;
    if (!(target instanceof Element) || event.button !== 0 || !state)
        return;
    const chart = target.closest("svg.chart-v04");
    if (!chart)
        return;
    const c = ensureMapCamera(state);
    // Do not capture on pointer-down. A normal click must remain targeted at the
    // actual port / POI / navigable-water element. Capture begins only after the
    // drag threshold is crossed so click-to-route and drag-to-pan cannot fight.
    mapDragState = { pointerId: event.pointerId, startClientX: event.clientX, startClientY: event.clientY, startTargetX: c.targetX, startTargetY: c.targetY, dragging: false };
});
app.addEventListener("pointermove", (event) => {
    if (!mapDragState || event.pointerId !== mapDragState.pointerId || !state)
        return;
    const chart = document.querySelector("svg.chart-v04");
    if (!chart)
        return;
    const dx = event.clientX - mapDragState.startClientX;
    const dy = event.clientY - mapDragState.startClientY;
    if (!mapDragState.dragging && Math.hypot(dx, dy) < NAV_CAMERA.dragThresholdPx)
        return;
    if (!mapDragState.dragging) {
        mapDragState.dragging = true;
        chart.classList.add("is-dragging");
        chart.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
    const rect = chart.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0)
        return;
    const c = ensureMapCamera(state);
    const width = c.targetViewWidth;
    const height = viewHeightForWidth(width);
    const center = clampCameraCenter({ x: mapDragState.startTargetX - (dx / rect.width) * width, y: mapDragState.startTargetY - (dy / rect.height) * height }, width);
    c.targetX = center.x;
    c.targetY = center.y;
    scheduleMapCameraFrame();
});
function finishMapDrag(event) {
    if (!mapDragState || event.pointerId !== mapDragState.pointerId)
        return;
    const chart = document.querySelector("svg.chart-v04");
    if (mapDragState.dragging) {
        suppressNextMapClick = true;
        window.setTimeout(() => { suppressNextMapClick = false; }, 0);
    }
    chart?.classList.remove("is-dragging");
    try {
        chart?.releasePointerCapture?.(event.pointerId);
    }
    catch { }
    mapDragState = undefined;
}
app.addEventListener("pointerup", finishMapDrag);
app.addEventListener("pointercancel", finishMapDrag);
app.addEventListener("wheel", (event) => {
    const target = event.target;
    if (!(target instanceof Element) || !state)
        return;
    const chart = target.closest("svg.chart-v04");
    if (!chart)
        return;
    event.preventDefault();
    const rect = chart.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0)
        return;
    const fx = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const fy = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    const c = ensureMapCamera(state);
    const box = cameraViewBox({ x: c.targetX, y: c.targetY, viewWidth: c.targetViewWidth });
    const anchorWorld = { x: box.x + fx * box.width, y: box.y + fy * box.height };
    const requested = c.targetViewWidth * Math.exp(event.deltaY * NAV_CAMERA.zoomWheelSensitivity);
    const next = zoomAroundAnchor(c, anchorWorld, { x: fx, y: fy }, requested);
    c.targetX = next.x;
    c.targetY = next.y;
    c.targetViewWidth = next.viewWidth;
    state.settings.navigationZoom = legacyZoomBand(next.viewWidth);
    scheduleMapCameraFrame();
}, { passive: false });
app.addEventListener("submit", (event) => { const form = event.target; if (!(form instanceof HTMLFormElement))
    return; event.preventDefault(); if (form.id === "creation-form") {
    try {
        state = createGame(creationFromForm(form));
        activateExpandedWorld(state);
        selectedMapTarget = undefined;
        mapCameraState = undefined;
        tab = "town";
        dialogueLines = [];
        activeDialogueNpcId = undefined;
        inspectedCrewNpcId = undefined;
        poiFocusAction = undefined;
        captainPanelTab = "sheet";
        crewPanelTab = "sheet";
        selectedInventoryOwnerId = "player";
        selectedInventoryItemId = undefined;
        inventoryFilters = { player: "all" };
        renderGame();
        toast(`Your captain begins in ${PORT_BY_ID[state.player.currentPortId ?? ""]?.name ?? "port"}.`);
        void audio.unlock().then(() => cue("bell"));
    }
    catch (error) {
        toast(error instanceof Error ? error.message : "Could not create campaign.");
    }
    return;
} if (form.id === "dialogue-form" && state) {
    const input = form.elements.namedItem("message");
    const message = input?.value.trim() ?? "";
    if (!message)
        return;
    const npcId = activeDialogueNpcId;
    if (!npcId || !state.npcs[npcId]) {
        toast("No conversation is active.");
        return;
    }
    dialogueLines.push({ speaker: state.player.character.name, text: message });
    const reply = deterministicCharacterMindReply(state, npcId, message);
    dialogueLines.push({ speaker: state.npcs[npcId]?.name ?? "NPC", text: reply.text });
    if (reply.proposedMemory) {
        const memoryId = `event.dialogue.${state.absoluteHour}.${state.worldEvents.length}`;
        state.worldEvents.push({ id: memoryId, type: "character_conversation", atHour: state.absoluteHour, ...(state.player.currentPortId ? { locationId: state.player.currentPortId } : {}), participants: [state.player.character.id, npcId], summary: reply.proposedMemory, canonicalData: { interpretedIntent: reply.interpretedIntent, source: reply.source }, importance: 1 });
        const npc = state.npcs[npcId];
        if (npc && !npc.brain.memories.includes(memoryId))
            npc.brain.memories.push(memoryId);
    }
    cue("ui");
    renderGame();
    requestAnimationFrame(() => revealWithinLocalPane("#dialogue-panel", "end"));
} });
window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s" && state) {
        event.preventDefault();
        saveLocal(state);
        cue("page");
        toast("Campaign saved.");
        return;
    }
    if (!state || !document.querySelector("svg.chart-v04"))
        return;
    const active = document.activeElement;
    if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement || (active instanceof HTMLElement && active.isContentEditable))
        return;
    const key = event.key.toLowerCase();
    if (key === "+" || key === "=") {
        event.preventDefault();
        setMapZoom("in");
        return;
    }
    if (key === "-" || key === "_") {
        event.preventDefault();
        setMapZoom("out");
        return;
    }
    if (key === "0") {
        event.preventDefault();
        centerMapOnPlayer(state);
        return;
    }
    const c = ensureMapCamera(state);
    const step = c.targetViewWidth * .12;
    let dx = 0, dy = 0;
    if (key === "arrowleft" || key === "a")
        dx = -step;
    else if (key === "arrowright" || key === "d")
        dx = step;
    else if (key === "arrowup" || key === "w")
        dy = -step;
    else if (key === "arrowdown" || key === "s")
        dy = step;
    else
        return;
    event.preventDefault();
    const center = panCameraTarget(c, dx, dy);
    c.targetX = center.x;
    c.targetY = center.y;
    scheduleMapCameraFrame();
});
window.addEventListener("pointerdown", () => { void audio.unlock(); }, { once: true });
installArtCalibrationShortcut((enabled) => { if (state)
    renderGame();
else
    renderCreation(); toast(`Art calibration mode ${enabled ? "enabled" : "disabled"}. ${enabled ? "Drag regions to move, shift-drag or use the corner handle to resize, then copy normalized values." : "Production presentation restored."}`); });
installReferenceGhostShortcut((enabled) => { if (state)
    renderGame();
else
    renderCreation(); toast(`Reference Ghost Mode ${enabled ? "enabled" : "disabled"}. ${enabled ? "Use opacity, Live / Both / Reference, or Blink to compare the approved design against the runtime screen." : "Live presentation restored."}`); });
renderCreation();
publishLauncherReadiness();
//# sourceMappingURL=main.js.map