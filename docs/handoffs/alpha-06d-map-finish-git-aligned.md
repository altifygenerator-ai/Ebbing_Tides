# Alpha 0.6D — True Close LOD Fix Pass 5

Root cause: atlas LOD tile nodes were cached by `col,row` only. When the chart switched from the 12k tier to the 24k tier, overlapping keys could keep stale 12k nodes alive. The chart could therefore claim the 24k tier while visually showing lower-resolution tiles.

Pass 5 makes LOD level identity part of tile ownership and clears the prior tile group on level switches. The 24k tier is regenerated losslessly for close zoom.

No map marker coordinates or gameplay systems change.
