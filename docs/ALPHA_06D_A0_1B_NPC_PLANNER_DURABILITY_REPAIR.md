# Alpha 0.6D — A0.1B NPC Planner Survival / Deadlock & Operational Queue Repair

**Base:** `0.6.0-alpha.d.a0-1a`  
**Package:** `0.6.0-alpha.d.a0-1b`  
**Save schema:** v12 (unchanged)

A0.1B is the second P0 corrective pass from the full A0 systems/canon/cohesion/campaign-durability audit. It repairs the long-run NPC travel deadlock and separates transient simulation wakeups from canonical world history without changing the accepted player-facing UI.

## What was wrong

The audit's 1000-day passive simulation found all six seeded ship captains eventually stuck in repeated `SURVIVAL_RESOURCE_SHORTFALL` interruptions. Each replan created another cancelled plan checkpoint and another interruption event. The resulting save contained 5,918 world events, 5,933 operational simulation events, 5,891 cancelled scheduler rows, and had grown to roughly 5.0 MB / 72.9× fresh size.

The root causes crossed several mechanics:

- a shortage interrupted a voyage, but the next plan could be interrupted for the same shortage before it could reach safety;
- NPC logical `locationPortId` could remain set to the last port after the ship had physically departed, so replanning could incorrectly treat an at-sea captain as still being in port;
- port duties only recovered a fraction of a day's provisions, so a low-reserve NPC could immediately fail again;
- `simulationEvents` was being used like permanent history even though its job is only to hold live future wakeups;
- processed/cancelled/stale checkpoints remained serialized indefinitely.

## Repairs

### 1. Port and sea location are now one coherent fact

When an NPC ship departs, both `ship.dockedAtPortId` and the captain's `npc.locationPortId` are cleared. On arrival, both are set to the same port. Emergency replanning therefore begins from the actual ship position rather than an old logical port.

### 2. Low reserves no longer create an endless replan loop

A routine travel plan can still be interrupted by a meaningful survival-resource forecast. That remains the intended Plan Until Interrupted behavior.

After such an interruption at sea, the planner creates a single `survivalRecovery` travel plan from the vessel's real current position to the nearest reachable port. That emergency return is allowed to complete even if reserves fall to zero; the same shortage cannot repeatedly interrupt the recovery trip.

### 3. Docked captains service before departure

If a proposed voyage would leave a docked NPC below the existing food/water ETA safety reserve, the ship remains docked and enters port duties first rather than departing only to turn around on the next simulation tick.

At completion, the current Alpha port-duty abstraction restores food/water operating reserve to at least 12 days and reduces fatigue. This is deliberately centralized in one completion point. **A0.1C must replace the source of these provisions with the unified economy/market transaction model rather than adding a second resupply path.**

### 4. Simulation wakeups are operational state, not historical truth

A new `simulationQueue` owner now handles transient wakeups.

- one current NPC plan gets one live checkpoint;
- processed, cancelled, duplicate, invalid and stale plan checkpoints are removed;
- plan interruption/completion/terminal-vessel retirement removes the matching checkpoint instead of preserving dead rows;
- v12 load repairs/compacts the queue and rebuilds live checkpoints for current plans;
- local/cloud saves compact the operational queue before serialization;
- `worldEvents` remains the canonical historical ledger and is not compacted by this repair.

### 5. World advancement uses one elapsed-time value

`advanceWorld` now passes the same non-negative floored hour count to the NPC simulation that it applies to the canonical world clock. Negative/fractional caller input can no longer leave the clock and NPC planner advancing by different amounts.

## Upstream/downstream cohesion checks

A0.1B was intentionally checked against adjacent systems rather than repaired in isolation:

- **A0.1A vessel lifecycle:** terminal/captured/disabled ships remain excluded from NPC planning, and their checkpoints are removed through the shared queue helper.
- **Navigation/physical geography:** recovery routes still use the existing A* sea-path and physical-distance/speed utilities; no atlas or route geometry changed.
- **Crew/player supplies:** the accepted player zero-supply behavior is untouched. NPC brain reserve recovery remains an internal planner abstraction until A0.1C makes provisioning economy-backed.
- **Economy:** no market inventory, prices, production or restock behavior was changed here. This prevents A0.1B from inventing a second economy before A0.1C establishes the authoritative one.
- **History/information:** canonical `worldEvents` are preserved. Only transient scheduler records are compacted.
- **Save compatibility:** schema remains v12; `survivalRecovery` is optional and old v12 saves are normalized on load.
- **UI/art:** no accepted R1.2/Naval/crew/port presentation geometry changed.

## Long-run verification

Final 1000-day passive stress run on the current Skeldra proving ground:

| Metric | A0 audit failure | A0.1B |
|---|---:|---:|
| Operational ship NPCs productive after 1000 days | 0 / 6 | **6 / 6** |
| Simulation events serialized | 5,933 | **6** |
| Cancelled simulation events retained | 5,891 | **0** |
| Processed simulation events retained | 42 | **0** |
| World events | 5,918 | **997** |
| Routine NPC arrivals completed | deadlocked | **992** |
| Repeated planner-interrupt spam | thousands | **0** |
| Save JSON bytes | ~5,024,684 | **520,226** |
| Growth vs fresh state | ~72.9× | **7.52×** |

The remaining growth is overwhelmingly canonical routine arrival history rather than dead operational queue records. Long-term event-ledger scaling can later use simulation LOD/importance rules, but the catastrophic nonproductive queue growth is removed.

## Regression coverage added

A0.1B adds lifecycle/composition tests proving:

1. NPC port identity and physical docking stay aligned;
2. an at-sea shortage creates one emergency return from the actual position;
3. recovery reaches port and can resume productive travel after service;
4. insufficient dockside reserves trigger service before departure;
5. v12 load removes retired/stale scheduler rows and reconstructs live checkpoints;
6. a 1000-day passive campaign keeps all six seeded ship captains productively cycling;
7. scheduler state remains bounded near one checkpoint per active ship NPC;
8. save growth remains below the A0.1B proving-ground budget;
9. all pre-existing navigation, crew, combat, law, save and presentation tests remain green.

## Deliberately unchanged / next dependency

A0.1B does **not** make NPC trade economically real. It does not consume market goods, move merchant money/cargo, or replace the current market self-restock logic. Those are intentionally reserved for **A0.1C — Economy Source-of-Truth Repair**, which must consume this now-stable NPC arrival/port-duty lifecycle rather than building a parallel merchant simulation.
