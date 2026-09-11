# Apply Alpha 0.6D A0.2C — Prepared Effects / Arcane Strain / Navigation Quality Repair

Apply this overlay directly over **A0.2B** (`0.6.0-alpha.d.a0-2b`).

1. Back up the A0.2B project.
2. Extract this overlay over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.a0-2c`.
4. Save schema remains **v12**. Existing v12 saves normalize Arcane Strain ownership and may convert at most one still-valid legacy successful preparation event into explicit one-shot prepared state.
5. If using the Supabase schema, apply `supabase/migrations/0011_alpha_06d_a0_2c_prepared_effects.sql` after migration 0010. It is additive and does not change save schema v12.
6. Run:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `npm test`
   - `npm run alpha:art-layouts`

No structural visual approval is required. Accepted R1.2 geometry/art layout is unchanged. Player-visible differences are gameplay truth only: prepared abilities now expire/consume correctly, Arcane Strain can reduce Arcane reliability and recover with elapsed world time, and actual squall damage can reflect the departure navigation outcome.

A0.2C deliberately does **not** implement crime-report travel/adjudication; that remains A0.2D so generic information and legal authority do not become competing owners.
