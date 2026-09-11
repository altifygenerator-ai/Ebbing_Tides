import type { HistoricalDatabaseSeed, HistoricalDate } from "../../../types/history.js";
import { historicalDateSortKey } from "../../../game/time/calendar.js";
import type { HistoryRepository } from "./historyRepository.js";

function startKey(date: HistoricalDate): number {
  return historicalDateSortKey(date) ?? Number.NEGATIVE_INFINITY;
}

export class InMemoryHistoryRepository implements HistoryRepository {
  constructor(private readonly seed: HistoricalDatabaseSeed) {}

  getCharacter(id: string) { return this.seed.characters.find((row) => row.id === id); }
  getHouse(id: string) { return this.seed.houses.find((row) => row.id === id); }
  getRelationshipsForCharacter(characterId: string) { return this.seed.relationships.filter((row) => row.fromCharacterId === characterId || row.toCharacterId === characterId); }
  getEvent(id: string) { return this.seed.events.find((row) => row.id === id); }
  getOffice(id: string) { return this.seed.offices.find((row) => row.id === id); }
  getOfficeTerms(officeId: string) {
    return this.seed.officeTerms.filter((row) => row.officeId === officeId).sort((a, b) => startKey(a.startDate) - startKey(b.startDate));
  }
  getClaimsForOffice(officeId: string) { return this.seed.claims.filter((row) => row.targetOfficeId === officeId); }
  getShip(id: string) { return this.seed.ships.find((row) => row.id === id); }
  getSource(id: string) { return this.seed.sources.find((row) => row.id === id); }
  getInterpretationsForEvent(eventId: string) { return this.seed.interpretations.filter((row) => row.eventId === eventId); }
  getSeedSnapshot(): HistoricalDatabaseSeed { return structuredClone(this.seed); }
}
