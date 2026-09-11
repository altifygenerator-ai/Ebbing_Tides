# Ebbing Tides — A0.3B

Character-Build Consequence / Learning-Source strengthening pass from the Alpha 0.6D systems/canon/cohesion/campaign-durability audit.

Base: `0.6.0-alpha.d.a0-3a` + accepted Main Menu Shell 1.3 runtime bridge  
Package: `0.6.0-alpha.d.a0-3b`  
Save schema: **v12 unchanged**

A0.3B makes the existing captain build recur in play without turning identity into a pile of passive percentage bonuses. Background/profession still determine useful port-reading lenses; culture/homeland, ship history, religion, devotion, Birth Omen, and selected traits now change information, interpretation, institutional access, study time, or available learning paths where appropriate.

Ancestry remains identity/context and does **not** become an arbitrary stat package.

The existing `learnAbilityFromSource` and `learnSpecializationFromSource` progression hooks are now connected to real player-facing world sources: named teachers, shipboard officers, manuals, institutions, and discoveries. Training consumes the same campaign `absoluteHour`, can cost crowns, writes truthful training history, and persists through the existing save state. It does not create a new XP clock, skill tree, training currency, or management center.

Initial Skeldra proving-ground sources include officer instruction from Nils Orr, Ulf Brenn, and Elsa Tarn; medical instruction through Pastor Elias Korr and the Ironhaven hospital; an Admiralty sailing manual in Veyrholm; Ironhaven yard instruction; guarded warding instruction at the Great Hall of Thoren; and a field-discovery specialization at the Old Veyr Beacon after the site has actually been investigated.

Devotion and Birth Omen now matter through religious participation, access/familiarity, knowledge, and character interpretation while staying culturally ambiguous. `Superstitious` changes what omen beliefs and sailor/religious interpretations stand out; it does not secretly turn an omen into objective world truth or a flat skill bonus. `Bookworm` reduces the time required by real written-study sources rather than instantly granting expertise.

A0.3B deliberately preserves the locked Character Creator/Captain structure. It adds content/actions inside existing code-owned panels and scroll owners; it does not redesign the screens or introduce new CSS geometry. This keeps the UI stable for the later purpose-painted art pass after R2.
