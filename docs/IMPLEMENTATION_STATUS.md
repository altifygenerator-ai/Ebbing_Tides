# Ebbing Tides — Build 0.1 Implementation Status

Checkpoint: **Alpha 0.1.0-alpha.1**

## Vertical slice chosen

Skeldra: **Veyrholm, Ironhaven, Stormvik, Thorenfjord**.

Why this slice:
- all four are existing Day 1 ports;
- Veyrholm and Ironhaven have approved PORT_ESTABLISHING art;
- Skeldra currently has the strongest approved clothing/weapon/ship visual family;
- the build-start bible already provides specific starting-knowledge examples linking these ports;
- it validates cold-water navigation, industry/tradition pressure, trade, navy traffic, religion and rumors without inventing a tutorial island.

Exact map coordinates and route-hour numbers are tagged **ALPHA_PROVISIONAL** because exact coastline/route geometry is explicitly not yet locked.

## Implemented now

- Custom character start with persistent identity/history choices.
- Six 1-10 attributes, five Core Skills, background/profession/origin/religion/omen/aptitude data.
- Starting Knowledge initialization with timestamp, source, confidence and truth status.
- Real world seed and deterministic keyed RNG; no Math.random() in simulation.
- Canonical world clock beginning Day 1, 628 CR.
- Separate current state and persistent event/history ledger.
- Four real Skeldran ports with coded coordinates/routes.
- Dynamic port markets for eight commodities; price depends on stock/target/local profile plus deterministic daily drift.
- Timestamped player market observations (no live omniscient remote prices).
- Context-derived delivery contracts from actual market needs; accepted/completed/expired/resolved-without-you states.
- Persistent player ship, named first mate, cargo, supplies, hull/sails/rigging/crew/morale.
- Persistent moving NPC ships including Stormcrow and Providence plus one alpha seed raider.
- Travel ticks, navigation checks, supplies, weather candidates, ship detection and sightings.
- Sighting actions: hail, avoid, attack.
- Minimal naval combat state machine with range, 2d10 checks, round/chain fire, maneuvers, repairs, flee, damage, morale and ledger outcomes.
- Character Mind boundary: structured character context + lore firewall + deterministic standalone fallback.
- Optional Next.js server route for OpenAI Character Mind structured-output calls when configured.
- Local save/load preserving world state/history today.
- Supabase production-shaped schema draft with stable IDs for saves, characters, relationships, ships, markets, knowledge, events, contracts and asset registry.
- Real asset registry and runtime integration of approved/current art only.
- Next.js wrapper source prepared; standalone alpha remains dependency-free and immediately runnable.

## Known limitations / next queue

1. Character creation still needs appearance/Visual DNA, broader skills, family/contact/enemy generation, literacy, flaws and more ship-origin consequences.
2. Navigation coastline is a tasteful coded placeholder; authoritative geography still needs code/vector lock.
3. NPC route simulation is intentionally small and coarse.
4. No personal combat slice yet.
5. Naval combat does not yet implement orientation/raking, batteries, crew allocation, surrender negotiation, prize crews, fire spread, magazine explosions or boarding transition.
6. Character Mind OpenAI path is scaffolded but not exercised in this environment because no API key is configured.
7. Supabase schema is drafted but standalone alpha persists locally; cloud save adapter is next.
8. Stormvik/Thorenfjord use neutral environment treatment because no approved port anchor was provided for them.
9. Commodity balance, route hours and exact market quantities are alpha balance data, not lore canon.

## Immediate Alpha 0.2 target

- Personal combat/AP/injury slice.
- Cloud persistence adapter against the included schema.
- Better background simulation and encounter density.
- Ship identification levels and last-known positions.
- Character Mind live provider validation and engine-validated proposals.
- Character creation Visual DNA and paper-doll/inventory foundation.
