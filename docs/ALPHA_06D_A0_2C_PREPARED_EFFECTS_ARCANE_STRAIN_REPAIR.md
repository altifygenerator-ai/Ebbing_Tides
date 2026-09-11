# Alpha 0.6D — A0.2C Prepared Effects, Arcane Strain & Navigation Quality Repair

## Purpose

The A0 audit found three related cases where a player-facing promise did not match durable simulation state:

1. abilities described as preparing the **next** relevant check were inferred from recent historical ability-use events, so one successful use could affect every qualifying check during the time window;
2. Arcane Strain accumulated but had no ordinary recovery loop and little downstream mechanical consequence;
3. the departure Navigation check existed, but its quality had little meaningful effect on the voyage after the roll was shown.

A0.2C closes those loops without changing the accepted classless character model, the Arcane/Industrial specialization direction, physical navigation model, weather ownership, combat presentation, or R1.2 screen geometry.

## 1. Prepared-effect authority

Historical events are no longer active buffs.

`CharacterCapabilityState.preparedEffects` owns pending successful preparations. Each entry records:

- ability ID;
- matching trigger;
- preparation hour;
- expiry hour;
- mechanical bonus;
- remaining uses;
- optional context entity such as the current ship.

The initial rule set covers the existing abilities whose text promises a later use:

- **Read Wind** → next navigation-departure check, ship-bound, 8-hour lifetime, +6;
- **Calibrated Sextant Method** → next navigation-departure check, ship-bound, 12-hour lifetime, +8;
- **Precision Bore Sighting** → next actual naval firing check, ship-bound, 8-hour lifetime, +8;
- **Personal Ward** → next dangerous personal-defense exchange, character-bound, 2-hour lifetime, +10 defense difficulty.

Repeated use of the same preparation replaces the prior pending copy instead of stacking another row. Expired/consumed entries are compacted. The rule map is world-generic and does not depend on location/culture.

### Read-only versus consuming calls

Probability previews use `preparedAbilityBonus()` and do not spend the preparation.

The first valid matching action uses `consumePreparedAbilityEffect()` exactly once. Invalid actions do not consume the effect.

This matters particularly for naval gunnery: opening/refreshing a chance display cannot silently waste Bore Sighting, but issuing the first valid fire order does.

### Timed semantics

Prepared lifetimes are half-open: an effect prepared at H0 for two hours is valid before H2 and expired at H2. A safe/non-dangerous exchange does not consume Personal Ward, but ordinary elapsed world time can still cause it to expire.

## 2. Navigation preparation and downstream consequence

`beginNavigation()` now reads any matching Read Wind / Calibrated Sextant preparation, applies the combined assistance to the real departure Navigation check, stores the resulting `VoyageNavigationQuality`, then consumes those preparations exactly once.

The voyage stores:

- outcome;
- margin;
- chance;
- preparation bonus;
- hazard-damage modifier.

The departure event records the same information as canonical history.

### Weather remains authoritative weather

A0.2C does **not** change the deterministic weather trigger. A squall still occurs or does not occur from the existing weather roll.

Navigation quality changes only the consequence:

- exceptional success: -2 sail damage;
- clean success: -1;
- costly success: no change;
- failure: +1;
- severe failure: +2.

The existing squall baseline is 2 sail damage, clamped so good navigation cannot turn it into negative damage.

This preserves the causal chain:

**preparation → navigation check → persistent route quality → real weather event → mitigated/worsened consequence**

rather than creating an independent “good navigation prevents weather” system.

## 3. Arcane Strain lifecycle

### Single owner

`character.attunement.arcaneStrain` is authoritative.

`character.condition.arcaneStrain` remains only a synchronized compatibility/display mirror because older state/UI already contains the field. No gameplay code treats the mirror as a second source of truth.

### Gain

Arcane practices continue to add their authored `strainCost`, reduced where the already-existing Arcane Ritual perk applies. Strain remains clamped to 0–100.

The current cast is resolved against the strain already carried into that action; newly generated strain affects later Arcane use.

### Consequence

Arcane Strain now modifies Arcane ability reliability independently of Arcane/Industrial interference:

- 0–19: 0;
- 20–44: -2;
- 45–74: -5;
- 75–100: -9.

The same deterministic check roll remains the same for the same world/check identity; strain changes the chance rather than replacing the d100 system.

