# Ebbing Tides — UI Production Architecture

## Permanent production principle

**Ebbing Tides is ART-DIRECTED FIRST and SYSTEM-DRIVEN UNDERNEATH.** Approved reference/design art controls the intended result, but the implementation method is chosen according to how the screen behaves.

Art direction is mandatory for presentation-critical screens. Flattened art overlays are **not** mandatory. Every player-facing screen must declare one production architecture before final UI work begins.

## Four production architectures

### A. Art-Anchored Canvas
Use when mechanics must align to exact painted positions. Art owns the geometry; code supplies transparent interaction regions, changing content and feedback.

Examples: equipment body slots, navigation map, exact ship hardpoints, tactical positions, damage diagrams.

### B. Art-Skinned Dynamic UI
Use semantic HTML/CSS/Grid/Flex for geometry when content is flexible or data-shaped. Art provides the visual language through frames, parchment, texture, tabs, separators, buttons, portrait frames and reusable components.

Examples: Market, Crew Roster, Journal entries, forms, history tables, pageable lists, contracts.

### C. Environment / Backdrop
Use environment art for atmosphere when no mechanic must align to exact painted coordinates. Functional panels may sit above or beside the scene.

Examples: ports, taverns, temples, POI scenes, government locations, conversation backdrops.

### D. Hybrid
Use only when a screen genuinely contains both anchored and flexible systems. Each visual structure still has one geometry owner.

Example: Ship Management may use an anchored ship/hardpoint illustration plus code-owned stats, cargo, refits and controls.

## Hard geometry rule

**ONE VISUAL STRUCTURE = ONE GEOMETRY OWNER.**

Every grid, row, column, slot, frame, button, meter, table, text box, divider or compartment is owned by either ART or CODE, never both.

- If art paints equipment slot frames, code uses transparent hitboxes and item icons.
- If code owns a Market table, the art supplies the ledger skin but does not paint fake table rows underneath it.
- If code owns an inventory grid, art supplies the surrounding inventory well/frame only.

## Logical viewport and scaling

The canonical desktop logical space is 1600 × 900. The current main game-content logical space is 1428 × 844 after the top bar and navigation rail.

`GameViewport` measures the actual rendered shell/main rectangle with `ResizeObserver` and exposes `--ui-scale` based on logical UI size. Raster source resolution is image-fidelity metadata only. Replacing a 1600px asset with a 3200px asset must improve sharpness without changing font sizes, button sizes or logical geometry.

For Art-Anchored screens, `ArtScreenHost` fits using **both available width and available height**, centers the canvas, and prefers letterboxing over clipping or scrolling.

## Scroll ownership

Every final screen declares one of:

- `none`
- `region_only`
- `page`

Fixed presentation screens default to `none`. Overflow should normally become paging, tabs, modal detail, drawers or secondary screens instead of arbitrary body scrolling.

## Reference vs runtime art

Asset usage is explicit:

- `reference`
- `runtime_base`
- `runtime_component`
- `runtime_overlay`
- `content_art`
- `environment`
- `provisional`

Reference art can contain sample text/items/state and is not automatically legal as runtime art. A reference promoted to runtime requires a clean derivative with dynamic state removed.

## Reference Ghost Mode

Screens with an approved reference can expose Reference Ghost Mode for direct comparison:

- opacity 0–100%
- Live
- Both
- Reference
- Blink

Shortcut: `Alt+Shift+G`.

Calibration remains specific to Art-Anchored regions (`Alt+Shift+C`).

## Screen classification register

