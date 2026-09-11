# Alpha 0.6D A0.1C — Economy Source-of-Truth / NPC Trade Integration

## Purpose

A0 found that the old market loop moved stock toward `targetStock` every day regardless of production, consumption, merchant traffic, blockade, war, or settlement conditions. At the same time, NPC ships performed nominal trading without moving the same inventory the player saw. That created two incompatible representations of one economy and would have caused later kingdom, war, shortage, customs, and smuggling systems to fight one another.

A0.1C makes settlement market inventory the authoritative stock state and routes recurring economic causes through it.

## Cohesion rule

**One cause gets one authoritative state change. Other systems consume that result.**

A market price is still derived from actual stock. World/kingdom events added later should therefore change production, consumption, traffic, access, or aggregate supply rather than independently stacking duplicate price modifiers for the same cause.

## Implemented

### Settlement production / consumption / coarse LOD supply
- Removed universal target-seeking daily restock.
- Each market row now has explicit daily production, consumption, and coarse off-screen supply rates.
- `targetStock` remains reserve/storage context and price context; it is not a force that manufactures inventory.
- Daily production/consumption use deterministic world-seeded variation.
- Coarse external supply represents non-materialized hinterland and background trade while much of the world remains inactive. It shares the same market state and is intentionally an LOD input, not a second economy.
- Storage capacity bounds are shared by settlement flow, NPC unloading, and player selling.

### Expansion-safe economic identity
- Current legacy Skeldran commodity production factors live in `src/data/seed/economyFlows.ts` as content data.
- Goods with canonical content definitions derive production/import character from `settlementAvailabilityFor(...)` and existing regional/settlement economic profiles.
- Future canonical settlement profiles such as Asterra, Blackhaven, and Nagara can already derive flow rates without named-port branches in the economy engine.
- `buildInitialPortMarkets()` now builds markets from the active runtime `PORT_BY_ID` registry. Activating a future canonical settlement as a runtime port therefore extends the same market-generation path rather than requiring another economy implementation.

### NPC merchant bridge
- Merchant/privateer route selection can score reachable active ports from current market opportunity rather than using a hardcoded four-port rotation.
- Trade cargo is loaded from real source-market stock and consumes real ship cargo capacity and money.
- On arrival, marketable cargo is sold into the real destination-market stock and proceeds return to the NPC's economic reserve.
- Routine materialized trade mutates canonical economic state without creating historical-event spam.

### Provisioning bridge
- NPC food reserves consume actual staple food stock at the port.
- Harbor water remains an explicit harbor utility abstraction until water is represented consistently in all settlement inventories.
- Player `Load 6 Supplies` now quotes and consumes the same staple market stock.
- The accepted Harbor UI geometry remains unchanged; only live price/availability feedback changes.

### Cargo/load invariant
- Sailing cargo load now uses each commodity's `cargoUnits`, matching cargo-capacity checks and trading.

### Contract lifecycle adjacency
A recurring real economy can continually create and resolve delivery opportunities, so A0.1C also closes an adjacent persistence leak:
- accepted contract expiry removes the ID from `acceptedContractIds`;
- accepted failures remain canonical player history and standing consequences;
- ignored routine delivery notices do not become permanent world-history events;
- old `resolved_without_you` routine contract objects are pruned after a seven-day recent-journal tail.

## Upstream / downstream check

The combined causal path is now:

`settlement/region economic data -> production/consumption/LOD supply -> market stock -> price/shortage -> player & NPC decisions -> real cargo transfer -> destination stock -> contracts/availability`

Existing A0.1B NPC planner recovery consumes this same provisioning source and remains productive if reserves become unsafe. Existing Navigation reads the corrected shared cargo load. No A0.1A vessel lifecycle or prize logic is bypassed.

Future political/religious/war systems should modulate these economic inputs rather than maintaining independent market copies or duplicate price penalties.

## 1000-day integrated stress result

Seed: `a01c-final-stress`

- simulated time: 24,000 hours / 1,000 days
- active operational ship NPCs: 6 / 6
- NPC port arrivals: 1,116
- planner interruption deadlocks: 0
- live simulation events: 6
- processed/cancelled simulation rows retained: 0 / 0
- market rows checked: 96
- negative stock rows: 0
- stock-over-storage-cap rows: 0
- save JSON: 69,139 -> 578,518 bytes (~8.37x)
- routine resolved-without-player contracts retained: 7
- available contracts: 5

One heavily import-dependent strategic commodity at Thorenfjord can reach zero during the 1,000-day proving-ground run. This is not target-restock failure or negative-state corruption: Thorenfjord is deliberately weak in heavy industrial supply and the current Alpha has only three materialized merchant captains plus coarse background supply. Merchant deliveries and future regional activation remain valid recovery sources. The engine does not force a stock floor merely to avoid scarcity.

## Verification

- TypeScript no-emit: PASS
- Alpha compile: PASS
- automated tests: 320/320 PASS
- art-layout verification: 2/2 PASS
- Next production build: unavailable in this environment (`next` executable is not installed)

## Deferred intentionally

- dynamic war/blockade/famine/kingdom modifiers to economic flow (A0.3C / later world-event bridge)
- dynamic trade law/customs/smuggling/privateering (R2)
- full materialization of every background farm/village/merchant route
- water as a universal settlement commodity
- deeper merchant risk/diplomacy/war routing until the authoritative political state exists
