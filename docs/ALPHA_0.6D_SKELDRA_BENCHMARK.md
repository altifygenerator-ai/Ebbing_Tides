# Alpha 0.6D — Skeldra Core Experience Benchmark

## Status

- `functionalStatus: PASS (automated baseline)`
- `visualStatus: PENDING MANUAL`
- `feelStatus: PENDING MANUAL`
- `funStatus: PENDING MANUAL`

## Automated functional chain

`tests/alpha-06d-skeldra-benchmark.test.mjs` proves one coherent stateful loop rather than isolated screen stubs:

1. create a captain with no direct Attunement allocation,
2. begin in Veyrholm,
3. use background/profession to read the port differently,
4. identify and accept a real state-derived delivery opportunity,
5. buy the required cargo,
6. leave harbor,
7. deliberately stop in open water,
8. use Search Waters as a real time-consuming sea action,
9. re-plot the destination,
10. Sail Until Interrupted / arrival,
11. arrive at Ironhaven,
12. fulfill the persistent obligation for a real economic/progression consequence,
13. receive a named-NPC response that differs because of the captain build.

The same underlying systems retain physical nautical distance, world time, supplies, persistent markets, NPC simulation, knowledge, history and save state.

## Human benchmark still required

Automated success does **not** prove the intended 30–60 minute experience is fun. Manual play must still judge:

- immediate comprehension,
- map drag/zoom feel,
- marker clarity,
- port flow,
- pacing of interruptions,
- usefulness of Search Waters,
- whether build consequences feel natural rather than test-like,
- whether ship/trade/combat presentation feels like Ebbing Tides rather than software modules,
- desire to sail again.

## Required manual visual matrix

Capture and inspect at:

- 1920×1080
- 1600×900
- 1440×900
- 1366×768

Scenes:

- Navigation default / far / close,
- selected route,
- Search Waters result,
- Veyrholm contextual port,
- Character,
- Ship,
- Market,
- NPC interaction,
- Naval encounter.

The current execution environment did not provide a reliable live Chromium capture path, so screenshot evidence is deliberately **not fabricated** and remains part of manual acceptance.
