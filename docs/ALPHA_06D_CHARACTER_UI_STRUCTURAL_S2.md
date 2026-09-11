# Alpha 0.6D Character UI Structural S2

## Purpose

Tighten the pre-art code-owned UI after manual S1 inspection. This pass specifically addresses layout/readability issues reported on the Creator Review and Captain Sheet, separates aggregate crew sentiment from named-character relationships, improves ship-information hierarchy, and reserves visual slots needed by later equipment/fitting art.

## Locked distinctions introduced here

- **Political/faction standing** and **personal NPC relationships** remain separate concepts.
- **Ordinary company sentiment** and **named officer relationships** are separate player-facing reads, though both continue to draw from existing underlying crew/NPC systems.
- **Ship fitting icons** and **outfitter item icons** occupy art slots; the surrounding catalog/list geometry remains code-owned.
- The large ship illustration remains the visual anchor of Ship Management, while compact particulars use otherwise empty space without turning the page into a ship-stat dashboard.

## Deferred

- Reputation / Relationships & Law R1 mechanics.
- Warrants, bounties, jurisdictional crime, customs, smuggling, privateering, and Letters of Marque.
- Final painted manuscript presentation.
- Canonical named-officer portrait set.
- Final ship-fitting icon library.
