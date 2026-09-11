import type {
  ClaimRecord, HistoricalDatabaseSeed, HistoricalDate, HistoricalEventRecord, HistoricalRelationshipRecord,
  HistoricalShipRecord, InstitutionRecord, OfficeTermRecord
} from "../../types/history.js";
import { historicalDateSortKey, validateHistoricalDate } from "../time/calendar.js";

export type HistoricalValidationSeverity = "error" | "warning";
export interface HistoricalValidationIssue {
  code: string;
  severity: HistoricalValidationSeverity;
  recordId: string;
  message: string;
}

function issue(code: string, recordId: string, message: string, severity: HistoricalValidationSeverity = "error"): HistoricalValidationIssue {
  return { code, recordId, message, severity };
}
function before(a: HistoricalDate, b: HistoricalDate): boolean | undefined {
  const ak = historicalDateSortKey(a), bk = historicalDateSortKey(b);
  if (ak === undefined || bk === undefined) return undefined;
  return ak < bk;
}
function after(a: HistoricalDate, b: HistoricalDate): boolean | undefined {
  const ak = historicalDateSortKey(a), bk = historicalDateSortKey(b);
  if (ak === undefined || bk === undefined) return undefined;
  return ak > bk;
}

function validateDates(seed: HistoricalDatabaseSeed, out: HistoricalValidationIssue[]): void {
  const rows: Array<[string, HistoricalDate]> = [];
  for (const c of seed.characters) rows.push([`${c.id}.birth`, c.birthDate], [`${c.id}.death`, c.deathDate]);
  for (const r of seed.relationships) rows.push([`${r.id}.start`, r.startDate], [`${r.id}.end`, r.endDate]);
  for (const h of seed.houses) rows.push([`${h.id}.founded`, h.foundedDate], [`${h.id}.ended`, h.endedDate]);
  for (const t of seed.officeTerms) rows.push([`${t.id}.start`, t.startDate], [`${t.id}.end`, t.endDate]);
  for (const c of seed.claims) rows.push([`${c.id}.start`, c.startDate], [`${c.id}.end`, c.endDate]);
  for (const e of seed.events) rows.push([`${e.id}.date`, e.date]);
  for (const i of seed.institutions) rows.push([`${i.id}.founded`, i.foundedDate], [`${i.id}.ended`, i.endedDate]);
  for (const w of seed.wars) rows.push([`${w.id}.start`, w.startDate], [`${w.id}.end`, w.endDate]);
  for (const b of seed.battles) rows.push([`${b.id}.date`, b.date]);
  for (const t of seed.treaties) rows.push([`${t.id}.date`, t.date]);
  for (const s of seed.ships) rows.push([`${s.id}.built`, s.builtDate], [`${s.id}.loss`, s.lossDate]);
  for (const o of seed.shipOwnership) rows.push([`${o.id}.start`, o.startDate], [`${o.id}.end`, o.endDate]);
  for (const c of seed.shipCommands) rows.push([`${c.id}.start`, c.startDate], [`${c.id}.end`, c.endDate]);
  for (const r of seed.shipRefits) rows.push([`${r.id}.date`, r.date]);
  for (const r of seed.shipRenames) rows.push([`${r.id}.date`, r.date]);
  for (const s of seed.sources) rows.push([`${s.id}.written`, s.dateWritten]);
  for (const [id, date] of rows) for (const message of validateHistoricalDate(date)) out.push(issue("invalid_historical_date", id, message));
}

function validateCharacters(seed: HistoricalDatabaseSeed, out: HistoricalValidationIssue[]): void {
  const byId = new Map(seed.characters.map((row) => [row.id, row]));
  for (const character of seed.characters) {
    if (after(character.birthDate, character.deathDate) === true) out.push(issue("death_before_birth", character.id, `${character.name} dies before being born.`));
  }
  for (const rel of seed.relationships) {
    const from = byId.get(rel.fromCharacterId), to = byId.get(rel.toCharacterId);
    if (!from || !to) { out.push(issue("relationship_missing_character", rel.id, "Relationship references a missing character.")); continue; }
    if (rel.relationshipType === "parent" || rel.relationshipType === "adoptive_parent") {
      const fromBirth = historicalDateSortKey(from.birthDate), toBirth = historicalDateSortKey(to.birthDate);
      if (fromBirth !== undefined && toBirth !== undefined && fromBirth >= toBirth) out.push(issue("parent_not_older_than_child", rel.id, `${from.name} is not older than ${to.name}.`));
    }
    if (rel.relationshipType === "spouse" || rel.relationshipType === "betrothed") {
      if (from.deathDate.precision !== "unknown" && after(rel.startDate, from.deathDate) === true) out.push(issue("relationship_after_death", rel.id, `Relationship starts after ${from.name}'s death.`));
      if (to.deathDate.precision !== "unknown" && after(rel.startDate, to.deathDate) === true) out.push(issue("relationship_after_death", rel.id, `Relationship starts after ${to.name}'s death.`));
    }
  }
}


