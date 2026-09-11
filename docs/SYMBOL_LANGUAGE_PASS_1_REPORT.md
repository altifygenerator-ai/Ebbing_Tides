# Ebbing Tides — Symbol Language Pass 1 Report

Status: **IMPLEMENTED — pending manual visual approval**  
Scope: **player-facing identity screens only**  
Base checkpoint: **Alpha 0.6C UI Recovery Phase 3 Cleanup Pass 1**

## Hard boundary

This pass is an identity/symbol skin pass, not a UI recovery or redesign pass. Approved UI layout, component ownership, panel geometry, inventory geometry, portrait composition, navigation, and interaction structure remain unchanged. No save-schema change was introduced.

The complete approved 2026-09-07 symbol package remains the separate authoritative reference handoff. To keep this continuation package compact, only the approved source crops actually used by Pass 1 plus the original symbol manifest are bundled under `public/art/reference/symbols/approved-2026-09-07/`. Runtime transparent derivatives live separately under `public/art/ui/symbols/runtime/`. Reference art remains reference authority; runtime derivatives are presentation assets only.

## Player-facing integrations

### Inventory / Equipment

The fixed Skeldran identity banner is covered by a context-resolved identity overlay in the existing banner footprint. Only the symbol and restrained banner/accent color change. The existing body/equipment art, inventory grid, item detail panel, slot geometry, and all interaction regions remain untouched.

The equipment banner uses the player's primary secular/affiliation identity only. Religion is intentionally not added to the inventory banner. Companion/NPC equipment screens are intentionally untouched in Pass 1.

### Character Creator

The existing portrait area now carries a small live identity preview. It updates from ancestry, homeland/home settlement, culture, and religion choices while preserving the approved six-step creator structure. Primary identity and faith remain separate marks. Ancestry contributes only a restrained accent treatment.

### Captain Character Sheet

The existing captain sidebar receives a small primary-identity + faith-symbol treatment and a restrained ancestry accent on the already-present identity text. No sidebar structure or content hierarchy was rebuilt.

## Identity resolution rules

The resolver is deliberately conservative. Specific canonical affiliations can take precedence when they exist; otherwise identity falls back through settlement/homeland, then culture, then ancestry. Religious identity is resolved separately and appears only in contexts where faith is relevant.

Current player save data does not yet contain canonical `houseId` or `factionId` fields, so this pass does not add or fake them and does not bump the save schema. The resolver already accepts optional future house/faction context so later canonical affiliation work can use the same rules without rewriting the UI integration.

Unaligned characters never receive a religious mark merely because of region or culture. A Blackhaven character with no religious affiliation resolves to Blackhaven/freeport identity only. Serathi unaffiliated characters intentionally receive no Covenant mark and no invented secular Serathi emblem because the approved reference package does not currently provide one.

Naval rank/service insignia are not used on these player identity surfaces because doing so would imply a naval rank or service membership that current character state may not grant.

## Approved runtime symbol families used in Pass 1

- Skeldra: approved Odal runtime heritage mark; approved Aun runtime faith-context mark for Old Gods presentation.
- Asteria: approved solar-compass civic seal; approved civic-temple wreath as generic Pantheon context without choosing a deity.
- Kaishin: approved civic-hall mark; Turning Wheel remains a separate faith mark.
- Vespera/Crossroads: approved Grand Strait civic seal.
- Blackhaven/Outer Isles: approved freeport-anchor mark.
- Covenant: approved Covenant knot, faith-context only.
- House Vaering primary arms are registered for future canonical house affiliation but current player creation does not assign that house.

## Color policy

Color changes remain minimal and subtle. Small banner/accent variables reinforce homeland/identity without recoloring entire screens. Symbol chips use a restrained parchment field where needed so dark approved marks remain legible against the existing dark naval UI.

## Validation gate

Automated acceptance requires Alpha typecheck, standalone Alpha build, the full inherited regression suite, Symbol Language Pass 1 regression coverage, art-layout verification, and PNG decode/alpha checks for the runtime symbol derivatives. Final approval remains manual visual inspection.

## Explicitly deferred

All non-player UI symbol work is deferred until Pass 1 is manually approved. This includes NPC/crew identity presentation, ship/fleet insignia, naval rank/service marks, ports/settlements, markets, journals, combat screens, institutions, faction screens, history/genealogy, codex, and broader decorative rune/symbol use.

## Final automated result for this package

- Alpha TypeScript typecheck: **PASS**.
- Standalone Alpha build: **PASS**.
- Full inherited + Pass 1 regression suite: **183 / 183 PASS**.
- Art-layout verification: **PASS — 3 layouts, 0 failures**.
- Runtime symbol derivative verification: **10 / 10 PNGs decode as RGBA with transparency**.
- Manual visual inspection: **pending**.
