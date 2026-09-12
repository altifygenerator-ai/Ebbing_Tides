EBBING TIDES — PORTRAIT/MUSIC ESM HOTFIX

Purpose:
Fixes the incorrect CommonJS browser compilation from the first portrait/music runtime overlay.
The broken files produced `Uncaught ReferenceError: exports is not defined` in /alpha/js/alpha/main.js,
preventing the established Alpha runtime from announcing readiness to the main menu.

Apply:
Copy the contents of this archive over the project root, preserving paths and replacing the listed compiled JS files.
No save reset is required.

Corrected compiled browser modules:
- public/alpha/js/alpha/main.js
- public/alpha/js/alpha/audio.js
- public/alpha/js/data/seed/assets.js
- public/alpha/js/data/seed/portraits.js
- corresponding source maps

These files are ES modules (import/export), matching the existing Alpha browser runtime.
