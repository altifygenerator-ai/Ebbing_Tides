# Alpha 0.6D — Skeldran Arrival Hub Presentation Pass

## Goal
Bring the settlement/city hub into the approved contextual-location CRPG presentation language.

## Runtime hierarchy
1. Shared Skeldran **ARRIVED AT PORT** banner art.
2. Dynamic settlement title from canon (`Capital of Veyrholm`, otherwise `City of ...` for the currently playable Skeldran cities).
3. Dynamic settlement role line from the port definition.
4. Dynamic settlement description.
5. `Read the Waterfront · 1h`, with the character-build-specific reading lens shown as supporting context.
6. Only the port's actual available destination links.

## Architecture
- Static ARRIVED AT PORT label/symbol and regional illustration are art-owned.
- Settlement name, role, description, skill lens, and destination mechanics are code-owned.
- The entire inner settlement surface scrolls together.
- No fake painted controls or duplicate geometry.

## Art
- `/public/art/location/context/skeldra/arrival_port.png`
- 2172x576 runtime crop; external white generation canvas removed without cropping the painted frame.
- Shared by active Skeldran settlement hubs for this baseline.

## Validation
- 228/228 automated tests PASS
- TypeScript PASS
- Alpha build PASS
- Art layouts 3/3 PASS
- Save schema remains v10

## Manual visual status
Pending user inspection.
