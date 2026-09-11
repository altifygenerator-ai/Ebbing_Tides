import type { HistoricalEventRecord, HistoricalEventType } from "../../types/history.js";
import type { WorldEvent } from "../types.js";
import { historicalDateFromWorldDate, worldDateFromAbsoluteHour } from "../time/calendar.js";

const EVENT_TYPE_MAP: Record<string, HistoricalEventType> = {
  birth: "birth", death: "death", marriage: "marriage", coronation: "coronation", election: "election", appointment: "appointment",
  deposition: "deposition", conversion: "conversion", war_declaration: "war_declaration", battle: "battle", treaty: "treaty",
  rebellion: "rebellion", assassination: "assassination", voyage: "voyage", shipwreck: "shipwreck", religious_council: "religious_council",
  institution_founding: "institution_founding", succession_dispute: "succession_dispute", discovery: "discovery", disaster: "disaster",
  economic_crisis: "economic_crisis", campaign_begin: "campaign_begin", arrival: "arrival", combat: "combat"
};

/**
 * Runtime events and authored pre-628 events converge on the same HistoricalEventRecord contract.
 * The adapter does not automatically persist every routine event to the historical DB; later simulation decides promotion/importance.
 */
export function runtimeWorldEventToHistoricalEvent(event: WorldEvent): HistoricalEventRecord {
  const date = worldDateFromAbsoluteHour(event.atHour);
  return {
    id: `history.runtime.${event.id}`,
    eventType: EVENT_TYPE_MAP[event.type] ?? "other",
    title: event.summary,
    date: historicalDateFromWorldDate(date),
    ...(event.locationId ? { locationId: event.locationId } : {}),
    participantCharacterIds: event.participants.filter((id) => id.startsWith("character.")),
    factionIds: [],
    description: event.summary,
    canonicalStatus: "canonical",
    origin: "simulated",
    sourceConfidence: 100,
    createdBySystem: "runtime_world_event_adapter",
    simulationEventId: event.id
  };
}
