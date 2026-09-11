function add(map, key, value) {
    const set = map.get(key) ?? new Set();
    set.add(value);
    map.set(key, set);
}
export function buildGenealogyIndex(seed) {
    const index = {
        characterById: new Map(seed.characters.map((row) => [row.id, row])),
        parentsByChild: new Map(), childrenByParent: new Map(), spousesByCharacter: new Map(), siblingsExplicitByCharacter: new Map()
    };
    for (const rel of seed.relationships) {
        if (rel.relationshipType === "parent" || rel.relationshipType === "adoptive_parent") {
            add(index.childrenByParent, rel.fromCharacterId, rel.toCharacterId);
            add(index.parentsByChild, rel.toCharacterId, rel.fromCharacterId);
        }
        else if (rel.relationshipType === "child") {
            add(index.childrenByParent, rel.toCharacterId, rel.fromCharacterId);
            add(index.parentsByChild, rel.fromCharacterId, rel.toCharacterId);
        }
        else if (rel.relationshipType === "spouse") {
            add(index.spousesByCharacter, rel.fromCharacterId, rel.toCharacterId);
            add(index.spousesByCharacter, rel.toCharacterId, rel.fromCharacterId);
        }
        else if (rel.relationshipType === "sibling") {
            add(index.siblingsExplicitByCharacter, rel.fromCharacterId, rel.toCharacterId);
            add(index.siblingsExplicitByCharacter, rel.toCharacterId, rel.fromCharacterId);
        }
    }
    return index;
}
function rowsFor(ids, index) {
    const out = [];
    for (const id of ids) {
        const row = index.characterById.get(id);
        if (row)
            out.push(row);
    }
    return out;
}
export function parentsOf(characterId, index) {
    return rowsFor(index.parentsByChild.get(characterId) ?? [], index);
}
export function childrenOf(characterId, index) {
    return rowsFor(index.childrenByParent.get(characterId) ?? [], index);
}
export function spousesOf(characterId, index) {
    return rowsFor(index.spousesByCharacter.get(characterId) ?? [], index);
}
export function siblingsOf(characterId, index) {
    const ids = new Set(index.siblingsExplicitByCharacter.get(characterId) ?? []);
    const parents = index.parentsByChild.get(characterId) ?? new Set();
    for (const parentId of parents) {
        for (const siblingId of index.childrenByParent.get(parentId) ?? [])
            if (siblingId !== characterId)
                ids.add(siblingId);
    }
    return rowsFor(ids, index);
}
function walk(startId, next, index, maxDepth) {
    const seen = new Set([startId]);
    const out = [];
    let frontier = [startId];
    for (let depth = 0; depth < maxDepth && frontier.length; depth += 1) {
        const following = [];
        for (const current of frontier) {
            for (const id of next(current)) {
                if (seen.has(id))
                    continue;
                seen.add(id);
                const row = index.characterById.get(id);
                if (row)
                    out.push(row);
                following.push(id);
            }
        }
        frontier = following;
    }
    return out;
}
export function ancestorsOf(characterId, index, maxDepth = 16) {
    return walk(characterId, (id) => index.parentsByChild.get(id) ?? [], index, maxDepth);
}
export function descendantsOf(characterId, index, maxDepth = 16) {
    return walk(characterId, (id) => index.childrenByParent.get(id) ?? [], index, maxDepth);
}
export function isAncestorOf(ancestorId, descendantId, index, maxDepth = 16) {
    return ancestorsOf(descendantId, index, maxDepth).some((row) => row.id === ancestorId);
}
/** Returns a human-readable relationship path where the stored genealogy can prove one. */
export function genealogicalPathBetween(fromId, toId, index, maxDepth = 16) {
    if (fromId === toId)
        return [fromId];
    const queue = [{ id: fromId, path: [fromId], depth: 0 }];
    const seen = new Set([fromId]);
    while (queue.length) {
        const current = queue.shift();
        if (current.depth >= maxDepth)
            continue;
        const neighbors = new Set();
        for (const id of index.parentsByChild.get(current.id) ?? [])
            neighbors.add(id);
        for (const id of index.childrenByParent.get(current.id) ?? [])
            neighbors.add(id);
        for (const id of index.spousesByCharacter.get(current.id) ?? [])
            neighbors.add(id);
        for (const id of index.siblingsExplicitByCharacter.get(current.id) ?? [])
            neighbors.add(id);
        for (const id of neighbors) {
            if (seen.has(id))
                continue;
            const path = [...current.path, id];
            if (id === toId)
                return path;
            seen.add(id);
            queue.push({ id, path, depth: current.depth + 1 });
        }
    }
    return undefined;
}
export function relationshipRecordsFor(characterId, relationships) {
    return relationships.filter((row) => row.fromCharacterId === characterId || row.toCharacterId === characterId);
}
//# sourceMappingURL=genealogy.js.map