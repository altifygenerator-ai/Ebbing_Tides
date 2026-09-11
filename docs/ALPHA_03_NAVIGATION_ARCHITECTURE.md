# Alpha 0.3 Navigation Architecture — Global Rule

## One atlas, not regional maps

Ebbing Tides uses one continuous world-coordinate grid. Skeldra is only the first detailed viewport.
Future Asterian, Vesperan, Serathi, Eastern, Ardaran, Outer Isles, and Western Ocean geography must
be authored into the same atlas. UI may stream or pan regional art/data, but simulation coordinates
never teleport between independent regional maps.

Current implementation atlas: `WORLD_ATLAS_0.3`, 120 × 72 cells. The physical nautical scale remains
balance-provisional; coordinate identity/topology is the important persistent contract.

Reserved future atlas cells are blocked until their real coastline and sea geometry are authored.
This is intentional: the engine must never invent a straight open-water route through geography that
has not been established yet.

## Cell truth

Every coordinate resolves to a `WorldMapCell` with:

- terrain type;
- navigability;
- movement cost;
- region;
- known hazards;
- active/reserved development status.

Land and atlas-void cells are not ship-navigable. Coastal water, deep sea, and implemented hazard
cells can be navigable with different movement costs.

## Ports and POIs

A coastal location has two concepts:

1. `point`: the painted/map marker location, which may be land and therefore impassable;
2. `approachPoint`: the navigable water cell where a ship actually arrives/docks.

Clicking a port selects the port destination but pathfinding ends at `approachPoint`. A ship never
occupies the land marker. Future coastal POIs use the same approach-node rule.

## Course plotting

Selecting a valid sea cell, port, or POI creates a `NavigationTarget`. `findSeaPath` uses weighted A*
across navigable cells and prevents diagonal corner-cutting through land. The generated path is stored
on `VoyageState` and rendered as the visible plotted trail.

Travel advances canonical world time along that exact path. The ship's position interpolates along
path segments between time steps. Weather, detection, encounters, supplies, and future contextual
hazards may interrupt the voyage without destroying the plotted route.

Persistent NPC traffic uses the same sea-valid route geometry. Last-known player intelligence remains
a snapshot; the hidden vessel can continue moving after observation.

## Arrival rules

### Empty ocean

When the final target is a normal sea cell:

- voyage ends;
- ship remains at that global coordinate;
- no forced encounter or arrival modal is created;
- chart control returns immediately so another destination can be selected.

### Port / destination

When the target is a port:

- ship stops at the harbor approach cell;
- `currentPortId` is set;
- canonical arrival history is recorded;
- an `ArrivalState` opens the location-specific arrival screen.

Actions come from the actual destination definition rather than a universal menu. Current Skeldran
ports already distinguish royal/admiralty, industrial council, local crown hall, sacred hall, markets,
taverns, religious institutions, people, and harbor/shipyard access.

## Map-art rule

The painted chart is presentation over coded topology. Coastlines, land blocking, port approaches,
routes, ship positions, and destination interaction may never be inferred from decorative pixels.
Future map art must be composed against the atlas geometry and the approved Ebbing Tides navigation
map visual DNA: illustrated nautical chart, restrained square grid, small functional ship tokens,
route trail, contextual selection panel, compact status bar, readable CRPG interface.
