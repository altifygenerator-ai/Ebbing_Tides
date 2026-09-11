# Ebbing Tides — A0.2D

Law Information Lifecycle repair from the Alpha 0.6D systems/canon/cohesion/campaign-durability audit.

Base: `0.6.0-alpha.d.a0-2c`  
Package: `0.6.0-alpha.d.a0-2d`  
Save schema: **v12 unchanged**

A0.2D removes the remaining legal-information teleport. A crime is now canonical truth once, while witness/evidence, legal reporting, physical or direct institutional delivery, authority receipt, warrant/legal consequences, and final resolution are separate stages of one lifecycle.

An identified surviving witness at sea can create a legal report, but that report must physically reach a competent authority before jurisdiction heat, faction/local standing penalties, or a warrant are created. Crimes with no identifying witness or independent identifying evidence do not create an automatic legal response. Directly witnessed crimes by competent authority use the same lifecycle with zero transit rather than a duplicate warrant path.

`GameState.absoluteHour` owns report delivery. Report transit survives save/load, due reports validate exactly once, and operational report history is bounded while `CrimeRecord` and `WorldEvent` preserve canonical history. Existing v12 saves are normalized additively; old already-reported R1 crimes remain valid active legal matters.

Warrant satisfaction and pardon now close the linked legal matter without deleting the crime from history, so settled crimes no longer remain falsely unresolved.

Cohesion rule: `CrimeRecord` owns crime truth; evidence records describe what can support a report; `LegalReportRecord` owns operational report transit/receipt; existing R1 jurisdiction legal state and warrants own active legal consequence; A0.2A generic public information remains distinct and does not issue warrants.

Expansion rule: the report-routing engine uses world geography, jurisdiction political-power data, port data, and the shared world clock rather than named-port branches. Future ports and lawful institutions can plug into the same legal-report lifecycle.
