# Alpha 0.6D — A0.2D Law Information Lifecycle

## Purpose

R1 established crime truth, witnesses, political/local standing, personal relationships, jurisdiction legal state, and warrants, but an identified surviving witness effectively jumped directly from “can report” to jurisdiction-wide consequences. A0.2A later established physically delayed information, while intentionally refusing to let generic public news become legal authority.

A0.2D closes that gap with one authoritative lifecycle:

**crime truth → witness/evidence → legal report → physical/institutional delivery → authority receipt/validation → warrant/legal consequence → satisfaction/pardon/adjudication**

The pass changes legal information timing and ownership. It does not create a second crime, reputation, heat, standing, warrant, or public-news system.

## 1. Crime truth remains authoritative

`CrimeRecord` remains the canonical fact that a crime happened. Naval aggression, piracy/prize-taking, and resistance to authority create one crime record and one canonical `crime_committed` world event.

A0.2D adds optional/additive legal-lifecycle fields to that crime record:

- evidence records;
- legal-matter status;
- authority-receipt hour;
- resolution hour and note.

The existing `reported` compatibility flag remains, but now means that a valid legal report actually reached and was accepted by the competent authority. It is no longer synonymous with “somebody survived and could tell someone.”

Legal-matter states are:

- `unreported`;
- `report_in_transit`;
- `active`;
- `satisfied`;
- `pardoned`;
- `dismissed`.

## 2. Witness and evidence layer

A crime can create evidence without creating legal knowledge.

Initial evidence kinds are:

- `eyewitness` — ordinary surviving identifying witness;
- `official_witness` — competent authority directly witnessed/established the offense;
- `physical` — independent evidence for future investigation/event/customs use.

Evidence tracks whether the player was identified and whether the evidence is potential, available, submitted, or lost.

If no witness survives or the player cannot be identified, an at-sea incident does not automatically dispatch a report. Independent identifying physical evidence may later support a report through the same lifecycle.

## 3. Legal report authority

`LegalReportRecord` owns the operational act of getting admissible legal information to an authority. It is linked to the canonical crime ID and never duplicates the crime itself.

The current channels are:

- `survivor_delivery`;
- `direct_authority`;
- `institutional_courier`.

An active report records source/evidence, target authority port when applicable, creation hour, delivery hour, channel and status.

Only one non-rejected report for the same unresolved crime may be live/validated at once. This prevents repeated encounter cleanup or repeated advancement from issuing duplicate warrants or applying duplicate standing/heat penalties.

## 4. Physical report travel

For an identified surviving witness at sea, A0.2D chooses the nearest reachable authority port in the crime jurisdiction’s political region using the existing world sea-path and physical-distance systems.

The current coarse legal-courier timing is:

- route distance through the existing sea grid;
- approximately 6 knots of physical travel;
- plus a 4-hour minimum/handling allowance for survivor landing, statement taking and institutional processing.

This is intentionally a coarse information model, not a new ship/NPC simulation. It reuses geography and the authoritative clock, remains expansion-safe, and lets the player sometimes arrive or encounter lawful ships before the report reaches authority.

A competent local authority or enforcing navy vessel can receive a report immediately, but it still uses `LegalReportRecord` with zero transit. There is no special direct-warrant mutation path.

## 5. Authority receipt and exactly-once consequences

`processDueLegalReports()` runs from `advanceWorld()` after the world clock moves. When `GameState.absoluteHour` reaches a report’s delivery time, the report is received and validated.

Only then does the existing R1 legal consequence layer change:

- `crime.reported = true`;
- authority receipt is recorded;
- the legal matter becomes active;
- jurisdiction heat changes;
- faction standing changes;
- receiving-port local standing changes when a receiving port exists;
- the existing active jurisdiction warrant is created or extended;
- canonical `legal_report_received` / `warrant_issued` history is written.

Reprocessing the same report cannot repeat those consequences. A crime that already has authority receipt cannot dispatch another active report.

## 6. Lawful vessel posture and outrunning news

Lawful vessel posture continues to consume the existing R1 active legal state and warrant data. It does not read raw crime truth.

