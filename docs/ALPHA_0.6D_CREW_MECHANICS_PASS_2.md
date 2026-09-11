# Alpha 0.6D — Crew Mechanics Pass 2
## Visibility, Reactions, Grievances & Unrest Foundation

This pass deliberately adds no new player-management module. Crew state remains surfaced through the existing Navigation, Tavern, Crew and Ship screens plus short-lived contextual notifications.

## Navigation HUD
When Navigation is active, the existing top bar now includes qualitative **Morale** and **Loyalty** beside Crowns, Crew and Supplies. The exact simulation values remain underneath; the player sees readable states such as Steady, Uneasy, Loyal or Restless.

## Crew reaction notices
Meaningful discrete captain decisions can trigger a small transient company-reaction notice after the action result. Current integrated examples include:
- shore leave / proper food and bunks;
- fair prize-share distribution;
- deliberately putting to sea with no stores;
- naval actions/outcomes that immediately change crew morale or loyalty.

Routine background shortage ticks do not spam notifications. Their effects remain visible through the HUD, threshold warnings and voyage reports.

## Derived unrest
Crew unrest is not a new player-managed numeric meter. It is derived from existing state:
- morale;
- loyalty;
- food satisfaction;
- pay/prize satisfaction;
- fatigue;
- dangerous-order history;
- repeated shortage history;
- unsettled prize shares.

Player-facing states are qualitative: Quiet, Grumbling, Discontented, Defiant. Warnings are shown only in existing crew/tavern surfaces and via Navigation tooltips/status treatment.

## First Mate influence
The First Mate now contributes explicitly to the captain's effective crew-leadership profile through Command, personal loyalty, respect/trust and suspicion. This supplements rather than replaces the captain's Presence, Command, reputation, crew relationships, discipline and experience.

## Prize grievance progression
An unsettled prize-share obligation is no longer harmless if the captain keeps sailing. Each completed voyage while a share remains unpaid gradually lowers pay satisfaction; once satisfaction is already poor, loyalty can begin to erode as well. This is intentionally slow enough to allow a reasonable return to port and settlement.

## Existing-surface presentation
- Navigation: Crowns / Crew / Supplies / Morale / Loyalty.
- Tavern: company summary, unrest warning when relevant, shore leave, prize share, recruiting.
- Crew roster: morale, loyalty, experience, health, discipline, unrest and ordinary-hand count.
- Ship: crew count plus qualitative morale/loyalty and crew quality.

No payroll screen, morale dashboard, grievance menu or mutiny-risk percentage is added.

## Deferred mutiny chain
Still deferred until this foundation is manually accepted:
real mutiny leader NPC -> confrontation/dialogue -> talk-down/terms -> unresolved personal combat -> captain victory suppresses immediate recurrence / captain defeat = game over.

## Validation
- 248/248 automated tests PASS
- TypeScript PASS
- Alpha build PASS
- Art-layout verification 3/3 PASS
- Save schema remains v11
