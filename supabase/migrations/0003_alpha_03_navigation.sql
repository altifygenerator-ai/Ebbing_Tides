-- Ebbing Tides Alpha 0.3 global-navigation persistence boundary.
-- The whole campaign remains recoverable from game_saves.snapshot. These columns/tables expose
-- navigation state for future cloud sync, map knowledge, analytics and server-side simulation.

alter table public.game_saves
  add column if not exists atlas_version text not null default 'WORLD_ATLAS_0.3',
  add column if not exists navigation_state jsonb not null default '{}'::jsonb;

create table if not exists public.player_map_knowledge (
  save_id text not null references public.game_saves(id) on delete cascade,
  player_character_id text not null,
  cell_x integer not null,
  cell_y integer not null,
  knowledge_level text not null default 'charted',
  source text null,
  confidence integer not null default 100,
  learned_at_hour integer not null default 0,
  notes jsonb not null default '[]'::jsonb,
  primary key (save_id, player_character_id, cell_x, cell_y)
);

create index if not exists player_map_knowledge_save_idx
  on public.player_map_knowledge(save_id, player_character_id);

-- Ship `position` and `route_state` in public.ships already provide the normalized boundary for
-- persistent traffic. Alpha 0.3 changes their semantics: positions are global atlas coordinates and
-- route movement must follow valid navigable cells rather than straight-line interpolation.
