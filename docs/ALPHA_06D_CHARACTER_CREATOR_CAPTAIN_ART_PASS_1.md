# Alpha 0.6D — Character Creator + Captain Final UI Lock / Purpose-Painted Art Integration — Pass 1

## Architecture decision
These screens are **Art-Skinned Dynamic UI**. The accepted code layout remains authoritative. Art paints the materials, margins, portrait surrounds, safe header space, and culturally specific decorative treatment around that geometry.

### One visual structure = one geometry owner
Code owns:
- Character Creator 3-column composition and all six step panes
- step rail hit targets
- forms / selectors / attribute and skill controls
- portrait slot and selected portrait image placement
- review scroll region
- footer controls
- Captain sidebar / main-column composition
- record sections, accordions, skill rows, attributes, abilities, legal / standing content
- all scrolling and dynamic expansion

Art owns:
- culture material / surface treatment
- non-interactive margin painting
- non-text maritime vignettes in safe space
- portrait surround treatment
- secondary religion accent art

No runtime asset contains baked player text, ratings, rows, buttons, or sample-state data.

## Theme composition
Runtime formula:

`locked Character UI + culture pack + optional religion accent pack`

Culture is primary. Religion is intentionally subordinate and can change marks/accent treatment without replacing the culture's visual structure.

## Pass 1 pack coverage
### Skeldran culture
Dedicated modular assets:
- paper texture
- creator rail painting
- creator portrait-side painting
- captain profile-side painting
- captain page-header maritime vignette
- culture rule / material strip

### Religion
- Old Gods accent mark
- Covenant accent mark

## Runtime selection
Creator roots carry both the actual selected IDs and the resolved available pack IDs. The visual theme updates on the Culture or Religion select `change` event. Captain Character Sheet roots resolve from the persisted player character on each render.

Unimplemented packs resolve to `neutral`; there is no cross-cultural fallback to Skeldran.

## Scope boundary
No theme selectors are added for Crew, Journal, Ship, Market, Inventory / Equipment, Outfitter, or port/location contexts in this pass.

## Manual acceptance remains required
Automated tests prove pack boundaries, asset presence, theme switching hooks, and geometry ownership. They cannot decide whether the visual balance is right. Final acceptance requires checking the live runtime and then tightening the art/CSS without moving the locked UI unless a genuine readability defect is found.
