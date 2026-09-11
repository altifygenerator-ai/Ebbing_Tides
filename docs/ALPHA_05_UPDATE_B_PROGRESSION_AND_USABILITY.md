# Ebbing Tides — Alpha 0.5 Update B: Progression & Usability

Update B builds on the verified Alpha 0.5A systems/map checkpoint. It deliberately contains **no new generated art**; the Skeldra regional chart and curated portrait library remain the separate Update C.

## Source-priority decision

The Character Progression, Skills, Arcana & Technology System Bible v0.1 remains the authority for actual competence: Ebbing Tides is classless, skills grow through meaningful use/training/study, abilities come from world sources, knowledge remains separate from skill, and the world never level-scales around the player.

During 0.5B development the user explicitly chose to retain a light **overall Experience Level** as a readable milestone for breadth of lived experience and the cadence for Development Points / rare life-talent opportunities. This is an intentional newer decision and therefore supersedes the document's statement that traditional character levels are unnecessary. It does **not** supersede the document's progression philosophy. Experience Level never raises every skill, health, damage, enemy strength, ship power, or world difficulty.

The resulting hierarchy is:

1. **Skills / knowledge / learned abilities / history are the real progression.**
2. **Life Experience** records broad meaningful experience.
3. **Experience Level** summarizes that breadth and occasionally grants development opportunities.
4. **Development Points** can only accelerate a line of competence grounded in recent meaningful use, training, or formative experience.
5. **Life talents** are infrequent, history/build-gated and contextual; they are not universal percentage bonuses.

## Usability layer

### Explanatory tooltips

The six attributes, all 18 core skills, Specializations, Life Experience, Development Points, Attunement and Arcane Strain now expose short hover/focus descriptions. The tooltip mechanism is reusable rather than hardcoded to one screen, and keyboard focus receives the same explanation as mouse hover.

### Crew remain people aboard ship

Every currently named/persistent member of Tideworn's company has:

- **Talk** — opens the Character Mind conversation surface while aboard.
- **Inspect Character** — shows identity, attributes, strongest skills, Experience Level, Life Experience and Attunement.

Crew conversation context is assembled from persistent character state plus the real current ship/voyage situation. Crew can discuss their work, crew morale, the ship, the current voyage or advice, but the lore firewall remains authoritative: generated/deterministic performance cannot invent canonical knowledge, rewards, skills or world facts.

### Attunement presentation

The Character Sheet now treats Arcane ↔ Industrial Attunement as a major identity/system signal rather than a buried number:

- -100 Arcane ↔ 0 Neutral ↔ +100 Industrial bar.
- movable marker and numeric value.
- readable alignment band.
- immediate consequence text.
- Arcane Strain alongside it.
- current ship/location interference symptoms when present.

Ordinary tools and low-order practices remain broadly usable. The presentation explains increasing high-order compatibility pressure rather than implying a hard equipment ban.

## Progression architecture

### Meaningful skill growth

Skill practice records a source and challenge context. Repeating the same safe action rapidly loses educational value. Skill ratings rise from accumulated meaningful practice; training sources remain persistent history.

### Life Experience

Broad Life Experience is awarded for meaningful events such as voyages, contracts, naval combat outcomes, boarding outcomes, learning and other significant experiences. Repeating the same experience key is aggressively damped so safe repetition is not the optimal progression route.

### Experience Level

Experience Level is derived from accumulated Life Experience. Its only automatic rewards are development opportunities:

- +2 Development Points per level reached.
- a rare life-talent opportunity on the current provisional cadence (every third level).

The exact thresholds/cadence are provisional Alpha balance values and can be tuned without changing the architecture.

### Development Points

A Development Point does not buy arbitrary expertise. A skill can receive focused development only if it has a believable foundation through recent meaningful use, relevant training, or a formative core-skill background. Spending a point advances that skill's existing practice progress and records why.

### Life talents, not percentage stacks

0.5B exposes only talents that already have a real gameplay context. Current examples include:

- **Weather Eye** — applies to voyage course-planning/weather judgment.
- **Sea Wolf** — applies while breaking contact from pursuit.
- **Powder Discipline** — applies to disciplined naval battery fire.
- **Commanding Presence** — applies to legitimate surrender pressure; it does not override Character Mind boundaries.
- **Field Mechanic** — applies to emergency ship repair/damage control.
- **Ritualist** — applies to demanding Arcane practices and slightly reduces their strain when requirements are actually met.

Other authored talent ideas remain unavailable until the relevant gameplay action exists. This prevents the UI from offering hollow choices.

### Player/NPC parity

Named persistent NPCs and named crew carry the same advancement record shape. They gain Life Experience through real participation and remain compatible with the NPC Brain's event-driven/coarse-resolution learning model. Nothing in the progression schema depends on the player receiving separate physics.

## Persistence

- Local save schema: **v6**.
- Saves migrate 0.1 → 0.2 → 0.3 → 0.4 → 0.5A → 0.5B.
- Advancement preserves Life Experience, Experience Level, Development Points, learned life talents, recent anti-grind keys and advancement history.
- Supabase migration: `0006_alpha_05b_progression_usability.sql` adds normalized advancement storage to `character_capabilities` while the versioned canonical snapshot remains authoritative.

## Explicitly deferred to Update C

- Dedicated high-resolution Skeldra regional navigation painting.
- Initial curated/generated Skeldran portrait library.
- Portrait metadata/art QA and approval workflow.
- Visual replacement of provisional Skeldra map/portrait assets.

Update C should consume this checkpoint rather than rebuilding its progression, Character Mind or map architecture.
