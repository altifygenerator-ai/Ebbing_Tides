import type { HistoricalCharacterRecord, HistoricalDatabaseSeed, HistoricalRelationshipRecord } from "../../types/history.js";

export interface GenealogyIndex {
  characterById: Map<string, HistoricalCharacterRecord>;
  parentsByChild: Map<string, Set<string>>;
  childrenByParent: Map<string, Set<string>>;
  spousesByCharacter: Map<string, Set<string>>;
  siblingsExplicitByCharacter: Map<string, Set<string>>;
}

function add(map: Map<string, Set<string>>, key: string, value: string): void {
  const set = map.get(key) ?? new Set<string>();
  set.add(value);
  map.set(key, set);
}

export function buildGenealogyIndex(seed: HistoricalDatabaseSeed): GenealogyIndex {
  const index: GenealogyIndex = {
    characterById: new Map(seed.characters.map((row) => [row.id, row])),
    parentsByChild: new Map(), childrenByParent: new Map(), spousesByCharacter: new Map(), siblingsExplicitByCharacter: new Map()
  };

  for (const rel of seed.relationships) {
    if (rel.relationshipType === "parent" || rel.relationshipType === "adoptive_parent") {
      add(index.childrenByParent, rel.fromCharacterId, rel.toCharacterId);
      add(index.parentsByChild, rel.toCharacterId, rel.fromCharacterId);
    } else if (rel.relationshipType === "child") {
      add(index.childrenByParent, rel.toCharacterId, rel.fromCharacterId);
      add(index.parentsByChild, rel.fromCharacterId, rel.toCharacterId);
    } else if (rel.relationshipType === "spouse") {
      add(index.spousesByCharacter, rel.fromCharacterId, rel.toCharacterId);
      add(index.spousesByCharacter, rel.toCharacterId, rel.fromCharacterId);
    } else if (rel.relationshipType === "sibling") {
      add(index.siblingsExplicitByCharacter, rel.fromCharacterId, rel.toCharacterId);
      add(index.siblingsExplicitByCharacter, rel.toCharacterId, rel.fromCharacterId);
    }
  }

  return index;
}

function rowsFor(ids: Iterable<string>, index: GenealogyIndex): HistoricalCharacterRecord[] {
  const out: HistoricalCharacterRecord[] = [];
  for (const id of ids) {
    const row = index.characterById.get(id);
    if (row) out.push(row);
  }
  return out;
}

export function parentsOf(characterId: string, index: GenealogyIndex): HistoricalCharacterRecord[] {
  return rowsFor(index.parentsByChild.get(characterId) ?? [], index);
}

export function childrenOf(characterId: string, index: GenealogyIndex): HistoricalCharacterRecord[] {
  return rowsFor(index.childrenByParent.get(characterId) ?? [], index);
}

export function spousesOf(characterId: string, index: GenealogyIndex): HistoricalCharacterRecord[] {
  return rowsFor(index.spousesByCharacter.get(characterId) ?? [], index);
}

export function siblingsOf(characterId: string, index: GenealogyIndex): HistoricalCharacterRecord[] {
  const ids = new Set(index.siblingsExplicitByCharacter.get(characterId) ?? []);
  const parents = index.parentsByChild.get(characterId) ?? new Set<string>();
  for (const parentId of parents) {
    for (const siblingId of index.childrenByParent.get(parentId) ?? []) if (siblingId !== characterId) ids.add(siblingId);
  }
  return rowsFor(ids, index);
}

function walk(startId: string, next: (id: string) => Iterable<string>, index: GenealogyIndex, maxDepth: number): HistoricalCharacterRecord[] {
  const seen = new Set<string>([startId]);
  const out: HistoricalCharacterRecord[] = [];
  let frontier = [startId];
  for (let depth = 0; depth < maxDepth && frontier.length; depth += 1) {
    const following: string[] = [];
    for (const current of frontier) {
      for (const id of next(current)) {
        if (seen.has(id)) continue;
        seen.add(id);
        const row = index.characterById.get(id);
        if (row) out.push(row);
        following.push(id);
      }
    }
    frontier = following;
  }
  return out;
}

export function ancestorsOf(characterId: string, index: GenealogyIndex, maxDepth = 16): HistoricalCharacterRecord[] {
  return walk(characterId, (id) => index.parentsByChild.get(id) ?? [], index, maxDepth);
}

export function descendantsOf(characterId: string, index: GenealogyIndex, maxDepth = 16): HistoricalCharacterRecord[] {
  return walk(characterId, (id) => index.childrenByParent.get(id) ?? [], index, maxDepth);
}

export function isAncestorOf(ancestorId: string, descendantId: string, index: GenealogyIndex, maxDepth = 16): boolean {
  return ancestorsOf(descendantId, index, maxDepth).some((row) => row.id === ancestorId);
}

/** Returns a human-readable relationship path where the stored genealogy can prove one. */
export function genealogicalPathBetween(fromId: string, toId: string, index: GenealogyIndex, maxDepth = 16): string[] | undefined {
  if (fromId === toId) return [fromId];
  const queue: Array<{ id: string; path: string[]; depth: number }> = [{ id: fromId, path: [fromId], depth: 0 }];
  const seen = new Set<string>([fromId]);
  while (queue.length) {
    const current = queue.shift()!;
    if (current.depth >= maxDepth) continue;
    const neighbors = new Set<string>();
    for (const id of index.parentsByChild.get(current.id) ?? []) neighbors.add(id);
    for (const id of index.childrenByParent.get(current.id) ?? []) neighbors.add(id);
    for (const id of index.spousesByCharacter.get(current.id) ?? []) neighbors.add(id);
    for (const id of index.siblingsExplicitByCharacter.get(current.id) ?? []) neighbors.add(id);
    for (const id of neighbors) {
      if (seen.has(id)) continue;
      const path = [...current.path, id];
      if (id === toId) return path;
      seen.add(id);
      queue.push({ id, path, depth: current.depth + 1 });
    }
  }
  return undefined;
}

export function relationshipRecordsFor(characterId: string, relationships: HistoricalRelationshipRecord[]): HistoricalRelationshipRecord[] {
  return relationships.filter((row) => row.fromCharacterId === characterId || row.toCharacterId === characterId);
}
