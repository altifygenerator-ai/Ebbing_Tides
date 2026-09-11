# Alpha 0.6B — Dynasties, Genealogy, Offices, Reigns & Claims

## Status

Alpha 0.6B populates the political/genealogical layer built in Alpha 0.6A. It is a **global historical-data pass**, even though Skeldra remains the only developed/traversable region in the current playable Alpha.

The distinction is intentional:

- **Historical/political data is global.** Foreign rulers, families, offices, claims and old political relationships can already exist in canon and be referenced by people, sources and later simulation.
- **Traversable geography remains regional.** Alpha 0.6B does not unlock Asterra, Aurelia, Serath, Kaishin, Vespera, Rhadessa, Blackhaven or other undeveloped regions for player travel.

Alpha 0.6B does not simulate births, marriages, deaths, or succession. It records the authored Day-1 political state that later simulation will inherit.

## Canonical population scope

The world seed now contains the politically relevant lineage backbone for:

- **Skeldra — House Vaering**
- **Asterra — House Marcellan**, inside a republic rather than a hereditary crown
- **Aurelia — House Valerian**
- **Serath — House Asharan**
- **Kaishin — House Tenrai**
- **Vespera — House Darcon**

Two deliberately non-dynastic political structures are also represented:

- **Blackhaven — elected High Captain**
- **Rhadessa — elected Sea Magistrate**

No `House Blackhaven` or hereditary Rhadessan ruling house has been invented.

## Genealogy rules

Family structure is represented by explicit relationship records rather than prose-only family trees.

Supported/queryable relationships include parent, child, spouse, sibling and the broader relationship types established in 0.6A. Alpha 0.6B adds reusable genealogy queries for:

- parents
- children
- spouses
- siblings
- ancestors
- descendants
- ancestor tests
- genealogical paths
- all relationship records touching a person

The seed does not fabricate unnamed intermediate generations simply to create an unbroken line. Where source canon contains ellipses or uncertain early ancestry, the database preserves that uncertainty.

Historical family relationships remain history after death; they are not pruned from the world model.

## Houses and political meaning

### House Vaering — Skeldra

The current royal family, spouse links, direct children and the politically relevant Hakon collateral branch are represented. Leif is the legal Day-1 heir; Freya, Torvald and Sten retain distinct political/genealogical relevance without the database pretending that every blood relative has an equal claim.

Vaer the Red is stored as the claimed ancestral founder with traditional/uncertain early genealogy rather than a fabricated courtroom-proof chain from the third century to 628 CR.

### House Marcellan — Asterra

The Marcellans are a powerful republican family, **not a royal dynasty**. Cassian Marcellan holds the elected office of First Archon in 628 CR. Helena and Marcus are his children but do not automatically inherit that office and are not seeded with hereditary claims to it.

Thalia Varen and Nikos Varen provide the explicit family/patronage bridge described in canon.

### House Valerian — Aurelia

The politically relevant modern imperial branch is represented, including the death of firstborn Cassian Valerian in 612 CR and Julian becoming the current military heir. Livia remains dynastically relevant without being promoted above the documented current heir.

### House Asharan — Serath

The seed preserves the older Mattan/Ashar line, Ashar I's conversion and 508 kingship, the subsequent Asharan identity, and the current Mattan III household. Elias is the current Crown Prince; Salome and Jonan remain politically relevant relatives rather than being erased by a single-heir model.

### House Tenrai — Kaishin

The centralizing ancestor Tenrai Shun, Kaito/Hana generation and current Jian/Mei household are represented. Ren is the current Crown Prince while Daichi and Aya retain real dynastic/political relevance.

### House Darcon — Vespera

Vesperan succession remains **customary/dynastic rather than hard-coded primogeniture**. Adrian and Sophia both retain authored dynastic bases with unresolved precedence.

The interfaith-marriage sequence is preserved carefully: Alexar II's second marriage to Miriam Sariel does not rewrite Alexar III's parentage. Alexar III's parents remain Alexar II and Sophia Valen; Alexar III's own marriage to Helena Celos carries the later interfaith political tension.

### Blackhaven

Blackhaven has persistent families, ships, wealth, grudges and political networks but **no hereditary ruling dynasty**. High Captain remains elected by recognized captains through coalition politics, reputation, force, wealth and support.

