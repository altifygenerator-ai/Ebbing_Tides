import type { PortDefinition } from "../../game/types.js";

// Coordinates/distances are ALPHA_PROVISIONAL because the bible explicitly leaves exact map geometry unresolved.
// IDs, names, regional identities and port roles are stable seed data from the build-start bible.
export const PORTS: PortDefinition[] = [
  {
    id: "port.veyrholm",
    name: "Veyrholm",
    region: "skeldra",
    role: "Royal capital / naval HQ / finance / industrial shipbuilding",
    description: "A protected cold-water harbor beneath a steep city of dark timber and stone. Royal power, naval administration, finance, ancestral institutions, and early industry crowd the waterfront.",
    point: { x: 5, y: 5 },
    artAssetId: "port.veyrholm.establishing",
    knownByDefault: true
  },
  {
    id: "port.ironhaven",
    name: "Ironhaven",
    region: "skeldra",
    role: "Industrial metropolis / foundries / naval engineering",
    description: "Old quays and timber districts are being overtaken by brick works, foundries, dry docks, cranes, cannon yards, and pressure machinery. Covenant charities and congregations are growing quickly among workers and migrants.",
    point: { x: 9, y: 5 },
    artAssetId: "port.ironhaven.establishing",
    knownByDefault: true
  },
  {
    id: "port.stormvik",
    name: "Stormvik",
    region: "skeldra",
    role: "Mountain harbor / fishing / exploration / shipbuilding",
    description: "A mountain harbor with fishing fleets, exploration crews, shipyards, and a strong conservative Old Gods presence.",
    point: { x: 2, y: 3 },
    knownByDefault: true
  },
  {
    id: "port.thorenfjord",
    name: "Thorenfjord",
    region: "skeldra",
    role: "Ancient religious center / Great Hall of Thoren",
    description: "An old sacred city where sea roads meet ancestral pilgrimage. The Great Hall of Thoren anchors a powerful traditionalist current within modern Skeldra.",
    point: { x: 6, y: 1 },
    knownByDefault: true
  }
];

export const PORT_BY_ID = Object.fromEntries(PORTS.map((port) => [port.id, port])) as Record<string, PortDefinition>;
