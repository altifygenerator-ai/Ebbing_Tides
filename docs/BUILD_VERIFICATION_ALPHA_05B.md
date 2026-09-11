# Build Verification — Alpha 0.5 Update B — 2026-09-06

Verified working tree target: `0.5.0-alpha.update-b`

## Commands executed

```bash
npm run typecheck:alpha
npm run alpha:build
npm test
```

Results:

- Alpha TypeScript typecheck: **PASS**
- Standalone Alpha compile: **PASS**
- Automated tests: **44 / 44 PASS**

The 0.5B tests specifically cover:

- complete short descriptions for canonical attributes/skills and key systems;
- Life Experience milestones without automatic skill/health scaling;
- anti-grind damping for repeated Life Experience sources;
- Development Points refusing untouched expertise and accelerating grounded practice;
- contextual life talents rather than universal stat bonuses;
- named crew sharing advancement state and Character Mind context aboard ship;
- prominent Attunement/progression/tooltip/Talk UI contracts;
- schema-v5 Update A campaign migration into schema v6 advancement state.

## Standalone HTTP smoke

The standalone server was launched on an alternate local port because port 3000 was already occupied:

```bash
PORT=3107 node scripts/serve-alpha.mjs
```

Verified:

- `/alpha/` → **HTTP 200**
- `/alpha/js/alpha/main.js` → **HTTP 200**
- `/alpha/styles.css` → **HTTP 200**
- served HTML identifies **Alpha 0.5 Update B**
- compiled game JS contains the Arcane ↔ Industrial Attunement presentation, tooltip contract, and crew dialogue action.

A headless Chromium DOM/screenshot attempt was also made. Chromium in this container did not complete because its headless process could not initialize the expected DBus/zygote environment; this is recorded as an environment limitation rather than counted as a browser pass. Runtime confidence therefore comes from the dependency-free server smoke, compiled-module checks, TypeScript build and 44 automated gameplay/migration tests.

## Persistence

- Canonical local snapshot schema: **v6**.
- Local migration chain: Alpha 0.1 → 0.2 → 0.3 → 0.4 → 0.5A → 0.5B.
- Supabase migration added: `0006_alpha_05b_progression_usability.sql`.

## Art boundary

No generated map or portrait art is claimed by Update B. Update C remains responsible for the dedicated high-resolution Skeldra regional chart and first curated Skeldran portrait pack.
