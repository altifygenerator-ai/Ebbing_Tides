import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here=dirname(fileURLToPath(import.meta.url));
const root=join(here,'..');
const main=readFileSync(join(root,'src/alpha/main.ts'),'utf8');
const css=readFileSync(join(root,'public/alpha/styles.css'),'utf8');
const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));

function renderChartSource(){
  const start=main.indexOf('function renderChart');
  const end=main.indexOf('function renderEncounter',start);
  return main.slice(start,end);
}

test('fixed-game-shell behavior remains intact inside Alpha 0.6D core-recovery baseline',()=>{
  assert.match(pkg.version,/^(?:0\.6\.0-alpha\.d\.character1(?:a|b|c|d)|0\.6\.0-alpha\.d\.characterstruct(?:1|2|3)|0\.6\.0-alpha\.d\.rpg-r1(?:\.[12])?|0\.6\.0-alpha\.d\.a0-(?:1[abc]|2[abcd]|3(?:a|b[123]?|c))|0\.6\.0-alpha\.d\.r2)$/);
  assert.doesNotMatch(main,/Alpha 0\.6D Core Experience Recovery<\/div>/,'development milestone labels should not occupy the player top bar');
  const createGame=readFileSync(join(root,'src/game/createGame.ts'),'utf8');
  assert.match(createGame,/schemaVersion:\s*12/);
});

test('document scrolling is disabled and gameplay uses a fixed application viewport',()=>{
  assert.match(css,/html, body, #app \{[^}]*height:100%[^}]*overflow:hidden/s);
  assert.match(css,/\.shell \{[^}]*height:100dvh[^}]*overflow:hidden[^}]*grid-template-rows:56px minmax\(0,1fr\)/s);
  assert.match(css,/\.game-layout \{[^}]*height:100%[^}]*min-height:0[^}]*overflow:hidden/s);
  assert.match(css,/\.main \{[^}]*height:100%[^}]*overflow:hidden/s);
});

test('long content remains accessible through intentional internal panes rather than body scroll',()=>{
  assert.match(css,/\.port-content \{[^}]*overflow-y:auto/s);
  assert.match(css,/\.creation-body \{[^}]*overflow-y:auto/s);
  assert.match(css,/\.journal-layout > \.panel,[\s\S]*overflow-y:auto/);
  assert.match(css,/\.navigation-context-card \{[^}]*overflow-y:auto/s);
});

test('navigation is a fixed workspace plus voyage-first controls',()=>{
  const chart=renderChartSource();
  assert.match(chart,/class="navigation-screen map-v04"/);
  assert.match(chart,/class="navigation-workspace"/);
  assert.match(chart,/class="navigation-context-pane"/);
  assert.match(chart,/class="voyage-dock"/);
  assert.match(chart,/aria-label="Voyage controls"/);
  assert.doesNotMatch(chart,/data-action="advance-voyage"/);
  assert.match(chart,/data-action="continue-voyage"/);
  assert.match(chart,/data-action="search-waters"/);
  assert.match(chart,/data-action="begin-navigation"/);
  assert.match(chart,/data-action="map-zoom-step"/);
  assert.match(chart,/data-action="map-center"/);
  assert.doesNotMatch(chart,/data-action="map-pan"/);
  assert.doesNotMatch(chart,/class="map-side"/,'old below-the-map page layout must not return');
});

test('navigation chart stretches only inside its bounded workspace while preserving its coordinate viewBox',()=>{
  const chart=renderChartSource();
  assert.match(chart,/preserveAspectRatio="xMidYMid meet"/);
  assert.match(css,/\.navigation-map-pane \.chart\.chart-v04 \{[^}]*height:100%[^}]*aspect-ratio:auto/s);
  assert.match(css,/\.navigation-screen \{[^}]*grid-template-rows:minmax\(0,1fr\) auto/s);
  assert.match(css,/\.voyage-dock \{[^}]*border-top:/s);
});

test('portrait selection cannot expand the creation scrollport horizontally',()=>{
  assert.match(css,/\.creation-body \{[^}]*overflow-y:auto[^}]*overflow-x:hidden/s);
  assert.match(css,/\.creation-box \{[^}]*overflow:hidden/s);
  assert.match(css,/\.portrait-choice \{[^}]*position:relative[^}]*min-width:0/s);
  assert.match(css,/\.portrait-choice > input \{[^}]*position:absolute[^}]*left:8px[^}]*top:8px[^}]*width:1px[^}]*height:1px[^}]*clip-path:inset\(50%\)/s);
});

test('interaction reveals are bounded to intentional local scroll panes',()=>{
  assert.match(main,/function revealWithinLocalPane/);
  assert.match(main,/getComputedStyle\(pane\)\.overflowY/);
  assert.match(main,/pane\.scrollTo\(\{ top:/);
  assert.doesNotMatch(main,/scrollIntoView\(/,'whole-page scrollIntoView must not return to game interactions');
  assert.match(main,/data-action="crew-back"/);
  assert.doesNotMatch(main,/revealWithinLocalPane\("\.crew-inspector"/);
  assert.match(main,/revealWithinLocalPane\("#dialogue-panel", "center"\)/);
});

test('character creation panel has a fixed viewport height rather than a reflow-prone max-height only',()=>{
  assert.match(css,/\.creation-box \{[^}]*height:calc\(100dvh - 24px\)[^}]*max-height:calc\(100dvh - 24px\)/s);
  assert.match(css,/\.creation-body \{[^}]*overflow-y:auto[^}]*overflow-x:hidden/s);
});

test('portrait radio changes do not rerun gallery filtering',()=>{
  assert.match(main,/form\.addEventListener\("input",\(\)=>\{updateCounters\(\);updateReview\(\);\}\)/);
  assert.match(main,/\["sex","ancestry","age","homelandRegion","culture","religion","background","recentProfession"\]\.includes\(target\.name\)/);
  assert.match(main,/function renderCreation/);
  assert.doesNotMatch(main,/filterPortraits\(/,'hard-filter portrait routine must not return');
});
