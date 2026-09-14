# Production 1J — Asterian Captain Candidate

Base: public Git commit `076a7fc`

## Scope

Production 1J extends the accepted Asterian Creator visual language to the Captain character sheet. It does not alter Creator styling, Skeldran styling, Captain mechanics, the save schema, character data, advancement, injuries, standing, relationships, equipment, or scrolling behavior.

## Architecture

- code continues to own the two-column Captain layout, sticky dossier, live rows, accordions, chapter height, and scroll container;
- the accepted Asterian frame is reused as a nine-sliced skin around the dossier and each independent Captain chapter;
- no full-screen or full-scroll image is introduced;
- the history, capabilities, and condition chapters use separate Asterian contextual paintings confined to their existing header wells;
- the accepted blank ivory manuscript texture remains behind live content;
- the full-screen exterior remains unframed, using only the restrained shell transition already accepted on Creator.

## Palette

- warm ivory and sun-aged white remain dominant on content pages;
- wine red and oxblood own the dossier and expandable register leaves;
- aged bronze owns fitted seams and joints;
- blue remains a minor wave-line accent in the painted frame only.

## Responsive behavior

Below the authored desktop threshold, painted page housings and contextual header scenes fall away. The existing semantic Captain layout and live controls remain intact.
