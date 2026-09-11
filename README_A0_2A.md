# Ebbing Tides — A0.2A

Information Durability & Ownership repair from the full A0 systems/canon/cohesion/campaign-durability audit.

Base: `0.6.0-alpha.d.a0-1c`  
Package: `0.6.0-alpha.d.a0-2a`  
Save schema: **v12 unchanged**

This pass makes `PlayerState.knowledge` the single mutable campaign-intelligence ledger, imports/clears the older character-capability knowledge collection on create/load, gives claims stable semantic keys, supports refresh/staleness/contradiction/supersession, makes port reads and live rumors recurring without infinite duplicate growth, and introduces coarse physical public-news travel between registered ports.

Cohesion is deliberately one-way where appropriate: A0.2A **reads** A0.1B NPC arrival events and A0.1C market state as information sources but does not move NPCs, alter markets, or create substitute economic state. Crime/law information is explicitly excluded until A0.2D.

Expansion rule: information delay is derived through the active port registry and navigable sea distance, not named-port branches. Newly activated ports inherit the same system automatically.
