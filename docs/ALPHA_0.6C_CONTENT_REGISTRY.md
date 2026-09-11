# Alpha 0.6C — World Content Registry & Regional Availability Foundation

## Purpose

Alpha 0.6C takes the physical world already established by the Asset & Content Library Bible and makes it machine-readable without unlocking new playable regions or beginning the Alpha 0.7 art-production pass.

The original content-registry pass preserved the existing fixed Skeldra game shell, global geography/history foundations, Character System rules, NPC simulation architecture, and save schema v8. **Physical Distance Hotfix 1 now advances the current checkpoint to save schema v9 without changing the registry canon.**

## Canonical content registry

Runtime authority now lives in `src/data/seed/contentRegistry.ts` and shared types in `src/game/content.ts`.

### Ship classes

The registry contains **33 canonical ship classes/families** across Common, Skeldra, Asteria, Serath, Kaishin, Vespera, Outer Isles, and Explorer roles. Regional doctrine, build tags, Attunement character, art status, and logical asset references are stored separately from named ship instances.

Existing named Day-1 ships now point at canonical class IDs. Seven temporary/legacy Alpha class IDs remain resolvable through explicit aliases so older saves do not lose their ships. Physical Distance Hotfix 1 adds class-level `cruiseSpeedKnots` to this same registry rather than creating a parallel ship catalog.

### Physical content

The registry contains **565 canonical content definitions**:

| Category | Count |
| --- | ---: |
| weapon | 53 |
| firearm | 19 |
| armor | 18 |
| clothing | 55 |
| tool | 74 |
| ship_module | 61 |
| commodity | 70 |
| consumable | 25 |
| document | 31 |
| relic | 20 |
| religious_object | 40 |
| arcane_equipment | 20 |
| industrial_equipment | 20 |
| utility | 54 |
| valuable | 5 |
| **Total** | **565** |

Definitions describe what an object kind is. `ItemInstance` and existing ship entities continue to represent particular physical objects with ownership/state/history. This preserves the definition-versus-instance distinction required for future provenance, wear, repair, modification, relic formation, and inheritance systems.

## Regional and settlement availability

`src/data/seed/regionalAvailability.ts` provides:

- six runtime-region economic doctrines;
- regional availability for every content definition;
- economic profiles for all **42 canonical settlements**;
- settlement-level availability, source, price modifier, stock weight, and restrictions;
- shipbuilding, repair, refit, military-supply, Arcane, Industrial, luxury, smuggling, and religious-goods capability levels;
- market-type support;
- shipyard build/sell/import capability;
- ordinary-market and black-market inventory selectors.

The generated inspection snapshot contains **3,390 regional availability rows** and **23,730 settlement availability rows**.

### Skeldran shipyard identity

The four playable ports no longer share one conceptual shipyard:

- **Veyrholm** — royal/naval/financial center: Royal Sloops, frigates, heavy naval work, high-quality fitting and repair.
- **Ironhaven** — industrial/manufacturing/naval-engineering center: North Sea Traders, frigates, steam-assisted experimentation, heavy refits and major machinery.
- **Stormvik** — working storm-coast harbor: Fjord Cutters, fishing craft, practical traders, exploration fitting.
- **Thorenfjord** — sacred/ancestral center: small craft, local repair, ritual fittings; deliberately not a duplicate of Ironhaven.

Equivalent data structures exist for future settlements even while those regions remain non-traversable.

## Market foundation

The live Skeldran cargo markets now use deterministic, bounded regional stock generated from settlement availability instead of exposing only one universal eight-good list.

The original eight Alpha goods and their original per-port seed balance are preserved for regression compatibility. The live market is augmented up to 24 rows per playable port from the expanded 70-family commodity registry.

Regional trade signals preserve the established direction:

- Skeldra: industrial/manufactured exports; imported luxuries, fine foods, and Arcane materials.
- Asteria: wine, art, magical services, and luxury craft; imported timber, coal, and metals.
- Serath: dyes, glass, textiles, spices, manuscripts, jewelry.
- Kaishin: ceramics, silk/textiles, medicine, books, tea-equivalent goods, specialty metallurgy.
- Outer Isles: rare hardwood/mineral/Arcane/colonial supply with imported manufactured equipment.
- Vespera: broad crossroads availability without erasing local identity.

This is supply-side foundation only. Alpha 0.6C does **not** implement the full dynamic economy.

## Equipment availability

The existing playable equipment definitions are represented in the canonical content registry and retain their stable gameplay IDs. Port outfitter stock and price are now resolved through settlement availability rather than a hardcoded three-card universal shop.

Military supply matters: for example, Thorenfjord does not expose the same heavy naval breastplate or licensed naval-firearm stock as Veyrholm.

## Asset registry integration

Canonical content and ship-class definitions reference stable logical asset IDs where approved/provisional art already exists. Missing art is an explicit `artStatus: "missing"` condition and does not block gameplay or require gameplay code to know a file path.

Debug/inspection snapshots:

- `docs/generated/SHIP_CLASS_REGISTRY.json`
- `docs/generated/ITEM_REGISTRY.json`
- `docs/generated/SETTLEMENT_AVAILABILITY.json`

These generated files are inspection outputs. TypeScript source remains authoritative.

## Save compatibility

The original registry-only checkpoint remained on **v8**. The current Alpha 0.6C Physical Distance Hotfix 1 checkpoint uses **v9** because voyage distance/speed and exact encounter range can now be persistent state.

The v8 → v9 migration still performs the 0.6C compatibility normalization: temporary ship-class IDs resolve to canonical class IDs, existing market stock is preserved, and newly registered commodity rows are added only when missing. The physical-distance migration then adds cruise speed, reconstructs active voyage miles from the existing path/progress percentage, and seeds exact encounter yards without moving world coordinates.

Legacy class aliases:

- `ship_class.skeldran_coastal_sloop` → `ship_class.skeldra.fjord_cutter`
- `ship_class.skeldran_modern_battle_frigate` → `ship_class.skeldra.skeldran_frigate`
- `ship_class.skeldran_armed_merchant` → `ship_class.skeldra.north_sea_trader`
- `ship_class.refitted_coastal_raider` → `ship_class.outer_isles.privateer_sloop`
- `ship_class.skeldran_industrial_coaster` → `ship_class.skeldra.north_sea_trader`
- `ship_class.skeldran_fishing_cutter` → `ship_class.common.coastal_fishing_boat`
- `ship_class.skeldran_packet` → `ship_class.skeldra.north_sea_trader`

## Navigation notification hotfix included

The transient feedback toast that appears after **Advance 4 Hours** was moved from the lower-right action area to the upper-center beneath the top bar. It also uses `pointer-events: none`, so transient feedback cannot intercept clicks on voyage controls.

This is an implementation refinement only; the approved navigation-map layout and voyage-control architecture are unchanged.

## Strict 0.6C boundary

Still deferred to Alpha 0.7 or later:

- final art for all ~33 ship families;
- complete token fleet;
- hundreds of final item icons/equipped references;
- new traversable regions;
- full dynamic economy simulation;
- broad new quests;
- automatic succession/demographic simulation;
- polished content-management UI.

Alpha 0.7 can now consume these registries rather than requiring another content-architecture rewrite.