function validateHousesAndGenealogy(seed: HistoricalDatabaseSeed, out: HistoricalValidationIssue[]): void {
  const characterById = new Map(seed.characters.map((row) => [row.id, row]));
  const houseById = new Map(seed.houses.map((row) => [row.id, row]));

  for (const character of seed.characters) {
    if (character.houseId && !houseById.has(character.houseId)) out.push(issue("character_missing_house", character.id, `${character.name} references missing house ${character.houseId}.`));
  }
  for (const house of seed.houses) {
    if (house.founderCharacterId && !characterById.has(house.founderCharacterId)) out.push(issue("house_missing_founder", house.id, `House founder ${house.founderCharacterId} does not exist.`));
    if (house.parentHouseId && !houseById.has(house.parentHouseId)) out.push(issue("house_missing_parent", house.id, `Parent house ${house.parentHouseId} does not exist.`));
    if (house.cadetBranchOfHouseId && !houseById.has(house.cadetBranchOfHouseId)) out.push(issue("house_missing_cadet_parent", house.id, `Cadet parent house ${house.cadetBranchOfHouseId} does not exist.`));
  }

  const parentMap = new Map<string, Set<string>>();
  for (const rel of seed.relationships) {
    if (rel.relationshipType !== "parent" && rel.relationshipType !== "adoptive_parent") continue;
    const set = parentMap.get(rel.toCharacterId) ?? new Set<string>();
    set.add(rel.fromCharacterId);
    parentMap.set(rel.toCharacterId, set);

    const parent = characterById.get(rel.fromCharacterId), child = characterById.get(rel.toCharacterId);
    if (parent?.birthDate.year !== undefined && child?.birthDate.year !== undefined && parent.birthDate.year + 12 > child.birthDate.year) {
      out.push(issue("parent_implausibly_young", rel.id, `${parent.name} is less than 12 years older than ${child.name}.`));
    }
  }

  const visiting = new Set<string>(), visited = new Set<string>();
  const visit = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const parentId of parentMap.get(id) ?? []) if (visit(parentId)) return true;
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  for (const id of characterById.keys()) if (visit(id)) { out.push(issue("genealogy_cycle", id, "Parent/child genealogy contains a cycle.")); break; }
}

function validateOfficeTerms(seed: HistoricalDatabaseSeed, out: HistoricalValidationIssue[]): void {
  const characterById = new Map(seed.characters.map((row) => [row.id, row]));
  const officeIds = new Set(seed.offices.map((row) => row.id));
  for (const term of seed.officeTerms) {
    if (!officeIds.has(term.officeId)) out.push(issue("office_term_missing_office", term.id, "Office term references a missing office."));
    const holder = characterById.get(term.holderCharacterId);
    if (!holder) { out.push(issue("office_term_missing_holder", term.id, "Office term references a missing holder.")); continue; }
    if (before(term.startDate, holder.birthDate) === true) out.push(issue("office_term_before_birth", term.id, `${holder.name}'s office term begins before birth.`));
    if (holder.deathDate.precision !== "unknown" && after(term.startDate, holder.deathDate) === true) out.push(issue("office_term_after_death", term.id, `${holder.name}'s office term begins after death.`));
    if (after(term.startDate, term.endDate) === true) out.push(issue("office_term_reverse", term.id, "Office term ends before it starts."));
  }
  const openByOffice = new Map<string, OfficeTermRecord[]>();
  for (const term of seed.officeTerms) if (term.endDate.precision === "unknown") {
    const rows = openByOffice.get(term.officeId) ?? []; rows.push(term); openByOffice.set(term.officeId, rows);
  }
  for (const [officeId, rows] of openByOffice) if (rows.length > 1) out.push(issue("office_multiple_open_terms", officeId, `Office has ${rows.length} open-ended current terms.`));
}

