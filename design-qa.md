**Design QA — Production 1L Serathi Captain candidate**

- Source visual truth: the accepted Captain structure in `docs/visual-qa/character-art-production-1e/captain-runtime.png`, combined with the approved corrected Serathi skins in `public/art/ui/character-themes/culture/serathi/production1k/creator_frame.png` and `register_tab.png`.
- Source dimensions: accepted Captain reference 1920 x 1080 pixels; Serathi frame 1448 x 980 pixels; Serathi register 2024 x 444 pixels.
- Implementation target: local Alpha runtime at `/alpha/`, Serathi Captain state.
- Implementation screenshot: unavailable; Work's cloud browser rejected the running local preview with `ERR_BLOCKED_BY_CLIENT`, and the permitted reload was rejected by URL policy.
- Intended viewport: 1920 x 1080 CSS pixels at density 1.
- Density normalization: not possible without a browser-rendered implementation capture.
- State: Serathi Captain with sticky profile dossier and History, Capabilities, and Condition chapters.
- Primary interactions intended for verification: Captain navigation, sticky dossier behavior, page scrolling, accordion expansion/collapse, tab selection, and responsive fallback.
- Console errors: not checked because the implementation could not be opened in the Work cloud browser.

**Findings**

- [P1] Browser-rendered comparison unavailable
  Location: Serathi Captain runtime.
  Evidence: the local preview service started successfully, but the cloud browser blocked the local URL before DOM, screenshot, interaction, or console inspection.
  Impact: culture gating, asset resolution, CSS containment, scroll ownership, responsive rules, and compilation can be verified, but actual frame joins, portrait scale, text wrapping, crop, and overlap cannot receive visual sign-off.
  Fix: apply the candidate locally at 1920 x 1080 and capture the top of the Captain screen plus a scrolled view showing chapter transitions.

**Required fidelity surfaces**

- Fonts and typography: the accepted Captain typography and hierarchy are preserved; rendered weight, wrapping, and antialiasing remain unverified.
- Spacing and layout rhythm: the sticky dossier, 34-pixel chapter rhythm, independent live-height page housings, and existing scroll owner are preserved. Actual joins and vertical rhythm remain unverified.
- Colors and visual tokens: warm limestone, terracotta, dark cedar, and hammered copper dominate; indigo and sea-green remain sparse glass accents. Asterian sun and wave vocabulary is excluded.
- Image quality and asset fidelity: the approved corrected Serathi frame, register, and manuscript texture are reused without SVG/CSS substitutes. Regional Serathi paintings fill existing profile/header wells. Runtime crop and sharpness remain unverified.
- Copy and content: Captain labels, data, progression, relationships, condition, standing, and controls are unchanged.

**Full-view comparison evidence**

- Blocked: no browser-rendered implementation screenshot could be combined with the accepted Captain reference.

**Focused region comparison evidence**

- Blocked for the same reason. Required regions are the large portrait dossier, three chapter housings, header painting crops, accordion register leaves, and the gap between consecutive chapters.

**Comparison history**

- Pass 1: preview service started; Work browser returned `ERR_BLOCKED_BY_CLIENT`. One permitted reload was rejected by URL policy. No visual findings were invented from code alone.

**Implementation Checklist**

- Capture the Serathi Captain top view at 1920 x 1080.
- Capture a scrolled view showing the seam between two chapters.
- Verify portrait-frame thickness, chapter corners, accordion padding, image crops, typography, and sticky behavior.
- Correct only observed fit/crop/overlap issues; preserve all mechanics and the approved Creator.

**Follow-up Polish**

- None classified until valid runtime evidence is available.

final result: blocked
