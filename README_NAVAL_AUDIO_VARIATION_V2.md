# Naval Audio Variation Hotfix v2

Apply AFTER:
`Ebbing_Tides_Current_Git_REAL_Naval_Combat_Audio_Wiring_OVERLAY.zip`

Changes:
- First player Fire Hull / Round Shot in each naval encounter:
  `round_shot_volley.ogg` (the full FIRE + volley cue).
- Later player Fire Hull / Round Shot actions in that same encounter:
  `cannon_round_shot.ogg` (plain cannon report, no repeated FIRE command).
- Enemy cannon fire:
  `cannon_round_shot.ogg` only, so the FIRE command is not repeated every enemy turn.
- Chain Shot remains the prepared `chain_shot_volley.ogg`.
- Maneuver crew cue now plays about 42% of the time instead of every Close/Open/Flee maneuver.
- Grapple "hey" accent plays about 68% of successful grapple cues.
- Surrender "hey" accent plays about 50% of the time.
- Victory/defeat, boarding, combat music, chain shot, and all mechanics are unchanged.

The chance variation is presentation-only and does not affect simulation/save determinism.

Files replaced:
- src/alpha/audio.ts
- public/alpha/js/alpha/audio.js
- src/alpha/main.ts
- public/alpha/js/alpha/main.js

Validation:
- browser audio.js syntax PASS
- browser main.js syntax PASS
- src/alpha/audio.ts TypeScript PASS
- v3.4 navigation timing preserved
- naval after-action flow preserved
