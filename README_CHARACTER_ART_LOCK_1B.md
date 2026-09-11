# Ebbing Tides Alpha 0.6D — Character Creator + Captain Purpose-Painted Lock Pass 1B

This package refines **Purpose-Painted Lock 1A**.

## Main intent

Lock 1A solved the structural issue by moving away from a picture-under-the-UI approach and into frame-based art built around the accepted runtime geometry.

Lock 1B focuses on **readability and finish**:

- stronger text contrast;
- clearer paper/ink separation in the creator and captain content regions;
- better readability in the dark rail/profile/side areas;
- minor art cleanup and a little more embedded accent work;
- preserved geometry ownership and culture/religion layering rules.

## Runtime behavior

Unchanged:

- Culture pack = primary frame/look.
- Religion pack = small secondary accent.
- Live switching in Character Creator.
- Persisted application on Captain Sheet.
- No scope expansion beyond Character Creator and Captain Sheet.

## Files changed in this pass

- `public/alpha/styles.css`
- `public/art/ui/character-themes/culture/skeldran/header_ornament.png`

## Verification completed

- `npm run typecheck:alpha` — PASS
- `npm run alpha:build` — PASS
- `npm test` — PASS (**466 / 466**)
- `npm run alpha:art-layouts` — PASS (**2 / 2**)

Save schema remains **v12 unchanged**.
