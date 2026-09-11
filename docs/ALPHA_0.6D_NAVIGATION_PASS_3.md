# Alpha 0.6D — Navigation Pass 3
## Zero-Supplies Hardship Foundation

Status:
- `functionalStatus`: **PASS**
- `visualStatus`: **PENDING MANUAL APPROVAL**
- `feelStatus`: **PENDING MANUAL APPROVAL**
- Phase C remains blocked.

## Purpose

Finish the navigation feel-gate supply behavior without turning crew simulation into another dashboard.

## Implemented

- Ship supplies are never a hard travel gate. A valid plotted voyage can begin and continue with zero supplies.
- Search Waters remains a real at-sea action and also consumes time/stores; time spent searching at zero supplies contributes to hardship.
- Zero-supply hardship is progressive rather than binary or linear.
- First-day shortage is deliberately forgiving.
- Prolonged shortage escalates morale loss.
- Crew health pressure begins only after prolonged deprivation.
- Captain leadership mitigates morale loss using existing RPG/social state:
  - Command,
  - Presence,
  - crew loyalty,
  - named-crew respect/trust/suspicion,
  - regional reputation,
  - Commanding Presence when actually learned.
- Leadership can delay/reduce hardship but cannot make prolonged starvation harmless.
- Repeated shortage episodes persist and increase later pressure modestly.
- Named crew receive persistent memory references when shortage crosses meaningful 24h / 72h / 120h thresholds.
- Resupplying ends the active shortage episode but does not erase morale/health damage or prior episode history.
- Arrival voyage reports can show hours without stores plus morale/health harm when it occurred.
- Top-bar Supplies becomes a restrained warning state at zero while leaving travel enabled.

## Current balance intent

The curve is intentionally friendly during an ordinary miscalculation and increasingly serious only with extended neglect.

On the current default captain/crew baseline, isolated test pressure is approximately:

- 12h at zero stores: 0 morale / 0 health loss
- 24h: ~1 morale / 0 health
- 48h: ~3 morale / 0 health
- 72h: ~5 morale / 0 health
- 120h (5 days): ~14 morale / ~2 health
- 168h (7 days): ~29 morale / ~8 health

These are current tuning values, not immutable canon. The Crew Mechanics pass may rebalance them after actual play.

## Explicitly deferred to Crew Mechanics pass

- full crew recruitment/retention loop,
- crew experience/quality,
- shore leave/partying,
- prize/loot shares,
- port desertion,
- normal casualty morale consequences,
- broader loyalty/reputation presentation,
- ordinary-crew named generation/persistence depth,
- full mutiny confrontation chain.

## Save compatibility

No schema bump. Save schema remains **v10**. New crew-welfare state is additive/optional and lazily initialized for older v10 saves.
