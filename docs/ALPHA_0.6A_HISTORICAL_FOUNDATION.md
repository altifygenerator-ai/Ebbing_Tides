# Alpha 0.6A — Calendar + Historical World Database Foundation

Status: **canonical development architecture for later Alpha 0.6 history passes**

## 1. Core rule

Ebbing Tides uses one history model with two provenance values:

- `origin: authored` for canonical history authored before Day 1 / 628 CR
- `origin: simulated` for history created by the live world simulation after Day 1

628 CR is not a metaphysical boundary. It is the point where authorship changes hands.

## 2. Calendar

The live clock now uses a normalized `WorldDate`:

```ts
type WorldDate = {
  year: number
  month: number
  day: number
  hour: number
}
```

The campaign still begins at **628 CR, month 1, day 1, 00:00**. The player-facing Alpha clock keeps the familiar `Day N, YEAR CR` presentation while the canonical clock underneath carries month/day/hour.

Month names are deliberately data-driven and remain unset until canonical names are approved. Alpha 0.6A uses a versioned 12×30-day engine normalization so arithmetic is deterministic; this is a calendar implementation constant, not invented month lore. If canonical month lengths are later changed, that must be handled as an explicit calendar-version/save migration rather than silently reinterpreting old timestamps.

Historical dates use a separate uncertainty-aware structure supporting `exact`, `month`, `year`, `approximate`, `range`, and `unknown`. Ancient history is never forced into false day-level precision.

## 3. Save compatibility

The save schema advances from v7 to **v8** because the stored live clock shape changes.

Migration rule:

```text
v7 absoluteHour
    -> worldDateFromAbsoluteHour(absoluteHour)
    -> v8 clock { year, month, day, hour }
```

`absoluteHour` is the authoritative source, so old Day-1 and later Alpha 0.5E saves retain their exact elapsed time. All older 0.1–0.5 migrations still chain through v7 and then v8.

## 4. Historical model

Every first-class history record carries explicit `origin: authored | simulated` provenance. The SQL schema mirrors that provenance and uses composite `(world_scope_id, id)` relational keys/foreign keys so canonical shared history and future campaign-specific histories cannot silently cross-link.

The normalized model includes:

- historical characters
- historical relationships
- houses
- offices
- office terms
- claims
- historical events
- event participants/factions
- causal event links
- institutions
- wars, battles, treaties
- historical ships
- ship ownership/captaincy/refit/rename history
- historical sources
- historical interpretations and disagreements

Characters and ships remain entities after death/loss. Offices are entities distinct from their holders. Blackhaven's High Captain is explicitly non-hereditary.

## 5. Runtime/live identity

Historical character IDs are world identity IDs. A living character may later bind to the active simulation using the same identity rather than creating a duplicate historical person. Dead historical-only figures do not require Character Brain state.

## 6. Event spine

`HistoricalEventRecord` is the common history contract. Authored seed events use it directly. Current runtime `WorldEvent` records can be promoted through `runtimeWorldEventToHistoricalEvent()`, which stamps an exact historical date and `origin: simulated` without changing the underlying canonical result.

Not every routine gameplay event is automatically promoted into permanent history in 0.6A. Later systems decide which events deserve historical persistence.

## 7. Truth, sources, and interpretations

Historical events store canonical world truth. Historical sources are separate records with author/source type/reliability/bias metadata. Interpretations link a source to an event and can disagree with one another.

Character knowledge/belief remains a separate layer. A character can know a source, believe an interpretation, or doubt it without changing the canonical event record.

## 8. Integrity validation

`src/game/history/validation.ts` validates known chronology/reference problems without inventing missing dates. It checks, where dates are sufficiently known:

- death before birth
- parent not older than child
- relationship/marriage after death
- office term before birth/after death
- event participant activity before birth/after death
- causal consequence before cause
- broken claim genealogy references
- institution event before founding
- war/battle chronology and missing war links
- treaty references
- ship history/battle/refit before construction or after loss
- source/interpretation/disagreement references

Unknown or approximate dates remain uncertain rather than being treated as exact facts.

## 9. Repository separation

History is not embedded in React or UI code.

```text
src/types/history.ts
src/game/time/calendar.ts
src/game/history/*
src/data/history/*
src/data/repositories/history/*
```

The in-memory repository proves the interface used by tests and current standalone development. Supabase migration `0008_alpha_06a_historical_foundation.sql` provides the normalized persistent database counterpart.

## 10. Initial seed boundary

0.6A intentionally seeds only enough data to validate architecture:

- House Vaering and five politically relevant Vaerings
- the Eirik III → Eirik IV office transition
- a short canonical causal event chain into the 614 Iron Fleet Program
- Blackhaven High Captain terms from Jessa Corven through Mara Voss
- one active Leif claim record proving claim structure
- Widow's Mercy with captaincy; ownership remains explicitly unknown rather than invented
- the canonical 621 Vespera Riots event with two provisional source records demonstrating disagreement

The provisional Vespera source titles are validation metadata, not a claim that final canonical document titles/authors have been authored.

## 11. 0.6B boundary

Alpha 0.6A does not load all ruling families, genealogies, reigns, claims, wars, ships, institutions, or source historiography and does not simulate births, marriages, deaths, or succession.

The next pass may populate this foundation as **Alpha 0.6B — Dynasties, Genealogy, Offices, Reigns & Claims** without replacing the architecture established here.
