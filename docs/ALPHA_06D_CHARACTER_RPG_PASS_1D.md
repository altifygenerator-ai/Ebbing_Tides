# Alpha 0.6D — Character / RPG Pass 1D

## Manuscript Integration Cleanup

Pass 1D is a corrective visual-integration pass based on live Pass 1C screenshots.

### Problems addressed

1. Painted marginalia and decorative overlays were still entering live content zones.
2. Several screens retained stacked digital framing around the painted manuscript surface.
3. The Captain Sheet could expose horizontal scrolling/containment problems.
4. The Creator portrait and footer read as separate framed cards rather than one folio.
5. Journal tabs/book/page layers still competed visually.

### Implementation rule

**One primary painted surface, one quiet live-content plane.**

The runtime manuscript paintings contain no labels, values, controls, portraits, rows, or gameplay state. HTML/CSS remains the geometry owner for every dynamic field, row, list, button, portrait slot, relationship, standing entry, and journal record.

### Screen outcomes

- **Creator:** dominant center folio; simplified step rail; unified parchment portrait/navigation folio; no screen-corner props or extra frame layer.
- **Captain / Officer:** clean folio shell; portrait column stripped of duplicate painted framing; horizontal overflow suppressed; headers use restrained ink rules rather than overlay ornaments.
- **Crew:** cleaner muster folio; no duplicate section frames or painted row collisions.
- **Journal:** open-book art remains dominant; writable areas are clean; painterly vignettes removed from entry space; tabs stay outside the page content plane.

### Mechanics

No mechanics changed. Reputation/Law Phase 2 remains deferred until manual visual approval.
