# Alpha 0.6D — UI Noise Audit

Status: **0.6D core-recovery baseline implemented through Phases C–F; final live visual/feel audit remains pending manual acceptance.**

## Audit rule

Every visible element must primarily serve one of five purposes:

- **Decision-supporting** — helps the player choose or act now.
- **Identity-supporting** — tells the player who/where something is.
- **Atmosphere** — reinforces Ebbing Tides without competing with decisions.
- **Redundant** — repeats information already communicated clearly.
- **Debug/noise** — exposes implementation or simulation machinery without helping play.

Complexity may remain in simulation state even when it is hidden from the normal runtime UI.

## Screen audit

| Screen | Current useful surface | Noise / risk found | 0.6D action |
|---|---|---|---|
| Character Creator | identity, attributes, training, portrait | direct Attunement assignment treated an internal model as a build slider | **Removed from normal creation.** New captains begin neutral; specialization derives from committed practice. |
| Captain Sheet | attributes, skills, advancement, injuries | prominent exact Attunement number/track made the sheet read like a systems dashboard | **Removed.** Qualitative specialization appears only when it is materially non-neutral / strained / incompatible. |
| Crew Inspector | role, competence, equipment, conversation | exact NPC Attunement value exposed simulation machinery | **Removed.** Only meaningful qualitative specialization can surface. |
| Navigation | chart, destination, route, ETA, hazards | permanent arrow-pan controls; discrete zoom bands as interaction; repeated manual time-advance; chart-state/development copy | **Rebuilt.** Drag, bounded smooth zoom, immediate route preview, one Sail operation, Search Waters. |
| Navigation Context | destination and route | too much chart/system explanation competed with destination | **Tightened.** Destination, route distance, ETA and known hazard summary are primary. |
| Top Bar | time, place, money, crew, save/audio | milestone/build label was developer-facing | **Removed from normal player bar.** |
| Market | commodity, price, availability, hold, trade | risk of exposing raw stock/target internals as a dashboard | **Reworked surface.** Raw stock/target figures are demoted; Commerce produces qualitative shortage/surplus intelligence while real prices/trading remain authoritative. |
| Ship | ship art, immediate condition, cargo, guns, supplies, meaningful refits | can drift toward stat-table ownership of the vessel | **Tightened.** Ship art/build role are prominent; routine surface state is Hull, Sails/Rigging, Crew, Cargo, Guns and Supplies. Fire/flooding appear when relevant. |
| Crew Roster | people, role, morale/loyalty, inspect | repeated identity marks can become visual noise | **Keep restrained identity treatment.** Symbol system remains supporting, not screen-defining. |
| Journal | knowledge, contacts, obligations, history | confidence/hour metadata can read like raw simulation output | **Reworked surface.** Tabs answer What I Know / Contacts / Promises & Work / What Happened; confidence is qualitative while source-aware knowledge remains underneath. |
| People / Dialogue | person, portrait/identity, conversation | risk of visible relationship mechanics and simulation state | **Reworked surface.** Relationship state is qualitative and build/history can alter dialogue; raw internal relationship dimensions remain hidden. |
| Government / Religion | local institution and actions | excess identity badges can overtake place/people | **Use contextual identity only.** No four-badge requirement. |
| Naval Encounter | ship identity, range, clear actions | provisional art remains; action density can become spreadsheet-like | **Functional flow preserved.** Phase E will tighten presentation after navigation approval. |
| Personal Combat | combatants, health/AP, clear actions | tactical values can accumulate | **Preserve foundation.** Phase E will audit only values needed for current decisions. |
| Arrival / POI | place art, consequence, local actions | module-style transition risk | **Contextualized.** Permanent navigation is reduced to place + persistent personal systems; Market/Tavern/People/Temple/Government/Harbor actions originate from the current location. |

## Phase A removals now locked

1. No normal Character Creator control directly sets Attunement.
2. No prominent `-100 ↔ +100` Attunement meter appears on the normal Character Sheet.
3. NPC inspectors no longer expose exact Attunement values by default.
4. Navigation no longer exposes repeated `Advance 4 Hours` / simulation-tick operation.
5. Visible directional pan arrows are removed from normal navigation.
6. The runtime top bar no longer carries the development milestone label.
7. Navigation no longer explains its implementation architecture to the player.

## Implemented after the navigation checkpoint

- contextual port hierarchy replaces permanent module-style activity navigation,
- build-sensitive port reads create actual character-build consequences,
- Journal metadata is simplified into useful player questions,
- relationships surface qualitatively,
- economy state becomes actionable qualitative market intelligence,
- ship presentation emphasizes vessel/build identity and immediate decisions,
- combat action language is tightened while deeper calculations remain intact,
- recurring identity symbols are restrained to supporting marks.

## Still pending manual review

The directive's final visual/feel pass cannot be approved from source/tests alone. Multi-resolution live screenshots, interaction feel and the complete 30–60 minute human benchmark remain manual acceptance gates.
