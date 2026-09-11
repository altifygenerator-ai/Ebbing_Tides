# Ebbing Tides — UI Art Asset Pipeline

## 1. Identify usage before import

Every UI art asset must declare one role:

- `reference` — composition/design target only
- `runtime_base` — clean runtime layout authority
- `runtime_component` — reusable UI component/slice
- `runtime_overlay` — runtime visual overlay
- `content_art` — portrait/item/ship/etc. shown as changing content
- `environment` — scene/backdrop art
- `provisional` — explicitly temporary and not visually approved

Reference artwork with sample state is never promoted silently.

## 2. Choose architecture before preparing art

- Art-Anchored Canvas: prepare clean base art with only art-owned geometry.
- Art-Skinned Dynamic: prepare textures, frames, components and environment art; do not paint dynamic table/form/list geometry.
- Environment: prepare scene/backdrop artwork.
- Hybrid: split the above explicitly by region/structure.

## 3. Runtime derivative rule

If reference art must become a runtime base, create a derivative that removes anything code will render:

- names
- values
- active states
- inventory items
- dynamic icons
- meter fill
- fake controls
- code-owned rows/grids

Keep only visual structure owned by art.

## 4. UI art kit foundation

Current reusable runtime components:

- `/art/ui/kit/parchment_tile.png`
- `/art/ui/kit/dark_naval_panel.png`
- `/art/ui/kit/brass_panel_strip.png`

These establish a reusable parchment/naval/brass material language for semantic code-owned UI. Future component additions should include explicit tab, button, portrait, tooltip, modal, ledger-row, separator, page-control, checkbox/select and meter treatments as their approved visual forms are finalized.

## 5. High-resolution production requirement

Runtime raster assets are audited against their maximum expected rendered size. Pixel resolution affects fidelity, not UI scale.

Major desktop bases should normally be in the 1536×864 to 1920×1080 class or comparable intentional size. Small provisional mockups must not be stretched into production screens.

Phase 2 production assets:

- male equipment runtime base: 1672×799 — production
- female equipment runtime base: 1672×799 — production
- Market: no flattened table base is used; its code-owned ledger uses reusable high-resolution/tileable UI components plus existing port environment art

Inherited provisional assets intentionally deferred to Phase 3:

- Crew Roster base: 494×270
- Journal base: 492×288
- Naval Encounter base: 492×289
- legacy Market base: 494×288, retained only as provisional/legacy evidence and not rendered by the Phase 2 Market

## 6. Art blockers

If required final art is missing, stop that screen's visual completion and record:

- asset needed
- target dimensions
- purpose
- required empty/static regions
- approved reference
- content that must not be baked in

Do not replace it with unrelated art, a blurred mockup or a generic CSS imitation while claiming final visual completion.

## 7. QA handoff

For production screens:

1. source/native resolution audit
2. runtime-art classification audit
3. actual served-game viewport QA
4. Reference Ghost comparison
5. automated status
6. **manual visual approval remains PENDING until accepted by the user**