Therefore an at-sea crime may exist while a lawful patrol still has no legal basis to detain the player. Once the competent authority has received the report and the warrant becomes active, lawful posture can change through the existing R1 logic.

A0.2D does not build the later R2 customs/privateering/wartime-order dissemination model. It establishes the correct boundary R2 will consume.

## 7. Resolution / adjudication lifecycle

Warrant satisfaction now marks every linked crime matter `satisfied`, records the resolution hour/note, clears the active legal state coherently, and preserves the crime as history.

A system-facing pardon path performs the same coherent closure with `pardoned` status without deleting canonical events.

`unresolvedReportedCrimes()` excludes satisfied, pardoned and dismissed matters, fixing the previous behavior where old settled crimes could remain falsely unresolved forever.

## 8. Save/load and bounded operational state

Save schema remains **v12**.

New A0.2D fields are additive. On v12 load:

- `legalReports` is initialized when absent;
- crime evidence arrays are initialized;
- old reported crimes infer a valid active/resolved matter from existing warrants;
- old already-reported crimes infer authority receipt from linked warrant issuance when possible;
- existing A0.2A, A0.2B and A0.2C normalization still runs.

Before local save, legal reports are compacted. All live in-transit reports are retained; terminal report history is bounded to the latest 128 operational rows. Canonical crime/history remains in `CrimeRecord` and `WorldEvent`, so compaction does not erase what happened.

No new Supabase migration is required. `game_saves.snapshot` remains the canonical full campaign save owner in this alpha, and there was no pre-existing normalized law boundary that A0.2D needed to extend.

## 9. Upstream / downstream cohesion

### A0.1A vessel/combat lifecycle

Combat/prize outcomes may create crimes and witnesses, but A0.2D does not alter terminal ship state, captured/sunk/disabled ownership, boarding crew shares, or the prize pipeline.

### A0.2A information

A0.2D reuses physical geography/world-time principles but keeps legal reports distinct from generic public news. Public rumor/news cannot auto-issue warrants.

### World time

`GameState.absoluteHour` is the only delivery/receipt clock. No legal-report private timer or scheduler is introduced.

### R1 law / standing

Existing heat, jurisdiction state, warrants, faction standing and port standing remain the consequence owners. A0.2D changes when those owners are allowed to mutate, not what replaces them.

### A0.3C / R2 readiness

Future policy/war/religious state may change reporting institutions or legal rules, but it should feed this same legal-information boundary. Future customs/smuggling/privateering must create/consume crime, evidence, reports and active warrants rather than creating a second crime meter or omniscient enforcement path.

## 10. Verification

Final A0.2D verification:

- TypeScript alpha typecheck: **PASS**
- Alpha compile: **PASS**
- Full automated suite: **361/361 PASS**
- Dedicated A0.2D lifecycle tests: **11/11 PASS**
- Explicit 1000-day NPC planner + integrated economy/planner durability files: **13/13 PASS combined**
- Art-layout verification: **2/2 PASS**
- Next production build: **not available in this environment because the local `next` executable is not installed**

Dedicated A0.2D coverage proves:

1. package/save initialization;
2. at-sea witness report transit without teleported consequences;
3. player can outrun report before authority receipt;
4. exactly-once receipt/warrant/standing consequences;
5. no witness/identity/evidence means no automatic legal response;
6. independent physical evidence can support authority receipt;
7. competent local authority uses the same immediate lifecycle;
8. save/load during transit preserves ETA and avoids duplicate warrants;
9. warrant satisfaction resolves linked crimes;
10. pardon resolves without erasing crime history;
11. report state remains bounded while live reports are preserved.

## 11. Explicit non-goals / deferred work

A0.2D does not implement:

- R2 dynamic customs, cargo legality, smuggling, privateering or wartime law;
- A0.3A port/service capability;
- A0.3B character-build consequence/learning sources;
- A0.3C live kingdom/policy/religion/world-event bridge;
- world population/port expansion;
- mutiny;
- a player-facing legal-management dashboard;
- a structural visual redesign.

The next corrective phase is **A0.3A — Port / Service Capability Authority**.
