# Build Verification — Alpha 0.4 — 2026-09-06

Checkpoint: **0.4.0-alpha.1**

## Commands verified

```bash
npm run typecheck:alpha
npm run alpha:build
node --test tests/*.test.mjs
```

All pass.

## Automated regression result

**25 / 25 tests passing.**

Coverage includes:

1. Alpha 0.2 systems retained inside Alpha 0.4.
2. Equipment purchase/equip history.
3. Persistent ship refits with time/cost/capability mutation.
4. Last-known intelligence remaining stale while hidden ships move.
5. AP/stance/equipment personal combat.
6. Boarding and persistent body-part injuries.
7. Alpha 0.1 save migration all the way through schema v4.
8. Global-atlas rule retained from Alpha 0.3.
9. Port markers blocked as land and approaches navigable as water.
10. A* courses never entering land and terminating at harbor water.
11. Open-water plotting and quiet empty-sea arrival.
12. Port arrival and place-specific actions.
13. Persistent NPC traffic staying on navigable water.
14. 120 × 80 illustrated global atlas plus 12 × 8 navigation viewport.
15. Every current port being an enterable destination.
16. POIs using the same target/arrival architecture as ports.
17. All authored Skeldran POIs reachable without crossing land.
18. Alpha 0.3 map positions migrating into Alpha 0.4 atlas coordinates.
19. Deterministic same-seed world facts/prices.
20. State-derived Veyrholm → Ironhaven grain opportunity.
21. Trade mutation of money/cargo/market/knowledge/history.
22. Persistent accepted contracts.
23. Time-advancing voyage with encounter continuity and port arrival.
24. Naval combat against persistent ship systems.
25. Character Mind lore firewall and engine-owned canonical effects.

## Rendering verification

The final checkpoint is also smoke-tested through the standalone HTTP server and a local headless Chromium
render. This verifies that the illustrated atlas asset, compiled modules and Alpha UI are served together
rather than treating a compile-only pass as visual verification.

## Remaining external integration limits

- Live Character Mind provider calls require configured server credentials.
- Supabase account/auth/RLS remains outside the zero-config standalone Alpha runtime.
- The production Next.js wrapper remains available but is not required to run the standalone Alpha.
