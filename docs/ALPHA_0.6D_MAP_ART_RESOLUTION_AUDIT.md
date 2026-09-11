# Alpha 0.6D — Navigation Map Art Resolution Audit

Scope: Phase B navigation layers plus Navigation Feel Gate Correction 1. Functional overlays (route/grid/labels/markers/tokens) are SVG/UI geometry and therefore are not baked into the raster art audited here.

## Global atlas

- Runtime asset: `public/art/maps/world_atlas_visual_dna_v06d_crisp.png`
- Runtime native dimensions: **3600×2400 px**
- Source visual DNA: **1448×1086 px**
- Global registration: **120×80 cells**
- Runtime density: **30 px per world cell horizontally and vertically**
- Use: **far/full-world strategic layer and fallback underneath regional art**
- Status in registry: **PROVISIONAL_REFERENCE**

The source art had a 4:3 raster shape while the canonical gameplay atlas is 120×80 (3:2). The old runtime asked the browser to stretch that source continuously inside SVG. Alpha 0.6D now performs that projection once offline with high-quality resampling and restrained sharpening, producing a 3:2 lossless runtime master.

At far/full-world view the atlas is downsampled into the chart pane. Local navigation transitions to regional art rather than enlarging a small global-atlas crop.

## Skeldra regional chart

- Runtime asset: `public/art/maps/skeldra_regional_chart_v06d_crisp.png`
- Native: **4096×2926 px**
- Registration: **49×35 global cells**
- Native density: ~**83.6 px per world cell horizontally**
- Use: regional/navigation/close views through the registered global bounds
- Status in registry: **PROVISIONAL**

Approximate native horizontal source coverage by camera width while fully inside Skeldra:

- 30-cell regional overview: ~**2508 native px**
- 18-cell navigation view: ~**1505 native px**
- 12-cell close view: ~**1003 native px**

The Alpha 0.6D correction converts the runtime layer to lossless PNG, applies restrained non-generative sharpening, removes the SVG raster dim filter, and reduces the atlas wash.

This improves presentation clarity but does not manufacture new geographic detail. If manual close-view inspection still finds the map insufficiently detailed, the asset remains correctly marked **PROVISIONAL** and should be replaced by a new native high-resolution registered regional painting.

## Functional overlays

The following remain dynamic and should stay crisp regardless of raster-art LOD:

- grid,
- plotted route,
- route knots,
- port markers,
- POI markers,
- selection ring,
- known-contact marks,
- player token placement,
- screen-resolution destination/context text.

## Conclusion

The navigation rebuild no longer depends on magnifying a low-resolution global crop. The global layer now has a high-resolution canonical runtime projection, and local navigation uses a lossless 4096×2926 Skeldra layer.

Final sharpness at the required desktop resolutions remains part of **manual visual approval**.
