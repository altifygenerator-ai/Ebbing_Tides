class ProceduralAudioManager {
    ctx;
    master;
    ambience = [];
    currentScene = "silent";
    enabled = true;
    volume = 0.32;
    configure(enabled, volume) {
        this.enabled = enabled;
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.master)
            this.master.gain.setTargetAtTime(this.enabled ? this.volume : 0, this.ctx?.currentTime ?? 0, 0.03);
        if (!enabled)
            this.stopAmbience();
    }
    async unlock() {
        if (!this.enabled)
            return;
        if (!this.ctx) {
            this.ctx = new AudioContext();
            this.master = this.ctx.createGain();
            this.master.gain.value = this.volume;
            this.master.connect(this.ctx.destination);
        }
        if (this.ctx.state === "suspended")
            await this.ctx.resume();
        if (this.currentScene !== "silent" && this.ambience.length === 0)
            this.startScene(this.currentScene);
    }
    setScene(scene) {
        if (scene === this.currentScene && this.ambience.length)
            return;
        this.currentScene = scene;
        this.stopAmbience();
        if (this.enabled && this.ctx && this.ctx.state === "running")
            this.startScene(scene);
    }
    noiseBuffer(seconds = 2) {
        const ctx = this.ctx;
        const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
        const data = buffer.getChannelData(0);
        // Audible texture need not be simulation RNG; this noise is presentation only.
        for (let i = 0; i < data.length; i += 1)
            data[i] = Math.random() * 2 - 1;
        return buffer;
    }
    loopNoise(gainValue, lowpassHz, highpassHz = 0) {
        const ctx = this.ctx;
        const source = ctx.createBufferSource();
        source.buffer = this.noiseBuffer(3);
        source.loop = true;
        let node = source;
        if (highpassHz > 0) {
            const hp = ctx.createBiquadFilter();
            hp.type = "highpass";
            hp.frequency.value = highpassHz;
            node.connect(hp);
            node = hp;
        }
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = lowpassHz;
        node.connect(lp);
        node = lp;
        const gain = ctx.createGain();
        gain.gain.value = gainValue;
        node.connect(gain);
        gain.connect(this.master);
        source.start();
        return () => { try {
            source.stop();
        }
        catch { } };
    }
    drone(freq, gainValue, type = "sine") {
        const ctx = this.ctx;
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = gainValue;
        osc.connect(gain);
        gain.connect(this.master);
        osc.start();
        return () => { try {
            osc.stop();
        }
        catch { } };
    }
    periodic(minMs, maxMs, fn) {
        let timer;
        let stopped = false;
        const schedule = () => {
            if (stopped)
                return;
            const span = Math.max(0, maxMs - minMs);
            timer = window.setTimeout(() => { if (!stopped)
                fn(); schedule(); }, minMs + Math.random() * span);
        };
        schedule();
        return () => { stopped = true; if (timer !== undefined)
            window.clearTimeout(timer); };
    }
    chirp(base = 1100, gainValue = 0.012) {
        if (!this.ctx || !this.master)
            return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(base, now);
        osc.frequency.exponentialRampToValueAtTime(base * 1.45, now + 0.09);
        osc.frequency.exponentialRampToValueAtTime(base * 0.82, now + 0.28);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.31);
    }
    knock(freq = 150, gainValue = 0.022) {
        if (!this.ctx || !this.master)
            return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(Math.max(35, freq * 0.55), now + 0.12);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(gainValue, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.15);
    }
    creak() {
        if (!this.ctx || !this.master)
            return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(105, now);
        osc.frequency.linearRampToValueAtTime(78, now + 0.42);
        osc.frequency.linearRampToValueAtTime(96, now + 0.7);
        const filter = this.ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 520;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.012, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.72);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + 0.74);
    }
    startScene(scene) {
        if (!this.ctx || !this.master || scene === "silent")
            return;
        if (scene === "sea") {
            this.ambience.push(this.loopNoise(0.075, 850), this.loopNoise(0.025, 3800, 850), this.drone(58, 0.018), this.periodic(4300, 9000, () => this.creak()), this.periodic(9000, 18000, () => this.chirp(1040, 0.008)));
        }
        else if (scene === "veyrholm") {
            this.ambience.push(this.loopNoise(0.055, 900), this.loopNoise(0.018, 2600, 700), this.drone(82, 0.012), this.periodic(2600, 6200, () => this.knock(145, 0.016)), this.periodic(7000, 14000, () => this.chirp(1280, 0.011)), this.periodic(18000, 30000, () => this.play("bell")));
        }
        else if (scene === "ironhaven") {
            this.ambience.push(this.loopNoise(0.05, 760), this.loopNoise(0.025, 3200, 900), this.drone(50, 0.025, "triangle"), this.drone(101, 0.009), this.periodic(1800, 4300, () => this.knock(205, 0.024)), this.periodic(4200, 8200, () => this.knock(92, 0.02)));
        }
        else if (scene === "stormvik") {
            this.ambience.push(this.loopNoise(0.075, 1200), this.loopNoise(0.035, 3600, 1050), this.drone(73, 0.009), this.periodic(5200, 10000, () => this.creak()), this.periodic(8000, 16000, () => this.chirp(980, 0.009)));
        }
        else if (scene === "thorenfjord") {
            this.ambience.push(this.loopNoise(0.048, 820), this.loopNoise(0.014, 2400, 650), this.drone(55, 0.012), this.drone(110, 0.006), this.periodic(16000, 28000, () => this.play("bell")), this.periodic(5000, 10000, () => this.knock(118, 0.012)));
        }
        else if (scene === "naval_combat") {
            this.ambience.push(this.loopNoise(0.065, 1100), this.drone(47, 0.028, "triangle"), this.periodic(5000, 11000, () => this.creak()));
        }
        else if (scene === "personal_combat") {
            this.ambience.push(this.loopNoise(0.025, 1800, 300), this.drone(66, 0.012, "triangle"), this.periodic(3600, 7600, () => this.knock(120, 0.012)));
        }
    }
    stopAmbience() {
        for (const stop of this.ambience.splice(0))
            stop();
    }
    play(cue) {
        if (!this.enabled || !this.ctx || !this.master || this.ctx.state !== "running")
            return;
        const ctx = this.ctx;
        const now = ctx.currentTime;
        const tone = (freq, duration, gainValue, type = "sine", endFreq) => {
            const osc = ctx.createOscillator();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now);
            if (endFreq)
                osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(gainValue, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            osc.connect(gain);
            gain.connect(this.master);
            osc.start(now);
            osc.stop(now + duration);
        };
        const burst = (duration, gainValue, lowpass = 2400) => {
            const source = ctx.createBufferSource();
            source.buffer = this.noiseBuffer(Math.max(0.08, duration));
            const filter = ctx.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = lowpass;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(gainValue, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            source.connect(filter);
            filter.connect(gain);
            gain.connect(this.master);
            source.start(now);
            source.stop(now + duration);
        };
        switch (cue) {
            case "ui":
                tone(430, 0.05, 0.035, "square", 360);
                break;
            case "coin":
                tone(1320, 0.08, 0.045, "sine", 880);
                tone(1760, 0.11, 0.025, "sine", 1200);
                break;
            case "sail":
                burst(0.7, 0.07, 1700);
                tone(95, 0.55, 0.025, "triangle", 62);
                break;
            case "cannon":
                burst(0.9, 0.23, 900);
                tone(52, 0.95, 0.18, "sine", 28);
                break;
            case "pistol":
                burst(0.23, 0.18, 2400);
                tone(120, 0.18, 0.08, "triangle", 55);
                break;
            case "blade":
                tone(1850, 0.13, 0.07, "sawtooth", 740);
                break;
            case "hit":
                burst(0.16, 0.11, 900);
                tone(86, 0.12, 0.05, "triangle", 55);
                break;
            case "repair":
                tone(310, 0.09, 0.05, "square", 260);
                setTimeout(() => this.play("ui"), 110);
                break;
            case "bell":
                tone(720, 0.65, 0.055, "sine", 610);
                tone(1080, 0.5, 0.025, "sine", 920);
                break;
            case "page":
                burst(0.2, 0.025, 4200);
                break;
        }
    }
}
export const audio = new ProceduralAudioManager();
//# sourceMappingURL=audio.js.map