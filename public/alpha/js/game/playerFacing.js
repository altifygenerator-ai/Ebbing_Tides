import { COMMODITY_BY_ID } from "../data/seed/commodities.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { knowledgeFreshnessAtHour } from "./information.js";
export function relationshipStatus(npc) {
    const r = npc.relationshipToPlayer;
    if (r.hatred >= 65 || (r.suspicion >= 75 && r.trust <= 20))
        return "Hostile";
    if (r.hatred >= 38 || r.suspicion >= 62)
        return "Suspicious";
    if (r.fear >= 65 && r.respect < 45)
        return "Afraid";
    if (r.obligation >= 55)
        return "Owes You";
    if (r.trust >= 72 && r.respect >= 58)
        return "Trusted";
    if (r.respect >= 70)
        return "Respects You";
    if (r.affection >= 62 && r.trust >= 48)
        return "Friendly";
    if (r.suspicion >= 38 || r.trust < 28)
        return "Wary";
    if (r.trust >= 48 || r.respect >= 48)
        return "Familiar";
    return "Neutral";
}
export function knowledgeConfidenceBand(record, absoluteHour) {
    const freshness = absoluteHour === undefined ? undefined : knowledgeFreshnessAtHour(record, absoluteHour);
    if (freshness === "contradicted" || record.truthStatus === "disproved")
        return "Contradicted";
    if (freshness === "superseded")
        return "Superseded";
    if (freshness === "stale")
        return "Stale";
    if (record.truthStatus === "confirmed")
        return freshness === "aging" ? "Confirmed · aging" : "Confirmed";
    const base = record.confidence >= 82 ? "Strong lead" : record.confidence >= 62 ? "Credible" : record.confidence >= 42 ? "Uncertain" : "Thin rumor";
    return freshness === "aging" ? `${base} · aging` : base;
}
export function marketSignals(state, portId) {
    const market = state.markets[portId];
    if (!market)
        return [];
    const commerce = state.player.character.skills.commerce;
    const rows = Object.entries(market.goods).map(([commodityId, row]) => {
        const ratio = row.targetStock > 0 ? row.stock / row.targetStock : 1;
        return { commodityId, ratio };
    });
    const shortages = [...rows].filter((r) => r.ratio < .9).sort((a, b) => a.ratio - b.ratio);
    const surpluses = [...rows].filter((r) => r.ratio > 1.1).sort((a, b) => b.ratio - a.ratio);
    const out = [];
    const shortage = shortages[0];
    const surplus = surpluses[0];
    if (shortage) {
        const name = COMMODITY_BY_ID[shortage.commodityId]?.name ?? shortage.commodityId;
        out.push({ commodityId: shortage.commodityId, label: name, tone: "shortage", text: commerce >= 45 ? `${name} is genuinely scarce here; expect firm prices and useful selling opportunities.` : `${name} looks scarce on the quay.` });
    }
    if (commerce >= 28 && surplus) {
        const name = COMMODITY_BY_ID[surplus.commodityId]?.name ?? surplus.commodityId;
        out.push({ commodityId: surplus.commodityId, label: name, tone: "surplus", text: commerce >= 55 ? `${name} is sitting heavy in local stores; this is the kind of cargo worth pricing elsewhere.` : `${name} appears plentiful here.` });
    }
    if (!out.length)
        out.push({ commodityId: "", label: "Market", tone: "steady", text: "Nothing on the exchange stands out as a severe shortage or glut right now." });
    return out.slice(0, commerce >= 55 ? 3 : commerce >= 28 ? 2 : 1);
}
export function portReadLens(state) {
    const c = state.player.character;
    if (c.background === "raised_among_smugglers" || c.recentProfession === "smuggler")
        return { id: "underworld", label: "Read the Back Channels", skillId: "streetwise", attributeId: "presence", category: "danger", source: "Smuggler experience" };
    if (c.background === "foundry_child" || c.background === "engineers_apprentice" || c.recentProfession === "apprentice_engineer" || c.recentProfession === "shipwright")
        return { id: "industrial", label: "Walk the Yards", skillId: "engineering", attributeId: "intellect", category: "local", source: "Technical experience" };
    if (c.background === "temple_educated" || c.background === "raised_by_monks" || c.recentProfession === "scholar" || c.recentProfession === "priest")
        return { id: "scholarly", label: "Read the Institutions", skillId: "scholarship", attributeId: "intellect", category: "political", source: "Scholarly experience" };
    if (c.recentProfession === "merchant_clerk" || c.socialOrigin === "merchant_family")
        return { id: "trade", label: "Read the Exchange", skillId: "commerce", attributeId: "intellect", category: "trade", source: "Merchant experience" };
    if (c.background === "former_naval_midshipman" || ["navigator", "sailor", "marine", "gunner"].includes(c.recentProfession))
        return { id: "maritime", label: "Read the Waterfront", skillId: "navigation", attributeId: "perception", category: "maritime", source: "Maritime experience" };
    return { id: "social", label: "Take the Measure of the Port", skillId: "persuasion", attributeId: "presence", category: "local", source: "Personal observation" };
}
export function shipBuildRole(ship) {
    const cargo = ship.cargoCapacity;
    const combat = ship.firepower + ship.maneuverability;
    const speed = ship.cruiseSpeedKnots ?? ship.speed;
    const durable = ship.seaworthiness + Math.round(ship.systems.hullMax / 30);
    const tags = new Set(ship.systemTags ?? []);
    if ([...tags].some(tag => /arcane|ward|ritual/i.test(tag)))
        return "Arcane Wardship";
    if ([...tags].some(tag => /industrial|experimental|engine/i.test(tag)))
        return "Experimental Vessel";
    if (ship.disposition === "privateer" || ship.disposition === "pirate")
        return "Privateer";
    if (combat >= 8 && cargo < 34)
        return "Naval Combatant";
    if (cargo >= 42 && speed >= 7)
        return "Fast Trader";
    if (cargo >= 42 && durable >= 8)
        return "Durable Merchant";
    if (speed >= 8 && ship.maneuverability >= 4)
        return "Explorer / Runner";
    if (cargo >= 34)
        return "Merchant Vessel";
    return "Conventional Hybrid";
}
export function currentPlaceLabel(state) {
    if (state.player.currentPortId)
        return PORT_BY_ID[state.player.currentPortId]?.name ?? "Port";
    if (state.player.currentPoiId)
        return "Point of Interest";
    return "At Sea";
}
//# sourceMappingURL=playerFacing.js.map