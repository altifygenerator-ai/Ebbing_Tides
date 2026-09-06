import type { GameState, NpcCharacter } from "./types.js";

export interface CharacterMindContext {
  characterId: string;
  identity: string;
  role: string;
  speakingStyle: string;
  goals: string[];
  beliefs: string[];
  knownFacts: string[];
  relationship: NpcCharacter["relationshipToPlayer"];
  locationPortId?: string;
  currentWorldFacts: string[];
  loreFirewall: string[];
}

export interface CharacterMindReply {
  text: string;
  interpretedIntent: string;
  proposedMemory?: string;
  proposedEffects: Array<{ type: string; payload: Record<string, string | number | boolean> }>;
  source: "deterministic_fallback" | "openai";
}

export function buildCharacterMindContext(state: GameState, npcId: string): CharacterMindContext {
  const npc = state.npcs[npcId];
  if (!npc) throw new Error(`Unknown NPC ${npcId}`);
  const currentWorldFacts: string[] = [];
  if (npc.locationPortId === "port.ironhaven") {
    const market = state.markets["port.ironhaven"];
    const grain = market?.goods["good.grain"];
    if (grain) currentWorldFacts.push(`Ironhaven grain stock is ${grain.stock} against a target of ${grain.targetStock}.`);
  }
  currentWorldFacts.push(`Current canonical time is Day ${state.clock.day}, ${state.clock.hour}:00, 628 CR.`);
  return {
    characterId: npc.id,
    identity: `${npc.name}, age ${npc.age}, ${npc.culture}, ${npc.religion}`,
    role: npc.role,
    speakingStyle: npc.speakingStyle,
    goals: [...npc.goals],
    beliefs: [...npc.beliefs],
    knownFacts: [...npc.knownFacts],
    relationship: { ...npc.relationshipToPlayer },
    ...(npc.locationPortId ? { locationPortId: npc.locationPortId } : {}),
    currentWorldFacts,
    loreFirewall: [
      "Do not invent world facts.",
      "Do not reveal facts not present in supplied knowledge/context.",
      "Do not mention Earth, AI, databases, hidden stats, game mechanics, or being fictional.",
      "Dialogue can propose actions; game code validates and commits effects."
    ]
  };
}

function classifyIntent(text: string): string {
  const t = text.toLowerCase();
  if (/work|job|help|need|contract/.test(t)) return "ask_for_work";
  if (/grain|food|hungry|shortage|market/.test(t)) return "ask_about_food_pressure";
  if (/covenant|ilyon|faith|religion|old gods|thoren|veyr/.test(t)) return "ask_about_religion";
  if (/braeg|factory|foundry|industry|machine/.test(t)) return "ask_about_industry";
  if (/who are you|yourself|name/.test(t)) return "ask_identity";
  return "general_conversation";
}

export function deterministicCharacterMindReply(state: GameState, npcId: string, playerText: string): CharacterMindReply {
  const npc = state.npcs[npcId];
  if (!npc) throw new Error(`Unknown NPC ${npcId}`);
  const intent = classifyIntent(playerText);
  let text: string;

  if (npc.id === "character.pastor_elias_korr") {
    switch (intent) {
      case "ask_for_work":
        text = "If you want useful work, start with what people actually need. Food is moving badly into parts of the city, and the kitchens feel it before the counting houses do. I can point you toward the harbor factors, but I won't pretend charity owns cargo that merchants paid for.";
        break;
      case "ask_about_food_pressure":
        text = "The shortage is not famine, not yet. But workers with thin purses feel every bad shipment first. Grain matters more than speeches this week.";
        break;
      case "ask_about_religion":
        text = "I serve the Covenant. That does not give me leave to spit on a man's ancestors. Ironhaven has enough sparks without priests carrying tinder.";
        break;
      case "ask_about_industry":
        text = "Braeg's works feed half the harbor and frighten the other half. I know what the furnaces do to lungs and wages. I do not know the secrets of his workshops, and I will not invent them for you.";
        break;
      case "ask_identity":
        text = "Elias Korr. I preach, keep a hospital open when coin allows it, and spend too much time arguing with men who think mercy is weakness or conversion is a weapon.";
        break;
      default:
        text = "Say what you mean plainly. I can speak for what I've seen in Ironhaven, not for every rumor that crosses the docks.";
    }
  } else {
    text = `${npc.name} studies you for a moment. "Ask me something I would reasonably know, and I'll answer what I can."`;
  }

  npc.relationshipToPlayer.trust = Math.min(100, npc.relationshipToPlayer.trust + 1);
  return {
    text,
    interpretedIntent: intent,
    proposedMemory: `Player spoke with ${npc.name} about ${intent.replaceAll("_", " ")}.`,
    proposedEffects: [],
    source: "deterministic_fallback"
  };
}
