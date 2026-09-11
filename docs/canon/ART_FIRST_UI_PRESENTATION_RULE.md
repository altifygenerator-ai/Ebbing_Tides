# EBBING TIDES — ART-FIRST UI & PRESENTATION RULE

**Status: Permanent project-wide development rule**

> **Ebbing Tides is art-directed first and system-driven underneath. Player-facing systems should feel embedded within illustrated game interfaces, not displayed through generic application UI. When visual composition matters, establish the art and empty-state layout first, then build dynamic systems as precisely aligned overlays.**

## Required production pipeline

Reference material → final/approved visual design → empty functional art template → measure/map interactive regions → build system overlays → render dynamic content → test alignment/responsiveness.

## Art is the layout authority

For presentation-critical player-facing screens, approved art controls composition, panel placement, proportions, spacing, hierarchy, framing, equipment locations, map viewport, portrait areas, inventory areas, ship positions, and other meaningful visual regions. Implementation conforms to the art; the composition is not rearranged simply because a generic CSS layout is easier.

## Empty-state art only

Base art contains the static world/interface structure, not changing gameplay state. Dynamic items, names, stats, health, currencies, market prices, relationships, ship damage, cargo, time, range, quest state, map markers/routes, and tooltips remain code-driven.

## Layer model

1. Base art
2. Interaction geometry: anchors, hitboxes, slots, regions
3. Dynamic game content
4. Interaction feedback: hover, selected, damaged, disabled, highlighted
5. Transient presentation: tooltips, action art, effects, popups

The system should feel as though it lives inside the artwork rather than sitting on top of a generic web application.

## Structured anchors

Anything aligned to art must use explicit coordinate maps or normalized anchors relative to the base-art canvas. Different male/female or materially different visual variants get separate maps when their compositions differ.

## Strong art-first targets

Character Creator; Captain/character sheet; Equipment/Inventory; Crew/NPC views; Ship inspection/equipment/refit/damage/cargo/crew stations; world/regional maps; port arrivals; POIs; naval/boarding/personal combat; settlement/tavern/market/temple/shipyard/government views; codex/history/genealogy/famous ships/relic/event presentation; main menu, campaign creation, loading, major tabs, and important modal frames.

## Code-first exceptions

Admin/debug tools, database inspectors, invisible simulation logic, save serialization, pathfinding, AI state, economy calculations, historical validation, internal configuration, and temporary developer utilities may remain code-first.

## Responsive rule

Preserve the intended art composition on desktop. If another resolution requires a different composition, create an alternate crop/layout/art variant instead of blindly stacking the production composition into a different design.

## Reference authority

Approved reference material is authoritative. If a technical constraint prevents faithful implementation, report the conflict rather than silently redesigning the screen.

## Mandatory art-first check before final UI coding

- What approved reference controls this screen?
- Does production base art already exist?
- If not, what art must be created first?
- What regions are static artwork?
- What regions are dynamic overlays?
- What interactive regions need coordinate mapping?
- What states require additional visual variants?
- What data populates those regions?

If these questions are unanswered, final production UI work does not begin. A diagnostic prototype may exist temporarily but may not quietly become the production screen.

## Acceptance test

A presentation-critical feature is complete only when both pass:

**Functional:** controls, data updates, systems, saves, and interactions work.

**Visual:** approved art is actually used, composition follows the approved reference, overlays align, dynamic content occupies intended regions, artwork is structurally meaningful rather than decorative, the screen looks intentional, and obvious generic-web-app structure is absent.

**Functional pass + visual fail = feature incomplete.**

# Hotfix 9 Permanent Integration Addendum

## Reference art vs runtime base art

Reference art controls composition, hierarchy, proportions and visual language, but is not automatically valid as a live runtime background. Runtime layout art must be intentionally prepared for dynamic overlays. Assets should use explicit usage metadata such as `reference`, `runtime_base`, `runtime_overlay`, or `content_art`. Reference-only assets must never become the live layout authority.

If a reference contains sample names, sample items, fake controls, duplicate navigation, fixed meters, currency, health, inventory state, or other baked gameplay examples, create a clean runtime derivative before wiring the live system. If a clean production derivative cannot be created, report the art blocker rather than faking it with CSS.

## One global shell

