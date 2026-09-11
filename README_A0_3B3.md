# Ebbing Tides Alpha 0.6D — A0.3B3 Review / Journal / Character Symbol Lock

Package: `0.6.0-alpha.d.a0-3b3`  
Save schema: `12` (unchanged)

A0.3B3 is a narrow pre-art UX lock follow-up to A0.3B2. It fixes three presentation issues found in live runtime without changing simulation mechanics or beginning the final Character Creator/Captain purpose-painted art pass.

## What changed

- Character Creator Review now owns an internal vertical scroll region, so long builds remain fully readable inside the locked creator viewport instead of clipping below the fold.
- Review removes the redundant at-a-glance skill summary sentence and the implementation-meta footer note. Unique starting abilities, specializations and schematics are placed before the strongest-skill summary so the captain's actual toolbox is easier to scan.
- Journal facing pages reserve one identical heading band. Entry rows therefore align across the spine again while only the left page carries the section title. Later folios still use `<Section> · Continued` for every Journal section.
- People cards and active conversations retain portrait/identity plate, role, relationship state and Speak flow, but no longer render the small ancestry/religion/affiliation symbol chips in their upper-right corners.

## Boundaries preserved

- No gameplay mechanics changed.
- No new portrait assignments or identity symbolism were invented.
- No Character Creator/Captain final art was added.
- No save-schema bump or Supabase migration.
- No changes to economy, law, navigation, combat, NPC planning, progression, learning sources, or port-service ownership.
- A0.3C remains the next major systems pass after manual acceptance of this UX lock.
