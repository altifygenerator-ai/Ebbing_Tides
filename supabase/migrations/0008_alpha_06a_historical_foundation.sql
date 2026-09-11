-- IMPORTANT: Run `rollback;` once in a separate Supabase SQL Editor query before this file
-- if a previous attempt left the editor/session inside a failed transaction.
begin;
set constraints all immediate;

-- Ebbing Tides Alpha 0.6A — Calendar + Historical World Database Foundation
-- Authored pre-628 CR history and simulated post-628 CR history share these structures.
-- world_scope_id='canon' is the authored shared world. Later campaign-specific simulation can use save/world scope IDs.

alter table public.game_saves
  add column if not exists clock_month integer not null default 1,
  add column if not exists clock_day_of_year integer not null default 1;

-- New application snapshots are schema v8. Existing v7 snapshots migrate application-side from absolute_hour.

create table if not exists public.historical_characters (
  world_scope_id text not null default 'canon',
  id text not null,
  runtime_character_id text null,
  lifecycle text not null check (lifecycle in ('historical_only','living_persistent')),
  name text not null,
  sex text not null,
  ancestry_id text not null,
  homeland_region_id text not null,
  culture_id text not null,
  religion_id text not null,
  birth_precision text not null default 'unknown', birth_year integer null, birth_month integer null, birth_day integer null, birth_hour integer null, birth_end_year integer null,
  death_precision text not null default 'unknown', death_year integer null, death_month integer null, death_day integer null, death_hour integer null, death_end_year integer null,
  social_status text null,
  house_id text null,
  notes text null,
  canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  created_at timestamptz not null default now(),
  primary key (world_scope_id, id)
);

create table if not exists public.houses (
  world_scope_id text not null default 'canon',
  id text not null,
  name text not null,
  culture_id text not null,
  region_id text not null,
  founded_precision text not null default 'unknown', founded_year integer null, founded_month integer null, founded_day integer null, founded_hour integer null, founded_end_year integer null,
  ended_precision text not null default 'unknown', ended_year integer null, ended_month integer null, ended_day integer null, ended_hour integer null, ended_end_year integer null,
  founder_character_id text null,
  parent_house_id text null,
  cadet_branch_of_house_id text null,
  notes text null,
  status text not null default 'active',
  canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);

create table if not exists public.historical_relationships (
  world_scope_id text not null default 'canon',
  id text not null,
  from_character_id text not null,
  to_character_id text not null,
  relationship_type text not null,
  start_precision text not null default 'unknown', start_year integer null, start_month integer null, start_day integer null, start_hour integer null, start_end_year integer null,
  end_precision text not null default 'unknown', end_year integer null, end_month integer null, end_day integer null, end_hour integer null, end_end_year integer null,
  end_reason text null,
  canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);
create index if not exists historical_relationship_people_idx on public.historical_relationships(world_scope_id, from_character_id, to_character_id, relationship_type);

create table if not exists public.institutions (
  world_scope_id text not null default 'canon',
  id text not null,
  name text not null,
  founder_character_id text null,
  founded_precision text not null default 'unknown', founded_year integer null, founded_month integer null, founded_day integer null, founded_hour integer null, founded_end_year integer null,
  ended_precision text not null default 'unknown', ended_year integer null, ended_month integer null, ended_day integer null, ended_hour integer null, ended_end_year integer null,
  region_id text null,
  religion_id text null,
  culture_id text null,
  purpose text not null,
  headquarters_location_id text null,
  parent_institution_id text null,
  current_status text not null default 'active',
  canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);

create table if not exists public.offices (
  world_scope_id text not null default 'canon',
  id text not null,
  name text not null,
  institution_id text null,
  region_id text null,
  selection_mode text not null,
  hereditary_by_default boolean not null default false,
  notes text null,
  canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);

