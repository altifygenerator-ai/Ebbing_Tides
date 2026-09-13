import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT=path.resolve(import.meta.dirname,"..");
const read=(rel)=>fs.readFileSync(path.join(ROOT,rel),"utf8");
const main=read("src/alpha/main.ts");
const audio=read("src/alpha/audio.ts");
const visuals=read("src/data/seed/shipCombatVisuals.ts");
const css=read("public/alpha/naval-combat-polish.css");

test("naval polish preserves exact yards while adding four visual distance bands",()=>{
  assert.match(main,/const exactRange=.*e\.rangeYards/);
  assert.match(main,/combatVisualRangeBand\(e\.rangeYards,e\.shipsSecured\)/);
  for(const band of ["range-long","range-medium","range-close","range-point-blank"]) assert.ok(css.includes(band));
  assert.match(visuals,/rangeYards < 200/);
  assert.match(visuals,/rangeYards < 500/);
  assert.match(visuals,/rangeYards < 1000/);
});

test("ship condition presentation changes at 50 and 20 percent hull without changing combat math",()=>{
  assert.match(visuals,/ratio <= 0\.20/);
  assert.match(visuals,/ratio <= 0\.50/);
  assert.match(main,/state-\$\{playerVisual\.state\}/);
  assert.ok(css.includes("state-damaged"));
  assert.ok(css.includes("state-wrecked"));
});

test("all 33 canonical ship families have logical portrait token and wreck slots",()=>{
  const families=[...visuals.matchAll(/^\s*\{ familyName:/gm)].length;
  assert.equal(families,33);
  assert.equal(new Set([...visuals.matchAll(/^\s*\{ familyName: "([^"]+)"/gm)].map(m=>m[1])).size,33);
  assert.match(visuals,/intactAssetId/);
  assert.match(visuals,/tokenAssetIds/);
  assert.match(visuals,/wreckedAssetId/);
});

test("new ship tokens are preferred without destroying current-save fallbacks",()=>{
  assert.match(main,/preferredPlayerToken/);
  assert.match(main,/playerTokenFallback/);
  assert.doesNotMatch(main,/ship\.artAssetId=family\.intactAssetId/);
  assert.doesNotMatch(main,/ship\.tokenAssetId=family\.tokenAssetId/);
});

test("named ships and legacy runtime class names resolve to Work art identity slots",()=>{
  for(const name of ["tideworn","stormcrow","providence","ash gull","iron finch","freyra s grace","hearthward","widow s mercy","gilded knife"]) assert.ok(visuals.includes(name),name);
  for(const legacy of ["skeldran coastal sloop","skeldran modern battle frigate","skeldran armed merchant","refitted coastal raider"]) assert.ok(visuals.includes(legacy),legacy);
  assert.match(visuals,/namedFamily \?\?/);
  assert.match(visuals,/fall back to the runtime class/);
});

test("navigation chooses a real directional token from the clicked or active route",()=>{
  assert.match(main,/shipDirectionForRoute\(trail,ship\.position\)/);
  assert.match(main,/shipTokenAssetId\(playerVisualSet,playerDirection\)/);
  assert.match(visuals,/export function shipDirectionForRoute/);
  assert.match(visuals,/Math\.abs\(dx\) >= Math\.abs\(dy\)/);
  for(const direction of ["north","east","south","west"]){
    assert.match(visuals,new RegExp(`ship\\.family\\.\\$\\{key\\}\\.token\\.${direction}`));
  }
});

test("combat uses opposed east and west tactical tokens",()=>{
  assert.match(main,/combatShipVisual\(player,playerClass\?\.name,"east"\)/);
  assert.match(main,/combatShipVisual\(other,otherClass\?\.name,"west"\)/);
  assert.match(main,/naval-facing-token/);
  assert.ok(css.includes(".naval-facing-token"));
});

test("all runtime paintings and 128px directional tokens exist",()=>{
  const definitions=[...visuals.matchAll(/^\s*\{ familyName: "([^"]+)", key: "([^"]+)", folder: "([^"]+)"/gm)];
  assert.equal(definitions.length,33);
  for(const [,family,key,folder] of definitions){
    const base=path.join(ROOT,"public/art/ships/production1h/classes",folder,key);
    assert.ok(fs.existsSync(path.join(base,"portrait_pristine.webp")),`${family} pristine`);
    assert.ok(fs.existsSync(path.join(base,"portrait_wrecked.webp")),`${family} wrecked`);
    for(const direction of ["north","east","south","west"]){
      assert.ok(fs.existsSync(path.join(base,"tokens/128",`token_${direction}.png`)),`${family} ${direction}`);
    }
  }
});

test("naval audio is action-driven and has clean boarding and resolution states",()=>{
  assert.match(main,/fire_hull"\?"round_shot"/);
  assert.match(main,/fire_rigging"\?"chain_shot"/);
  assert.match(main,/action==="close"\|\|action==="open"\?"maneuver"/);
  assert.match(main,/beginBoardingCombat\(s\),"boarding_charge"/);
  assert.match(main,/personalCombat\.source === "boarding" \? "boarding_combat"/);
  for(const cue of ["round_shot_volley.ogg","chain_shot_volley.ogg","maneuver_crew_cue.ogg","boarding_charge_cue.ogg","boarding_melee_loop.ogg","naval_victory_cheer_sting.ogg","naval_defeat_explosion_sting.ogg"]) assert.ok(audio.includes(cue),cue);
});

test("naval presentation uses wood brass framing and remains responsive",()=>{
  assert.ok(css.includes("--et-naval-brass"));
  assert.ok(css.includes("--et-naval-wood"));
  assert.ok(css.includes(".naval-ship-visual"));
  assert.ok(css.includes("@media (max-width:1100px)"));
  assert.ok(css.includes("@media (max-width:820px)"));
  assert.ok(css.includes("prefers-reduced-motion"));
});

test("all prepared runtime naval audio files referenced by code exist in overlay",()=>{
  const refs=[...audio.matchAll(/path: "(\/audio\/combat\/naval\/[^"]+)"/g)].map(m=>m[1]);
  assert.ok(refs.length>=9);
  for(const ref of refs){
    const rel=`public${ref}`;
    assert.ok(fs.existsSync(path.join(ROOT,rel)),rel);
  }
});
