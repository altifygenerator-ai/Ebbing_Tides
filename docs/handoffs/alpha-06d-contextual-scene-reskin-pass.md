# Ebbing Tides Alpha 0.6D — Contextual Scene Reskin Pass

## Scope
Regional contextual scene pass only. No mechanics, navigation logic, economy, or UI layout changes.

## What changed
- Added region-fitting contextual page paintings for:
  - Asteria
  - Outer Isles
  - Crossroads / Vesperan Strait
  - Serath
  - Kaishin
- Kept Skeldra on the existing bespoke contextual set.
- Wired `CONTEXT_LOCATION_SCENE_ART` so Market / Tavern / Harbor / Government / Temple / People pages pull region-correct paintings instead of reusing the same port establishing art.
- Left existing settlement establishing art and POI art unchanged.

## Notes
- Asteria and the Outer Isles use curated contextual scenes assembled from the supplied approved port paintings.
- Crossroads uses Vespera as the main anchor with Ardaran used to diversify the tougher customs / dockside context.
- Serath and Kaishin only had regional anchor paintings supplied in this pass, so their contextual sets are derived from Tyras and Nagara respectively.
- This is a presentation pass only. It does not add new gameplay events or interaction logic.

## Files changed
- `src/data/seed/presentationArt.ts`
- `public/alpha/js/data/seed/presentationArt.js`
- `public/art/location/context/asteria/*`
- `public/art/location/context/outer_isles/*`
- `public/art/location/context/crossroads/*`
- `public/art/location/context/serath/*`
- `public/art/location/context/kaishin/*`
