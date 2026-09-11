# Alpha 0.6D — Character Creator / Captain Reference-Locked Production 1E

## Frame & Vignette Authenticity Pass

### Intent

Production 1E is a surgical visual refinement of Production 1D. The accepted layout, content ownership, interaction model, culture/religion theme logic, and readability work are retained.

### Problem 1 — repeated vignette use

Production 1D used a successful harbor/city painting in more than one prominent placement. Repetition made the art feel asset-driven rather than authored for each screen.

Production 1E assigns different subjects to different roles:

| Placement | 1E visual role |
| --- | --- |
| Creator Review | harbor / register skyline |
| Captain Personal History | coast / ship approach |
| Captain Capabilities | chart / compass |
| Captain Condition | ship scene |
| Captain profile lower accent | ship / seal margin |

These are modular accent assets, not full-screen underlays.

### Problem 2 — CSS-like framing

Production 1D still relied on border-image framing around the central creator page and Captain manuscript pages. Even with good painted source material, the runtime read as a rectangular skinned box.

Production 1E replaces that desktop treatment with an authored assembly of independent pieces:

- `manuscript_lintel.png`
- `manuscript_sill.png`
- `manuscript_stile_left.png`
- `manuscript_stile_right.png`
- four individual corner pieces

A small DOM housing mounts those pieces around the existing code-owned region. It is presentation-only, `aria-hidden`, non-interactive, and does not become the scroll owner.

At narrow widths, the authored edge assembly intentionally falls away and the prior safe framing behavior returns before art can crowd the live UI.

### Problem 3 — box-like inner sections

Targeted Creator and Captain subsections now use open manuscript fields rather than full rectangular borders. Three different painted lintel assets are alternated across adjacent sections to avoid repeating the same ornamental treatment.

The center of each information field remains quiet for readability; richness is concentrated in the lintel, edge transition, and subtle parchment field shift.

### Architecture

The project rule remains unchanged:

**One visual structure = one geometry owner.**

Code owns:

- page geometry;
- form controls;
- dynamic text/data;
- scroll areas;
- accordions;
- screen switching.

Art owns only the surrounding physical presentation pieces and safe decorative regions.

### Runtime visual QA

Actual runtime captures are packaged at:

- `docs/visual-qa/character-art-production-1e/creator-runtime.png`
- `docs/visual-qa/character-art-production-1e/review-runtime.png`
- `docs/visual-qa/character-art-production-1e/captain-runtime.png`

The captures were produced from the compiled Alpha runtime in Chromium with local project assets routed into the browser. They are not concept renders.

### Verification

- TypeScript — PASS
- Alpha build — PASS
- Full tests — **480 / 480 PASS**
- Dedicated Production 1E — **8 / 8 PASS**
- Art layouts — **2 / 2 PASS**
- Save schema — **v12 unchanged**
- Clean overlay on Production 1D baseline — **PASS** (same 480/480 + 2/2 gates)
