# Alpha 0.6D Navigation Feel Gate — Correction 2

Status: **FUNCTIONAL PASS / VISUAL PENDING / FEEL PENDING**

This correction fixes a pointer-capture regression introduced by the drag-camera rebuild.

## Player-facing navigation rule

Within the currently enabled Skeldra navigation space, the player may choose:

- any known port marker,
- any known POI marker,
- any navigable open-water cell.

A normal click immediately selects that destination and plots the route. Ports and POIs provide their contextual destination information; open water becomes a free-sail destination. Land and disabled/reserved world cells are not valid destinations during the Skeldra proving-ground milestone.

## Root cause

The chart called `setPointerCapture()` immediately on `pointerdown`. Pointer capture caused simple clicks to be retargeted to the SVG chart rather than the actual port/POI/water hit element. Once the previous Ironhaven default target was removed, destination selection appeared nonfunctional.

## Fix

- Do **not** capture the pointer on pointer-down.
- Preserve a simple click on the actual map element.
- Begin pointer capture only after movement crosses the 7px drag threshold.
- Once the threshold is crossed, the gesture becomes map panning and the synthetic click is suppressed.

This restores the intended interaction:

**CLICK WATER / PORT / POI → ROUTE**

while preserving:

**DRAG EMPTY/ACTIVE CHART → PAN**

## Preserved Correction 1 behavior

- supply exhaustion remains a background voyage consequence,
- voyage reports remain enabled,
- sharpened world/regional map runtime masters remain unchanged,
- Phase C remains blocked pending manual navigation feel approval.