create table if not exists public.office_terms (
  world_scope_id text not null default 'canon',
  id text not null,
  office_id text not null,
  holder_character_id text not null,
  start_precision text not null default 'unknown', start_year integer null, start_month integer null, start_day integer null, start_hour integer null, start_end_year integer null,
  end_precision text not null default 'unknown', end_year integer null, end_month integer null, end_day integer null, end_hour integer null, end_end_year integer null,
  end_reason text null,
  interim boolean not null default false,
  canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);
create index if not exists office_terms_office_chronology_idx on public.office_terms(world_scope_id, office_id, start_year, start_month, start_day);

create table if not exists public.historical_claims (
  world_scope_id text not null default 'canon',
  id text not null,
  claimant_character_id text not null,
  target_office_id text not null,
  basis text not null,
  strength numeric null,
  priority integer null,
  legal_basis text null,
  genealogical_path jsonb not null default '[]'::jsonb,
  disputed boolean not null default false,
  active boolean not null default true,
  start_precision text not null default 'unknown', start_year integer null, start_month integer null, start_day integer null, start_hour integer null, start_end_year integer null,
  end_precision text not null default 'unknown', end_year integer null, end_month integer null, end_day integer null, end_hour integer null, end_end_year integer null,
  canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);

create table if not exists public.historical_events (
  world_scope_id text not null default 'canon',
  id text not null,
  event_type text not null,
  title text not null,
  date_precision text not null default 'unknown', date_year integer null, date_month integer null, date_day integer null, date_hour integer null, date_end_year integer null,
  location_id text null,
  description text not null,
  canonical_status text not null default 'canonical',
  origin text not null check (origin in ('authored','simulated')),
  source_confidence numeric null,
  created_by_system text null,
  imported_from_seed text null,
  simulation_event_id text null,
  created_at timestamptz not null default now(),
  primary key (world_scope_id, id)
);
create index if not exists historical_events_chronology_idx on public.historical_events(world_scope_id, date_year, date_month, date_day, date_hour);
create index if not exists historical_events_type_idx on public.historical_events(world_scope_id, event_type);

create table if not exists public.historical_event_participants (
  world_scope_id text not null default 'canon',
  event_id text not null,
  character_id text not null,
  role text null,
  primary key (world_scope_id, event_id, character_id)
);
create table if not exists public.historical_event_factions (
  world_scope_id text not null default 'canon',
  event_id text not null,
  faction_id text not null,
  role text null,
  primary key (world_scope_id, event_id, faction_id)
);
create table if not exists public.historical_event_links (
  world_scope_id text not null default 'canon',
  id text not null,
  source_event_id text not null,
  target_event_id text not null,
  relation_type text not null,
  notes text null,
  canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);

create table if not exists public.wars (
  world_scope_id text not null default 'canon',
  id text not null,
  name text not null,
  start_precision text not null default 'unknown', start_year integer null, start_month integer null, start_day integer null, start_hour integer null, start_end_year integer null,
  end_precision text not null default 'unknown', end_year integer null, end_month integer null, end_day integer null, end_hour integer null, end_end_year integer null,
  cause_event_ids jsonb not null default '[]'::jsonb,
  goals jsonb not null default '[]'::jsonb,
  outcome text null,
  linked_event_ids jsonb not null default '[]'::jsonb,
  canonical_status text not null default 'canonical',
  origin text not null check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);
create table if not exists public.war_participants (
  world_scope_id text not null default 'canon', war_id text not null, faction_id text not null, role text null,
  primary key (world_scope_id, war_id, faction_id)
);

create table if not exists public.battles (
  world_scope_id text not null default 'canon',
  id text not null,
  name text not null,
  war_id text null,
  date_precision text not null default 'unknown', date_year integer null, date_month integer null, date_day integer null, date_hour integer null, date_end_year integer null,
  location_id text null,
  result text not null,
  casualties text null,
  event_id text null,
  canonical_status text not null default 'canonical',
  origin text not null check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);
