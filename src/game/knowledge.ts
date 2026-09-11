import type { CharacterCreationChoices, KnowledgeRecord } from "./types.js";
import { originSettlementName } from "../data/seed/origins.js";
import { PORT_BY_ID } from "../data/seed/ports.js";

function record(
  id: string,
  category: KnowledgeRecord["category"],
  text: string,
  source: string,
  confidence: number,
  hardRumor = true,
  subjectId?: string
): KnowledgeRecord {
  return {
    id,
    claimKey: id,
    category,
    text,
    source,
    learnedAtHour: 0,
    observedAtHour: 0,
    refreshedAtHour: 0,
    ...(id.startsWith("rumor.") ? { staleAfterHours: category === "trade" ? 72 : category === "maritime" || category === "danger" ? 120 : 336 } : {}),
    confidence,
    truthStatus: id.startsWith("knowledge.") ? "confirmed" : "unknown",
    informationState: "current",
    hardRumor: id.startsWith("knowledge.") ? false : hardRumor,
    ...(subjectId ? { subjectId } : {})
  };
}

export function initializeStartingKnowledge(choices: CharacterCreationChoices): KnowledgeRecord[] {
  const out: KnowledgeRecord[] = [];

  out.push(record(
    `knowledge.home.${choices.homeSettlementId}`,
    "local",
    `You know ${originSettlementName(choices.homeSettlementId)} as home: its ordinary districts, local routines, customs, and approaches are part of your lived experience.`,
    "Personal experience",
    95,
    true,
    choices.homeSettlementId
  ));

  if (choices.startingLocationId !== choices.homeSettlementId) {
    const startName = PORT_BY_ID[choices.startingLocationId]?.name ?? choices.startingLocationId;
    out.push(record(`knowledge.start.${choices.startingLocationId}`, "local", `Your campaign begins at ${startName}. You know the immediate harbor arrangements needed to provision, depart, and conduct ordinary business, but this is not treated as your homeland.`, "Current circumstances", 82, true, choices.startingLocationId));
  }

  if (choices.background === "former_naval_midshipman" || choices.recentProfession === "sailor") {
    out.push(record("rumor.ingrid.near_veyrholm", "maritime", "Captain Ingrid Skar and Stormcrow have been operating near Veyrholm.", "Naval and sailor talk", 78, true, "character.ingrid_skar"));
    out.push(record("rumor.missing.greywater", "danger", "Two ships are said to be missing near Greywater. The reports disagree on the cause.", "Crew gossip", 54));
    out.push(record("rumor.lights.thorenfjord", "local", "Drunken fishermen have been speaking of lights beneath the sea near Thorenfjord.", "Waterfront gossip", 38, false, "port.thorenfjord"));
  }

  if (choices.background === "foundry_child" || choices.recentProfession === "apprentice_engineer") {
    out.push(record("rumor.braeg.pressure_system", "local", "Braeg Iron & Steam is said to be testing a new pressure system in Ironhaven.", "Workshop talk", 76, true, "port.ironhaven"));
    out.push(record("rumor.coal.delayed", "trade", "Coal shipments into some Ironhaven works have been delayed despite the city's own heavy production.", "Foundry workers", 64));
    out.push(record("rumor.navy.components", "political", "The navy has been buying precision components through Ironhaven contractors.", "Supplier talk", 70));
  }

  if (choices.socialOrigin === "merchant_family" || choices.recentProfession === "merchant_clerk") {
    out.push(record("rumor.grain.ironhaven", "trade", "Grain has reportedly been expensive in Ironhaven recently.", "Merchant correspondence", 82, true, "port.ironhaven"));
    out.push(record("rumor.fish.stormvik", "trade", "Salted fish is usually plentiful around Stormvik compared with the industrial ports.", "Family trade knowledge", 88));
  }

  if (choices.background === "raised_among_smugglers") {
    out.push(record("rumor.customs.veyrholm", "danger", "Veyrholm harbor inspections have been less predictable since a recent customs rotation.", "Smuggler network", 61));
    out.push(record("rumor.privateer.providence", "maritime", "Providence is a merchant/privateer vessel worth recognizing before you make assumptions about an easy prize.", "Dockside warning", 74, true, "ship.providence"));
  }

  if (choices.religion === "covenant") {
    out.push(record("knowledge.korr.ironhaven", "religious", "Pastor Elias Korr runs a hospital, kitchens, and a school in Ironhaven and publicly condemns forced conversion and religious violence.", "Covenant network", 90, true, "character.pastor_elias_korr"));
  } else if (choices.religion === "old_gods") {
    out.push(record("knowledge.thorenfjord.sacred", "religious", "Thorenfjord remains one of the strongest Old Gods sacred centers in Skeldra, anchored by the Great Hall of Thoren.", "Cultural knowledge", 94, true, "port.thorenfjord"));
  }

  if (!out.some((item) => item.category === "trade")) {
    out.push(record("rumor.grain.ironhaven", "trade", "Grain is said to be dearer in Ironhaven than in the capital's better-supplied markets.", "Sailor market talk", 65, true, "port.ironhaven"));
  }

  return out.slice(0, 7);
}
