# Alpha 0.6D — Navigation Experience Canon

Status: **Phase B functional baseline incorporated into the broader 0.6D core-recovery baseline. Final visual/feel approval remains manual.**

## Core interaction

Normal travel is:

**CLICK DESTINATION → ROUTE APPEARS → DISTANCE / ETA / KNOWN HAZARD → SAIL → AUTO-ADVANCE UNTIL ATTENTION**

The player operates voyages, not simulation ticks.

## Camera model

The chart has continuous camera state:

- current center (`x`, `y`),
- target center (`targetX`, `targetY`),
- current view width,
- target view width.

Rendering updates the SVG `viewBox` through `requestAnimationFrame` interpolation. Normal drag/zoom does not rebuild the full application tree every pointer move.

### Interaction

- Primary pan: **left-click + drag** chart.
- Click/drag threshold: **7 px** before a pointer operation becomes a drag.
- Cursor: grab / grabbing; markers remain selectable on ordinary clicks.
- Mouse wheel / trackpad wheel: smooth bounded zoom, anchored around cursor position when practical.
- Secondary accessibility controls:
  - Arrow keys / WASD: pan,
  - `+` / `=`: zoom in,
  - `-`: zoom out,
  - `0`: recenter on player ship.
- Small `+ / - / recenter` controls remain available. Directional pan buttons do not.

## Zoom bounds / levels of detail

The camera is deliberately bounded; this is not a GIS interface.

- Close minimum: **12 world cells wide** (~12×8 at 3:2).
- Default navigation: **18 cells wide** (~18×12).
- Medium regional context: continuous values between default and far.
- Far strategy: **120×80**, the complete canonical atlas.
- Hard maximum: **120 cells wide** (full-world extent).

No arbitrary rotation, 3D tilt, unlimited zoom or layer-management UI is part of normal navigation.

## Multi-resolution art

All map art registers to the same canonical:

- 120×80 global world space,
- 20 nautical miles per world cell.

Global atlas art remains underneath at all times. Registered higher-resolution regional art shares global bounds and becomes visually authoritative at closer zoom.

Current crossfade policy:

- regional opacity `0` at view width ≥ 38,
- regional opacity `1` at view width ≤ 30,
- linear transition between 38 and 30.

Regional imagery never creates a second gameplay coordinate system.

## Sharp functional overlays

The following stay dynamic SVG/UI overlays rather than baked map pixels:

- grid,
- plotted course,
- player token,
- known contact tokens,
- ports,
- POIs,
- selected destination state,
- labels,
- hazards/reef hints.

This keeps route/label/marker geometry crisp as art layers change underneath.

## Marker and label LOD

Current hierarchy:

- Veyrholm and Ironhaven: major-port treatment.
- Other ports: smaller port marker.
- POIs: nautical diamond treatment.
- Known contacts: small contact marks; unidentified contacts remain uncertain.
- Selected destination: dedicated outer ring.

Label policy:

- Far: suppress ordinary-port and POI labels; major ports remain.
- Medium: suppress non-selected POI labels.
- Navigation/close: useful known port/POI labels display.
- Selected destination label remains visible regardless of LOD.

This is the first implemented hierarchy and remains subject to manual feel/legibility tuning.

## Route selection

Clicking a known destination immediately:

1. selects it,
2. produces a selection ring,
3. runs canonical pathfinding from the player ship,
4. shows routed nautical-mile distance,
5. shows estimated voyage duration,
6. shows a compact known-hazard summary,
7. exposes one primary **Sail** action.

Routine travel has no separate Plot Route → Confirm Route → Start Travel sequence.

## Physical voyage model

- World cell scale: **20 nautical miles**.
- Ship speed remains in **knots**.
- ETA is derived from canonical route distance, ship capability and existing travel modifiers.
- Player-facing route copy favors useful approximation rather than every internal multiplier.

## Sail Until Interrupted

`Sail` creates/uses the existing voyage plan, then the player-facing operation advances the deep simulation in controlled steps until attention is required.

During automation the existing systems continue to advance:

- ship movement,
- world clock,
- supplies,
- weather,
- NPC travel/plans,
- market/world simulation cadence,
- encounter detection.

Routine weather is recorded/applied without automatically opening a new prompt merely because a simulation tick occurred.

Current stop conditions include:

- arrival,
- encounter requiring player decision,
- explicit player stop,
- safety guard / impossible continuation.

When supplies reach zero, the voyage continues; progressive crew hardship is handled underneath and summarized rather than becoming a routine voyage stop.

When an encounter resolves without ending the voyage, the UI automatically resumes the voyage plan rather than requiring a separate manual time-advance sequence.

## Search Waters

`Search Waters` is a deliberate at-sea operation, not a tick button.

Current default commitment: **3 hours**.

It advances world time/supplies and combines existing navigation/perception/specialist state with visibility conditions to produce an observation envelope.

Possible current result categories:

- ship sighting,
- POI discovery/sign,
- wreckage,
- smoke,
- signs of traffic,
- nothing actionable.

A ship result creates a real strategic sighting encounter at physical nautical-mile distance rather than teleporting directly into tactical combat.

## Sighting → tactical encounter

Strategic sighting range remains measured in nautical miles. Once vessels close inside tactical engagement distance, the encounter displays exact yards plus the readable range band:

- Distant
- Long
- Medium
- Close
- Grapple
- Boarding

Exact physical distance remains authoritative underneath.

## Performance requirement

Normal camera drag and wheel zoom mutate the chart viewBox/layer opacity through animation-frame camera state. They do not call `renderGame()` on every pointer movement.

Manual approval must reject:

- visible judder,
- delayed marker following,
- sticky drag threshold,
- oversensitive zoom,
- ugly regional layer popping.

## Current gate

Automated functional status: **PASS**.

Visual status: **PENDING MANUAL REVIEW**.

Feel status: **PENDING MANUAL REVIEW**.

The user explicitly directed continuation into the remaining 0.6D reset/re-centering work after Navigation Pass 3. Navigation remains subject to final manual visual/feel acceptance as part of the complete milestone.
