import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { HISTORICAL_DYNASTIES_06B_SEED } from '../public/alpha/js/data/history/dynasties.js';
import { HISTORICAL_WORLD_SEED } from '../public/alpha/js/data/history/worldSeed.js';
import { buildGenealogyIndex, ancestorsOf, childrenOf, siblingsOf, spousesOf, genealogicalPathBetween, isAncestorOf } from '../public/alpha/js/game/history/genealogy.js';
import { activeClaimsForOffice, officeSnapshotAt } from '../public/alpha/js/game/history/politics.js';
import { historicalValidationErrors, validateHistoricalDatabase } from '../public/alpha/js/game/history/validation.js';
import { InMemoryHistoryRepository } from '../public/alpha/js/data/repositories/history/inMemoryHistoryRepository.js';
import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';

const here=dirname(fileURLToPath(import.meta.url));
const root=join(here,'..');
const AT_628={precision:'year',year:628};
const ids=(rows)=>rows.map(row=>row.id);

test('0.6B global political seed contains all six canonical ruling houses but no invented Blackhaven dynasty',()=>{
  const houses=new Map(HISTORICAL_WORLD_SEED.houses.map(row=>[row.id,row]));
  for(const id of ['house.vaering','house.marcellan','house.valerian','house.asharan','house.tenrai','house.darcon']) assert.ok(houses.has(id),`missing ${id}`);
  assert.equal(houses.size,6);
  assert.equal(houses.has('house.blackhaven'),false);
  assert.equal(HISTORICAL_WORLD_SEED.characters.find(row=>row.id==='character.isabella_corven').houseId,undefined);
  assert.equal(HISTORICAL_WORLD_SEED.characters.find(row=>row.id==='character.mara_voss').houseId,undefined);
});

test('Vaering genealogy includes current royal children, spouse, and the Hakon collateral branch',()=>{
  const g=buildGenealogyIndex(HISTORICAL_WORLD_SEED);
  assert.deepEqual(new Set(ids(childrenOf('character.eirik_iv_vaering',g))),new Set(['character.leif_vaering','character.freya_vaering','character.torvald_vaering']));
  assert.ok(ids(spousesOf('character.eirik_iv_vaering',g)).includes('character.queen_astrid'));
  assert.ok(ids(siblingsOf('character.eirik_iv_vaering',g)).includes('character.hakon_vaering'));
  assert.ok(isAncestorOf('character.eirik_iii_vaering','character.sten_vaering',g));
  assert.deepEqual(genealogicalPathBetween('character.sten_vaering','character.eirik_iv_vaering',g),['character.sten_vaering','character.hakon_vaering','character.eirik_iii_vaering','character.eirik_iv_vaering']);
});

test('Marcellan family is politically powerful but children do not inherit the First Archon office',()=>{
  const office=HISTORICAL_WORLD_SEED.offices.find(row=>row.id==='office.asterra.first_archon');
  assert.equal(office.selectionMode,'elected');
  assert.equal(office.hereditaryByDefault,false);
  const snapshot=officeSnapshotAt(HISTORICAL_WORLD_SEED,office.id,AT_628);
  assert.equal(snapshot.currentHolder.name,'Cassian Marcellan');
  const claimants=activeClaimsForOffice(HISTORICAL_WORLD_SEED,office.id).map(row=>row.claimantCharacterId);
  assert.deepEqual(claimants,['character.cassian_marcellan']);
  assert.equal(claimants.includes('character.helena_marcellan'),false);
  assert.equal(claimants.includes('character.marcus_marcellan'),false);
  const g=buildGenealogyIndex(HISTORICAL_WORLD_SEED);
  assert.ok(ids(siblingsOf('character.thalia_varen',g)).includes('character.nikos_varen'));
});

test('Valerian firstborn death shifts explicit Day-1 heir claim to Julian without erasing other dynastic descent',()=>{
  const cassian=HISTORICAL_WORLD_SEED.characters.find(row=>row.id==='character.cassian_valerian');
  assert.deepEqual(cassian.deathDate,{precision:'year',year:612});
  const claims=activeClaimsForOffice(HISTORICAL_WORLD_SEED,'office.aurelia.imperator');
  assert.equal(claims[0].claimantCharacterId,'character.julian_valerian');
  assert.equal(claims[0].priority,1);
  assert.ok(claims.some(row=>row.claimantCharacterId==='character.livia_valerian'));
  const event=HISTORICAL_WORLD_SEED.events.find(row=>row.id==='history.event.julian_becomes_heir.612');
  assert.ok(event);
  assert.ok(HISTORICAL_WORLD_SEED.eventLinks.some(row=>row.sourceEventId==='history.event.cassian_valerian_death.612'&&row.targetEventId===event.id));
});

