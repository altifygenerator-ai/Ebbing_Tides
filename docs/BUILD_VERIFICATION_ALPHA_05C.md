# Ebbing Tides — Alpha 0.5 Update C Build Verification

Date: 2026-09-06
Package version: `0.5.0-alpha.update-c.corrective1`
Save schema: `6` (unchanged from Update B)

## Scope verified

Update C is the art/content-integration pass over the verified Alpha 0.5B systems checkpoint. It adds the first curated Skeldran player-portrait library, a coordinate-registered Skeldra regional navigation-art layer, stable asset/provenance metadata, later-culture portrait-library fallbacks, and the optional server-side custom portrait generation path. Navigation geometry, collision, port/POI cells, save coordinates, character progression, and NPC simulation remain system authority rather than being inferred from paintings.

## Automated verification

Final commands run from the repository root:

- `npm run typecheck:alpha` — PASS
- `npm run alpha:build` — PASS
- `npm test` — PASS, **51/51 tests**
- `git diff --check` — PASS

The Update C-specific test coverage verifies:

- first Skeldran portrait pool contains meaningful variation across sex, age, pose, environment, presentation, profession, and home-port metadata;
- every curated portrait has a stable logical asset ID and real normalized game file;
- choosing a portrait does not overwrite the player's canonical culture, religion, or profession;
- Asterian, Serathi, Kaishin/Eastern, and later ancestry choices remain valid even before their curated portrait libraries are produced;
- the optional custom portrait path persists structured Visual DNA and a stable local asset path;
- the Skeldra regional art layer is active, high-resolution, and registered to fixed global coordinates;
- the accepted generated navigation mockup is not used as simulation geometry because its baked labels/token positions do not align precisely enough with canonical cells;
- custom image generation remains a server-side boundary rather than exposing an API key to the browser.

## Portrait asset QA

Game-ready Skeldran portrait directory:

`public/art/characters/portraits/skeldra/`

- selectable player portrait count: **8**
- normalized dimensions: **900 × 1125** for every portrait
- format: WebP
- status: selectable player portraits are **PROVISIONAL**; broader approved/reference assets stay outside character creation unless they meet the dedicated waist-up player framing contract
- stable logical IDs and source/provenance are recorded in `public/asset-registry.json`
- private near-duplicate check: 16×16 dHash minimum inter-portrait distance measured **104 / 256**, indicating the selected set is not a collection of near-identical pose/face variants

The selected pool intentionally spans different compositions and life presentations rather than one repeated snowy-harbor/naval-coat template: cabin/deck/studio/harbor/industrial/religious contexts, different social and professional presentations, varied ages, male and female characters, and different pose/framing metadata.

## Skeldra regional map QA

Active layer:

`public/art/maps/skeldra_regional_chart_v05c_crisp.webp`

- dimensions: **4096 × 2926**
- corrective active file size: **1,508,166 bytes**
- logical asset: `map.skeldra.region_layer.v05c`
- registered global bounds: `x=10, y=0, width=49, height=35`
- overlap: 3 cells
- active across Regional 46×30 / Navigation 34×22 / Close 24×16 camera modes, with Regional as the default

The layer is presentation only. The world grid remains authoritative for land/water passability, routes, port approaches, POIs, ships, saves, and collision.

The user-accepted generated Skeldra navigation mockup is preserved as:

`public/art/maps/reference/skeldra_navigation_generated_reference_v05c.png`

It is a visual/composition reference only. It contains baked interface elements and port positions that do not line up closely enough with canonical cells to be used directly under live overlays without drift. The active layer therefore preserves the existing coordinate geometry instead of moving the simulation to fit decorative artwork.

## Standalone runtime HTTP smoke

The standalone Alpha server was started locally and verified over HTTP:

- `/alpha/` — **200**, 415 bytes
- `/alpha/js/alpha/main.js` — **200**, 95,075 bytes
- `/alpha/styles.css` — **200**, 33,900 bytes
- `/art/maps/skeldra_regional_chart_v05c_crisp.webp` — **200** (corrective active map asset)
- `/art/characters/portraits/skeldra/player_v1/skeldra_f_captain_cabin_01_player_v1.webp` — **200**
- document title reports **Ebbing Tides — Alpha 0.5 Update C**

With no `OPENAI_API_KEY` configured, POST `/api/portrait/generate` returns **503** with the intended offline-safe message while curated portraits remain fully usable. This confirms custom generation fails closed without breaking ordinary character creation.

## Environment limitations — not claimed as passes

### Headless Chromium

A local headless-Chromium smoke was attempted during Update C, but the browser process could not complete initialization in this container's DBus/zygote environment and timed out. No browser screenshot was produced, so Update C does **not** claim a Chromium screenshot pass. Runtime verification instead uses the 51-test suite plus live HTTP/static-asset checks above.

### Optional Next.js wrapper

`npm run build` was attempted and returned exit code 127 because the extracted working environment does not currently have the optional Next.js executable installed (`sh: 1: next: not found`). This is not a failure of the standalone Alpha runtime. The dependency-free standalone build used for the playable checkpoint passes its TypeScript compile, tests, and HTTP checks. The Next wrapper remains optional packaging work until its dependencies are installed.

## Release acceptance

Update C is acceptable for checkpoint packaging when:

1. the repository commits cleanly;
2. the playable ZIP passes archive integrity and fresh-extraction tests;
3. the fresh-extracted standalone server serves the Alpha, active regional map, and portrait assets;
4. the full Git checkpoint extracts with a clean working tree at the Update C commit.


## Corrective acceptance additions

- default chart camera is pulled back to 46×30 rather than magnifying the regional art;
- explicit − / + zoom steps preserve a single coordinate system;
- selectable portrait assets are dedicated 4:5 waist-up files under `player_v1`;
- reference/full-body/studio art is rejected by automated tests if reintroduced into the player chooser;
- Skill / Rating / Training columns and compact specialization rows are present in the compiled UI.
