import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { crewSummary, crewUnrestProfile, ensureCrewCommunity } from '../public/alpha/js/game/crewState.js';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
function game(seed='crew2'){ return createGame({...structuredClone(DEFAULT_CHARACTER_CHOICES),name:'Crew Two'},seed); }
function ship(state){ return state.ships[state.player.shipId]; }

test('crew unrest is derived qualitatively from existing company state rather than adding a new player-managed meter',()=>{
  const calm=game('crew2-calm');
  const calmState=crewUnrestProfile(calm);
  assert.equal(calmState.level,'quiet');
  const rough=game('crew2-rough');
  const c=ensureCrewCommunity(ship(rough));
  ship(rough).systems.morale=18;
  Object.assign(c,{loyalty:20,foodSatisfaction:18,paySatisfaction:20,fatigue:88,dangerousOrdersRemembered:8,outstandingPrizeShare:70});
  ship(rough).crewWelfare={averageHealth:80,zeroSupplyHours:0,shortageEpisodes:4,shortageActive:false,currentEpisodeMoraleLoss:0,currentEpisodeHealthLoss:0};
  const roughState=crewUnrestProfile(rough);
  assert.ok(['discontented','defiant'].includes(roughState.level));
  assert.ok(roughState.reasons.length>0);
  assert.equal(crewSummary(rough).unrest,roughState.label);
});

test('navigation HUD exposes qualitative morale and loyalty beside existing voyage resources',()=>{
  const main=fs.readFileSync(path.join(root,'src/alpha/main.ts'),'utf8');
  assert.match(main,/tab==="chart"\?`<div class="top-stat crew-hud-stat morale/);
  assert.match(main,/Morale <b>\$\{esc\(crew\.morale\)\}<\/b>/);
  assert.match(main,/Loyalty <b>\$\{esc\(crew\.loyalty\)\}<\/b>/);
  assert.match(main,/Crowns <b>/);
  assert.match(main,/Supplies <b>/);
});

test('meaningful captain decisions can surface restrained crew reaction toasts without background morale-tick spam',()=>{
  const main=fs.readFileSync(path.join(root,'src/alpha/main.ts'),'utf8');
  const css=fs.readFileSync(path.join(root,'public/alpha/styles.css'),'utf8');
  assert.match(main,/The crew didn't like that\./);
  assert.match(main,/The crew approved of your decision\./);
  assert.match(main,/The crew remembers your fairness\./);
  assert.match(main,/The crew appreciates the time ashore\./);
  assert.match(main,/showCrewReaction\(departureReaction,"underprovisioned"\)/);
  assert.match(main,/handleCrewResult\(s,before,sharePrizeWithCrew\(s\),"prize_share"/);
  assert.match(main,/handleCrewResult\(s,before,restCrew\(s\),"shore_leave"/);
  assert.match(css,/\.toast\.crew-reaction-toast/);
  assert.doesNotMatch(main,/applyZeroSupplyHardship[\s\S]{0,200}showCrewReaction/,'routine shortage ticks must not directly spam reaction toasts');
});

test('unrest feedback stays inside existing crew, tavern, ship and navigation surfaces with no new management module',()=>{
  const main=fs.readFileSync(path.join(root,'src/alpha/main.ts'),'utf8');
  assert.match(main,/crew-unrest-note/);
  assert.match(main,/Morale/);
  assert.match(main,/Loyalty/);
  assert.match(main,/Feeling toward captain/);
  const navStart=main.indexOf('function renderNav');
  const navEnd=main.indexOf('function portArtPath',navStart);
  const nav=main.slice(navStart,navEnd);
  assert.doesNotMatch(nav,/Morale|Loyalty|Unrest|Payroll|Crew Management/);
  assert.match(nav,/\["crew","Crew"\]/);
  assert.doesNotMatch(main,/Fight the Mutiny Leader|Talk Down Mutiny|Mutiny Combat/);
});

test('First Mate quality contributes to crew leadership rather than company stability depending on captain stats alone',async()=>{
  const { crewLeadershipProfile } = await import('../public/alpha/js/game/crewHardship.js');
  const strong=game('crew2-firstmate');
  const weak=game('crew2-firstmate');
  const strongMate=strong.npcs[strong.player.firstMateId];
  const weakMate=weak.npcs[weak.player.firstMateId];
  const strongMember=strong.player.crew.find(m=>m.npcId===strong.player.firstMateId);
  const weakMember=weak.player.crew.find(m=>m.npcId===weak.player.firstMateId);
  strongMate.skills.command=90; strongMate.relationshipToPlayer.respect=60; strongMate.relationshipToPlayer.trust=50; strongMate.relationshipToPlayer.suspicion=0; strongMember.loyalty=90;
  weakMate.skills.command=10; weakMate.relationshipToPlayer.respect=-40; weakMate.relationshipToPlayer.trust=-30; weakMate.relationshipToPlayer.suspicion=60; weakMember.loyalty=15;
  assert.ok(crewLeadershipProfile(strong).score>crewLeadershipProfile(weak).score);
  assert.ok(crewLeadershipProfile(strong).sources.some(row=>row.source==='First Mate'));
});

test('carrying an unpaid prize share through later voyages gradually worsens pay satisfaction without an extra payroll screen',async()=>{
  const { recordCompletedCrewVoyage } = await import('../public/alpha/js/game/crewMechanics.js');
  const state=game('crew2-unpaid-prize');
  const c=ensureCrewCommunity(ship(state));
  c.outstandingPrizeShare=80;
  c.paySatisfaction=60;
  recordCompletedCrewVoyage(state);
  assert.equal(c.paySatisfaction,58);
  c.paySatisfaction=34;
  const loyaltyBefore=c.loyalty;
  recordCompletedCrewVoyage(state);
  assert.equal(c.paySatisfaction,32);
  assert.equal(c.loyalty,loyaltyBefore-1);
});
