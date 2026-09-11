import type {
  ClaimRecord, HistoricalCharacterRecord, HistoricalDatabaseSeed, HistoricalEventRecord, HistoricalInterpretationRecord,
  HistoricalRelationshipRecord, HistoricalSourceRecord, HouseRecord, OfficeRecord, OfficeTermRecord, HistoricalShipRecord
} from "../../../types/history.js";

export interface HistoryRepository {
  getCharacter(id: string): HistoricalCharacterRecord | undefined;
  getHouse(id: string): HouseRecord | undefined;
  getRelationshipsForCharacter(characterId: string): HistoricalRelationshipRecord[];
  getEvent(id: string): HistoricalEventRecord | undefined;
  getOffice(id: string): OfficeRecord | undefined;
  getOfficeTerms(officeId: string): OfficeTermRecord[];
  getClaimsForOffice(officeId: string): ClaimRecord[];
  getShip(id: string): HistoricalShipRecord | undefined;
  getSource(id: string): HistoricalSourceRecord | undefined;
  getInterpretationsForEvent(eventId: string): HistoricalInterpretationRecord[];
  getSeedSnapshot(): HistoricalDatabaseSeed;
}
