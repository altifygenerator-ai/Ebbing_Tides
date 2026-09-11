# Apply — Character Creator / Captain Reference-Locked Production 1E

## Required base

Apply this overlay directly over the accepted **Character Creator / Captain Reference-Locked Production 1D** project.

Production 1E is incremental. Do not apply it to a pre-1D Character UI baseline.

## Apply

Extract the ZIP into the project root and replace matching files.

Then run:

```powershell
npm run typecheck:alpha
npm run alpha:build
npm test
npm run alpha:art-layouts
```

Expected result for this package:

- TypeScript PASS
- Alpha build PASS
- full test suite **480 / 480 PASS**
- art-layout verification **2 / 2 PASS**

## Manual visual check

Inspect:

1. Character Creator Identity page
2. Character Creator Review page
3. Captain Personal History page
4. Captain Capabilities and Condition pages if desired

Confirm that:

- the central manuscript frame reads as painted construction rather than a simple CSS border;
- the Review harbor scene is no longer duplicated across Captain headers;
- Captain page imagery changes by page role;
- mechanical-impact/toolbox/effects and Captain standing/relationship sections no longer read as repeated rectangular boxes;
- text and controls remain readable;
- scrolling and interaction remain unchanged.

## Persistence

Save schema remains **v12**. No Supabase migration is required.
