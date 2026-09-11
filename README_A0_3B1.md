# Ebbing Tides Alpha 0.6D — A0.3B1 Creator & Interaction UX Lock

Package: `0.6.0-alpha.d.a0-3b1`  
Save schema: `v12` (unchanged)

A0.3B1 is a small code-owned UX lock pass after A0.3B. It does not add a new gameplay subsystem or begin the final painted art pass. Its purpose is to make already-live mechanics legible and comfortable before the Character Creator / Captain geometry is treated as ready for purpose-painted art after R2.

## What changed

- Character Creator Attributes / Skills is denser and easier to use: attribute controls no longer waste a full field width, and the whole skill row is a click target with a clearer selected state.
- Identity, Homeland/Faith, and Background/Profession pages use otherwise-empty space for concise current gameplay effects where the selected choice actually matters.
- Review / Begin now shows the captain's actual starting toolbox: crowns, Tideworn hull, supplies, attributes, final developed skill ratings, starting abilities, specializations, schematics, and the exact contributions/access effects produced by the chosen history.
- Starting-skill contributions and ship-origin/crown effects are centralized so the review reads the same data used to create the character rather than maintaining a second copy of the numbers.
- Ancestry is explicitly honest: it has no direct stat/ability package. Birth omen is likewise not presented as a hidden numeric bonus.
- Market rows now have a quantity stepper/input so one transaction can buy or sell multiple units. The existing canonical `transact(...)` function remains the sole market mutation owner.
- Same-screen actions preserve deliberate local scroll positions across rerenders. Buying, selling, supplying, repairing, equipping, etc. should no longer throw the player back to the top of the same screen; actual screen/subscreen changes still get a fresh view.
- Ship Overview shows the live A0.3A Supplies and Repair costs on the bottom actions. While docked, Supplies and damaged vessel-status rows also expose a small `+` shortcut that calls the same canonical supply/repair actions.

## What did not change

- No save-schema bump.
- No Supabase migration.
- No new economy, service, repair, supply, inventory, character-stat, or progression owner.
- No world expansion.
- No final painted Character Creator / Captain art. The screen remains `pre-art`; this pass tightens code-owned geometry/functionality so later art can be painted around the locked UI with purpose.
