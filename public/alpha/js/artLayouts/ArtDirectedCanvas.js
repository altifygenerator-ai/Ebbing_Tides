const CALIBRATION_SESSION_KEY = "ebbing-tides.art-calibration";
function escAttr(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
export function normalizedRegionStyle(region) {
    return `left:${region.x * 100}%;top:${region.y * 100}%;width:${region.width * 100}%;height:${region.height * 100}%;`;
}
export function artCalibrationEnabled() {
    if (typeof window === "undefined")
        return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get("artCalibration") === "1")
        return true;
    if (params.get("artCalibration") === "0")
        return false;
    return window.sessionStorage.getItem(CALIBRATION_SESSION_KEY) === "1";
}
export function setArtCalibrationEnabled(enabled) {
    if (typeof window === "undefined")
        return;
    window.sessionStorage.setItem(CALIBRATION_SESSION_KEY, enabled ? "1" : "0");
}
export function installArtCalibrationShortcut(onToggle) {
    if (typeof window === "undefined")
        return () => undefined;
    const handler = (event) => {
        if (!(event.altKey && event.shiftKey && event.code === "KeyC"))
            return;
        event.preventDefault();
        const next = !artCalibrationEnabled();
        setArtCalibrationEnabled(next);
        onToggle(next);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
}
function debugRegionMarkup(region) {
    const anchor = region.anchor ?? { x: region.x + region.width / 2, y: region.y + region.height / 2 };
    return `<div class="art-calibration-region" style="${normalizedRegionStyle(region)}" data-art-region-id="${escAttr(region.id)}" data-x="${region.x}" data-y="${region.y}" data-width="${region.width}" data-height="${region.height}"><span class="art-calibration-region-label"><b>${escAttr(region.label ?? region.id)}</b><small>x ${region.x.toFixed(4)} · y ${region.y.toFixed(4)}</small><small>w ${region.width.toFixed(4)} · h ${region.height.toFixed(4)}</small><small>c ${anchor.x.toFixed(4)}, ${anchor.y.toFixed(4)}</small></span><span class="art-calibration-resize-handle" title="Shift-drag or drag this corner to resize"></span></div>`;
}
function layerMarkup(manifest, layer) {
    const region = manifest.regions[layer.regionId];
    if (!region)
        return "";
    const zIndex = layer.zIndex ?? 2;
    const pointerEvents = layer.pointerEvents ?? "auto";
    return `<div class="art-directed-region ${escAttr(layer.className ?? "")}" data-art-layer-region="${escAttr(layer.regionId)}" style="${normalizedRegionStyle(region)}z-index:${zIndex};pointer-events:${pointerEvents};">${layer.html}</div>`;
}
export function renderArtDirectedCanvas(options) {
    const { manifest, artPath, layers = [], debugMode = false, className = "", ariaLabel = "Art-directed game interface" } = options;
    const logicalWidth = manifest.logicalWidth ?? (manifest.shellMode === "full_screen" ? 1600 : 1428);
    const logicalHeight = manifest.logicalHeight ?? logicalWidth / (manifest.nativeWidth / manifest.nativeHeight);
    const layerHtml = layers.map((layer) => layerMarkup(manifest, layer)).join("");
    const debugHtml = debugMode
        ? `<div class="art-calibration-layer">${Object.values(manifest.regions).map(debugRegionMarkup).join("")}</div><div class="art-calibration-hud"><div><b>CALIBRATION MODE</b></div><div>Viewport: <span data-art-viewport>—</span></div><div>Main host: <span data-art-main-host>—</span></div><div>Art host: <span data-art-host>—</span></div><div>Canvas: <span data-art-canvas>—</span></div><div>Logical design: <span data-art-logical>${manifest.logicalWidth ?? (manifest.shellMode === "full_screen" ? 1600 : 1428)} × ${Math.round(manifest.logicalHeight ?? ((manifest.shellMode === "full_screen" ? 1600 : 1428) / (manifest.nativeWidth / manifest.nativeHeight)))}</span></div><div>Native art: <span data-art-native>${manifest.nativeWidth} × ${manifest.nativeHeight}</span></div><div>Rendered art: <span data-art-rendered>—</span></div><div>Render scale: <span data-art-scale>—</span></div><div>Letterbox x/y: <span data-art-letterbox>—</span></div><div>Cursor: <span data-art-cursor>—</span></div><div>Selected: <span data-art-selected>none</span></div><div data-art-dimension-status>Image dimensions pending</div><button type="button" class="btn small" data-art-copy-region>Copy Region Values</button></div>`
        : "";
    return `<div class="art-directed-canvas ${escAttr(className)} ${debugMode ? "is-calibrating" : ""}" role="group" aria-label="${escAttr(ariaLabel)}" data-art-layout-id="${escAttr(manifest.layoutId)}" data-art-native-width="${manifest.nativeWidth}" data-art-native-height="${manifest.nativeHeight}" data-art-logical-width="${logicalWidth}" data-art-logical-height="${logicalHeight}" data-art-debug="${debugMode ? "1" : "0"}" style="aspect-ratio:${logicalWidth}/${logicalHeight};"><img class="art-directed-base" src="${escAttr(artPath)}" alt="" aria-hidden="true" data-art-base-image>${layerHtml}${debugHtml}</div>`;
}
function readWorkingRegion(node) {
    return {
        id: node.dataset.artRegionId ?? "region",
        x: Number(node.dataset.x ?? 0),
        y: Number(node.dataset.y ?? 0),
        width: Number(node.dataset.width ?? 0),
        height: Number(node.dataset.height ?? 0)
    };
}
function applyWorkingRegion(node, region) {
    region.width = Math.max(0.005, Math.min(1 - region.x, region.width));
    region.height = Math.max(0.005, Math.min(1 - region.y, region.height));
    region.x = clamp01(Math.min(region.x, 1 - region.width));
    region.y = clamp01(Math.min(region.y, 1 - region.height));
    node.dataset.x = String(region.x);
    node.dataset.y = String(region.y);
    node.dataset.width = String(region.width);
    node.dataset.height = String(region.height);
    node.style.left = `${region.x * 100}%`;
    node.style.top = `${region.y * 100}%`;
    node.style.width = `${region.width * 100}%`;
    node.style.height = `${region.height * 100}%`;
    const label = node.querySelector(".art-calibration-region-label");
    if (label) {
        const centerX = region.x + region.width / 2;
        const centerY = region.y + region.height / 2;
        label.innerHTML = `<b>${escAttr(region.id)}</b><small>x ${region.x.toFixed(4)} · y ${region.y.toFixed(4)}</small><small>w ${region.width.toFixed(4)} · h ${region.height.toFixed(4)}</small><small>c ${centerX.toFixed(4)}, ${centerY.toFixed(4)}</small>`;
    }
}
function initializeCalibrationCanvas(canvas) {
    const nativeWidth = Number(canvas.dataset.artNativeWidth ?? 1);
    const nativeHeight = Number(canvas.dataset.artNativeHeight ?? 1);
    const logicalWidth = Number(canvas.dataset.artLogicalWidth ?? nativeWidth);
    const renderedNode = canvas.querySelector("[data-art-rendered]");
    const scaleNode = canvas.querySelector("[data-art-scale]");
    const cursorNode = canvas.querySelector("[data-art-cursor]");
    const selectedNode = canvas.querySelector("[data-art-selected]");
    const copyButton = canvas.querySelector("[data-art-copy-region]");
    const dimensionStatus = canvas.querySelector("[data-art-dimension-status]");
    const baseImage = canvas.querySelector("[data-art-base-image]");
    let selected;
    const updateSize = () => {
        const rect = canvas.getBoundingClientRect();
        if (renderedNode)
            renderedNode.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
        if (scaleNode)
            scaleNode.textContent = `${(rect.width / logicalWidth).toFixed(4)}x`;
    };
    updateSize();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateSize) : undefined;
    resizeObserver?.observe(canvas);
    const moveCursor = (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = clamp01((event.clientX - rect.left) / rect.width);
        const y = clamp01((event.clientY - rect.top) / rect.height);
        if (cursorNode)
            cursorNode.textContent = `x ${x.toFixed(4)} · y ${y.toFixed(4)}`;
    };
    canvas.addEventListener("pointermove", moveCursor);
    const regionNodes = Array.from(canvas.querySelectorAll(".art-calibration-region"));
    const cleanup = [];
    for (const node of regionNodes) {
        const down = (event) => {
            event.preventDefault();
            event.stopPropagation();
            selected?.classList.remove("selected");
            selected = node;
            node.classList.add("selected");
            if (selectedNode)
                selectedNode.textContent = node.dataset.artRegionId ?? "region";
            const startRect = canvas.getBoundingClientRect();
            const startX = event.clientX;
            const startY = event.clientY;
            const start = readWorkingRegion(node);
            const isResize = event.shiftKey || (event.target instanceof Element && event.target.classList.contains("art-calibration-resize-handle"));
            node.setPointerCapture(event.pointerId);
            const move = (moveEvent) => {
                const dx = (moveEvent.clientX - startX) / startRect.width;
                const dy = (moveEvent.clientY - startY) / startRect.height;
                const next = { ...start };
                if (isResize) {
                    next.width = start.width + dx;
                    next.height = start.height + dy;
                }
                else {
                    next.x = start.x + dx;
                    next.y = start.y + dy;
                }
                applyWorkingRegion(node, next);
            };
            const up = (upEvent) => {
                node.releasePointerCapture(upEvent.pointerId);
                node.removeEventListener("pointermove", move);
                node.removeEventListener("pointerup", up);
                node.removeEventListener("pointercancel", up);
            };
            node.addEventListener("pointermove", move);
            node.addEventListener("pointerup", up);
            node.addEventListener("pointercancel", up);
        };
        node.addEventListener("pointerdown", down);
        cleanup.push(() => node.removeEventListener("pointerdown", down));
    }
    const copy = async () => {
        if (!selected)
            return;
        const region = readWorkingRegion(selected);
        const text = JSON.stringify({ x: Number(region.x.toFixed(4)), y: Number(region.y.toFixed(4)), width: Number(region.width.toFixed(4)), height: Number(region.height.toFixed(4)) }, null, 2);
        try {
            await navigator.clipboard.writeText(text);
        }
        catch { /* Clipboard access can be unavailable in local dev contexts. */ }
    };
    copyButton?.addEventListener("click", copy);
    const validateDimensions = () => {
        if (!baseImage?.naturalWidth || !baseImage?.naturalHeight)
            return;
        const matches = baseImage.naturalWidth === nativeWidth && baseImage.naturalHeight === nativeHeight;
        if (dimensionStatus) {
            dimensionStatus.textContent = matches
                ? `Source image: ${baseImage.naturalWidth} × ${baseImage.naturalHeight} ✓`
                : `DIMENSION MISMATCH: ${baseImage.naturalWidth} × ${baseImage.naturalHeight}`;
            dimensionStatus.classList.toggle("art-dimension-error", !matches);
        }
        canvas.classList.toggle("art-dimension-mismatch", !matches);
        if (!matches)
            console.error(`[Ebbing Tides] Art layout ${canvas.dataset.artLayoutId ?? "unknown"} expected ${nativeWidth}×${nativeHeight} but loaded ${baseImage.naturalWidth}×${baseImage.naturalHeight}.`);
    };
    if (baseImage?.complete)
        validateDimensions();
    baseImage?.addEventListener("load", validateDimensions);
    return () => {
        resizeObserver?.disconnect();
        canvas.removeEventListener("pointermove", moveCursor);
        copyButton?.removeEventListener("click", copy);
        baseImage?.removeEventListener("load", validateDimensions);
        cleanup.forEach((fn) => fn());
    };
}
function validateProductionCanvas(canvas) {
    const nativeWidth = Number(canvas.dataset.artNativeWidth ?? 1);
    const nativeHeight = Number(canvas.dataset.artNativeHeight ?? 1);
    const baseImage = canvas.querySelector("[data-art-base-image]");
    const validate = () => {
        if (!baseImage?.naturalWidth || !baseImage?.naturalHeight)
            return;
        const matches = baseImage.naturalWidth === nativeWidth && baseImage.naturalHeight === nativeHeight;
        canvas.classList.toggle("art-dimension-mismatch", !matches);
        if (!matches)
            console.error(`[Ebbing Tides] Art layout ${canvas.dataset.artLayoutId ?? "unknown"} expected ${nativeWidth}×${nativeHeight} but loaded ${baseImage.naturalWidth}×${baseImage.naturalHeight}.`);
    };
    if (baseImage?.complete)
        validate();
    baseImage?.addEventListener("load", validate);
    return () => baseImage?.removeEventListener("load", validate);
}
let calibrationCleanups = [];
export function initializeArtDirectedCanvases(root = document) {
    calibrationCleanups.forEach((cleanup) => cleanup());
    calibrationCleanups = [];
    for (const canvas of Array.from(root.querySelectorAll(".art-directed-canvas"))) {
        calibrationCleanups.push(canvas.dataset.artDebug === "1" ? initializeCalibrationCanvas(canvas) : validateProductionCanvas(canvas));
    }
}
//# sourceMappingURL=ArtDirectedCanvas.js.map