create table if not exists public.battle_commanders (
  world_scope_id text not null default 'canon', battle_id text not null, character_id text not null, faction_id text null,
  primary key (world_scope_id, battle_id, character_id)
);
create table if not exists public.battle_factions (
  world_scope_id text not null default 'canon', battle_id text not null, faction_id text not null, result text null,
  primary key (world_scope_id, battle_id, faction_id)
);
create table if not exists public.battle_ships (
  world_scope_id text not null default 'canon', battle_id text not null, ship_id text not null, role text null,
  primary key (world_scope_id, battle_id, ship_id)
);

create table if not exists public.treaties (
  world_scope_id text not null default 'canon',
  id text not null,
  name text not null,
  date_precision text not null default 'unknown', date_year integer null, date_month integer null, date_day integer null, date_hour integer null, date_end_year integer null,
  provisions jsonb not null default '[]'::jsonb,
  effect text not null,
  modified_war_ids jsonb not null default '[]'::jsonb,
  event_id text null,
  canonical_status text not null default 'canonical',
  origin text not null check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);
create table if not exists public.treaty_participants (
  world_scope_id text not null default 'canon', treaty_id text not null, faction_id text not null,
  primary key (world_scope_id, treaty_id, faction_id)
);

create table if not exists public.historical_ships (
  world_scope_id text not null default 'canon',
  id text not null,
  name text not null,
  ship_class text null,
  built_precision text not null default 'unknown', built_year integer null, built_month integer null, built_day integer null, built_hour integer null, built_end_year integer null,
  builder_institution_id text null,
  builder_name text null,
  port_built_id text null,
  loss_precision text not null default 'unknown', loss_year integer null, loss_month integer null, loss_day integer null, loss_hour integer null, loss_end_year integer null,
  fame_tags jsonb not null default '[]'::jsonb,
  canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);
create table if not exists public.historical_ship_ownership (
  world_scope_id text not null default 'canon',
  id text not null,
  ship_id text not null,
  owner_character_id text null,
  owner_institution_id text null,
  owner_name text null,
  ownership_status text not null default 'known',
  start_precision text not null default 'unknown', start_year integer null, start_month integer null, start_day integer null, start_hour integer null, start_end_year integer null,
  end_precision text not null default 'unknown', end_year integer null, end_month integer null, end_day integer null, end_hour integer null, end_end_year integer null,
  acquisition_method text null,
  canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);
create table if not exists public.historical_ship_commands (
  world_scope_id text not null default 'canon',
  id text not null, ship_id text not null, captain_character_id text not null,
  start_precision text not null default 'unknown', start_year integer null, start_month integer null, start_day integer null, start_hour integer null, start_end_year integer null,
  end_precision text not null default 'unknown', end_year integer null, end_month integer null, end_day integer null, end_hour integer null, end_end_year integer null,
  end_reason text null, canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);
create table if not exists public.historical_ship_refits (
  world_scope_id text not null default 'canon', id text not null, ship_id text not null,
  date_precision text not null default 'unknown', date_year integer null, date_month integer null, date_day integer null, date_hour integer null, date_end_year integer null,
  description text not null, location_id text null, canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);
create table if not exists public.historical_ship_renames (
  world_scope_id text not null default 'canon', id text not null, ship_id text not null, old_name text not null, new_name text not null,
  date_precision text not null default 'unknown', date_year integer null, date_month integer null, date_day integer null, date_hour integer null, date_end_year integer null,
  reason text null, canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);

create table if not exists public.historical_sources (
  world_scope_id text not null default 'canon',
  id text not null,
  title text not null,
  author_character_id text null,
  author_name text null,
  written_precision text not null default 'unknown', written_year integer null, written_month integer null, written_day integer null, written_hour integer null, written_end_year integer null,
  culture_id text null,
  institution_id text null,
  source_type text not null,
  reliability numeric not null default 50,
  bias_tags jsonb not null default '[]'::jsonb,
  summary text not null,
  canonical_status text not null default 'canonical',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);
