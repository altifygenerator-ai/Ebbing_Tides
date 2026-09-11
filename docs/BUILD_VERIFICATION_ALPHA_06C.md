# Alpha 0.6C Build Verification

Checkpoint: **Alpha 0.6C — World Content Registry & Regional Availability Foundation**

Package version: `0.6.0-alpha.c`

Save schema: **v8** (unchanged)

Starting source: accepted **Alpha 0.6B Geography Canon Hotfix 1** playable package supplied for this development pass. The supplied playable package did not contain `.git`; the delivered Git checkpoint therefore reconstructs a two-commit local lineage from the supplied baseline rather than claiming to preserve the unavailable original Git history.

## Final gates

- `npm run typecheck:alpha` — **PASS**
- `npm run alpha:build` — **PASS**
- `npm run alpha:registry` — **PASS**
- `npm test` — **124 / 124 PASS**
- standalone HTTP served smoke — **PASS**
- Alpha 0.6C HTML label — **PASS**
- compiled `contentRegistry.js` served — **PASS**
- toast click-through CSS served — **PASS**
- `git diff --check` on reconstructed baseline → 0.6C changes — **PASS**

The inherited baseline was 113 / 113 tests. Alpha 0.6C adds 11 targeted registry/availability/compatibility/UX tests. Two older regression tests were updated only where they intentionally asserted the former current package label/version; their structural assertions remain intact.

## Registry counts

- canonical ship classes/families: **33**
- canonical content definitions: **565**
- canonical settlement economic profiles: **42**
- regional availability rows: **3,390**
- settlement availability rows: **23,730**
- live cargo commodity definitions: **75** (70 canonical families plus preserved compatibility/balance IDs)
- legacy ship-class aliases: **7**

### Content definitions by category

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

## Compatibility

No save-schema bump was required. Schema-v8 loads normalize temporary ship class IDs through explicit aliases. Existing saved market rows are retained as-is; new 0.6C commodity rows are only inserted when missing.

Current gameplay item IDs remain stable and are represented in the generalized canonical registry.

## Navigation hotfix

The transient voyage/event toast has moved from fixed lower-right placement to upper-center below the top bar. `pointer-events: none` ensures it cannot block the **Advance 4 Hours** button or any other control while visible.

## Scope boundary confirmed

Alpha 0.6C does not unlock new traversable regions, regenerate the approved navigation presentation, implement a full dynamic economy, build automatic political succession/demographics, or perform the Alpha 0.7 art-production sweep.

## Changed-file manifest

Authoritative source / configuration / documentation:

- `README.md`
- `package.json`
- `public/alpha/index.html`
- `public/alpha/styles.css`
- `scripts/generate-alpha-06c-registry-artifacts.mjs`
- `scripts/serve-alpha.mjs`
- `src/alpha/main.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/data/seed/commodities.ts`
- `src/data/seed/contentRegistry.ts` (new)
- `src/data/seed/items.ts`
- `src/data/seed/regionalAvailability.ts` (new)
- `src/game/content.ts` (new)
- `src/game/createGame.ts`
- `src/game/inventory.ts`
- `src/game/marketGeneration.ts` (new)
- `src/game/types.ts`
- `src/services/localSave.ts`
- `tests/alpha-05-update-d.test.mjs`
- `tests/alpha-05-update-e.test.mjs`
- `tests/alpha-06c-content-registry.test.mjs` (new)
- `docs/ALPHA_0.6C_CONTENT_REGISTRY.md` (new)
- `docs/BUILD_VERIFICATION_ALPHA_06C.md` (new)
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/generated/SHIP_CLASS_REGISTRY.json` (new generated inspection output)
- `docs/generated/ITEM_REGISTRY.json` (new generated inspection output)
- `docs/generated/SETTLEMENT_AVAILABILITY.json` (new generated inspection output)

Compiled Alpha outputs changed/added under `public/alpha/js/` for the corresponding TypeScript modules, including source maps.
