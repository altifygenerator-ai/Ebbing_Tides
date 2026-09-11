# Alpha 0.6D A0.2A — Information Durability & Ownership Repair

## Purpose

The A0 audit found two related information problems: the captain had two mutable knowledge stores (`PlayerState.knowledge` and `CharacterCapabilityState.knowledgeEntries`), and player-facing port reads/rumors behaved like finite one-use content even though the world is meant to persist for years. It also found that later law, politics, economy, and NPC systems need a shared distinction between **world truth** and **what information has physically reached a place**.

A0.2A repairs that foundation without creating a new dashboard or changing accepted geometry.

## Authoritative ownership

`PlayerState.knowledge` is now the one mutable campaign-intelligence ledger. The older `player.character.knowledgeEntries` field remains only for v12 compatibility/construction and is imported once, normalized, then cleared on new-game completion and save load.

Stable `claimKey` values mean one semantic claim owns one current ledger row. Re-observation refreshes the existing claim instead of appending an endless series of equivalent entries. Older timestamped observations that normalize to the same semantic claim are compacted on load. Historical acquisition/refutation remains appropriate for `worldEvents`, not duplicate current-knowledge rows.

## Information lifecycle

Knowledge records can now carry:
- first-learned time;
- observation time;
- last-refresh time;
- stale-after duration;
- current / contradicted / superseded state;
- source event and origin location where relevant.

Player-facing freshness is derived from world time. Durable confirmed facts need not decay; trade, maritime, danger, local, political, and religious reports can age according to their nature.

## Recurring port reads

`assessPort` now uses a stable claim per port + character-build lens. A current read cannot be spammed. Once the read ages, or meaningful live context changes after a minimum interval, the player can assess again and refresh the same claim.

Trade and maritime reads can include current A0.1C market signals or public harbor traffic rather than pretending an authored sentence stays eternally current.

## Recurring rumors

Rumor candidates now come from three sources:
1. finite authored local color, heard once;
2. live market reports derived from the authoritative A0.1C market state and refreshable as conditions age/change;
3. public world-event reports that have had enough physical time to reach the port.

A visit can still exhaust useful talk **for now**, preventing infinite tavern clicking, but the system becomes useful again as time, markets, traffic, and future world events change. Refreshable claims update one stable row instead of expanding save state indefinitely.

## Physical information propagation

A0.2A introduces a coarse `informationTravelHours(fromPort,toPort)` using the active port registry, the real navigable sea route, and physical distance. `eventInformationCanReachPort` answers only whether a public report **could have arrived**; the player still needs a source/action such as gathering rumors to learn it.

This is intentionally not omniscient broadcasting.

Currently ordinary NPC arrivals are eligible public harbor information. Future systems may explicitly mark suitable canonical events as public knowledge. **Crime/law events are not automatically publicized here.** A0.2D will own witness/evidence/report delivery to authorities so generic news cannot bypass legal causality.

## Ship recognition correction

Mere vague knowledge about a ship or captain no longer makes the encounter layer identify that vessel forever. Recognition now requires confirmed knowledge or exceptionally strong, still-fresh hard intelligence. Direct identification creates/refreshes the stable ship-identity claim.

## Character Mind cohesion

Pastor Elias Korr's deterministic food-pressure dialogue now reads Ironhaven's live grain state from the A0.1C economy. He will not claim a shortage simply because an old authored line once said there was one. This is a narrow cohesion correction, not a broader Character Mind redesign.

## Upstream / downstream boundaries

**Reads from upstream:**
- A0.1B NPC arrival events can become harbor reports after travel delay.
- A0.1C market stock generates current trade reports.
- Navigation/physical distance determines information travel time.

**Does not mutate upstream owners:**
- information does not move NPC ships;
- information does not change market stock/prices;
- information does not resolve combat/vessel lifecycle;
- generic information does not issue warrants or report crimes.

**Prepares downstream:**
- A0.2D can route witness/evidence reports through the same world-truth vs received-information distinction;
- A0.3C kingdom/world events can publish physically propagating news without inventing another knowledge system;
- R2 dynamic law/customs can later distinguish actual policy changes from when the captain learns them.

## Expansion safety

The information-delay engine has no named-port routing branches. Every currently registered port pair resolves through the same path/distance model. When future canonical settlements become active runtime ports, they inherit this behavior through the port registry.

## Verification targets

Regression coverage proves:
- one campaign knowledge owner after create/load;
- v12 compatibility import without schema bump or duplicate re-import;
- old duplicate direct observations compact into one semantic claim;
- recurring port reads after aging, without duplicate claim growth;
- tavern rumors can exhaust for now and become useful again after world change/time;
- freshness current -> aging -> stale -> refreshed current;
- public events do not appear at distant ports before physical travel delay;
- generic information does not bypass crime/law reporting;
- vague rumor does not grant permanent ship recognition;
- Character Mind food claims track live economy;
- every active port pair uses generic physical information delay;
- A0.1C 1000-day economy/planner regression still passes as part of the full suite.

## Presentation

No layout/geometry redesign. Existing Journal rows simply have more truthful age/state labels. The later culture-primary/religion-secondary painted phase remains unaffected.

## Deferred intentionally

- A0.2B progression cadence / anti-farming
- A0.2C prepared effects and Arcane Strain lifecycle
- A0.2D witness/evidence -> authority law-information lifecycle
- A0.3C live kingdom/event bridge and richer network-specific propagation
- R2 trade law/customs/smuggling/privateering
