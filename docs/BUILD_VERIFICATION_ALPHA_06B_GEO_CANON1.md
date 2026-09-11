# Alpha 0.6B — World Settlement & Maritime Geography Canon 0.1 Integration Verification

## Scope

Canon-data hotfix on top of Alpha 0.6B. No save migration, no traversable-region expansion, no navigation geometry rewrite, and no 0.6C simulation work.

## Added authority

- `docs/canon/WORLD_SETTLEMENT_MARITIME_GEOGRAPHY_CANON_0.1.md`
- canonical world map source image
- canonical settlement record source image
- `src/data/seed/settlementCanon.ts`

The canon registry contains 42 settlements and 7 maritime POIs across six geographic groupings.

## Verification

- Alpha TypeScript typecheck: PASS
- standalone Alpha compile: PASS
- complete inherited + new suite: 113/113 PASS
- playable Skeldran ports/POIs cross-reference stable canon IDs: PASS
- reserved locations remain non-playable: PASS
- source images registered as APPROVED_ANCHOR assets: PASS
- save schema: unchanged at v8
