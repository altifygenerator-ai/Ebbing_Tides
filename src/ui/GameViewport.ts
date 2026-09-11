export const LOGICAL_GAME_VIEWPORT = { width: 1600, height: 900 } as const;
export const LOGICAL_MAIN_CONTENT = { width: 1428, height: 844 } as const;

let cleanupFns: Array<() => void> = [];

function setScale(node: HTMLElement, width: number, height: number, logicalWidth: number, logicalHeight: number): void {
  const scale = Math.min(width / logicalWidth, height / logicalHeight);
  node.style.setProperty("--ui-scale", String(scale));
  node.style.setProperty("--ui-available-width", `${width}px`);
  node.style.setProperty("--ui-available-height", `${height}px`);
  node.dataset.uiScale = String(scale);
}

export function initializeGameViewport(root: ParentNode = document): void {
  cleanupFns.forEach((fn) => fn());
  cleanupFns = [];

  const shell = root.querySelector<HTMLElement>(".shell");
  const main = root.querySelector<HTMLElement>(".main");
  const creation = root.querySelector<HTMLElement>(".creation.creator-screen");

  const targets: Array<{ node: HTMLElement; logicalWidth: number; logicalHeight: number }> = [];
  if (shell) targets.push({ node: shell, logicalWidth: LOGICAL_GAME_VIEWPORT.width, logicalHeight: LOGICAL_GAME_VIEWPORT.height });
  if (main) targets.push({ node: main, logicalWidth: LOGICAL_MAIN_CONTENT.width, logicalHeight: LOGICAL_MAIN_CONTENT.height });
  if (creation) targets.push({ node: creation, logicalWidth: LOGICAL_GAME_VIEWPORT.width, logicalHeight: LOGICAL_GAME_VIEWPORT.height });

  for (const target of targets) {
    const update = () => {
      const rect = target.node.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) setScale(target.node, rect.width, rect.height, target.logicalWidth, target.logicalHeight);
    };
    update();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : undefined;
    observer?.observe(target.node);
    window.addEventListener("resize", update);
    cleanupFns.push(() => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    });
  }
}
