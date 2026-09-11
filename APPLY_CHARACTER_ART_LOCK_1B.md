# Apply — Character Creator + Captain Purpose-Painted Lock Pass 1B

Base: accepted Alpha 0.6D R2 build.

This is a **safe incremental cleanup pass over Character Art Lock 1A**.

## What this pass does

- increases text contrast across the Character Creator and Captain Sheet;
- brightens and clarifies the Skeldran creator/captain paper surfaces;
- improves field, heading, label, and body-text readability;
- adds restrained secondary accents and interior linework so the art feels more finished without taking over the runtime UI;
- refreshes the Skeldran header ornament asset.

## Apply steps

1. Extract this ZIP into the Ebbing Tides project root and replace matching files.
2. Run:

   `npm run typecheck:alpha`

   `npm run alpha:build`

   `npm test`

   `npm run alpha:art-layouts`

## Expected verification

- TypeScript: PASS
- Alpha build: PASS
- Full automated suite: **466 / 466 PASS**
- Art layouts: **2 / 2 PASS**

## Manual visual acceptance

Check the Character Creator and Captain Sheet with **Skeldran + Old Gods** and **Skeldran + Covenant**.

Accept only if:

- headings, labels, body text, metadata, and field text read clearly at a glance;
- the creator center pane reads like a live code-owned surface with a painted frame around it;
- side-panel and rail text stay readable on the dark shell surfaces;
- added accents feel restrained and integrated rather than decorative clutter;
- religion still behaves as a secondary accent layer, not a replacement of the culture frame.
