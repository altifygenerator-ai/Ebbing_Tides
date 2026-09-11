# Alpha 0.6D A0.3B2 — Character Presence, Journal, and Review Cleanup

## Purpose

A0.3B2 closes several small usability/presentation gaps exposed during manual A0.3B1 review while the Character/Captain UI is still being locked before final painted integration.

## Character presence and portrait ownership

`structuralNpcPortrait(...)` is the shared presentation helper for crew rows, contextual person cards, and dialogue. A small structural portrait registry is limited to characters that already have an accepted assigned asset. Missing named portrait coverage falls back to a neutral identity plate; the pass does not silently substitute another NPC/culture/religion image.

Presence is derived from existing state. A static NPC is present at `locationPortId`; a ship-bound NPC is present when their actual ship is docked at the port. A person counts as known through existing crew membership, non-neutral relationship, player knowledge, identified ship intelligence, or prior conversation. Government and Religion contexts further filter by the NPC's actual role/profession so a random known sailor is not presented as a court official or cleric.

The same contextual card owns the Speak action, and the existing `renderDialoguePanel` is rendered in the current contextual scroll surface when appropriate. Dialogue therefore presents the NPC portrait, name, role, relationship state, and conversation together.

## Captain DP readability

The existing advancement badge is retained. Only foreground contrast is corrected for the label and numeric value; no progression mechanic or geometry owner changes.

## Journal folio grammar

The journal remains one two-page book spread with one shared section identity. Folio 1 uses the section title normally. Folio 2+ uses `<section> · Continued` on the left page. The right page does not duplicate the section heading and instead carries only restrained captain continuation metadata. This rule is shared by What I Know, Contacts, Promises & Work, Standing & Law, and What Happened.

## Creator Review reduction

The Review is a final toolbox check, not a second character sheet. It now prioritizes:

- starting crowns / hull / supplies / experience level;
- the six attributes in compact form;
- the five chosen core skills and their +15 core-training contribution;
- only the six strongest developed starting skill ratings, with a count for additional developed skills;
- starting abilities, specializations, and schematics only when the chosen build actually has them;
- major direct choice effects;
- secondary contextual effects behind an optional disclosure.

Empty ability/specialization filler is removed. The creator's established parent scroll surface remains the scroll owner so Review content can grow without clipping.

## Persistence and system cohesion

No new persistent fields were required. Save schema stays v12. No migrations were added. This pass is presentation/readability wiring around existing NPC, relationship, ship-location, character-build, progression, and Journal owners.
