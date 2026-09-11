# Alpha 0.6C Hotfix 6 — Art-First Captain / Companion Equipment UI

This pass finishes the earlier equipment-screen art work as a real implementation layer instead of leaving it as a detached mockup.

## What changed

- Added two production-facing base UI art assets:
  - `public/art/ui/equipment_template_male.png`
  - `public/art/ui/equipment_template_female.png`
- Rebuilt the **Captain → Inventory / Equipment** screen so the generated UI art is the bottom layer.
- Added overlay slot mapping for equipment hitboxes on top of the art.
- Added overlay item rendering so equipped items display in the designed paperdoll slots.
- Added overlay right-side inventory grid aligned to the art panel.
- Added overlay detail panel in the lower-right item-inspection area.
- Added sex-based template selection:
  - male player / NPCs use the male base screen
  - female player / NPCs use the female base screen
- Applied the same art-first pattern to named companion inventory/equipment screens.
- Added quick equip support:
  - select an item in the grid
  - compatible equipment slots highlight
  - click a highlighted empty slot to equip there
  - click a filled slot to unequip

## Files touched

- `src/alpha/main.ts`
- `public/alpha/styles.css`
- `public/art/ui/equipment_template_male.png`
- `public/art/ui/equipment_template_female.png`

## Notes

- The underlying current equipment model still does not include a dedicated `belt` equipment slot type, so the belt frame remains part of the base art but is not yet an active gameplay slot.
- The captain screen remains split into:
  - `Character Sheet`
  - `Inventory / Equipment`
- Companions keep their reduced equipment-rule set, but now render through the same art-first UI approach.
