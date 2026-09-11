-- Ebbing Tides Alpha 0.5 Update A — production-shaped character, NPC plan, Attunement,
-- asset-registry, and regional-map persistence boundary.
-- The versioned snapshot remains canonical; normalized records make future server-side simulation possible.

alter table public.game_saves
  alter column atlas_version set default 'WORLD_ATLAS_0.5A';

create table if not exists public.character_capabilities (
  save_id text not null references public.game_saves(id) on delete cascade,
  character_id text not null,
  identity jsonb not null default '{}'::jsonb,
  attributes jsonb not null default '{}'::jsonb,
  skills jsonb not null default '{}'::jsonb,
  specializations jsonb not null default '[]'::jsonb,
  knowledge_entries jsonb not null default '[]'::jsonb,
  condition jsonb not null default '{}'::jsonb,
  attunement jsonb not null default '{}'::jsonb,
  abilities jsonb not null default '[]'::jsonb,
  schematics jsonb not null default '[]'::jsonb,
  training_history jsonb not null default '[]'::jsonb,
  visual_dna jsonb not null default '{}'::jsonb,
  portrait_id text null,
  updated_at timestamptz not null default now(),
  primary key (save_id, character_id)
);

create table if not exists public.character_plans (
  save_id text not null references public.game_saves(id) on delete cascade,
  plan_id text not null,
  character_id text not null,
  plan_type text not null,
  status text not null,
  created_at_hour integer not null,
  expected_completion_hour integer null,
  next_decision_at_hour integer null,
  progress numeric not null default 0,
  payload jsonb not null default '{}'::jsonb,
  primary key (save_id, plan_id)
);
create index if not exists character_plans_wakeup_idx on public.character_plans(save_id, status, next_decision_at_hour);

create table if not exists public.simulation_events (
  save_id text not null references public.game_saves(id) on delete cascade,
  event_id text not null,
  scheduled_at_hour integer not null,
  event_type text not null,
  entity_id text not null,
  priority integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'scheduled',
  primary key (save_id, event_id)
);
create index if not exists simulation_events_due_idx on public.simulation_events(save_id, status, scheduled_at_hour, priority desc);

create table if not exists public.logical_assets (
  asset_id text primary key,
  display_name text null,
  asset_type text not null,
  category text null,
  subcategory text null,
  region text null,
  culture text null,
  art_status text not null,
  art_style_version text not null,
  regional_style_version text null,
  era text null,
  gameplay_role jsonb not null default '[]'::jsonb,
  material_family jsonb not null default '[]'::jsonb,
  attunement_compatibility text null,
  visual_anchor text null,
  alpha_priority text null,
  source_master text null,
  current_path text null,
  map_registration jsonb null,
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Ships/items/locations carry Arcane/Industrial load inside the canonical snapshot in 0.5A.
-- These JSON boundaries intentionally permit balance tuning without schema churn.
