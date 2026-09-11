# Alpha 0.5C — Skeldran Player Portrait Curation Register

## Corrected player-pool rule

Player creation uses **dedicated waist-up 4:5 portrait assets only**. General character art, full-body clothing/reference art, hero illustrations, and studio sheets may remain useful elsewhere in Ebbing Tides but do not enter the player chooser merely because they depict a Skeldran person. Stable logical IDs allow later fully new masters to replace a player image without changing the saved character.

## Selectable player pool

| Portrait ID | Presentation emphasis | Status |
| --- | --- | --- |
| `portrait.skeldra.male.weathered_sailor.01` | working sailor / navigator / dockside | PROVISIONAL |
| `portrait.skeldra.female.captain_cabin.01` | independent captain / cabin command | PROVISIONAL |
| `portrait.skeldra.female.harbor_noble.01` | harbor gentry / educated maritime class | PROVISIONAL |
| `portrait.skeldra.female.rune_seer.01` | Old Gods seer / scholar / traditionalist | PROVISIONAL |
| `portrait.skeldra.male.harbor_noble.01` | young harbor gentry / merchant-scholar | PROVISIONAL |
| `portrait.skeldra.male.industrial_officer.01` | Ironhaven technical/industrial professional | PROVISIONAL |
| `portrait.skeldra.male.storm_admiral.01` | mature rough-weather naval command | PROVISIONAL |
| `portrait.skeldra.male.naval_duelist.01` | young martial/naval specialist | PROVISIONAL |

All selectable files live under `public/art/characters/portraits/skeldra/player_v1/`, are 900×1125 WebP, and use the existing logical portrait IDs/Visual DNA records.

## Reference-only assets excluded from player creation

The following remain in the broader art registry for NPC/event/reference use but are intentionally excluded from `PORTRAIT_CHOICES` because their composition is not a dedicated player portrait:

- `portrait.skeldra.male.naval_captain.anchor`
- `portrait.skeldra.female.shipowner_studio.01`
- `portrait.skeldra.male.naval_officer_studio.01`
- `portrait.skeldra.male.old_gods_priest.01`

## Expansion rule

Asterian, Serathi, Kaishin/Eastern, Vesperan, Outer Isles and later mixed-heritage libraries must follow the same dedicated-player-portrait contract when their regional art passes are produced.
