# Alpha 0.6C Hotfix 6 — Equipment UI Alignment Tune

This pass tightens the visual alignment of the art-first captain / companion equipment screen.

## What was tightened

- Refit the absolute slot coordinate map so overlay hitboxes sit closer to the painted slot wells in the male/female base art.
- Tightened the inventory-grid bounds to better match the painted 6x5 grid.
- Tightened the top filter row bounds.
- Tightened the lower-right item detail panel bounds.
- Tightened the left captain-summary overlay bounds.
- Reduced overlay chrome so the base art remains the dominant visible frame:
  - empty slot overlays are now more transparent
  - filled slot backgrounds are lighter
  - hover/selected states use inset highlights instead of heavy mismatched borders
  - item icons are slightly smaller to sit cleaner inside the painted frames

## Validation

- `npm run typecheck:alpha` ✅
- `npm run alpha:build` ✅
- `npm test` ✅
