const MANIFEST_URL = "/alpha/atlas-lod-manifest.json";
const SVG_NS = "http://www.w3.org/2000/svg";
const activeControllers = new Set();
let scanFrame;

const manifestPromise = fetch(MANIFEST_URL, { cache: "no-cache" })
  .then((response) => {
    if (!response.ok) throw new Error(`Atlas LOD manifest ${response.status}`);
    return response.json();
  })
  .then(validateManifest)
  .catch((error) => {
    console.warn("[Ebbing Tides] Atlas LOD disabled:", error);
    return null;
  });

function validateManifest(manifest) {
  const bounds = manifest?.globalBounds;
  const levels = Array.isArray(manifest?.levels) ? manifest.levels : [];
  if (!bounds || bounds.width !== 120 || bounds.height !== 80) {
    throw new Error("atlas manifest registration must remain 120x80");
  }
  const active = levels.filter((level) => level.status === "active");
  if (!active.length) throw new Error("atlas manifest has no active level");
  if (!active.some((level) => level.id === manifest.fallbackLevelId)) {
    throw new Error("atlas manifest fallback level is not active");
  }
  return manifest;
}

function parseViewBox(svg) {
  const raw = svg.getAttribute("viewBox")?.trim().split(/\s+/).map(Number);
  if (!raw || raw.length !== 4 || raw.some((value) => !Number.isFinite(value))) return null;
  const [x, y, width, height] = raw;
  if (width <= 0 || height <= 0) return null;
  return { x, y, width, height };
}

function levelForViewport(manifest, svg, viewBox) {
  const active = manifest.levels
    .filter((level) => level.status === "active")
    .sort((a, b) => a.pixelWidth - b.pixelWidth);
  const cssWidth = Math.max(1, svg.getBoundingClientRect().width || svg.clientWidth || 1);
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const requiredAtlasPixels = cssWidth * dpr * (manifest.globalBounds.width / viewBox.width) * 1.08;
  const level = active.find((candidate) => candidate.pixelWidth >= requiredAtlasPixels) ?? active.at(-1);
  return { level, requiredAtlasPixels };
}

function intersectsRegistration(manifest, viewBox) {
  const b = manifest.globalBounds;
  return viewBox.x < b.x + b.width &&
    viewBox.x + viewBox.width > b.x &&
    viewBox.y < b.y + b.height &&
    viewBox.y + viewBox.height > b.y;
}

function tilePath(template, col, row) {
  return template.replaceAll("{col}", String(col)).replaceAll("{row}", String(row));
}

class AtlasLodController {
  constructor(svg, manifest) {
    this.svg = svg;
    this.manifest = manifest;
    this.baseImage = svg.querySelector("image.atlas-art");
    this.tileGroup = null;
    this.tileNodes = new Map();
    this.lastLevelId = "";
    this.viewObserver = new MutationObserver(() => this.schedule());
    this.viewObserver.observe(svg, { attributes: true, attributeFilter: ["viewBox"] });
    this.schedule();
  }

  destroy() {
    this.viewObserver.disconnect();
    if (this.frame) cancelAnimationFrame(this.frame);
    this.tileGroup?.remove();
    this.tileNodes.clear();
  }

