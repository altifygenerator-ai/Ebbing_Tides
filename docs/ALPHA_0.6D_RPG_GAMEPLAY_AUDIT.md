# Alpha 0.6D — RPG Gameplay Audit

Status: **Phase D baseline implemented.** The permanent skill usage matrix is now `docs/RPG_SKILL_GAMEPLAY_USAGE_MATRIX.md`; 0.6D wires build-sensitive port reading and actionable market intelligence on top of the existing navigation, trade, combat, rumor, ability and progression checks.

Principle: **RPG depth comes from choices and consequences, not from the number of visible statistics.**

| System | Why the player cares | Where it affects gameplay | Current status | Decision |
|---|---|---|---|---|
| Attributes | broad innate strengths and weaknesses | checks, combat, observation, dialogue, physical actions | working shared six-attribute system | **KEEP** |
| Skills | define what the captain can notice, attempt and solve | navigation, trade, combat, dialogue, investigation, ship operation | 18 canonical skills exist; some uses are deeper than others | **KEEP / REWORK USAGE** |
| Background | establishes lived experience and social context | starting competence, dialogue hooks, opportunities | present in creator/state | **KEEP / INCREASE CONSEQUENCE** |
| Profession | practical recent experience | skills, equipment familiarity, social recognition | present | **KEEP / INCREASE CONSEQUENCE** |
| Religion | belief, social belonging, institutions | dialogue, trust, access, lore, ritual contexts | separate from ancestry/homeland | **KEEP; CONTEXTUAL SURFACE** |
| Culture | learned social/cultural identity | dialogue, recognition, norms, portrait metadata | separate from ancestry | **KEEP; MOSTLY BEHAVIORAL** |
| Equipment | immediate capability and build expression | combat, tools, defenses, ability prerequisites | working approved Inventory/Equipment architecture | **KEEP** |
| Abilities | specialized practices/techniques | Arcane/Industrial actions and special solutions | working runtime foundation | **KEEP / PROVE CONSEQUENCES** |
| Ship refits | vessel role and tradeoffs | speed, survival, cargo, combat, specialization | working refit foundation | **KEEP / STRENGTHEN BUILD IDENTITY** |
| Relationships | consequences of how people are treated | dialogue, opportunities, refusals, favors, hostility | deep internal dimensions exist | **KEEP INTERNAL / HIDE NUMERIC SURFACE** |
| Reputation | wider social consequence | access, prices/opportunities, response to player history | foundation exists through knowledge/history/relationship systems | **KEEP / SURFACE QUALITATIVELY** |
| Knowledge | limits what the character can act on | rumors, navigation, contacts, history, investigation | world truth vs belief/source-aware knowledge already implemented | **KEEP; PRESENT ACTIONABLY** |
| Attunement | high-specialization compatibility and identity | advanced Arcane/Industrial systems only | previously too prominent as direct slider | **REWORK / DERIVE / HIDE EXACT VALUE** |
| Arcana | allows genuinely different solutions | rituals, wards, sensing, lore, special equipment | skill + ability foundation exists | **KEEP / PROVE GAMEPLAY VALUE** |
| Industrial specialization | advanced technical problem-solving | engineering, precision systems, machinery, ship modules | technical ability foundation exists | **KEEP / PROVE GAMEPLAY VALUE** |
| Life Experience / Development | long-term classless growth | skill focus, perks, advancement history | working | **KEEP; AVOID DASHBOARD DOMINANCE** |

## 0.6D immediate corrections

### Attunement

The exact global value remains simulation state for compatibility/interference calculations but is no longer a player-assigned build axis. It is derived from committed Arcane/technical practice. Ordinary mixed-world use remains near neutral.

### Skills

No skill is considered "deep" merely because it has a rating. `RPG_SKILL_GAMEPLAY_USAGE_MATRIX.md` is now the permanent usage contract. The 0.6D baseline adds build-sensitive port reading and Commerce-driven market interpretation while preserving the existing navigation, rumor, trade, combat and ability checks. Future content should expand alternate solutions rather than add filler checks.

### NPC / relationship systems

Internal memory, belief, trust, respect, fear, affection, debt, grievance and suspicion remain valuable simulation state. Their player-facing proof must be behavior: different greetings, offers, refusals, warnings, aid, prices, opportunities and rumors.

## Acceptance pressure for Phase D

Before 0.6D can complete, at least one benchmark interaction must visibly change because of a skill/background/profession choice, and that change must create a different playable option or useful knowledge—not merely a hidden numeric modifier.
