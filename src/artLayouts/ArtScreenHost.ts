import { renderArtDirectedCanvas } from "./ArtDirectedCanvas.js";
import { renderReferenceGhost } from "./ReferenceGhost.js";
import type { ArtScreenHostOptions } from "./types.js";

function escAttr(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderArtScreenHost(options: ArtScreenHostOptions): string {
  const { manifest, hostClassName = "", screenId = manifest.layoutId, referenceArtPath, referenceLabel, ...canvasOptions } = options;
  const scroll = manifest.screenScroll ?? "none";
  const shellMode = manifest.shellMode ?? "main_content";
  const logicalWidth = manifest.logicalWidth ?? (shellMode === "full_screen" ? 1600 : 1428);
  const logicalHeight = manifest.logicalHeight ?? logicalWidth / (manifest.nativeWidth / manifest.nativeHeight);
  return `<div class="art-screen-host ${escAttr(hostClassName)}" data-art-screen-host data-art-layout-id="${escAttr(manifest.layoutId)}" data-art-screen-id="${escAttr(screenId)}" data-art-native-width="${manifest.nativeWidth}" data-art-native-height="${manifest.nativeHeight}" data-art-logical-width="${logicalWidth}" data-art-logical-height="${logicalHeight}" data-art-screen-scroll="${scroll}" data-art-shell-mode="${shellMode}"><div class="art-screen-letterbox reference-ghost-surface">${renderArtDirectedCanvas({ ...canvasOptions, manifest })}${renderReferenceGhost(referenceArtPath, referenceLabel)}</div></div>`;
}

function numberText(value: number): string {
  return Number.isFinite(value) ? String(Math.round(value)) : "—";
}

function updateCalibrationHud(host: HTMLElement, canvas: HTMLElement, width: number, height: number, left: number, top: number): void {
  const viewportNode = canvas.querySelector<HTMLElement>("[data-art-viewport]");
  const mainNode = canvas.querySelector<HTMLElement>("[data-art-main-host]");
  const hostNode = canvas.querySelector<HTMLElement>("[data-art-host]");
  const canvasNode = canvas.querySelector<HTMLElement>("[data-art-canvas]");
  const letterboxNode = canvas.querySelector<HTMLElement>("[data-art-letterbox]");
  const main = host.closest<HTMLElement>(".main") ?? host.parentElement;
  const mainRect = main?.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();
  if (viewportNode) viewportNode.textContent = `${window.innerWidth} × ${window.innerHeight}`;
  if (mainNode) mainNode.textContent = mainRect ? `${numberText(mainRect.width)} × ${numberText(mainRect.height)}` : "—";
  if (hostNode) hostNode.textContent = `${numberText(hostRect.width)} × ${numberText(hostRect.height)}`;
  if (canvasNode) canvasNode.textContent = `${numberText(width)} × ${numberText(height)}`;
  if (letterboxNode) letterboxNode.textContent = `${numberText(left)} / ${numberText(top)}`;
}

function fitHost(host: HTMLElement): void {
  const canvas = host.querySelector<HTMLElement>(".art-directed-canvas");
  const letterbox = host.querySelector<HTMLElement>(".art-screen-letterbox");
  if (!canvas || !letterbox) return;
  const nativeWidth = Number(host.dataset.artNativeWidth ?? 1);
  const nativeHeight = Number(host.dataset.artNativeHeight ?? 1);
  const logicalWidth = Number(host.dataset.artLogicalWidth ?? nativeWidth);
  const logicalHeight = Number(host.dataset.artLogicalHeight ?? nativeHeight);
  if (!(nativeWidth > 0 && nativeHeight > 0 && logicalWidth > 0 && logicalHeight > 0)) return;

  const hostWidth = host.clientWidth;
  const hostHeight = host.clientHeight;
  if (!(hostWidth > 0 && hostHeight > 0)) return;

  const ratio = logicalWidth / logicalHeight;
  const renderWidth = Math.min(hostWidth, hostHeight * ratio);
  const renderHeight = renderWidth / ratio;
  const left = Math.max(0, (hostWidth - renderWidth) / 2);
  const top = Math.max(0, (hostHeight - renderHeight) / 2);
  const scale = renderWidth / logicalWidth;

  letterbox.style.width = `${renderWidth}px`;
  letterbox.style.height = `${renderHeight}px`;
  letterbox.style.left = `${left}px`;
  letterbox.style.top = `${top}px`;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.setProperty("--art-scale", String(scale));
  canvas.style.setProperty("--ui-scale", String(scale));
  canvas.style.setProperty("--art-render-width", `${renderWidth}px`);
  canvas.style.setProperty("--art-render-height", `${renderHeight}px`);
  canvas.style.setProperty("--art-letterbox-x", `${left}px`);
  canvas.style.setProperty("--art-letterbox-y", `${top}px`);
  canvas.dataset.artRenderedWidth = String(renderWidth);
  canvas.dataset.artRenderedHeight = String(renderHeight);

  updateCalibrationHud(host, canvas, renderWidth, renderHeight, left, top);
}

let hostCleanups: Array<() => void> = [];

export function initializeArtScreenHosts(root: ParentNode = document): void {
  hostCleanups.forEach((cleanup) => cleanup());
  hostCleanups = [];
  for (const host of Array.from(root.querySelectorAll<HTMLElement>("[data-art-screen-host]"))) {
    const update = () => fitHost(host);
    update();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : undefined;
    observer?.observe(host);
    window.addEventListener("resize", update);
    hostCleanups.push(() => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    });
  }
}
