# Alpha 0.6D — A0.3A Port / Service Capability Authority

## Purpose

The audit identified a world-cohesion problem beneath otherwise simple port actions: every settlement could effectively behave like the same magical full-service harbor. That undermines settlement identity, A0.1C economic causality, and later world scaling.

A0.3A keeps the player-facing interaction simple while making the underlying result authoritative and data-driven:

**settlement capability + specialist capability + live local resources → service availability / limit / price / time → existing one-click action**

The pass does not create a workshop simulator, a second market, or a parallel inventory.

## 1. Settlement capability is the service authority

`SettlementEconomicProfile` already owned settlement economic identity and shipyard capability. A0.3A extends that same profile with `medicalCapability` rather than creating a separate port-service database.

Active Skeldran proving-ground profiles now intentionally differ:

| Port | Repair | Refit | Medical | Character |
| --- | ---: | ---: | ---: | --- |
| Veyrholm | 4 | 4 | 3 | royal/naval major yard |
| Ironhaven | 4 | 4 | 4 | industrial major yard + strongest medical capability |
| Stormvik | 3 | 3 | 2 | working commercial/coastal yard with storm-rigging specialty |
| Thorenfjord | 2 | 1 | 2 | smaller harbor, local repair and limited fitting capability |

The broader canonical settlement-profile generator also supplies regional medical defaults. Later ports therefore receive the same service model through data instead of named-port branches.

## 2. One generic port-service engine

`src/game/portServices.ts` is the A0.3A service-quote layer. It does not own a new persistent inventory. It reads:

- `SETTLEMENT_ECONOMIC_PROFILE_BY_ID` for facility/capability truth;
- `GameState.markets[portId]` for live local resource truth;
- existing commodity categories and current `calculatePrice()` values for scarcity/cost.

A service-resource unit is intentionally abstract: a small bundle representing the materials/supplies necessary for the work. Repair/refit service draws from broad `raw` and `manufactured` categories; treatment draws from `medical`. This creates real economic causality without simulating individual nails, boards, bandages, labor shifts, or workshop bins.

Successful service consumes those same live market rows. If the market is depleted, a capable facility can be unable to perform the work until the economy supplies it again.

## 3. Ship repair capability

`quoteShipRepair()` determines what the current yard can actually restore.

Major capability-4 yards can restore the ship to current system maxima and clear fire/flooding. Smaller facilities can perform useful repair but severe damage has a capability-dependent restoration ceiling. Light damage may still be fully handled by a smaller yard.

The quote derives:

- whether repair is available;
- target hull/sails/rigging/fire/flooding state;
- whether the result is a true full restoration;
- required abstract material units;
- price from repair scope, facility efficiency and local scarcity;
- elapsed world time from facility capability, damage scope and scarcity.

`repairShip()` remains one click. It consumes the quote, spends crowns and actual market resources, applies only the quoted restoration, advances the shared world clock, and writes the existing `ship_repair` world-event history.

## 4. Refit capability and specialties

The two existing refits now carry service requirements rather than being universally installable at any dock:

- **Storm Rigging Package** — working refit capability required; Stormvik's authored storm-rigging specialty provides a legitimate specialist route, while a major yard can still perform the work through superior general capability.
- **Reinforced Bilge Pumps** — full commercial refit capability plus major-repair expertise when the yard is only at the minimum capability; major yards can perform it.

`quoteGenericRefitService()` combines required capability, optional specialist tags, live raw/manufactured resource stock, current prices, and facility efficiency. `installRefit()` remains the sole owner of the actual refit mutation and still advances `GameState.absoluteHour`.

The accepted Veyrholm Storm Rigging regression remains a 12-hour install.

## 5. Medical capability and treatment

`medicalCapability` is now an explicit settlement capability rather than treating every port physician as equivalent.

The minimum severity model is deliberately coarse:

- capability 1: severity-1 injuries;
- capability 2: severity-1/2 injuries;
- capability 3–4: severity-1/2/3 injuries.

`quoteMedicalTreatment()` identifies which untreated injuries can be handled locally, which need a stronger facility, the medical stock required, current cost, and treatment time.

`treatInjuries()` remains one action. It treats only the quoted eligible injuries, consumes the same live medical market stock, advances world time, records existing medical-treatment history, and leaves unsupported serious injuries active rather than magically resolving them.

## 6. Provisioning and Outfitter ownership are preserved

A0.3A does not replace systems that already have the correct authority:

- Ship supplies continue through A0.1C `quoteShipSupplies()` / `consumeSupplyQuote()`, so provisioning consumes real food stock from the same market the player trades in.
- Outfitter inventory/pricing continues through `availableItemDefinitionsAtSettlement()` and `itemPurchasePriceAtSettlement()`, which already consume the settlement economic profile and regional availability. Heavy naval armor, firearms, and precision navigation gear therefore do not appear universally.

This avoids a second provisioning inventory or a second equipment availability model.

## 7. Player-facing presentation

The existing Harbor/Shipyard and Captain condition actions remain intact. A0.3A only makes their state truthful:

- Repair displays the current quote and whether the local yard can fully restore the vessel.
- Refit cards show the current local price/time or a concise unavailable state.
- Injury treatment displays local price/time or an unavailable state.
- Long diagnostic reasons are carried in concise hover/title text rather than expanding the accepted layout into a management dashboard.

No new structural art, screen geometry, or inventory layout is introduced.

## 8. Expansion and future-system boundary

The engine contains no `port.veyrholm`, `port.ironhaven`, `port.stormvik`, or `port.thorenfjord` branches. Those differences live in settlement data.

Future regions/ports therefore scale by supplying:

1. settlement economic/capability profile;
2. shipyard specialties where canon calls for them;
3. market state from the existing economy.

A0.3C can later alter resources/economic conditions through authoritative world causes, and R2 can later impose legal/policy restrictions, without either system replacing A0.3A's service capability owner.

## 9. Save / persistence

Save schema remains **v12**. A0.3A adds no new persistent campaign queue or lifecycle state. Medical capability is static content/profile data; current material availability already lives in the canonical market state; completed repair/refit/treatment consequences already persist in existing ship/player/world-event state.

No Supabase migration is required.

## 10. Verification

Final A0.3A verification target:

- TypeScript Alpha typecheck: PASS
- Alpha compile: PASS
- Dedicated A0.3A tests: 11/11 PASS
- Full suite: 372/372 PASS
- Explicit A0.1B/A0.1C long-run durability set: 13/13 PASS
- Art-layout verification: 2/2 PASS
- Save schema: v12 unchanged
- Normal Next production build: unavailable in this environment because the local `next` executable is not installed

Dedicated tests cover capability differentiation, bounded small-yard repair, live resource consumption/depletion, refit capability/specialties, the existing Veyrholm refit timing regression, partial vs major medical treatment, medical-stock depletion, preservation of A0.1C provisioning and existing Outfitter ownership, and the no-named-port-branch expansion rule.

## 11. Deferred work

A0.3A does not implement:

- A0.3B identity/build consequences or learning-source content;
- A0.3C live kingdom/policy/religion/economic event authority;
- R2 dynamic customs, smuggling, privateering or wartime law;
- world expansion;
- mutiny;
- exact workshop part/labor simulation;
- a service-management dashboard;
- new ship-fitting/inventory icon architecture.

The next corrective phase is **A0.3B — Character-Build Consequence / Learning-Source Pass**.
