# Ebbing Tides — REAL Naval Combat Audio Wiring

Baseline:
- Git `main` verified at `c358ee003d71ad5ac18b77f79bcea1dab7ea9853`
- `src/alpha/main.ts`, browser `main.js`, `src/alpha/audio.ts`, and browser `audio.js`
  were verified byte-for-byte against that current Git baseline before this overlay was built.
- Source combat audio: the user-supplied `Ebbing_Tides_Naval_Combat_Audio_Prepared(1).zip`.

## What is now wired to actual audio files

- Naval combat scene:
  `/audio/combat/naval/naval_combat_music_loop.ogg`
- Fire Hull / Round Shot:
  `/audio/combat/naval/round_shot_volley.ogg`
- Fire Rigging / Chain Shot:
  `/audio/combat/naval/chain_shot_volley.ogg`
- Close Range / Open Range / tactical maneuver:
  `/audio/combat/naval/maneuver_crew_cue.ogg`
- Enemy firing response:
  real `command_fire.ogg` followed by real `cannon_round_shot.ogg`
- Grapple:
  real `crew_shout_hey.ogg`
- Boarding:
  existing current-Git `boarding_charge_cue.ogg`
- Victory:
  existing current-Git `naval_victory_cheer_sting.ogg`
- Defeat:
  existing current-Git `naval_defeat_explosion_sting.ogg`
- Successful surrender:
  real `crew_shout_hey.ogg`

The uploaded prepared MP3 and OGG files are included in this overlay and copied into
`public/audio/combat/naval/`.

## Important correction

The previous restoration accidentally created synthesized placeholder versions of the
naval cues. This overlay routes those naval cue names to the actual prepared files instead.

The fake synthesized hull/rigging impact follow-up cues were also removed from the naval
action routing because the supplied prepared package does not contain separate hull-impact
or rigging-impact assets. This avoids layering fake placeholder sounds on top of the real
Round Shot and Chain Shot files.

Generic UI, repair, personal-combat, page, coin, etc. procedural cues are left alone because
the supplied naval package does not provide replacements for them.

## Audio engine bug fixed

`cue()` calls `audio.unlock()` before playback. The current audio manager restarted the scene
bed every time `unlock()` was called, which could restart naval-combat music on every action.
`unlock()` now starts the scene only on the first unlock, so the combat music loop can remain
continuous while cannon and maneuver effects play over it.

## Current-Git assets used but not duplicated in this ZIP

The verified current Git baseline already contains:
- `boarding_charge_cue.ogg`
- `boarding_blades_clash.ogg`
- `boarding_melee_loop.ogg`
- `naval_victory_cheer_sting.ogg`
- `naval_defeat_explosion_sting.ogg`

This overlay references those existing current-Git files rather than replacing them.

## Mechanics

No combat math, damage, range, surrender, boarding, prize, save-schema, ship art, or navigation
movement mechanics were changed.

The accepted ~3 second v3.4 navigation timing, Production 1H ship visual routing, and dedicated
naval after-action screen are preserved.

## Apply

Extract this ZIP into the CURRENT Ebbing_Tides project root and overwrite matching files.

## Validation

- Browser `audio.js`: node syntax check PASS
- Browser `main.js`: node syntax check PASS
- `src/alpha/audio.ts`: TypeScript check PASS
- All 14 supplied MP3/OGG prepared audio files: ffprobe readable
- Static preservation check: v3.4 navigation + shipCombatVisualSet + naval after-action flow retained
