# Ebbing Tides Alpha 0.6C Hotfix 3 Verification

- Package version: `0.6.0-alpha.c.hotfix3`
- Save schema: `v10`
- Alpha TypeScript build: **PASS**
- Regression tests: **137/137 PASS**
- Standalone served smoke:
  - `/alpha/index.html` → 200
  - `/alpha/js/alpha/main.js` → 200
  - `/art/ui/paperdoll_captain.png` → 200

Hotfix 3 specifically changes the personal inventory presentation to a compact tile grid with hover/select details and replaces the temporary geometry mannequin with a static painted paperdoll asset while keeping the approved slot model and equipment logic.
