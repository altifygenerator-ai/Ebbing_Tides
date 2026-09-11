-- Ebbing Tides Alpha 0.5 Update B — progression/usability persistence boundary.
-- Overall experience level is a non-scaling milestone chosen explicitly during development;
-- competence still comes from meaningful use, training, study, discovery, relationships and history.

alter table public.character_capabilities
  add column if not exists advancement jsonb not null default '{}'::jsonb;

create index if not exists character_capabilities_save_character_idx
  on public.character_capabilities(save_id, character_id);

-- Conversation prose is not made canonical by this migration. Durable Character Mind effects
-- continue to live in validated memories/relationships/world events in the canonical save state.
