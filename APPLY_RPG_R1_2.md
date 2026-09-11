# Apply Alpha 0.6D RPG R1.2 — Final R1 Readability / Alignment Cleanup

Apply this overlay directly over the accepted **RPG R1.1** project (`0.6.0-alpha.d.rpg-r1.1`).

1. Back up the current R1.1 project.
2. Extract the R1.2 overlay ZIP over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.rpg-r1.2`.
4. Save schema remains **v12**. No migration is required from R1.1.
5. Run:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `npm test`
   - `npm run alpha:art-layouts`
6. Manually inspect:
   - Captain -> Character Sheet: Known Powers and People Who Know You accordion headers stay visually symmetrical at normal desktop widths.
   - Captain -> Capabilities: specialization bonus text such as `Seamanship +6` is clearly readable on parchment.
   - Character Creator portrait panel: Homeland / Culture / Faith labels and values are clearly readable.

R1.2 is presentation cleanup only. Do not begin R2 until its mechanics are discussed and approved.
