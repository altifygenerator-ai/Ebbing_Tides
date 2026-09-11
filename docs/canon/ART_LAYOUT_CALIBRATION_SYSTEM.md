# DEV DIRECTIVE — ART-FIRST LAYOUT CALIBRATION SYSTEM

## STATUS: PROJECT-WIDE INFRASTRUCTURE REQUIREMENT

Implement a reusable **Art Layout Calibration & Overlay System** for Ebbing Tides.

This is not only for the current equipment/inventory screen.

It must become the standard implementation method for all current and future player-facing screens governed by the Ebbing Tides **ART-FIRST UI & PRESENTATION RULE**.

The purpose is to guarantee that coded systems line up precisely with the approved production artwork.

---

## CORE ARCHITECTURE

Every art-first screen should follow:

```
```

```
APPROVED BASE ART
        ↓
FIXED ART CANVAS
        ↓
NORMALIZED REGION / ANCHOR MANIFEST
        ↓
INTERACTIVE SYSTEM OVERLAYS
        ↓
DYNAMIC CONTENT
        ↓
DEBUG / CALIBRATION MODE
```

The base artwork controls the composition.

The system must conform to the artwork.

Do not recreate the composition independently with generic CSS.

---

# 1. BUILD A REUSABLE ART CANVAS COMPONENT

Create a reusable component/system such as:

```
```

```
ArtDirectedCanvas
```

or equivalent.

It should accept:

```
```

```
artAsset
nativeWidth
nativeHeight
regions
dynamicLayers
debugMode
```

Conceptually:

```
```

```
<ArtDirectedCanvas
  art="/art/ui/equipment/male_empty.png"
  nativeWidth={1600}
  nativeHeight={1000}
  regions={maleEquipmentLayout}
/>
```

The component must:

-  preserve the native artwork aspect ratio 
-  scale the artwork and overlays together 
-  never independently crop the artwork 
-  provide one consistent coordinate space 
-  support dynamic overlays 
-  support interaction regions 
-  support debug visualization 

---

# 2. NORMALIZED COORDINATE MANIFESTS

All dynamic regions should be stored in manifests.

Do not hardcode random CSS positions inside individual components.

Example:

```
```

```
export const maleEquipmentLayout = {
  canvas: {
    width: 1600,
    height: 1000
  },

  regions: {
    head: {
      x: 0.465,
      y: 0.105,
      width: 0.082,
      height: 0.095
    },

    chest: {
      x: 0.450,
      y: 0.315,
      width: 0.105,
      height: 0.130
    },

    hands: {
      x: 0.655,
      y: 0.438,
      width: 0.074,
      height: 0.112
    },

    boots: {
      x: 0.470,
      y: 0.825,
      width: 0.100,
      height: 0.085
    }
  }
}
```

Coordinates must be normalized between:

```
```

```
0.0 → 1.0
```

relative to the artwork.

This allows the entire interface to scale without losing alignment.

---

# 3. BUILD CALIBRATION MODE

Create a reusable development-only calibration mode.

When enabled, every mapped region should display:

-  visible outline 
-  region name 
-  x coordinate 
-  y coordinate 
-  width 
-  height 
-  center point 
-  optional anchor point 

Example:

```
```

```
┌─────────────┐
│ HANDS       │
│ x .655      │
│ y .438      │
│ w .074      │
│ h .112      │
└─────────────┘
```

Also display:

```
```

```
Native art:
1600 × 1000

Rendered art:
1280 × 800

Scale:
0.80
```

And show the mouse position relative to the artwork:

```
```

```
Cursor:
x .614
y .427
```

This will make precise placement much easier.

---

# 4. OPTIONAL DRAG / RESIZE EDITING

If practical, calibration mode should allow:

-  dragging regions 
-  resizing regions 
-  selecting regions 
-  displaying updated normalized coordinates 

It does not necessarily need to directly write source files automatically.

Even this is enough:

```
```

```
COPY REGION VALUES
```

producing:

```
```

```
{
  x: 0.655,
  y: 0.438,
  width: 0.074,
  height: 0.112
}
```

Then dev can paste the result into the manifest.

Automatic dev-only JSON export is even better.

---

# 5. CURRENT EQUIPMENT / INVENTORY SCREEN IS THE FIRST IMPLEMENTATION

Apply the new system immediately to the current character equipment screen.

Required current art variants:

```
```

```
equipment_male_empty
equipment_female_empty
```

Each should get its own layout manifest:

```
```

```
equipmentMale.layout.ts
equipmentFemale.layout.ts
```

They should share the same semantic IDs where appropriate:

```
```

```
head
neck
cloak
chest
hands
belt
mainHand
offHand
accessory
relic
legs
boots
```

But coordinates may differ between male and female art.

Do not assume one coordinate set fits both.

---

# 6. DYNAMIC ITEM RENDERING

Each equipment region becomes the container for the actual equipped item.

Conceptually:

```
```

```
<EquipmentSlot region="hands">
   <ItemIcon item={equippedHandsItem} />
</EquipmentSlot>
```

The item should not know where on the screen it belongs.

The slot manifest determines that.

