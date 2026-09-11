import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const main = readFileSync('src/alpha/main.ts','utf8');
const art = readFileSync('src/data/seed/presentationArt.ts','utf8');
const css = readFileSync('public/alpha/styles.css','utf8');

function pngSize(path){
  const b=readFileSync(path);
  assert.equal(b.toString('ascii',1,4),'PNG');
  return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
}

test('0.6D contextual location art registry contains all six Skeldran scene types',()=>{
  for(const key of ['market','tavern','harbor','royal_palace','temple','people']){
    assert.match(art,new RegExp(`${key}: \\\"/art/location/context/skeldra/${key}\\.png\\\"`));
    const disk=`public/art/location/context/skeldra/${key}.png`;
    assert.equal(existsSync(disk),true,`${disk} missing`);
    assert.deepEqual(pngSize(disk),{width:2172,height:500});
  }
});

test('contextual presentation keeps baked static art separate from dynamic code-owned names',()=>{
  assert.match(main,/contextLocationHero\(/);
  assert.ok(main.includes('const marketTitle = `${port.name} Exchange`;'));
  assert.match(main,/`People of \$\{port\.name\}`/);
  assert.match(main,/port\.governmentName/);
  assert.match(main,/port\.religionName/);
  assert.match(main,/kicker:\"Ship\"/);
  assert.match(main,/controls:shipSwitcher/);
});

test('market uses scene art then dynamic exchange title then code-owned Current Prices board',()=>{
  const start=main.indexOf('function renderMarket');
  const end=main.indexOf('function renderSpecializationStatus',start);
  const market=main.slice(start,end);
  assert.match(market,/contextLocationHero\(portId,\"market\",marketTitle/);
  assert.match(market,/<h3>Current Prices<\/h3>/);
  assert.doesNotMatch(market,/screen-local-title\">Market/);
});

test('tavern, government, temple and people use the same reusable scene-first hierarchy',()=>{
  assert.match(main,/contextLocationHero\(portId,\"tavern\"/);
  assert.match(main,/kind === \"government\" \? \"royal_palace\" : \"temple\"/);
  assert.match(main,/contextLocationHero\(portId,\"people\"/);
});

test('harbor work makes supplies, damage condition and service prices obvious without changing ship systems',()=>{
  const start=main.indexOf('function renderShip');
  const end=main.indexOf('function renderMarket',start);
  const ship=main.slice(start,end);
  assert.match(ship,/Supplies aboard/);
  assert.match(ship,/quoteShipSupplies/);
  assert.match(ship,/Load 6 Supplies · \${supplyQuote\.cost} cr/);
  assert.match(ship,/Full Repair · \$\{repairCost\} cr/);
  assert.match(ship,/Hull/);
  assert.match(ship,/Sails/);
  assert.match(ship,/Rigging/);
});


test('context scene frame preserves the full normalized banner without cover-cropping the symbol plaque',()=>{
  assert.match(css,/\.context-scene-frame\{[^}]*aspect-ratio:2172\/500/s);
  assert.doesNotMatch(css,/\.context-scene-frame\{[^}]*height:clamp/s);
  assert.match(css,/\.context-scene-frame img\{[^}]*width:100%;height:100%;object-fit:cover;object-position:center/s);
});

test('tavern mechanics use equal-width stretched columns with aligned action areas',()=>{
  assert.match(css,/\.context-two-col\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\);align-items:stretch\}/);
  assert.match(css,/\.context-two-col>\.panel\{height:100%;display:flex;flex-direction:column\}/);
  assert.match(css,/\.context-two-col>\.panel>\.context-action-stack\{margin-top:auto\}/);
});


test('contextual locations use one scroll owner for art heading and mechanics',()=>{
  assert.match(main,/class=\"context-location-scroll\">\$\{contextLocationHero/);
  assert.match(css,/\.context-location-scroll\{[^}]*overflow-y:auto/s);
  assert.match(css,/\.context-location-scroll \.context-location-mechanics\{[^}]*overflow:visible/s);
  assert.match(css,/\.contextual-location-screen\{[^}]*grid-template-rows:auto minmax\(0,1fr\)/s);
});

test('tavern second panel does not inherit generic adjacent-panel top margin',()=>{
  assert.match(css,/\.context-two-col>\.panel \+ \.panel\{margin-top:0\}/);
  assert.match(main,/context-panel-actions/);
});

test('Skeldran settlement hub has a dedicated Arrived at Port regional banner',()=>{
  assert.match(art,/arrival_port: "\/art\/location\/context\/skeldra\/arrival_port\.png"/);
  const disk='public/art/location/context/skeldra/arrival_port.png';
  assert.equal(existsSync(disk),true,`${disk} missing`);
  assert.deepEqual(pngSize(disk),{width:2172,height:576});
});

test('town hub follows arrival art then dynamic settlement title role description read action and district links',()=>{
  const start=main.indexOf('function settlementHubTitle');
  const end=main.indexOf('function renderInstitution',start);
  const town=main.slice(start,end);
  assert.match(town,/major_capital_great_port.*Capital of/s);
  assert.match(town,/contextLocationHero\(portId,"arrival_port",title,\{subline:port\.role\}\)/);
  assert.match(town,/Read the Waterfront · 1h/);
  assert.match(town,/port\.description/);
  assert.match(town,/Places & districts/);
  assert.match(town,/arrivalActions/);
  assert.doesNotMatch(town,/sceneProps/);
});

test('settlement hub scrolls the art heading description and destination links as one inner surface',()=>{
  assert.match(main,/settlement-hub-screen"><div class="context-location-scroll">\$\{hero\}/);
  assert.match(css,/\.settlement-hub-screen\{[^}]*grid-template-rows:minmax\(0,1fr\)/s);
  assert.match(css,/\.settlement-hub-screen \.context-scene-frame\{aspect-ratio:2172\/576\}/);
  assert.match(css,/\.settlement-town-actions\{[^}]*grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/s);
});
