# Alpha 0.6D Navigation Hotfix 2 — Non-blocking Voyage Automation

Audited basis: current `src/alpha/main.ts` / browser ESM runtime.

## Root cause addressed

The UI-level `runVoyageUntilAttention()` called `sailUntilInterrupted()` once. The latter is intentionally synchronous and can execute up to 240 simulation steps before returning. At the current default two-hour step, that is up to 480 in-game hours of world simulation inside a single browser event turn.

The first pathfinding hotfix reduces the work performed inside those steps. This second hotfix addresses the remaining browser responsiveness problem by chunking the same voyage automation across animation frames.

## Semantics preserved

- Existing `sailUntilInterrupted()` remains unchanged.
- Existing 240-step overall safety limit remains unchanged.
- Arrival, encounter, failure, weather and voyage-report semantics remain intact.
- The runtime still uses browser ESM.
- No naval combat code is touched.

## UI behavior added

- Immediate chart repaint when automation begins.
- Six voyage simulation steps per browser chunk.
- Browser frame yielded between chunks.
- Chart/camera refresh every twelve simulation steps.
- Guard against duplicate `begin-navigation` activation.
- Stale runner exits when the global campaign state is replaced or the voyage is stopped.

## Files modified by the installer

- `src/alpha/main.ts`
- `public/alpha/js/alpha/main.js`

The installer refuses to continue if the audited anchors do not match exactly, which is preferable to silently patching the wrong build.
