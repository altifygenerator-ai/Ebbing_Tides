# Ebbing Tides — A0.1C

Third P0 repair from the full A0 systems/canon/cohesion/campaign-durability audit.

This overlay replaces autonomous target-seeking market restock with one shared settlement economy, connects materialized NPC merchant cargo and ship provisioning to the same market inventory used by the player, fixes cargo-unit consistency in sailing load, and closes the adjacent routine-contract expiry leak exposed by a recurring economy.

Base: `0.6.0-alpha.d.a0-1b`  
Package: `0.6.0-alpha.d.a0-1c`  
Save schema: v12 unchanged.

The accepted Market, Ship/Harbor, Navigation, Captain, Crew, Combat, and contextual-location geometry is preserved. The only intentional player-visible change is that a six-unit ship-stores purchase now displays its live harbor price and can be unavailable when the settlement genuinely lacks enough staple provisions.

Expansion rule: the economy engine does not branch on named future regions/ports. Active ports receive markets through the runtime port registry; settlement production/availability is derived from settlement/region economic data, with small legacy Skeldran overrides kept as content data rather than engine logic. Future canonical settlement profiles can already derive commodity flows through the same engine.
