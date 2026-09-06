-- Ebbing Tides Build 0.1 persistence foundation.
-- Current standalone alpha uses localStorage for zero-setup playability, but these stable IDs/data boundaries
-- mirror the production-shaped records the simulation already uses.

create extension if not exists pgcrypto;

create table if not exists public.game_saves (
  id text primary key,
  owner_user_id uuid null,
  world_seed text not null,
  schema_version integer not null default 1,
  absolute_hour integer not null default 0,
  clock_year integer not null default 628,
  clock_day integer not null default 1,
  clock_hour integer not null default 0,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.characters (
  id text not null,
  save_id text not null references public.game_saves(id) on delete cascade,
  tier smallint not null default 2,
  is_player boolean not null default false,
  name text not null,
  age integer null,
  culture_id text null,
  religion_id text null,
  location_port_id text null,
  ship_id text null,
  attributes jsonb not null default '{}'::jsonb,
  skills jsonb not null default '{}'::jsonb,
  personality jsonb not null default '{}'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  beliefs jsonb not null default '[]'::jsonb,
  fast_state jsonb not null default '{}'::jsonb,
  canonical_visual_dna jsonb not null default '{}'::jsonb,
  is_deceased boolean not null default false,
  primary key (save_id, id)
);

create table if not exists public.relationships (
  save_id text not null references public.game_saves(id) on delete cascade,
  source_character_id text not null,
  target_character_id text not null,
  trust integer not null default 0,
  respect integer not null default 0,
  fear integer not null default 0,
  affection integer not null default 0,
  suspicion integer not null default 0,
  reasons jsonb not null default '[]'::jsonb,
  primary key (save_id, source_character_id, target_character_id)
);

create table if not exists public.ships (
  id text not null,
  save_id text not null references public.game_saves(id) on delete cascade,
  name text not null,
  class_id text not null,
  region_id text not null,
  owner_character_id text not null,
  position jsonb not null,
  docked_at_port_id text null,
  route_state jsonb null,
  stats jsonb not null,
  systems jsonb not null,
  cargo jsonb not null default '[]'::jsonb,
  supplies integer not null default 0,
  disposition text not null,
  fame_tags jsonb not null default '[]'::jsonb,
  art_asset_id text null,
  token_asset_id text null,
  primary key (save_id, id)
);

create table if not exists public.port_markets (
  save_id text not null references public.game_saves(id) on delete cascade,
  port_id text not null,
  commodity_id text not null,
  stock numeric not null,
  target_stock numeric not null,
  local_multiplier numeric not null,
  last_price numeric not null,
  last_updated_hour integer not null,
  primary key (save_id, port_id, commodity_id)
);

create table if not exists public.player_knowledge (
  id text not null,
  save_id text not null references public.game_saves(id) on delete cascade,
  player_character_id text not null,
  category text not null,
  subject_id text null,
  knowledge_text text not null,
  source_text text not null,
  learned_at_hour integer not null,
  confidence integer not null,
  truth_status text not null default 'unknown',
  hard_rumor boolean not null default false,
  primary key (save_id, id)
);

create table if not exists public.world_events (
  id text not null,
  save_id text not null references public.game_saves(id) on delete cascade,
  event_type text not null,
  at_hour integer not null,
  location_id text null,
  participants jsonb not null default '[]'::jsonb,
  summary text not null,
  canonical_data jsonb not null default '{}'::jsonb,
  importance integer not null default 1,
  rng_roll jsonb null,
  primary key (save_id, id)
);
create index if not exists world_events_save_hour_idx on public.world_events(save_id, at_hour desc);

create table if not exists public.contracts (
  id text not null,
  save_id text not null references public.game_saves(id) on delete cascade,
  contract_type text not null,
  status text not null,
  issuer_character_id text null,
  issuer_name text null,
  source_port_id text not null,
  destination_port_id text not null,
  commodity_id text null,
  quantity numeric null,
  reward jsonb not null default '{}'::jsonb,
  reason text not null,
  created_at_hour integer not null,
  deadline_hour integer null,
  resolution jsonb null,
  primary key (save_id, id)
);

create table if not exists public.asset_registry (
  asset_id text primary key,
  asset_type text not null,
  canonical_subject_id text null,
  region_id text null,
  status text not null,
  art_style_version text not null,
  regional_style_version text null,
  era text null,
  source_master_filename text not null,
  runtime_paths jsonb not null default '[]'::jsonb,
  crop_scale_rules jsonb not null default '{}'::jsonb,
  notes text null,
  supersedes text null,
  superseded_by text null
);

-- RLS/auth policies intentionally deferred until the actual account/save ownership flow exists.
-- Do not expose service-role credentials to the client.
