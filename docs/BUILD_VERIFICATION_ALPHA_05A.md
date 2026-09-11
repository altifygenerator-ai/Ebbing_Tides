# Build Verification — Alpha 0.5 Update A — 2026-09-06

Checkpoint: **0.5.0-alpha.update-a**

## Verified commands

- `npx --yes tsc -p tsconfig.alpha.json --noEmit`
- `npx --yes tsc -p tsconfig.alpha.json`
- `node --test tests/*.test.mjs`
- standalone server `node scripts/serve-alpha.mjs`
- HTTP smoke of `/alpha/`

## Result

- Typecheck: PASS
- Standalone Alpha compile: PASS
- Automated suite: **36/36 PASS**
- Standalone HTTP response: **200 OK**

## Test coverage includes

- Alpha 0.1–0.4 regression spine and save migration.
- Six canonical attributes and 18 canonical skills shared by player and persistent named NPCs.
- Identity separation and Visual-DNA-backed logical portrait selection.
- Deterministic graded checks and specialist delegation.
- Meaningful-use progression / anti-grind damping.
- Arcane Strain and explainable Attunement/interference behavior.
- Real equipment/system requirements for technical techniques.
- NPC Plan Until Interrupted behavior and simulation LOD.
- 18×12 default map camera separated from world coordinates.
- Registered regional art layers and unchanged port/POI enterability.
- Existing economy, contracts, naval/personal combat, travel and Character Mind boundaries.

## Environment note

The standalone dependency-free Alpha is the verified runnable target for Update A. The optional Next.js wrapper was not rebuilt in this packaging environment because its local package installation was not present; this does not affect the standalone `/alpha/` build contained in the playable package.

## Update B

Generated regional-map and portrait art remains intentionally outside this checkpoint.
