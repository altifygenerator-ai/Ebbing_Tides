# Alpha 0.5D corrective — creator viewport stability

This corrective patch stays inside the Alpha 0.5D fixed-game-shell checkpoint. It does not change save schema, simulation, map geometry, portraits, progression, NPC Brain rules, economy, combat, or world state.

## Fixes

- Anchors visually hidden portrait radio controls inside their portrait cards so focus cannot expand the creator scrollport.
- Locks the creation panel to the application viewport and blocks horizontal overflow while preserving deliberate vertical form scrolling.
- Stops portrait-radio changes from rerunning the portrait eligibility filter; only sex, ancestry, culture, and religion changes trigger gallery filtering.
- Keeps creation footer content wrapping inside the bounded creator panel on shorter/wider displays.
- Replaces remaining `scrollIntoView()` interaction calls with nearest-scroll-pane movement for crew inspection and dialogue, preventing outer application-shell repositioning.

## Regression coverage

Alpha 0.5D tests now assert that portrait selection cannot create horizontal creator overflow, portrait selection does not rerun gallery filtering, the creation panel has fixed viewport height, and interaction reveals remain bounded to intentional local scroll panes.