So:

```
```

```
ItemDefinition
     ↓
equipment slot
     ↓
mapped art region
     ↓
render inside region
```

Example:

```
```

```
Skeldran Gloves
equipSlot = hands
```

automatically render in:

```
```

```
regions.hands
```

---

# 7. INVENTORY GRID SHOULD ALSO HAVE A DEFINED ART REGION

If the base art contains an inventory panel, define:

```
```

```
inventoryGrid: {
  x,
  y,
  width,
  height
}
```

The code then creates the grid **inside that exact painted region**.

Do not independently place the inventory beside the art using generic flexbox.

Example:

```
```

```
BASE ART
┌───────────────────────────────┐
│                               │
│ PAPER DOLL       INVENTORY    │
│                  ┌──────────┐ │
│                  │ □ □ □ □  │ │
│                  │ □ □ □ □  │ │
│                  │ □ □ □ □  │ │
│                  └──────────┘ │
└───────────────────────────────┘
```

The grid should occupy the visually intended space.

---

# 8. USE THIS FOR FUTURE ART-FIRST SCREENS

The same infrastructure must support future layouts such as:

### Character

```
```

```
character creator
equipment
inventory
character sheet
NPC profile
crew roster
```

### Ship

```
```

```
ship inspection
ship equipment
cargo hold
damage control
ship refit
crew stations
```

### Navigation

```
```

```
navigation map
regional chart
port arrival
POI interaction
```

### Combat

```
```

```
naval combat
boarding
personal combat
range display
target regions
```

### World screens

```
```

```
markets
taverns
temples
government
shipyards
special locations
```

The component should therefore be generic:

```
```

```
not:
EquipmentOverlaySystem

but:
ArtDirectedCanvas
```

with specialized systems layered over it.

---

# 9. CREATE A CENTRAL LAYOUT REGISTRY

Recommended structure:

```
```

```
src/
  artLayouts/
    character/
      equipmentMale.ts
      equipmentFemale.ts
      creator.ts

    ships/
      inspection.ts
      refit.ts
      cargo.ts

    navigation/
      regionalMap.ts

    combat/
      navalCombat.ts
```

Or equivalent.

Each layout references a logical asset ID rather than fragile hardcoded paths where possible.

Example:

```
```

```
{
  layoutId: "ui.character.equipment.male",
  assetId: "ui.character.equipment.male.empty",
  nativeWidth: 1600,
  nativeHeight: 1000,
  regions: {...}
}
```

This fits the project's existing logical asset registry approach.

---

# 10. SUPPORT REGION TYPES

A mapped region should be able to declare what it is:

```
```

```
type ArtRegionType =
  | "equipment_slot"
  | "inventory_area"
  | "button"
  | "text_area"
  | "portrait"
  | "viewport"
  | "ship_slot"
  | "map_area"
  | "hitbox"
  | "anchor"
  | "tooltip_origin";
```

This makes the infrastructure useful beyond equipment.

---

# 11. DO NOT BAKE DYNAMIC CONTENT INTO ART

Base artwork remains empty.

Never bake:

-  equipped items 
-  inventory 
-  player name 
-  stats 
-  health 
-  currency 
-  ship damage 
-  cargo 
-  market prices 
-  map markers 
-  relationship values 

into the artwork.

Those remain dynamic overlays.

---

# 12. RESPONSIVE BEHAVIOR

The art canvas must scale as one unit.

Bad:

```
```

```
background-size: cover;
```

if that results in cropped artwork while overlays remain positioned against the original canvas.

Preferred:

```
```

```
fixed aspect-ratio canvas
        ↓
art fills exact canvas
        ↓
all overlays use same coordinate space
```

Letterboxing or controlled surrounding UI is preferable to misalignment.

---

# 13. REQUIRED RESOLUTION TESTING

Test each art-first screen at minimum at:

```
```

```
1920 × 1080
1600 × 900
1440 × 900
1366 × 768
```

At every resolution:

> the overlay must remain aligned with the painted art regions.

If the glove icon moves off the painted glove slot as the window resizes, the implementation is wrong.

---

# 14. DEBUG SCREENSHOT ACCEPTANCE

For each major art-first implementation, provide:

### Screenshot A

```
```

```
CALIBRATION MODE ON
```

showing mapped regions directly over the artwork.

### Screenshot B

```
```

```
CALIBRATION MODE OFF
```

showing the actual production presentation.

### Screenshot C

```
```

```
DYNAMIC CONTENT POPULATED
```

showing representative items/content occupying the correct regions.

This gives us visual proof that implementation matches the approved art.

---

# 15. CURRENT ART MIGRATION

Do not throw away current implementation work.

Instead:

1.  Identify current presentation-critical screens. 
2.  Determine which already have approved art. 
3.  Convert those screens incrementally to `ArtDirectedCanvas`. 
4.  Create region manifests. 
5.  Align current interactions through calibration mode. 
6.  Remove obsolete generic layout code once the art-directed version is verified. 

Do not break working underlying systems merely to change presentation.

The systems remain.

Their presentation is migrated onto the art layer.

---

