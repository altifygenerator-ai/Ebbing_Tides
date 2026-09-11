# Alpha 0.6C Hotfix 7 — Art Integration & UI Consistency Report

## Scope

This pass applies the permanent Ebbing Tides Art-First UI & Presentation Rule selectively to player-facing systems where it provides a meaningful presentation gain. Existing systems that were already visually coherent—especially the navigation map—were preserved rather than redesigned.

## Supplied packages audited

### Canonical package

The complete canonical package was audited. In the downloadable checkpoint, identical PNGs are deduplicated: production-selected canonical art is represented by its exact runtime copy; source-only alternates/reference sheets are retained under `public/art/source-supplement/` as high-quality WebP at the original pixel dimensions. `public/art/SOURCE_PACKAGE_COVERAGE.json` records the mapping and representation type. Canonical location/environment assets are preferred when both canonical and approved alternatives exist.

Runtime location aliases were created for available canonical/approved art so game code references stable semantic paths rather than source-package folder structures.

### Approved package

The complete approved package was audited and receives the same deduplicated visual-source coverage described above. Approved art is used when it is suitable and is not superseded by a more authoritative canonical anchor.

### Candidate package

The three exploratory candidate UI mockups are preserved under `public/art/library/candidate-reference/` but are intentionally **not** wired into runtime production screens. They remain reference material only.

### Ability/status icon package

The complete supplied icon package is preserved under `public/art/ui/ability-library/`. Relevant icons are used in character ability/status and knowledge presentation so those interfaces no longer depend solely on generic text/card treatment.

### Named ship token package

The complete package is preserved under `public/art/ships/tokens/`. Canon-locked named ships are assigned their supplied tokens. Widow's Mercy and Gilded Knife remain available in the library but are not forced into live canonical ship data because their classes were not yet canon-locked in the supplied manifest.

### Separated prop package

The complete prop package is preserved under `public/art/props/`. Appropriate props are used in player-facing port/institution/tavern presentation, including dock cargo/rope/lantern elements, government/customs/notice-board elements, and religious/tavern scene dressing.

## Location art integrated

Stable runtime art aliases exist for available supplied art including:

- Skeldra: Veyrholm, Ironhaven, Stormvik, Old Veyr Beacon, Greywater Wrecks
- Outer Isles: Greywater, Port Meridian, Blackhaven, Ardaran, Saltwake, Saint Corren, Redhook, Gullreach, Black Cape, Western Deep, Widow's Passage
- Asteria: Asterra, Thalassa, Aurelia, Korinthos, Delphara, Rhadessa, Myrine, Eirenos, Thalassor's Teeth
- Vesperan/Serathi/Eastern anchors currently supplied: Vespera, Tyras, Nagara

These aliases do **not** make those regions physically playable. They are presentation/content-library groundwork only until their runtime geography is developed.

## Player-facing screens upgraded

### POI arrival/site

Supplied POI art now drives the presentation layer where available. The world atlas is no longer used as the visual substitute for those POIs when dedicated environment art exists.

### Ship Management

Uses `public/art/ui/presentation/ship_management_base.png` as the empty composition. Dynamic overlays populate the ship presentation, status/damage information, refit/module area, cargo area, first-mate/command information and available actions.

### Naval Encounter

Uses `public/art/ui/presentation/naval_encounter_base.png`. Player ship, opponent, exact range, range state, log and actions remain dynamic overlays. Existing physical-distance and combat mechanics are unchanged.

### Market

Uses `public/art/ui/presentation/market_base.png`. Commodity/pricing/cargo information remains dynamic and readable while living inside an illustrated exchange/ledger composition.

### Crew Roster

Uses `public/art/ui/presentation/crew_roster_base.png`. Named persistent characters are visually distinct from aggregate crew counts and remain connected to their character/companion inspector.

### Journal / Intelligence

Uses `public/art/ui/presentation/journal_base.png`. Knowledge, rumors, ship intelligence, obligations and history are dynamic. Supplied knowledge-state iconography is used where applicable. Developer-only Simulation Inspector remains code-first by design.

### Character Creator

Uses `public/art/ui/presentation/character_creator_base.png` as the visual foundation while preserving Character Creator V1 logic and field separation. The creator's dynamic fields remain code-driven.

### Captain / Companion Equipment

The prior male/female art-first equipment implementation is retained. Equipment slots and inventory grid remain coordinate-mapped overlays on the base assets; character sex selects the appropriate template. Named companions use the reduced equipment slot set.

## Systems intentionally not redesigned

- navigation-map architecture and route overlays
- global/world simulation
- economy calculations
- save serialization
- NPC brain/state simulation
- pathfinding
- character progression rules
- contract logic
- physical-distance travel rules

The pass changes presentation, not the underlying canonical mechanics.

## Remaining art gaps

1. **Thorenfjord establishing art** — highest-priority location gap because Thorenfjord is already playable.
2. **Named NPC portraits** — needed for fuller People, Dialogue and Crew presentation.
3. **Dedicated institution/interior art** — taverns, government offices, temples and shipyards can become stronger art-first scenes as actual interiors are produced.
4. **Personal/boarding combat final composition** — intentionally held until mechanics stabilize enough to author the correct production layout rather than prematurely locking the wrong geometry.

No unrelated asset was substituted merely to hide these gaps.
