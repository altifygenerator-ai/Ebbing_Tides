Ebbing Tides Alpha 0.6D — Tideworn Travel Pacing v3.4

This is a small pacing adjustment on top of the working v3.3 continuous-motion pass.

Visual travel is slowed slightly:
- long normal voyage target: about 2.3 seconds -> about 3.0 seconds
- minimum tween segment: 58 ms -> 70 ms
- maximum tween segment: 140 ms -> 170 ms

The goal is to keep travel short, but make it read as deliberate sailing rather than fast-forward movement.

This changes presentation timing only. It does not alter:
- in-game elapsed time
- ship speed calculations
- route geometry/pathfinding
- supplies
- weather
- encounters
- economy
- saves
- naval combat

Run from the project root:

    powershell -ExecutionPolicy Bypass -File ".\apply_tideworn_travel_pacing_hotfix_v3_4.ps1"

Files changed:
- src\alpha\main.ts
- public\alpha\js\alpha\main.js
