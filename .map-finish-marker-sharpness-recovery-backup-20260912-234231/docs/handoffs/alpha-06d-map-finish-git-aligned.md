# Alpha 0.6D — Map Finish Marker / Sharpness Recovery Pass 4

Pass 4 is the corrective implementation for the atlas finish layer.

It preserves the established current-Git navigation and accepted naval-audio stack while correcting two presentation mistakes from the earlier implementation:

1. atlas-driven marker/label presentation overrides are removed;
2. the close-zoom 24k LOD tier is generated and activated.

The chart markers, POIs, rings, and labels must remain in the same exact locations and keep the right marker ownership/style. The atlas runtime is restricted to delivery of the underlying map art only.

Expected result:
- same markers, same locations, same coordinates;
- sharper map art at both ordinary navigation scale and close zoom;
- no movement/combat/audio regression.
