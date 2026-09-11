# Ebbing Tides — Crew Morale, Loyalty & Mutiny System
## Permanent crew-system canon — Crew Mechanics Pass 1

## Product rule

Crew gameplay uses a **Pirates & Traders-readable surface loop** with deeper Ebbing Tides RPG, NPC-memory, and world-simulation state underneath.

The player manages a ship's company through understandable actions and consequences. The game must not become a dashboard of psychological meters.

Surface rule:

> **Crew are a human consequence of sailing decisions, not another spreadsheet to operate.**

## Crew representation

The player's vessel has two connected layers:

### Ordinary ship's company
Generic sailors remain an aggregate population represented through the ship's crew count and company state. They do not each occupy a named-character row.

Aggregate company state includes:
- crew count / capacity,
- morale,
- loyalty,
- experience / quality,
- discipline,
- seamanship,
- gunnery,
- boarding ability,
- health,
- fatigue,
- food satisfaction,
- pay / prize satisfaction,
- remembered casualties,
- remembered dangerous orders,
- shortage history,
- recruitment / desertion history.

### Named officers and specialists
Named officers remain persistent characters with their existing RPG builds, relationships, memories, beliefs, injuries, goals, and equipment. They can influence ship performance and later crew politics without turning every sailor into a full NPC.

## Player-facing crew loop

### Count and capacity
The ship has a real number of sailors aboard and a maximum berth capacity. Named officers are included in the total headcount; ordinary sailors fill the remaining berths.

### Morale and loyalty
Morale represents the company's immediate willingness and spirit. Loyalty represents longer-lived willingness to continue following this captain.

Normal UI should use qualitative language such as:
- High / Good / Steady / Uneasy / Discontent / Angry,
- Devoted / Loyal / Committed / Uncertain / Restless / Ready to Leave.

Exact values may remain underneath for simulation.

### Experience and quality
Ordinary crew have aggregate experience and practical seamanship/gunnery/boarding quality. Green replacements can weaken an experienced company; seasoned or veteran recruits can strengthen it.

Crew quality contributes to voyage handling, maneuvering, gunnery, boarding, escape, and other ship operations, but it does not replace the captain or qualified officers.

### Tavern recruiting
Ports surface a small deterministic selection of sailors looking for work. Recruitment offers have different quality and signing cost. Hiring increases aggregate headcount rather than generating disposable named NPC rows.

Recruiting strangers can slightly dilute an established company's cohesion, while their skills and experience immediately affect the aggregate company.

### Shore leave
In port the captain can pay for food, bunks, and shore leave. Cost scales with current crew size. Shore leave consumes world time and restores morale, loyalty, food satisfaction, health where appropriate, and fatigue.

### Prize shares
Successful prize-taking creates a crew-share obligation. The player can distribute the due share in port. Fair distribution improves morale, loyalty, and pay satisfaction. Leaving prize shares unsettled becomes a grievance and contributes to desertion pressure.

### Casualties and dangerous orders
Casualties reduce company morale and create persistent crew history. Dangerous orders can create fatigue and, when the crew is already shaky, additional morale pressure. Strong leadership can help the crew endure legitimate danger but cannot erase consequences.

## Supplies and deprivation

Running out of supplies **never blocks sailing**.

Instead, continuous time at zero supplies creates progressive hardship:
- first day: intentionally forgiving; usually mild morale pressure,
- following days: morale loss accelerates,
- prolonged deprivation: health begins to deteriorate,
- around five days and beyond: serious hardship,
- repeated shortage episodes are remembered and make later neglect less tolerable.

Captain leadership mitigates morale deterioration through:
- Command,
- Presence,
- learned leadership perks / abilities,
- company loyalty,
- named-crew respect/trust/suspicion,
- company discipline and experience,
- relevant reputation.

A respected captain can carry a crew through hardship better than an unknown or disliked one, but not indefinitely.

Food satisfaction also deteriorates during shortages and contributes to later desertion pressure.

## Port desertion

Low morale does not immediately become mutiny.

When the crew reaches port/tavern conditions, ordinary sailors may quietly leave if accumulated pressure is serious enough. Desertion pressure considers:
- morale,
- loyalty,
- fatigue,
- food satisfaction,
- pay satisfaction,
- repeated shortages,
- unsettled prize shares,
- dangerous-order history,
- captain leadership.

Desertion is checked conservatively and no more than once per port/day. It removes ordinary hands only; named officers are never silently deleted by the aggregate desertion system.

This is deliberately forgiving. One bad voyage should not destroy a crew. Repeated neglect or severe prolonged hardship is what moves the company toward serious consequences.

## Crew memory and history

Meaningful crew events create canonical world events and are attached to the memories of named crew aboard where appropriate. Examples:
- prolonged shortages,
- recruiting new hands,
- shore leave,
- prize won,
- prize shared,
- casualties,
- dangerous orders,
- desertion.

The aggregate company also retains history tags and counters so future systems can reason about repeated treatment rather than treating every voyage as the first voyage.

## Consequence ladder

Preferred escalation:

Healthy / content crew
→ grumbling / mild morale pressure
→ meaningful dissatisfaction
→ reduced performance / reluctance where appropriate
→ ordinary sailors desert at port
→ severe discipline crisis
→ mutiny risk

Do not jump directly from a minor shortage or one dangerous voyage to mutiny.

## Deferred mutiny chain

The full mutiny confrontation is **not part of Crew Mechanics Pass 1**.

When later implemented:

1. Severe accumulated conditions cross a mutiny threshold.
2. One **actual NPC** becomes the mutiny leader.
3. A confrontation screen/event appears.
4. The captain first gets a chance to talk the mutiny down.
5. Resolution may use Presence, Persuasion, Command, reputation, crew respect/trust, promises, grievances, leader personality, and actual hardship.
6. Successful talk-down:
   - mutiny ends,
   - small morale/health recovery,
   - promises/terms may become persistent obligations.
7. Failed negotiation:
   - captain enters personal combat with the mutiny leader.
8. Captain wins:
   - mutiny is suppressed,
   - a temporary authority/discipline effect sharply lowers another mutiny chance for a limited period.
9. Captain loses:
   - **game over**.

This chain must sit on top of the proven morale/loyalty/history system rather than being a random scripted event.

## UI rule

Player-facing crew information should remain layered and qualitative.

Default useful state:
- Crew 8/10
- Morale: Steady
- Loyalty: Committed
- Experience: Regular
- Health: Fit
- Discipline: Steady

Do not permanently expose every food/pay/memory/relationship input as a numeric meter. Those deeper values should primarily be experienced through behavior, warnings, events, opportunities, desertion, and later mutiny.

## Alpha 0.6D Crew Mechanics Pass 2 — Surface Rule
Crew depth must not become a separate management application. Navigation exposes qualitative Morale/Loyalty beside existing voyage resources; Tavern/Crew/Ship surfaces expose relevant deeper context only when useful. Meaningful captain decisions may create short-lived crew reaction notices showing morale/loyalty gain or loss. Routine background ticks do not spam the player. Company unrest is derived and qualitative, not a permanent mutiny-percentage meter. First Mate quality contributes to company stability, and unpaid prize shares become progressively remembered grievances when the captain keeps sailing without settling them.
