# Prepared Naval Combat Audio

These files were prepared from the six user-supplied MP3 assets.

## Suggested game hooks

- `naval_combat_music_loop` — start when naval combat opens; loop beneath combat.
- `round_shot_volley` — play when a Round Shot action resolves.
- `chain_shot_volley` — play when a Chain Shot action resolves.
- `maneuver_crew_cue` — play when Open Range / Close Range resolves.
- `crew_shout_hey`, `command_fire`, `cannon_round_shot` — separated components for alternate or enemy cues.

## Mixing notes

- Combat music was lowered so commands and weapon effects remain readable.
- Round Shot uses the supplied FIRE command followed by the cannon.
- Chain Shot layers the cannon, a quieter pistol-like crack, and selected chain-metal sections.
- Game code should still apply the existing master/SFX/music volume settings.
- Add a short cooldown so repeated clicks cannot stack several cues.

## Source filenames retained for attribution/reference

- freesound_community-men-shouting-hey-6376.mp3
- universfield-male-shouting-fire-259681.mp3
- universfield-cannon-shot-352459.mp3
- mrfriends-pistol-shot-233473.mp3
- freesound_community-metal-chain-7056.mp3
- cyberwave-orchestra-dramatic-orchestral-combat-music-loop-382814.mp3

Verify and retain any attribution/license information associated with the original downloads.
