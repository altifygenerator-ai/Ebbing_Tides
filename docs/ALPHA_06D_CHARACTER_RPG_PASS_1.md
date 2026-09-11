# Alpha 0.6D — Character / RPG Pass 1: Captain's Manuscript

## Scope
This pass is the presentation and information-hierarchy foundation for the broader Character, Reputation & Law roadmap. It deliberately does **not** implement the Phase 2 law/crime simulation yet.

## Presentation architecture
Character Creator, Captain Sheet, Crew Roster / named Crew Sheet, and Journal are classified as **Art-Skinned Dynamic UI**. Shared parchment/leather material art supplies atmosphere while semantic HTML/CSS owns all changing geometry, text, rows, fields, controls, lists and values.

The implementation reuses the accepted runtime-safe UI material assets already in the project (`parchment_tile.png`, `dark_naval_panel.png`) and adds restrained code-owned manuscript ornament: inset rules, cornerwork, rubric headings, folio marks, dividers, portrait mats and bound-ledger presentation. No baked sample values or functional controls were added to raster art.

## Character Creator
- Reframed as the opening leaves of a Captain's Manuscript.
- Identity/origin/history/skills/portrait/review flow remains functional and code-owned.
- Background / Profession page now includes **What this changes already**, a short player-facing explanation of the gameplay lens already present for smuggling, technical, scholarly/religious, commercial and maritime backgrounds.
- Portrait pane includes a compact identity caption.
- Curated portrait flow remains the normal path; custom portrait generation remains optional.
- Direct Attunement control remains absent.

## Captain Sheet
The Captain Sheet now reads as a useful personal record rather than a loose stat panel:
- Captain portrait, role, homeland, condition and identity context.
- **Origins & Circumstances** with age, ancestry, homeland, home, culture, faith, social origin, background, profession, trait, birth omen and ship origin.
- **Known Powers** surfaces the captain's existing `reputation` state as qualitative standing (Celebrated / Respected / Favorable / Neutral / Wary / Hostile / Enemy).
- **People Who Know You** surfaces significant known NPC relationships using the existing qualitative `relationshipStatus` layer. Raw trust/respect/fear/etc. dimensions remain hidden.
- Attributes, skills, skill training, specializations, learned techniques and injury history remain available and are reorganized into manuscript pages.

This pass does not synthesize fake port relationships or legal status where the game currently has no canonical state for them.

## Crew
- Crew Roster is presented as a ship's muster book.
- Aggregate crew remains aggregate.
- Named officers/specialists receive manuscript character records with public identity, condition, strongest skills, specializations, learned practices and qualitative relationship with the captain.
- Private NPC brain state, goals, beliefs, memory internals and raw relationship dimensions are not exposed to the player.
- Existing Inventory / Equipment subview remains unchanged and functional.

## Journal
- Reframed as a bound Ship's Journal with manuscript folios.
- Existing knowledge, contacts, obligations and history entries remain generated from canonical state.
- Adds ship/current-location and captain folio context without changing journal truth/confidence mechanics.
- Existing Reference Ghost remains development-only.

## Deferred to Phase 2+
- jurisdictional political/legal model
- port standing as persistent canonical state
- crimes and witnessed/known crime records
- warrants and bounties
- lawful patrol/customs behavior
- contraband and smuggling inspections
- Letters of Marque / privateering authorization
- war/alliance-driven vessel hostility

## Regression / QA
Package version: `0.6.0-alpha.d.character1`  
Save schema: v11 unchanged

Automated gate:
- TypeScript PASS
- Alpha build PASS
- 261/261 tests PASS
- Art-layout verification PASS (2/2)

Dedicated tests lock the manuscript presentation, architecture ownership, creator build-impact note, qualitative standing/relationship presentation, named-crew privacy boundary, and unchanged save schema.
