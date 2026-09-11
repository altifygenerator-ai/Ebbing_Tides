# Alpha 0.6D A0.3C — Live World Cause Bridge

## Purpose

A0.3C provides the minimum authoritative current-state layer required for dynamic political, religious, emergency, and economic causes to influence the already-repaired simulation without every downstream system inventing its own war/famine/policy flags.

Core rule: **one cause gets one authoritative current record; downstream owners consume that record and change their own causal inputs.**

## Ownership

- `GameState.worldCauses` — current operational cause state.
- `WorldEvent` — historical start/resolution announcements and public-information carrier.
- A0.1C — market stock/price/economic truth.
- A0.1B — NPC plans and physical traffic.
- A0.2A — player/public information ownership and physical propagation.
- A0.2D — crime evidence/report/authority/warrant lifecycle.
- R1 — standing and legal consequence state.
- R2 — future policy/customs/privateering consumer; it must not invent a parallel war/policy owner.

## Current cause model

Supported cause families are war, embargo, famine, emergency decree, religious policy, ruler/power change, and economic disruption. Causes carry:

- stable ID, title, summary, and reason;
- start/status/resolution time on `absoluteHour`;
- optional scheduled end;
- data-driven region/jurisdiction/faction/port scope;
- causal-input effects;
- policy tags for future R2 consumption;
- optional public-information metadata and origin port.

The current proving-ground seed intentionally contains **zero invented live causes**. This pass builds authority, not unapproved story events.

## Causal consumers

### Economy

A0.1C daily production, coarse off-screen supply, and consumption are multiplied by applicable live causes at the historical day being simulated. There is no event-specific price modifier. `calculatePrice` still uses current stock and existing local market data, so scarcity prices are downstream consequences of actual supply/demand state.

### NPC traffic

The existing NPC planner reads route traffic influence. A zero traffic multiplier closes ordinary route planning; nonzero multipliers alter desirability. Existing physical travel, plans, checkpoints, cargo, needs, and survival recovery remain authoritative. A0.3C does not teleport ships or create a second traffic ledger.

### Contracts

The existing delivery-contract generator reads institutional procurement demand. Increased demand can surface work earlier/in larger quantities; a zero procurement multiplier suppresses routine institutional procurement. Contract objects, fulfillment, rewards, and standing remain owned by the existing contract system.

### Law / institutions

A0.2D at-sea legal reports continue to calculate physical travel first. A0.3C may then modify the receiving institution's report-processing/transmission time. No warrant, heat, or standing consequence is created by the cause itself; A0.2D still applies those only after valid authority receipt.

### Information / player presentation

When a cause is public, its start/resolution WorldEvent carries A0.2A-compatible public-information metadata and a physical origin. Distant rumor candidates and current public notices only become eligible after `eventInformationCanReachPort` succeeds. The Journal filters world-cause history through the existing player knowledge ledger so simulation truth is not silently shown as captain knowledge.

Government/Religion screens reuse existing contextual-location structures for concise notices. No strategy dashboard or new top-level navigation was added.

## Lifecycle and persistence

`activateWorldCause` creates one live row and one start history event. `processWorldCauseLifecycle` resolves scheduled causes against the shared world clock even across large time jumps. `resolveWorldCause` supports explicit resolution. Current-state compaction retains all active rows and the latest 96 terminal rows; permanent history remains in the WorldEvent ledger.

Save schema remains v12. Older v12 snapshots are normalized additively with `worldCauses: []`. Local and cloud save paths compact current operational cause history before serialization. No Supabase migration is required because `game_saves.snapshot` remains the canonical campaign-state persistence path.

## Expansion safety

The engine contains no `port.veyrholm`, `port.ironhaven`, `port.stormvik`, or `port.thorenfjord` branches in world-cause evaluation. Later regions/ports participate through ordinary port/region/political data plus cause scope.

## R2 boundary

A0.3C gives R2 authoritative reasons. It does not implement the restrictions themselves. R2 may later ask which active causes/policies apply and then derive embargoes, enemy-goods controls, customs intensity, privateering authority, searches, rationing, and wartime law through its own rules while preserving A0.3C as the cause owner.
