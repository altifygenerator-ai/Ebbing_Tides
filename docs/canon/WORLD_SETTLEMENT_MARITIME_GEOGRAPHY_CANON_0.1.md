# Ebbing Tides — World Settlement & Maritime Geography Canon 0.1

Status: **CANONICAL DEVELOPMENT SOURCE OF TRUTH**

This canon was explicitly accepted on 2026-09-07 and is shipped with the Alpha 0.6B development checkpoint.

## Authority

The two supplied source images are authoritative for:

- which named settlements and maritime POIs currently exist in the world canon;
- their canonical names (with explicitly recorded spelling aliases where source sheets differ);
- their regional grouping;
- their settlement category (major capital/great port, city/regional port, sacred city/fortress, or POI/danger geography);
- their broad maritime/economic/geographic role;
- their relative geographic placement on the world map.

Precedence for settlement/location development is:

1. later explicit user decisions;
2. **World Settlement & Maritime Geography Canon 0.1**;
3. older world/lore documents.

This does **not** make reserved regions traversable. Runtime navigation coordinates, passability, approach cells, encounter tables, port actions, and regional art still require deliberate implementation as each region is built.

## Shipped source assets

- `/public/alpha/art/canon/world_settlement_maritime_geography_canon_0_1_map.png`
- `/public/alpha/art/canon/world_settlement_maritime_geography_canon_0_1_settlement_record.png`

Stable asset IDs:

- `canon.world_settlement_maritime_geography.0_1.map`
- `canon.world_settlement_maritime_geography.0_1.settlement_record`

Machine-readable registry:

- `src/data/seed/settlementCanon.ts`

## Settlement rules

1. Ports belong on coasts, bays, river mouths, islands, fjords, and straits.
2. Inland cities must have visible river or gulf access.
3. Named cities must make maritime sense in their location, culture, and function.
4. Major capitals and great ports anchor trade, religion, and politics across the world.

## Important implementation rule

The canon world map is a geographic/spatial authority, **not** a replacement for the hidden navigation grid. When a currently reserved region becomes playable, its coded terrain and settlement cells must be reconciled to this map rather than casually moving canonical settlements to fit convenience geometry.

## Spelling note

The settlement record sheet renders `Aurellia`, while the accompanying canon map and established Ebbing Tides lore use `Aurelia`. The machine-readable record keeps `Aurelia` as the stable existing ID/name and preserves `Aurellia` as a source alias so the discrepancy is not silently lost.
