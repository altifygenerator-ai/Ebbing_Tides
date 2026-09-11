import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createGame, DEFAULT_CHARACTER_CHOICES } from '../public/alpha/js/game/createGame.js';
import { assessPort } from '../public/alpha/js/game/portActions.js';
import { relationshipStatus, marketSignals, portReadLens, shipBuildRole } from '../public/alpha/js/game/playerFacing.js';
import { deterministicCharacterMindReply } from '../public/alpha/js/game/characterMind.js';

function game(overrides={}, seed='06d-core-recovery') {
  return createGame({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'Recovery Captain', ...overrides }, seed);
}

test('0.6D contextual port flow keeps location actions out of permanent application navigation', () => {
  const main=readFileSync('src/alpha/main.ts','utf8');
  const start=main.indexOf('function renderNav');
  const end=main.indexOf('function portReturnBar',start);
  const nav=main.slice(start,end);
  assert.match(nav,/state\.player\.currentPortId/,'current location should anchor navigation while in port');
  assert.doesNotMatch(nav,/data-tab="market"/,'Market should be contextual to a port, not permanent app navigation');
  assert.doesNotMatch(nav,/data-tab="tavern"/,'Tavern should be contextual to a port, not permanent app navigation');
  assert.doesNotMatch(nav,/data-tab="people"/,'People should be contextual to a port, not permanent app navigation');
  assert.doesNotMatch(nav,/data-tab="government"/,'Government should be contextual to a port, not permanent app navigation');
  assert.doesNotMatch(nav,/data-tab="religion"/,'Religion should be contextual to a port, not permanent app navigation');
  assert.match(main,/data-action="assess-port"/,'port view should expose a build-sensitive read of the location');
  assert.match(main,/portReturnBar\(/,'location activities should retain an obvious return-to-port route');
});

test('background and profession select different meaningful port-reading lenses', () => {
  const smuggler=game({background:'raised_among_smugglers',recentProfession:'smuggler'},'lens-smuggler');
  const merchant=game({background:'shipwreck_survivor',recentProfession:'merchant_clerk',socialOrigin:'merchant_family'},'lens-merchant');
  const engineer=game({background:'engineers_apprentice',recentProfession:'shipwright'},'lens-engineer');
  assert.equal(portReadLens(smuggler).skillId,'streetwise');
  assert.equal(portReadLens(smuggler).id,'underworld');
  assert.equal(portReadLens(merchant).skillId,'commerce');
  assert.equal(portReadLens(merchant).id,'trade');
  assert.equal(portReadLens(engineer).skillId,'engineering');
  assert.equal(portReadLens(engineer).id,'industrial');
});

test('assessing a port advances time and turns a character build into actionable knowledge', () => {
  const state=game({background:'raised_among_smugglers',recentProfession:'smuggler',startingLocationId:'port.veyrholm'},'assess-port');
  const beforeHour=state.absoluteHour;
  const beforeKnowledge=state.player.knowledge.length;
  const result=assessPort(state);
  assert.equal(result.ok,true);
  assert.equal(state.absoluteHour,beforeHour+1);
  assert.equal(state.player.knowledge.length,beforeKnowledge+1);
  const added=state.player.knowledge.at(-1);
  assert.equal(added?.source,'Smuggler experience');
  assert.equal(added?.category,'danger');
  assert.ok(state.worldEvents.some(event=>event.type==='port_assessment'));
});

test('market surface turns simulation stock into qualitative actionable information', () => {
  const low=game({},'market-signal-low');
  low.player.character.skills.commerce=5;
  const high=structuredClone(low);
  high.player.character.skills.commerce=80;
  const lowSignals=marketSignals(low,'port.veyrholm');
  const highSignals=marketSignals(high,'port.veyrholm');
  assert.ok(lowSignals.length>=1);
  assert.ok(highSignals.length>=lowSignals.length);
  assert.ok(highSignals.some(signal=>/scarce|plentiful|cargo|prices|selling/i.test(signal.text)));
  const main=readFileSync('src/alpha/main.ts','utf8');
  const start=main.indexOf('function renderMarket');
  const end=main.indexOf('function renderInventory',start);
  const market=main.slice(start,end);
  assert.doesNotMatch(market,/stock-figures/,'raw stock/target dashboard figures should not dominate normal market play');
  assert.match(market,/Captain(?:&apos;|'|’)?s read|Captain’s read/,'market should surface an actionable captain-facing read');
});

test('relationships are surfaced qualitatively rather than as permanent internal dimensions', () => {
  const state=game({},'relationship-labels');
  const npc=structuredClone(Object.values(state.npcs)[0]);
  npc.relationshipToPlayer={...npc.relationshipToPlayer,trust:82,respect:72,suspicion:5,hatred:0};
  assert.equal(relationshipStatus(npc),'Trusted');
  npc.relationshipToPlayer={...npc.relationshipToPlayer,trust:5,respect:5,suspicion:90,hatred:70};
  assert.equal(relationshipStatus(npc),'Hostile');
  const main=readFileSync('src/alpha/main.ts','utf8');
  assert.match(main,/relationshipStatus\(/);
  assert.doesNotMatch(main,/Trust \$\{|Respect \$\{|Suspicion \$\{/,'normal UI should not print raw relationship meters as its primary language');
});

test('NPC conversation can react differently to the captain build without exposing a visible skill check', () => {
  const merchant=game({startingLocationId:'port.ironhaven',recentProfession:'merchant_clerk'},'korr-merchant');
  const defaultCaptain=game({startingLocationId:'port.ironhaven',recentProfession:'sailor'},'korr-sailor');
  merchant.player.character.skills.commerce=60;
  defaultCaptain.player.character.skills.commerce=5;
  const a=deterministicCharacterMindReply(merchant,'character.pastor_elias_korr','Is there work?');
  const b=deterministicCharacterMindReply(defaultCaptain,'character.pastor_elias_korr','Is there work?');
  assert.notEqual(a.text,b.text);
  assert.match(a.text,/manifest|Grain/i);
  assert.doesNotMatch(a.text,/\[Commerce|check|difficulty/i);
});

test('ship presentation derives a readable build role while retaining deep systems underneath', () => {
  const state=game({},'ship-role');
  const ship=state.ships[state.player.shipId];
  assert.equal(typeof shipBuildRole(ship),'string');
  assert.ok(shipBuildRole(ship).length>3);
  const main=readFileSync('src/alpha/main.ts','utf8');
  const start=main.indexOf('function renderShip');
  const end=main.indexOf('function renderMarket',start);
  const rendered=main.slice(start,end);
  assert.match(rendered,/shipBuildRole\(ship\)/);
  assert.match(rendered,/Supplies/);
  assert.match(rendered,/Sails/);
  assert.match(rendered,/Rigging/);
  assert.doesNotMatch(rendered,/Morale[^\n]{0,80}Flooding[^\n]{0,80}Fire/,'ship overview should not be a permanent wall of every simulation value');
});

test('combat surface keeps clear primary actions and demotes stance micromanagement', () => {
  const main=readFileSync('src/alpha/main.ts','utf8');
  const navalStart=main.indexOf('function renderEncounter');
  const personalStart=main.indexOf('function renderPersonalCombat',navalStart);
  const personalEnd=main.indexOf('function renderGame',personalStart);
  const naval=main.slice(navalStart,personalStart);
  const personal=main.slice(personalStart,personalEnd);
  assert.match(naval,/>Fire Hull</);
  assert.match(naval,/>Fire Rigging</);
  assert.match(naval,/>Repair</);
  assert.match(naval,/>Flee</);
  assert.match(personal,/>Attack ·/);
  assert.match(personal,/>Defend ·/);
  assert.match(personal,/class="stance-menu"/,'stances should remain available without consuming a row of permanent buttons');
});

test('Journal production surface prioritizes useful knowledge, contacts, promises, and events over raw simulation metadata', () => {
  const main=readFileSync('src/alpha/main.ts','utf8');
  const start=main.indexOf('function renderJournal');
  const end=main.indexOf('function renderTavern',start)>start ? main.indexOf('function renderTavern',start) : main.indexOf('function renderChart',start);
  const journal=main.slice(start,end);
  assert.match(journal,/What I Know/);
  assert.match(journal,/Contacts/);
  assert.match(journal,/Promises & Work/);
  assert.match(journal,/What Happened/);
  assert.doesNotMatch(journal,/\$\{k\.confidence\}%/,'exact confidence should not dominate normal journal reading');
});
