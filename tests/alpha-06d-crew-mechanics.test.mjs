import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { crewRecruitOffers, recruitCrewOffer, shoreLeaveCost, takeCrewShoreLeave, recordPrizeForCrew, sharePrizeWithCrew, checkTavernDesertion } from '../public/alpha/js/game/crewMechanics.js';
import { crewActionModifier, crewSummary, ensureCrewCommunity, namedCrewCount, ordinaryCrewCount } from '../public/alpha/js/game/crewState.js';
import { applyZeroSupplyHardship, ensureCrewWelfare } from '../public/alpha/js/game/crewHardship.js';
import { navigationTargetForPort, plotCourse } from '../public/alpha/js/game/navigation.js';
import { migrateSaveData } from '../public/alpha/js/services/localSave.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

function game(seed='crew-mechanics') {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'Crew Captain' }, seed);
}

function playerShip(state){ return state.ships[state.player.shipId]; }

test('new campaigns use schema 12 and separate named officers from aggregate ordinary hands',()=>{
  const state=game('crew-baseline');
  const ship=playerShip(state);
  assert.equal(state.schemaVersion,12);
  assert.ok(ship.crewCommunity);
  assert.equal(ship.systems.crew,8);
  assert.equal(namedCrewCount(state),4);
  assert.equal(ordinaryCrewCount(state),4);
  assert.equal(state.player.crew.length,4,'generic sailors must not clutter the named/officer roster');
  assert.equal(crewSummary(state).ordinary,4);
});

test('tavern recruitment is deterministic, quality-based, and changes aggregate company rather than named roster',()=>{
  const state=game('crew-recruit');
  const ship=playerShip(state);
  const beforeCommunity={...ensureCrewCommunity(ship)};
  const beforeNamed=state.player.crew.length;
  const offersA=crewRecruitOffers(state);
  const offersB=crewRecruitOffers(state);
  assert.deepEqual(offersA,offersB);
  assert.equal(offersA.length,3);
  assert.ok(offersA.every(o=>o.signing>0 && o.experience>=0 && o.experience<=100));
  const crowns=state.player.character.crowns;
  const result=recruitCrewOffer(state,offersA[0].id);
  assert.equal(result.ok,true);
  assert.equal(ship.systems.crew,9);
  assert.equal(state.player.crew.length,beforeNamed);
  assert.equal(ordinaryCrewCount(state),5);
  assert.equal(state.player.character.crowns,crowns-offersA[0].signing);
  assert.equal(ensureCrewCommunity(ship).recruitsHired,beforeCommunity.recruitsHired+1);
});

test('shore leave scales with company size and restores morale, loyalty, food satisfaction and fatigue',()=>{
  const state=game('crew-shore-leave');
  const ship=playerShip(state);
  const company=ensureCrewCommunity(ship);
  ship.systems.morale=35;
  company.loyalty=40;
  company.foodSatisfaction=25;
  company.fatigue=80;
  state.player.character.crowns=500;
  const expectedCost=shoreLeaveCost(state);
  const beforeHour=state.absoluteHour;
  const result=takeCrewShoreLeave(state);
  assert.equal(result.ok,true);
  assert.equal(state.absoluteHour,beforeHour+8);
  assert.equal(state.player.character.crowns,500-expectedCost);
  assert.ok(ship.systems.morale>35);
  assert.ok(company.loyalty>40);
  assert.ok(company.foodSatisfaction>25);
  assert.ok(company.fatigue<80);
});

test('captured prize creates a fair-share obligation and paying it materially improves company morale and loyalty',()=>{
  const state=game('crew-prize');
  const ship=playerShip(state);
  const company=ensureCrewCommunity(ship);
  state.player.character.crowns=1000;
  const beforeMorale=ship.systems.morale;
  const beforeLoyalty=company.loyalty;
  recordPrizeForCrew(state,300);
  assert.equal(company.outstandingPrizeShare,60);
  assert.ok(ship.systems.morale>beforeMorale);
  const afterVictoryMorale=ship.systems.morale;
  const result=sharePrizeWithCrew(state);
  assert.equal(result.ok,true);
  assert.equal(company.outstandingPrizeShare,0);
  assert.equal(state.player.character.crowns,940);
  assert.ok(company.loyalty>=beforeLoyalty+10);
  assert.ok(ship.systems.morale>=afterVictoryMorale+8);
});

