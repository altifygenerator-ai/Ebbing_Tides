# Navigation Camera Follow Hotfix

Scope: navigation presentation only.

Fixes the map camera resetting to a wide/regional overview after ship movement.
The camera now preserves the current view width (zoom level) and pans/recenters to the ship's new position after `sailUntilInterrupted()`.

No travel mechanics, route plotting, encounter logic, naval combat, or world simulation behavior is changed.
