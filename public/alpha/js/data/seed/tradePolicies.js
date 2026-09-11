/**
 * Persistent baseline law. This table does not claim that a culture/religion automatically bans a
 * commodity. It records the jurisdiction's standing customs rule; temporary changes belong to the
 * authoritative A0.3C world-cause/policy layer.
 */
export const JURISDICTION_TRADE_POLICIES = [
    {
        jurisdictionId: "jurisdiction.skeldra",
        factionId: "faction.skeldra",
        label: "Skeldran customs law",
        authorityLabel: "Crown Customs Office",
        customsPermitCost: 70,
        customsPermitHours: 2,
        customsPermitDurationHours: 24 * 180,
        commissionCost: 120,
        commissionHours: 6,
        commissionMinimumStanding: 10,
        byLegalStatus: {
            ordinary: "open",
            licensed: "permit",
            restricted: "permit",
            politically_sensitive: "permit",
            sacred: "permit",
            military_only: "prohibited",
            contraband: "prohibited",
            stolen: "prohibited"
        }
    }
];
export const JURISDICTION_TRADE_POLICY_BY_ID = Object.fromEntries(JURISDICTION_TRADE_POLICIES.map(row => [row.jurisdictionId, row]));
//# sourceMappingURL=tradePolicies.js.map