# Production 1I — Asterian Civic-Maritime Character Frames

Base: current public Git `c358ee0` (`main`) at packaging time.

Extract this overlay into the project root, preserving folders and replacing matching files. It includes TypeScript source and the compiled Alpha runtime file.

Included: the complete Asterian Character Creator/Captain art pack, shared non-neutral frame selectors, culture manifest registration, focused tests, and visual-QA contact sheets. A type-only correction to the existing naval-audio snapshot is included so current Git passes strict compilation.

Explicitly unchanged: Skeldran art and accepted geometry; character mechanics; naval combat behavior/UI; audio cues/files/gain/timing; save schema; scrolling and accordion behavior.

Verification: strict TypeScript build passed; focused character-frame suite passed; all Asterian 1F dimensions and alpha passed; ZIP integrity and clean-checkout overlay installation passed.

Correction 1I.1: Asterian culture-variable selectors now match the shared fallback specificity. This prevents the Skeldran defaults from overriding Asterian frames, vignettes, palette, and register art.

The broad repository suite has unrelated failures already present on the base commit, including stale atlas/canon/portrait and naval-polish assertions. This overlay does not alter or hide them.
