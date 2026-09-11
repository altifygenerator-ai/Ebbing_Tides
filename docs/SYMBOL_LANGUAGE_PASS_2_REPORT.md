# Ebbing Tides — Symbol Language Pass 2 Report

Status: **IMPLEMENTED — pending manual visual inspection / later cleanup as needed**  
Scope: **remaining current UI identity contexts after player-facing Pass 1**  
Base checkpoint: **Alpha 0.6C Symbol Language Pass 1 — Player Identity**

## Hard boundary

Pass 2 extends the approved symbol language into existing NPC, ship, port, institution, journal, navigation, encounter, and combat contexts. It is not a UI redesign. Approved layout, panel geometry, art/code ownership, scroll ownership, interaction structure, map geometry, and production screen architecture remain unchanged. All new marks are either small overlays or replacements inside an already-existing identity slot. No save-schema change was introduced.

The approved 2026-09-07 symbol reference package remains authoritative. Runtime derivatives are presentation assets only and retain their approved source references.

## Identity and knowledge rules

Pass 2 keeps the conservative identity priority established in Pass 1: explicit house/faction/settlement affiliation when actually present, then homeland/polity, then culture, then ancestry. Faith remains a separate channel and is never inferred from geography. Formal naval insignia requires explicit service/rank evidence.

Unaligned characters and ships remain unaligned. A Blackhaven/Outer Isles character can receive secular Blackhaven/Outer Isles identity without receiving a religion. Civilian Skeldran sailors do not receive Royal Navy rank/service insignia simply because they have nautical professions. Hidden or unidentified contacts do not gain identifying insignia in the UI before the player has identified them.

## Pass 2 integrations

### Companion / NPC Equipment

The existing equipment identity-banner footprint now resolves against the inspected NPC instead of using player-only handling. The equipment layout, item grid, body art, slot geometry, and item-detail UI are unchanged. Religion is still not placed on the equipment banner.

### Crew Roster and Crew Inspector

The existing crew-roster identity mark slot now uses the crew member's primary secular identity where a canonical NPC exists, with the old initial-letter fallback retained for ordinary unnamed crew. The inspector sidebar adds compact identity marks without changing its card structure. Faith appears in the detailed inspector only when actually present; formal service insignia appears only when explicit service evidence exists.

### People / Dialogue

Existing NPC cards and dialogue panels receive compact public identity marks. Faith is shown in public-facing contexts only where the NPC's role/profession explicitly presents them as religious (for example priest/cleric/temple roles). A character's private religion is not automatically exposed as a public badge in every conversation.

### Ports / Arrival / Institutions / Tavern / Market

Existing port-context cards receive a small regional/civic mark. Government screens use explicit institutional context. Veyrholm's Royal Palace & Admiralty can show House Vaering plus the approved Skeldran naval unit pennant; other current Skeldran government contexts use the restrained regional mark. Religion screens use the explicitly authored current-alpha religious landscape: mixed Veyrholm/Ironhaven districts can show Old Gods + Covenant marks; Stormvik/Thorenfjord use Old Gods context only.

Market, tavern, and port-arrival cards receive only a small location-context mark. Market tables, prices, buttons, location art, and card geometry are unchanged.

### Ship Management

The existing ship artwell receives a compact ship-context mark. Named ship identity takes priority where an approved named mark exists. `Ash Gull` uses its approved Outer Isles ship mark. A formal Skeldran Navy vessel can use the approved naval unit pennant only when its owner/service state explicitly establishes Royal Navy service. Privateers and merchants do not inherit naval insignia. Faith is never inferred onto ships.

Port Work uses the current port mark only; the refit/repair/cargo UI structure is unchanged.

### Journal Contacts

Identified ship contacts can display the ship-context mark. Unidentified contacts intentionally display no identifying mark. This preserves the existing intelligence / lore firewall rather than leaking hidden faction or ship identity through decoration.

### Navigation Context

The selected destination card can show a small port identity mark. The navigation chart itself, route geometry, map cells, ship token positions, POI marks, and coordinate-authoritative map implementation are untouched.

### Naval Encounter

Player and identified opposing ship regions can show compact ship marks. Enemy insignia is withheld until the encounter is identified. This pass does not resolve the separate high-resolution tactical-sea art blocker and does not redesign Naval Encounter.

### Personal Combat

Existing player/opponent combatant cards receive compact identity marks. The player uses current primary identity. NPC opponents use the same public identity rules as People/Dialogue, including the restriction on public faith and formal service insignia. Turn/AP/stance/combat mechanics and card geometry are unchanged.

## Approved new runtime derivatives added in Pass 2

- Skeldran naval ship/unit pennant — approved source: `SYMBOL-02_Skeldran_Naval_Insignia/field_pennant_mark_ships_units.png`
- Skeldran Royal Navy Captain rank mark — approved source: `SYMBOL-02_Skeldran_Naval_Insignia/rank_captain.png`
- Ash Gull named ship mark — approved source: `SYMBOL-09_Outer_Isles_Marks/ash_gull_mark.png`

These join the 10 Pass 1 runtime derivatives. All 13 runtime symbol assets are transparent RGBA presentation derivatives.

## Color policy

Pass 2 keeps the Pass 1 policy: minimal and subtle. Context marks use restrained parchment/ink treatment and do not recolor whole screens. No new faction-wide UI theme system was introduced.

## Intentionally untouched

- coordinate-authoritative navigation-map symbol geometry
- POI glyph language unless already part of an identity card
- settings / save-load controls
- developer simulation tooling
- raw gameplay/status icons that are not identity symbols
- broad decorative rune scattering
- future NPC/ship affiliations that are not yet canonical
- missing regional/house/religious marks not present in approved references

## Validation

- Alpha TypeScript typecheck: **PASS**
- Standalone Alpha build: **PASS**
- Full inherited + Pass 1 + Pass 2 regression suite: **190 / 190 PASS**
- Art-layout verification: **PASS — 3 layouts, 0 failures**
- Runtime symbol derivative verification: **13 / 13 PNGs decode with alpha**
- Save schema: **unchanged at v10**
- Manual visual inspection: **pending**

A headless local browser capture could not be used in the build environment because local-browser navigation is organization-blocked there; automated structural/asset/build verification is clean. Final visual acceptance remains the user's manual inspection, consistent with the UI Recovery approval rule.