test('Asharan lineage stores the conversion/kingship foundation and current Crown Prince claim',()=>{
  const house=HISTORICAL_WORLD_SEED.houses.find(row=>row.id==='house.asharan');
  assert.equal(house.founderCharacterId,'character.ashar_i_asharan');
  assert.deepEqual(house.foundedDate,{precision:'year',year:508});
  const g=buildGenealogyIndex(HISTORICAL_WORLD_SEED);
  const ancestors=ids(ancestorsOf('character.elias_asharan',g));
  for(const id of ['character.mattan_iii_asharan','character.mattan_ii_asharan','character.jonan_i_asharan','character.ashar_i_asharan','character.mattan_i']) assert.ok(ancestors.includes(id),`missing ancestor ${id}`);
  const claims=activeClaimsForOffice(HISTORICAL_WORLD_SEED,'office.serath.king');
  assert.equal(claims[0].claimantCharacterId,'character.elias_asharan');
  assert.equal(claims[0].priority,1);
});

test('Tenrai and Darcon retain distinct succession uncertainty rather than one universal primogeniture rule',()=>{
  const tenrai=HISTORICAL_WORLD_SEED.offices.find(row=>row.id==='office.kaishin.emperor');
  const darcon=HISTORICAL_WORLD_SEED.offices.find(row=>row.id==='office.vespera.emperor');
  assert.equal(tenrai.selectionMode,'hereditary');
  assert.equal(darcon.selectionMode,'customary');
  assert.equal(darcon.hereditaryByDefault,true);
  const tenraiClaims=activeClaimsForOffice(HISTORICAL_WORLD_SEED,tenrai.id);
  assert.equal(tenraiClaims[0].claimantCharacterId,'character.ren_tenrai');
  assert.equal(tenraiClaims[0].priority,1);
  const darconClaims=activeClaimsForOffice(HISTORICAL_WORLD_SEED,darcon.id);
  assert.equal(darconClaims.length,2);
  assert.ok(darconClaims.every(row=>row.priority===undefined));
  assert.ok(darconClaims.every(row=>row.canonicalStatus==='canonical_uncertain'));
});

test('Vesperan interfaith marriage sequence is stored without mis-parenting Alexar III to his father\'s second wife',()=>{
  const g=buildGenealogyIndex(HISTORICAL_WORLD_SEED);
  assert.ok(ids(spousesOf('character.alexar_ii_darcon',g)).includes('character.sophia_valen'));
  assert.ok(ids(spousesOf('character.alexar_ii_darcon',g)).includes('character.miriam_sariel'));
  const parents=buildGenealogyIndex(HISTORICAL_WORLD_SEED).parentsByChild.get('character.alexar_iii_darcon');
  assert.deepEqual(new Set(parents),new Set(['character.alexar_ii_darcon','character.sophia_valen']));
  const secondMarriage=HISTORICAL_WORLD_SEED.relationships.find(row=>row.id==='relationship.alexar_ii.spouse.miriam_sariel');
  assert.deepEqual(secondMarriage.startDate,{precision:'year',year:587});
});

test('Blackhaven family persistence remains separate from elected High Captain succession',()=>{
  const office=HISTORICAL_WORLD_SEED.offices.find(row=>row.id==='office.blackhaven.high_captain');
  assert.equal(office.selectionMode,'elected');
  assert.equal(office.hereditaryByDefault,false);
  const snapshot=officeSnapshotAt(HISTORICAL_WORLD_SEED,office.id,AT_628);
  assert.equal(snapshot.currentHolder.name,'Mara Voss');
  const terms=HISTORICAL_WORLD_SEED.officeTerms.filter(row=>row.officeId===office.id);
  assert.deepEqual(terms.map(row=>row.holderCharacterId),['character.jessa_corven','character.bran_garric','character.niko_serrat','character.mara_voss']);
  const g=buildGenealogyIndex(HISTORICAL_WORLD_SEED);
  assert.ok(ids(childrenOf('character.jessa_corven',g)).includes('character.isabella_corven'));
  const isabellaClaim=HISTORICAL_WORLD_SEED.claims.find(row=>row.id==='claim.isabella.blackhaven_high_captain');
  assert.equal(isabellaClaim.basis,'election');
  assert.equal(HISTORICAL_WORLD_SEED.claims.some(row=>row.claimantCharacterId==='character.isabella_corven'&&['direct_descent','collateral_descent'].includes(row.basis)),false);
});

test('Rhadessa is represented as an elected polity with Damon Rhys current and no hereditary family claim',()=>{
  const office=HISTORICAL_WORLD_SEED.offices.find(row=>row.id==='office.rhadessa.sea_magistrate');
  assert.equal(office.selectionMode,'elected');
  assert.equal(office.hereditaryByDefault,false);
  const snapshot=officeSnapshotAt(HISTORICAL_WORLD_SEED,office.id,AT_628);
  assert.equal(snapshot.currentHolder.name,'Damon Rhys');
  assert.match(snapshot.currentHolder.notes,/children do not inherit/i);
  assert.deepEqual(snapshot.activeClaims.map(row=>row.basis),['election']);
});

test('world seed validates with no chronology, genealogy, office, claim, or reference errors',()=>{
  assert.deepEqual(historicalValidationErrors(HISTORICAL_WORLD_SEED),[]);
  assert.deepEqual(validateHistoricalDatabase(HISTORICAL_WORLD_SEED),[]);
});

