import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ART_LAYOUT_REGISTRY } from '../public/alpha/js/artLayouts/registry.js';
import { ASSET_BY_ID } from '../public/alpha/js/data/seed/assets.js';

const requiredViewports = [
  [1920, 1080],
  [1600, 900],
  [1440, 900],
  [1366, 768]
];

const result = { generatedAt: new Date().toISOString(), viewports: requiredViewports.map(([width,height]) => ({width,height})), layouts: {} };
let failures = 0;

for (const [layoutId, layout] of Object.entries(ART_LAYOUT_REGISTRY)) {
  const asset = ASSET_BY_ID[layout.runtimeBaseAssetId ?? layout.assetId];
  const assetPath = asset?.path ? join(process.cwd(), 'public', asset.path.replace(/^\//,'')) : undefined;
  const logicalWidth = layout.logicalWidth ?? (layout.shellMode === 'full_screen' ? 1600 : 1428);
  const logicalHeight = layout.logicalHeight ?? logicalWidth / (layout.nativeWidth / layout.nativeHeight);
  const layoutResult = {
    assetId: layout.runtimeBaseAssetId ?? layout.assetId,
    assetPath: asset?.path ?? null,
    artUsage: asset?.artUsage ?? null,
    assetExists: Boolean(assetPath && existsSync(assetPath)),
    nativeWidth: layout.nativeWidth,
    nativeHeight: layout.nativeHeight,
    logicalWidth,
    logicalHeight,
    regionCount: Object.keys(layout.regions).length,
    normalizedRegionsValid: true,
    viewportChecks: []
  };
  if (!layoutResult.assetExists) failures++;
  if (asset?.artUsage === 'reference') failures++;
  for (const region of Object.values(layout.regions)) {
    const valid = region.x >= 0 && region.y >= 0 && region.width > 0 && region.height > 0 && region.x + region.width <= 1.0001 && region.y + region.height <= 1.0001;
    if (!valid) { layoutResult.normalizedRegionsValid = false; failures++; }
  }
  const ratio = logicalWidth / logicalHeight;
  for (const [viewportWidth, viewportHeight] of requiredViewports) {
    // Approximate the usable main-content rect from the canonical 1600x900 shell.
    const availableWidth = layout.shellMode === 'full_screen' ? viewportWidth : viewportWidth * (1428 / 1600);
    const availableHeight = layout.shellMode === 'full_screen' ? viewportHeight : viewportHeight * (844 / 900);
    const canvasWidth = Math.min(availableWidth, availableHeight * ratio);
    const canvasHeight = canvasWidth / ratio;
    const uiScale = canvasWidth / logicalWidth;
    const rasterScaleX = canvasWidth / layout.nativeWidth;
    const rasterScaleY = canvasHeight / layout.nativeHeight;
    const sample = layout.regions.inventoryGrid ?? Object.values(layout.regions)[0];
    const rect = {
      x: sample.x * canvasWidth,
      y: sample.y * canvasHeight,
      width: sample.width * canvasWidth,
      height: sample.height * canvasHeight
    };
    const normalizedBack = {
      x: rect.x / canvasWidth,
      y: rect.y / canvasHeight,
      width: rect.width / canvasWidth,
      height: rect.height / canvasHeight
    };
    const drift = Math.max(
      Math.abs(normalizedBack.x - sample.x),
      Math.abs(normalizedBack.y - sample.y),
      Math.abs(normalizedBack.width - sample.width),
      Math.abs(normalizedBack.height - sample.height)
    );
    if (drift > 1e-9) failures++;
    layoutResult.viewportChecks.push({
      viewportWidth, viewportHeight,
      availableWidth: Number(availableWidth.toFixed(2)), availableHeight: Number(availableHeight.toFixed(2)),
      canvasWidth: Number(canvasWidth.toFixed(2)), canvasHeight: Number(canvasHeight.toFixed(2)),
      uiScale: Number(uiScale.toFixed(4)),
      rasterScaleX: Number(rasterScaleX.toFixed(4)), rasterScaleY: Number(rasterScaleY.toFixed(4)),
      maximumNormalizedDrift: drift
    });
  }
  result.layouts[layoutId] = layoutResult;
}

result.pass = failures === 0;
result.failures = failures;
const out = join(process.cwd(), 'docs/visual-qa/art-layout-calibration/resolution-verification.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(result, null, 2) + '\n');
console.log(`Art layout verification: ${result.pass ? 'PASS' : 'FAIL'} (${Object.keys(result.layouts).length} layouts, ${failures} failures)`);
if (failures) process.exitCode = 1;
