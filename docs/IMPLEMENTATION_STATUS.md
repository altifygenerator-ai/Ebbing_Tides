# Ebbing Tides — Alpha 0.6D Implementation Status

Current checkpoint: **Alpha 0.6D — Contextual Location Presentation Pass 1 / Manual Visual Gate**

Package version: `0.6.0-alpha.d.contextual-location1`

Save schema: **v10**

Current gate: `functionalStatus: PASS`, `visualStatus: PENDING MANUAL`, `feelStatus: PENDING MANUAL`, `funStatus: PENDING MANUAL`.

**Do not begin broad Crew Mechanics or world-population expansion until this baseline is manually accepted.**

---

## Contextual Location Presentation Pass 1 — 2026-09-08

- Added reusable Skeldran scene banners for Market, Tavern, Harbor, Royal Palace, Temple, and People.
- Removed external white generation canvas and normalized all six runtime banners to **2172×500**.
- Static category label/symbol and mild trim are art-owned; dynamic port/entity names and all mechanics remain code-owned.
- Market now reads: scene → centered `PORT Exchange` → `Current Prices` → commodity mechanics / Captain's Read.
- Harbor/ship now reads: scene → centered `Ship / SHIP NAME` → Ship/Harbor switcher → overview or yard mechanics.
- Harbor yard presentation makes supplies, Hull/Sails/Rigging condition, supply price, and full repair price explicit.
- Tavern, Government, Temple, and People use the same scene-first CRPG hierarchy without changing underlying systems.
- No save-schema change. Save schema remains **v10**.
- Automated gate: **221/221 tests PASS**, Alpha build PASS, typecheck PASS, art-layout validation **3/3 PASS**.
- Runtime browser screenshot automation remains blocked by the environment's localhost policy; visual approval is therefore still manual.

---

## Historical implementation record

## Implemented in the 0.6C content-registry foundation

- 33 canonical ship-class/family registry.
- 565 canonical physical-content definitions across 15 categories.
- Logical asset IDs and explicit art-completion status.
- Regional economic doctrine and availability across all six runtime regions.
- Economic/content profiles for all 42 canonical settlements.
- 23,730 settlement/content availability records generated from authoritative runtime data.
- Distinct shipyard build/sell/import/repair/refit capabilities.
- Deterministic regional market generation layered over preserved live-market balance.
- Expanded commodity definitions and port-dependent equipment availability/pricing.
- Named Day-1 ships migrated to canonical class IDs.
- Seven legacy class aliases retained for old saves.
- Navigation toast moved away from lower-right voyage controls and made click-through.

## Added in Physical Distance Hotfix 1

- World atlas remains 120×80 but is canonically 20 nm per cell.
- Shared physical-distance utilities for straight-line and routed nautical miles.
- All 33 ship classes have initial `cruiseSpeedKnots` balance values.
- Player ETA/travel progression uses route distance and effective knots.
- NPC `Plan Until Interrupted` voyages use the same physical distance/ETA implementation.
- Terrain affects speed/risk without inflating physical miles.
- Floating-point sub-cell ship positions remain authoritative for separation.
- Cell-radius encounter search replaced with visibility distance in nautical miles.
- Sighting/approach state exists outside the ~6,000 yd tactical boundary.
- `ActiveEncounter.rangeYards` is authoritative; named range bands are derived UI state.
- Five-minute naval maneuver rounds change exact range from relative knots.
- Boarding requires an explicit secured/alongside state.
- Weapon/content types expose exact-range fields for later naval-content balance.
- Navigation/encounter UI displays nm, ETA, knots, and yards.
- Save migration v8 → v9 preserves grid coordinates and active-voyage progress.
- Physical-distance acceptance/regression coverage added without removing inherited tests.

## Preserved

- Fixed game-screen presentation and approved navigation-map design.
- Skeldra-only playable/traversable geography.
- Global 0.6A/0.6B historical/political data.
- Character Creator V1 identity/origin semantics and curated portraits.
- Character progression, Attunement, NPC Brain, and Plan Until Interrupted architecture.
- 0.6C regional content/economic foundation.

## Deferred

New traversable regions, full wind/current/oceanography simulation, detailed cannon-family ballistics, final fleet/item art production, full dynamic economy, broad quests, automatic succession/demographics, and polished content-management UI remain outside this hotfix.

---

