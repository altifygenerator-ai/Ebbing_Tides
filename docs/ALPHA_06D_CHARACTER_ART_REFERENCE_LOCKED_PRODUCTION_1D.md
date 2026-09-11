# Alpha 0.6D — Character Art Reference-Locked Production 1D

## Purpose

Move the Character Creator and Captain screen materially closer to the approved rich painted UI references while preserving the already-locked runtime UI geometry.

## Geometry ownership

**Code remains the geometry owner** for all live text, form controls, step navigation, portrait data, creator summaries, Captain records, accordions, scrolling, and dynamic content.

**Art owns only framing and declared safe zones** such as lower rail dead space, lower portrait-side dead space, manuscript header illustration wells, portrait borders, page materials, and small religious medallion sockets.

No full-screen generated UI reference is used as a runtime layer.

## Reference use

The two approved generated reference images were used as art direction and, where appropriate, as source material for isolated decorative crops with all sample UI/text excluded. The runtime never references either full reference image.

This preserves the desired hand-painted visual language without baking sample state into the game.

## Creator integration

New structural slots were added without changing creator flow or scroll ownership:

- culture rail gallery;
- manuscript watermark slot;
- side vignette slot;
- Review header scene slot;
- existing religion socket retained.

The live center pane remains the scroll/content owner.

## Captain integration

The Captain screen keeps its existing profile and manuscript record architecture. Production art enriches:

- the Captain/profile frame;
- portrait surround;
- local/header wood treatment;
- manuscript page material;
- right-side header-safe harbor illustration;
- subtle manuscript watermark;
- small religion medallion.

Decorative large outer-margin art was tested but suppressed because the current game shell does not provide sufficient safe horizontal margin. It is not forced under live content.

## Religion layering

Old Gods and Covenant use distinct medallion assets. These are intentionally secondary to the Skeldran culture pack and occupy only small reserved locations.

## Readability

The pass explicitly assigns dark ink to manuscript surfaces and warm ivory/brass text to dark cultural shell surfaces. Inputs keep high-contrast quiet backgrounds. Decorative imagery fades or disappears before responsive layouts become crowded.

## Verification

- full suite: 473 / 473 PASS
- dedicated production tests: 7 / 7 PASS
- typecheck: PASS
- alpha build: PASS
- art layouts: 2 / 2 PASS
- save schema: 12 unchanged
