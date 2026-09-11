# Ebbing Tides Alpha 0.6D — RPG R1.1
## Standing / Relationships UI Cleanup

**Base:** RPG R1 (`0.6.0-alpha.d.rpg-r1`)  
**Package:** `0.6.0-alpha.d.rpg-r1.1`  
**Save schema:** v12 unchanged

R1.1 closes the scaling problem on the Captain record before R2. It does not add new reputation/law mechanics.

### Implemented
- **Standing & Law / Known Powers** is now a native code-owned accordion.
- **Personal Relationships / People Who Know You** is now a native code-owned accordion.
- **Ports / Local Standing** is now a native code-owned accordion.
- Closed headers retain useful information instead of hiding everything:
  - Known Powers: count plus active warrant / highest-priority legal state.
  - Personal Relationships: count plus the current highest-priority relationship.
  - Local Standing: count plus the current port and its standing when known.
- Standing & Law automatically remains open when legal trouble is active.
- Small relationship/port lists remain open; larger lists collapse by default so the Captain sheet does not grow without bound.
- Expanded Personal Relationships now shows the complete significant-person list rather than stopping at six entries.
- Standing sort now prioritizes legal severity, current jurisdiction, then strong standing differences.
- Accordion header/body geometry is explicitly code-owned and reserved for the future painted Culture-primary / Religion-accent art system.

### Deferred
R2 remains a separate design discussion before implementation. No smuggling, customs, contraband, Letters of Marque, privateering authorization, or war-diplomacy work is included here.

### Verification
- TypeScript: PASS
- Alpha compile: PASS
- Automated tests: 298/298 PASS
- Art-layout verification: 2/2 PASS
- Save schema: v12 unchanged
- Next production build: unavailable in packaging environment (`next` executable not installed)
