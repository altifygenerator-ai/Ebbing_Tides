# Ebbing Tides Alpha 0.5 — Update A

## Purpose

Update A is the non-generated-art half of Alpha 0.5. It deliberately advances production architecture before the portrait and regional-map art pass. It is built against the following active specifications:

- `Ebbing_Tides_Character_Progression_Skills_Arcana_and_Technology_System_Bible_v0.1(1).docx`
- `Ebbing_Tides_Asset_and_Content_Library_Bible_v0.1(1).docx`
- `Ebbing_Tides_NPC_Simulation_and_Character_Brain_Spec_1.0(1).docx`
- Existing Build-Start/world/map/visual authorities where not superseded by the newer specifications.

This update does **not** claim the full content breadth of those bibles. It follows their implementation contracts for every system introduced here so later content expands data rather than replaces foundations.

## Character System Foundation

- Schema version is now 5.
- Six shared attributes: Might, Agility, Perception, Intellect, Will, Presence.
- Eighteen shared core skills: Blades, Heavy Weapons, Firearms, Athletics, Seamanship, Navigation, Gunnery, Command, Engineering, Medicine, Craft, Arcana, Scholarship, Survival, Commerce, Persuasion, Deception, Streetwise.
- Skills, attributes, specializations and knowledge are separate data concepts.
- Player and persistent named NPCs use the same capability-state contracts.
- Shared deterministic check resolver supports graded outcomes and explicit modifier logs.
- Officer delegation selects the best real specialist for ship/travel actions.
- Meaningful-use skill progression includes repeated-trivial-action damping.
- Training/learning sources persist in character history.

## Arcana / Technology Vertical Slice

Initial Arcane practices:
- Read Wind
- Personal Ward
- Sense Resonance

Initial technical techniques:
- Emergency Hull Shoring
- Calibrated Sextant Method
- Precision Bore Sighting

The definitions are data-driven. Techniques validate real tools or installed systems. Arcane practices apply strain. Character, item, ship and location Attunement loads feed a first explainable interference model. Ordinary gear is not arbitrarily forbidden by alignment.

## Character Creation V1 Architecture

- Ancestry, homeland, culture, religion, sex, age, background and profession remain distinct.
- Standard creation no longer exposes the old global hair/eyes/face feature selector.
- Standard creation uses a portrait gallery backed by stable logical portrait IDs and Visual DNA.
- Detailed appearance controls exist only inside the optional Custom Portrait request path.
- Update A keeps only existing/provisional portrait references. Alpha 0.5 Update C supplies the initial generated Skeldran player portrait library.

## NPC Simulation Foundation

- Persistent NPCs have the same attributes/skills/Attunement/condition/learning foundation as the player.
- NPC brains persist goals, needs, fast state, learned patterns, current plan, next decision and simulation LOD.
- Ship-owning NPCs use **Plan Until Interrupted** rather than the old ping-pong route animation.
- Travel plans have real A* sea paths, expected completion, progress and scheduled checkpoint events.
- Food/water/money/hull/morale forecasts can interrupt unsafe plans before resources hit zero.
- Migrated at-sea actors recover into a reachable-port plan rather than freezing or teleporting.
- Simulation LOD transitions between detailed/moderate/coarse without replacing the person.
- Crew mutiny pressure derives from stored conditions rather than a disconnected random trigger.
- The Journal contains a development-only Simulation Inspector for NPC plans, needs, LOD, mutiny pressure and scheduled wakeups, plus 1-day / 7-day acceleration controls.

OpenAI remains outside routine off-screen simulation. Structured game logic owns canonical decisions and consequences.

## Navigation / Map Architecture Fix

No new generated geography is used in Update A.

- Global atlas remains one continuous coordinate system.
- Navigation camera scale is decoupled from simulation-grid scale.
- Far view: 28×18 cells.
- Default Navigation view: 18×12 cells.
- Close view: 12×8 cells.
- Grid, routes, ports, POIs, contacts, selection and ship tokens remain crisp independent overlays.
- Regional map layers use logical asset IDs and fixed global bounds.
- A dedicated Skeldra high-resolution regional-layer slot is registered now, including overlap cells and zoom bounds.
- The existing atlas temporarily fills that slot; Update B replaces the visual asset without changing collision, coordinates, routes or saves.
- Every current port and authored POI remains an enterable destination with separate marker and navigable approach logic.

## Persistence

- Local saves migrate 0.1 → 0.2 → 0.3 → 0.4 → 0.5A.
- Migration converts legacy attributes/skills into the new shared schema and restores valid NPC plan state.
- Supabase migration `0005_alpha_05a_character_npc_map_architecture.sql` adds production-shaped records for capabilities, plans, simulation events and logical assets.

## Update B Remaining

- Dedicated high-resolution Skeldra regional navigation painting aligned to the registered world bounds/passability mask.
- Initial curated/generated Skeldran player portrait library with ancestry/culture/sex/age/profession metadata.
- Integration, visual QA, final Alpha 0.5 tests and packaging.
