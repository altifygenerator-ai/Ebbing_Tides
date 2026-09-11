# Ebbing Tides — A0.1B

Second P0 repair from the full A0 systems audit.

This overlay repairs the long-campaign NPC travel deadlock, keeps NPC logical port location aligned with the ship's real physical state, turns survival shortfalls into a recoverable return-to-port lifecycle, and compacts transient scheduler wakeups instead of serializing cancelled/processed records forever.

Base: `0.6.0-alpha.d.a0-1a`  
Package: `0.6.0-alpha.d.a0-1b`  
Save schema: v12 unchanged.

The economy is intentionally not rewritten here. NPC port provisioning is centralized so A0.1C can replace its source with the future unified market/economy model without creating a second resupply mechanic.
