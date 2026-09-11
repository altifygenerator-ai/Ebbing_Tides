# Alpha 0.6D — A0.3B Character-Build Consequence / Learning-Source Pass

## Purpose

The audit found that the character-creation foundation was structurally sound but several choices carried more apparent mechanical importance than recurring gameplay consequence. It also found that the existing in-world learning hooks were real code but effectively dead as a player-facing loop because no ordinary teacher, book, officer, institution, or discovery called them.

A0.3B strengthens the existing system rather than replacing it:

**captain identity/build + physical world context + actual source/requirement -> information/access/interpretation/training opportunity -> existing progression owner**

The pass preserves classless progression, the six canonical attributes, the 18 canonical skills, curated portrait creation, derived Arcane/Industrial specialization, A0.2B cadence, and the locked Character Creator/Captain UI geometry.

## 1. Identity consequence policy

A0.3B uses identity where it has a credible consequence and deliberately avoids universal passive bonuses.

- **Ancestry** remains identity and presentation context. A0.3B explicitly does not turn ancestry into a stat package.
- **Homeland and culture** affect familiarity and what stands out when reading a place. Familiarity changes interpretation, not omniscient knowledge.
- **Background and profession** continue to select practical port-reading lenses and can provide credible institutional access/efficiency where that experience is relevant.
- **Social origin and ship origin** can make institutions, naval paperwork, veteran/prize culture, or home-port history more legible. They do not create parallel reputation/debt systems.
- **Religion and devotion** affect participation and familiarity inside represented religious institutions. Alternate scholarly/social access remains possible where credible so faith is not an arbitrary hard lock.
- **Birth Omen** now enters religious/sailor interpretation and conversation while remaining culturally ambiguous rather than objectively declaring supernatural truth.
- **Superstitious** changes the interpretations the captain notices and carries forward. It remains absent from the flat starting-skill bonus code.
- **Bookworm** shortens actual written-study time; it does not instantly grant an ability or specialization.
- **Skills** gate genuine training and discovery paths in addition to their existing check-resolution roles.

## 2. Authoritative learning-source data

`src/data/seed/learningSources.ts` defines world sources as data. A source identifies:

- physical context: port, POI, or an officer aboard the player ship;
- source kind: teacher, book, officer, institution, or discovery;
- ability or specialization taught;
- credible access paths and skill requirements;
- time and crown cost;
- tags used for contextual, visible study adjustments.

The generic engine does not branch on named ports. Named Skeldran places/people appear only in content records.

Initial proving-ground sources:

| Source | Kind | Result |
| --- | --- | --- |
| Nils Orr | Officer | Calibrated Sextant Method |
| Ulf Brenn | Officer | Precision Bore Sighting |
| Elsa Tarn | Officer | Emergency Hull Shoring |
| Pastor Elias Korr / Ironhaven hospital | Teacher | Medicine: Harbor Triage |
| Veyrholm Admiralty Sailing Directions | Book/manual | Navigation: Open Sea |
| Ironhaven yards | Institution | Engineering: Yard Diagnostics |
| Great Hall of Thoren | Institution | Personal Ward |
| Old Veyr Beacon field study | Discovery | Navigation: Beacon Weather-Lore |

These are a vertical slice, not the final world-wide training catalog. Later regions extend data rather than creating a new learning system.

## 3. Learning execution and progression ownership

`src/game/characterConsequences.ts` quotes and executes learning sources. It verifies physical availability, discovery state, access path, subject requirements, already-known state, and crowns before training begins.

Training then:

1. records the starting `absoluteHour`;
2. spends the stated crowns;
3. advances the shared campaign world through `advanceWorld()`;
4. calls the existing `learnAbilityFromSource()` or `learnSpecializationFromSource()` hook;
5. records training history with truthful start/completion/cost data;
6. uses the existing A0.2B life-experience cadence and existing `character_learning` world-event history.

`learnAbilityFromSource()` and `learnSpecializationFromSource()` now accept optional acquisition metadata so world sources can preserve real training duration/cost without breaking older direct callers. Specialization learning now writes the same canonical `character_learning` event family as ability learning.

No private training clock, training XP currency, skill tree, or second progression ledger is introduced.

## 4. Physical and relational requirements

A0.3B makes source access follow actual world context.

