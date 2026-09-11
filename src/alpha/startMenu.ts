/**
 * Ebbing Tides pre-game presentation shell.
 *
 * IMPORTANT ARCHITECTURE BOUNDARY:
 * This module owns only the start-menu DOM, presentation preferences, and menu music.
 * It does not import or mutate GameState, world simulation, saves, economy, law, NPCs,
 * combat, progression, navigation, or any other gameplay owner.
 *
 * The existing Alpha main module remains the sole owner of Character Creator, save loading,
 * and game-state transitions. This shell talks to it through a tiny DOM-event launch bridge.
 * That removes the old timing dependency on hidden creator/game buttons while keeping this
 * presentation module free of gameplay imports and state mutation.
 */

interface MenuPresentationSettings {
  musicEnabled: boolean;
  musicVolume: number;
  reducedMotion: boolean;
}

type MenuPanel = "main" | "settings" | "credits";
type LauncherMode = "new" | "continue";
interface LauncherReadyDetail { hasLocalSave: boolean; }
interface LauncherResultDetail { requestId: string; mode: LauncherMode; ok: boolean; hasLocalSave: boolean; message?: string; }

const SETTINGS_KEY = "ebbing-tides.presentation.main-menu.v1";
const DEFAULT_SETTINGS: MenuPresentationSettings = {
  musicEnabled: true,
  musicVolume: 0.42,
  reducedMotion: false
};

const MUSIC_OGG = "/audio/menu/ebbing_tides_main_menu_sea_wind_v1.ogg";
const MUSIC_MP3 = "/audio/menu/ebbing_tides_main_menu_sea_wind_v1.mp3";
const LAUNCHER_READY_EVENT = "ebbing-tides:runtime-ready";
const LAUNCHER_REQUEST_EVENT = "ebbing-tides:launch-request";
const LAUNCHER_RESULT_EVENT = "ebbing-tides:launch-result";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function esc(value: unknown): string {
  return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function loadSettings(): MenuPresentationSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null") as Partial<MenuPresentationSettings> | null;
    if (!parsed) return { ...DEFAULT_SETTINGS };
    return {
      musicEnabled: parsed.musicEnabled ?? DEFAULT_SETTINGS.musicEnabled,
      musicVolume: clamp(Number(parsed.musicVolume ?? DEFAULT_SETTINGS.musicVolume), 0, 1),
      reducedMotion: parsed.reducedMotion ?? DEFAULT_SETTINGS.reducedMotion
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings: MenuPresentationSettings): void {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* presentation preference only */ }
}

class MainMenuMusic {
  private readonly audio = new Audio();
  private fadeFrame: number | undefined;
  private targetVolume = DEFAULT_SETTINGS.musicVolume;
  private enabled = true;
  private unlocked = false;

  constructor() {
    this.audio.loop = true;
    this.audio.preload = "auto";
    this.audio.setAttribute("playsinline", "");
    const canOgg = this.audio.canPlayType('audio/ogg; codecs="vorbis"');
    this.audio.src = canOgg ? MUSIC_OGG : MUSIC_MP3;
    this.audio.volume = 0;
  }

  configure(settings: MenuPresentationSettings): void {
    this.enabled = settings.musicEnabled;
    this.targetVolume = clamp(settings.musicVolume, 0, 1);
    if (!this.enabled) {
      this.cancelFade();
      this.audio.pause();
      this.audio.volume = 0;
      return;
    }
    if (this.unlocked) void this.start();
  }

  async unlock(): Promise<void> {
    if (this.unlocked || !this.enabled) return;
    this.unlocked = await this.start();
  }

  private async start(): Promise<boolean> {
    if (!this.enabled) return false;
    try {
      await this.audio.play();
      this.fadeTo(this.targetVolume, 1800);
      return true;
    } catch {
      // Browsers may reject autoplay until an explicit pointer/key gesture.
      // Leave unlocked=false so the first real gesture retries playback.
      return false;
    }
  }

  fadeOutAndStop(duration = 850): Promise<void> {
    if (this.audio.paused) return Promise.resolve();
    return new Promise((resolve) => {
      this.fadeTo(0, duration, () => {
        this.audio.pause();
        resolve();
      });
    });
  }

  private fadeTo(target: number, duration: number, done?: () => void): void {
    this.cancelFade();
    const start = performance.now();
    const from = this.audio.volume;
    const to = clamp(target, 0, 1);
    const tick = (now: number) => {
      const t = duration <= 0 ? 1 : clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      this.audio.volume = from + (to - from) * eased;
      if (t < 1) this.fadeFrame = requestAnimationFrame(tick);
      else {
        this.fadeFrame = undefined;
        done?.();
      }
    };
    this.fadeFrame = requestAnimationFrame(tick);
  }

  private cancelFade(): void {
    if (this.fadeFrame !== undefined) cancelAnimationFrame(this.fadeFrame);
    this.fadeFrame = undefined;
  }
}

