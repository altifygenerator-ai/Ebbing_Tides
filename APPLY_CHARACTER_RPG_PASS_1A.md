# Ebbing Tides Alpha 0.6D — Character / RPG Pass 1A
## Manuscript Presentation Recovery

## Apply target
Apply this overlay to **Character / RPG Pass 1** (`0.6.0-alpha.d.character1`).

Copy the contents of this patch folder into the project root and allow matching files to overwrite.

## Result
- Package version: `0.6.0-alpha.d.character1a`
- Save schema: **v11 unchanged**
- Character Creator, Captain Sheet, named Crew/Officer records, Crew Roster, and Ship's Journal now use painted runtime-safe manuscript shells and modular ornament rather than flat parchment styling.
- Dynamic text, values, rows, fields, buttons, tabs, portraits, relationship entries, standings, skills, journal entries, and pagination remain code-owned.
- The new art contains **no baked gameplay text, values, controls, portraits, sample rows, or fake buttons**.
- No law/reputation mechanics beyond the already-existing Phase 1 standing/relationship presentation were added. Crime, warrants, customs, smuggling, Letters of Marque, port standing, and lawful-vessel behavior remain Phase 2+.

## New runtime art kit
`public/art/ui/manuscript/`
- `manuscript_page_ornate.webp`
- `manuscript_page_ledger.webp`
- `manuscript_journal_spread.webp`
- `manuscript_section_frame.png`
- `manuscript_portrait_frame.png`
- `manuscript_divider.png`
- `manuscript_header_ornament.png`
- `manuscript_tab_skin.png`

The page shells provide painted paper, binding, map-border visual DNA, nautical marginalia, and restrained ship/compass ornament. The section and portrait assets are stretch-safe or transparent skins around live code regions.

## Verification gate run before packaging
- `npm run typecheck:alpha` — PASS
- `npm run alpha:build` — PASS
- `npm test` — PASS, **266/266**
- `npm run alpha:art-layouts` — PASS, **2/2 layouts**

## Manual acceptance check
At normal desktop zoom inspect:
1. Character Creator across Identity, Background/Profession, Attributes/Skills, Portrait, and Review.
2. Captain > Character Sheet: portrait, Origins, Known Powers, Relationships, Attributes/Skills, Specializations, and Condition.
3. Crew Roster and at least one named crew member record.
4. Ship's Journal across all tabs and at least two folios.
5. Confirm the painted art reads as a manuscript around the live UI without making controls ambiguous or shrinking text.
6. Confirm changing content still lays out naturally and no painted element is pretending to be a functional field/row/button.

Do not mark Phase 1A visually accepted until the live build is manually inspected.
