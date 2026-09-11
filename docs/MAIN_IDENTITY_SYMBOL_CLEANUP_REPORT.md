# Alpha 0.6C — Main Identity Symbol Cleanup

Status: implementation complete; manual visual inspection required.

## Authority

`Ebbing_Tides_Main_Identity_Symbols_Approved_Reference.zip` supersedes the earlier broad symbol-language UI iterations for recurring identity presentation.

The live UI identity system now has exactly four channels:

1. Ancestry
2. Religion
3. Homeland
4. Affiliation

The approved package supplies 22 primary symbols: six ancestry, four religion, six homeland, and six affiliation marks.

## Cleanup boundary

This is a skin/identity cleanup only. It does not redesign or move UI, change geometry ownership, replace panels, alter scroll ownership, modify game mechanics, or bump save schema. The recovered Phase 2/3 screen architecture remains authoritative.

## Removed from recurring UI identity

The earlier fallback identity layer has been removed from live use, including Odal/Aun fallback runes, civic seal substitutions, rank/service glyphs, named-ship marks, and other specialist marks. The old runtime symbol set and its bundled 2026-09-07 reference subset were removed from this continuation package.

Specialist symbols may still exist in worldbuilding/reference art outside this package, but they are not general UI identifiers.

## Resolution rules

- General person/ship identity prefers an explicit approved **Affiliation** symbol when the affiliation is actually established.
- Otherwise the general identifier is the approved **Homeland** symbol.
- **Religion** is separate and appears only where religion is actually known/relevant. `unaffiliated` has no religion symbol.
- **Ancestry** is used on full identity/profile surfaces. Current `mixed` ancestry does not invent a mixed mark; Vesperan and Outer Isles culture can bridge the current pre-expansion ancestry enum to the approved Vesperan/Outer Isles main ancestry marks.
- Merchant, privateer, pirate, marine, or naval profession/status alone does not create an affiliation.
- Example locked behavior: an unaligned Blackhaven/Outer Isles privateer receives the **Outer Isles Homeland** identifier only unless a real affiliation is explicitly established.
- Unidentified ship contacts do not reveal identity marks.

## UI density policy

- Equipment identity banner: Homeland only.
- Captain/creator full identity areas: the available core channels may appear together, with missing channels omitted.
- NPC/crew/public/dialogue/combat contexts: one primary mark (Affiliation if explicit, otherwise Homeland), plus Religion only for explicitly religious roles/contexts.
- Ports/arrival/market/tavern/navigation destination: Homeland.
- Government institution: explicit main Affiliation where canonical (for example House Vaering at Veyrholm), otherwise Homeland.
- Religion institution: approved Religion marks only.
- Ship contexts: explicit Affiliation if established, otherwise owner Homeland. Named-ship symbols are no longer general identifiers.

Colors remain minimal/subtle and are not used to recolor or restructure approved UI.

## Runtime/reference separation

Approved reference crops are preserved under:

`public/art/reference/symbols/main-identity-approved-2026-09-08/`

Runtime-transparent presentation derivatives are under:

`public/art/ui/symbols/runtime/`

Runtime derivatives preserve the approved symbol identities and exist only so the marks can sit cleanly inside existing UI slots.

## Validation gate

Required before continuation:

- full regression suite
- Alpha TypeScript typecheck
- standalone Alpha build
- art-layout validation
- 22/22 runtime PNG decode/alpha verification
- manual visual inspection

## Automated verification result — 2026-09-08

- Regression suite: **186/186 PASS**.
- Alpha TypeScript typecheck: **PASS**.
- Standalone Alpha build: **PASS**.
- Art-layout validation: **3/3 layouts PASS, 0 failures**.
- Main identity runtime assets: **22/22 RGBA/transparency verification PASS**.
- Manual visual inspection: **pending user review**.
