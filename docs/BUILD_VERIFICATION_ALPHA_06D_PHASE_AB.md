# Alpha 0.6D Phase A/B — Build Verification

Checkpoint: **Core Experience Recovery — Audit/Noise Removal + Navigation Rebuild**

## Automated gate

Final checkpoint gate:

- Alpha TypeScript typecheck: **PASS**
- Alpha standalone build: **PASS**
- Node regression suite: **197 / 197 PASS**
- Art-layout verification: **PASS — 3 layouts, 0 failures**
- Save schema: **v10 unchanged**

## New automated coverage

0.6D adds targeted regression checks for:

- default 18×12 / close 12×8 navigation scale,
- camera pan/zoom bounds,
- cursor-anchored bounded zoom math,
- regional map layer registration/crossfade,
- valid authored navigation marker coordinates,
- physical routed distance,
- one-operation Sail auto-advance to arrival,
- interruption stop behavior,
- voyage cancellation in open water,
- Search Waters time cost,
- removal of the normal Attunement slider/meter,
- derived specialization behavior,
- removal of arrow-pan / Advance 4 Hours runtime controls,
- drag/wheel navigation source hooks.

Older tests whose explicit UI expectations conflicted with the new 0.6D product directive were updated to protect the new intended behavior rather than the superseded UI.

## Manual gate

Automated success does not complete Phase B.

- `functionalStatus`: **PASS**
- `visualStatus`: **PENDING**
- `feelStatus`: **PENDING**

The next action is manual navigation review at normal desktop resolutions. Phase C is blocked until that review passes.

---

## Navigation Feel Gate Correction 1 addendum

After the first manual navigation feel review, Correction 1 was applied for free destination selection, non-blocking supply exhaustion with arrival voyage reporting, and tightened atlas/regional map rendering. Final corrected gate:

- Node regression suite: **199 / 199 PASS**
- Alpha TypeScript typecheck: **PASS**
- Alpha standalone compilation: **PASS**
- Art-layout verification: **PASS — 3 layouts, 0 failures**
- Save schema: **v10 unchanged**

See `ALPHA_0.6D_NAVIGATION_FEEL_GATE_CORRECTION_1.md` and its package manifest for details.
