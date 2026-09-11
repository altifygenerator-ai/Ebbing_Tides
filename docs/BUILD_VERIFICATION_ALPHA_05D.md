# Alpha 0.5D Build Verification — Fixed Game Shell

Date: 2026-09-07

## Scope verified

Alpha 0.5D is a presentation/layout checkpoint over the verified 0.5C corrective build. It establishes a fixed application viewport across gameplay and restructures Navigation into a bounded map/context workspace plus permanently visible voyage controls.

## Automated verification

- `npm run typecheck:alpha` — PASS
- `npm run alpha:build` — PASS
- `npm test` — PASS, 56/56 tests
- Dedicated 0.5D regression coverage verifies:
  - body/document scrolling is disabled;
  - shell, game layout and main content use bounded viewport rows;
  - long content remains reachable through intentional internal panes;
  - Navigation no longer uses the old below-map `map-side` page layout;
  - Sail and Advance 4 Hours remain present in the permanent voyage dock;
  - zoom, pan/recenter and selected-destination functions remain present;
  - SVG chart preserves its coordinate viewBox and aspect relationship;
  - save schema remains version 6.

## Live standalone HTTP smoke

Using `node scripts/serve-alpha.mjs`:

- `/alpha/` — HTTP 200
- `/alpha/js/alpha/main.js` — HTTP 200
- `/alpha/styles.css` — HTTP 200

## Regression boundary

No changes were made to world coordinates, collision/passability, route finding, port/POI enterability, save schema, character progression, NPC Brain, economy, combat, portrait IDs, Visual DNA, Attunement, or the registered 0.5C Skeldra map layer.

## Browser screenshot limitation

The prior container limitation around launching headless Chromium/DBus remains. No screenshot/browser-render claim is made here. Verification is based on the compiled standalone build, static layout contracts, full automated regression suite, and live HTTP asset serving.