Jessa Corven's family relationship to Isabella is stored, but Isabella's Day-1 political basis is election/coalition potential, not inheritance of her mother's office.

### Rhadessa

The Sea Magistrate is an elected office. Damon Rhys is current in 628 CR and his adult children are explicitly not automatic successors.

## Offices and office terms

Person, office and office term remain separate records.

Alpha 0.6B populates the current political offices needed for the major regional structures, including monarchic, imperial, republican/elected and customary forms.

Where canon supplies an exact accession/transition year, that date is stored. Where canon only establishes that someone holds an office in 628 CR, the term start remains `unknown` rather than inventing a reign date.

The `officeTermAt` helper treats unknown historical boundaries as open for snapshot queries while preserving the underlying uncertainty.

## Claims

Claims are structured political/legal bases, **not automatic successor results**.

Alpha 0.6B records examples of:

- direct descent
- collateral descent
- customary support
- election/mandate

along with priority where canon establishes one, disputed/contingent status, legal notes and genealogical paths where appropriate.

The political query layer can return active claims for an office and a Day-1 office snapshot, but it deliberately does not choose future rulers. A later simulation pass must consider the live law, legitimacy, religion, political support, military support, foreign backing, character goals and historical events.

A non-hereditary office cannot silently acquire an undisputed hereditary succession rule merely because one office holder has children.

## World seed composition

`HISTORICAL_WORLD_SEED` merges:

1. the small Alpha 0.6A historical-foundation seed; and
2. the authored Alpha 0.6B dynasty/political seed.

The merge is ID-based and later layers may enrich an existing record without rewriting Alpha 0.6A's historical verification fixture.

This keeps the original 0.6A small-seed tests meaningful while giving normal history repositories the expanded world seed.

## Repository/query layer

The history repository now exposes houses, character relationships and office claims in addition to the 0.6A record families.

Genealogy and political queries live in `src/game/history`, not React/UI code. Production UI continues to be deferred.

## Integrity validation additions

Alpha 0.6B extends historical validation to detect or warn about:

- character references to nonexistent houses
- invalid house founder/parent/cadet references
- genealogy cycles
- implausibly young parents
- multiple simultaneous open-ended terms for one office
- undisputed hereditary-basis claims against explicitly non-hereditary offices
- genealogical claim paths that do not begin with the claimant

These checks supplement the chronology/reference validation created in 0.6A.

## Database migration

Migration:

`supabase/migrations/0009_alpha_06b_dynasties_genealogy_offices_claims.sql`

is a **seed-only migration**. It does not alter the historical table schema created by 0008.

Because the 0.6A SQL hotfix established the schema first, 0009 performs only transaction-safe authored record upserts/inserts and explicitly flushes deferred constraints before commit. This avoids reintroducing the pending-trigger `ALTER TABLE` failure corrected in 0.6A SQL Hotfix 1.

## Save compatibility

**No save schema bump is required.**

Alpha 0.6B remains on save schema **v8** because the new dynasty/office/claim population lives in world history seed/database structures rather than individual campaign save payloads.

Existing 0.5/0.6A gameplay saves continue through the established migration chain unchanged.

## Explicit scope boundary

Alpha 0.6B does **not** implement:

- automatic succession resolution
- simulated births
- simulated marriages
- simulated deaths
- fertility or demographic simulation
- full generational simulation
- full historical war population
- all historical rulers/generations between distant ancestors and 628 CR
- full historical ship library
- inherited Day-1 historical knowledge
- dynasty/family-tree production UI
- encyclopedia/timeline UI
- new traversable regions
- major new quests or economy systems

Those remain later Alpha 0.6+ work.

## Settlement & maritime geography canon addendum

The user-approved **World Settlement & Maritime Geography Canon 0.1** is now bundled with this checkpoint and is the current development authority for named settlement existence, naming, categories, maritime roles, regional grouping, and relative placement. Its machine-readable counterpart is `src/data/seed/settlementCanon.ts`.

This addendum does not expand traversable geography. The canon map is a spatial/worldbuilding authority, while the hidden runtime navigation grid remains authoritative for collision and movement in implemented regions. When a reserved region is built, its runtime settlement cells and geography must be reconciled to the canon map rather than relocating canonical settlements for convenience.
