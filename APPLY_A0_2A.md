# Apply Alpha 0.6D A0.2A — Information Durability & Ownership Repair

Apply this overlay directly over **A0.1C** (`0.6.0-alpha.d.a0-1c`).

1. Back up the A0.1C project.
2. Extract this overlay over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.a0-2a`.
4. Save schema remains **v12**. Existing v12 saves are normalized on load; old character-capability knowledge is imported into the campaign knowledge ledger and cleared from the legacy runtime field.
5. If using normalized Supabase tables, apply `supabase/migrations/0010_alpha_06d_a0_2a_information_ownership.sql`.
6. Run:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `npm test`
   - `npm run alpha:art-layouts`

No structural visual approval is required. Accepted UI geometry is unchanged. The Journal can now label information as aging, stale, contradicted, or superseded when appropriate.

A0.2A deliberately does **not** implement law-report propagation; crime/witness/authority delivery remains reserved for A0.2D so there is one legal-information owner rather than a competing generic-news shortcut.
