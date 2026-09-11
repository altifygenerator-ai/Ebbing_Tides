-- Ebbing Tides Alpha 0.6D A0.2C — Prepared Effects & Arcane Strain
-- Active preparations are character capability state, not inferred from historical WorldEvent rows.
-- The canonical versioned GameState snapshot remains authoritative in this alpha; this additive
-- column keeps the normalized character-capability boundary aligned for later server-side simulation.

alter table public.character_capabilities
  add column if not exists prepared_effects jsonb not null default '[]'::jsonb;

comment on column public.character_capabilities.prepared_effects is
  'Active one-shot/timed ability preparations scoped to this save/character. Historical ability-use events are not active buffs.';

comment on column public.character_capabilities.attunement is
  'Authoritative Arcane/Industrial specialization state, including Arcane Strain after A0.2C. condition.arcaneStrain in the snapshot is a compatibility/display mirror.';
