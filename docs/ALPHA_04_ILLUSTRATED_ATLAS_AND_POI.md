# Alpha 0.4 — Illustrated Atlas & Enterable POI Architecture

## Purpose

Alpha 0.3 proved the global navigation rules. Alpha 0.4 corrects the presentation boundary and makes
all map destinations extensible. The player should see an illustrated nautical chart; the simulation
should see deterministic cells.

## Hard rule: art and topology are aligned but separate

The atlas painting is never queried to decide whether a ship can move. `getWorldCell()` and A* pathfinding
own passability. The player-facing map consumes the same coordinate projection so the painted coast,
port marker, harbor approach, route trail and ship token agree visually.

The current `world_atlas_visual_dna_v04.png` is a provisional supplied reference. It can be replaced by a
later approved canonical atlas so long as that art preserves the `WORLD_ATLAS_0.4+` coordinate contract or
is accompanied by an explicit versioned migration.

## Destination contract

A destination can be:

1. **Open sea cell** — navigable coordinate; voyage ends quietly.
2. **Port** — land marker + water approach + contextual port actions.
3. **POI** — site marker/coordinate + water approach + contextual site actions.

The travel engine always routes the ship to navigable water. It never places a ship on a land marker.

## Arrival contract

- Sea: restore chart control at the selected cell.
- Port: create a canonical port-arrival event, show `You arrived at <PORT>`, then expose the port's data-driven actions.
- POI: create a canonical POI-arrival event, show `You arrived at <POI>`, then expose the POI's data-driven actions.

This is the same contract future forts, ruins, monasteries, hidden coves, wrecks, islands, monster grounds
and other enterable locations should use.

## Global expansion rule

Skeldra is the first detailed projection, not a separate level. Future regions must activate and author
cells within the same atlas rather than introducing regional teleport maps. Art can stream/pan/chunk for
performance, but positions and routes remain global coordinates.