# 16. FUTURE DEVELOPMENT RULE

Whenever new approved UI art arrives, the workflow becomes:

```
```

```
NEW APPROVED ART
      ↓
register asset
      ↓
create art layout manifest
      ↓
map regions using calibration mode
      ↓
connect existing system/data
      ↓
verify alignment
      ↓
ship
```

Do not rebuild the underlying gameplay system merely because new visual art was supplied.

Art defines presentation.

Systems supply behavior.

---

# ACCEPTANCE CRITERIA FOR THIS INFRASTRUCTURE

This task is complete when:

- `ArtDirectedCanvas` or equivalent reusable system exists 
-  normalized region manifests exist 
-  calibration/debug mode exists 
-  current equipment/inventory screen uses it 
-  male equipment art is mapped 
-  female equipment art is mapped 
-  inventory grid sits inside the artwork's inventory area 
-  equipped item icons occupy the painted equipment locations 
-  resizing does not cause drift 
-  dynamic content remains code-driven 
-  the system is documented for future screens 

---

## VERY IMPORTANT

Do not treat this as another equipment-screen patch.

This is now **core Ebbing Tides presentation infrastructure**.

The purpose is to make:

> **approved art = layout authority**

and:

> **code = dynamic layer placed precisely over approved art**

for the remainder of development.
# Hotfix 9 Integration Addendum — ArtScreenHost & Runtime Contracts

## Runtime art contract

`ArtLayoutManifest` / `ArtScreenManifest` should distinguish:

- `referenceAssetId`
- `runtimeBaseAssetId`
- `nativeWidth`
- `nativeHeight`
- `shellMode`
- `fitMode: "contain"`
- `screenScroll`
- `minimumReadableScale` when needed
- `provisionalArt` when the current runtime base is below final production quality

The runtime base is the layout authority. Reference art is visual direction only.

## ArtScreenHost

`ArtScreenHost` sits between the actual live game viewport and `ArtDirectedCanvas`. It owns:

1. measurement of the real parent rectangle
2. width-and-height fitting
3. native aspect-ratio preservation
4. centered letterboxing
5. the emitted art scale used by mapped content
6. scroll policy enforcement

Do not assume the browser viewport is the art host. Account for the real top bar, nav rail and any deliberate screen-local controls.

## Runtime source-dimension validation

When the base image loads, its natural width/height must match the manifest native width/height. In development/calibration mode a mismatch should fail loudly rather than silently applying a manifest calibrated for another image.

## Geometry ownership

Important x/y/width/height values belong in manifests, not one-off CSS. CSS styles the content inside regions. Once a screen migrates, obsolete positional CSS and prior hardcoded layout generations must be removed so they cannot override the manifest later.

## Real-screen calibration HUD

Calibration mode operates inside the integrated live host. It should expose viewport, main viewport, art host, canvas, native art, rendered scale, letterbox offsets, cursor position and selected region in addition to normalized region geometry.

## Real browser acceptance

For fixed art screens, real DOM checks should assert:

- canvas fully contained by host
- no unintended horizontal document scroll
- no unintended vertical document scroll
- no canvas clipping
- host scroll height/width remains contained when `screenScroll = none`
- only declared scroll regions may overflow
- natural image dimensions equal manifest dimensions

Visual proof must be captured from the served game rather than an isolated/composited canvas.

## Migration status established by Hotfix 9

The shared infrastructure now covers:

- male equipment/inventory
- female equipment/inventory
- character creator
- ship management
- market
- crew roster
- journal/intelligence
- naval encounter

Future presentation-critical screens must enter this same host/manifest/calibration pipeline instead of introducing new one-off percentage geometry.

# UI Production Architecture Recovery Addendum

Calibration is a precision tool for **Art-Anchored** geometry. It is not the universal production layout engine.

## Logical vs raster dimensions

`nativeWidth` / `nativeHeight` describe source-image fidelity and validate the raster asset.

`logicalWidth` / `logicalHeight` describe the UI design coordinate space and control viewport fitting / interface scale.

UI scale must never be derived from native PNG dimensions. Replacing a source raster with a higher-resolution version must not change typography, control sizes or logical geometry.

## ArtScreenHost fit contract

ArtScreenHost fits coordinate-authoritative content using both available width and height:

- determine logical aspect ratio
- `renderWidth = min(availableWidth, availableHeight * ratio)`
- `renderHeight = renderWidth / ratio`
- center the canvas
- use controlled letterboxing instead of clipping

No width-only sizing. No production min-width forcing for fixed art canvases. No `cover` crop on coordinate-authoritative art.

## Reference Ghost Mode

Reference Ghost Mode complements calibration by comparing visual intent directly against the live screen.

Controls:

- reference opacity 0–100%
- Live
- Both
- Reference
- Blink

Shortcut: `Alt+Shift+G`.

Calibration shortcut remains `Alt+Shift+C` for mapped Art-Anchored regions.

## Architecture boundary

Do not use calibration to make an Art-Skinned Dynamic table/form/list match a painted fake table/form/list. If dynamic content owns the geometry, use semantic CSS/Grid/Flex and reusable art skins instead.
