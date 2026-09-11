# Ebbing Tides Alpha 0.6D — Character UI Structural Pre-Art S2

**Package:** `0.6.0-alpha.d.characterstruct2`  
**Expected base:** `0.6.0-alpha.d.characterstruct1`  
**Save schema:** v11 (unchanged)

This is the second pre-art structural pass after the manuscript presentation reset. It does **not** reintroduce the rejected painted-manuscript implementation and it does not begin Reputation/Law R1. Its job is to lock clearer code-owned information structure before later mechanics and final painted presentation.

## Structural changes

### Character Creator / Review
- Enlarges and loosens the Review page.
- Uses a dedicated full-width Training row with the selected core-skill names.
- Separates the bottom explanatory note from the fact grid and fixes its alignment.
- Increases review text/value readability and preserves responsive one-column fallback.

### Captain Sheet
- Raises contrast for relationship states and capability/development secondary text.
- Renames the relationship area to **Personal Relationships** to keep it distinct from future faction/legal standing.
- Adds proper internal padding to empty injury/history content.
- Prevents horizontal overflow on the character record surface.

### Crew
- Separates the unnamed **Ordinary Company** from named **Officers & Specialists**.
- Adds a derived qualitative **Feeling toward captain** for the ordinary company using existing morale, loyalty, pay/food satisfaction, discipline, fatigue, and unrest; no duplicate morale model is created.
- Adds a dedicated **Toward Captain** column for each named officer using the existing qualitative NPC relationship system.
- Reserves/uses small portrait slots for named crew. Current portraits are structural stand-ins from the existing Skeldran portrait pool and are not locked as canonical named-NPC art.
- Keeps ordinary sailors aggregate; no disposable sailor NPC roster is created.

### Ship Management
- Reorganizes Ship Status into Vessel / Company / Stores groups.
- Adds compact ship particulars under the main ship image: cruise, maneuverability, seaworthiness, firepower, crew capacity, and cargo capacity.
- Adds small code-owned fitting/refit icon slots. Final fitting icon art is intentionally deferred.

### Port Outfitter
- Changes the plain equal-card grid into a clearer inventory/port-family catalog layout.
- Uses the item art already registered by each item definition (`artAssetId`) in a reserved icon area.
- Keeps name, category, price, description, and Purchase action code-owned.

## Architecture

The pass preserves the project rule **ONE VISUAL STRUCTURE = ONE GEOMETRY OWNER**. Layout, rows, content regions, portrait slots, fitting slots, and controls are code-owned. Existing item/portrait imagery is art-owned inside those slots. Final presentation art remains deferred until functional systems and geometry are approved.

## Verification

On the reconstructed accepted S1 baseline plus this overlay:

- TypeScript: PASS
- Alpha build: PASS
- Automated tests: **273/273 PASS**
- Art-layout verification: **2/2 PASS**
- Save schema: v11 unchanged

Manual visual/UX approval is still required before considering the structural layout locked.