  schedule() {
    if (this.frame) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.update();
    });
  }

  update() {
    if (!this.svg.isConnected || !this.baseImage) return;
    const viewBox = parseViewBox(this.svg);
    if (!viewBox || !intersectsRegistration(this.manifest, viewBox)) return;

    const { level, requiredAtlasPixels } = levelForViewport(this.manifest, this.svg, viewBox);
    if (!level) return;

    this.svg.dataset.atlasLodLevel = level.id;
    this.svg.dataset.atlasLodRequiredPixels = String(Math.round(requiredAtlasPixels));
    this.svg.dataset.atlasLodSourcePixels = String(level.pixelWidth);

    if (level.kind === "tiles") {
      this.applyTiles(level, viewBox);
    } else {
      this.applySingle(level);
    }
    this.lastLevelId = level.id;
  }

  fallbackLevel() {
    return this.manifest.levels.find((level) => level.id === this.manifest.fallbackLevelId);
  }

  applySingle(level) {
    this.clearTiles();
    const currentHref = this.baseImage.getAttribute("href");
    if (currentHref !== level.path) this.baseImage.setAttribute("href", level.path);
  }

  ensureTileGroup() {
    if (this.tileGroup?.isConnected) return this.tileGroup;
    const group = document.createElementNS(SVG_NS, "g");
    group.setAttribute("class", "atlas-lod-tiles");
    group.setAttribute("pointer-events", "none");
    group.setAttribute("aria-hidden", "true");
    this.baseImage.insertAdjacentElement("afterend", group);
    this.tileGroup = group;
    return group;
  }

  applyTiles(level, viewBox) {
    const fallback = this.fallbackLevel();
    if (fallback?.path && this.baseImage.getAttribute("href") !== fallback.path) {
      this.baseImage.setAttribute("href", fallback.path);
    }

    const group = this.ensureTileGroup();
    group.dataset.atlasLodLevel = level.id;

    const bounds = this.manifest.globalBounds;
    const tileW = level.tileWorldWidth;
    const tileH = level.tileWorldHeight;
    if (!tileW || !tileH || !level.columns || !level.rows || !level.pathTemplate) {
      console.warn("[Ebbing Tides] Invalid tiled atlas level:", level.id);
      this.clearTiles();
      return;
    }

    const overscan = 1;
    const minCol = Math.max(0, Math.floor((viewBox.x - bounds.x) / tileW) - overscan);
    const maxCol = Math.min(level.columns - 1, Math.floor((viewBox.x + viewBox.width - bounds.x) / tileW) + overscan);
    const minRow = Math.max(0, Math.floor((viewBox.y - bounds.y) / tileH) - overscan);
    const maxRow = Math.min(level.rows - 1, Math.floor((viewBox.y + viewBox.height - bounds.y) / tileH) + overscan);

    const wanted = new Set();
    for (let row = minRow; row <= maxRow; row += 1) {
      for (let col = minCol; col <= maxCol; col += 1) {
        const key = `${col},${row}`;
        wanted.add(key);
        if (this.tileNodes.has(key)) continue;

        const x = bounds.x + col * tileW;
        const y = bounds.y + row * tileH;
        const width = Math.min(tileW, bounds.x + bounds.width - x);
        const height = Math.min(tileH, bounds.y + bounds.height - y);
        const image = document.createElementNS(SVG_NS, "image");

        image.setAttribute("class", "atlas-lod-tile");
        image.setAttribute("data-atlas-tile", key);
        image.setAttribute("x", String(x));
        image.setAttribute("y", String(y));
        image.setAttribute("width", String(width));
        image.setAttribute("height", String(height));
        image.setAttribute("preserveAspectRatio", "none");
        image.setAttribute("href", tilePath(level.pathTemplate, col, row));
        image.addEventListener("error", () => {
          image.remove();
          this.tileNodes.delete(key);
        }, { once: true });

        group.append(image);
        this.tileNodes.set(key, image);
      }
    }

    for (const [key, node] of this.tileNodes) {
      if (wanted.has(key)) continue;
      node.remove();
      this.tileNodes.delete(key);
    }
  }

  clearTiles() {
    this.tileGroup?.remove();
    this.tileGroup = null;
    this.tileNodes.clear();
  }
}

function cleanupControllers() {
  for (const controller of activeControllers) {
    if (controller.svg.isConnected) continue;
    controller.destroy();
    activeControllers.delete(controller);
  }
}

async function scanCharts() {
  scanFrame = 0;
  const manifest = await manifestPromise;
  if (!manifest) return;
  cleanupControllers();

  document.querySelectorAll("svg.chart-v04").forEach((svg) => {
    if (svg.dataset.atlasLodBound === "true") return;
    if (!svg.querySelector("image.atlas-art")) return;
    svg.dataset.atlasLodBound = "true";
    const controller = new AtlasLodController(svg, manifest);
    activeControllers.add(controller);
  });
}

function scheduleScan() {
  if (scanFrame) return;
  scanFrame = requestAnimationFrame(scanCharts);
}

new MutationObserver(scheduleScan).observe(document.documentElement, { childList: true, subtree: true });
window.addEventListener("resize", () => {
  for (const controller of activeControllers) controller.schedule();
}, { passive: true });

window.EbbingTidesAtlasLod = {
  refresh() {
    for (const controller of activeControllers) controller.schedule();
    scheduleScan();
  },
  manifest: () => manifestPromise
};

scheduleScan();
