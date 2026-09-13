# Production 1H — Complete Ship Art Wiring

Apply this overlay to Ebbing Tides commit `20f416bb4012a1d4194070e6b95d9c50595a9d16` or a direct descendant that has not independently changed the included files.

## Included

- 33 canonical ship-family combat paintings.
- 33 dedicated wrecked/sinking paintings, selected at 20% hull or below.
- Damaged presentation from 21–50% hull using the class painting plus the existing non-destructive damage treatment.
- 132 transparent 128px ship tokens: north, east, south, and west for every family.
- Navigation token facing from the selected or active route segment.
- East/west opposing tactical tokens in naval combat.
- The supplied naval-combat UI and audio polish.
- Source and compiled browser runtime files.

## Apply

Extract the ZIP into the project root and allow matching files to be replaced. Then run:

```bash
npm ci
npm run typecheck:alpha
npm run alpha:build
npm run alpha
```

No combat math, ship statistics, save schema, or navigation rules are changed.

## Verification

- TypeScript no-emit check: passed.
- Alpha browser build: passed.
- Production 1H focused tests: 11/11 passed.
- Runtime registry: 198/198 asset paths present.
- Upstream baseline contains seven already-failing legacy assertions related to later world/portrait/location changes; the same seven reproduce on untouched commit `20f416b` and are not introduced by this overlay.
