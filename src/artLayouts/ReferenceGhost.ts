const GHOST_SESSION_KEY = "ebbing-tides.reference-ghost";
const GHOST_OPACITY_KEY = "ebbing-tides.reference-ghost-opacity";

type GhostMode = "live" | "both" | "reference";

function escAttr(value: unknown): string {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

export function referenceGhostEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("referenceGhost") === "1") return true;
  if (params.get("referenceGhost") === "0") return false;
  return window.sessionStorage.getItem(GHOST_SESSION_KEY) === "1";
}

export function setReferenceGhostEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(GHOST_SESSION_KEY, enabled ? "1" : "0");
}

export function installReferenceGhostShortcut(onToggle: (enabled: boolean) => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  const handler = (event: KeyboardEvent) => {
    if (!(event.altKey && event.shiftKey && event.code === "KeyG")) return;
    event.preventDefault();
    const next = !referenceGhostEnabled();
    setReferenceGhostEnabled(next);
    onToggle(next);
  };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}

export function renderReferenceGhost(referencePath: string | undefined, label = "Approved reference"): string {
  if (!referencePath) return "";
  return `<div class="reference-ghost-layer" data-reference-ghost data-reference-path="${escAttr(referencePath)}"><img class="reference-ghost-image" src="${escAttr(referencePath)}" alt="" aria-hidden="true"><div class="reference-ghost-controls"><b>REFERENCE GHOST</b><span>${escAttr(label)}</span><label>Opacity <input data-reference-opacity type="range" min="0" max="100" step="1" value="50"></label><div class="reference-ghost-buttons"><button type="button" class="btn small" data-reference-mode="live">Live</button><button type="button" class="btn small" data-reference-mode="both">Both</button><button type="button" class="btn small" data-reference-mode="reference">Reference</button><button type="button" class="btn small" data-reference-blink>Blink</button></div></div></div>`;
}

let cleanupFns: Array<() => void> = [];

export function initializeReferenceGhosts(root: ParentNode = document): void {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];
  const enabled = referenceGhostEnabled();
  const storedOpacity = typeof window !== "undefined" ? Number(window.sessionStorage.getItem(GHOST_OPACITY_KEY) ?? 50) : 50;

  for (const ghost of Array.from(root.querySelectorAll<HTMLElement>("[data-reference-ghost]"))) {
    const surface = ghost.closest<HTMLElement>(".reference-ghost-surface, .art-screen-letterbox, .art-directed-canvas") ?? ghost.parentElement;
    const slider = ghost.querySelector<HTMLInputElement>("[data-reference-opacity]");
    const image = ghost.querySelector<HTMLImageElement>(".reference-ghost-image");
    const controls = ghost.querySelector<HTMLElement>(".reference-ghost-controls");
    let mode: GhostMode = "both";
    let blinkTimer: number | undefined;
    let blinkOn = true;

    const apply = () => {
      const on = referenceGhostEnabled();
      ghost.classList.toggle("enabled", on);
      if (!on) return;
      const opacity = Math.max(0, Math.min(100, Number(slider?.value ?? storedOpacity))) / 100;
      if (image) image.style.opacity = mode === "live" ? "0" : mode === "reference" ? "1" : String(opacity);
      if (surface) surface.classList.toggle("reference-only", mode === "reference");
      controls?.classList.toggle("active", on);
    };

    if (slider) {
      slider.value = String(storedOpacity);
      const input = () => {
        window.sessionStorage.setItem(GHOST_OPACITY_KEY, slider.value);
        apply();
      };
      slider.addEventListener("input", input);
      cleanupFns.push(() => slider.removeEventListener("input", input));
    }

    for (const button of Array.from(ghost.querySelectorAll<HTMLButtonElement>("[data-reference-mode]"))) {
      const click = () => {
        mode = (button.dataset.referenceMode ?? "both") as GhostMode;
        apply();
      };
      button.addEventListener("click", click);
      cleanupFns.push(() => button.removeEventListener("click", click));
    }

    const blink = ghost.querySelector<HTMLButtonElement>("[data-reference-blink]");
    if (blink) {
      const click = () => {
        if (blinkTimer !== undefined) {
          window.clearInterval(blinkTimer);
          blinkTimer = undefined;
          mode = "both";
          apply();
          blink.textContent = "Blink";
          return;
        }
        mode = "both";
        blinkOn = true;
        blink.textContent = "Stop Blink";
        blinkTimer = window.setInterval(() => {
          blinkOn = !blinkOn;
          if (image) image.style.opacity = blinkOn ? String(Math.max(0, Math.min(100, Number(slider?.value ?? storedOpacity))) / 100) : "0";
        }, 650);
      };
      blink.addEventListener("click", click);
      cleanupFns.push(() => {
        blink.removeEventListener("click", click);
        if (blinkTimer !== undefined) window.clearInterval(blinkTimer);
      });
    }

    apply();
  }
}
