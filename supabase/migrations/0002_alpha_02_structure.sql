-- Ebbing Tides Alpha 0.2 persistence expansion.
-- Canonical game-state writes may use game_saves.snapshot for lossless versioned saves.
-- Normalized tables below create queryable boundaries for equipment, crew, injuries and intelligence.

alter table public.game_saves
  add column if not exists snapshot jsonb null;

alter table public.ships
  add column if not exists refits jsonb not null default '[]'::jsonb;

create table if not exists public.player_inventory (
  save_id text not null references public.game_saves(id) on delete cascade,
  instance_id text not null,
  player_character_id text not null,
  definition_id text not null,
  quality text not null,
  condition text not null,
  origin text null,
  acquired_at_hour integer not null,
  history jsonb not null default '[]'::jsonb,
  primary key (save_id, instance_id)
);

create table if not exists public.player_equipment (
  save_id text not null references public.game_saves(id) on delete cascade,
  player_character_id text not null,
  slot text not null,
  instance_id text not null,
  primary key (save_id, player_character_id, slot)
);

create table if not exists public.character_injuries (
  save_id text not null references public.game_saves(id) on delete cascade,
  injury_id text not null,
  character_id text not null,
  body_part text not null,
  injury_type text not null,
  severity smallint not null check (severity between 1 and 3),
  acquired_at_hour integer not null,
  source text not null,
  treated boolean not null default false,
  primary key (save_id, injury_id)
);

create table if not exists public.ship_crew (
  save_id text not null references public.game_saves(id) on delete cascade,
  crew_id text not null,
  ship_id text not null,
  npc_id text null,
  name text not null,
  role text not null,
  skill integer not null default 0,
  morale integer not null default 50,
  loyalty integer not null default 0,
  primary key (save_id, crew_id)
);

create table if not exists public.ship_intelligence (
  save_id text not null references public.game_saves(id) on delete cascade,
  player_character_id text not null,
  ship_id text not null,
  identified boolean not null default false,
  name text null,
  disposition text null,
  confidence integer not null,
  last_known_position jsonb not null,
  last_known_at_hour integer not null,
  source text not null,
  primary key (save_id, player_character_id, ship_id)
);

create index if not exists ship_intelligence_save_hour_idx
  on public.ship_intelligence(save_id, last_known_at_hour desc);

-- RLS/auth policy remains intentionally separate from the simulation layer.
-- The browser adapter requires an authenticated access token and never accepts service-role secrets.
