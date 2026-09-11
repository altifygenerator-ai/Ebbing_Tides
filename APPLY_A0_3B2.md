# Apply A0.3B2

Base expected: the accepted A0.3B1 project (`0.6.0-alpha.d.a0-3b1`, save schema v12), including the Main Menu 1.3 runtime bridge and prior A0.3A/A0.3B work.

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
- Full test suite: 411/411 PASS
- Dedicated A0.3B2 tests: 8/8 PASS
- 1000-day NPC/economy durability set: 13/13 PASS
- Art layout verification: 2/2 PASS
- Save schema: v12

## Manual browser check

- Open People and confirm a known person card has a portrait/identity plate and Speak action.
- Visit Government or Religion where an appropriate known NPC is physically present and confirm the person is shown there without navigating away to find them.
- Start a conversation and confirm the same person remains visually present beside the dialogue.
- Open Captain and confirm `0 DP` is fully legible.
- Open every Journal section and page forward: the first folio should carry the section title once; later folios should say `<Section> · Continued`; the facing page should not repeat the heading.
- Create a character and inspect Review: strongest skills and real starting abilities/specializations should fit within the normal creator scroll, with no empty filler sections.

This pass intentionally requires manual visual acceptance because it tightens live presentation geometry before the later purpose-painted art integration.