const root = document.createElement("div");
root.id = "et-start-menu";
root.setAttribute("aria-label", "Ebbing Tides main menu");
document.body.appendChild(root);

const music = new MainMenuMusic();
let settings = loadSettings();
let panel: MenuPanel = "main";
let closing = false;
let runtimeReady = document.documentElement.dataset.etRuntimeReady === "true";
let canContinue = document.documentElement.dataset.etHasLocalSave === "true";
let launchRequestId: string | undefined;
let launchStatus = runtimeReady ? "" : "Preparing game runtime…";

function render(): void {
  root.classList.toggle("reduced-motion", settings.reducedMotion);
  root.innerHTML = `
    <div class="et-menu-backdrop" aria-hidden="true">
      <div class="et-menu-backdrop-image"></div>
      <div class="et-menu-sea-haze"></div>
      <div class="et-menu-vignette"></div>
    </div>
    <div class="et-menu-layout">
      <header class="et-menu-title-block">
        <div class="et-menu-kicker">A nautical role-playing world</div>
        <h1>EBBING TIDES</h1>
        <div class="et-menu-rule"><span></span><i aria-hidden="true">◆</i><span></span></div>
        <div class="et-menu-build">ALPHA 0.6D</div>
      </header>
      ${panel === "main" ? renderMainPanel() : panel === "settings" ? renderSettingsPanel() : renderCreditsPanel()}
      <footer class="et-menu-footer">
        <span>Skeldra proving-ground build</span>
        <button class="et-menu-audio-toggle" type="button" data-menu-action="toggle-music" aria-pressed="${settings.musicEnabled}">
          <span aria-hidden="true">${settings.musicEnabled ? "♪" : "×"}</span>
          ${settings.musicEnabled ? "Music on" : "Music off"}
        </button>
      </footer>
    </div>`;
  syncControls();
}

function renderMainPanel(): string {
  return `
    <main class="et-menu-panel et-menu-main-panel" aria-label="Main menu">
      <button class="et-menu-choice primary" type="button" data-menu-action="continue" ${runtimeReady && canContinue && !launchRequestId ? "" : "disabled"}>
        <span>Continue</span><small>${!runtimeReady ? "Preparing game runtime…" : canContinue ? "Return to your last local save" : "No local save found"}</small>
      </button>
      <button class="et-menu-choice" type="button" data-menu-action="new-game" ${runtimeReady && !launchRequestId ? "" : "disabled"}><span>New Voyage</span><small>${runtimeReady ? "Create a captain and begin in Veyrholm" : "Preparing Character Creator…"}</small></button>
      <button class="et-menu-choice" type="button" data-menu-action="settings"><span>Settings</span><small>Menu audio and display</small></button>
      <button class="et-menu-choice" type="button" data-menu-action="credits"><span>Credits</span><small>Build and music information</small></button>
      ${launchStatus ? `<div class="et-menu-launch-status" role="status">${esc(launchStatus)}</div>` : ""}
    </main>`;
}

function renderSettingsPanel(): string {
  return `
    <main class="et-menu-panel et-menu-subpanel" aria-label="Main menu settings">
      <div class="et-menu-panel-heading"><span>Settings</span><small>Presentation only</small></div>
      <label class="et-menu-setting-row">
        <span><b>Main menu music</b><small>Sea Wind main-menu theme</small></span>
        <input type="checkbox" data-menu-setting="music" ${settings.musicEnabled ? "checked" : ""}>
      </label>
      <label class="et-menu-setting-row slider-row">
        <span><b>Music volume</b><small>Independent of in-game audio</small></span>
        <input type="range" min="0" max="100" step="1" value="${Math.round(settings.musicVolume * 100)}" data-menu-setting="volume" ${settings.musicEnabled ? "" : "disabled"}>
        <output>${Math.round(settings.musicVolume * 100)}%</output>
      </label>
      <label class="et-menu-setting-row">
        <span><b>Reduced motion</b><small>Stops the slow background drift</small></span>
        <input type="checkbox" data-menu-setting="motion" ${settings.reducedMotion ? "checked" : ""}>
      </label>
      <div class="et-menu-subpanel-actions"><button class="et-menu-text-button" type="button" data-menu-action="back">‹ Back</button></div>
    </main>`;
}

function renderCreditsPanel(): string {
  return `
    <main class="et-menu-panel et-menu-subpanel et-menu-credits" aria-label="Credits">
      <div class="et-menu-panel-heading"><span>Credits</span><small>Alpha presentation shell</small></div>
      <p><b>Ebbing Tides</b><br><span>World, characters, ships, systems and art direction developed for the Ebbing Tides project.</span></p>
      <p><b>Main Menu Theme — Sea Wind v1</b><br><span>Runtime asset supplied for this build. Source manifest lists foreground music “The Gift” (ob-lix), subtle sea bed “Sailing” (dammafra), and soft wind bed (storegraphic).</span></p>
      <p class="et-menu-credit-note">Licensing/attribution requirements should continue to follow the original source records supplied with the audio asset.</p>
      <div class="et-menu-subpanel-actions"><button class="et-menu-text-button" type="button" data-menu-action="back">‹ Back</button></div>
    </main>`;
}

