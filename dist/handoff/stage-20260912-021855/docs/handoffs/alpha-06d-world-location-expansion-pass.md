# Ebbing Tides Alpha 0.6D — World Locations Expansion Pass

## Scope

This pass deliberately expands the navigable world and regional port presentation without changing ship-combat mechanics or redesigning the established town UI model.

The existing town structure remains authoritative:

- arrival / settlement hub
- market
- tavern
- harbor / shipyard
- government
- religion
- people / contacts

Each page still places its painted contextual scene above the existing mechanics/content.

## World activation

The runtime now exposes all 49 canonical world locations:

- 42 settlements / ports
- 7 maritime POIs

All atlas regions are enabled for sea routing. Every port and POI has a navigable approach point, and a strict no-corner-cut connectivity check from Veyrholm passed for all 49 destinations.

### Skeldra
Veyrholm, Ironhaven, Stormvik, Thorenfjord, Hrafnvik, Bjornhavn, Kaldstrand, Runeskar, Old Veyr Beacon.

### Greywater Coast / Outer Isles
Greywater, Port Meridian, Ardaran, Blackhaven, Saltwake, Saint Corren, Redhook, Gullreach, Greywater Wrecks, Black Cape, Western Deep, Widow's Passage.

### Asterian Sea
Asterra, Thalassa, Aurelia, Korinthos, Delphara, Rhadessa, Myrine, Eirenos, Thalassor's Teeth.

### Vesperan Strait
Vespera, Pelasion, Southwatch, Lantern Key.

### Serath
Aurel, Antiochara, Tyras, Japhra, Safir, Qasirah.

### Kaishin / Eastern Approaches
Kaishin, Tenzan, Nagara, Hanzhou, Ryosen, Shido, Linhai, Kuroseki, Spiral Maw.

## Town presentation / regional reskin

Skeldra keeps its existing complete category-specific contextual scene set for Arrival, Market, Tavern, Harbor, Government, Temple, and People.

For the newly activated regions, the town mechanics and page hierarchy remain unchanged, but the top contextual painting now resolves from the actual port/region instead of borrowing Skeldran art.

- Asterian towns use their supplied Asterian establishing paintings where available.
- Outer Isles / Greywater towns use their supplied port-specific frontier/privateer paintings where available.
- Vespera uses the supplied Vesperan establishing painting; Pelasion, Southwatch, and Lantern Key use it as a regional fallback until their own paintings are supplied.
- Serathi ports use the supplied Tyras painting as the regional fallback where a unique port painting was not supplied.
- Kaishin ports use the supplied Nagara painting as the regional fallback where a unique port painting was not supplied.
- Secondary Skeldran ports without a unique supplied establishing painting use an existing Skeldran fallback.

No uploaded package contained separate Asterian / Outer Isles / Vesperan / Serathi / Kaishin Market, Tavern, Government, Temple, People, or Harbor category paintings. This pass therefore uses the correct port/regional establishing painting on those subpages rather than silently inventing art or reusing Skeldran scenes. Those top paintings can be replaced later without changing the underlying town mechanics.

## Regional institutions

New ports retain the existing government/religion page mechanics but receive region-appropriate first-pass institutions and labels:

- Skeldra: Crown / harbor authority and Old Gods institutions
- Asteria: civic magistracies and Pantheon temple districts
- Vesperan Strait: strait / customs authority and mixed temple / chapel / shrine districts
- Serath: royal / provincial authority and Covenant institutions
- Kaishin: imperial magistracies and Turning Wheel temples / monasteries
- Outer Isles: harbor / free-captain councils and practical sailors' shrines / chapels

## Existing-save compatibility

When an existing campaign is continued, the runtime now:

- merges all newly active known ports into `knownPortIds`
- merges all newly active POIs into `knownPoiIds`
- initializes local standing for newly activated ports
- creates any missing regional market states from the existing regional availability/economy model

A new save receives the same activation immediately after character creation.

## Art imported in this overlay

Unique supplied paintings were wired for:

- Asterra
- Thalassa
- Aurelia
- Korinthos
- Delphara
- Rhadessa
- Myrine
- Eirenos
- Thalassor's Teeth
- Greywater
- Port Meridian
- Ardaran
- Blackhaven
- Saltwake
- Saint Corren
- Redhook
- Gullreach
- Greywater Wrecks
- Black Cape
- Western Deep
- Widow's Passage
- Vespera
- Tyras
- Nagara

The pass uses canonical/approved art only; candidate art was not promoted into runtime presentation.

## Intentionally unchanged

- Naval combat and ship-combat mechanics
- Existing town interaction/mechanics model
- Existing POI action-resolution depth (the current POI buttons remain the existing action/event-recording layer; deeper POI expedition/event mechanics are a separate future pass)
- NPC population expansion outside the currently authored cast
- Category-specific contextual paintings that were not actually supplied

## Validation

- `PORTS`: 42
- `POINTS_OF_INTEREST`: 7
- Canonical runtime locations: 49
- Presentation mappings: 49 / 49
- Duplicate location IDs: 0
- Missing canonical runtime IDs: 0
- Strict sea-route connectivity from Veyrholm to every destination: 49 / 49 reachable
- Changed emitted browser modules: ES-module syntax, no CommonJS `exports` / `require`
- Changed emitted JavaScript: `node --check` passed