| Screen | Purpose | Target architecture | Runtime art | Dynamic regions | Scroll | Logical design | Status | Priority |
|---|---|---|---|---|---|---|---|---|
| Main Menu | Campaign entry | Art-Skinned Dynamic | UI kit | save/settings actions | none | 1600×900 | development | medium |
| Character Creator | Create captain | Art-Skinned Dynamic | creator skin + portrait frame | steps/forms/gallery/review | none | 1600×900 | provisional | high, Phase 3 |
| Character Sheet | Progression/condition | Art-Skinned Dynamic | UI kit | attributes/skills/abilities | region_only | 1428×844 | provisional | medium |
| Inventory / Equipment | Personal gear | **Hybrid** | male/female clean runtime base + UI kit | equipment icons/grid/detail/filters/stats | none | 1428×844 | **Phase 2 gold standard** | gold standard |
| Crew Roster | Named crew | Art-Skinned Dynamic | UI kit | rows/morale/loyalty/paging | none | 1428×844 | provisional | high, Phase 3 |
| Ship Management | Ship/cargo/refits | Hybrid | ship illustration + UI kit | status/cargo/refits/actions | none | 1428×844 | provisional | high, Phase 3 |
| Port Work / Shipyard | Repair/refit/contracts | Art-Skinned Dynamic | UI kit + environment | lists/actions | region_only | 1428×844 | provisional | medium |
| Cargo | Ship cargo | Art-Skinned Dynamic | UI kit | grid/capacity | none | 1428×844 | provisional | medium |
| Market | Commodity trade | **Art-Skinned Dynamic** | UI kit + port environment | full table/paging/summary | none | 1428×844 | **Phase 2 gold standard** | gold standard |
| Navigation | Plot voyages | Art-Anchored Canvas | regional map art | grid/routes/tokens/markers | none | 1428×844 | production | preserve |
| Port | Settlement interactions | Environment | port establishing art + UI kit | actions/people/state | region_only | 1428×844 | production | low |
| NPC Dialogue | Conversation | Environment | location art + portrait frame | dialogue/responses | region_only | 1428×844 | provisional | medium |
| Journal / Intelligence | Known information | Art-Skinned Dynamic | book skin + UI kit | tabs/entries/pages | none | 1428×844 | provisional | high, Phase 3 |
| Naval Combat | Ship encounters | Hybrid | tactical sea + UI kit | ships/range/damage/actions/log | region_only | 1428×844 | provisional | high, Phase 3 |
| Personal Combat | Person combat | Hybrid | combat environment + UI kit | combatants/actions/log | region_only | 1428×844 | development | medium |
| Boarding | Boarding combat | Hybrid | boarding environment + UI kit | combatants/position/actions | region_only | 1428×844 | development | medium |
| History | Historical records | Art-Skinned Dynamic | UI kit | records/filters/pages | page | 1428×844 | development | low |
| Genealogy / Dynasties | Lineage review | Hybrid | UI kit | tree/people/records | region_only | 1428×844 | development | low |
| Codex | Lore | Art-Skinned Dynamic | book skin + UI kit | article/index | page | 1428×844 | development | low |
| Event / Action Popup | Major event presentation | Art-Skinned Dynamic | modal frame + event art | title/copy/choices | none | 1428×844 | provisional | medium |
| Settings | Preferences | Art-Skinned Dynamic | UI kit | controls | none | 1428×844 | development | low |
| Save / Load | Save management | Art-Skinned Dynamic | UI kit | slots/actions | none | 1428×844 | development | low |

The machine-readable version is `src/ui/screenArchitecture.ts`.

## Phase 2 scope lock

The recovery pass stops after proving the architecture on two screens:

1. Inventory / Equipment — Hybrid, anchored equipment slots + code-owned inventory grid.
2. Market — Art-Skinned Dynamic, code-owned table geometry.

Crew, Journal, Character Creator, Ship Management and Naval Encounter retain their inherited implementations until the two gold standards receive manual visual approval.


## Phase 3 migration status

Phase 2 gold standards were manually approved by the user. Phase 3 therefore proceeded one screen at a time using those production patterns.

- **Crew Roster** — migrated to Art-Skinned Dynamic UI. Code owns columns, rows, pagination, and actions. The old 494×270 image is reference-ghost evidence only.
- **Journal / Intelligence** — migrated to Art-Skinned Dynamic UI. Code owns book/page geometry, tabs, entries, and paging; UI-kit parchment/naval materials provide the art skin. The old 492×288 image is reference-only.
- **Character Creator** — migrated to Art-Skinned Dynamic UI. Code owns the six-step rail, forms, controls, portrait frame geometry, and footer. The high-resolution prior composition is retained as an approved Reference Ghost, not runtime form geometry.
- **Ship Management** — migrated as Hybrid. The ship illustration remains content art; code owns status, refit, cargo, and action geometry. The prior high-resolution whole-screen composition is Reference Ghost only.
- **Naval Combat** — **ART BLOCKED**. Its only tactical-sea base is approximately 492×289 and is explicitly provisional. The existing gameplay/combat logic is preserved, but final Phase 3 visual migration stops until a high-resolution empty tactical-sea runtime asset is supplied/approved.

Manual visual approval for the four completed Phase 3 migrations remains pending until the user reviews the supplied live-runtime screenshots.
