# Apply A0.3B3

Base expected: accepted A0.3B2 (`0.6.0-alpha.d.a0-3b2`, save schema v12), including A0.3A, A0.3B, A0.3B1 and Main Menu 1.3.

1. Extract this overlay into the project root and replace matching files.
2. From the project root run:

```powershell
npm run typecheck:alpha
npm run alpha:build
npm test
npm run alpha:art-layouts
```

Expected packaged verification:

- TypeScript: PASS
- Alpha build: PASS
- Full test suite: 417/417 PASS
- Dedicated A0.3B3 tests: 6/6 PASS
- 1000-day NPC/economy durability set: 13/13 PASS
- Art layout verification: 2/2 PASS
- Save schema: v12

## Manual browser check

- Character Creator Review: scroll inside the Review content and confirm the lower skill/ability/specialization information is reachable without the overall creator shell moving.
- Confirm the duplicated one-line “strongest starting tools” summary and the implementation-meta note are gone.
- Journal: compare left/right entry rows on every section. The first two entries on each physical page should begin at the same vertical positions across the spine.
- Page forward in each Journal section: only the left page should say `<Section> · Continued`; the right page should keep only the captain meta line.
- People / Government / Religion: known-person cards should still show portraits and relationship state, with no small identity-symbol chips in the corner.
- Conversation: the portrait and relationship badge remain, but the small identity-symbol chips are gone.

This is still a geometry/readability lock, not the final art pass.
