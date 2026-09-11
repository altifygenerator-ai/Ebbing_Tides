# Alpha 0.6D — Crew Mechanics Pass 1

## Purpose

Establish the playable ship-company loop immediately after acceptance of the recovered navigation/map baseline.

The design keeps the surface readable and fast while using existing RPG, NPC memory, world-event, voyage, and combat systems underneath.

## Implemented

### Crew population and persistent state
- Save schema advanced to v11.
- Player ship now stores aggregate `crewCommunity` state.
- Named officers remain persistent NPC-backed roster entries.
- Generic sailors remain aggregate population and do not clutter the named roster.
- v10 migration seeds the new company state and collapses legacy generated deckhands back into aggregate population while preserving established named officers.

### Qualitative crew presentation
Crew screen now surfaces:
- total crew / capacity,
- morale,
- loyalty,
- experience band,
- health,
- discipline,
- ordinary-hand count,
- unsettled prize share when relevant.

### Tavern crew loop
The approved Tavern contextual-location screen now supports:
- Food, Bunks & Shore Leave,
- fair prize-share distribution,
- deterministic quality-based sailor recruitment,
- visible open berths,
- signing costs and basic recruit quality.

### Recruitment
- Three deterministic daily offers per port.
- Green, Regular, Seasoned, Veteran, and Elite quality bands.
- Better sailors cost more.
- Recruits change aggregate company experience and practical ship skills.
- Recruiting does not generate disposable named-character records.

### Shore leave
- Cost scales with company size.
- Consumes 8 world hours.
- Improves morale, loyalty, food satisfaction, fatigue, and limited health recovery.
- Produces a canonical crew event remembered by named crew.

### Prize shares
- Naval prize victories create a 20% company-share obligation in the current pass.
- Paying the share improves morale, loyalty, and pay satisfaction.
- Unsettled shares contribute to desertion pressure.

The exact long-term prize-law/economic percentage remains tunable; the important locked behavior is that victory can create a real company obligation rather than all proceeds silently belonging to the captain.

### Casualties / danger
- Aggregate casualties produce morale/loyalty pressure and persistent history.
- Dangerous crew orders are remembered and can hurt morale when the company is already shaky.
- Grappling currently counts as a dangerous order.
- Aggregate casualties never silently delete named officers.

### Crew quality affects gameplay
Aggregate company quality now contributes a restrained modifier to:
- voyage seamanship / handling and ETA,
- naval maneuvering,
- gunnery,
- boarding/grapple,
- escape.

Captain/officer specialist skill remains primary. Crew quality is supporting ship-company performance, not a replacement for character builds.

### Zero-supplies integration
The previously approved progressive shortage system remains:
- zero stores never blocks sailing,
- first day is forgiving,
- morale pressure escalates over time,
- prolonged deprivation causes health loss,
- 72h and 120h thresholds leave company-loyalty pressure,
- food satisfaction deteriorates,
- repeated shortage history matters,
- leadership mitigates morale loss.

### Desertion
- Conservative desertion check occurs when entering the Tavern, max once per port/day.
- Inputs include morale, loyalty, fatigue, food/pay satisfaction, shortage history, unsettled prize share, dangerous orders, and leadership.
- Only ordinary hands can leave through this system.
- Named officers remain persistent and require their own character logic.

### Character Mind integration
Named crew dialogue context can now perceive qualitative company morale/loyalty and unsettled prize obligations. `ask_about_crew` can react to the actual aggregate company rather than only the selected officer's private morale.

## Explicitly deferred

Not included in Pass 1:
- full mutiny threshold/event,
- mutiny-leader NPC selection,
- mutiny negotiation scene,
- promises/terms system for mutiny resolution,
- mutiny personal-combat confrontation,
- game-over-on-lost-mutiny-combat,
- deep officer contract negotiation (cabins/rank/contract duration/religious accommodations),
- detailed cultural/religious crew-composition simulation,
- advanced crew allocation between Sailing/Gunnery/Damage Control/Boarding.

These build on this foundation rather than preceding it.

## Surface design rule

The normal player should understand the company through simple states and actions, not a permanent simulation dashboard.

> Crew are a human consequence of sailing decisions, not another spreadsheet to operate.

## Regression targets

Dedicated tests cover:
- schema v11 / aggregate-vs-named representation,
- deterministic recruitment,
- shore leave,
- prize-share obligation and payment,
- prolonged zero-supply company consequences,
- crew quality affecting voyage handling without changing geography,
- ordinary-crew desertion without silent named-officer deletion,
- v10 migration,
- crew UI surface / mutiny deferral.

## Automated status at packaging
- 242 / 242 tests PASS
- TypeScript PASS
- Alpha build PASS
- Art-layout verification 3 / 3 PASS
- Save schema v11
- Manual crew-feel / tuning approval: PENDING