create table if not exists public.historical_interpretations (
  world_scope_id text not null default 'canon',
  id text not null,
  source_id text not null,
  event_id text not null,
  interpretation text not null,
  confidence numeric not null default 50,
  canonical_status text not null default 'disputed',
  origin text not null default 'authored' check (origin in ('authored','simulated')),
  primary key (world_scope_id, id)
);
create table if not exists public.historical_interpretation_disagreements (
  world_scope_id text not null default 'canon',
  interpretation_id text not null,
  disagrees_with_interpretation_id text not null,
  primary key (world_scope_id, interpretation_id, disagrees_with_interpretation_id)
);


-- Relational integrity. Composite keys preserve separation between canonical and future campaign/world scopes.

-- Constraints are added idempotently so the Supabase SQL editor can safely resume/re-run this migration.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_characters_house_fk'
      and conrelid = 'public.historical_characters'::regclass
  ) then
    alter table public.historical_characters
      add constraint historical_characters_house_fk foreign key (world_scope_id, house_id)
      references public.houses(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'houses_founder_fk'
      and conrelid = 'public.houses'::regclass
  ) then
    alter table public.houses
      add constraint houses_founder_fk foreign key (world_scope_id, founder_character_id)
      references public.historical_characters(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'houses_parent_fk'
      and conrelid = 'public.houses'::regclass
  ) then
    alter table public.houses
      add constraint houses_parent_fk foreign key (world_scope_id, parent_house_id)
      references public.houses(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'houses_cadet_fk'
      and conrelid = 'public.houses'::regclass
  ) then
    alter table public.houses
      add constraint houses_cadet_fk foreign key (world_scope_id, cadet_branch_of_house_id)
      references public.houses(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_relationships_from_fk'
      and conrelid = 'public.historical_relationships'::regclass
  ) then
    alter table public.historical_relationships
      add constraint historical_relationships_from_fk foreign key (world_scope_id, from_character_id)
      references public.historical_characters(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_relationships_to_fk'
      and conrelid = 'public.historical_relationships'::regclass
  ) then
    alter table public.historical_relationships
      add constraint historical_relationships_to_fk foreign key (world_scope_id, to_character_id)
      references public.historical_characters(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'institutions_founder_fk'
      and conrelid = 'public.institutions'::regclass
  ) then
    alter table public.institutions
      add constraint institutions_founder_fk foreign key (world_scope_id, founder_character_id)
      references public.historical_characters(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'institutions_parent_fk'
      and conrelid = 'public.institutions'::regclass
  ) then
    alter table public.institutions
      add constraint institutions_parent_fk foreign key (world_scope_id, parent_institution_id)
      references public.institutions(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'offices_institution_fk'
      and conrelid = 'public.offices'::regclass
  ) then
    alter table public.offices
      add constraint offices_institution_fk foreign key (world_scope_id, institution_id)
      references public.institutions(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'office_terms_office_fk'
      and conrelid = 'public.office_terms'::regclass
  ) then
    alter table public.office_terms
      add constraint office_terms_office_fk foreign key (world_scope_id, office_id)
      references public.offices(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'office_terms_holder_fk'
      and conrelid = 'public.office_terms'::regclass
  ) then
    alter table public.office_terms
      add constraint office_terms_holder_fk foreign key (world_scope_id, holder_character_id)
      references public.historical_characters(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_claims_claimant_fk'
      and conrelid = 'public.historical_claims'::regclass
  ) then
    alter table public.historical_claims
      add constraint historical_claims_claimant_fk foreign key (world_scope_id, claimant_character_id)
      references public.historical_characters(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_claims_office_fk'
      and conrelid = 'public.historical_claims'::regclass
  ) then
    alter table public.historical_claims
      add constraint historical_claims_office_fk foreign key (world_scope_id, target_office_id)
      references public.offices(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_event_participants_event_fk'
      and conrelid = 'public.historical_event_participants'::regclass
  ) then
    alter table public.historical_event_participants
      add constraint historical_event_participants_event_fk foreign key (world_scope_id, event_id)
      references public.historical_events(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_event_participants_character_fk'
      and conrelid = 'public.historical_event_participants'::regclass
  ) then
    alter table public.historical_event_participants
      add constraint historical_event_participants_character_fk foreign key (world_scope_id, character_id)
      references public.historical_characters(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_event_factions_event_fk'
      and conrelid = 'public.historical_event_factions'::regclass
  ) then
    alter table public.historical_event_factions
      add constraint historical_event_factions_event_fk foreign key (world_scope_id, event_id)
      references public.historical_events(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_event_links_source_fk'
      and conrelid = 'public.historical_event_links'::regclass
  ) then
    alter table public.historical_event_links
      add constraint historical_event_links_source_fk foreign key (world_scope_id, source_event_id)
      references public.historical_events(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_event_links_target_fk'
      and conrelid = 'public.historical_event_links'::regclass
  ) then
    alter table public.historical_event_links
      add constraint historical_event_links_target_fk foreign key (world_scope_id, target_event_id)
      references public.historical_events(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'war_participants_war_fk'
      and conrelid = 'public.war_participants'::regclass
  ) then
    alter table public.war_participants
      add constraint war_participants_war_fk foreign key (world_scope_id, war_id)
      references public.wars(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'battles_war_fk'
      and conrelid = 'public.battles'::regclass
  ) then
    alter table public.battles
      add constraint battles_war_fk foreign key (world_scope_id, war_id)
      references public.wars(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'battles_event_fk'
      and conrelid = 'public.battles'::regclass
  ) then
    alter table public.battles
      add constraint battles_event_fk foreign key (world_scope_id, event_id)
      references public.historical_events(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'battle_commanders_battle_fk'
      and conrelid = 'public.battle_commanders'::regclass
  ) then
    alter table public.battle_commanders
      add constraint battle_commanders_battle_fk foreign key (world_scope_id, battle_id)
      references public.battles(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'battle_commanders_character_fk'
      and conrelid = 'public.battle_commanders'::regclass
  ) then
    alter table public.battle_commanders
      add constraint battle_commanders_character_fk foreign key (world_scope_id, character_id)
      references public.historical_characters(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'battle_factions_battle_fk'
      and conrelid = 'public.battle_factions'::regclass
  ) then
    alter table public.battle_factions
      add constraint battle_factions_battle_fk foreign key (world_scope_id, battle_id)
      references public.battles(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'treaties_event_fk'
      and conrelid = 'public.treaties'::regclass
  ) then
    alter table public.treaties
      add constraint treaties_event_fk foreign key (world_scope_id, event_id)
      references public.historical_events(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'treaty_participants_treaty_fk'
      and conrelid = 'public.treaty_participants'::regclass
  ) then
    alter table public.treaty_participants
      add constraint treaty_participants_treaty_fk foreign key (world_scope_id, treaty_id)
      references public.treaties(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_ships_builder_fk'
      and conrelid = 'public.historical_ships'::regclass
  ) then
    alter table public.historical_ships
      add constraint historical_ships_builder_fk foreign key (world_scope_id, builder_institution_id)
      references public.institutions(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_ship_ownership_ship_fk'
      and conrelid = 'public.historical_ship_ownership'::regclass
  ) then
    alter table public.historical_ship_ownership
      add constraint historical_ship_ownership_ship_fk foreign key (world_scope_id, ship_id)
      references public.historical_ships(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_ship_ownership_character_fk'
      and conrelid = 'public.historical_ship_ownership'::regclass
  ) then
    alter table public.historical_ship_ownership
      add constraint historical_ship_ownership_character_fk foreign key (world_scope_id, owner_character_id)
      references public.historical_characters(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_ship_ownership_institution_fk'
      and conrelid = 'public.historical_ship_ownership'::regclass
  ) then
    alter table public.historical_ship_ownership
      add constraint historical_ship_ownership_institution_fk foreign key (world_scope_id, owner_institution_id)
      references public.institutions(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_ship_commands_ship_fk'
      and conrelid = 'public.historical_ship_commands'::regclass
  ) then
    alter table public.historical_ship_commands
      add constraint historical_ship_commands_ship_fk foreign key (world_scope_id, ship_id)
      references public.historical_ships(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_ship_commands_captain_fk'
      and conrelid = 'public.historical_ship_commands'::regclass
  ) then
    alter table public.historical_ship_commands
      add constraint historical_ship_commands_captain_fk foreign key (world_scope_id, captain_character_id)
      references public.historical_characters(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_ship_refits_ship_fk'
      and conrelid = 'public.historical_ship_refits'::regclass
  ) then
    alter table public.historical_ship_refits
      add constraint historical_ship_refits_ship_fk foreign key (world_scope_id, ship_id)
      references public.historical_ships(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_ship_renames_ship_fk'
      and conrelid = 'public.historical_ship_renames'::regclass
  ) then
    alter table public.historical_ship_renames
      add constraint historical_ship_renames_ship_fk foreign key (world_scope_id, ship_id)
      references public.historical_ships(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'battle_ships_battle_fk'
      and conrelid = 'public.battle_ships'::regclass
  ) then
    alter table public.battle_ships
      add constraint battle_ships_battle_fk foreign key (world_scope_id, battle_id)
      references public.battles(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'battle_ships_ship_fk'
      and conrelid = 'public.battle_ships'::regclass
  ) then
    alter table public.battle_ships
      add constraint battle_ships_ship_fk foreign key (world_scope_id, ship_id)
      references public.historical_ships(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_sources_author_fk'
      and conrelid = 'public.historical_sources'::regclass
  ) then
    alter table public.historical_sources
      add constraint historical_sources_author_fk foreign key (world_scope_id, author_character_id)
      references public.historical_characters(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_sources_institution_fk'
      and conrelid = 'public.historical_sources'::regclass
  ) then
    alter table public.historical_sources
      add constraint historical_sources_institution_fk foreign key (world_scope_id, institution_id)
      references public.institutions(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_interpretations_source_fk'
      and conrelid = 'public.historical_interpretations'::regclass
  ) then
    alter table public.historical_interpretations
      add constraint historical_interpretations_source_fk foreign key (world_scope_id, source_id)
      references public.historical_sources(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_interpretations_event_fk'
      and conrelid = 'public.historical_interpretations'::regclass
  ) then
    alter table public.historical_interpretations
      add constraint historical_interpretations_event_fk foreign key (world_scope_id, event_id)
      references public.historical_events(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_interpretation_disagreements_left_fk'
      and conrelid = 'public.historical_interpretation_disagreements'::regclass
  ) then
    alter table public.historical_interpretation_disagreements
      add constraint historical_interpretation_disagreements_left_fk foreign key (world_scope_id, interpretation_id)
      references public.historical_interpretations(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'historical_interpretation_disagreements_right_fk'
      and conrelid = 'public.historical_interpretation_disagreements'::regclass
  ) then
    alter table public.historical_interpretation_disagreements
      add constraint historical_interpretation_disagreements_right_fk foreign key (world_scope_id, disagrees_with_interpretation_id)
      references public.historical_interpretations(world_scope_id, id) deferrable initially deferred;
  end if;
