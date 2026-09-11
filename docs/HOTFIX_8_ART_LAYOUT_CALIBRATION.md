# Alpha 0.6C Hotfix 8 — Art Layout Calibration & Overlay Infrastructure

## Purpose

This hotfix implements the reusable presentation infrastructure required by the permanent Ebbing Tides Art-First rule. It is intentionally **not** another one-off equipment patch. The goal is to make approved artwork the layout authority while code supplies precisely aligned dynamic state.

## Reusable infrastructure

### `ArtDirectedCanvas`

File: `src/artLayouts/ArtDirectedCanvas.ts`

Provides:

- one fixed aspect-ratio coordinate space tied to native art dimensions
- base artwork rendered without independent cropping
- normalized region placement from `0.0` to `1.0`
- arbitrary dynamic region layers
- interaction regions
- opt-in calibration/debug visualization
- native and rendered dimensions
- current scale readout
- normalized cursor coordinates
- selectable regions
- drag-to-move calibration
- Shift-drag / lower-right-handle resize calibration
- `Copy Region Values` JSON output for normalized coordinates

Calibration can be enabled with:

- `?artCalibration=1`
- **Alt+Shift+C** while the Alpha is running

The production UI remains unchanged when calibration mode is off.

## Central layout registry

- `src/artLayouts/types.ts`
- `src/artLayouts/registry.ts`

Current registered layouts:

- `ui.character.equipment.male`
- `ui.character.equipment.female`

Each layout references a **logical asset ID** and its native dimensions rather than relying on a fragile hardcoded image path in the renderer.

## First production migration — equipment / inventory

The current Captain and named-companion Inventory / Equipment presentation now renders through `ArtDirectedCanvas`.

Base assets:

- `ui.character.equipment.male.empty` → `/art/ui/equipment_template_male.png`
- `ui.character.equipment.female.empty` → `/art/ui/equipment_template_female.png`

Independent manifests:

- `src/artLayouts/character/equipmentMale.ts`
- `src/artLayouts/character/equipmentFemale.ts`

The two variants intentionally **do not share one coordinate map**. They share semantic region IDs where appropriate, but each stores its own normalized geometry.

Mapped region types include:

- equipment slots: head, neck, cloak, chest, main hand, off hand, hands, belt anchor, accessory/ring positions, legs, relic/charm, tool, boots
- inventory filter buttons
- inventory grid
- selected-item detail area
- dynamic character/ship/stat text areas

The underlying gameplay equipment model remains unchanged. The painted Belt slot is mapped for calibration/future use but remains disabled as a gameplay equipment slot until the equipment rules intentionally add one.

## Dynamic equipment flow

The item does not contain screen coordinates.

Flow:

`ItemDefinition → gameplay EquipmentSlot → semantic art region → normalized manifest coordinates → ArtDirectedCanvas layer`

Therefore changing the artwork or recalibrating a slot does not require changing item definitions or gameplay logic.

## Responsive behavior

The entire art canvas scales as one unit. The base art and every overlay share the same normalized coordinate system, so scaling cannot independently move an item away from its painted slot.

Automated geometry checks cover:

- 1920 × 1080
- 1600 × 900
- 1440 × 900
- 1366 × 768

Results are written to:

- `docs/visual-qa/art-layout-calibration/resolution-verification.json`

## Visual QA proof

The package includes male and female proof sets under:

- `docs/visual-qa/art-layout-calibration/`

For each sex variant:

- `*_A_calibration.png` — mapped regions visible over the approved empty artwork
- `*_B_production.png` — calibration off / production presentation
- `*_C_populated.png` — representative dynamic equipment and inventory content occupying mapped regions

## Future migrations

Existing presentation-critical screens are **not** to be torn apart merely because this infrastructure now exists. They should migrate incrementally when their art-directed version is being worked on:

1. register approved art
2. create a layout manifest
3. calibrate mapped regions
4. connect the existing system/data
5. verify alignment
6. remove obsolete generic layout code only after the art-directed version passes

The gameplay system remains authoritative for behavior; approved artwork remains authoritative for presentation.
