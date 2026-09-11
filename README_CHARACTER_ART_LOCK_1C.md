# Ebbing Tides Alpha 0.6D — Character Creator + Captain Purpose-Painted Lock Pass 1C

This package refines **Purpose-Painted Lock 1B**.

## Main intent

Lock 1C is the **Skeldran Beauty Pass**.

It keeps the accepted **frame-around-code architecture** fully intact, but pushes the look further toward what was requested:

- a more beautiful **painted manuscript feeling** in the tan content regions;
- stronger **Skeldran identity** in the framing and ornament accents;
- cleaner **text contrast** so labels, inputs, notes, and profile data do not sink into the painted UI;
- a little more decorative life in the shell, portrait, and manuscript headers without becoming clunky;
- preserved runtime geometry, scroll ownership, and culture/religion layering rules.

## Runtime behavior

Unchanged:

- Character Creator + Captain Sheet scope only.
- Culture pack remains the primary visual owner.
- Religion pack remains a small secondary accent seated in culture-built sockets.
- Live switching in Character Creator remains intact.
- Captain Sheet uses the persisted culture/religion presentation.
- No layout ownership changes and no gameplay/mechanics changes.

## Files changed in this pass

- `public/alpha/styles.css`
- `public/art/ui/character-themes/culture/skeldran/outer_frame.png`
- `public/art/ui/character-themes/culture/skeldran/dark_panel_frame.png`
- `public/art/ui/character-themes/culture/skeldran/paper_panel_frame.png`
- `public/art/ui/character-themes/culture/skeldran/portrait_frame.png`
- `public/art/ui/character-themes/culture/skeldran/header_ornament.png`
- `public/art/ui/character-themes/culture/skeldran/faith_socket.png`

## Verification completed

- `npm run typecheck:alpha` — PASS
- `npm run alpha:build` — PASS
- `npm test` — PASS
- `npm run alpha:art-layouts` — PASS

Save schema remains **v12 unchanged**.
