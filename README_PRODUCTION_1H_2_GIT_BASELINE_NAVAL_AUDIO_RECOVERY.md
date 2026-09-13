# Production 1H.2 — Git-Baseline Naval Combat + Audio Recovery

Apply this overlay to the current project root. It supersedes Production 1H.1 and may be applied either after the original Production 1H ship-art overlay or over a project where 1H.1 was already installed.

## Authoritative baseline

- Public Git remote: `altifygenerator-ai/Ebbing_Tides`
- Baseline commit: `20f416bb4012a1d4194070e6b95d9c50595a9d16`
- Existing Naval Combat Pass 1 mechanics and event handling remain authoritative.
- Save schema remains v12.

## Preserved from Git

- exact-yard combat range and physical Close/Open movement;
- Fire Hull and Fire Rigging targeting;
- Crew Seamanship/Gunnery and naval-specialization contribution;
- Repair, surrender, grapple, boarding, flee, victory/defeat, prize, casualty, crew-reaction, and voyage-resume paths;
- newest-first battle report;
- cannon, repair, blade, pistol, hit, bell, UI, and navigation cue definitions and naval-action routing.

## Corrections retained from 1H.1

- all 33 Production 1H ship families registered in the runtime asset table;
- corrected north/east/south/west token orientation and route-based map facing;
- opposed combat tokens in one rectangular tactical lane;
- removal of circular token plaques, mirrored enemy portrait, duplicate ornamental framing, and portrait movement by range;
- intact, damaged-treatment, and wrecked visual thresholds;
- explicit after-action screen before returning to the chart or resuming a voyage.

## Audio recovery

All cues now wait for the browser's user-gesture audio unlock before playback. This prevents the first cannon, repair, or interface cue from being silently discarded while the audio context is still suspended.

## Deferred victory disposition

The proposed **Destroy Vessel** option is still intentionally deferred. Persistent named-character survival/death, witnesses, reputation, rescue, prize consequences, and one-time vessel lifecycle resolution must be implemented together rather than deleting NPC records directly.

## Verification

- Alpha TypeScript no-emit check: passed
- Alpha compiled runtime build: passed
- Original Naval Combat Pass 1 plus 1H.2 preservation checks: 13/13 passed
- Package checksums and ZIP integrity: verified
