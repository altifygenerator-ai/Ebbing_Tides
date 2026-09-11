# Apply — Ebbing Tides Main Menu Shell Pass 1

## Intended merge point
This is a **presentation-only parallel overlay** built to sit on the accepted A0.2C-era shell while A0.2D is developed separately.

Preferred final order once the law repair is accepted:

1. accepted A0.2C baseline;
2. accepted A0.2D overlay;
3. this Main Menu Shell Pass 1 overlay.

If A0.2D also changes `public/alpha/index.html`, do **not** blindly replace that file. Preserve the A0.2D version and add only these two includes:

```html
<link rel="stylesheet" href="/alpha/start-menu.css" />
<script type="module" src="/alpha/js/alpha/startMenu.js"></script>
```

The start-menu script should be loaded **after** the established `main.js` include so the existing Character Creator/save control remains the authority underneath the menu.

## Files intentionally touched
Only one pre-existing runtime file is changed:

- `public/alpha/index.html`

Everything else in the overlay is new menu/audio presentation content. In particular, this overlay does **not** replace `src/alpha/main.ts` or any `src/game/*` mechanics file.

## Verification after merge
Run:

- `npm run typecheck:alpha`
- `npm run alpha:build`
- `npm test`
- `npm run alpha:art-layouts`

Then manually confirm:

- Start menu appears over Character Creator on first load.
- Supplied Sea Wind theme begins after the first permitted user interaction if browser autoplay blocks immediate playback.
- Continue is enabled only when the existing Character Creator exposes its current Continue Save control.
- Continue loads through the existing save logic.
- New Voyage simply dismisses the menu and reveals Character Creator.
- Settings changes only menu music/display presentation.
- Entering the game fades/stops the menu theme so existing in-game audio owns gameplay ambience.