end
$$;

commit;

-- Minimal canonical/validation seed. 0.6B deliberately owns broad population.
-- Seed data is intentionally isolated from schema/ALTER work.
-- This prevents deferred FK trigger events from blocking ALTER TABLE in Supabase/PostgreSQL.
begin;
set constraints all deferred;
insert into public.houses (id,name,culture_id,region_id,founded_precision,founded_year,notes,status,canonical_status)
values ('house.vaering','House Vaering','skeldran','skeldra','approximate',225,'Skeldran royal house; earliest claimed descent is partly traditional.','active','canonical')
on conflict do nothing;

insert into public.historical_characters (id,lifecycle,name,sex,ancestry_id,homeland_region_id,culture_id,religion_id,birth_precision,birth_year,death_precision,death_year,social_status,house_id,canonical_status)
values
('character.eirik_iii_vaering','historical_only','Eirik III Vaering','male','skeldran','skeldra','skeldran','old_gods','year',533,'year',613,'royal','house.vaering','canonical'),
('character.eirik_iv_vaering','living_persistent','Eirik IV Vaering','male','skeldran','skeldra','skeldran','old_gods','year',565,'unknown',null,'king','house.vaering','canonical'),
('character.leif_vaering','living_persistent','Leif Vaering','male','skeldran','skeldra','skeldran','old_gods','year',592,'unknown',null,'crown_prince','house.vaering','canonical'),
('character.freya_vaering','living_persistent','Freya Vaering','female','skeldran','skeldra','skeldran','old_gods','year',596,'unknown',null,'princess','house.vaering','canonical'),
('character.torvald_vaering','living_persistent','Torvald Vaering','male','skeldran','skeldra','skeldran','old_gods','year',604,'unknown',null,'prince','house.vaering','canonical'),
('character.jessa_corven','historical_only','Jessa Corven','unknown','unknown','outer_isles','outer_isles','unknown','year',560,'year',607,'high_captain',null,'canonical'),
('character.bran_garric','historical_only','Bran Garric','unknown','unknown','outer_isles','outer_isles','unknown','unknown',null,'unknown',null,'high_captain',null,'canonical'),
('character.niko_serrat','historical_only','Niko Serrat','unknown','unknown','outer_isles','outer_isles','unknown','unknown',null,'unknown',null,'high_captain',null,'canonical'),
('character.mara_voss','living_persistent','Mara Voss','female','mixed','outer_isles','outer_isles','old_gods','year',584,'unknown',null,'high_captain',null,'canonical')
on conflict do nothing;

