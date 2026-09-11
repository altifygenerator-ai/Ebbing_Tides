# Apply A0.3B1 — Creator & Interaction UX Lock

Base: accepted working A0.3B (`0.6.0-alpha.d.a0-3b`) including Main Menu Shell 1.3.  
Result: `0.6.0-alpha.d.a0-3b1`, save schema v12.

1. Extract this overlay into the project root and allow matching files to be replaced.
2. Install dependencies if needed: `npm install`.
3. Run:

```powershell
npm run typecheck:alpha
npm run alpha:build
npm test
npm run alpha:art-layouts
```

Expected automated result for this package: 403/403 tests PASS, dedicated A0.3B1 10/10 PASS, art layout 2/2 PASS.

## Manual browser check before locking

- Character Creator → Attributes / Skills: confirm attribute controls are compact and clicking anywhere on a skill row selects/deselects it cleanly.
- Character Creator → Review: confirm the starting toolbox and exact choice effects fit cleanly, are readable, and do not feel cluttered.
- Market: set Grain quantity to 10 and Buy/Sell multiple units when money, stock and hold space allow it.
- Scroll down within Market, Ship, Captain or another long same-screen pane; perform an in-screen action and confirm the pane stays at the same scroll position.
- Ship Overview in port: confirm Supplies and Repair show live costs; damaged Hull/Sails/Rigging and Supplies expose the small `+` shortcuts when the action is available.
- Confirm the `+` shortcuts produce the same result as the normal bottom Supplies/Repair buttons.
- Navigate to a genuinely different screen/subscreen and confirm normal screen navigation still behaves normally.

This pass intentionally needs a quick manual runtime look because it tightens interaction geometry. It is not the final art-acceptance pass.
