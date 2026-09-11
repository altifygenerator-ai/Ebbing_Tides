# Ebbing Tides Alpha 0.6D — A0.3B2 Character Presence / Journal / Review Cleanup

Package: `0.6.0-alpha.d.a0-3b2`  
Save schema: `12` (unchanged)

A0.3B2 is a focused UX-lock follow-up to A0.3B1. It does not add a new simulation owner and it does not begin the final purpose-painted Character/Captain art pass.

## What changed

- Known named people can appear with portrait presentation in People, Government, and Religion contexts when they are actually present.
- Conversation presentation keeps the selected NPC portrait beside the dialogue instead of separating the person from the conversation.
- Portrait use is honest: NPCs with an already assigned structural portrait use it; NPCs without canonical portrait art use a neutral identity/initial plate rather than borrowing another character's image.
- Ship-bound NPC presence can follow the ship's real docked port; static NPC presence continues to use the NPC's actual port.
- The Captain Development Point badge has readable label contrast.
- Journal sections no longer repeat the same section title on both physical pages of a spread. The first folio uses the section title; later folios use `<Section> · Continued`, with the facing page carrying only restrained continuation metadata.
- Character Creator Review is trimmed to the main starting toolbox: resources, attributes, core training, strongest developed skills, and only abilities/specializations/schematics that actually exist. Major choice consequences remain visible; lower-priority contextual effects are collapsed.
- The Review pane uses the existing parent scroll owner and no longer clips longer toolbox content.

## Boundaries preserved

- No Character Creator or Captain final art was added.
- No new portrait was invented or assigned to a named NPC lacking approved art.
- No save-schema bump or Supabase migration.
- No changes to economy, law, navigation, combat, NPC planning, port service ownership, progression cadence, or learning-source ownership.
- A0.3C remains the next major systems pass after manual acceptance of this UI lock cleanup.