insert into public.historical_relationships (id,from_character_id,to_character_id,relationship_type,start_precision,start_year,end_precision,end_year,end_reason,canonical_status)
values
('relationship.eirik_iii.parent.eirik_iv','character.eirik_iii_vaering','character.eirik_iv_vaering','parent','year',565,'year',613,'death','canonical'),
('relationship.eirik_iv.child.leif','character.eirik_iv_vaering','character.leif_vaering','parent','year',592,'unknown',null,null,'canonical'),
('relationship.eirik_iv.child.freya','character.eirik_iv_vaering','character.freya_vaering','parent','year',596,'unknown',null,null,'canonical'),
('relationship.eirik_iv.child.torvald','character.eirik_iv_vaering','character.torvald_vaering','parent','year',604,'unknown',null,null,'canonical')
on conflict do nothing;

insert into public.offices (id,name,region_id,selection_mode,hereditary_by_default,notes,canonical_status)
values
('office.skeldra.king','King of Skeldra','skeldra','hereditary',true,'Royal office; future succession must not be reduced to one universal succession rule.','canonical'),
('office.blackhaven.high_captain','High Captain of Blackhaven','outer_isles','elected',false,'Political succession depends on recognized captains and support, not hereditary right.','canonical')
on conflict do nothing;

insert into public.office_terms (id,office_id,holder_character_id,start_precision,start_year,end_precision,end_year,end_reason,interim,canonical_status,origin)
values
('term.skeldra.eirik_iii','office.skeldra.king','character.eirik_iii_vaering','unknown',null,'year',613,'death',false,'canonical','authored'),
('term.skeldra.eirik_iv','office.skeldra.king','character.eirik_iv_vaering','year',613,'unknown',null,null,false,'canonical','authored'),
('term.blackhaven.jessa_corven','office.blackhaven.high_captain','character.jessa_corven','year',596,'year',607,'term_transition',false,'canonical','authored'),
('term.blackhaven.bran_garric','office.blackhaven.high_captain','character.bran_garric','year',607,'year',616,'term_transition',false,'canonical','authored'),
('term.blackhaven.niko_serrat','office.blackhaven.high_captain','character.niko_serrat','year',616,'year',623,'election',false,'canonical','authored'),
('term.blackhaven.mara_voss','office.blackhaven.high_captain','character.mara_voss','year',623,'unknown',null,null,false,'canonical','authored')
on conflict do nothing;

