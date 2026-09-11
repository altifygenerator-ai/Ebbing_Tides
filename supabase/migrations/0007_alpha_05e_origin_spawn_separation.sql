-- Ebbing Tides Alpha 0.5 Update E — origin / campaign-start separation.
-- The versioned JSON snapshot remains canonical. These normalized identity fields prevent a
-- character's homeland/home settlement from being conflated with their current or starting port.

alter table public.characters
  add column if not exists ancestry_id text null,
  add column if not exists homeland_region_id text null,
  add column if not exists home_settlement_id text null,
  add column if not exists starting_location_id text null;

create index if not exists characters_save_origin_idx
  on public.characters(save_id, homeland_region_id, home_settlement_id);

-- Existing v6 JSON snapshots are migrated application-side on load:
-- old character.homePortId -> character.homeSettlementId + character.startingLocationId.
-- The live current location remains location_port_id / player.currentPortId and is not rewritten as origin.
