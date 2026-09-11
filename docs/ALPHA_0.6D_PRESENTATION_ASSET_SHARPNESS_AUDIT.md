# Alpha 0.6D — Presentation Asset Sharpness Audit

Status: **Phase F baseline audit.** Native dimensions below were verified from the runtime package. Functional text, routes, grids, markers and labels remain code/vector overlays rather than baked raster UI.

| Asset / use | Native dimensions | Expected rendered use | Approx. scale | Status |
|---|---:|---:|---:|---|
| Global atlas `world_atlas_visual_dna_v06d_crisp.png` | 3600×2400 | up to ~1600×900 chart viewport at strategic scale | <0.5× | **PASS** — lossless runtime master, functional overlays separate |
| Skeldra regional chart `skeldra_regional_chart_v06d_crisp.png` | 4096×2926 | ~1400×800 local chart viewport depending zoom | generally <1× | **PASS / ART DETAIL REVIEW** — sufficient pixels; painterly source detail still needs manual judgment |
| Veyrholm establishing | 1536×1024 | backdrop behind bounded port content | near 1× at 1600×900 | **PASS** |
| Ironhaven establishing | 1448×1086 | backdrop behind bounded port content | near 1× | **PASS** |
| Stormvik establishing | 1536×1024 | backdrop behind bounded port content | near 1× | **PASS** |
| Thorenfjord establishing | — | full port backdrop | — | **PROVISIONAL GAP** — no dedicated supplied art |
| Old Veyr Beacon | 1536×1024 | POI backdrop | near 1× | **PASS** |
| Greywater Wrecks | 1536×1024 | POI backdrop | near 1× | **PASS** |
| Player Fjord Cutter inspection reference | 1448×1086 | bounded ship artwell, not full-screen stretch | <1× | **PASS** |
| Equipment male runtime base | 1672×799 | calibrated equipment canvas | ~1× | **PASS** |
| Equipment female runtime base | 1672×799 | calibrated equipment canvas | ~1× | **PASS** |
| Character Creator runtime base | 1672×941 | 1600×900 logical presentation | ~1× | **PASS** |
| Ship Management runtime base | 1672×941 | 1600×900 logical presentation | ~1× | **PASS** |
| Crew Roster old reference | 494×270 | Reference Ghost only | not a runtime base | **REFERENCE ONLY — DO NOT ENLARGE** |
| Journal old reference | 492×288 | Reference Ghost only | not a runtime base | **REFERENCE ONLY — DO NOT ENLARGE** |
| Market old reference | 494×288 | Reference Ghost only | not a runtime base | **REFERENCE ONLY — DO NOT ENLARGE** |

## Locked rendering rules

- Do not promote the 492–494px reference mockups into full-screen runtime art.
- Map labels, navigation grid, plotted route, selection state, ship/port/POI markers and encounter indicators remain crisp dynamic overlays.
- Regional art layers share the same 120×80 global coordinate system; they do not create independent gameplay coordinates.
- If the Skeldra chart still reads soft under manual inspection, replace/re-author the source art rather than applying more CSS/image filters.
- Missing Thorenfjord establishing art remains a real production-art blocker, not permission to stretch unrelated art.
