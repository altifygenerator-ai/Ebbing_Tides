# Ebbing Tides — Alpha 0.5 Update E Build Verification

Date: 2026-09-07  
Package target: `0.5.0-alpha.update-e`  
Purpose: Alpha 0.5 cleanup/finalization only; no Alpha 0.6 scope.

## Acceptance results

### Origin / starting-location separation — PASS

- `CharacterCreationChoices` stores `homelandRegion`, `homeSettlementId`, and `startingLocationId` independently.
- Home settlement is validated against homeland region.
- Starting location is validated against currently implemented playable ports independently of homeland.
- Player current port and starting ship position use `startingLocationId`.
- Origin history and home familiarity use `homeSettlementId`.
- Initial market observation and campaign-begin location use `startingLocationId`.
- Targeted Asterra -> Veyrholm regression test passes.

### Save schema v7 / migration — PASS

Current save schema: **7**.

v6 compatibility rule:

```text
old homePortId
  -> homeSettlementId = old homePortId
  -> startingLocationId = old homePortId
```

Legacy `homePortId` is removed after migration. Legacy custom-portrait request data receives the same semantic migration. Local and Supabase snapshot load paths both pass through `migrateSaveData()`.

Targeted local migration, local serialize/reload, and mocked cloud snapshot reload tests pass.

### Curated portrait matching — PASS

Portrait ranking weights:

```text
ancestry    100
sex         100
age band     40
culture      30
homeland     20
profession   20
religion     15
background   10
```

- Current hard identity filter is sex plus portrait eligibility/status.
- All other metadata ranks rather than excludes.
- Unbuilt Asterian/Serathi combinations still return ranked same-sex options without rewriting character ancestry.
- Creator retains pending-regional-art behavior and independent Visual DNA.
- Optional custom portrait route remains optional/server-side.

### Character creator semantic cleanup — PASS

- Homeland is labeled as origin and explicitly does not determine campaign start.
- Home settlement is the character's personal origin within the selected homeland.
- Starting location is explicitly labeled **Where your campaign begins**.
- Existing default remains Skeldran / Veyrholm origin / Veyrholm start.
- Standard creator remains curated-portrait-first; no normal face/hair/eyes selector was reintroduced.

### Regression / source verification — PASS

Commands completed successfully:

```text
npm run typecheck:alpha  -> PASS
npm run alpha:build      -> PASS
npm test                 -> PASS, 71/71
```

No existing tests were removed to achieve the result. Existing Alpha 0.1-0.5D regression tests remain in the suite and targeted Alpha 0.5E tests were added.

### Standalone playable HTTP smoke — PASS

Served with:

```text
PORT=3128 node scripts/serve-alpha.mjs
```

Verified:

```text
/alpha/                              HTTP 200
/alpha/js/alpha/main.js              HTTP 200
/alpha/styles.css                    HTTP 200
/alpha/js/data/seed/origins.js       HTTP 200
/alpha/js/game/portraits.js          HTTP 200
```

Served document title: **Ebbing Tides — Alpha 0.5 Update E — Finalization**.

## Optional Next.js wrapper note

The repository includes Next.js wrapper scripts, but the extracted checkpoint does not vendor/install the `next` executable. `npm run build` therefore cannot be verified in this container and reports `next: not found`. The authoritative standalone Alpha build (`alpha:build`) compiles and serves successfully and is the packaged playable path. This is a non-blocking wrapper/dependency-environment issue, not an Alpha simulation/build regression.

## Scope check — PASS

Alpha 0.5E did not add genealogy, dynasty/history databases, historical wars/offices, births/marriages/deaths, generational simulation, full Character Brain V1, new playable regions, economy expansion, ship-library expansion, major new UI screens, or major new quests.

Origin-only settlement records are identity/schema compatibility data for already-established world anchors; they do not enable those regions for travel or gameplay.

## Fresh-package verification — PASS

Both deliverable ZIPs were tested after packaging.

```text
Playable ZIP integrity                 PASS
Full-Git ZIP integrity                 PASS
Fresh playable typecheck              PASS
Fresh playable alpha:build            PASS
Fresh playable tests                  71/71 PASS
Fresh playable /alpha/                 HTTP 200
Fresh playable compiled main module   HTTP 200
Fresh playable CSS                    HTTP 200
Full-Git working tree                 CLEAN
```

The fresh served title is **Ebbing Tides — Alpha 0.5 Update E — Finalization**.

## Freeze readiness — PASS

All Alpha 0.5E standalone acceptance gates and fresh-package checks are satisfied. This checkpoint is suitable to freeze as **Alpha 0.5 FINAL** and hand off to **Alpha 0.6A — Calendar + Historical World Database Foundation**.
