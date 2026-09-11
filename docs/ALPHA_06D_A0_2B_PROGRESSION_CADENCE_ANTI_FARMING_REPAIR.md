# Alpha 0.6D — A0.2B Progression Cadence / Anti-Farming Repair

## Purpose

The A0 audit confirmed that both Life Experience and skill practice used finite recent-key queues. Cycling enough unrelated keys removed an earlier key from the queue, allowing the same trivial activity to regain full reward without any world time passing. Deck Drill also consumed no time and could repeatedly add First Mate respect.

A0.2B repairs those lifecycle/cadence problems without changing the accepted classless progression model, level thresholds, Development Point rules, skill meanings, character UI, crew philosophy, or world-scale progression direction.

## Authoritative rule

Progression is earned from **lived, contextual activity over world time**.

The progression engine now owns only progression cadence. It does not invent a separate clock. `GameState.absoluteHour` remains the time authority, and activities that are supposed to cost time must call the existing world-time owner.

### Life Experience cadence

Life Experience sources use their semantic event/activity key plus a rolling **168-hour (7-day)** cadence window.

- first qualifying use in the window: full award
- second equivalent use: 35% award
- third and later equivalent uses: no award until older uses age out

Unrelated keys cannot evict the original key. Distinct canonical events that use distinct IDs remain distinct experiences.

### Skill-practice cadence

Skill practice uses its semantic activity/context key plus a rolling **24-hour** cadence window.

- first use: full challenge-relative practice
- second: 55%
- third: 20%
- fourth and later: 0 until older uses age out

The existing challenge factor still compares difficulty with current competence. A0.2B changes repetition semantics, not the core difficulty-to-practice relationship.

The cadence ledger tracks only the small number of timestamps needed for damping per semantic key and prunes entries after their window expires. This avoids the old queue-rotation exploit without turning progression state into permanent event history.

## Combat context

Real personal-combat practice is now keyed to the actual combat instance, so a later genuine fight is not treated as the same encounter simply because the player used a blade again.

Deck Drill intentionally uses a stable `deck_drill:<firstMateId>:<attack-kind>` context. Repeating drills against the same trainer within the same day therefore damps as training repetition rather than masquerading as new combat encounters.

## Deck Drill lifecycle

Deck Drill now:

1. requires port as before;
2. advances the existing world by **2 hours** through `advanceWorld`;
3. creates the drill combat against the currently assigned First Mate;
4. reads that First Mate's actual name and Blades skill;
5. records one canonical `deck_drill_completed` world event at resolution;
6. never creates lasting drill injuries as before;
7. awards at most +1 First Mate respect from a successful drill once per **72 hours**;
8. cannot raise respect above **60** through routine drilling.

The ceiling is intentional: repeated professional training can establish moderate earned respect, but deeper relationship states must come from actual decisions, danger, loyalty, history and Character Mind interactions rather than a repeatable minigame.

## Upstream/downstream cohesion check

### Upstream inputs

- `GameState.absoluteHour`: authoritative time
- character skill rating: existing competence
- activity/event key: semantic context supplied by the mechanic performing the action
- difficulty: existing challenge input
- current First Mate identity/skills: current crew/NPC state

### Downstream consumers

- skill progress and rank increases
- Life Experience / level milestones
- Development Point eligibility via `lastMeaningfulUseAtHour`
- world clock, economy, NPC plans, contracts and information aging during Deck Drill time
- First Mate personal relationship, but only under bounded drill-specific conditions
- canonical world history through `deck_drill_completed`

### Explicit non-collisions

- A0.1A vessel/prize lifecycle is untouched.
- A0.1B NPC planning receives ordinary world-time advancement from drills; no separate NPC timer exists.
- A0.1C economy advances through the same world clock; drills do not directly modify market state.
- A0.2A information ages naturally because the same `absoluteHour` advances; training does not create fake news/knowledge.
- Crew morale/loyalty are not automatically inflated by deck drill. Personal respect remains separate from aggregate company morale/loyalty.
- R1 law/standing is untouched.
- A0.2C remains owner of prepared-effect and Arcane-Strain semantics.

## Expansion safety

No region, port, religion or culture is hardcoded into progression cadence. New activities should provide stable semantic context keys and appropriate difficulty/time costs. New teachers and officers can use the same training cadence. A new port does not require a new progression engine.

## Save compatibility

Save schema remains v12.

New cadence fields are optional/additive to the existing progression/practice JSON objects. On load, deprecated `recentExperienceKeys` and `recentPracticeKeys` are cleared as non-authoritative compatibility state; valid current time-based cadence entries are pruned against the current world hour.

## Verification

- TypeScript alpha typecheck: PASS
- Alpha compile: PASS
- Full automated suite: **339/339 PASS**
- A0.2B dedicated cadence/cohesion tests: **8/8 PASS**
- Existing 1000-day NPC-planner durability regression: PASS
- Existing 1000-day integrated economy/planner durability regression: PASS
- Art-layout verification: **2/2 PASS**
- Next production build: unavailable in this environment because `node_modules/.bin/next` is not installed

## Deferred

A0.2C remains responsible for:

- true one-shot versus timed prepared-effect semantics;
- Arcane Strain gain/recovery/consequence lifecycle or deferral;
- making navigation preparation influence actual voyage outcomes rather than only a departure check.
