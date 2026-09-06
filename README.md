# Ebbing Tides — Alpha 0.1

This repository is the first build-start checkpoint for **Ebbing Tides**. It implements a small real campaign slice instead of a throwaway prototype: character creation, persistent world state, a world clock, Skeldran ports and markets, dynamic contracts, travel, persistent NPC ships, basic naval encounters/combat, knowledge/journal state, local save/reload, and the first Character Mind surface.

## Run the verified standalone alpha

The browser alpha has no runtime package dependency. From the project root:

```bash
node scripts/serve-alpha.mjs
```

Open `http://localhost:3000/alpha/`.

The compiled browser JavaScript is checked into `public/alpha/js`. To rebuild it when TypeScript is available:

```bash
tsc -p tsconfig.alpha.json
```

Run simulation tests with:

```bash
node --test tests/*.test.mjs
```

## Full app direction

`src/game` is framework-independent TypeScript and is intended to remain the canonical simulation layer. A minimal Next.js shell exists in `src/app`, including an optional server-only Character Mind route. The package manifest targets Next.js/React for the production desktop-oriented web stack, but package installation requires registry access.

`supabase/migrations/0001_alpha_foundation.sql` contains the first persistent schema shape. Alpha 0.1 uses localStorage so the first playable loop works without external services; the database adapter/auth/RLS layer is a subsequent implementation step.

## Alpha status

See `docs/IMPLEMENTATION_STATUS.md` for the exact implemented slice, deliberately provisional values, and the next build targets.
