# Apply — Alpha 0.6D Naval Combat Pass 1

Apply this overlay **after the accepted Crew Mechanics Pass 2 project state** (`0.6.0-alpha.d.crew2`). Copy the overlay contents over the project root, preserving folders and replacing same-named files.

Expected package version after application: `0.6.0-alpha.d.naval1`.

No save-schema migration is required; schema stays v11.

Verification:

```bash
npm run typecheck:alpha
npm test
npm run alpha:build
npm run alpha:art-layouts
```

Expected gate at packaging time: 255/255 tests passing, TypeScript passing, Alpha build passing, ArtDirectedCanvas verification 2/2 passing.

Manual naval-combat visual/feel approval is still required before this pass is considered visually complete.
