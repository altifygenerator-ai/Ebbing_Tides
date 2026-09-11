# Ebbing Tides — A0.2B

Progression Cadence / Anti-Farming repair from the full A0 systems/canon/cohesion/campaign-durability audit.

Base: `0.6.0-alpha.d.a0-2a`  
Package: `0.6.0-alpha.d.a0-2b`  
Save schema: **v12 unchanged**

This pass replaces finite recent-key queues with world-time/context cadence records for Life Experience and skill practice, so rotating unrelated action IDs can no longer restore full progression at the same world hour. Recurring activity becomes meaningful again after believable elapsed campaign time instead of after queue eviction.

Deck Drill is brought into the same world clock: each drill consumes two hours, practice shares a First-Mate-specific training cadence, and routine sparring can only build modest professional respect at a slow cadence and only up to a moderate ceiling. First Mate name/Blades skill are read dynamically rather than hardcoded to Mira Holst.

Cohesion rule: A0.2B advances time through the existing `advanceWorld` owner, so NPC planning, the A0.1C economy, contract clocks, information age, and every other time consumer remain synchronized. It does not create a second training clock or separate progression timer.

Expansion rule: progression cadence keys are semantic activity/event context, never region-specific branches. New ports, cultures, professions, teachers, combats, voyages and POIs can feed the same progression engine without altering its cadence rules.
