// Static regression audit for restored naval combat audio routing.
import fs from "node:fs";
import assert from "node:assert/strict";

const main = fs.readFileSync(new URL("../src/alpha/main.ts", import.meta.url), "utf8");
const audio = fs.readFileSync(new URL("../src/alpha/audio.ts", import.meta.url), "utf8");

for (const marker of [
  'cue("cannon_round")',
  'cue("cannon_chain")',
  'cueAfter("enemy_cannon"',
  'cueAfter("hull_impact"',
  'cueAfter("rigging_impact"',
  'cue("grapple")',
  '"boarding"',
  '"surrender"',
  '"naval_victory"',
  '"naval_defeat"'
]) assert.ok(main.includes(marker) || audio.includes(marker), `missing audio marker: ${marker}`);

assert.ok(main.includes("VOYAGE_AUTOMATION_TWEEN_TARGET_MS=3000"), "navigation v3.4 timing was lost");
assert.ok(main.includes("shipCombatVisualSet"), "Production 1H.2 combat visual routing was lost");
assert.ok(main.includes("leave-naval-resolution"), "naval resolution screen flow was lost");

console.log("naval combat audio static audit passed");
