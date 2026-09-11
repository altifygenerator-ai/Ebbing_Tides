# Alpha 0.6D — A0.1A Vessel / Combat Terminal Lifecycle Repair

**Base:** `0.6.0-alpha.d.rpg-r1.2`  
**Package:** `0.6.0-alpha.d.a0-1a`  
**Save schema:** v12 (unchanged)

A0.1A is the first corrective pass produced from the full A0 systems/canon/cohesion/campaign-durability audit. It intentionally repairs one P0 foundation before the NPC-planner and economy repairs begin.

## What changed

### One authoritative vessel terminal state
NPC ships now carry an optional persistent lifecycle state. New campaigns initialize ships as `active`; legacy schema-v12 saves with no lifecycle field are treated as active automatically. Terminal states currently available are `disabled`, `captured`, and `sunk` (reserved for later explicit sinking resolution).

A vessel resolved by the player can no longer continue ordinary NPC planning, reappear as a normal sighting/Search Waters contact, or be attacked for another prize.

### One prize resolution pipeline
Naval-fire/surrender victories and decisive boarding victories now call the same `resolvePlayerPrize` pipeline. That pipeline owns:
- terminal vessel state,
- immediate prize valuation,
- player crown award,
- ordinary-company prize-share obligation,
- R1 piracy/legal hooks,
- surviving-witness reporting hook,
- NPC plan retirement,
- canonical vessel-resolution history.

Boarding no longer bypasses the crew prize-share system.

### Terminal NPC operations
When a persistent NPC vessel becomes captured/disabled, its active route is cleared, its current plan is invalidated, matching scheduled checkpoints are cancelled, and later world advancement does not move it as ordinary traffic.

This does not yet repair the broader NPC-planner deadlock/state-growth problem. That remains A0.1B.

### Hull invariant correction
Emergency Hull Shoring now checks and clamps against the vessel's actual `hullMax`, not a hard-coded value of 100. Combat defeat recovery also clamps to the actual vessel maximum.

### Defeat text correction
The player-defeat result no longer claims cargo/reputation losses that the code did not actually apply. The current Alpha result reports the concrete crown loss and battered-hull consequence that really occurred.

## Deliberately unchanged

- save schema remains v12;
- accepted R1.2 UI geometry and presentation are untouched;
- Naval Combat Pass 1 presentation is untouched;
- no R2 customs/smuggling/privateering mechanics were added;
- no full captured-ship ownership/fleet/prize-court system is invented here;
- no explicit sinking model is added yet;
- no NPC-planner survival repair beyond terminal-vessel retirement;
- no economy repair yet.

## Regression requirements added

A0.1A adds lifecycle tests proving:
1. legacy v12 ships without lifecycle data remain usable as active ships;
2. one defeated vessel can pay a prize only once;
3. naval and boarding victories share the same prize resolver;
4. boarding creates the same crew-share obligation as naval prize-taking;
5. terminal NPC vessels stop moving under later world advancement;
6. terminal vessels are excluded from Search Waters/sighting candidates;
7. Emergency Hull Shoring cannot exceed `hullMax`.

This pass is complete only if the full pre-existing suite remains green in addition to these tests.
