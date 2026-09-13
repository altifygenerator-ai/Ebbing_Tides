import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT=path.resolve(import.meta.dirname,"..");
const read=(file)=>fs.readFileSync(path.join(ROOT,file),"utf8");
const main=read("src/alpha/main.ts");
const visuals=read("src/data/seed/shipCombatVisuals.ts");
const assets=read("src/data/seed/assets.ts");
const css=read("public/alpha/styles.css");

test("all canonical ship families are registered through the runtime asset table",()=>{
  assert.equal([...visuals.matchAll(/\{familyName:"/g)].length,33);
  assert.match(assets,/\.\.\.SHIP_COMBAT_ASSET_REGISTRY/);
  assert.match(main,/shipCombatAssetId\(playerVisualSet,playerVisualState\)/);
  assert.match(main,/shipCombatAssetId\(otherVisualSet,otherVisualState\)/);
});

test("logical headings compensate for the supplied masters' reversed bow labels",()=>{
  assert.match(visuals,/north:"south",east:"west",south:"north",west:"east"/);
  assert.match(main,/shipDirectionForRoute\(trail,ship\.position\)/);
  assert.match(main,/shipTokenAssetId\(playerVisualSet,"east"\)/);
  assert.match(main,/shipTokenAssetId\(otherVisualSet,"west"\)/);
});

test("combat tokens use one rectangular tactical lane without portrait circles",()=>{
  assert.match(main,/naval-tactical-lane/);
  assert.match(css,/\.naval-lane-token/);
  assert.doesNotMatch(main,/naval-facing-token/);
  assert.doesNotMatch(css,/naval-facing-token[^}]*border-radius:50%/);
  assert.match(css,/\.naval-ship-visual\.enemy img\{transform:none\}/);
});

test("victory and other terminal results wait for player acknowledgement",()=>{
  assert.match(main,/function renderNavalResolution/);
  assert.match(main,/phase==="resolved"\?renderNavalResolution\(state\):renderEncounter\(state\)/);
  const resolver=main.slice(main.indexOf("function resolveEncounterAndResume"),main.indexOf("function resetRuntimeForNewVoyage"));
  assert.doesNotMatch(resolver,/delete s\.encounter/);
  assert.match(main,/case "leave-naval-resolution": delete s\.encounter/);
  assert.match(main,/recorded once/);
});

test("accepted naval mechanics and sound routing survive the visual merge",()=>{
  const audio=read("src/alpha/audio.ts");
  const combat=read("src/game/combat.ts");
  for(const action of ["close","open","fire_hull","fire_rigging","repair","demand_surrender","grapple","flee"]){
    assert.ok(main.includes(`data-combat="${action}"`),`missing accepted combat action ${action}`);
  }
  assert.match(main,/action\.startsWith\("fire"\)\?"cannon":action==="repair"\?"repair":"ui"/);
  assert.match(main,/audio\.unlock\(\)\.then\(\(\) => audio\.play\(name\)\)/);
  assert.match(audio,/case "cannon"/);
  assert.match(audio,/case "repair"/);
  assert.match(combat,/navalCombatSpecializationFor/);
  assert.match(combat,/rangeYards/);
});

test("condition and range thresholds remain presentation-only",()=>{
  assert.match(visuals,/ratio<=\.20/);
  assert.match(visuals,/ratio<=\.50/);
  assert.match(visuals,/rangeYards<200/);
  assert.match(visuals,/rangeYards<500/);
  assert.match(visuals,/rangeYards<1000/);
  for(const band of ["range-long","range-medium","range-close","range-point-blank"])assert.ok(css.includes(band));
});
