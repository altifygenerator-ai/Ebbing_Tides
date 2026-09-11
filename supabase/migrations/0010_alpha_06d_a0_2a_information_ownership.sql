-- Ebbing Tides Alpha 0.6D A0.2A — Information Durability & Ownership
-- Canonical campaign intelligence belongs to player_knowledge / snapshot.player.knowledge.
-- character_capabilities.knowledge_entries remains only as a legacy compatibility column until a
-- future destructive schema cleanup; runtime A0.2A imports it once and clears it.

alter table public.player_knowledge
  add column if not exists claim_key text null,
  add column if not exists observed_at_hour integer null,
  add column if not exists refreshed_at_hour integer null,
  add column if not exists stale_after_hours integer null,
  add column if not exists information_state text not null default 'current',
  add column if not exists source_event_id text null,
  add column if not exists origin_location_id text null;

update public.player_knowledge
set claim_key = id
where claim_key is null;

update public.player_knowledge
set refreshed_at_hour = learned_at_hour
where refreshed_at_hour is null;

create unique index if not exists player_knowledge_claim_key_idx
  on public.player_knowledge(save_id, player_character_id, claim_key)
  where claim_key is not null and information_state <> 'superseded';

create index if not exists player_knowledge_subject_idx
  on public.player_knowledge(save_id, player_character_id, subject_id, refreshed_at_hour desc);

comment on column public.character_capabilities.knowledge_entries is
  'Legacy compatibility only after A0.2A. Mutable player campaign intelligence is authoritative in player_knowledge / snapshot.player.knowledge; NPC knowledge expansion remains separate future work.';
