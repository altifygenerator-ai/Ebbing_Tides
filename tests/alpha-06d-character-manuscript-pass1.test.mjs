import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=join(here,'..');
const main=readFileSync(join(root,'src/alpha/main.ts'),'utf8');
const architecture=readFileSync(join(root,'src/ui/screenArchitecture.ts'),'utf8');
const createGame=readFileSync(join(root,'src/game/createGame.ts'),'utf8');
const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));

function sourceSlice(startMarker,endMarker){
  const start=main.indexOf(startMarker); assert.notEqual(start,-1,`missing ${startMarker}`);
  const end=main.indexOf(endMarker,start+startMarker.length); assert.notEqual(end,-1,`missing ${endMarker}`);
  return main.slice(start,end);
}

test('character presentation reset advances package without changing save schema v12',()=>{
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.characterstruct(?:1|2|3)|0\.6\.0-alpha\.d\.rpg-r1(?:\.[12])?|0\.6\.0-alpha\.d\.a0-(?:1[abc]|2[abcd]|3(?:a|b[123]?|c))|0\.6\.0-alpha\.d\.r2)$/);
  assert.match(createGame,/schemaVersion:\s*12/);
});

test('useful Character/RPG Pass 1 functions survive the visual reset',()=>{
  const creator=sourceSlice('function creatorChoiceEffects','function renderCaptainSummary');
  assert.match(creator,/creatorChoiceEffects/);
  assert.match(creator,/creatorToolboxHtml/);
  assert.match(creator,/Core training/);
  assert.match(creator,/startingSkillContributions/);
  assert.match(creator,/No direct stat or ability modifiers/);
  assert.doesNotMatch(creator,/name=["']attunement/i);
  const captain=sourceSlice('function renderCaptainOverview','function renderCaptainGear');
  assert.match(captain,/Object\.entries\(captain\.reputation\)/);
  assert.match(captain,/Known Powers/);
  assert.match(captain,/People Who Know You/);
  assert.match(captain,/knownRelationshipRows\(s\)/);
  assert.match(captain,/activeWarrantCount/);
  assert.doesNotMatch(captain,/wantedLevel|letterOfMarque|smugglingHeat/);
});

test('named crew remains qualitative and does not expose private relationship internals',()=>{
  const crew=sourceSlice('function renderCrewInspector','function renderCrew');
  assert.match(crew,/Company Record/);
  assert.match(crew,/Current State/);
  assert.match(crew,/Specializations & Practices/);
  assert.match(crew,/relationshipStatus\(npc\)/);
  assert.doesNotMatch(crew,/relationshipToPlayer\.(trust|respect|fear|affection|suspicion|hatred|obligation)/);
});

test('character surfaces keep code-owned structure while Creator/Captain advance to purpose-painted frames',()=>{
  for(const id of ['character_creator','character_sheet','crew_roster','journal_intelligence']){
    assert.match(architecture,new RegExp(`screenId:"${id}"[\\s\\S]*?status:"development"[\\s\\S]*?migrationPriority:"high"`));
  }
  assert.match(architecture,/screenId:"character_creator"[\s\S]*?"locked structural layout":"code"[\s\S]*?"form layout":"code"[\s\S]*?"culture frame\/material art":"art"/);
  assert.match(architecture,/screenId:"character_sheet"[\s\S]*?"locked structural layout":"code"[\s\S]*?"standing rows":"code"[\s\S]*?"relationship rows":"code"[\s\S]*?"culture frame\/material art":"art"/);
  assert.match(architecture,/screenId:"crew_roster"[\s\S]*?"pre-art ledger structure":"code"[\s\S]*?"crew rows":"code"/);
  assert.match(architecture,/screenId:"journal_intelligence"[\s\S]*?"pre-art two-page structure":"code"[\s\S]*?"entries":"code"/);
});
