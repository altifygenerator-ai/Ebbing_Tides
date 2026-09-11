export const POINTS_OF_INTEREST = [
    {
        id: "poi.greywater_wrecks",
        name: "Greywater Wrecks",
        region: "skeldra",
        type: "wreck_site",
        role: "Rumored wreck-water / salvage hazard",
        description: "A cold patch of broken water west of the Skeldran coast where sailors report wreckage, missing boats, and lights seen after dark. What is actually here is determined by the persistent world state, not a guaranteed quest reward.",
        point: { x: 18, y: 22 },
        approachPoint: { x: 18, y: 22 },
        arrivalActions: [
            { id: "enter_site", label: "Enter the Wreck Site", description: "Bring Tideworn into the wreck-water and begin a closer investigation." },
            { id: "observe", label: "Observe from Ship", description: "Use the lookout and spyglass before risking boats or crew." },
            { id: "salvage", label: "Lower Boats / Salvage", description: "Send a working party among visible wreckage if conditions permit." },
            { id: "search", label: "Search the Water", description: "Spend time looking for debris, survivors, cargo, or signs of what happened." }
        ],
        artAssetId: "poi.greywater_wrecks.establishing",
        knownByDefault: true,
        attunementLoad: { arcane: 10, industrial: 0, sensitivity: 0.6, mitigationTags: [] }
    },
    {
        id: "poi.old_veyr_beacon",
        name: "Old Veyr Beacon",
        region: "skeldra",
        type: "landfall",
        role: "Ancient coastal navigation shrine / landmark",
        description: "A weather-blackened beacon and rune-marked stone on a small Skeldran islet. Sailors still use it as a practical landmark even as its older ritual purpose fades from common memory.",
        point: { x: 26, y: 21 },
        approachPoint: { x: 27, y: 21 },
        arrivalActions: [
            { id: "enter_site", label: "Land at the Beacon", description: "Anchor off the islet and put a small party ashore." },
            { id: "observe", label: "Circle and Observe", description: "Inspect the shore, currents, and beacon from the ship." },
            { id: "land_party", label: "Send a Shore Party", description: "Put crew ashore to examine the structure and surrounding rocks." },
            { id: "search", label: "Search the Islet", description: "Spend time searching the beacon, shoreline, and old carved stones." }
        ],
        artAssetId: "poi.old_veyr_beacon.establishing",
        knownByDefault: true,
        attunementLoad: { arcane: 16, industrial: 0, sensitivity: 0.7, mitigationTags: ["old_ritual_stone"] }
    }
];
export const POI_BY_ID = Object.fromEntries(POINTS_OF_INTEREST.map((poi) => [poi.id, poi]));
//# sourceMappingURL=pois.js.map