function validateEvents(seed: HistoricalDatabaseSeed, out: HistoricalValidationIssue[]): void {
  const eventById = new Map(seed.events.map((row) => [row.id, row]));
  const characterById = new Map(seed.characters.map((row) => [row.id, row]));
  for (const event of seed.events) {
    for (const participantId of event.participantCharacterIds) {
      const participant = characterById.get(participantId);
      if (!participant) { out.push(issue("event_missing_participant", event.id, `Event references missing participant ${participantId}.`)); continue; }
      if (participant.deathDate.precision !== "unknown" && after(event.date, participant.deathDate) === true) out.push(issue("event_after_participant_death", event.id, `${participant.name} acts after death.`));
      if (before(event.date, participant.birthDate) === true) out.push(issue("event_before_participant_birth", event.id, `${participant.name} appears before birth.`));
    }
  }
  for (const link of seed.eventLinks) {
    const source = eventById.get(link.sourceEventId), target = eventById.get(link.targetEventId);
    if (!source || !target) { out.push(issue("event_link_missing_event", link.id, "Causal event link references a missing event.")); continue; }
    if (after(source.date, target.date) === true) out.push(issue("event_effect_before_cause", link.id, "Target event occurs before its source/cause event."));
  }
}

function validateClaims(seed: HistoricalDatabaseSeed, out: HistoricalValidationIssue[]): void {
  const chars = new Set(seed.characters.map((row) => row.id));
  const offices = new Set(seed.offices.map((row) => row.id));
  const officeById = new Map(seed.offices.map((row) => [row.id, row]));
  const relationshipPairs = new Set(seed.relationships.map((row) => `${row.fromCharacterId}>${row.toCharacterId}`));
  for (const claim of seed.claims) {
    if (!chars.has(claim.claimantCharacterId)) out.push(issue("claim_missing_claimant", claim.id, "Claim references a missing claimant."));
    if (!offices.has(claim.targetOfficeId)) out.push(issue("claim_missing_office", claim.id, "Claim references a missing office."));
    const targetOffice = officeById.get(claim.targetOfficeId);
    if (targetOffice && !targetOffice.hereditaryByDefault && ["direct_descent", "collateral_descent", "marriage", "adoption"].includes(claim.basis) && !claim.disputed) {
      out.push(issue("nonhereditary_office_hereditary_claim", claim.id, `${targetOffice.name} is non-hereditary but claim uses ${claim.basis} as an undisputed basis.`, "warning"));
    }
    if (claim.genealogicalPath?.length && claim.genealogicalPath[0] !== claim.claimantCharacterId) out.push(issue("claim_genealogy_wrong_start", claim.id, "Genealogical path must begin with the claimant."));
    if (claim.genealogicalPath) {
      for (const id of claim.genealogicalPath) if (!chars.has(id)) out.push(issue("claim_missing_genealogy_character", claim.id, `Claim genealogy references missing ${id}.`));
      if (["direct_descent", "collateral_descent", "marriage", "adoption"].includes(claim.basis)) {
        for (let i = 0; i < claim.genealogicalPath.length - 1; i += 1) {
          const a = claim.genealogicalPath[i]!, b = claim.genealogicalPath[i + 1]!;
          if (!relationshipPairs.has(`${a}>${b}`) && !relationshipPairs.has(`${b}>${a}`)) out.push(issue("claim_genealogy_missing_relationship", claim.id, `No recorded relationship supports ${a} ↔ ${b}.`, "warning"));
        }
      }
    }
  }
}

function validateInstitutions(seed: HistoricalDatabaseSeed, out: HistoricalValidationIssue[]): void {
  const institutionById = new Map(seed.institutions.map((row) => [row.id, row]));
  for (const institution of seed.institutions) {
    if (institution.parentInstitutionId && !institutionById.has(institution.parentInstitutionId)) out.push(issue("institution_missing_parent", institution.id, "Institution references a missing parent institution."));
    if (after(institution.foundedDate, institution.endedDate) === true) out.push(issue("institution_ended_before_founding", institution.id, "Institution ended before it was founded."));
  }
  for (const event of seed.events) {
    for (const factionId of event.factionIds) {
      const institution = institutionById.get(factionId);
      if (institution && before(event.date, institution.foundedDate) === true) out.push(issue("institution_event_before_founding", event.id, `Event involving ${institution.name} predates its founding.`));
    }
  }
}

