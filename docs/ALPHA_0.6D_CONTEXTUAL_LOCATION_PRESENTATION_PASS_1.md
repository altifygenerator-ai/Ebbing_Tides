# Alpha 0.6D — Contextual Location Presentation Pass 1

## Purpose
Restore the illustrated CRPG sense of *entering a place* without undoing the simpler contextual port flow established in Alpha 0.6D.

## Locked presentation pattern
For reusable port activities:

1. Regional, location-type scene artwork fills the top presentation band.
2. The artwork owns only the static category identity (MARKET, TAVERN, HARBOR, ROYAL PALACE, TEMPLE, PEOPLE), its static symbol, and mild decorative trim.
3. Code immediately below owns the dynamic settlement/entity name.
4. All mechanics, buttons, prices, NPCs, descriptions, and state remain code-owned below the dynamic heading.

This preserves **ONE VISUAL STRUCTURE = ONE GEOMETRY OWNER**.

## Skeldran runtime scene set
All six source generations were cropped to remove external white canvas and normalized to **2172×500**:

- Market
- Tavern
- Harbor
- Royal Palace
- Temple
- People

The same regional scene is intentionally reused by every Skeldran settlement of that activity type. Future regions receive their own equivalent six-piece sets. A major settlement may later intentionally override a regional default, but this is not required for the baseline.

## Implemented screens
### Market
Scene → centered `PORT Exchange` → `Current Prices` → dynamic commodity mechanics + Captain's Read.

### Tavern
Scene → centered `PORT Tavern` → rumor/conversation and crew-ashore actions.

### Harbor / Shipyard
Scene → centered `Ship / SHIP NAME` → Harbor/Ship switcher → shipyard work/services or ship overview.

The harbor service view now makes supplies, hull, sails, rigging, supply price, and full-repair price explicit.

### Royal Palace / Government
Scene → centered actual government institution name → authority description/actions.

### Temple
Scene → centered actual local religious institution/district name → worship/counsel description/actions.

### People
Scene → centered `People of PORT` → known people and dialogue interactions.

## Architecture
- Contextual scene art: Environment/Backdrop presentation layer.
- Dynamic names and mechanics: Art-Skinned Dynamic UI.
- Existing ship management remains Hybrid underneath the contextual harbor presentation.
- No fake painted buttons, tables, NPC names, prices, or dynamic state were baked into runtime interaction geometry.

## Status
Functional implementation complete. Manual visual inspection required before declaring the contextual presentation pattern a final reusable regional standard.
