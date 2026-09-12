import { readFile, writeFile } from "node:fs/promises";

const replacements = [
  {
    path: "src/alpha/main.ts",
    edits: [
      [
        'import { getWorldCell, GLOBAL_ATLAS, REGIONAL_MAP_LAYERS, SKELDRA_DEVELOPED_BOUNDS } from "../data/seed/worldMap.js";',
        'import { getWorldCell, GLOBAL_ATLAS, REGIONAL_MAP_LAYERS, WORLD_DEVELOPED_BOUNDS } from "../data/seed/worldMap.js";'
      ],
      [
        'for(let y=SKELDRA_DEVELOPED_BOUNDS.y;y<SKELDRA_DEVELOPED_BOUNDS.y+SKELDRA_DEVELOPED_BOUNDS.height;y+=1){for(let x=SKELDRA_DEVELOPED_BOUNDS.x;x<SKELDRA_DEVELOPED_BOUNDS.x+SKELDRA_DEVELOPED_BOUNDS.width;x+=1){',
        'for(let y=WORLD_DEVELOPED_BOUNDS.y;y<WORLD_DEVELOPED_BOUNDS.y+WORLD_DEVELOPED_BOUNDS.height;y+=1){for(let x=WORLD_DEVELOPED_BOUNDS.x;x<WORLD_DEVELOPED_BOUNDS.x+WORLD_DEVELOPED_BOUNDS.width;x+=1){'
      ]
    ]
  },
  {
    path: "public/alpha/js/alpha/main.js",
    edits: [
      [
        'import { getWorldCell, GLOBAL_ATLAS, REGIONAL_MAP_LAYERS, SKELDRA_DEVELOPED_BOUNDS } from "../data/seed/worldMap.js";',
        'import { getWorldCell, GLOBAL_ATLAS, REGIONAL_MAP_LAYERS, WORLD_DEVELOPED_BOUNDS } from "../data/seed/worldMap.js";'
      ],
      [
        'for (let y = SKELDRA_DEVELOPED_BOUNDS.y; y < SKELDRA_DEVELOPED_BOUNDS.y + SKELDRA_DEVELOPED_BOUNDS.height; y += 1) {',
        'for (let y = WORLD_DEVELOPED_BOUNDS.y; y < WORLD_DEVELOPED_BOUNDS.y + WORLD_DEVELOPED_BOUNDS.height; y += 1) {'
      ],
      [
        'for (let x = SKELDRA_DEVELOPED_BOUNDS.x; x < SKELDRA_DEVELOPED_BOUNDS.x + SKELDRA_DEVELOPED_BOUNDS.width; x += 1) {',
        'for (let x = WORLD_DEVELOPED_BOUNDS.x; x < WORLD_DEVELOPED_BOUNDS.x + WORLD_DEVELOPED_BOUNDS.width; x += 1) {'
      ]
    ]
  }
];

let changedFiles = 0;
for (const target of replacements) {
  let source = await readFile(target.path, "utf8");
  let changed = false;

  for (const [before, after] of target.edits) {
    if (source.includes(after)) continue;
    const matches = source.split(before).length - 1;
    if (matches !== 1) {
      throw new Error(`${target.path}: expected exactly one atlas registration edit target, found ${matches}`);
    }
    source = source.replace(before, after);
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
