# Alpha 0.6D Portrait + Music Integration Pass

Scope of this pass intentionally stayed limited to **character portraits and music wiring only**.
No mechanics, balance rules, or UI art layouts were deliberately changed.

## Imported portrait packs
- Skeldra full portrait pack copied into `public/art/characters/portraits/library/skeldra_full_pack/`
- Asteria full portrait pack copied into `public/art/characters/portraits/library/asteria_full_pack/`
- New cultures pack (Serathi / Kaishin / Vesperan / Outer Isles) copied into `public/art/characters/portraits/library/new_cultures_pack_v2/`
- Accepted Vaering named-character portraits copied into `public/art/characters/named/skeldra/vaering_batch_01/`

## Curated Character Creator additions
New curated player-selectable portraits were added for:
- Skeldra (4 additional curated portraits)
- Asteria (4)
- Serathi (4)
- Kaishin (4)
- Vesperan (4)
- Outer Isles (4)

This expands the Character Creator curated pool from the original Skeldran-only baseline to multi-culture support.

## Music / ambience imports
Navigation ambience tracks copied into `public/audio/navigation/`:
- `nav_calm_open_sea_v1.*`
- `nav_coastal_near_port_v1.*`
- `nav_rough_sea_v1.*`
- `nav_storm_heavy_weather_v1.*`
- `navigation_music_ocean_balanced_v1.*`
- `navigation_music_ocean_ambience_forward_v1.*`

Location ambience tracks copied into `public/audio/locations/`:
- `veyrholm_market_layered_prototype.*`
- `veyrholm_town_street_layered_prototype.*`
- `veyrholm_tavern_layered_prototype.*`
- `ironhaven_shipyard_harbor_layered_prototype.*`

## Wiring summary
- Character Creator now has curated portrait support for the imported cultures above.
- Captain portrait rendering uses the same registry additions automatically.
- Audio scene selection now routes sea travel into calm / coastal / rough / storm navigation beds.
- Veyrholm town, market, and tavern each have dedicated ambience beds.
- Ironhaven uses the shipyard / harbor ambience bed.
- Stormvik and Thorenfjord retain procedural fallback ambience until dedicated beds are added.
- Procedural cues (UI / coin / sail / cannon / etc.) remain active.

## Notes
- Accepted named Vaering portraits were imported into the project library, but no additional historical portrait UI was introduced in this pass.
- This pass is meant to be a presentation/content expansion layer over the existing 0.6D baseline.
