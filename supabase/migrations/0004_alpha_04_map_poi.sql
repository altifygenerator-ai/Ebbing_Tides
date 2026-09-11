-- Ebbing Tides Alpha 0.4 illustrated-atlas / enterable-POI persistence boundary.
-- The campaign snapshot remains canonical. These normalized tables expose player knowledge and
-- destination state for later server-side simulation without making visual artwork authoritative.

alter table public.game_saves
  alter column atlas_version set default 'WORLD_ATLAS_0.4';

create table if not exists public.player_known_pois (
  save_id text not null references public.game_saves(id) on delete cascade,
  player_character_id text not null,
  poi_id text not null,
  learned_at_hour integer not null default 0,
  source text null,
  confidence integer not null default 100,
  notes jsonb not null default '[]'::jsonb,
  primary key (save_id, player_character_id, poi_id)
);

create index if not exists player_known_pois_save_idx
  on public.player_known_pois(save_id, player_character_id);

-- navigation_state in game_saves.snapshot now also carries current_poi_id. Port and POI marker
-- positions are interaction geography; the ship remains at the navigable approach cell.