- Shipboard officer sources require that the named officer is still assigned aboard the player ship.
- Pastor Elias Korr's instruction requires Ironhaven, sufficient Medicine, and actual contact: one conversation establishes the minimum relationship needed for hospital instruction.
- Port manuals/institutions are available only at their registered port.
- The Old Veyr Beacon field source requires the player to physically be at the POI and to have already performed `search` or `land_party` there.
- Great Hall warding can be approached through Old Gods participation or sufficiently strong Scholarship/Persuasion plus Arcana. Religion informs access without becoming a universal hard gate.

## 5. Devotion, Birth Omen, and Superstitious

Religious districts now expose one concise two-hour participation/observation action inside the existing contextual-location flow.

The action writes canonical PlayerState religious knowledge and a `religious_participation` world event. Its wording depends on the captain's religion and devotion. The captain's Birth Omen receives a tradition-specific interpretation, and `Superstitious` changes the interpretive emphasis.

The interpretation is explicitly plural and uncertain. Different traditions can disagree; no result silently establishes an omen as objective cosmological truth.

The action has a 72-hour repeat guard derived from existing world-event history. It therefore uses A0.2B/world-time principles without adding persistent cooldown state.

## 6. Port-reading consequences

The existing `assessPort()` action remains one hour and keeps its existing background/profession lens/check. A0.3B adds a small amount of build-specific interpretation to the knowledge text:

- local cultural/homeland familiarity versus outsider context;
- religious familiarity when the lens is institutional/social;
- ship-origin relevance when the lens is maritime/trade;
- Superstitious omen-reading context where maritime or institutional talk makes it relevant.

These additions change actionable interpretation and remembered knowledge, not the underlying world truth or check result.

## 7. Character Mind consequence

Deterministic Character Mind conversation can now classify questions about the captain's Birth Omen. Pastor Elias Korr answers through a Covenant frame; shipboard characters can answer through their own religious/cultural frame. The generated context also includes the player captain's public identity choices so a future model-backed response can interpret them without inventing them.

The lore firewall remains intact: interpretation is not authority to create world truth or commit gameplay effects.

## 8. UI lock / future purpose-painted art boundary

A0.3B intentionally does not redesign Character Creator or Captain geometry. Learning actions are inserted into existing contextual panels and existing scroll owners using already-shipped card/button classes. No A0.3B CSS layout owner was added.

Character Creator receives only consequence-aware explanatory copy. The Captain sheet automatically reflects learned abilities/specializations through its existing dynamic data regions.

This preserves the current structural lock so, after R2, the Character Creator and Captain screens can receive the planned **purpose-painted art integration around the final code geometry** rather than forcing dynamic code into a pre-painted mockup.

## 9. Persistence and database boundary

Save schema remains **v12**. A0.3B adds no new persistent campaign structure:

- abilities already persist on the character;
- specializations already persist on the character;
- training history already persists on the character;
- religious/port interpretation uses canonical `PlayerState.knowledge`;
- source use and participation use `worldEvents`;
- relationship contact uses existing NPC relationship state;
- time uses `absoluteHour`.

No Supabase migration is required.

## 10. Verification

Final A0.3B verification target:

- TypeScript Alpha typecheck: PASS
- Alpha compile: PASS
- Dedicated A0.3B tests: **15/15 PASS**
- Full suite: **393/393 PASS**
- Explicit A0.1B/A0.1C/A0.3A durability/cohesion set: **24/24 PASS**
- Art-layout verification: **2/2 PASS**
- Save schema: **v12 unchanged**
- Clean-overlay verification: **PASS** — fresh A0.3A + Main Menu Shell 1.3 baseline, overlay-only apply, then typecheck/build/393 tests/24 durability/art-layout all passed

Dedicated tests cover source-kind coverage, ancestry no-stat-package policy, cultural/ship-origin port interpretation, Birth Omen/Superstitious ambiguity, Bookworm written-study time, officer training, teacher-contact gating, faith/scholarship alternative institutional access, technical-background institutional consequence, POI discovery gating, religious participation, omen-aware dialogue, duplicate prevention, save persistence, and the UI-lock boundary.

## 11. Deferred work

A0.3B does not implement:

- A0.3C live kingdom/policy/religion/economic cause state;
- R2 dynamic customs, smuggling, privateering, embargoes, or wartime law;
- world expansion;
- mutiny;
- a training-management dashboard or abstract ability shop;
- a new core skill/attribute set;
- a direct Arcane/Industrial Attunement slider;
- a feature-by-feature face builder;
- the final Character Creator/Captain purpose-painted art pass.

Next phase: **A0.3C — Minimal Live Kingdom / Policy / Religion / World-Event Bridge**.
