import { readFile, writeFile } from "node:fs/promises";

const replacements = [
  {
    path: "src/alpha/main.ts",
    edits: [
      {
        before: 'import { getWorldCell, GLOBAL_ATLAS, REGIONAL_MAP_LAYERS, SKELDRA_DEVELOPED_BOUNDS } from "../data/seed/worldMap.js";',
        after: 'import { getWorldCell, GLOBAL_ATLAS, REGIONAL_MAP_LAYERS, WORLD_DEVELOPED_BOUNDS } from "../data/seed/worldMap.js";',
        expected: 1
      },
      {
        before: 'for(let y=SKELDRA_DEVELOPED_BOUNDS.y;y<SKELDRA_DEVELOPED_BOUNDS.y+SKELDRA_DEVELOPED_BOUNDS.height;y+=1){for(let x=SKELDRA_DEVELOPED_BOUNDS.x;x<SKELDRA_DEVELOPED_BOUNDS.x+SKELDRA_DEVELOPED_BOUNDS.width;x+=1){',
        after: 'for(let y=WORLD_DEVELOPED_BOUNDS.y;y<WORLD_DEVELOPED_BOUNDS.y+WORLD_DEVELOPED_BOUNDS.height;y+=1){for(let x=WORLD_DEVELOPED_BOUNDS.x;x<WORLD_DEVELOPED_BOUNDS.x+WORLD_DEVELOPED_BOUNDS.width;x+=1){',
        expected: 2
      }
    ]
  },
  {
    path: "public/alpha/js/alpha/main.js",
    edits: [
      {
        before: 'import { getWorldCell, GLOBAL_ATLAS, REGIONAL_MAP_LAYERS, SKELDRA_DEVELOPED_BOUNDS } from "../data/seed/worldMap.js";',
        after: 'import { getWorldCell, GLOBAL_ATLAS, REGIONAL_MAP_LAYERS, WORLD_DEVELOPED_BOUNDS } from "../data/seed/worldMap.js";',
        expected: 1
      },
      {
        before: 'for (let y = SKELDRA_DEVELOPED_BOUNDS.y; y < SKELDRA_DEVELOPED_BOUNDS.y + SKELDRA_DEVELOPED_BOUNDS.height; y += 1) {',
        after: 'for (let y = WORLD_DEVELOPED_BOUNDS.y; y < WORLD_DEVELOPED_BOUNDS.y + WORLD_DEVELOPED_BOUNDS.height; y += 1) {',
        expected: 2
      },
      {
        before: 'for (let x = SKELDRA_DEVELOPED_BOUNDS.x; x < SKELDRA_DEVELOPED_BOUNDS.x + SKELDRA_DEVELOPED_BOUNDS.width; x += 1) {',
        after: 'for (let x = WORLD_DEVELOPED_BOUNDS.x; x < WORLD_DEVELOPED_BOUNDS.x + WORLD_DEVELOPED_BOUNDS.width; x += 1) {',
        expected: 2
      }
    ]
  }
];

let changedFiles = 0;
for (const target of replacements) {
  let source = await readFile(target.path, "utf8");
  let changed = false;

  for (const edit of target.edits) {
    const beforeCount = source.split(edit.before).length - 1;
    const afterCount = source.split(edit.after).length - 1;
    if (beforeCount === 0 && afterCount === edit.expected) continue;
    if (beforeCount + afterCount !== edit.expected) {
      throw new Error(`${target.path}: atlas edit registration drifted; expected ${edit.expected} total old/new matches, found ${beforeCount} old + ${afterCount} new`);
    }
    source = source.split(edit.before).join(edit.after);
    changed = true;
  }

  if (changed) {
    await writeFile(target.path, source);
    changedFiles += 1;
    console.log(`patched ${target.path}`);
  } else {
    console.log(`already patched ${target.path}`);
  }
}

console.log(`Atlas quality pass patch complete (${changedFiles} file${changedFiles === 1 ? "" : "s"} changed).`);
