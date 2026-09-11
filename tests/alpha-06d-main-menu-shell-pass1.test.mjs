import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const html=readFileSync(new URL('../public/alpha/index.html',import.meta.url),'utf8');
const menu=readFileSync(new URL('../src/alpha/startMenu.ts',import.meta.url),'utf8');
const main=readFileSync(new URL('../src/alpha/main.ts',import.meta.url),'utf8');
const css=readFileSync(new URL('../public/alpha/start-menu.css',import.meta.url),'utf8');

test('main menu shell loads beside, not instead of, the established alpha runtime',()=>{
  assert.match(html,/\/alpha\/js\/alpha\/main\.js/);
  assert.match(html,/\/alpha\/js\/alpha\/startMenu\.js/);
  assert.match(html,/\/alpha\/start-menu\.css/);
});

test('main menu uses the explicit runtime launch bridge and never imports gameplay owners',()=>{
  assert.match(menu,/ebbing-tides:runtime-ready/);
  assert.match(menu,/ebbing-tides:launch-request/);
  assert.match(menu,/ebbing-tides:launch-result/);
  assert.doesNotMatch(menu,/\[data-action="continue-save"\]/);
  assert.doesNotMatch(menu,/from "\.\.\/game\//);
  assert.doesNotMatch(menu,/^import .*\.\.\/game\//m);
  assert.doesNotMatch(menu,/\b(loadLocal|saveLocal|createGame|advanceWorld)\s*\(/);
});

test('supplied Sea Wind theme and fallback are present',()=>{
  assert.ok(existsSync(new URL('../public/audio/menu/ebbing_tides_main_menu_sea_wind_v1.ogg',import.meta.url)));
  assert.ok(existsSync(new URL('../public/audio/menu/ebbing_tides_main_menu_sea_wind_v1.mp3',import.meta.url)));
  assert.match(menu,/ebbing_tides_main_menu_sea_wind_v1\.ogg/);
  assert.match(menu,/ebbing_tides_main_menu_sea_wind_v1\.mp3/);
});

test('menu uses existing Veyrholm environment art and respects reduced motion',()=>{
  assert.match(css,/\/art\/location\/ports\/veyrholm\.png/);
  assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
  assert.match(menu,/reducedMotion/);
});

test('New Voyage waits for explicit runtime readiness and receives a launch result before the menu closes',()=>{
  assert.match(menu,/runtimeReady/);
  assert.match(menu,/launchRequestId/);
  assert.match(menu,/new CustomEvent\(LAUNCHER_REQUEST_EVENT/);
  assert.match(menu,/detail\.requestId!==launchRequestId/);
  assert.match(menu,/closeMenuAfterSuccessfulLaunch\(detail\.mode\)/);
  assert.match(menu,/root\.remove\(\)/);
  assert.doesNotMatch(menu,/new MutationObserver/);
  assert.doesNotMatch(menu,/\[data-action="new-game"\]/);
  assert.doesNotMatch(menu,/state\s*=\s*undefined/);
});

test('established alpha runtime owns both launch transitions through the same creator/save functions',()=>{
  assert.match(main,/window\.addEventListener\(LAUNCHER_REQUEST_EVENT/);
  assert.match(main,/resetRuntimeForNewVoyage\(\)/);
  assert.match(main,/continueLocalCampaign\(\)/);
  assert.match(main,/respondToLauncher\(detail,true,"Character Creator ready\."\)/);
  assert.match(main,/publishLauncherReadiness\(\)/);
  assert.ok(main.lastIndexOf('renderCreation();') < main.lastIndexOf('publishLauncherReadiness();'));
});
