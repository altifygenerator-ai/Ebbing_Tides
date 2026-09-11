# Ebbing Tides — Main Menu Shell Pass 1.3 Runtime Bridge

## Failure being corrected

The pre-game start menu and Alpha runtime were loaded as separate browser modules. Earlier fixes tried two different implicit handoffs:

1. wait for/click an in-game New Campaign control; or
2. simply remove the menu and assume Character Creator was already rendered beneath it.

Both approaches had a timing hole because the Alpha runtime has a much larger module graph than the presentation shell. Depending on load timing, the first approach could find no control and do nothing, while the second could remove the menu before `main.ts` had finished booting and expose an empty shell.

## Runtime contract

Pass 1.3 adds three presentation-level DOM events:

- `ebbing-tides:runtime-ready`
- `ebbing-tides:launch-request`
- `ebbing-tides:launch-result`

The Alpha runtime publishes readiness only after `renderCreation()` has completed. It also mirrors readiness / local-save availability on `document.documentElement.dataset` so the menu cannot miss the ready signal if `main.js` finishes first.

The menu sends a request with a request ID and mode (`new` or `continue`). The Alpha runtime performs the transition through the same existing functions used by the in-game controls and sends one result for that request. The menu fades away only after `ok: true`.

## Ownership

- Character/game state remains owned by `src/alpha/main.ts`.
- Save loading remains owned by `src/services/localSave.ts` and the existing main runtime path.
- Start-menu music/settings remain owned by `src/alpha/startMenu.ts`.
- No new GameState field or save schema is introduced.
- No gameplay subsystem is duplicated.

## Regression behavior

The existing in-game New button and creator Continue Save button now call the same internal transition helpers used by the launcher bridge, removing duplicate reset/load code without changing their behavior.
