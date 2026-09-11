# Ebbing Tides — A0.2C

Prepared Effects / Arcane Strain / Navigation-Quality repair from the full A0 systems/canon/cohesion/campaign-durability audit.

Base: `0.6.0-alpha.d.a0-2b`  
Package: `0.6.0-alpha.d.a0-2c`  
Save schema: **v12 unchanged**

This pass stops successful ability-use history from acting like a reusable buff. Abilities that promise a later check now create explicit bounded prepared state with a trigger, context, lifetime and one remaining use. Read-only previews do not consume it; the first valid matching check does.

Arcane Strain now has a complete minimum viable lifecycle: Arcane practices add bounded strain, current strain reduces later Arcane reliability at qualitative thresholds, and strain naturally dissipates through the same authoritative world clock at one point per six crossed hours. `attunement.arcaneStrain` is the single mechanical owner; `condition.arcaneStrain` is synchronized only as compatibility/display state.

The navigation departure check now persists into the active voyage as route-planning quality. It does not invent or erase weather. Instead, when an actual voyage hazard occurs, good navigation reduces the consequence and poor navigation worsens it. Read Wind and Calibrated Sextant therefore affect both the departure check and a real downstream voyage outcome.

Cohesion rule: historical `WorldEvent` rows remain history, `PreparedAbilityEffect` owns pending preparation, `GameState.absoluteHour` owns recovery/expiry, combat/travel consume their own matching preparation, and navigation quality modifies hazard consequences without becoming a second weather system.

Expansion rule: none of these mechanics branch on a named port, region, culture or future world area. New locations inherit world-time, travel and hazard behavior automatically; future prepared abilities register a trigger/context rule rather than inventing their own timers.
