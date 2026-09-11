# Ebbing Tides — A0.3C

Minimal Live Kingdom / Policy / Religion / World-Event Bridge for Alpha 0.6D.

Base: `0.6.0-alpha.d.a0-3b3`  
Package: `0.6.0-alpha.d.a0-3c`  
Save schema: **v12 unchanged**

A0.3C adds one campaign-owned `worldCauses` state layer for live political, religious, emergency, and economic causes that other repaired systems can consume without inventing their own copies of war, famine, embargo, or policy truth.

The bridge can represent `war`, `embargo`, `famine`, `emergency_decree`, `religious_policy`, `ruler_change`, and `economic_disruption`. Causes are scoped by ordinary region/jurisdiction/faction/port data rather than named-port engine branches, may be time-bounded on the canonical `absoluteHour` clock, and retain historical start/resolution events after their current operational row is compacted.

A cause changes **causal inputs**, not finished outcomes. Economy consumes production, off-screen supply/import, and consumption multipliers, so prices continue to arise from the same live market stock. NPC planning consumes route/traffic pressure. Contracts consume institutional procurement demand. A0.2D legal reporting can consume institutional transmission delay. Later R2 can query the same active cause rows and policy tags. A0.3C itself does not directly add price markups, heat, warrants, standing penalties, customs rules, contraband classifications, privateering, or wartime aggression.

Public knowledge stays owned by A0.2A. A public cause creates a normal public-information-capable `WorldEvent` at an origin location; distant ports only surface it after physical information travel can plausibly reach them. The Journal does not expose world-cause history merely because the simulation knows it. Existing Government/Religion context can show concise current public notices when the information has physically reached that port. There is no strategy dashboard.

No synthetic Day-1 war, famine, embargo, religious crackdown, or ruler change is seeded. A0.3C establishes the authoritative machinery without inventing canon events the user has not approved.

Operational `worldCauses` history is bounded to all active rows plus the latest 96 terminal rows; permanent historical start/end truth remains in `worldEvents`.

A0.3C preserves the accepted navigation, contextual-port grammar, Character Creator/Captain geometry, Crew UI, Naval Combat Pass 1, Journal geometry, and the A0.3B1-B3 interaction/UX lock. It is a systemic bridge, not an art or layout pass.
