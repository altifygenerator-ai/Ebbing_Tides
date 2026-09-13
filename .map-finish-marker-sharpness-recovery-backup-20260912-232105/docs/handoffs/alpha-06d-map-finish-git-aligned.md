# Alpha 0.6D — Map Finish / Current Git + Naval Audio v2 Aligned Pass 3

Audited against Git `main` commit `c358ee003d71ad5ac18b77f79bcea1dab7ea9853` and the accepted
Naval Audio Variation Hotfix v2.

This pass remains atlas-presentation-only. It does not replace main/audio/navigation/combat files.
The installer now positively verifies the v2 round-shot variation and probabilistic crew-cue state
before installing, then verifies all critical main/audio/navigation files are byte-identical after.

Preserved audio behavior:
- first player Round Shot: full round-shot volley;
- subsequent Round Shots: plain cannon report;
- Chain Shot: chain-shot volley;
- maneuver crew call: ~42%;
- grapple "hey": ~68%;
- surrender "hey": ~50%;
- enemy cannon: plain cannon report;
- combat music, boarding, victory, defeat: current real-file routing.

Preserved navigation behavior:
- async/chunked voyage runner;
- Tideworn interpolation;
- ~3.0 second long-voyage visual target;
- 70–170 ms tween bounds;
- current drag/pan/cursor-anchored zoom;
- current hit-grid behavior.

The 12k atlas tier changes raster sampling quality only. Geography, ports, POIs, approach points,
route coordinates, and interaction hit targets remain unchanged.
