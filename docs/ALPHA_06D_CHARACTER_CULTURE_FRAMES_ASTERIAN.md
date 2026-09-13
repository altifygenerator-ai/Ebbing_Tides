# Alpha 0.6D Character Culture Frames — Asterian

This pass adds the Asterian visual family to the existing Character Creator and Captain sheet on current Git commit `c358ee0`. It does not modify Skeldran art, character mechanics, naval combat behavior, audio behavior, save data, scrolling, or accordion behavior. It includes a type-only correction to the existing naval-audio snapshot so current Git passes strict compilation.

## Architecture

- Existing Creator and Captain DOM remains the sole geometry and interaction owner.
- Shared selectors mount the same structural slots for every implemented non-neutral culture.
- Each culture overrides only painted materials, vignettes, frame pieces, and palette variables.
- Unimplemented cultures continue to resolve to the neutral presentation.
- Religion remains a secondary medallion/accent mounted in the culture-owned socket.

## Asterian direction

Sun-worn cream marble, dark Mediterranean-blue painted hardwood, aged bronze/brass, ochre, and restrained wine-red enamel. The canonical sun-crescent-wave mark appears in the civic lintel. Supporting paintings reuse the existing Asterian harbor, city, market, and shipyard art already present in the repository.

All structural pieces preserve the accepted Production 1F dimensions and alpha masks: lintel 1800×265, sill 1800×207, stiles 130×1200, chapter threshold 1600×95, and register tab 900×173.

Serathi, Kaishin, Vesperan/Crossroads, and Outer Isles can now use the same variable and manifest contract while replacing their complete material, motif, and vignette families.
