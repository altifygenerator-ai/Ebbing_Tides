# Alpha 0.6D — RPG R1.1 Standing / Relationships UI Cleanup

R1.1 is a presentation-only cleanup on top of RPG R1. It does not change the law/reputation model or the v12 save schema.

## Captain record scaling
The three potentially unbounded record areas now use native code-owned `<details>` accordions:

- **Standing & Law / Known Powers**
- **Personal Relationships / People Who Know You**
- **Ports / Local Standing**

Each accordion owns a fixed-height summary band and a variable-height live content body. This geometry is deliberately suitable for the later painted character-interface pass: art may decorate the summary/header and surrounding page, but the expandable body and rows remain code-owned.

### Closed-state summaries
- Standing & Law always exposes the number of known powers and surfaces urgent legal trouble. Active warrants and the highest-priority non-clear legal state are never hidden behind the collapsed body.
- Personal Relationships shows the number of known people plus the highest-priority current relationship, with current crew naturally ranking first.
- Local Standing shows the number of known ports plus the current port and its qualitative standing when available.

### Default expansion
- Standing & Law stays open while the list is small, and also opens automatically whenever legal trouble is active.
- Personal Relationships stays open at four or fewer significant people, then collapses by default as the social graph grows.
- Local Standing stays open at four or fewer known ports, then collapses by default as exploration expands.

Expanded Personal Relationships is no longer capped at six rows; the full significant known-person list is available when opened.

## Sorting
Standing & Law prioritizes legal severity first, then the current jurisdiction, then stronger positive/negative standing. Local Standing keeps the current port first, then stronger local standing deviations. Personal Relationships continues to keep current crew ahead of other significant people and then sorts by relationship importance.

## Art-phase rule
This pass does not add manuscript art. The later Culture-primary / Religion-accent painted system may skin the accordion header and page around it, but it must leave the expandable list body clear and code-owned.