## Continuation status addendum — UI Recovery + Main Identity Symbol Cleanup (2026-09-08)

The historical header above predates the later UI-recovery and equipment-normalization work. Current continuation state is **Alpha 0.6C Main Identity Symbol Cleanup**, built on the visually accepted Phase 3 Cleanup Pass 1. The broader Symbol Language Pass 1/2 identity iteration is superseded for recurring UI identity use.

- Current save schema is **v10** (v9 → v10 normalizes player/NPC equipment state).
- UI Production Architecture Recovery Phase 1/2 is complete; Inventory/Equipment and Market remain the approved gold-standard implementations.
- UI Recovery Phase 3 migrations and Cleanup Pass 1 are implemented; Cleanup Pass 1 passed manual visual inspection.
- The approved **Main Identity Symbols** package is now the sole recurring UI identity source. Identity is expressed through four channels only: **Ancestry, Religion, Homeland, and Affiliation**.
- The older live Odal/rune, civic/naval, named-ship, and other broad fallback identity marks from Symbol Language Pass 1/2 have been removed from recurring UI use and from the live runtime symbol set.
- Affiliation and religion are never invented from profession, ship type, homeland, or generic role. Unaffiliated/unreligious states remain empty, and unidentified contacts do not leak identity through symbols.
- Specialized secondary symbols remain reference material for future lore/documents/rank/service/institution-specific contexts, but they are not the default UI identity layer.
- Current automated gate after the cleanup: **186/186 tests PASS**, Alpha build/typecheck PASS, art-layout validation **3/3 PASS**, and **22/22** approved main-identity runtime derivatives decode with transparency.
- The Main Identity Symbol Cleanup is pending manual visual inspection; any later UI touch-ups should preserve the approved UI architecture and the four-channel identity system.

---

## Alpha 0.6D Phase A/B — current continuation checkpoint

The current continuation source has advanced into **Alpha 0.6D Core Experience Recovery — Phase A/B** on top of the Main Identity Symbol Cleanup baseline.

Implemented before the required manual navigation gate:

- Phase A UI/RPG audit documents,
- direct Attunement allocation removed from normal Character Creator,
- derived qualitative Arcane/Industrial specialization presentation,
- developer milestone copy removed from the normal top bar,
- voyage-first navigation operation,
- drag-to-pan chart camera,
- bounded smooth cursor-anchored zoom,
- 18×12 default navigation scale and 12×8 close scale,
- global/regional map art crossfade in one 120×80 coordinate space,
- sharp dynamic route/marker/label overlays,
- click-to-route distance/ETA/hazard presentation,
- Sail Until Interrupted,
- Search Waters,
- automatic voyage resume after resolved encounters where appropriate,
- Navigation Feel Gate Correction 1: hard-coded Ironhaven preselection removed,
- initial no-target chart view frames the known Skeldran core ports for real destination choice,
- port markers have larger invisible click targets without changing visible geometry,
- supply exhaustion is background voyage state rather than an automatic interruption,
- arrival voyage report summarizes nautical miles, elapsed time, stores used/exhausted, and net hull/sails/rigging damage,
- global atlas promoted to a lossless 3600×2400 3:2 runtime master and Skeldra chart to a lossless 4096×2926 runtime master, with the SVG dim filter removed.
- Navigation Feel Gate Correction 2: click/drag disambiguation fixed so normal clicks select ports, POIs, or navigable open water while pointer capture begins only after the drag threshold,
- Navigation Feel Gate Correction 3: Search Waters occupies a permanent first-class slot in the navigation dock, Supplies are visible in the top status bar, and route selection now shows estimated supply use/warnings alongside nautical miles and ETA.

Current save schema remains **v10**. Navigation Pass 3 adds the zero-supplies hardship foundation: zero stores never block valid sailing, morale pressure escalates gently with time, prolonged deprivation can affect crew health, leadership/respect mitigate morale loss, and repeated shortages persist for future crew consequences. Current regression gate after Navigation Pass 3: **206/206 tests PASS**, typecheck/build PASS, art-layout verification **3/3 PASS**.

`functionalStatus: PASS`

`visualStatus: PENDING MANUAL APPROVAL`

`feelStatus: PENDING MANUAL APPROVAL`

Per the Alpha 0.6D directive, **do not begin Phase C or later 0.6D phases until navigation feel is manually accepted.**
