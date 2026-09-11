# Ebbing Tides — Main Menu Shell Pass 1

This is a presentation-only parallel overlay designed to remain merge-safe with A0.2D.

## Added
- full-screen launch menu over the existing Character Creator;
- Continue / New Voyage / Settings / Credits;
- supplied `Sea Wind v1` main-menu music with OGG primary and MP3 fallback;
- gentle music fade-in/fade-out and browser autoplay fallback on first interaction;
- menu-only music on/off and volume preference;
- reduced-motion presentation preference;
- approved existing Veyrholm environment art as the background;
- responsive desktop/mobile menu layout.

## Integration boundary
The overlay does not modify `src/alpha/main.ts`, gameplay types, GameState, save schema, economy, NPC planning, combat, navigation, progression, knowledge, law, politics, crew mechanics, world simulation, or A0.2D work.

The launcher delegates Continue to the existing `[data-action="continue-save"]` control rendered by the Character Creator. It therefore does not duplicate save loading. New Voyage simply dismisses the shell and reveals the already-rendered Character Creator.

The only existing file changed is `public/alpha/index.html`, adding one CSS include and one start-menu module include. All other runtime files are new presentation/audio assets.

## Music
Supplied asset ID: `audio.music.main_menu.sea_wind_v1`
Runtime files:
- `/audio/menu/ebbing_tides_main_menu_sea_wind_v1.ogg`
- `/audio/menu/ebbing_tides_main_menu_sea_wind_v1.mp3`

The supplied source manifest is preserved at `/audio/menu/source_manifest.json`.
