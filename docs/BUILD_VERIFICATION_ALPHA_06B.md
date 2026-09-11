# Alpha 0.6B Build Verification

Checkpoint: **Alpha 0.6B — Dynasties, Genealogy, Offices, Reigns & Claims**

## Scope verified

- global political/genealogical history population while only Skeldra remains traversable
- six canonical ruling houses: Vaering, Marcellan, Valerian, Asharan, Tenrai, Darcon
- explicit non-dynastic/elected handling for Blackhaven and Rhadessa
- explicit genealogy relationships and genealogy query helpers
- person / office / office-term separation retained
- authored claim records without automatic succession resolution
- preservation of unknown accession dates where canon is silent
- expanded historical integrity validation
- seed-only Supabase migration 0009
- save schema remains v8
- inherited Alpha 0.5/0.6A gameplay behavior preserved

## Automated verification

Final development-tree gate:

- `npm run typecheck:alpha` — PASS
- `npm run alpha:build` — PASS
- `npm test` — PASS, **107/107 tests**
- `git diff --check` — PASS
- merged `HISTORICAL_WORLD_SEED` — PASS, no validation issues

Merged world-seed counts at verification:

- historical characters: 67
- relationships: 82
- houses: 6
- offices: 8
- office terms: 15
- claims: 19
- events: 9
- event links: 4
- institutions: 0
- wars: 0
- battles: 0
- treaties: 0
- historical ships: 1
- ship ownership records: 1
- ship command records: 1
- historical sources: 2
- historical interpretations: 2

The zero war/battle/treaty additions are intentional: 0.6B is the dynasty/genealogy/office/claim population pass, not a broad conflict-history pass.

## SQL migration safety

`supabase/migrations/0009_alpha_06b_dynasties_genealogy_offices_claims.sql` was regenerated from the compiled TypeScript 0.6B seed and checked for the 0.6A Supabase failure mode.

Verified properties:

- seed-only migration
- no `ALTER TABLE`
- begins a transaction and defers FK checks
- explicitly sets deferred constraints immediate before commit
- uses world-scope-aware records
- preserves elected/non-hereditary office semantics
- intended to run after the corrected 0008 Alpha 0.6A migration
- no save-schema migration in 0.6B

## Standalone playable smoke

Served with the standalone Alpha server and verified HTTP 200 for:

- `/alpha/`
- `/alpha/js/alpha/main.js`
- `/alpha/js/data/history/dynasties.js`
- `/alpha/js/data/history/worldSeed.js`
- `/alpha/js/game/history/genealogy.js`
- `/alpha/js/game/history/politics.js`
- `/alpha/js/game/history/validation.js`

Served page title verified as:

`Ebbing Tides — Alpha 0.6B — Dynasties, Genealogy, Offices, Reigns & Claims`

## Optional Next.js wrapper

`npm run build` was attempted separately. It cannot execute in this extracted development environment because the local `next` executable/dependencies are not installed (`next: not found`). This does not affect the authoritative standalone Alpha path, which typechecks, compiles, tests and serves successfully.

## Scope boundary verified

0.6B does not implement automatic succession, births, marriages, deaths, demographic/generational simulation, full historical wars, full historical ship population, inherited Day-1 history knowledge, production dynasty/timeline UI, or new traversable regions.
