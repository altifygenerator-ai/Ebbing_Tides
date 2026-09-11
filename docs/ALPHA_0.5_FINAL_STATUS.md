# Ebbing Tides — Alpha 0.5 FINAL STATUS

Status: **Alpha 0.5 FINAL — Alpha 0.5 Update E accepted and verified**

Alpha 0.5 established a production-shaped vertical slice of Ebbing Tides rather than a disposable prototype. Skeldra is the first developed regional slice, while the underlying character, navigation, persistence, asset, knowledge, and NPC foundations are designed for later world expansion through data/content rather than replacement systems.

## 1. Playable world/navigation foundation

- Continuous global coordinate space with Skeldra as the first populated slice.
- Hidden land/water/passability geometry remains simulation authority.
- Ships cannot route through land; ports use navigable approach cells.
- Click/route/travel flow supports ports, POIs, and open-water destinations.
- Current enterable ports: Veyrholm, Ironhaven, Stormvik, Thorenfjord.
- Current authored POIs include Greywater Wrecks and Old Veyr Beacon.
- High-resolution registered Skeldra regional art sits beneath independent crisp grid/route/token/label overlays.
- Camera supports regional/navigation/close zoom plus pan/recenter without changing world coordinates.
- Fixed voyage/action dock keeps navigation controls on-screen.
- Whole-page gameplay scrolling is disabled; intentional panels handle local overflow.

## 2. Character creation and identity

Standard creation is curated-portrait-first rather than a normal face/hair/eye paper-doll flow.

Character identity separates:

- ancestry
- `homelandRegion`
- `homeSettlementId`
- culture
- religion
- sex
- age
- background
- profession
- `startingLocationId`

**Homeland/home settlement and starting location are independent.** A character may, for example, be Asterian from Asterra while beginning the current campaign in Veyrholm. Current playable starts remain restricted to implemented Skeldran ports; origin-only records for established non-Skeldran anchor cities do not make those regions playable.

Creator output, player spawn, starting ship spawn, starting knowledge, campaign history, persistence, and UI now respect this separation.

## 3. Portrait and Visual DNA architecture

- Curated portraits use stable logical IDs and persistent Visual DNA metadata.
- Portrait matching is ranked by ancestry, sex, age band, culture, homeland, profession, religion, and background.
- Current weights: ancestry 100, sex 100, age band 40, culture 30, homeland 20, profession 20, religion 15, background 10.
- Sex is the current hard identity filter for the available curated player pool; other fields rank rather than zero the pool.
- Missing regional libraries degrade gracefully. Visual DNA remains canonical even when final regional art is pending.
- The existing Skeldran/Northwestern player pool is the first regional library; Asterian, Serathi, Kaishin/Eastern and other libraries remain future art-content work using the same registry/creator logic.
- Optional custom portrait generation remains optional, server-side, cached, and separate from standard creation.

## 4. Character/progression foundation

- Six attributes: Might, Agility, Perception, Intellect, Will, Presence.
- Eighteen canonical core skills with aligned character-sheet presentation and explanatory tooltips.
- Specializations, knowledge, conditions, relationships/history boundaries, learned Arcane/technical abilities.
- Shared check/delegation model lets qualified officers perform specialist ship/travel work.
- Meaningful-use skill growth with anti-grind damping and training/learning sources.
- Life Experience/Experience Level is a breadth-of-life milestone only; the world does not scale to player level.
- Development Points steer believable existing lines of development rather than creating expertise from nowhere.
- Contextual talents affect situations they logically apply to instead of stacking universal percentage bonuses.
- Named persistent NPCs use the same underlying capability definitions as the player.

## 5. Arcane / Industrial foundation

- Arcana and Engineering can coexist; neither skill is forbidden by alignment.
- Arcane Strain persists.
- Arcane/Industrial Attunement is shown as a prominent bidirectional meter with legible consequences.
- Character/item/ship/location load/interference foundations exist.
- Initial Arcane practices and Industrial techniques are data-driven and have real requirements/costs.

## 6. Crew and NPC foundation

- Named crew/officers persist and can be inspected/talked to aboard ship.
- Crew capabilities matter through delegation.
- NPC voyages use persistent Plan Until Interrupted records and event/checkpoint reevaluation rather than full-brain polling every tick.
- Simulation LOD, resource forecasting, mutiny-pressure foundations, and development state exist without implementing full Character Brain V1.

## 7. Persistence

Current save schema: **v7**.

Alpha 0.5E migration rule from v6:

```text
old homePortId
    -> homeSettlementId = old homePortId
    -> startingLocationId = old homePortId
```

This preserves the exact behavior of existing saves while new saves store origin and spawn independently. The legacy field is removed after migration. The same semantic migration applies to legacy custom-portrait request data. Local and cloud snapshot load paths use the migration boundary.

## 8. Presentation/art foundation

- Fixed game/application shell rather than scrolling webpage presentation.
- Skeldra regional navigation art is replaceable independently of simulation coordinates/saves.
- Portrait/map assets use stable logical IDs and provenance/status metadata.
- Dedicated waist-up player portraits are separated from broader NPC/event/reference art.
- Skeldra is the developed art/content anchor; future cultures attach through the same systems.

## 9. Alpha 0.6 boundary

Alpha 0.5E intentionally does **not** implement:

- genealogy or dynasty databases
- historical wars/offices database
- births, marriages, deaths or generational simulation
- full Character Brain V1
- new playable regions
- major economy expansion
- full ship-library expansion
- major new UI screens
- major new quest frameworks

These remain future work. The planned next milestone after Alpha 0.5 acceptance is **Alpha 0.6A — Calendar + Historical World Database Foundation**.

## 10. Freeze verification

Alpha 0.5 Update E has passed:

- v6->v7 migration tests
- origin != starting-location tests
- portrait ranking/fallback tests
- creator defaults and serialization/reload tests
- full inherited regression suite
- Alpha TypeScript typecheck
- standalone Alpha build
- fresh-package playable HTTP smoke verification

Detailed verification results, including fresh-package checks, are recorded in `BUILD_VERIFICATION_ALPHA_05E.md`. **Alpha 0.5 is frozen at this checkpoint.**
