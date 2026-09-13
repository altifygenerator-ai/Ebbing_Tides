# Ebbing Tides — Navigation Movement Restore after Production 1H.2 Naval/Audio Recovery

This overlay is specifically rebuilt on top of the uploaded:
`Ebbing_Tides_Production_1H_2_Git_Baseline_Naval_Audio_Recovery_OVERLAY(1).zip`

It restores the accepted navigation presentation baseline without replacing the newer
Production 1H.2 naval/audio recovery architecture.

Restored behavior:
- non-blocking voyage automation
- camera follows Tideworn without resetting the player's zoom
- canonical Tideworn pristine ship painting
- exact Tideworn north/east/south/west 128px navigation tokens
- heading changes as the plotted path turns
- requestAnimationFrame continuous interpolation along the actual plotted route
- token image preloading
- camera follows the interpolated visual position
- final accepted visual pacing: ~3 second target for a normal long voyage
- double-start voyage guard

Preserved from Production 1H.2 recovery:
- shipCombatVisuals family system
- newer naval combat presentation/resolution
- naval/audio recovery changes
- styles/audio files (this package does not overwrite them)

Files this overlay replaces:
- src/alpha/main.ts
- public/alpha/js/alpha/main.js
- src/data/seed/assets.ts
- public/alpha/js/data/seed/assets.js

Important:
- The uploaded Production 1H.2 recovery did NOT replace `src/game/navigation.ts`, so the
  earlier pathfinding-performance hotfix should still be present if it was already applied.
- It also did not replace `src/game/createGame.ts`; the earlier canonical Tideworn asset IDs
  should therefore still be present if v3.1 had already been applied.
- Do NOT extract the old Camera Follow or Pathing hotfix ZIPs over this newer recovery state;
  those older packages contain full-file snapshots from an older code state.

Apply:
Extract this ZIP directly into the Ebbing_Tides project root and allow these four files to overwrite.

Validation performed while packaging:
- browser `main.js`: `node --check` PASS
- browser `assets.js`: `node --check` PASS
- confirmed newer `shipCombatVisuals` references remain
- confirmed newer `leave-naval-resolution` flow remains
