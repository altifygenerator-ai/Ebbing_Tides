# Alpha 0.6D — Navigation Feel Gate Correction 3

Status: functional implementation checkpoint; manual visual/feel approval remains required. Phase C is still blocked.

## Changes

- Search Waters is now always visible in the Navigation voyage dock as a first-class action. It is enabled only while deliberately stopped in open water; while unavailable it remains visible and explains why.
- Ship Supplies are now visible in the persistent top status bar beside Crowns and Crew.
- Selecting any valid port, POI, or navigable-water destination now shows approximate supply consumption alongside routed nautical miles and ETA.
- Routes that exceed current stores are clearly warned but are not blocked; supply exhaustion remains a background voyage consequence per the accepted feel-gate correction.
- The voyage dock also surfaces current stores and planned route consumption.

## Planning estimate

The displayed supply estimate follows the current player-facing Sail Until Interrupted cadence and is explicitly approximate. Weather or ship damage may lengthen a voyage and increase actual use.

## Scope

No Phase C port-flow work has begun. No save-schema change. Navigation drag/free-route selection, background supply exhaustion, voyage reporting, and sharpened map assets from Corrections 1–2 remain intact.

## Automated validation

- 202 / 202 tests PASS
- TypeScript PASS
- Alpha standalone build PASS
- Art-layout verification 3 / 3 PASS
- Save schema remains v10

`functionalStatus: PASS`  
`visualStatus: PENDING MANUAL APPROVAL`  
`feelStatus: PENDING MANUAL APPROVAL`
