# Ebbing Tides Alpha 0.6D — RPG R1
## Reputation, Relationships & Law Foundation

**Base:** Character UI Structural Pre-Art S3 (`0.6.0-alpha.d.characterstruct3`)  
**Package:** `0.6.0-alpha.d.rpg-r1`  
**Save schema:** v12 (migrates v11 automatically)

R1 adds a persistent jurisdictional reputation/law layer without replacing the existing named-NPC relationship model. Political standing, local port standing, personal relationships, and legal status are deliberately separate concepts.

### Implemented
- Broad political/jurisdiction registry with Skeldra as the active proving-ground jurisdiction.
- Regional/faction standing remains on the captain reputation record.
- New local port standing record.
- Persistent crime incidents with jurisdiction, victim, severity, identity/witness/report state, and bounty value.
- Persistent warrants and qualitative legal state: Clear / Watched / Wanted / Outlawed.
- Crime knowledge is not magical: an unlawful naval act is canonical ground truth immediately, but public consequences wait for an identifiable surviving lawful witness to report it.
- Unlawful attacks affect the victim captain's personal relationship/memory separately from political reputation.
- Lawful vessel posture: merchants avoid danger rather than seek combat; neutral navies patrol without attacking; navies enforce active warrants; privateers can pursue wanted/enemy captains; pirates remain predatory.
- Heave-to / answer-warrant encounter path and Government warrant-settlement action.
- Naval and boarding victory/defeat/escape hooks carry reportable crimes through to resolution and prize-taking can become piracy.
- Legitimate delivery completion improves local standing and slightly improves regional standing; broken accepted obligations damage local standing.
- Captain Sheet and Journal expose Standing & Law without merging it with Personal Relationships.

### Deferred to R2/R3
- Contraband classifications and customs inspections.
- Smuggling/evasion gameplay.
- Letters of Marque, commissions, and lawful wartime target authorization.
- Detailed alliance/war diplomacy.
- Full character skill/background/profession consequence sweep.
- Final painted culture + religion layered manuscript presentation.

### Verification at packaging
- TypeScript: PASS
- Alpha compile: PASS
- Automated tests: 292/292 PASS
- Art-layout verification: 2/2 PASS
- Next production build: unavailable in packaging environment (`next` executable not installed)
