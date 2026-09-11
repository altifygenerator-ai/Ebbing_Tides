# Alpha 0.6C Hotfix 7 — Verification & QA

## Final automated gate

- `npm run typecheck:alpha` — **PASS**
- `npm run alpha:build` — **PASS**
- `npm test` — **PASS: 143 / 143**

## Art / asset QA

- Runtime `/art/...` reference audit — **PASS**
  - 111 unique runtime `/art/...` paths referenced by the final downloadable package sources checked
  - 0 missing files
- Image decode audit — **PASS**
  - 266 PNG/JPG/JPEG/WebP files checked under `public/art` in the final deduplicated downloadable package
  - 0 corrupt/unreadable images
- Candidate mockup runtime audit — **PASS**
  - exploratory candidate screens remain reference-only and are not imported by runtime source
- Supplied package coverage — audited and mapped in `public/art/SOURCE_PACKAGE_COVERAGE.json`
  - canonical production selections use exact runtime copies; source-only alternates/reference sheets are retained as high-quality original-dimension WebP references
  - approved production selections use exact runtime copies; source-only alternates/reference sheets are retained as high-quality original-dimension WebP references
  - candidate reference package remains reference-only
  - ability/status icons
  - named ship tokens
  - separated props

## Player-facing presentation regression coverage

New Art-First regression tests verify:

- the permanent Art-First rule is committed to project canon
- major presentation base assets exist
- canonical location art aliases resolve to real files and canonical location IDs
- current playable supplied-art coverage is intact
- Thorenfjord remains an explicit art gap rather than receiving an unrelated substitute
- player-facing renderers actually consume the Art-First bases / POI art
- candidate exploratory UI art does not silently become production UI

Existing regression tests continue to cover navigation, travel, world simulation, character progression, NPC planning, market/economy behavior, inventory/equipment, ship refits, naval combat, boarding/personal combat, save migration, physical-distance rules, and content registry behavior.

## Served smoke check

The final deduplicated downloadable package was re-tested after packaging exclusions. The standalone Alpha server successfully served HTTP 200 for:

- `/alpha/index.html`
- `/alpha/js/alpha/main.js`
- `/art/ui/presentation/ship_management_base.png`
- `/art/location/pois/greywater_wrecks.png`
- `/art/ui/equipment_template_male.png`
- `/art/ui/equipment_template_female.png`

## UI / composition check

- Presentation base-image dimensions were checked and CSS aspect ratios/overlay regions were kept tied to those compositions.
- Equipment retains normalized art-coordinate slot mapping rather than free-flowing responsive rearrangement.
- Ship Management, Naval Encounter, Market, Crew Roster and Journal use fixed art-directed composition stages with dynamic overlays instead of generic document-flow layouts.
- Character Creator preserves the illustrated composition at desktop size instead of stacking the final player-facing screen into a visually unrelated responsive layout.
- Existing Navigation Map presentation remains unchanged because it already follows the Art-First architecture.

### Browser screenshot limitation

A full automated Chromium screenshot pass was not available in this container session, so this verification does **not** claim pixel-level browser screenshot comparison. The completed QA consists of source/layout inspection, base-art dimension/alignment checks, asset validation, compile/test regression gates, and standalone served smoke checks.

## Full Next.js shell build

`npm run build` was attempted, but this extracted playable checkpoint does not contain installed Next.js dependencies (`next: not found`). The standalone Alpha build and served Alpha runtime are validated above. No successful Next.js production build is claimed for this package.


## Final downloadable-package deduplication check

- Redundant `public/art/library/canonical/` and `public/art/library/approved/` source mirrors are intentionally omitted from the ZIP and replaced by tiny explanatory marker files.
- Production-selected exact art remains in semantic runtime paths such as `public/art/location/`, `public/art/ui/`, `public/art/ships/`, and `public/art/maps/`.
- Source-only alternates/reference material is represented through `public/art/source-supplement/` and mapped in `public/art/SOURCE_PACKAGE_COVERAGE.json`.
- After deduplication: TypeScript PASS, Alpha build PASS, **143/143 tests PASS**, **266/266 images decode**, **111/111 runtime art paths resolve**, and served smoke PASS.
