# Apply — Character Creator / Captain Purpose-Painted Lock 1C

Apply this overlay on top of the accepted **Character Creator / Captain Purpose-Painted Lock 1B** baseline.

## Scope

This pass is a **visual refinement pass only** for:

- Character Creator
- Captain Sheet

## What this pass does

- deepens the **old manuscript** feel in the central tan content regions;
- enriches the **Skeldran painted frame assets**;
- improves **label/body/input/profile text contrast** against the art;
- adds restrained **Skeldran accent work** to shell and header treatment;
- keeps the accepted rule that **code owns layout and scroll behavior**;
- keeps religion treatment secondary and mounted as a **small accent socket**;
- does **not** alter game mechanics, data schema, creator step logic, or captain-sheet structure.

## Files included

Copy the included files into the project root, preserving paths.

## Post-apply verification

Run:

```bash
npm run typecheck:alpha
npm run alpha:build
npm test
npm run alpha:art-layouts
```

Expected result: all pass.