### Recovery

Strain naturally dissipates by one point per six crossed authoritative world-clock hours.

Recovery is implemented using absolute-hour boundaries, so advancing 12 hours once and advancing 6 + 6 hours produce the same result. It applies to the player and persistent NPC characters through `advanceWorld()`.

This intentionally creates no private Arcane timer. Travel, training, repairs and future activities that consume world time all feed the same recovery clock.

The player-facing description was tightened to promise only the behavior that actually exists now: reliability pressure plus natural time recovery. Fatigue/pain/hallucination/backlash are not claimed as active mechanics in A0.2C.

## 4. Upstream/downstream cohesion check

### Upstream inputs

Prepared effects read:

- successful ability resolution;
- current world hour;
- current player character / ship context.

Arcane Strain reads:

- Arcane ability strain cost;
- existing ritual perk reduction;
- authoritative world-time advancement.

Voyage quality reads:

- current navigator/delegated specialist;
- existing skill/attribute/specialization resolution;
- existing weather-navigation perk;
- consumed Read Wind / Sextant preparation.

### Downstream consumers

Prepared effects feed only their explicit trigger:

- navigation departure;
- actual naval fire;
- dangerous personal defense.

Arcane Strain feeds later Arcane ability reliability and the existing qualitative specialization-status display.

Voyage quality feeds real weather-hazard damage after departure.

### Explicit non-collisions

- **A0.1A vessel lifecycle:** no defeated/captured/sunk state or prize pipeline changed.
- **A0.1B NPC planner:** world-time recovery is passive character state only; it does not replan ships or add scheduler entries.
- **A0.1C economy:** no stock/price/production/import behavior changed. Time continues through the same `advanceWorld()` path.
- **A0.2A information:** ability events remain canonical history; information can read them later, but historical events no longer own a buff.
- **A0.2B progression:** ability/check practice still goes through the existing cadence engine. Deck Drill world time naturally crosses Arcane-Strain recovery boundaries rather than calling a special recovery function itself.
- **Weather:** navigation quality modifies damage only; the weather trigger stays in the travel/weather logic.
- **R1 law:** untouched.
- **Presentation:** no geometry/art ownership change.

## 5. Expansion safety

No A0.2C behavior branches on Veyrholm, Ironhaven, Skeldra or any named future region.

- New ports automatically share the same world clock and voyage-quality behavior.
- New routes use the same departure/hazard chain.
- New cultures/regions do not need separate Arcane Strain logic.
- Future prepared abilities add a trigger/context rule rather than an independent “recent event” lookup/timer.
- Ship-bound preparation is tied to ship ID so it cannot silently follow the captain onto a different vessel in future ship-acquisition/capture gameplay.

## 6. Save and database compatibility

Save schema remains **v12**.

New `preparedEffects` and `voyage.navigationQuality` are optional/additive runtime fields. On v12 load:

- Arcane Strain is normalized from `attunement.arcaneStrain` into the condition mirror;
- if an old save has no prepared-effect field, at most one still-unexpired successful legacy event per supported ability is converted into explicit prepared state;
- once explicit prepared state exists, historical world events are no longer consulted as the active-effect owner.

Supabase migration `0011_alpha_06d_a0_2c_prepared_effects.sql` adds an additive `prepared_effects jsonb` field to the normalized `character_capabilities` boundary. The full versioned `game_saves.snapshot` remains the canonical cloud-save owner in this alpha.

## 7. Verification

- TypeScript alpha typecheck: PASS
- Alpha compile: PASS
- Full automated suite: **350/350 PASS**
- A0.2C dedicated prepared-effect/strain/navigation/database/cohesion tests: **11/11 PASS**
- Existing 1000-day NPC-planner durability regression: PASS
- Existing 1000-day integrated economy/planner durability regression: PASS
- Art-layout verification: **2/2 PASS**
- Next production build: unavailable in this environment because the local `next` executable is not installed

## 8. Deferred

A0.2C does not absorb unrelated audit work. Still deferred to the proper owners:

- A0.2D crime witness → information travel → authority receipt → warrant/adjudication lifecycle;
- port/service capability authority;
- character-build consequence/learning-source connection;
- minimal live kingdom/politics/religion/world-event bridge;
- R2 dynamic trade law, customs, smuggling and privateering.
