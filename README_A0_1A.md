# Ebbing Tides — A0.1A

First P0 repair from the A0 full systems audit.

This overlay fixes the vessel/combat terminal lifecycle so a defeated/captured persistent ship is resolved once, removed from ordinary traffic/planning, and cannot pay a duplicate prize. Naval and boarding victories now feed one authoritative prize pipeline, including crew share and R1 legal hooks. Emergency Hull Shoring also respects the actual vessel hull maximum.

Base: `0.6.0-alpha.d.rpg-r1.2`  
Package: `0.6.0-alpha.d.a0-1a`  
Save schema: v12 unchanged.

No R2 mechanics and no accepted UI redesign are included.
