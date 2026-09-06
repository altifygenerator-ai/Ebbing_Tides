function hash32(input) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < input.length; i += 1) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return h >>> 0;
}
export function deterministicUnit(seed, key) {
    let a = hash32(`${seed}::${key}`) >>> 0;
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export function rollInt(seed, key, min, max) {
    return min + Math.floor(deterministicUnit(seed, key) * (max - min + 1));
}
export function roll2d10(seed, key) {
    const a = rollInt(seed, `${key}:a`, 1, 10);
    const b = rollInt(seed, `${key}:b`, 1, 10);
    return { dice: [a, b], total: a + b };
}
export function pickWeighted(seed, key, options) {
    const total = options.reduce((sum, option) => sum + Math.max(0, option.weight), 0);
    if (total <= 0 || options.length === 0)
        throw new Error("Weighted pick requires positive weights");
    let target = deterministicUnit(seed, key) * total;
    for (const option of options) {
        target -= Math.max(0, option.weight);
        if (target <= 0)
            return option.value;
    }
    return options[options.length - 1].value;
}
//# sourceMappingURL=rng.js.map