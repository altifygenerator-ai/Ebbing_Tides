# Apply R2

1. Start from the accepted A0.3C project with the R2 Readiness Review gate applied.
2. Extract this overlay into the project root, preserving paths and replacing matching files.
3. Install dependencies if needed: `npm install`.
4. Run:

```powershell
npm run typecheck:alpha
npm run alpha:build
npm test
npm run alpha:art-layouts
```

Expected verification for this package:

- TypeScript: PASS
- Alpha build: PASS
- Full tests: 457/457 PASS
- Dedicated R2: 15/15 PASS
- R2 readiness gate: 8/8 PASS
- Combined A0.1B/A0.1C/readiness/R2 durability + cohesion: 36/36 PASS
- Art layouts: 2/2 PASS
- Save schema: v12

Useful browser checks:

- ordinary commodities still trade normally;
- controlled goods explain the current law instead of silently failing;
- Government exposes trade papers / commissions when appropriate;
- controlled cargo on arrival produces a concise customs choice;
- black-market actions only appear when the captain/local context supports them;
- no customs action should teleport an unobserved crime into an instant distant warrant;
- a commission should require a real live privateering authorization and should cease to authorize targets when that policy ends.
