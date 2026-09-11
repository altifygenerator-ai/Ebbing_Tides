import type { PortArrivalAction, PortDefinition } from "../../game/types.js";

const common = (...actions: PortArrivalAction[]): PortArrivalAction[] => actions;

export const PORTS: PortDefinition[] = [
  {
    id: "port.veyrholm",
    name: "Veyrholm",
    region: "skeldra",
    role: "Royal capital / naval HQ / finance / industrial shipbuilding",
    description: "A protected cold-water harbor beneath a steep city of dark timber and stone. Royal power, naval administration, finance, ancestral institutions, and early industry crowd the waterfront.",
    point: { x: 31, y: 25 },
    approachPoint: { x: 32, y: 25 },
    governmentName: "Royal Palace & Admiralty",
    religionName: "Temple Quarter",
    arrivalActions: common(
      { id: "town", label: "Enter Town", description: "Enter Veyrholm proper and the waterfront districts." },
      { id: "market", label: "Market", description: "Trade through the capital's large harbor markets." },
      { id: "tavern", label: "Tavern", description: "Hear dockside talk, hire hands, and follow rumors." },
      { id: "harbor", label: "Harbor & Shipyard", description: "Manage Tideworn, repairs, supplies, and refits." },
      { id: "government", label: "Royal Palace & Admiralty", description: "Approach the institutions of the crown and Royal Navy." },
      { id: "religion", label: "Temple Quarter", description: "Visit the Temple of Veyr and the controversial Covenant cathedral." },
      { id: "people", label: "People", description: "Seek known captains, officials, merchants, and local figures." }
    ),
    artAssetId: "port.veyrholm.establishing",
    knownByDefault: true,
    attunementLoad: { arcane: 8, industrial: 18, sensitivity: 0.55, mitigationTags: ["mixed_capital_infrastructure"] }
  },
  {
    id: "port.ironhaven",
    name: "Ironhaven",
    region: "skeldra",
    role: "Industrial metropolis / foundries / naval engineering",
    description: "Old quays and timber districts are being overtaken by brick works, foundries, dry docks, cranes, cannon yards, and pressure machinery. Covenant charities and congregations are growing quickly among workers and migrants.",
    point: { x: 37, y: 18 },
    approachPoint: { x: 38, y: 18 },
    governmentName: "Industrial Council Offices",
    religionName: "Old Gods Halls & Covenant Hospital Quarter",
    arrivalActions: common(
      { id: "town", label: "Enter Town", description: "Enter the smoke-dark industrial districts and old quays." },
      { id: "market", label: "Market", description: "Trade industrial goods, food imports, and naval materials." },
      { id: "tavern", label: "Tavern & Dockside", description: "Talk with workers, sailors, factors, and migrants." },
      { id: "harbor", label: "Dry Docks & Shipyards", description: "Repair and refit the ship among Ironhaven's great yards." },
      { id: "government", label: "Industrial Council", description: "Visit municipal offices, guild interests, and crown representatives." },
      { id: "religion", label: "Religious Districts", description: "Old Gods halls and growing Covenant institutions compete for influence." },
      { id: "people", label: "People", description: "Seek engineers, clergy, merchants, naval buyers, and local contacts." }
    ),
    artAssetId: "port.ironhaven.establishing",
    knownByDefault: true,
    attunementLoad: { arcane: 2, industrial: 42, sensitivity: 0.9, mitigationTags: ["industrial_standardization"] }
  },
  {
    id: "port.stormvik",
    name: "Stormvik",
    region: "skeldra",
    role: "Mountain harbor / fishing / exploration / shipbuilding",
    description: "A mountain harbor with fishing fleets, exploration crews, shipyards, and a strong conservative Old Gods presence.",
    point: { x: 23, y: 17 },
    approachPoint: { x: 24, y: 17 },
    governmentName: "Harbor Thing & Crown Hall",
    religionName: "Old Gods Harbor Temple",
    arrivalActions: common(
      { id: "town", label: "Enter Town", description: "Walk the steep harbor streets and timber waterfront." },
      { id: "market", label: "Fish & Timber Market", description: "Trade the port's maritime staples and imported goods." },
      { id: "tavern", label: "Sailors' Taverns", description: "Listen for exploration news, weather talk, and crew gossip." },
      { id: "harbor", label: "Harbor & Shipwrights", description: "Use Stormvik's practical yards and fishing docks." },
      { id: "government", label: "Harbor Thing & Crown Hall", description: "Deal with local law, harbor authority, and royal officers." },
      { id: "religion", label: "Old Gods Temple", description: "Visit a stronghold of conservative Northwestern practice." },
      { id: "people", label: "People", description: "Seek captains, fishers, explorers, shipwrights, and local figures." }
    ),
    knownByDefault: true,
    artAssetId: "port.stormvik.establishing",
    attunementLoad: { arcane: 6, industrial: 6, sensitivity: 0.35, mitigationTags: [] }
  },
  {
    id: "port.thorenfjord",
    name: "Thorenfjord",
    region: "skeldra",
    role: "Ancient religious center / Great Hall of Thoren",
    description: "An old sacred city where sea roads meet ancestral pilgrimage. The Great Hall of Thoren anchors a powerful traditionalist current within modern Skeldra.",
    point: { x: 34, y: 5 },
    approachPoint: { x: 33, y: 5 },
    governmentName: "Royal Steward's Hall",
    religionName: "Great Hall of Thoren",
    arrivalActions: common(
      { id: "town", label: "Enter Sacred City", description: "Enter the old pilgrimage streets and harbor quarter." },
      { id: "market", label: "Pilgrim Market", description: "Trade food, crafts, offerings, and maritime goods." },
      { id: "tavern", label: "Pilgrim Inns & Taverns", description: "Hear the talk of sailors, worshippers, and travelers." },
      { id: "harbor", label: "Harbor", description: "Attend to Tideworn at the sacred city's working docks." },
      { id: "government", label: "Royal Steward's Hall", description: "Visit the crown's local administrative seat." },
      { id: "religion", label: "Great Hall of Thoren", description: "Enter one of Skeldra's great ancestral holy places." },
      { id: "people", label: "People", description: "Seek priests, pilgrims, traditionalists, captains, and craftsmen." }
    ),
    knownByDefault: true,
    attunementLoad: { arcane: 20, industrial: 2, sensitivity: 0.65, mitigationTags: ["sacred_site_practice"] }
  }
];

export const PORT_BY_ID = Object.fromEntries(PORTS.map((port) => [port.id, port])) as Record<string, PortDefinition>;
