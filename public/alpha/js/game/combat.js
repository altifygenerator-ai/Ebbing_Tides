import { roll2d10 } from "./rng.js";
import { attributeModifier } from "./skills.js";
const RANGE_ORDER = ["distant", "long", "medium", "close", "grapple", "boarding"];
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function moveRange(range, direction) {
    const index = RANGE_ORDER.indexOf(range);
    if (direction === "close")
        return RANGE_ORDER[Math.min(RANGE_ORDER.length - 1, index + 1)];
    return RANGE_ORDER[Math.max(0, index - 1)];
}
function rangeModifier(range) {
    switch (range) {
        case "long": return -2;
        case "medium": return 0;
        case "close": return 2;
        case "grapple": return 3;
        default: return -4;
    }
}
function damageShip(target, amount, targetSystem = "hull") {
    if (targetSystem === "hull") {
        target.systems.hull = clamp(target.systems.hull - amount, 0, target.systems.hullMax);
        if (amount >= 8)
            target.systems.flooding = clamp(target.systems.flooding + 1, 0, 4);
    }
    else {
        target.systems.sails = clamp(target.systems.sails - amount, 0, target.systems.sailsMax);
        target.systems.rigging = clamp(target.systems.rigging - Math.ceil(amount / 2), 0, target.systems.riggingMax);
    }
}
function resolveEnemyTurn(state) {
    const encounter = state.encounter;
    if (!encounter || encounter.phase !== "combat")
        return "";
    const enemy = state.ships[encounter.otherShipId];
    const playerShip = state.ships[state.player.shipId];
    if (!enemy || !playerShip)
        return "";
    if (enemy.systems.hull <= 0 || enemy.systems.crew <= 0)
        return "";
    if (encounter.range === "distant") {
        encounter.range = "long";
        return `${enemy.name} bears down and closes the distance.`;
    }
    if (encounter.range === "long" && enemy.firepower < 5) {
        encounter.range = "medium";
        return `${enemy.name} presses closer rather than waste powder at long range.`;
    }
    const roll = roll2d10(state.worldSeed, `combat:${encounter.id}:enemy:${encounter.round}`);
    const score = roll.total + enemy.firepower + rangeModifier(encounter.range);
    const defense = 13 + playerShip.maneuverability;
    if (score >= defense) {
        const damage = Math.max(3, Math.floor((score - defense) / 2) + enemy.firepower);
        damageShip(playerShip, damage, "hull");
        playerShip.systems.morale = clamp(playerShip.systems.morale - 3, 0, 100);
        return `${enemy.name} fires effectively. Your hull takes ${damage} damage (${roll.dice[0]}+${roll.dice[1]}).`;
    }
    return `${enemy.name}'s broadside throws spray and splinters but fails to land an effective hit.`;
}
function resolveVictory(state) {
    const encounter = state.encounter;
    if (!encounter)
        return undefined;
    const enemy = state.ships[encounter.otherShipId];
    const playerShip = state.ships[state.player.shipId];
    if (!enemy || !playerShip)
        return undefined;
    if (enemy.systems.hull <= 0 || enemy.systems.crew <= 0 || enemy.systems.morale <= 0) {
        encounter.phase = "resolved";
        const prize = Math.max(25, Math.round(enemy.cargo.reduce((sum, stack) => sum + stack.quantity * 10, 0) + 45));
        state.player.character.crowns += prize;
        state.worldEvents.push({
            id: `event.combat.victory.${encounter.id}`,
            type: "naval_combat_resolved",
            atHour: state.absoluteHour,
            participants: [playerShip.id, enemy.id],
            summary: `${enemy.name} was forced out of the fight. The player recovered ${prize} crowns in salvage and prize value.`,
            canonicalData: { result: "player_victory", prize, enemyShipId: enemy.id },
            importance: 4
        });
        return `${enemy.name} can no longer continue the fight. You recover ${prize} crowns in prize value and salvage.`;
    }
    if (playerShip.systems.hull <= 0 || playerShip.systems.crew <= 0 || playerShip.systems.morale <= 0) {
        encounter.phase = "resolved";
        state.player.character.crowns = Math.max(0, state.player.character.crowns - 60);
        playerShip.systems.hull = Math.max(8, Math.round(playerShip.systems.hullMax * 0.3));
        playerShip.systems.morale = 35;
        state.worldEvents.push({
            id: `event.combat.defeat.${encounter.id}`,
            type: "naval_combat_resolved",
            atHour: state.absoluteHour,
            participants: [playerShip.id, enemy.id],
            summary: "The player ship was forced to strike colors and later released after losses and payment.",
            canonicalData: { result: "player_defeat", lostCrowns: 60 },
            importance: 4
        });
        return "Your ship is forced to strike colors. You survive, but the defeat costs cargo, money, and reputation.";
    }
    return undefined;
}
export function combatAction(state, action) {
    const encounter = state.encounter;
    if (!encounter || encounter.phase !== "combat")
        return { ok: false, message: "No naval combat is active." };
    const enemy = state.ships[encounter.otherShipId];
    const playerShip = state.ships[state.player.shipId];
    if (!enemy || !playerShip)
        return { ok: false, message: "Combat state is incomplete." };
    encounter.round += 1;
    let playerText = "";
    if (action === "close" || action === "open") {
        const roll = roll2d10(state.worldSeed, `combat:${encounter.id}:maneuver:${encounter.round}:${action}`);
        const score = roll.total + state.player.character.skills.sailing + playerShip.maneuverability + attributeModifier(state.player.character.attributes.dexterity);
        const enemyScore = 11 + enemy.maneuverability;
        if (score >= enemyScore) {
            encounter.range = moveRange(encounter.range, action === "close" ? "close" : "open");
            playerText = `${action === "close" ? "You close the range" : "You open the range"} (${score} vs ${enemyScore}).`;
        }
        else {
            playerText = `The maneuver fails to gain the range you wanted (${score} vs ${enemyScore}).`;
        }
    }
    else if (action === "fire_hull" || action === "fire_rigging") {
        if (encounter.range === "distant" || encounter.range === "boarding")
            return { ok: false, message: "Your guns cannot resolve that fire order at this range." };
        const roll = roll2d10(state.worldSeed, `combat:${encounter.id}:fire:${encounter.round}:${action}`);
        const score = roll.total + state.player.character.skills.gunnery + playerShip.firepower + attributeModifier(state.player.character.attributes.perception) + rangeModifier(encounter.range);
        const targetDifficulty = 13 + enemy.maneuverability + (action === "fire_rigging" ? 2 : 0);
        if (score >= targetDifficulty) {
            const damage = Math.max(2, Math.floor((score - targetDifficulty) / 2) + playerShip.firepower);
            damageShip(enemy, damage, action === "fire_rigging" ? "sails" : "hull");
            enemy.systems.morale = clamp(enemy.systems.morale - 3, 0, 100);
            playerText = `Your battery lands effective ${action === "fire_rigging" ? "chain" : "round"} shot for ${damage} damage.`;
        }
        else {
            playerText = `The broadside fails to produce an effective hit (${score} vs ${targetDifficulty}).`;
        }
    }
    else if (action === "repair") {
        const roll = roll2d10(state.worldSeed, `combat:${encounter.id}:repair:${encounter.round}`);
        const score = roll.total + state.player.character.skills.ship_repair + attributeModifier(state.player.character.attributes.intelligence);
        const repaired = Math.max(1, Math.floor(score / 5));
        playerShip.systems.hull = clamp(playerShip.systems.hull + repaired, 0, playerShip.systems.hullMax);
        playerShip.systems.flooding = Math.max(0, playerShip.systems.flooding - (score >= 15 ? 1 : 0));
        playerText = `Damage-control parties restore ${repaired} hull condition.`;
    }
    else if (action === "flee") {
        const roll = roll2d10(state.worldSeed, `combat:${encounter.id}:flee:${encounter.round}`);
        const score = roll.total + state.player.character.skills.sailing + playerShip.speed + playerShip.maneuverability;
        const pursuit = 13 + enemy.speed + enemy.maneuverability;
        if (score >= pursuit && encounter.range !== "grapple") {
            encounter.phase = "resolved";
            encounter.playerEscaped = true;
            playerText = `You break contact and escape (${score} vs ${pursuit}).`;
            state.worldEvents.push({
                id: `event.combat.escape.${encounter.id}`,
                type: "naval_combat_resolved",
                atHour: state.absoluteHour,
                participants: [playerShip.id, enemy.id],
                summary: `Escaped naval combat with ${enemy.name}.`,
                canonicalData: { result: "escaped" },
                importance: 2
            });
            encounter.log.push(playerText);
            return { ok: true, message: playerText };
        }
        playerText = `You fail to shake the pursuit (${score} vs ${pursuit}).`;
    }
    encounter.log.push(playerText);
    const victory = resolveVictory(state);
    if (victory) {
        encounter.log.push(victory);
        return { ok: true, message: victory };
    }
    const enemyText = resolveEnemyTurn(state);
    if (enemyText)
        encounter.log.push(enemyText);
    const after = resolveVictory(state);
    if (after) {
        encounter.log.push(after);
        return { ok: true, message: after };
    }
    return { ok: true, message: `${playerText} ${enemyText}`.trim() };
}
//# sourceMappingURL=combat.js.map