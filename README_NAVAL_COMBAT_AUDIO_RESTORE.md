# Ebbing Tides — Naval Combat Audio Restoration

Built specifically on top of:
1. Production 1H.2 Git-Baseline Naval/Audio Recovery
2. the accepted Navigation Movement Restore v3.4 from this chat

This restores the richer naval feedback layer that had regressed into generic `cannon` / `ui` cues.

## Restored combat cues

- Close / Open Range / Flee: naval maneuver / sails / hull-motion cue
- Fire Hull: distinct round-shot cannon report
- Fire Rigging: distinct chain-shot cannon / whip-metal report
- Successful hull hit: wood/hull impact
- Successful rigging hit: rigging/chain impact
- Enemy broadside: separate distant enemy-cannon report
- Enemy hit on Tideworn: hull impact after the enemy report
- Enemy closing: maneuver cue
- Grapple success: grapple / hook / line impact
- Boarding: crew-clash / boarding cue
- Repair: repair cue
- Successful surrender demand: surrender / struck-colors cue
- Player naval victory: victory stinger
- Player naval defeat: defeat stinger
- Boarding victory from personal combat also triggers the naval victory stinger

All of these are procedural Web Audio effects. No missing external combat WAV/OGG package is required.

## What this does NOT change

- no naval combat math changes
- no range / damage / surrender / boarding / prize changes
- no save-schema changes
- no ship art changes
- no navigation movement changes
- no ambient music / location ambience changes

## Files replaced

- `src/alpha/audio.ts`
- `public/alpha/js/alpha/audio.js`
- `src/alpha/main.ts`
- `public/alpha/js/alpha/main.js`

These files are based on the exact current recovery + navigation-restored state from this chat so the newer naval resolution screen, shipCombatVisuals system, and accepted navigation interpolation remain intact.

## Validation performed while packaging

- `node --check public/alpha/js/alpha/audio.js` — PASS
- `node --check public/alpha/js/alpha/main.js` — PASS
- standalone TypeScript check of `src/alpha/audio.ts` with DOM/ES2022 libs — PASS
- confirmed accepted v3.4 navigation timing remains present
- confirmed `shipCombatVisualSet` remains present
- confirmed `leave-naval-resolution` remains present

## Apply

Extract this ZIP into the Ebbing_Tides project root and overwrite the four matching files.

Then test one combat:
1. Close/Open Range
2. Fire Hull
3. Fire Rigging
4. Grapple
5. Board
6. Win once by naval fire or surrender
7. Confirm the victory stinger plays only when resolution is first created
