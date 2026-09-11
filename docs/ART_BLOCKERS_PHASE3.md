# Ebbing Tides — Phase 3 Art Blockers

## Naval Encounter / Combat — production tactical sea base

**Status:** ART BLOCKER — final visual migration stopped as required by the UI Recovery directive.

### Asset needed
A clean, high-resolution **Naval Tactical Sea runtime base**.

### Recommended dimensions
- 1600×900 logical-design compatible, or
- 1536×864 / 1672×941 / 1920×1080 comparable desktop production resolution.

The production raster must be suitable for the maximum rendered desktop size and must not depend on upscaling the current ~492×289 provisional mockup.

### Purpose
Provide the illustrated tactical sea / horizon composition used during sighting and naval combat.

### Art-owned regions
- tactical sea / horizon presentation
- player ship anchor area
- enemy ship anchor area
- any deliberately painted range-space structure where exact positioning is visually meaningful
- restrained outer frame / ornament if desired

### Code-owned regions
- actual player ship image/token
- actual enemy ship image/token
- ship names
- hull / sails / rigging / crew / morale values
- exact range and range-band text
- target state
- ammunition / action controls
- surrender / grapple / boarding controls
- combat log
- log scrolling
- disabled / hover / selected states

### Approved reference source
- `public/art/ui/presentation/naval_encounter_base.png` — composition reference only; too low resolution for final runtime use
- `public/art/ui/reference/consistency_pass_collage.png` — approved visual direction reference

### Must NOT be baked into the production art
- ships
- ship names
- hull/sail/rigging values
- range numbers
- round/minute values
- combat-log text
- buttons or button labels
- ammunition state
- targeting state
- damage values
- surrender/grapple/boarding state

Until this asset exists and is approved, Naval Encounter remains functionally intact but visually **provisional**.
