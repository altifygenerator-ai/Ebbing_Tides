# Ebbing Tides Alpha 0.6C Hotfix 3 — Art Usage Summary

This document lists the art that is currently live in the build, where it came from, and where it was placed.

## UI / Feature work added in Hotfix 3
- Personal inventory changed from long vertical item cards to a compact grid inventory.
- Item details now appear in a focused detail panel after selecting an item.
- Equipped view now uses a static painted paperdoll background rather than the previous placeholder mannequin.
- Equipment slots remain interactive and overlay the paperdoll art.

## Generated specifically for Hotfix 3
### New paperdoll asset
- **Generated asset:** `public/art/ui/paperdoll_captain.png`
- **Use:** static paperdoll background for the Captain equipment screen and companion equipment screens.
- **Reason:** replaces the placeholder rounded silhouette with a more game-fitting painted character figure.

## Art integrated from uploaded files

### From `approved.zip`
#### Port art
- `approved/approved/skeldra/port_environment/stormvik/stormvik-establishing.png`
  - placed at `public/art/ports/stormvik_establishing.png`
  - used by **Stormvik** port scene
- `approved/approved/asteria/port_environment/2026-09-07--371adb9b-1a3a-4304-84d8-024803fc17dd/port_environment.asteria.delphara__establishing__v1__03fc17dd__04.png`
  - placed at `public/art/ports/delphara_establishing.png`
  - used by **Delphara** port scene

#### POI art
- `approved/approved/outer_isles/environment_poi/2026-09-07--e4baf58b-197d-4582-a635-946566318e0f/environment_poi.outer_isles.greywater-wrecks__environment-poi__v1__66318e0f__04.png`
  - placed at `public/art/pois/greywater_wrecks_establishing.png`
  - used by **Greywater Wrecks** POI scene

### From `canonical.zip`
#### Port art
- `canonical/canonical/approved_anchors/Asterra_PORT_ESTABLISHING_APPROVED_DIRECTION.png`
  - `public/art/ports/asterra_establishing.png`
  - live for **Asterra**
- `canonical/canonical/approved_anchors/Vespera_PORT_ESTABLISHING_APPROVED.png`
  - `public/art/ports/vespera_establishing.png`
  - live for **Vespera**
- `canonical/canonical/approved_anchors/Nagara_PORT_ESTABLISHING_APPROVED_NEAR_FINAL.png`
  - `public/art/ports/nagara_establishing.png`
  - live for **Nagara**
- `canonical/canonical/approved_anchors/Tyras_PORT_ESTABLISHING_APPROVED.png`
  - `public/art/ports/tyras_establishing.png`
  - live for **Tyras**
- `canonical/canonical/approved_anchors/Blackhaven_PORT_ESTABLISHING_APPROVED.png`
  - `public/art/ports/blackhaven_establishing.png`
  - live for **Blackhaven**
- `canonical/canonical/approved_anchors/Ironhaven_PORT_ESTABLISHING_APPROVED.png`
  - `public/art/ports/ironhaven_establishing.png`
  - live for **Ironhaven**
- `canonical/canonical/approved_anchors/Veyrholm_PORT_ESTABLISHING_APPROVED.png`
  - `public/art/ports/veyrholm_establishing.png`
  - live for **Veyrholm**

#### POI art
- `approved/approved/skeldra/port_environment/2026-09-07--c8d46182-560d-4a61-b29e-054c320e013a/port_environment.skeldra.old-veyr-beacon__establishing__v1__320e013a__04.png`
  - `public/art/pois/old_veyr_beacon_establishing.png`
  - live for **Old Veyr Beacon**
- `canonical/canonical/outer_isles/environment_poi/2026-09-07--0539b5d2-7674-4cea-8fb8-52c4117c12a6/environment_poi.outer_isles.widow-s-passage__environment-poi__v1__117c12a6__03.png`
  - `public/art/pois/widows_passage_establishing.png`
  - live for **Widow's Passage**

### From `Ebbing_Tides_Ability_Icons_Package_2026-09-07.zip`
These were copied into `public/art/ui/abilities/` and assigned in the character interface to make the ability section feel more complete.

- `Arcane_Abilities/01_Read_Wind.png` → `public/art/ui/abilities/read_wind.png`
- `Arcane_Abilities/02_Personal_Ward.png` → `public/art/ui/abilities/personal_ward.png`
- `Arcane_Abilities/03_Sense_Resonance.png` → `public/art/ui/abilities/sense_resonance.png`
- `Industrial_Abilities/01_Emergency_Hull_Shoring.png` → `public/art/ui/abilities/emergency_hull_shoring.png`
- `Industrial_Abilities/02_Calibrated_Sextant_Method.png` → `public/art/ui/abilities/calibrated_sextant_method.png`
- `Industrial_Abilities/03_Precision_Bore_Sighting.png` → `public/art/ui/abilities/precision_bore_sighting.png`

### From `Ebbing_Tides_Named_Ship_Tokens_Package_2026-09-07(1).zip`
All token files were copied into `public/art/ships/named/`. The following are actively assigned to ships in the live seed data:

- `01_Tideworn__Skeldra__Skeldran_Coastal_Sloop__token.png`
  - used for player ship **Tideworn**
- `02_Stormcrow__Skeldra__Skeldran_Modern_Battle_Frigate__token.png`
  - used for **Stormcrow**
- `03_Providence__Skeldra__Skeldran_Armed_Merchant__token.png`
  - used for **Providence**
- `04_Ash_Gull__Outer_Isles__Refitted_Coastal_Raider__token.png`
  - used for **Ash Gull**
- `05_Iron_Finch__Skeldra__Skeldran_Industrial_Coaster__token.png`
  - used for **Iron Finch**
- `06_Freyras_Grace__Skeldra__Skeldran_Fishing_Cutter__token.png`
  - used for **Freyra's Grace**
- `07_Hearthward__Skeldra__Skeldran_Packet__token.png`
  - used for **Hearthward**

Additional token files copied for future assignment but not yet actively seeded live:
- `08_Widows_Mercy__Outer_Isles__Class_Not_Yet_Canon-Locked__token.png`
- `09_Gilded_Knife__Outer_Isles__Class_Not_Yet_Canon-Locked__token.png`

## Core files changed for Hotfix 3
- `src/alpha/main.ts`
- `public/alpha/styles.css`
- `public/art/ui/paperdoll_captain.png`
- `public/alpha/index.html`
- `src/app/layout.tsx`
- `src/app/page.tsx`

## Verification
- Alpha TypeScript build: PASS (`npx tsc -p tsconfig.alpha.json`)
- Full regression suite: **137/137 PASS** (`npm test`)
- Served smoke test: `/alpha/index.html`, `/alpha/js/alpha/main.js`, and `/art/ui/paperdoll_captain.png` all returned HTTP 200.
