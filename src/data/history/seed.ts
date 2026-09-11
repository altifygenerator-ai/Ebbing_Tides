import type { HistoricalDatabaseSeed, HistoricalDate } from "../../types/history.js";

const UNKNOWN: HistoricalDate = { precision: "unknown" };
const YEAR = (year: number): HistoricalDate => ({ precision: "year", year });

/**
 * Alpha 0.6A intentionally small validation seed.
 * It proves the historical model without pre-populating the broader 0.6B genealogy/history pass.
 */
export const HISTORICAL_FOUNDATION_SEED: HistoricalDatabaseSeed = {
  characters: [
    {
      id: "character.eirik_iii_vaering", name: "Eirik III Vaering", sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods",
      birthDate: YEAR(533), deathDate: YEAR(613), socialStatus: "royal", houseId: "house.vaering",
      notes: "King before Eirik IV; father of Eirik IV.", origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.eirik_iv_vaering", name: "Eirik IV Vaering", sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods",
      birthDate: YEAR(565), deathDate: UNKNOWN, socialStatus: "king", houseId: "house.vaering",
      notes: "King of Skeldra in 628 CR.", origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.leif_vaering", name: "Leif Vaering", sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods",
      birthDate: YEAR(592), deathDate: UNKNOWN, socialStatus: "crown_prince", houseId: "house.vaering",
      notes: "Legal heir in 628 CR.", origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.freya_vaering", name: "Freya Vaering", sex: "female", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods",
      birthDate: YEAR(596), deathDate: UNKNOWN, socialStatus: "princess", houseId: "house.vaering",
      notes: "Princess of Skeldra in 628 CR.", origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.torvald_vaering", name: "Torvald Vaering", sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods",
      birthDate: YEAR(604), deathDate: UNKNOWN, socialStatus: "prince", houseId: "house.vaering",
      notes: "Prince of Skeldra in 628 CR.", origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.jessa_corven", name: "Jessa Corven", sex: "unknown", ancestry: "unknown", homelandRegion: "outer_isles", culture: "outer_isles", religion: "unknown",
      birthDate: YEAR(560), deathDate: YEAR(607), socialStatus: "high_captain",
      notes: "Blackhaven High Captain, 596-607 CR.", origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.bran_garric", name: "Bran Garric", sex: "unknown", ancestry: "unknown", homelandRegion: "outer_isles", culture: "outer_isles", religion: "unknown",
      birthDate: UNKNOWN, deathDate: UNKNOWN, socialStatus: "high_captain",
      notes: "Blackhaven High Captain, 607-616 CR.", origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.niko_serrat", name: "Niko Serrat", sex: "unknown", ancestry: "unknown", homelandRegion: "outer_isles", culture: "outer_isles", religion: "unknown",
      birthDate: UNKNOWN, deathDate: UNKNOWN, socialStatus: "high_captain",
      notes: "Blackhaven High Captain, 616-623 CR.", origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.mara_voss", name: "Mara Voss", sex: "female", ancestry: "mixed", homelandRegion: "outer_isles", culture: "outer_isles", religion: "old_gods",
      birthDate: YEAR(584), deathDate: UNKNOWN, socialStatus: "high_captain",
      notes: "High Captain of Blackhaven in 628 CR; captain of Widow's Mercy.", origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    }
  ],
  relationships: [
    { id: "relationship.eirik_iii.parent.eirik_iv", fromCharacterId: "character.eirik_iii_vaering", toCharacterId: "character.eirik_iv_vaering", relationshipType: "parent", startDate: YEAR(565), endDate: YEAR(613), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.eirik_iv.child.leif", fromCharacterId: "character.eirik_iv_vaering", toCharacterId: "character.leif_vaering", relationshipType: "parent", startDate: YEAR(592), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.eirik_iv.child.freya", fromCharacterId: "character.eirik_iv_vaering", toCharacterId: "character.freya_vaering", relationshipType: "parent", startDate: YEAR(596), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.eirik_iv.child.torvald", fromCharacterId: "character.eirik_iv_vaering", toCharacterId: "character.torvald_vaering", relationshipType: "parent", startDate: YEAR(604), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" }
  ],
  houses: [
    {
      id: "house.vaering", name: "House Vaering", culture: "skeldran", region: "skeldra",
      foundedDate: { precision: "approximate", year: 225 }, endedDate: UNKNOWN,
      notes: "Skeldran royal house; the earliest claimed descent from Vaer the Red is partly traditional.",
      status: "active", origin: "authored", canonicalStatus: "canonical"
    }
  ],
  offices: [
    {
      id: "office.skeldra.king", name: "King of Skeldra", region: "skeldra", selectionMode: "hereditary", hereditaryByDefault: true,
      notes: "Royal office; succession law is not reduced to a single hard-coded primogeniture rule.", origin: "authored", canonicalStatus: "canonical"
    },
    {
      id: "office.blackhaven.high_captain", name: "High Captain of Blackhaven", region: "outer_isles", selectionMode: "elected", hereditaryByDefault: false,
      notes: "Political office dependent on recognized captains, alliances, intimidation, bribery, and force rather than hereditary right.", origin: "authored", canonicalStatus: "canonical"
    }
  ],
  officeTerms: [
    { id: "term.skeldra.eirik_iii", officeId: "office.skeldra.king", holderCharacterId: "character.eirik_iii_vaering", startDate: UNKNOWN, endDate: YEAR(613), endReason: "death", interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.skeldra.eirik_iv", officeId: "office.skeldra.king", holderCharacterId: "character.eirik_iv_vaering", startDate: YEAR(613), endDate: UNKNOWN, interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.blackhaven.jessa_corven", officeId: "office.blackhaven.high_captain", holderCharacterId: "character.jessa_corven", startDate: YEAR(596), endDate: YEAR(607), endReason: "term_transition", interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.blackhaven.bran_garric", officeId: "office.blackhaven.high_captain", holderCharacterId: "character.bran_garric", startDate: YEAR(607), endDate: YEAR(616), endReason: "term_transition", interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.blackhaven.niko_serrat", officeId: "office.blackhaven.high_captain", holderCharacterId: "character.niko_serrat", startDate: YEAR(616), endDate: YEAR(623), endReason: "election", interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.blackhaven.mara_voss", officeId: "office.blackhaven.high_captain", holderCharacterId: "character.mara_voss", startDate: YEAR(623), endDate: UNKNOWN, interim: false, origin: "authored", canonicalStatus: "canonical" }
  ],
  claims: [
    {
      id: "claim.leif.skeldran_crown", claimantCharacterId: "character.leif_vaering", targetOfficeId: "office.skeldra.king", basis: "direct_descent",
      strength: 90, priority: 1, legalBasis: "Recognized legal heir in 628 CR.", genealogicalPath: ["character.leif_vaering", "character.eirik_iv_vaering"],
      disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical"
    }
  ],
  events: [
    {
      id: "history.event.eirik_iii_death.613", eventType: "death", title: "Death of Eirik III", date: YEAR(613), locationId: "region.skeldra",
      participantCharacterIds: ["character.eirik_iii_vaering"], factionIds: ["house.vaering"],
      description: "Eirik III Vaering died in 613 CR.", canonicalStatus: "canonical", origin: "authored", sourceConfidence: 100, importedFromSeed: "0.6A"
    },
    {
      id: "history.event.eirik_iv_accession.613", eventType: "coronation", title: "Eirik IV becomes King", date: YEAR(613), locationId: "region.skeldra",
      participantCharacterIds: ["character.eirik_iv_vaering"], factionIds: ["house.vaering"],
      description: "Eirik IV peacefully succeeded Eirik III as King of Skeldra.", canonicalStatus: "canonical", origin: "authored", sourceConfidence: 100, importedFromSeed: "0.6A"
    },
    {
      id: "history.event.iron_fleet_program.614", eventType: "other", title: "Iron Fleet Program", date: YEAR(614), locationId: "region.skeldra",
      participantCharacterIds: [], factionIds: [], description: "Skeldra began a program of heavily reinforced warships with increasing iron and mechanical systems.",
      canonicalStatus: "canonical", origin: "authored", sourceConfidence: 100, importedFromSeed: "0.6A"
    },
    {
      id: "history.event.vespera_riots.621", eventType: "rebellion", title: "Vespera Riots", date: YEAR(621), locationId: "origin.vespera",
      participantCharacterIds: [], factionIds: [], description: "A false atrocity rumor caused riots in Vespera in which 27 people died; the rumor was later shown to be false.",
      canonicalStatus: "canonical", origin: "authored", sourceConfidence: 100, importedFromSeed: "0.6A"
    }
  ],
  eventLinks: [
    { id: "history.link.eirik_death_to_accession", sourceEventId: "history.event.eirik_iii_death.613", targetEventId: "history.event.eirik_iv_accession.613", relationType: "enabled", notes: "The king's death opened the office for succession.", origin: "authored", canonicalStatus: "canonical" },
    { id: "history.link.accession_to_iron_fleet", sourceEventId: "history.event.eirik_iv_accession.613", targetEventId: "history.event.iron_fleet_program.614", relationType: "enabled", notes: "The new reign continued modernization into the Iron Fleet Program.", origin: "authored", canonicalStatus: "canonical" }
  ],
  institutions: [],
  wars: [],
  battles: [],
  treaties: [],
  ships: [
    {
      id: "history.ship.widows_mercy", name: "Widow's Mercy", builtDate: UNKNOWN, lossDate: UNKNOWN,
      fameTags: ["Blackhaven", "Mara Voss"], origin: "authored", canonicalStatus: "canonical"
    }
  ],
  shipOwnership: [
    {
      id: "history.ship_ownership.widows_mercy.unknown", shipId: "history.ship.widows_mercy", ownershipStatus: "unknown",
      startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical_uncertain"
    }
  ],
  shipCommands: [
    {
      id: "history.ship_command.widows_mercy.mara_voss", shipId: "history.ship.widows_mercy", captainCharacterId: "character.mara_voss",
      startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical"
    }
  ],
  shipRefits: [],
  shipRenames: [],
  sources: [
    {
      id: "history.source.vespera_riot_contemporary_claim", title: "Contemporary Vespera atrocity account", dateWritten: YEAR(621),
      sourceType: "pamphlet", reliability: 20, biasTags: ["atrocity_rumor"], summary: "A contemporary account repeating the atrocity claim that helped inflame the riots.", origin: "authored", canonicalStatus: "provisional"
    },
    {
      id: "history.source.vespera_riot_later_inquiry", title: "Later inquiry into the Vespera riots", dateWritten: { precision: "approximate", year: 621 },
      sourceType: "official_record", reliability: 85, biasTags: ["official_inquiry"], summary: "A later finding concluding that the atrocity claim was false.", origin: "authored", canonicalStatus: "provisional"
    }
  ],
  interpretations: [
    {
      id: "history.interpretation.vespera_claim_true", sourceId: "history.source.vespera_riot_contemporary_claim", eventId: "history.event.vespera_riots.621",
      interpretation: "The reported atrocity occurred and justified retaliation.", confidence: 30,
      disagreementWithInterpretationIds: ["history.interpretation.vespera_claim_false"], origin: "authored", canonicalStatus: "disputed"
    },
    {
      id: "history.interpretation.vespera_claim_false", sourceId: "history.source.vespera_riot_later_inquiry", eventId: "history.event.vespera_riots.621",
      interpretation: "The atrocity report was false; the rumor itself helped cause the violence.", confidence: 90,
      disagreementWithInterpretationIds: ["history.interpretation.vespera_claim_true"], origin: "authored", canonicalStatus: "canonical"
    }
  ]
};