insert into public.historical_events (id,event_type,title,date_precision,date_year,location_id,description,canonical_status,origin,source_confidence,imported_from_seed)
values
('history.event.eirik_iii_death.613','death','Death of Eirik III','year',613,'region.skeldra','Eirik III Vaering died in 613 CR.','canonical','authored',100,'0.6A'),
('history.event.eirik_iv_accession.613','coronation','Eirik IV becomes King','year',613,'region.skeldra','Eirik IV peacefully succeeded Eirik III as King of Skeldra.','canonical','authored',100,'0.6A'),
('history.event.iron_fleet_program.614','other','Iron Fleet Program','year',614,'region.skeldra','Skeldra began heavily reinforced warships with increasing iron and mechanical systems.','canonical','authored',100,'0.6A'),
('history.event.vespera_riots.621','rebellion','Vespera Riots','year',621,'origin.vespera','A false atrocity rumor caused riots in Vespera in which 27 people died; the rumor was later shown to be false.','canonical','authored',100,'0.6A')
on conflict do nothing;

insert into public.historical_event_links (id,source_event_id,target_event_id,relation_type,notes,canonical_status)
values
('history.link.eirik_death_to_accession','history.event.eirik_iii_death.613','history.event.eirik_iv_accession.613','enabled','The king''s death opened the office for succession.','canonical'),
('history.link.accession_to_iron_fleet','history.event.eirik_iv_accession.613','history.event.iron_fleet_program.614','enabled','The new reign continued modernization into the Iron Fleet Program.','canonical')
on conflict do nothing;

