# Ebbing Tides — Alpha 0.5 Update C: Art Integration

Update C consumes the verified 0.5B checkpoint. It is an art/content integration pass, not a rewrite of navigation, character progression, NPC simulation, or persistence.

## Portrait production workflow

The initial repetitive generated batch was rejected and is not part of the canonical asset registry. The implemented pool was rebuilt through the intended workflow:

1. inspect available project art and generation candidates;
2. reject near-duplicate composition/identity candidates;
3. curate materially different Skeldran characters;
4. normalize selected masters to 900×1125 WebP game assets;
5. assign stable portrait IDs and logical asset IDs;
6. attach ancestry/culture/religion/home-port/profession/social/pose/environment/lighting metadata;
7. attach persistent Visual DNA;
8. integrate filtering into the real character creator;
9. keep newly curated images provisional until individual approval;
10. preserve replacement-by-ID so later art revision does not break a save.

The corrected player-selectable pool contains 8 dedicated 900×1125 waist-up portraits across young-adult/adult/mature ages, men and women, working maritime, harbor gentry, industry/shipbuilding, traditional religious, storm-deck, cabin, office and harbor contexts. Broader full-body/studio/reference pieces remain registered separately for NPC/event/reference use and are not selectable as player portraits.

This is deliberately a **Skeldra-first** library. Other ancestry/culture libraries use the same `PortraitChoice` and asset-registry contracts when their regions are built out.

## Map art integration

The user-approved generated Skeldra navigation mockup establishes the desired presentation language, but its ports, route, labels and token positions are painted into the image at locations that do not exactly match the authoritative global grid. It is therefore stored as `ui.navigation.skeldra.generated_reference_v05c` for style/composition reference only.

The active runtime layer is `map.skeldra.region_layer.v05c`:

- global bounds: x 10, y 0, width 49, height 35;
- registered presentation resolution: 4096×2926;
- overlaps the global atlas by 3 cells;
- same authoritative grid/collision/pathfinding as previous alphas;
- rendered under independent route/grid/token/port/POI overlays;
- replaceable later without coordinate/save migration.

The map renderer now draws all active registered layers by priority instead of hardcoding one atlas image.

## Custom portrait boundary

The optional custom portrait path is server-side. The browser submits structured Visual DNA/context to `/api/portrait/generate`; the local server builds the lore-constrained art request, calls the image-generation endpoint only when `OPENAI_API_KEY` exists, writes the returned PNG to the generated portrait directory, and returns a stable ID/path. The key is never exposed to browser code.

Curated portraits remain the normal, offline-safe character-creation path.

## Corrective presentation pass

The first in-game review showed the regional camera was still magnifying the presentation layer too aggressively. The default navigation camera is therefore widened to 46×30 cells, with explicit − / + controls stepping through 46×30 Regional, 34×22 Navigation, and 24×16 Close views. The registered map image, hidden terrain mask, port/POI cells and save coordinates are unchanged. A mild non-generative sharpening derivative is used for screen legibility rather than inventing new geography.

Character-sheet skill rows now use fixed Skill / Rating / Training columns; attributes use fixed label/rating columns; specialization presentation uses a compact aligned row.