The current Alpha has one application shell: top status bar, left navigation rail, main content viewport. Art-directed content rendered inside the main viewport must be content-area art and must not reproduce another global header/nav/footer. A deliberately full-screen art screen may replace the shell only when its manifest explicitly declares that mode.

## Screen host sizing

Mapped art screens must be hosted by `ArtScreenHost` or equivalent. The host measures the actual available width and height and fits the native art ratio using contain-style geometry:

`renderWidth = min(availableWidth, availableHeight * ratio)`

`renderHeight = renderWidth / ratio`

The entire base art and all overlays use this single rectangle. Controlled letterboxing is correct; clipping, cover-cropping, distortion and accidental page scrolling are not.

## Scroll ownership

Every art-screen manifest must declare screen scroll policy. Fixed presentation screens default to `none`. Only intentionally mapped wells may scroll. Inventory, crew, market and journal should prefer fixed visible capacity with pages/tabs over arbitrary content sliding across painted structures. Combat logs are a valid example of a mapped scrollable region.

## Canvas-relative typography

Typography, icons, padding and controls living inside mapped artwork must scale relative to the art canvas, not the browser viewport. Do not use viewport-width units as the sizing authority for mapped content. `--art-scale`, container-relative units, or equivalent canvas-relative sizing should be used.

## No fake controls

A visible control baked or rendered in runtime presentation must either be genuinely functional or be removed from the runtime base. Decorative fake tabs, keyboard hints, buttons or actions that imply unavailable behavior are prohibited.

## High-resolution runtime art

Low-resolution layout-authority art that must be enlarged substantially is provisional, not final production art. It must be explicitly marked provisional in the asset/layout registry and replaced when a proper high-resolution runtime base is available.

## Full-runtime visual QA

Acceptance proof for a migrated art screen must come from the actual served game, including the true shell/host geometry. At minimum test 1920×1080, 1600×900, 1440×900 and 1366×768 in live, calibration and representative populated states. Verify no unintended document scroll, no clipping, no drift, no source-dimension mismatch and only intentional mapped-region overflow.

# UI Production Architecture Recovery — Permanent Clarification

This clarification supersedes any overly literal reading that every art-directed screen must be a flattened raster canvas.

> **Art direction is mandatory for presentation-critical screens. Flattened art overlays are NOT mandatory. Implementation architecture is chosen according to content behavior.**

Before final implementation, every presentation-critical screen must be classified as:

- **ART-ANCHORED CANVAS** — exact painted coordinates matter.
- **ART-SKINNED DYNAMIC UI** — dynamic content owns rows/columns/grids/forms while reusable art skins establish the visual language.
- **ENVIRONMENT / BACKDROP** — the artwork supplies place and atmosphere without mechanical coordinate authority.
- **HYBRID** — explicitly combines anchored and dynamic portions.

## Hard geometry law

> **ONE VISUAL STRUCTURE = ONE GEOMETRY OWNER.**

For every slot, row, column, grid, frame, button, meter, table, text box, divider or compartment, the geometry owner is **ART** or **CODE**, never both.

Examples:

- Painted equipment slot frames → code uses transparent hitboxes and dynamic item icons.
- Code-owned inventory grid → art provides the inventory well/frame, not painted cells.
- Code-owned Market table → art provides parchment/frame/materials, not fake rows underneath.

## Reference/runtime separation

Approved reference art tells us what a screen should look like. It is not automatically a runtime base. Runtime bases must be intentionally prepared and must not contain dynamic state that code also renders.

## Scaling

PNG pixel dimensions affect sharpness only. UI sizing comes from the logical game viewport and actual available content rectangle. Do not derive typography/control scale from `renderedImageWidth / nativeImageWidth`.

## Visual completion

Automated status and visual approval are separate. A screen can pass tests and still have `visualApproval = PENDING`. Only explicit manual acceptance promotes the visual approval state.

## Phase discipline

For the UI Production Architecture Recovery pass:

1. Phase 1: shared viewport/scale, UI art kit, ArtScreenHost corrections, Reference Ghost, audit.
2. Phase 2: Inventory / Equipment and Market only.
3. **STOP for manual review.**
4. Do not automatically migrate Crew, Journal, Character Creator, Ship Management or Naval Encounter until the two gold-standard screens are accepted.
