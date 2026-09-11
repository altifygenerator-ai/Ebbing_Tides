import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { HISTORICAL_DYNASTIES_06B_SEED } from '../public/alpha/js/data/history/dynasties.js';

const q = (v) => v === undefined || v === null ? 'null' : `'${String(v).replaceAll("'", "''")}'`;
const b = (v) => v ? 'true' : 'false';
const n = (v) => v === undefined || v === null ? 'null' : String(v);
const json = (v) => `${q(JSON.stringify(v))}::jsonb`;
const date = (prefix, d) => [q(d.precision), n(d.year), n(d.month), n(d.day), n(d.hour), n(d.endYear)].map((x, i) => `${prefix}_${['precision','year','month','day','hour','end_year'][i]}=${x}`);
const dateVals = (d) => [q(d.precision), n(d.year), n(d.month), n(d.day), n(d.hour), n(d.endYear)].join(',');

const lines = [];
lines.push(`-- Ebbing Tides Alpha 0.6B — Dynasties, Genealogy, Offices, Reigns & Claims\n-- Global political/history population only. This does not make non-Skeldran regions traversable.\nbegin;\nset constraints all deferred;\n`);

function valuesBlock(rows, mapper) { return rows.map((r) => `  (${mapper(r)})`).join(',\n'); }

if (HISTORICAL_DYNASTIES_06B_SEED.houses.length) {
  lines.push(`insert into public.houses (world_scope_id,id,name,culture_id,region_id,founded_precision,founded_year,founded_month,founded_day,founded_hour,founded_end_year,ended_precision,ended_year,ended_month,ended_day,ended_hour,ended_end_year,founder_character_id,parent_house_id,cadet_branch_of_house_id,notes,status,canonical_status,origin)\nvalues\n${valuesBlock(HISTORICAL_DYNASTIES_06B_SEED.houses, r => [q('canon'),q(r.id),q(r.name),q(r.culture),q(r.region),dateVals(r.foundedDate),dateVals(r.endedDate),q(r.founderCharacterId),q(r.parentHouseId),q(r.cadetBranchOfHouseId),q(r.notes),q(r.status),q(r.canonicalStatus),q(r.origin)].join(','))}\non conflict (world_scope_id,id) do update set\n  name=excluded.name, culture_id=excluded.culture_id, region_id=excluded.region_id,\n  founded_precision=excluded.founded_precision, founded_year=excluded.founded_year, founded_month=excluded.founded_month, founded_day=excluded.founded_day, founded_hour=excluded.founded_hour, founded_end_year=excluded.founded_end_year,\n  ended_precision=excluded.ended_precision, ended_year=excluded.ended_year, ended_month=excluded.ended_month, ended_day=excluded.ended_day, ended_hour=excluded.ended_hour, ended_end_year=excluded.ended_end_year,\n  founder_character_id=excluded.founder_character_id, parent_house_id=excluded.parent_house_id, cadet_branch_of_house_id=excluded.cadet_branch_of_house_id, notes=excluded.notes, status=excluded.status, canonical_status=excluded.canonical_status, origin=excluded.origin;\n`);
}

if (HISTORICAL_DYNASTIES_06B_SEED.characters.length) {
  lines.push(`insert into public.historical_characters (world_scope_id,id,runtime_character_id,lifecycle,name,sex,ancestry_id,homeland_region_id,culture_id,religion_id,birth_precision,birth_year,birth_month,birth_day,birth_hour,birth_end_year,death_precision,death_year,death_month,death_day,death_hour,death_end_year,social_status,house_id,notes,canonical_status,origin)\nvalues\n${valuesBlock(HISTORICAL_DYNASTIES_06B_SEED.characters, r => [q('canon'),q(r.id),q(r.runtimeCharacterId),q(r.lifecycle),q(r.name),q(r.sex),q(r.ancestry),q(r.homelandRegion),q(r.culture),q(r.religion),dateVals(r.birthDate),dateVals(r.deathDate),q(r.socialStatus),q(r.houseId),q(r.notes),q(r.canonicalStatus),q(r.origin)].join(','))}\non conflict (world_scope_id,id) do update set\n  runtime_character_id=excluded.runtime_character_id, lifecycle=excluded.lifecycle, name=excluded.name, sex=excluded.sex, ancestry_id=excluded.ancestry_id, homeland_region_id=excluded.homeland_region_id, culture_id=excluded.culture_id, religion_id=excluded.religion_id,\n  birth_precision=excluded.birth_precision, birth_year=excluded.birth_year, birth_month=excluded.birth_month, birth_day=excluded.birth_day, birth_hour=excluded.birth_hour, birth_end_year=excluded.birth_end_year,\n  death_precision=excluded.death_precision, death_year=excluded.death_year, death_month=excluded.death_month, death_day=excluded.death_day, death_hour=excluded.death_hour, death_end_year=excluded.death_end_year,\n  social_status=excluded.social_status, house_id=excluded.house_id, notes=excluded.notes, canonical_status=excluded.canonical_status, origin=excluded.origin;\n`);
}

if (HISTORICAL_DYNASTIES_06B_SEED.relationships.length) {
  lines.push(`insert into public.historical_relationships (world_scope_id,id,from_character_id,to_character_id,relationship_type,start_precision,start_year,start_month,start_day,start_hour,start_end_year,end_precision,end_year,end_month,end_day,end_hour,end_end_year,end_reason,canonical_status,origin)\nvalues\n${valuesBlock(HISTORICAL_DYNASTIES_06B_SEED.relationships, r => [q('canon'),q(r.id),q(r.fromCharacterId),q(r.toCharacterId),q(r.relationshipType),dateVals(r.startDate),dateVals(r.endDate),q(r.endReason),q(r.canonicalStatus),q(r.origin)].join(','))}\non conflict (world_scope_id,id) do nothing;\n`);
}

