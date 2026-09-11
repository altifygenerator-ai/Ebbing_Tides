# Main Menu Shell Pass 1.3 — Runtime Bridge Hotfix

Apply this on top of the current Alpha 0.6D A0.3A project that already has Main Menu Shell Pass 1 / 1.1 / 1.2.

## What this fixes

The old menu handoff still depended on timing between two independent browser modules. Pass 1.1 could do nothing while waiting for an in-game New button that does not exist during pre-game boot. Pass 1.2 removed that wait, but it could dismiss the menu before the large `main.js` module graph had actually finished rendering Character Creator, exposing an empty Alpha shell / blue background.

Pass 1.3 replaces both timing assumptions with one explicit launch bridge owned by the established Alpha runtime.

- `main.ts` announces when the runtime and Character Creator are ready.
- Until that announcement, New Voyage and Continue stay disabled instead of failing silently.
- New Voyage asks the existing runtime to reset/render Character Creator.
- Continue asks the existing runtime to load the existing local save.
- The start menu closes only after the runtime returns a successful result.
- A failed Continue keeps the menu open and shows the failure instead of dropping into an empty screen.

## Architecture boundary

This is a launcher/presentation integration hotfix. It does not change game mechanics, save schema, economy, law, NPC simulation, progression, combat, navigation, crew systems, port-service A0.3A rules, or world simulation.

`src/alpha/startMenu.ts` still imports no gameplay owner. The existing `src/alpha/main.ts` remains the sole owner of Character Creator and local-save transitions; Pass 1.3 only gives the menu a safe DOM-event request/result bridge into those already-existing operations.

## Apply

Copy the overlay contents into the project root and replace matching files, then run:

```powershell
npm run typecheck:alpha
npm run alpha:build
npm test
npm run alpha:art-layouts
```

Expected verification for this package: 378/378 tests passing and 2/2 art-layout checks passing.

Hard-refresh the browser once with `Ctrl+F5` after applying so the new compiled menu/runtime modules are loaded.

Package version remains `0.6.0-alpha.d.a0-3a`. Save schema remains v12.
