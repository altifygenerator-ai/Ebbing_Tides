import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

import {
  createGame,
  DEFAULT_CHARACTER_CHOICES,
  startingCrownsForChoices,
  startingShipOriginImpact
} from '../public/alpha/js/game/createGame.js';
import { buildStartingSkills, startingSkillContributions } from '../public/alpha/js/game/skills.js';
import { transact } from '../public/alpha/js/game/economy.js';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const choices = (overrides={}) => ({ ...structuredClone(DEFAULT_CHARACTER_CHOICES), name:'UX Lock Captain', ...overrides });

function contribution(source, c=choices()) {
  return startingSkillContributions(c).find(row => row.source === source);
}

test('A0.3B1 advances the package without changing save schema or adding a migration', () => {
  const pkg=JSON.parse(read('package.json'));
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.a0-3(?:b(?:1|2|3)|c)|0\.6\.0-alpha\.d\.r2)$/);
  assert.equal(createGame(choices(), 'a0-3b1-schema').schemaVersion,12);
  assert.equal(existsSync(new URL('supabase/migrations/0013_a0_3b1.sql', root)),false);
});

test('creator review uses the same centralized starting skill contributions as actual character creation', () => {
  const c=choices();
  assert.deepEqual(contribution('social_origin',c).bonuses,{seamanship:6,streetwise:10,athletics:4});
  assert.deepEqual(contribution('background',c).bonuses,{seamanship:6,navigation:8,survival:9});
  assert.deepEqual(contribution('profession',c).bonuses,{seamanship:12,navigation:5,athletics:4});
  assert.deepEqual(contribution('trait',c).bonuses,{seamanship:5});
  assert.deepEqual(contribution('core_training',c).bonuses,{blades:15,seamanship:15,navigation:15,survival:15,commerce:15});
  const skills=buildStartingSkills(c);
  assert.equal(skills.seamanship,49);
  assert.equal(skills.navigation,33);
  assert.equal(skills.survival,29);
  assert.equal(skills.streetwise,15);
});

test('starting crown and ship-origin review helpers preserve the canonical starting state', () => {
  assert.equal(startingCrownsForChoices(choices({socialOrigin:'merchant_family'})),320);
  assert.equal(startingCrownsForChoices(choices({socialOrigin:'merchant_family',shipOrigin:'purchased_on_debt'})),280);
  const surplus=startingShipOriginImpact(choices({shipOrigin:'naval_surplus'}));
  assert.equal(surplus.hullBonus,8);
  const debt=startingShipOriginImpact(choices({shipOrigin:'purchased_on_debt'}));
  assert.equal(debt.crownAdjustment,-40);
  assert.deepEqual(debt.cargo,[{commodityId:'good.grain',quantity:4}]);
  const state=createGame(choices({shipOrigin:'naval_surplus'}),'a0-3b1-surplus');
  assert.equal(state.ships[state.player.shipId].systems.hull,62);
  assert.equal(state.ships[state.player.shipId].systems.hullMax,68);
});

test('creator training rows are whole-row controls and the attribute layout is compact', () => {
  const main=read('src/alpha/main.ts');
  const css=read('public/alpha/styles.css');
  assert.match(main,/creator-skill-choice/);
  assert.match(main,/creator-skill-box/);
  assert.match(main,/Click anywhere on a skill row to select it/);
  assert.match(css,/creator-training-pane \.attr-box[\s\S]*grid-template-columns:minmax\(0,1fr\) 64px/);
  assert.match(css,/creator-skill-choice[\s\S]*min-height:42px/);
  assert.match(css,/creator-skill-choice>input\[type="checkbox"\][\s\S]*opacity:0/);
});

test('creator review exposes the actual starting toolbox and exact choice effects without inventing ancestry stats', () => {
  const main=read('src/alpha/main.ts');
  assert.match(main,/Starting toolbox/);
  assert.match(main,/Major choice effects/);
  assert.match(main,/Strongest starting skills/);
  assert.match(main,/Starting abilities/);
  assert.match(main,/Starting specializations/);
  assert.match(main,/startingSkillContributions\(choices\)/);
  assert.match(main,/buildCapabilityState\(choices\)/);
  assert.match(main,/No direct stat or ability modifiers; ancestry remains identity, appearance and contextual recognition/);
});

test('market transaction owner supports buying and selling multiple units in one action', () => {
  const state=createGame(choices(),'a0-3b1-bulk-trade');
  state.player.character.crowns=10000;
  const portId=state.player.currentPortId;
  const grain=state.markets[portId].goods['good.grain'];
  grain.stock=Math.max(grain.stock,50);
  const beforeStock=grain.stock;
  const beforeCrowns=state.player.character.crowns;
  const buy=transact(state,'good.grain',10,'buy');
  assert.equal(buy.ok,true);
  assert.equal(state.ships[state.player.shipId].cargo.find(row=>row.commodityId==='good.grain').quantity,10);
  assert.equal(grain.stock,beforeStock-10);
  assert.ok(state.player.character.crowns<beforeCrowns);
  const sell=transact(state,'good.grain',7,'sell');
  assert.equal(sell.ok,true);
  assert.equal(state.ships[state.player.shipId].cargo.find(row=>row.commodityId==='good.grain').quantity,3);
  assert.equal(grain.stock,beforeStock-3);
});

test('market UI provides explicit quantity controls while still calling the one canonical transact function', () => {
  const main=read('src/alpha/main.ts');
  assert.match(main,/class="market-quantity-input"/);
  assert.match(main,/data-action="trade-quantity"/);
  assert.match(main,/min="1" max="999"/);
  assert.match(main,/transact\(s,id,quantity,/);
  assert.doesNotMatch(main,/transact\(s,id,1,d\(actionEl,"dir"\)/);
});

test('same-view rerenders preserve local scroll owners while actual view changes get a new view key', () => {
  const main=read('src/alpha/main.ts');
  assert.match(main,/lastRenderedGameViewKey===viewKey\?captureGameScrollPositions\(\):undefined/);
  assert.match(main,/restoreGameScrollPositions\(scrollSnapshot,viewKey\)/);
  assert.match(main,/\.context-location-scroll/);
  assert.match(main,/if\(tab==="ship"\)return `\$\{place\}:ship:\$\{shipPanelTab\}`/);
  assert.match(main,/if\(tab==="journal"\)return `\$\{place\}:journal:\$\{journalTab\}`/);
});

test('ship overview shows service costs and redundant quick actions use the same canonical repair and supply actions', () => {
  const main=read('src/alpha/main.ts');
  assert.match(main,/Supplies \+6 · \$\{supplyQuote\.cost\} cr/);
  assert.match(main,/Repair · \$\{repairQuote\.cost\} cr/);
  assert.match(main,/class="ship-status-quick-action" data-action="repair-ship"/);
  assert.match(main,/class="ship-status-quick-action" data-action="buy-supplies"/);
  assert.match(main,/case "buy-supplies": handleResult\(buySupplies\(s\)/);
  assert.match(main,/case "repair-ship": handleResult\(repairShip\(s\)/);
});

test('A0.3B1 remains code-owned UX tightening rather than a premature painted-art pass', () => {
  const main=read('src/alpha/main.ts');
  const css=read('public/alpha/styles.css');
  assert.match(css,/A0\.3B\.1 — creator clarity \+ interaction stability polish/);
  assert.match(main,/data-character-structure="pre-art"/);
  assert.doesNotMatch(main,/data-character-structure="final-art"/);
});