function validateWarBattleTreaty(seed: HistoricalDatabaseSeed, out: HistoricalValidationIssue[]): void {
  const warById = new Map(seed.wars.map((row) => [row.id, row]));
  for (const war of seed.wars) if (after(war.startDate, war.endDate) === true) out.push(issue("war_reverse_dates", war.id, "War ends before it starts."));
  for (const battle of seed.battles) {
    if (!battle.warId) continue;
    const war = warById.get(battle.warId);
    if (!war) { out.push(issue("battle_missing_war", battle.id, "Battle references a missing war.")); continue; }
    if (before(battle.date, war.startDate) === true) out.push(issue("battle_before_war", battle.id, "Battle occurs before the war starts."));
    if (war.endDate.precision !== "unknown" && after(battle.date, war.endDate) === true) out.push(issue("battle_after_war", battle.id, "Battle occurs after the war ends."));
  }
  for (const treaty of seed.treaties) for (const warId of treaty.modifiedWarIds) if (!warById.has(warId)) out.push(issue("treaty_missing_war", treaty.id, `Treaty references missing war ${warId}.`));
}

function validateShips(seed: HistoricalDatabaseSeed, out: HistoricalValidationIssue[]): void {
  const shipById = new Map(seed.ships.map((row) => [row.id, row]));
  for (const ship of seed.ships) if (after(ship.builtDate, ship.lossDate) === true) out.push(issue("ship_loss_before_construction", ship.id, "Ship loss predates construction."));
  const validateShipDate = (recordId: string, shipId: string, date: HistoricalDate, label: string) => {
    const ship = shipById.get(shipId);
    if (!ship) { out.push(issue("ship_history_missing_ship", recordId, `${label} references a missing ship.`)); return; }
    if (ship.builtDate.precision !== "unknown" && before(date, ship.builtDate) === true) out.push(issue("ship_history_before_construction", recordId, `${label} predates ship construction.`));
    if (ship.lossDate.precision !== "unknown" && after(date, ship.lossDate) === true) out.push(issue("ship_history_after_loss", recordId, `${label} occurs after ship loss.`));
  };
  for (const row of seed.shipOwnership) validateShipDate(row.id, row.shipId, row.startDate, "Ownership record");
  for (const row of seed.shipCommands) validateShipDate(row.id, row.shipId, row.startDate, "Captaincy record");
  for (const row of seed.shipRefits) validateShipDate(row.id, row.shipId, row.date, "Refit");
  for (const row of seed.shipRenames) validateShipDate(row.id, row.shipId, row.date, "Rename");
  for (const battle of seed.battles) for (const shipId of battle.linkedShipIds) validateShipDate(battle.id, shipId, battle.date, "Battle participation");
}

function validateSources(seed: HistoricalDatabaseSeed, out: HistoricalValidationIssue[]): void {
  const sources = new Set(seed.sources.map((row) => row.id));
  const events = new Set(seed.events.map((row) => row.id));
  const interpretations = new Set(seed.interpretations.map((row) => row.id));
  for (const row of seed.interpretations) {
    if (!sources.has(row.sourceId)) out.push(issue("interpretation_missing_source", row.id, "Interpretation references a missing source."));
    if (!events.has(row.eventId)) out.push(issue("interpretation_missing_event", row.id, "Interpretation references a missing event."));
    for (const disagreement of row.disagreementWithInterpretationIds) if (!interpretations.has(disagreement)) out.push(issue("interpretation_missing_disagreement", row.id, `Interpretation disagreement references missing ${disagreement}.`));
  }
}

export function validateHistoricalDatabase(seed: HistoricalDatabaseSeed): HistoricalValidationIssue[] {
  const out: HistoricalValidationIssue[] = [];
  validateDates(seed, out);
  validateCharacters(seed, out);
  validateHousesAndGenealogy(seed, out);
  validateOfficeTerms(seed, out);
  validateEvents(seed, out);
  validateClaims(seed, out);
  validateInstitutions(seed, out);
  validateWarBattleTreaty(seed, out);
  validateShips(seed, out);
  validateSources(seed, out);
  return out;
}

export function historicalValidationErrors(seed: HistoricalDatabaseSeed): HistoricalValidationIssue[] {
  return validateHistoricalDatabase(seed).filter((row) => row.severity === "error");
}
