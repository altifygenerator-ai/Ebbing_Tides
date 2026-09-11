# Apply Alpha 0.6D RPG R1 — Reputation, Relationships & Law Foundation

Apply this overlay to the manually accepted **Character UI Structural Pre-Art S3** project (`0.6.0-alpha.d.characterstruct3`). S3 is the locked pre-art UI structure entering R1.

1. Back up the current project.
2. Extract the overlay ZIP over the project root, preserving paths and replacing matching files.
3. Confirm `package.json` reports `0.6.0-alpha.d.rpg-r1`.
4. Existing saves migrate from schema **v11 -> v12** on load. The migration adds persistent local port standing, jurisdictional legal state, crime records, warrants, and encounter identity/authority flags without discarding the existing campaign.
5. Run:
   - `npm run typecheck:alpha`
   - `npm run alpha:build`
   - `npm test`
   - `npm run alpha:art-layouts`
6. Manually inspect/test:
   - Captain -> Known Powers now separates political Standing from Legal Status and has a Local Standing section for known ports.
   - Journal -> Standing & Law records powers, port standing, active warrants, and reported offenses.
   - Government -> active local warrants can be answered/paid when the captain has enough crowns.
   - At sea, neutral lawful merchants/navy/privateers do not behave like generic hostiles. Pirates remain predatory.
   - A navy with an active warrant can order the captain to heave to. The player can answer the warrant, evade, or escalate.
   - Attacking lawful vessels creates an actual incident first; faction/port standing and warrants update only when an identifiable surviving witness can report it.
   - Completing legitimate delivery obligations improves destination/local standing; breaking accepted obligations damages it.

R1 does **not** implement contraband/customs, Letters of Marque, commission target authorization, war diplomacy, or the broad RPG skill consequence sweep. Those remain R2/R3. It also does not begin the final painted character UI art pass.
