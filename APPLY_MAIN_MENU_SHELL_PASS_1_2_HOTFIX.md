# Main Menu Shell Pass 1.2 — New Voyage Handoff Hotfix

Apply this tiny hotfix **on top of Main Menu Shell Pass 1 + Pass 1.1**.

## What was actually wrong

Pass 1.1 made `New Voyage` wait for an in-game `[data-action="new-game"]` control when it could not immediately see Character Creator. That is the wrong contract for the pre-game shell. `main.js` already owns and renders Character Creator during boot, and because `main.js` has a much larger module graph than the menu module, the menu can become interactive first. In that short window there is neither a creator DOM node nor an in-game New button, so Pass 1.1 simply returned and the menu appeared dead.

## Fix

`New Voyage` now always performs the pre-game handoff:

1. starts fading/stopping menu music;
2. dismisses the start-menu overlay unconditionally;
3. leaves `main.js` as the sole owner of Character Creator/game state;
4. if Character Creator is already present, focuses the Captain Name field;
5. if it is still loading, a short-lived `MutationObserver` waits for the existing creator to appear and then focuses it.

It does **not** click the in-game New Campaign action and does not touch `src/alpha/main.ts` or any game mechanic.

## Files changed

- `src/alpha/startMenu.ts`
- compiled `public/alpha/js/alpha/startMenu.js`
- menu regression test only

No `src/game/*`, saves, economy, law, A0.2D, NPCs, progression, navigation, combat, crew, or world-simulation files are touched.

After applying, hard-refresh the browser once (`Ctrl+F5`) so the updated menu module is definitely loaded.
