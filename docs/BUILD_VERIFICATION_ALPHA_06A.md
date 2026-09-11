# Alpha 0.6A Build Verification

Checkpoint: **Alpha 0.6A — Calendar + Historical World Database Foundation**

## Verification summary

- Alpha TypeScript check: **PASS** (`npm run typecheck:alpha`)
- Standalone Alpha compile: **PASS** (`npm run alpha:build`)
- Full inherited + 0.6A tests: **PASS — 91/91** (`npm test`)
- Standalone HTTP smoke: **PASS** on port 3060
  - `/alpha/` -> 200
  - `/alpha/js/game/time/calendar.js` -> 200
  - `/alpha/js/data/history/seed.js` -> 200
  - `/alpha/js/game/history/validation.js` -> 200
  - `/alpha/js/game/history/runtimeAdapter.js` -> 200
  - `/alpha/js/types/history.js` -> 200
- Served title: **Ebbing Tides — Alpha 0.6A — Historical Foundation**
- Save schema: **v8**
- 0.5E v7 migration: **PASS**, converted from authoritative `absoluteHour`

## Scope verification

0.6A establishes the shared calendar/history architecture only. It does not add the 0.6B genealogy population, succession simulation, birth/marriage/death simulation, demographic simulation, history encyclopedia UI, family-tree UI, or broad world-history population.

The canonical validation seed remains deliberately small and exists only to prove the schema and validation behavior. First-class history records carry explicit authored/simulated provenance, and the SQL schema uses composite world-scope foreign keys for relational integrity.

## Optional Next.js wrapper

`npm run build` was attempted separately and could not execute because this extracted checkpoint does not contain an installed `next` executable (`sh: next: not found`). The wrapper is optional to the standalone Alpha path and was not changed structurally by 0.6A. The authoritative standalone Alpha TypeScript build, test suite, and HTTP serving path all pass.

## Package verification

Fresh-extraction verification is performed after packaging and recorded in the release handoff.