function syncControls(): void {
  const volume = root.querySelector<HTMLInputElement>('[data-menu-setting="volume"]');
  const output = volume?.parentElement?.querySelector<HTMLOutputElement>("output");
  if (volume && output) output.value = `${volume.value}%`;
}

async function enterGame(mode: "new" | "continue"): Promise<void> {
  if (closing || launchRequestId || !runtimeReady) return;
  if (mode === "continue" && !canContinue) return;
  const requestId = `menu-${mode}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  launchRequestId = requestId;
  launchStatus = mode === "new" ? "Opening Character Creator…" : "Loading campaign…";
  render();
  window.dispatchEvent(new CustomEvent(LAUNCHER_REQUEST_EVENT,{detail:{requestId,mode}}));
}

async function closeMenuAfterSuccessfulLaunch(mode: LauncherMode): Promise<void> {
  if (closing) return;
  closing = true;
  root.classList.add("is-closing");
  void music.fadeOutAndStop(900);
  await new Promise(resolve => window.setTimeout(resolve, settings.reducedMotion ? 30 : 430));
  root.remove();
  if (mode === "new") {
    document.querySelector<HTMLInputElement>('#creation-form input[name="name"]')?.focus({preventScroll:true});
  }
}

window.addEventListener(LAUNCHER_READY_EVENT,(event)=>{
  const detail=(event as CustomEvent<LauncherReadyDetail>).detail;
  runtimeReady=true;
  canContinue=Boolean(detail?.hasLocalSave);
  launchStatus="";
  if(root.isConnected && panel==="main")render();
});

window.addEventListener(LAUNCHER_RESULT_EVENT,(event)=>{
  const detail=(event as CustomEvent<LauncherResultDetail>).detail;
  if(!detail || detail.requestId!==launchRequestId)return;
  launchRequestId=undefined;
  canContinue=Boolean(detail.hasLocalSave);
  if(!detail.ok){
    launchStatus=detail.message || (detail.mode==="continue" ? "Could not load campaign." : "Could not open Character Creator.");
    if(root.isConnected && panel==="main")render();
    return;
  }
  launchStatus="";
  void closeMenuAfterSuccessfulLaunch(detail.mode);
});

root.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const actionNode = target.closest<HTMLElement>("[data-menu-action]");
  if (!actionNode) return;
  const action = actionNode.dataset.menuAction;
  void music.unlock();
  if (action === "continue") { void enterGame("continue"); return; }
  if (action === "new-game") { void enterGame("new"); return; }
  if (action === "settings") { panel = "settings"; render(); return; }
  if (action === "credits") { panel = "credits"; render(); return; }
  if (action === "back") { panel = "main"; render(); return; }
  if (action === "toggle-music") {
    settings.musicEnabled = !settings.musicEnabled;
    saveSettings(settings);
    music.configure(settings);
    if (settings.musicEnabled) void music.unlock();
    render();
  }
});

root.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const kind = target.dataset.menuSetting;
  if (kind === "volume") settings.musicVolume = clamp(Number(target.value) / 100, 0, 1);
  if (kind === "music") settings.musicEnabled = target.checked;
  if (kind === "motion") settings.reducedMotion = target.checked;
  saveSettings(settings);
  music.configure(settings);
  if (kind === "music" && settings.musicEnabled) void music.unlock();
  if (kind === "motion") root.classList.toggle("reduced-motion", settings.reducedMotion);
  if (kind === "volume") {
    const output = target.parentElement?.querySelector<HTMLOutputElement>("output");
    if (output) output.value = `${target.value}%`;
  } else render();
});

window.addEventListener("keydown", (event) => {
  if (!root.isConnected || closing) return;
  if (event.key === "Escape" && panel !== "main") { panel = "main"; render(); return; }
  if (event.key === "Enter" && panel === "main") {
    void enterGame(canContinue ? "continue" : "new");
  }
});

const unlockOnGesture = () => { void music.unlock(); };
window.addEventListener("pointerdown", unlockOnGesture, { once:true });
window.addEventListener("keydown", unlockOnGesture, { once:true });

music.configure(settings);
render();
window.setTimeout(() => {
  if(document.documentElement.dataset.etRuntimeReady==="true"){
    runtimeReady=true;
    canContinue=document.documentElement.dataset.etHasLocalSave==="true";
    launchStatus="";
  }
  if (root.isConnected && panel === "main") render();
}, 0);
// Try immediately for environments that permit autoplay; normal browsers will start on first gesture.
void music.unlock();
