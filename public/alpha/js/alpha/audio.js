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
        const now = ctx.currentTime;
        const tone = (f0, f1, d = 0.1, type = "sine") => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.type = type;
            o.frequency.setValueAtTime(f0, now);
            o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), now + d);
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.12 * this.master, now + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, now + d);
            o.connect(g).connect(out);
            o.start(now);
            o.stop(now + d + 0.02);
        };
        const noiseBurst = (d = 0.12, hp = 800, amp = 0.08) => {
            const src = ctx.createBufferSource();
            src.buffer = this.noiseBuf(ctx);
            const f = ctx.createBiquadFilter();
            f.type = "highpass";
            f.frequency.value = hp;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(amp * this.master, now + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, now + d);
            src.connect(f).connect(g).connect(out);
            src.start(now);
            src.stop(now + d + 0.02);
        };
        switch (cue) {
            case "click":
                tone(620, 420, 0.06, "triangle");
                break;
            case "coin":
                tone(1200, 1600, 0.12, "sine");
                break;
            case "sail":
                noiseBurst(0.18, 500, 0.05);
                tone(220, 180, 0.18, "sawtooth");
                break;
            case "cannon":
                noiseBurst(0.25, 80, 0.16);
                tone(90, 45, 0.25, "square");
                break;
            case "bell":
                tone(880, 660, 0.4, "sine");
                break;
            case "damage":
                noiseBurst(0.12, 200, 0.09);
                tone(260, 120, 0.12, "square");
                break;
            case "level_up":
                tone(520, 740, 0.12, "triangle");
                setTimeout(() => tone(740, 1040, 0.14, "triangle"), 90);
                break;
            case "page":
                tone(420, 320, 0.08, "triangle");
                noiseBurst(0.05, 900, 0.03);
                break;
            case "ui":
                tone(740, 560, 0.05, "triangle");
                break;
            case "blade":
                noiseBurst(0.04, 1800, 0.04);
                tone(860, 440, 0.08, "sawtooth");
                break;
            case "pistol":
                noiseBurst(0.08, 450, 0.11);
                tone(180, 80, 0.09, "square");
                break;
            case "repair":
                tone(340, 460, 0.09, "triangle");
                setTimeout(() => tone(460, 520, 0.08, "triangle"), 60);
                break;
            case "hit":
                noiseBurst(0.07, 320, 0.05);
                tone(220, 140, 0.06, "square");
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