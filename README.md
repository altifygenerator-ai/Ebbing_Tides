# Naval Audio Variation v2 — TypeScript Compatibility Fix

This fixes the one TypeScript error shown after Map Finish Pass 3 installed successfully:

`TS2375` on `NavalAudioSnapshot` with `exactOptionalPropertyTypes: true`.

## Why it happens

The v2 audio snapshot always returns both properties:

- `encounterId`
- `otherShipId`

but either value may be `undefined`.

The interface incorrectly declared them as optional properties:

```ts
encounterId?: string;
otherShipId?: string;
```

With `exactOptionalPropertyTypes`, an optional property means the property may be omitted; it
does **not** automatically mean a present property may explicitly contain `undefined`.

The correct type for the actual returned object is:

```ts
encounterId: string | undefined;
otherShipId: string | undefined;
```

## What this changes

Only the TypeScript interface in:

`src/alpha/main.ts`

There is no runtime JavaScript change and no gameplay change.

It does not alter:

- Naval Audio Variation v2 behavior
- map/atlas LOD
- navigation timing or interpolation
- naval combat
- travel/economy/weather/encounters
- saves/schema

## Apply

From the Ebbing Tides project root:

```powershell
powershell -ExecutionPolicy Bypass -File ".\apply_naval_audio_v2_typescript_fix.ps1"
```

The script makes a backup and then runs:

```powershell
npm run typecheck:alpha
```
