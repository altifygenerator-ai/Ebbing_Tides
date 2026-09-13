# Ebbing Tides Alpha 0.6D — Navigation Pathing Performance Audit / Hotfix

## Symptom
Long voyages outside the original Skeldra proving-ground can make the browser appear frozen for a noticeable period before the navigation screen updates.

## Confirmed scaling problem
The sea pathfinder used an A* open set stored in a `Map`, then linearly scanned the entire open set on every search iteration to find the lowest score.

The expanded world now gives NPC routine planning many more candidate ports. `chooseRoutineDestination()` asks `findSeaPath()` about every candidate port, so long voyages that advance enough simulation time to make NPCs re-plan can trigger many expensive route searches.

## Hotfix
`src/game/navigation.ts` and the browser ESM build now:
- use a binary min-heap for A* open-set selection;
- cache static world-cell lookups used by routing;
- retain up to 2,048 directed route results using a bounded recency cache;
- cache unreachable directed routes to avoid repeated expensive retries;
- return cloned paths so callers cannot mutate cached route data;
- preserve the existing terrain costs, diagonal no-corner-cut rule, path semantics, and navigation API.

No naval combat, encounter, economy, NPC decision weights, route costs, or world coordinates are changed.

## Validation
- Browser ESM file passes `node --check`.
- TypeScript syntax was checked with TypeScript 5.8.3; the isolated file reports only the expected unresolved-import errors when checked outside the repository.
- A 120×80 synthetic obstacle-grid comparison completed the same 80 long routes with both algorithms; heap A* reduced the uncached benchmark from about 1080 ms to about 539 ms in this environment. Repeated real game routes additionally benefit from the new route cache.

## Additional audit findings (not changed by this hotfix)
1. `sailUntilInterrupted()` is synchronous and can process as many as 240 voyage steps in one UI event. Extremely long voyages can still block the browser while deep simulation advances. If the pathfinder fix does not make the experience sufficiently responsive, the next fix should chunk voyage automation across animation frames.
2. The chart's clickable sea-cell SVG generation still references `SKELDRA_DEVELOPED_BOUNDS`. That is stale after world expansion. It affects open-water chart interaction outside Skeldra, but naively drawing all 9,600 atlas cells would be the wrong fix; visible-camera cells should be generated instead.
3. The 240-step voyage automation safety limit is 480 in-game hours at the current 2-hour step. A very slow or badly damaged vessel can hit that guard before arrival. This should remain a visible resumable stop rather than looking like a crash.

## Merge safety
This hotfix only replaces:
- `src/game/navigation.ts`
- `public/alpha/js/game/navigation.js`

It is intentionally isolated from the naval-combat work occurring in parallel.
