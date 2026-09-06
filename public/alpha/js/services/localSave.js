const KEY = "ebbing-tides.alpha-0.1.save";
export function saveLocal(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
}
export function loadLocal() {
    const raw = localStorage.getItem(KEY);
    if (!raw)
        return undefined;
    const parsed = JSON.parse(raw);
    if (parsed.schemaVersion !== 1)
        throw new Error("Unsupported save schema version.");
    return parsed;
}
export function clearLocalSave() {
    localStorage.removeItem(KEY);
}
export function hasLocalSave() {
    return Boolean(localStorage.getItem(KEY));
}
//# sourceMappingURL=localSave.js.map