if (HISTORICAL_DYNASTIES_06B_SEED.offices.length) {
  lines.push(`insert into public.offices (world_scope_id,id,name,institution_id,region_id,selection_mode,hereditary_by_default,notes,canonical_status,origin)\nvalues\n${valuesBlock(HISTORICAL_DYNASTIES_06B_SEED.offices, r => [q('canon'),q(r.id),q(r.name),q(r.institutionId),q(r.region),q(r.selectionMode),b(r.hereditaryByDefault),q(r.notes),q(r.canonicalStatus),q(r.origin)].join(','))}\non conflict (world_scope_id,id) do update set name=excluded.name,institution_id=excluded.institution_id,region_id=excluded.region_id,selection_mode=excluded.selection_mode,hereditary_by_default=excluded.hereditary_by_default,notes=excluded.notes,canonical_status=excluded.canonical_status,origin=excluded.origin;\n`);
}

if (HISTORICAL_DYNASTIES_06B_SEED.officeTerms.length) {
  lines.push(`insert into public.office_terms (world_scope_id,id,office_id,holder_character_id,start_precision,start_year,start_month,start_day,start_hour,start_end_year,end_precision,end_year,end_month,end_day,end_hour,end_end_year,end_reason,interim,canonical_status,origin)\nvalues\n${valuesBlock(HISTORICAL_DYNASTIES_06B_SEED.officeTerms, r => [q('canon'),q(r.id),q(r.officeId),q(r.holderCharacterId),dateVals(r.startDate),dateVals(r.endDate),q(r.endReason),b(r.interim),q(r.canonicalStatus),q(r.origin)].join(','))}\non conflict (world_scope_id,id) do nothing;\n`);
}

if (HISTORICAL_DYNASTIES_06B_SEED.claims.length) {
  lines.push(`insert into public.historical_claims (world_scope_id,id,claimant_character_id,target_office_id,basis,strength,priority,legal_basis,genealogical_path,disputed,active,start_precision,start_year,start_month,start_day,start_hour,start_end_year,end_precision,end_year,end_month,end_day,end_hour,end_end_year,canonical_status,origin)\nvalues\n${valuesBlock(HISTORICAL_DYNASTIES_06B_SEED.claims, r => [q('canon'),q(r.id),q(r.claimantCharacterId),q(r.targetOfficeId),q(r.basis),n(r.strength),n(r.priority),q(r.legalBasis),json(r.genealogicalPath ?? []),b(r.disputed),b(r.active),dateVals(r.startDate),dateVals(r.endDate),q(r.canonicalStatus),q(r.origin)].join(','))}\non conflict (world_scope_id,id) do nothing;\n`);
}

if (HISTORICAL_DYNASTIES_06B_SEED.events.length) {
  lines.push(`insert into public.historical_events (world_scope_id,id,event_type,title,date_precision,date_year,date_month,date_day,date_hour,date_end_year,location_id,description,canonical_status,origin,source_confidence,created_by_system,imported_from_seed,simulation_event_id)\nvalues\n${valuesBlock(HISTORICAL_DYNASTIES_06B_SEED.events, r => [q('canon'),q(r.id),q(r.eventType),q(r.title),dateVals(r.date),q(r.locationId),q(r.description),q(r.canonicalStatus),q(r.origin),n(r.sourceConfidence),q(r.createdBySystem),q(r.importedFromSeed),q(r.simulationEventId)].join(','))}\non conflict (world_scope_id,id) do nothing;\n`);
  const participants=[]; const factions=[];
  for (const e of HISTORICAL_DYNASTIES_06B_SEED.events) {
    for (const id of e.participantCharacterIds) participants.push([e.id,id]);
    for (const id of e.factionIds) factions.push([e.id,id]);
  }
  if(participants.length) lines.push(`insert into public.historical_event_participants (world_scope_id,event_id,character_id)\nvalues\n${participants.map(([e,c])=>`  (${q('canon')},${q(e)},${q(c)})`).join(',\n')}\non conflict do nothing;\n`);
  if(factions.length) lines.push(`insert into public.historical_event_factions (world_scope_id,event_id,faction_id)\nvalues\n${factions.map(([e,f])=>`  (${q('canon')},${q(e)},${q(f)})`).join(',\n')}\non conflict do nothing;\n`);
}

if (HISTORICAL_DYNASTIES_06B_SEED.eventLinks.length) {
  lines.push(`insert into public.historical_event_links (world_scope_id,id,source_event_id,target_event_id,relation_type,notes,canonical_status,origin)\nvalues\n${valuesBlock(HISTORICAL_DYNASTIES_06B_SEED.eventLinks, r => [q('canon'),q(r.id),q(r.sourceEventId),q(r.targetEventId),q(r.relationType),q(r.notes),q(r.canonicalStatus),q(r.origin)].join(','))}\non conflict (world_scope_id,id) do nothing;\n`);
}

lines.push(`set constraints all immediate;\ncommit;\n\n-- No save-schema bump in 0.6B: this pass expands canonical persistent world-history data only.\n`);

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'supabase', 'migrations', '0009_alpha_06b_dynasties_genealogy_offices_claims.sql');
writeFileSync(out, lines.join('\n'));
console.log(`Wrote ${out}`);
