# Production 1H — Tideworn approval set

This directory is the first visual approval checkpoint for the ship-art pass.

## Canonical identity

- Named ship: **Tideworn**
- Class: **Fjord Cutter**
- Region: **Skeldra**
- Rig: exactly one main mast, gaff mainsail, headsails/staysails
- Role: fast northern coastal craft, courier, patrol vessel, or lightly armed independent trader

The written ship specification governs the architecture. Earlier two-masted Tideworn artwork was used only as a rendering-style and palette reference.

## Files

- `tideworn_fjord_cutter_portrait_pristine.png` — canonical pristine combat/inspection portrait
- `tideworn_token_north.png` — bow at 12 o'clock
- `tideworn_token_east.png` — bow at 3 o'clock
- `tideworn_token_south.png` — bow at 6 o'clock
- `tideworn_token_west.png` — bow at 9 o'clock
- `64px/`, `96px/`, `128px/`, `256px/` — runtime-ready token sizes

The East, South, and West tokens are exact rotations of the North master. This prevents structural drift between headings.

## State rule

Selected/targeted state remains a code-owned UI overlay. It is not baked into the ship art. Damaged and wrecked art will be separate visual states after the pristine design is approved.