insert into public.historical_ships (id,name,built_precision,loss_precision,fame_tags,canonical_status)
values ('history.ship.widows_mercy','Widow''s Mercy','unknown','unknown','["Blackhaven","Mara Voss"]'::jsonb,'canonical')
on conflict do nothing;
insert into public.historical_ship_ownership (id,ship_id,ownership_status,start_precision,end_precision,canonical_status)
values ('history.ship_ownership.widows_mercy.unknown','history.ship.widows_mercy','unknown','unknown','unknown','canonical_uncertain')
on conflict do nothing;
insert into public.historical_ship_commands (id,ship_id,captain_character_id,start_precision,end_precision,canonical_status)
values ('history.ship_command.widows_mercy.mara_voss','history.ship.widows_mercy','character.mara_voss','unknown','unknown','canonical')
on conflict do nothing;

-- The Vespera source rows are deliberately validation-level/provisional source metadata. The event truth is canonical;
-- 0.6B+ may replace source titles/authors when the actual historiography is authored.
insert into public.historical_sources (id,title,written_precision,written_year,source_type,reliability,bias_tags,summary,canonical_status)
values
('history.source.vespera_riot_contemporary_claim','Contemporary Vespera atrocity account','year',621,'pamphlet',20,'["atrocity_rumor"]'::jsonb,'A contemporary account repeating the atrocity claim that helped inflame the riots.','provisional'),
('history.source.vespera_riot_later_inquiry','Later inquiry into the Vespera riots','approximate',621,'official_record',85,'["official_inquiry"]'::jsonb,'A later finding concluding that the atrocity claim was false.','provisional')
on conflict do nothing;
insert into public.historical_interpretations (id,source_id,event_id,interpretation,confidence,canonical_status)
values
('history.interpretation.vespera_claim_true','history.source.vespera_riot_contemporary_claim','history.event.vespera_riots.621','The reported atrocity occurred and justified retaliation.',30,'disputed'),
('history.interpretation.vespera_claim_false','history.source.vespera_riot_later_inquiry','history.event.vespera_riots.621','The atrocity report was false; the rumor itself helped cause the violence.',90,'canonical')
on conflict do nothing;
insert into public.historical_interpretation_disagreements (interpretation_id,disagrees_with_interpretation_id)
values
('history.interpretation.vespera_claim_true','history.interpretation.vespera_claim_false'),
('history.interpretation.vespera_claim_false','history.interpretation.vespera_claim_true')
on conflict do nothing;


set constraints all immediate;
commit;
notify pgrst, 'reload schema';
