# Ebbing Tides Alpha 0.6D — Naval Combat Presentation + Mechanics Cleanup Pass 1

**Package:** `0.6.0-alpha.d.naval1`  
**Base required:** accepted Alpha 0.6D Crew Mechanics Pass 2 (`0.6.0-alpha.d.crew2`, save schema v11)  
**Manual visual acceptance:** **PENDING USER REVIEW**

## Scope completed

This pass implements the naval-combat work ordered by the Alpha 0.6D complete development handoff without reopening accepted Navigation, contextual-location, arrival-hub, crew, identity-symbol, or world-atlas work. Mutiny remains deferred.

### Presentation architecture

- Naval combat is now a **Hybrid / Art-Skinned Dynamic UI** rather than a 492×289 full-screen ArtDirectedCanvas.
- Code owns the dynamic combat geometry: ship panels, status values, engagement range, action controls, and combat report.
- Art owns only the tactical sea environment, actual ship illustrations, and restrained skinning.
- The obsolete 492×289 `ui.combat.naval_encounter.runtime` image remains only as legacy/reference evidence and is no longer in the live ArtDirectedCanvas registry.
- New reusable environment asset: `/art/ui/combat/skeldra_tactical_sea_stage.svg`, 1920×900, with no baked ships, names, buttons, values, or sample combat state.
- Actual registered ship-class inspection art is rendered dynamically for the player and identified enemy.

### Combat hierarchy

The live screen now presents, in order:

1. Naval engagement header + current round / elapsed tactical time.
2. Player ship left, engagement range center, enemy ship right.
3. Hull, Sails, Rigging, Crew, Morale, and Firepower for each visible combatant.
4. Large action band for Close, Open Range, Fire Hull, Fire Rigging, Repair, Demand Surrender, Grapple/Board, and Flee as valid.
5. Battle Report with **newest action rendered first**. Canonical `encounter.log` storage remains chronological.

The entire combat page owns overflow when required. The battle-report history has its own bounded history scroll. No whole-screen art-scale variable is used by the new naval combat layout.

## Mechanics cleanup

### Naval specializations

The shared check system already supported specialization ratings, but naval actions were not passing the relevant specialization name. This pass wires the action to the intended specialization explicitly:

| Naval action | Specialization |
| --- | --- |
| Fire Hull / Fire Rigging beyond 300 yd | `Long-Range` |
| Repair | `Naval Machinery` |
| Demand Surrender | `Naval Discipline` |
| Close / Open Range / Flee / Grapple | `Heavy Weather` |

The enemy gunnery turn also requests the appropriate naval specialization when its captain has one.

### Probability audit

A read-only `navalCombatActionChance()` audit helper was added so representative checks can be tested without consuming combat rounds. The existing d100 formulas remain the baseline; no blind global probability buff was applied.

Representative probabilities at **700 yd versus Ash Gull (maneuverability 4)** with no perk, preparation, or specialization bonus:

| Crew | Character skill | Crew mod | Fire Hull | Fire Rigging | Close/Open | Flee |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Green | Low (30 / attr 4) | -2 | 5% | 2% | 7% | 3% |
| Green | Medium (58 / attr 6) | -2 | 39% | 33% | 41% | 37% |
| Green | High (78 / attr 8) | -2 | 65% | 59% | 67% | 63% |
| Regular | Low | +1 | 8% | 2% | 10% | 6% |
| Regular | Medium | +1 | 42% | 36% | 44% | 40% |
| Regular | High | +1 | 68% | 62% | 70% | 66% |
| Veteran | Low | +3 | 10% | 4% | 12% | 8% |
| Veteran | Medium | +3 | 44% | 38% | 46% | 42% |
| Veteran | High | +3 | 70% | 64% | 72% | 68% |

Current accepted default build, before learning a gunnery specialization:

- 250 yd: Fire Hull 52%, Fire Rigging 46%, Close 43%, Flee 39%.
- 700 yd: Fire Hull 48%, Fire Rigging 42%, Close 43%, Flee 39%.
- 1200 yd: Fire Hull 44%, Fire Rigging 38%, Close 43%, Flee 39%.
- Adding an example `Long-Range +8` specialization changes the default 700 yd Fire Hull chance from **48% to 56%**, confirming the specialization gap is fixed and produces the intended exact +8 contribution.

**Tuning decision for Pass 1:** retain the verified base difficulty constants for manual feel testing. The matrix has a clear low/medium/high and Green/Regular/Veteran gradient, high-skill crews reach roughly 65–72%, and the corrected specializations/perks can now push competent builds upward. The default mid-game values are still sufficiently uncertain that manual combat feel should be checked before changing the global d100 difficulty constants.

### Physical combat model preserved

- Exact yard distance remains authoritative.
- Close/Open movement still converts real relative knots to yards over a 5-minute round.
- Range bands are synchronized from exact yards rather than teleported between bands.
- Fire beyond 1,500 yd remains disabled for the current battery baseline.
- Sails/rigging damage continues to reduce condition speed and therefore maneuver/escape performance.
- Existing damage, repair, grapple, flee, surrender, victory/defeat, prize-share, crew-casualty/reaction, and voyage-resume paths remain in place.
- Save schema remains **v11**; no persistent state was added.

## Automated QA gate

Completed after the refactor:

- `npm run typecheck:alpha` — **PASS**
- `npm test` — **255/255 PASS** (baseline 248 plus 7 dedicated naval cleanup tests)
- `npm run alpha:build` — **PASS**
- `npm run alpha:art-layouts` — **PASS (2 layouts, 0 failures)**

The art-layout count is intentionally 2 rather than the prior 3 because naval combat no longer belongs in ArtDirectedCanvas. The two exact-anchored equipment layouts remain.

Dedicated naval tests cover:

- newest-first player-facing report rendering;
- dynamic Hybrid markup and removal of the old mapped naval canvas;
- readable responsive action sizing and page scroll ownership;
- 1920×900 ship-free tactical environment art contract;
- actual naval specialization contribution;
- 2–98 probability bounds;
- exact-yard/range-band synchronization;
- sails/rigging damage affecting handling speed.

## Manual acceptance checklist

This pass is **not visually complete until the user approves it in the live game**. Inspect at normal browser zoom at:

- 1920×1080
- 1600×900
- 1440×900
- 1366×768

Confirm that ships are visually prominent and crisp, range + yards are obvious, Hull/Sails/Rigging/Crew/Morale are readable, buttons are comfortable to operate, the tactical backdrop does not compete with the ships, the newest report is always at the top, and no unwanted miniature inner UI has returned.