test('validator rejects cycles, implausibly young parents, duplicate open office terms, and undisputed hereditary claims on elected offices',()=>{
  const seed=structuredClone(HISTORICAL_WORLD_SEED);
  seed.relationships.push({id:'relationship.synthetic.cycle',fromCharacterId:'character.leif_vaering',toCharacterId:'character.eirik_iv_vaering',relationshipType:'parent',startDate:{precision:'unknown'},endDate:{precision:'unknown'},origin:'authored',canonicalStatus:'provisional'});
  seed.characters.push({id:'character.synthetic.young_parent',name:'Young Parent',sex:'unknown',ancestry:'unknown',homelandRegion:'skeldra',culture:'skeldran',religion:'unknown',birthDate:{precision:'year',year:600},deathDate:{precision:'unknown'},origin:'authored',canonicalStatus:'provisional',lifecycle:'living_persistent'});
  seed.characters.push({id:'character.synthetic.child',name:'Child',sex:'unknown',ancestry:'unknown',homelandRegion:'skeldra',culture:'skeldran',religion:'unknown',birthDate:{precision:'year',year:608},deathDate:{precision:'unknown'},origin:'authored',canonicalStatus:'provisional',lifecycle:'living_persistent'});
  seed.relationships.push({id:'relationship.synthetic.young',fromCharacterId:'character.synthetic.young_parent',toCharacterId:'character.synthetic.child',relationshipType:'parent',startDate:{precision:'year',year:608},endDate:{precision:'unknown'},origin:'authored',canonicalStatus:'provisional'});
  seed.officeTerms.push({id:'term.synthetic.second_current',officeId:'office.asterra.first_archon',holderCharacterId:'character.helena_marcellan',startDate:{precision:'unknown'},endDate:{precision:'unknown'},interim:false,origin:'authored',canonicalStatus:'provisional'});
  seed.claims.push({id:'claim.synthetic.hereditary_archon',claimantCharacterId:'character.helena_marcellan',targetOfficeId:'office.asterra.first_archon',basis:'direct_descent',genealogicalPath:['character.helena_marcellan','character.cassian_marcellan'],disputed:false,active:true,startDate:{precision:'unknown'},endDate:{precision:'unknown'},origin:'authored',canonicalStatus:'provisional'});
  const issues=validateHistoricalDatabase(seed);
  for(const code of ['genealogy_cycle','parent_implausibly_young','office_multiple_open_terms','nonhereditary_office_hereditary_claim']) assert.ok(issues.some(row=>row.code===code),`missing ${code}`);
});

test('history repository exposes houses, relationships, terms, and claims without UI/database coupling',()=>{
  const repo=new InMemoryHistoryRepository(HISTORICAL_WORLD_SEED);
  assert.equal(repo.getHouse('house.valerian').name,'House Valerian');
  assert.ok(repo.getRelationshipsForCharacter('character.lucan_vii_valerian').length>=4);
  assert.equal(repo.getOfficeTerms('office.blackhaven.high_captain').length,4);
  assert.ok(repo.getClaimsForOffice('office.skeldra.king').some(row=>row.claimantCharacterId==='character.sten_vaering'));
});

test('0.6B historical population remains compatible after the v9 physical-distance hotfix and does not alter traversable geography',()=>{
  const state=createGame({...structuredClone(DEFAULT_CHARACTER_CHOICES),name:'0.6B Regression Captain'},'06b-regression');
  assert.equal(state.schemaVersion,12);
  assert.equal(state.player.currentPortId,'port.veyrholm');
  assert.equal(state.ships[state.player.shipId].dockedAtPortId,'port.veyrholm');
});

test('0.6B SQL migration is seed-only, transaction-safe after the 0.6A trigger hotfix, and contains global polity records',()=>{
  const sql=readFileSync(join(root,'supabase/migrations/0009_alpha_06b_dynasties_genealogy_offices_claims.sql'),'utf8');
  assert.match(sql,/begin;\s*set constraints all deferred;/i);
  assert.match(sql,/set constraints all immediate;\s*commit;/i);
  assert.doesNotMatch(sql,/alter table/i,'0.6B should not mix deferred seed writes with ALTER TABLE work');
  for(const token of ['house.marcellan','house.valerian','house.asharan','house.tenrai','house.darcon','office.asterra.first_archon','office.rhadessa.sea_magistrate','claim.isabella.blackhaven_high_captain']) assert.match(sql,new RegExp(token.replaceAll('.','\\.')));
});

test('0.6B remains a political-history population pass rather than 0.6C simulation/UI scope',()=>{
  assert.equal(HISTORICAL_DYNASTIES_06B_SEED.wars.length,0);
  assert.equal(HISTORICAL_DYNASTIES_06B_SEED.battles.length,0);
  assert.equal(HISTORICAL_DYNASTIES_06B_SEED.treaties.length,0);
  const docs=readFileSync(join(root,'docs/ALPHA_0.6B_DYNASTIES_GENEALOGY_OFFICES_CLAIMS.md'),'utf8');
  assert.match(docs,/does not simulate births, marriages, deaths, or succession/i);
});
