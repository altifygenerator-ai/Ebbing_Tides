# Ebbing Tides Alpha 0.6D — Main Menu Shell Pass 1.1 Hotfix

Apply this **after Main Menu Shell Pass 1**.

## Fix

`New Voyage` now explicitly hands off to the established Alpha `data-action="new-game"` control whenever the start-menu shell is sitting over an already-active campaign. The existing game runtime remains the sole owner of clearing the active campaign state and rendering Character Creator.

If Character Creator is already present behind the shell, `New Voyage` simply closes the menu as before.

If the existing New Campaign confirmation is cancelled, the start menu stays open rather than disappearing onto the old campaign screen.

## Architecture boundary

This hotfix changes only the start-menu presentation module and its compiled browser output. It does **not** alter:

- `src/alpha/main.ts`
- `src/game/*`
- save services or schema
- law / A0.2D work
- economy
- NPC simulation
- progression
- combat
- navigation
- crew systems

The menu still delegates new-campaign state ownership to the existing game runtime instead of implementing its own reset logic.

## Files

- `src/alpha/startMenu.ts`
- `public/alpha/js/alpha/startMenu.js`
- `tests/alpha-06d-main-menu-shell-pass1.test.mjs`

## Verification

- TypeScript alpha typecheck: PASS
- Alpha compile: PASS
- Full automated suite: 221/221 PASS
- Art-layout verification: 3/3 PASS
