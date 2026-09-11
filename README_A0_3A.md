# Ebbing Tides — A0.3A

Port / Service Capability Authority strengthening pass from the Alpha 0.6D systems/canon/cohesion/campaign-durability audit.

Base: `0.6.0-alpha.d.a0-2d`  
Package: `0.6.0-alpha.d.a0-3a`  
Save schema: **v12 unchanged**

A0.3A removes the assumption that every port is an interchangeable full-service harbor. Ship repair, refit installation, and injury treatment now consume one generic port-service authority built from the settlement's existing economic/capability profile plus the same live market state used by A0.1C.

Major yards can restore severe ship damage completely. Smaller working harbors can still perform useful one-click repairs, but their maximum restoration, time, price, and supported refits are constrained by yard capability, specialist capability, and current material stock. A port with the skill but no available material cannot conjure a repair or refit.

Medical treatment now follows the same rule. Local medical capability determines which injury severities can be handled, while current medical stock affects whether care is actually available, its price, and time. A smaller clinic may treat ordinary injuries while leaving severe injuries for a stronger facility.

Provisioning continues to use the existing A0.1C `quoteShipSupplies` market path, and the Outfitter continues to use the existing settlement availability/economic profile path. A0.3A deliberately does not create parallel service inventories or workshop-management UI.

Player-facing actions remain simple: Repair, install a refit, load supplies, buy equipment, or treat injuries. The complexity stays underneath the action.

Expansion rule: capability is settlement data. The service engine contains no named-port branches, so later ports can inherit the same behavior by receiving economic/service capability data and live market state.