test('zero supplies remains non-blocking hardship and prolonged deprivation damages company loyalty as well as morale/health',()=>{
  const state=game('crew-shortage');
  const ship=playerShip(state);
  const company=ensureCrewCommunity(ship);
  ship.supplies=0;
  const beforeLoyalty=company.loyalty;
  const result=applyZeroSupplyHardship(state,120);
  assert.equal(ensureCrewWelfare(ship).zeroSupplyHours,120);
  assert.ok(result.moraleLoss>0);
  assert.ok(result.healthLoss>0);
  assert.equal(company.loyalty,beforeLoyalty-6,'72h and 120h thresholds should both leave lasting loyalty pressure');
  assert.ok(company.foodSatisfaction<72);
});

test('crew quality affects ship handling without replacing the captain/officer specialist',()=>{
  const good=game('crew-voyage-quality');
  const poor=game('crew-voyage-quality');
  const goodC=ensureCrewCommunity(playerShip(good));
  const poorC=ensureCrewCommunity(playerShip(poor));
  Object.assign(goodC,{experience:85,discipline:85,seamanship:85,fatigue:5});
  playerShip(good).systems.morale=85;
  Object.assign(poorC,{experience:20,discipline:20,seamanship:20,fatigue:90});
  playerShip(poor).systems.morale=20;
  assert.ok(crewActionModifier(good,'seamanship')>crewActionModifier(poor,'seamanship'));
  const goodCourse=plotCourse(good,navigationTargetForPort('port.ironhaven'));
  const poorCourse=plotCourse(poor,navigationTargetForPort('port.ironhaven'));
  assert.equal(goodCourse.routeDistanceNm,poorCourse.routeDistanceNm,'crew quality must not alter physical geography');
  assert.ok(goodCourse.estimatedHours<=poorCourse.estimatedHours,'better company handling should not make the same route slower');
  assert.ok(goodCourse.plannedAverageSpeedKnots>poorCourse.plannedAverageSpeedKnots);
});

test('extreme dissatisfaction can cause ordinary sailors to desert in port but never silently removes named officers',()=>{
  const state=game('hardship'); // deterministic first-day desertion roll is safely below capped extreme risk.
  const ship=playerShip(state);
  const company=ensureCrewCommunity(ship);
  ship.systems.morale=0;
  Object.assign(company,{loyalty:0,fatigue:100,foodSatisfaction:0,paySatisfaction:0,dangerousOrdersRemembered:20,outstandingPrizeShare:100});
  ensureCrewWelfare(ship).shortageEpisodes=6;
  const namedBefore=namedCrewCount(state);
  const rosterBefore=state.player.crew.map(x=>x.npcId);
  const crewBefore=ship.systems.crew;
  const result=checkTavernDesertion(state);
  assert.ok(result.left>=1);
  assert.equal(namedCrewCount(state),namedBefore);
  assert.deepEqual(state.player.crew.map(x=>x.npcId),rosterBefore);
  assert.equal(ship.systems.crew,crewBefore-result.left);
  assert.ok(ship.systems.crew>=namedBefore);
});

test('schema 10 saves migrate crew community state and collapse legacy generic deckhands back into aggregate population',()=>{
  const current=game('crew-migration');
  const legacy=structuredClone(current);
  legacy.schemaVersion=10;
  delete legacy.ships[legacy.player.shipId].crewCommunity;
  legacy.player.crew.push({id:'crew.legacy.generated',name:'Generated Deckhand',role:'deckhand',morale:50,loyalty:50,health:100});
  const migrated=migrateSaveData(legacy);
  assert.equal(migrated.schemaVersion,12);
  assert.ok(migrated.ships[migrated.player.shipId].crewCommunity);
  assert.equal(migrated.player.crew.length,4);
  assert.ok(migrated.player.crew.every(member=>member.npcId));
  assert.equal(migrated.ships[migrated.player.shipId].systems.crew,8);
});

test('crew UI exposes the simple company loop while full mutiny confrontation remains deferred',()=>{
  const main=fs.readFileSync(path.join(root,'src/alpha/main.ts'),'utf8');
  assert.match(main,/Ship's Company/);
  assert.match(main,/Hands looking for work/);
  assert.match(main,/Recruit Sailors/);
  assert.match(main,/Share Prize Money/);
  assert.match(main,/Food, Bunks & Shore Leave/);
  assert.doesNotMatch(main,/Fight the Mutiny Leader|Mutiny Combat|Talk Down Mutiny/);
});
