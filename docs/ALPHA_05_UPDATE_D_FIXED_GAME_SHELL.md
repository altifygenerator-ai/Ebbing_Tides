# Alpha 0.5D — Fixed Game Shell

## Presentation mandate

Ebbing Tides is presented as an application/game viewport, not a vertically scrolling website. During normal gameplay the browser document is locked to the viewport. The persistent top status bar and left navigation rail remain in place; each major game surface fills the remaining space.

Overflow is allowed only inside deliberate local panes such as inventories, journal columns, market tables, character-creation form bodies, dialogue logs, combat logs, or other bounded lists. This preserves all information without forcing the player to scroll the entire game page and lose screen context.

## Navigation screen

The Navigation Map is now a two-row application surface:

1. Map/context workspace
   - illustrated chart fills all remaining vertical map space;
   - registered map art, grid, routes, ports, POIs and ship tokens remain separate layers;
   - zoom, pan and recenter controls remain in the chart title bar;
   - selected-destination information occupies a fixed context pane.
2. Voyage action dock
   - always visible at the bottom of the navigation screen;
   - shows current position, grid cell, supplies and plotted/voyage status;
   - exposes Sail or Advance 4 Hours without scrolling;
   - includes recenter access.

## Regression boundary

0.5D does not change:

- world map coordinates or passability;
- A* navigation/pathfinding;
- port/POI approach cells or enterability;
- navigation zoom coordinate contracts;
- active Skeldra regional art registration;
- portrait IDs or Visual DNA;
- character progression, Attunement, NPC Brain, economy or combat rules;
- save schema (remains v6).

This is a presentation/layout checkpoint over the existing 0.5C corrective simulation and art state.
