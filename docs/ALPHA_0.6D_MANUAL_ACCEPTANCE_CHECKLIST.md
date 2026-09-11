# Alpha 0.6D — Manual Acceptance Checklist

This checkpoint is the recovered core-experience baseline. Automated functional verification is complete, but Alpha 0.6D is not accepted until the live runtime passes human visual / feel / fun review.

## Status at package time

- `functionalStatus: PASS`
- `visualStatus: PENDING MANUAL`
- `feelStatus: PENDING MANUAL`
- `funStatus: PENDING MANUAL`
- broad Crew Mechanics pass: **DEFERRED until this baseline is accepted**
- broad world-population expansion: **BLOCKED until this baseline is accepted**

## Required core-loop playthrough

Start a new captain and verify the following as one coherent experience:

1. Create a captain without managing Attunement directly.
2. Enter Veyrholm and quickly understand what can be done there.
3. Talk to at least one named NPC.
4. Confirm that background / profession / skill can change what the captain notices or how an interaction resolves.
5. Find or accept an opportunity.
6. Trade / provision / prepare.
7. Inspect the ship if desired.
8. Open Navigation.
9. Drag the chart smoothly.
10. Zoom smoothly and confirm labels / markers remain readable.
11. Select a named destination or valid open-water point.
12. Confirm route, routed nautical miles, ETA and estimated supplies appear immediately.
13. Press SAIL once.
14. Confirm ordinary voyage time advances automatically.
15. Use Search Waters while stopped at sea.
16. Confirm Search Waters can produce meaningful results, not only an empty result.
17. Resolve at least one voyage interruption or sighting.
18. Confirm travel can continue afterward without repeated time-tick controls.
19. Confirm zero supplies do not block continued sailing.
20. Confirm prolonged zero-supply travel produces crew hardship rather than an arbitrary voyage stop.
21. Arrive at a port.
22. Review the voyage summary for distance, time, stores and relevant damage / hardship.
23. Confirm the destination feels like a place with contextual actions rather than a software module menu.
24. Complete or advance an opportunity and observe a consequence / reaction.
25. Decide whether the loop makes you want to sail again.

## Required visual matrix

Inspect at:

- 1920×1080
- 1600×900
- 1440×900
- 1366×768

Required scenes:

- Navigation default
- Navigation far / strategic view
- Navigation close view
- Selected destination + plotted route
- Search Waters result
- Veyrholm contextual port view
- Character screen
- Ship screen
- Market
- NPC interaction
- Naval encounter

For every scene check:

- no unintended page scrolling
- no clipped essential controls
- no duplicated art/code geometry
- readable typography
- clear immediate action hierarchy
- restrained identity symbols
- crisp functional labels / markers / routes
- map art sharpness appropriate to the current zoom
- strong portrait / ship / location art prominence where applicable
- no developer-facing or simulation-engine language in normal play
- no return to the web-app / dashboard feeling

## Navigation feel gate

Judge specifically:

- drag starts intentionally rather than stealing clicks
- port / POI / open-water selection is reliable
- camera movement feels responsive
- wheel / trackpad zoom feels bounded and predictable
- zoom transition between global and regional art is acceptable
- route redraw feels immediate
- markers stay readable while moving the camera
- Search Waters is discoverable
- supplies are visible enough to plan a voyage
- the player thinks in voyages, not simulation ticks

## Product-direction question

The target is:

**Pirates & Traders on the surface → deep CRPG systems underneath → living-world simulation further underneath.**

If a screen is technically functional but does not support that feeling, mark it for correction before Alpha 0.6D acceptance.

## After acceptance

Only after manual acceptance:

1. begin the dedicated P&T-inspired Crew Mechanics pass,
2. later layer the deeper mutiny chain onto that crew foundation,
3. continue broader development from the recovered 0.6D baseline,
4. do not reopen the core UI/navigation architecture without a concrete tested reason.
