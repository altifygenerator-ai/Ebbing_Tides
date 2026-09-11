# Ebbing Tides Alpha 0.6D — Character Creator / Captain Reference-Locked Production 1D

This pass is the first Character Creator / Captain art pass judged against the approved rich UI reference images **and** against real browser runtime captures.

## Production rule

The live UI remains the geometry owner. This package does not use either approved full-screen reference image as a runtime background or foreground. Instead, their visual language is rebuilt into modular art placed in explicit safe zones around the existing UI.

The target is a purpose-painted CRPG / nautical manuscript presentation rather than a generic skinned panel set.

## Scope

Only these screens are changed:

- Character Creator
- Captain screen / Character Sheet

No gameplay, economy, law, combat, navigation, save, or campaign mechanics are changed.

## Skeldran production language

The Skeldran culture pack now supplies the primary visual language:

- dark sea-worn structural framing;
- warm manuscript reading surfaces;
- brass / weathered maritime detailing;
- a painted culture banner and lantern composition in unused Creator rail space;
- harbor / chart imagery in unused Creator side space;
- a quiet Skeldran harbor vignette in header-safe manuscript areas;
- a faint ship watermark in manuscript-safe negative space;
- dark wood treatment in Captain header structure;
- culture-specific portrait framing and trim.

High-detail art is kept in dead space, margins, header wells, and framing. The centers of live reading/control regions remain deliberately quiet.

## Religion remains secondary

Old Gods and Covenant each use their own small accent medallion. They change the religious accent without replacing the Skeldran culture-built shell.

The culture remains the primary coat of paint; religion remains a secondary symbolic accent.

## Important QA correction

An early runtime check showed that decorative top-rope art and large Captain outer-margin scenes competed with live headings or lacked enough safe margin in the current shell. Those elements were therefore removed/disabled rather than forced into the interface.

That is intentional: art is allowed only where the live UI has room for it.

## Runtime screenshots

Actual browser captures are bundled in:

`docs/visual-qa/character-art-production-1d/`

They show the real integrated Character Creator, Review step, Captain screen, and a Covenant-accent Creator check. These are runtime captures, not concept renders.

## Verification

- TypeScript (`npm run typecheck:alpha`) — PASS
- Alpha build (`npm run alpha:build`) — PASS
- Full automated suite — **473 / 473 PASS**
- Dedicated reference-locked production tests — **7 / 7 PASS**
- Art layout verification — **2 / 2 PASS**
- Save schema — **v12 unchanged**
- Package version — `0.6.0-alpha.d.r2` unchanged; presentation-only pass
