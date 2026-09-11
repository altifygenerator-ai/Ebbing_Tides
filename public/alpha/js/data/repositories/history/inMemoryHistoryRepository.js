import { historicalDateSortKey } from "../../../game/time/calendar.js";
function startKey(date) {
    return historicalDateSortKey(date) ?? Number.NEGATIVE_INFINITY;
}
export class InMemoryHistoryRepository {
    seed;
    constructor(seed) {
        this.seed = seed;
    }
    getCharacter(id) { return this.seed.characters.find((row) => row.id === id); }
    getHouse(id) { return this.seed.houses.find((row) => row.id === id); }
    getRelationshipsForCharacter(characterId) { return this.seed.relationships.filter((row) => row.fromCharacterId === characterId || row.toCharacterId === characterId); }
    getEvent(id) { return this.seed.events.find((row) => row.id === id); }
    getOffice(id) { return this.seed.offices.find((row) => row.id === id); }
    getOfficeTerms(officeId) {
        return this.seed.officeTerms.filter((row) => row.officeId === officeId).sort((a, b) => startKey(a.startDate) - startKey(b.startDate));
    }
    getClaimsForOffice(officeId) { return this.seed.claims.filter((row) => row.targetOfficeId === officeId); }
    getShip(id) { return this.seed.ships.find((row) => row.id === id); }
    getSource(id) { return this.seed.sources.find((row) => row.id === id); }
    getInterpretationsForEvent(eventId) { return this.seed.interpretations.filter((row) => row.eventId === eventId); }
    getSeedSnapshot() { return structuredClone(this.seed); }
}
//# sourceMappingURL=inMemoryHistoryRepository.js.map