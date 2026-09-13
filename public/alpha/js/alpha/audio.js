const EXTERNAL_SCENES = new Set([
    "veyrholm_market",
    "veyrholm_tavern",
    "veyrholm_street",
    "ironhaven",
    "sea_calm",
    "sea_coastal",
    "sea_rough",
    "sea_storm"
]);
const SCENE_BEDS = {
    veyrholm_market: { path: "/audio/locations/veyrholm_market_layered_prototype.ogg", gain: 0.52 },
    veyrholm_tavern: { path: "/audio/locations/veyrholm_tavern_layered_prototype.ogg", gain: 0.58 },
    veyrholm_street: { path: "/audio/locations/veyrholm_town_street_layered_prototype.ogg", gain: 0.48 },
    ironhaven: { path: "/audio/locations/ironhaven_shipyard_harbor_layered_prototype.ogg", gain: 0.52 },
    sea_calm: { path: "/audio/navigation/nav_calm_open_sea_v1.ogg", gain: 0.44 },
    sea_coastal: { path: "/audio/navigation/nav_coastal_near_port_v1.ogg", gain: 0.46 },
    sea_rough: { path: "/audio/navigation/nav_rough_sea_v1.ogg", gain: 0.48 },
    sea_storm: { path: "/audio/navigation/nav_storm_heavy_weather_v1.ogg", gain: 0.5 }
};
const OCEAN_OVERLAYS = {
    calm: [
        { path: "/audio/navigation/navigation_music_ocean_balanced_v1.ogg", gain: 0.24 },
        { path: "/audio/navigation/navigation_music_ocean_ambience_forward_v1.ogg", gain: 0.22 }
    ],
    rough: [
        { path: "/audio/navigation/navigation_music_ocean_ambience_forward_v1.ogg", gain: 0.2 },
        { path: "/audio/navigation/navigation_music_ocean_balanced_v1.ogg", gain: 0.18 }
    ]
};
function clamp01(value) {
    return Math.max(0, Math.min(1, value));
}
function fadeAudioElement(audio, to, durationMs, onDone) {
    if (!audio) {
        onDone?.();
        return;
    }
    const from = Number.isFinite(audio.volume) ? audio.volume : 0;
    const start = performance.now();
    const tick = (now) => {
        const t = clamp01((now - start) / durationMs);
        audio.volume = from + (to - from) * t;
        if (t < 1)
            requestAnimationFrame(tick);
        else
            onDone?.();
    };
    requestAnimationFrame(tick);
}
export class AlphaAudio {
    ctx;
    gain;
    noise;
    scene = "silent";
    enabled = true;
    master = 0.75;
    unlocked = false;
    bed;
    overlay;
    overlayTimer;
    sceneToken = 0;
    ensure() {
        if (!this.ctx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AC();
            this.gain = this.ctx.createGain();
            this.gain.gain.value = this.master;
            this.gain.connect(this.ctx.destination);
        }
        return this.ctx;
    }
    configure(enabled, master) {
        this.enabled = enabled;
        this.master = master;
        if (this.gain)
            this.gain.gain.value = enabled ? master : 0;
        if (!enabled) {
            this.stopSceneAudio();
            return;
        }
        this.refreshSceneVolumes();
        if (this.unlocked)
            this.startScene();
    }
    async unlock() {
        this.ensure();
        if (this.ctx?.state === "suspended")
            await this.ctx.resume();
        this.unlocked = true;
        if (this.enabled)
            this.startScene();
    }
    setScene(scene) {
        if (this.scene === scene)
            return;
        this.scene = scene;
        if (this.unlocked && this.enabled)
            this.startScene();
        else if (!this.enabled)
            this.stopSceneAudio();
    }
    play(cue) {
        if (!this.enabled || !this.unlocked)
            return;
        const ctx = this.ensure();
        const out = this.gain;
        const baseNow = ctx.currentTime;
        const tone = (f0, f1, d = 0.1, type = "sine", amp = 0.12, offset = 0) => {
            const start = Math.max(ctx.currentTime, baseNow + offset);
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = type;
            o.frequency.setValueAtTime(Math.max(20, f0), start);
            o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), start + d);
            g.gain.setValueAtTime(0.0001, start);
            g.gain.exponentialRampToValueAtTime(Math.max(0.0001, amp * this.master), start + Math.min(0.012, d * 0.2));
            g.gain.exponentialRampToValueAtTime(0.0001, start + d);
            o.connect(g).connect(out);
            o.start(start);
            o.stop(start + d + 0.03);
        };
        const noiseBurst = (d = 0.12, hp = 800, amp = 0.08, offset = 0, lowpass) => {
            const start = Math.max(ctx.currentTime, baseNow + offset);
            const src = ctx.createBufferSource();
            src.buffer = this.noiseBuf(ctx);
            let node = src;
            const high = ctx.createBiquadFilter();
            high.type = "highpass";
            high.frequency.value = hp;
            node.connect(high);
            node = high;
            if (lowpass !== undefined) {
                const low = ctx.createBiquadFilter();
                low.type = "lowpass";
                low.frequency.value = lowpass;
                node.connect(low);
                node = low;
            }
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.0001, start);
            g.gain.exponentialRampToValueAtTime(Math.max(0.0001, amp * this.master), start + Math.min(0.01, d * 0.18));
            g.gain.exponentialRampToValueAtTime(0.0001, start + d);
            node.connect(g).connect(out);
            src.start(start);
            src.stop(start + d + 0.03);
        };
        switch (cue) {
            case "click":
                tone(620, 420, 0.06, "triangle", 0.08);
                break;
            case "coin":
                tone(1200, 1600, 0.12, "sine", 0.10);
                break;
            case "sail":
                noiseBurst(0.18, 500, 0.05);
                tone(220, 180, 0.18, "sawtooth", 0.06);
                break;
            case "cannon":
            case "cannon_round":
                noiseBurst(0.34, 45, 0.24, 0, 1150);
                noiseBurst(0.16, 700, 0.10, 0.018, 5200);
                tone(82, 34, 0.48, "sine", 0.20);
                tone(46, 28, 0.62, "triangle", 0.08, 0.035);
                break;
            case "cannon_chain":
                noiseBurst(0.27, 70, 0.18, 0, 1700);
                tone(92, 42, 0.31, "sine", 0.13);
                noiseBurst(0.19, 1450, 0.12, 0.045, 7200);
                tone(980, 310, 0.17, "sawtooth", 0.055, 0.055);
                tone(1320, 520, 0.12, "triangle", 0.04, 0.13);
                break;
            case "enemy_cannon":
                noiseBurst(0.31, 50, 0.15, 0, 1050);
                tone(68, 31, 0.46, "sine", 0.13);
                noiseBurst(0.12, 850, 0.055, 0.035, 4600);
                break;
            case "naval_maneuver":
                noiseBurst(0.34, 260, 0.045, 0, 1700);
                tone(170, 108, 0.36, "triangle", 0.045);
                tone(92, 72, 0.43, "sawtooth", 0.024, 0.07);
                noiseBurst(0.08, 1250, 0.022, 0.18, 4200);
                break;
            case "hull_impact":
                noiseBurst(0.22, 95, 0.13, 0, 1900);
                noiseBurst(0.13, 1150, 0.08, 0.018, 6200);
                tone(170, 62, 0.22, "square", 0.09);
                tone(74, 42, 0.32, "triangle", 0.05, 0.03);
                break;
            case "rigging_impact":
                noiseBurst(0.14, 1200, 0.095, 0, 7600);
                tone(1180, 360, 0.14, "sawtooth", 0.05);
                noiseBurst(0.10, 2200, 0.055, 0.08, 8800);
                tone(760, 250, 0.16, "triangle", 0.035, 0.09);
                break;
            case "grapple":
                tone(360, 125, 0.16, "square", 0.07);
                noiseBurst(0.09, 650, 0.06, 0.015, 3300);
                tone(290, 110, 0.14, "square", 0.055, 0.12);
                noiseBurst(0.10, 500, 0.05, 0.14, 2800);
                break;
            case "boarding":
                noiseBurst(0.18, 430, 0.08, 0, 3400);
                tone(940, 420, 0.10, "sawtooth", 0.045, 0.02);
                tone(720, 280, 0.09, "square", 0.04, 0.11);
                noiseBurst(0.12, 1300, 0.05, 0.13, 6200);
                tone(510, 190, 0.11, "triangle", 0.04, 0.20);
                break;
            case "surrender":
                tone(760, 610, 0.34, "sine", 0.075);
                tone(1140, 920, 0.30, "sine", 0.045, 0.04);
                tone(620, 520, 0.36, "triangle", 0.04, 0.31);
                break;
            case "naval_victory":
                tone(220, 330, 0.34, "triangle", 0.055);
                tone(330, 440, 0.36, "triangle", 0.06, 0.24);
                tone(440, 660, 0.48, "sine", 0.075, 0.50);
                tone(880, 660, 0.56, "sine", 0.045, 0.58);
                noiseBurst(0.22, 850, 0.026, 0.54, 4200);
                break;
            case "naval_defeat":
                tone(220, 150, 0.42, "triangle", 0.055);
                tone(150, 92, 0.52, "sine", 0.06, 0.30);
                tone(92, 52, 0.64, "triangle", 0.045, 0.64);
                noiseBurst(0.24, 120, 0.035, 0.18, 900);
                break;
            case "bell":
                tone(880, 660, 0.4, "sine", 0.10);
                break;
            case "damage":
                noiseBurst(0.12, 200, 0.09);
                tone(260, 120, 0.12, "square", 0.08);
                break;
            case "level_up":
                tone(520, 740, 0.12, "triangle", 0.08);
                tone(740, 1040, 0.14, "triangle", 0.08, 0.09);
                break;
            case "page":
                tone(420, 320, 0.08, "triangle", 0.05);
                noiseBurst(0.05, 900, 0.03);
                break;
            case "ui":
                tone(740, 560, 0.05, "triangle", 0.055);
                break;
            case "blade":
                noiseBurst(0.04, 1800, 0.04);
                tone(860, 440, 0.08, "sawtooth", 0.06);
                break;
            case "pistol":
                noiseBurst(0.08, 450, 0.11);
                tone(180, 80, 0.09, "square", 0.09);
                break;
            case "repair":
                tone(340, 460, 0.09, "triangle", 0.06);
                tone(460, 520, 0.08, "triangle", 0.055, 0.06);
                noiseBurst(0.06, 900, 0.025, 0.02, 3600);
                break;
            case "hit":
                noiseBurst(0.07, 320, 0.05);
                tone(220, 140, 0.06, "square", 0.055);
                break;
        }
    }
    noiseBuf(ctx) {
        if (this.noise)
            return this.noise;
        const len = ctx.sampleRate * 1;
        const b = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = b.getChannelData(0);
        for (let i = 0; i < len; i += 1)
            d[i] = Math.random() * 2 - 1;
        this.noise = b;
        return b;
    }
    startScene() {
        this.sceneToken += 1;
        const scene = this.normalizeScene(this.scene);
        this.stopSceneAudio();
        if (scene === "silent")
            return;
        if (EXTERNAL_SCENES.has(scene)) {
            this.playExternalBed(scene, this.sceneToken);
            if (scene.startsWith("sea_"))
                this.scheduleOceanOverlay(this.sceneToken, scene);
            return;
        }
        this.startProceduralFallback(scene);
    }
    normalizeScene(scene) {
        if (scene === "veyrholm")
            return "veyrholm_street";
        if (scene === "sea")
            return "sea_calm";
        return scene;
    }
    startProceduralFallback(scene) {
        if (!this.ctx || !this.gain)
            return;
        const ctx = this.ensure();
        const out = this.gain;
        const now = ctx.currentTime;
        const pad = (freq, amp) => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = "triangle";
            o.frequency.value = freq;
            g.gain.value = amp * this.master;
            o.connect(g).connect(out);
            o.start(now);
            o.stop(now + 2.5);
        };
        const wash = (hp, lp, amp) => {
            const src = ctx.createBufferSource();
            src.buffer = this.noiseBuf(ctx);
            src.loop = true;
            const hi = ctx.createBiquadFilter();
            hi.type = "highpass";
            hi.frequency.value = hp;
            const lo = ctx.createBiquadFilter();
            lo.type = "lowpass";
            lo.frequency.value = lp;
            const g = ctx.createGain();
            g.gain.value = amp * this.master;
            src.connect(hi).connect(lo).connect(g).connect(out);
            src.start(now);
            src.stop(now + 3.2);
        };
        switch (scene) {
            case "stormvik":
                wash(150, 1300, 0.04);
                pad(180, 0.015);
                break;
            case "thorenfjord":
                wash(220, 900, 0.03);
                pad(220, 0.012);
                break;
            case "naval_combat":
                wash(100, 1600, 0.05);
                pad(110, 0.02);
                break;
            case "personal_combat":
                wash(200, 1200, 0.025);
                pad(160, 0.015);
                break;
            default:
                wash(200, 1200, 0.03);
                pad(200, 0.01);
                break;
        }
    }
    playExternalBed(scene, token) {
        const spec = SCENE_BEDS[scene];
        const audio = new Audio(spec.path);
        audio.preload = "auto";
        audio.loop = true;
        audio.volume = 0;
        this.bed = audio;
        audio.play().then(() => {
            if (token !== this.sceneToken || !this.enabled) {
                audio.pause();
                return;
            }
            fadeAudioElement(audio, this.targetVolume(spec.gain), 900);
        }).catch(() => {
            if (token === this.sceneToken)
                this.startProceduralFallback(scene);
        });
    }
    scheduleOceanOverlay(token, scene) {
        if (!scene.startsWith("sea_"))
            return;
        const pool = scene === "sea_rough" || scene === "sea_storm" ? OCEAN_OVERLAYS.rough : OCEAN_OVERLAYS.calm;
        const delay = 18000 + Math.floor(Math.random() * 16000);
        this.overlayTimer = window.setTimeout(() => {
            if (token !== this.sceneToken || !this.enabled || !this.unlocked)
                return;
            const pick = pool[Math.floor(Math.random() * pool.length)];
            if (!pick)
                return;
            const overlay = new Audio(pick.path);
            overlay.preload = "auto";
            overlay.loop = false;
            overlay.volume = 0;
            this.overlay = overlay;
            overlay.play().then(() => {
                if (token !== this.sceneToken || !this.enabled) {
                    overlay.pause();
                    return;
                }
                fadeAudioElement(overlay, this.targetVolume(pick.gain), 1400, () => {
                    // keep playing until natural end
                });
            }).catch(() => undefined);
            overlay.addEventListener("ended", () => {
                if (this.overlay === overlay)
                    this.overlay = undefined;
                if (token === this.sceneToken)
                    this.scheduleOceanOverlay(token, scene);
            }, { once: true });
        }, delay);
    }
    targetVolume(gainFactor) {
        return clamp01(this.master * gainFactor);
    }
    refreshSceneVolumes() {
        const normalized = this.normalizeScene(this.scene);
        if (this.bed && EXTERNAL_SCENES.has(normalized)) {
            this.bed.volume = this.targetVolume(SCENE_BEDS[normalized].gain);
        }
    }
    stopSceneAudio() {
        if (this.overlayTimer !== undefined) {
            window.clearTimeout(this.overlayTimer);
            this.overlayTimer = undefined;
        }
        const oldBed = this.bed;
        const oldOverlay = this.overlay;
        this.bed = undefined;
        this.overlay = undefined;
        if (oldBed)
            fadeAudioElement(oldBed, 0, 500, () => { oldBed.pause(); oldBed.currentTime = 0; });
        if (oldOverlay)
            fadeAudioElement(oldOverlay, 0, 400, () => { oldOverlay.pause(); oldOverlay.currentTime = 0; });
    }
}
export const audio = new AlphaAudio();
//# sourceMappingURL=audio.js.map