# Ebbing Tides — Alpha 0.6C Hotfix 10

This pass is a corrective cleanup pass on top of Hotfix 9. The goal was not to redesign the accepted art-first UI system, but to remove the remaining presentation problems that were still making several approved screens feel unfinished: blurred placeholder remnants, uneven integration between dynamic content and the painted base, and misaligned footer/action content.

## What changed

### 1) Cleaned runtime presentation bases
The two roughest provisional runtime bases were re-authored in-place so they no longer carry baked-in blurred placeholder blocks that fight the live UI.

- `public/art/ui/presentation/journal_base.png`
- `public/art/ui/presentation/crew_roster_base.png`

Both now use clean painted guide structures that better match the live content layers.

### 2) Recalibrated manifest-owned geometry
The following art-layout manifests were adjusted so their dynamic regions sit inside the intended visual wells more cleanly:

- `src/artLayouts/journal/journal.ts`
- `src/artLayouts/crew/roster.ts`
- `src/artLayouts/market/market.ts`
- `src/artLayouts/ship/management.ts`
- `src/artLayouts/character/creator.ts`

This keeps geometry manifest-owned rather than slipping back into one-off CSS positioning.

### 3) Tightened content styling inside art-directed wells
`public/alpha/styles.css` received a final alignment pass for:

- journal tabs / page entries / pager
- crew ledger rows / footer controls
- market ledger / pager / side summary
- ship management status / module / cargo / command rail
- character creator step list / form / portrait / footer

### 4) Minor structural HTML cleanup
`src/alpha/main.ts` was adjusted so a few crowded controls are grouped more cleanly:

- ship command rail
- crew roster footer controls
- creator footer controls
- journal tab labels reduced to the intended short K. / C. / O. / H. form

### 5) User-facing build label advanced
Visible product strings now identify the build as **Alpha 0.6C Hotfix 10**.

---

## Screens directly corrected and visually rechecked

These were the screens specifically targeted by the pass and manually rechecked after changes:

1. Character Creator
2. Market Ledger
3. Ship Management
4. Crew Roster
5. Journal & Intelligence

---

## Additional screens that should be the next manual audit targets

These are the most likely remaining screens to need small integration polish because they are art-dense or rely on the same infrastructure:

1. **Captain Gear / Equipment screen**
   - dense slot overlays
   - inventory/filter/detail regions
   - easiest place for scale drift to show up

2. **Crew Inspect → Gear**
   - same equipment manifest system as captain gear
   - worth checking because the data context changes while the layout stays shared

3. **Naval Encounter**
   - dense combat/status/log composition
   - should be checked for log height, command button fit, and target/status alignment

4. **Any secondary / overflow states** for:
   - Market pages beyond page 1
   - Journal with longer records / other tabs
   - Crew roster with additional pages or longer names

5. **Mobile and narrow-width passes**
   - this hotfix primarily corrected the visible desktop integration issues
   - the next audit should include smaller laptop widths and mobile for clipping regressions

---

## Verification completed

The following checks were run successfully after the pass:

- `npm run typecheck:alpha`
- `npm run alpha:build`
- `npm run alpha:art-layouts`
- `npm test`

Result: passing.
