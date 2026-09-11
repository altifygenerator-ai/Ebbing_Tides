# Ebbing Tides Alpha 0.6D — Character Creator + Captain Purpose-Painted Lock Pass 1A

This package **supersedes the rejected Character Art Pass 1 background-skin attempt**.

## What changed

The Character Creator and Captain Sheet still use the accepted R2/A0.3B3 runtime geometry. The culture art is now mounted **around** those code-owned regions as transparent frame/border assets instead of being placed underneath the controls as a large painted background.

Current implemented art packs:

- Culture: **Skeldran** — primary frame/material treatment.
- Religion accent: **Old Gods**.
- Religion accent: **Covenant**.

Unimplemented cultures remain on the neutral structural UI. They do not borrow Skeldran art.

## Geometry ownership

Code owns:

- Character Creator three-column layout and scroll region.
- Step rail, forms, fields, review, portrait slot, footer controls.
- Captain profile region, manuscript page regions, accordions, stats, skills and all dynamic content.
- The attachment positions/sizes for the culture frames and religion accent sockets.

Art owns:

- Transparent Skeldran outer frame.
- Transparent dark-panel frames around rail/profile/side regions.
- Transparent paper frames around creator/captain record pages.
- Transparent portrait frame art.
- Header ornament and empty faith socket.
- Small religion mark inserted into that socket.

The frame images have transparent centers. They do not contain the runtime fields, text, stats or page contents.

## Runtime switching

Character Creator reads the current Culture and Religion selections immediately. Changing either updates the pack attributes in-place.

The Captain Sheet reads the created captain's persisted `culture` and `religion` values and applies the same combination.

## Scope

Only:

- Character Creator
- Captain Character Sheet

Crew, Journal, Ship, Market, Outfitter, port contexts and combat screens are intentionally untouched.

## Verification

- TypeScript: PASS
- Alpha build: PASS
- Full automated suite: 466 / 466 PASS
- Dedicated corrected art integration tests: 9 / 9 PASS
- R2 + readiness + long-run cohesion set: 36 / 36 PASS
- Art-layout verification: 2 / 2 PASS
- Save schema: v12 unchanged
- Package version: `0.6.0-alpha.d.r2`
