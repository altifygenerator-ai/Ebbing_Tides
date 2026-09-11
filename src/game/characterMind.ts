import type { GameState, NpcCharacter } from "./types.js";
import { dayOfYear } from "./time/calendar.js";
import { crewLoyaltyLabel, crewMoraleLabel, ensureCrewCommunity } from "./crewState.js";
import { birthOmenInterpretation } from "./characterConsequences.js";

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
  const crewAssignment=state.player.crew.find(member=>member.npcId===npcId);
  if(crewAssignment){
    const ship=state.ships[state.player.shipId];
    if(ship){ const company=ensureCrewCommunity(ship); currentWorldFacts.push(`Aboard Tideworn: hull ${ship.systems.hull}/${ship.systems.hullMax}, sails ${ship.systems.sails}/${ship.systems.sailsMax}, crew morale ${crewMoraleLabel(ship.systems.morale)}, company loyalty ${crewLoyaltyLabel(company.loyalty)}, supplies ${ship.supplies}, unsettled prize share ${company.outstandingPrizeShare} crowns.`); }
    currentWorldFacts.push(`${npc.name} serves aboard Tideworn as ${crewAssignment.role}; crew-record morale ${crewAssignment.morale}, loyalty ${crewAssignment.loyalty}.`);
    if(state.voyage) currentWorldFacts.push(`Tideworn is currently sailing toward ${state.voyage.destination.name}; ${Math.round(state.voyage.progress*100)} percent of the planned voyage is complete.`);
  }
  const remembered = npc.brain.memories.slice(-3).map((eventId)=>state.worldEvents.find((event)=>event.id===eventId)?.summary).filter((summary): summary is string => Boolean(summary));
  for(const summary of remembered) currentWorldFacts.push(`Remembered event: ${summary}`);
  const pc=state.player.character;
  currentWorldFacts.push(`The player captain identifies as ${pc.culture}, from ${pc.homelandRegion}, practicing ${pc.religion} with ${pc.devotion} devotion; their recorded birth omen is ${pc.birthOmen} and recent profession is ${pc.recentProfession}.`);
  currentWorldFacts.push(`Current canonical time is Day ${dayOfYear(state.clock)}, ${state.clock.hour}:00, 628 CR.`);
  return {
    characterId: npc.id,
    identity: `${npc.name}, age ${npc.age}, ${npc.culture}, ${npc.religion}`,
    role: npc.role,
    speakingStyle: npc.speakingStyle,
    goals: npc.goals.filter((goal) => goal.status === "active").map((goal) => goal.description),
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

function ironhavenFoodPressure(state: GameState): "short" | "tight" | "steady" | "comfortable" {
  const grain = state.markets["port.ironhaven"]?.goods["good.grain"];
  if (!grain || grain.targetStock <= 0) return "steady";
  const ratio = grain.stock / grain.targetStock;
  if (ratio < .62) return "short";
  if (ratio < .90) return "tight";
  if (ratio > 1.18) return "comfortable";
  return "steady";
}

function korrFoodPressureText(state: GameState): string {
  switch (ironhavenFoodPressure(state)) {
    case "short": return "Grain stores are genuinely short right now. Workers with thin purses feel every missed shipment first, and useful cargo matters more than speeches.";
    case "tight": return "Food stores are tight rather than catastrophic. Another bad run of shipments could make it worse, so grain still matters.";
    case "comfortable": return "Food stores are comfortable at the moment. That can change quickly in an industrial city, but I will not call plenty a shortage just to give you work.";
    default: return "Food stores are holding steady. The kitchens still watch prices closely, but there is no honest reason to call it a crisis today.";
  }
}

function classifyIntent(text: string): string {
  const t = text.toLowerCase();
  if (/work|job|help|need|contract/.test(t)) return "ask_for_work";
  if (/grain|food|hungry|shortage|market/.test(t)) return "ask_about_food_pressure";
  if (/omen|storm[- ]born|born.*storm|born.*tide|high tide|first snow|birth sign/.test(t)) return "ask_about_omen";
  if (/covenant|ilyon|faith|religion|old gods|thoren|veyr/.test(t)) return "ask_about_religion";
  if (/braeg|factory|foundry|industry|machine/.test(t)) return "ask_about_industry";
  if (/morale|crew|loyal|happy|complain|problem/.test(t)) return "ask_about_crew";
  if (/ship|hull|sail|rig|damage|repair|tideworn/.test(t)) return "ask_about_ship";
  if (/voyage|course|route|where|weather|sea|heading/.test(t)) return "ask_about_voyage";
  if (/what do you think|advice|opinion|recommend/.test(t)) return "ask_advice";
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
      case "ask_for_work": {
        const pc=state.player.character;
        const pressure=ironhavenFoodPressure(state);
        if(pc.recentProfession === "merchant_clerk" || pc.skills.commerce >= 45) {
          text = pressure === "short" || pressure === "tight"
            ? "You know how to read a manifest, so I won't waste your time. Grain and ordinary food are the pressure point right now. The harbor factors can pay; the kitchens simply tell you where the shortage hurts first. A clean food run into Ironhaven is useful work and honest profit."
            : "You know how to read a manifest, so I won't invent a shortage for you. Grain is holding today. Check the harbor factors for what is actually thin before you commit a hold to the run.";
        } else if(pc.recentProfession === "healer" || pc.skills.medicine >= 42) text = "If your medical training is real, the hospital can use hands and medicine more than speeches. I can introduce you to the quartermaster and let you see what is actually running short.";
        else text = pressure === "short" || pressure === "tight"
          ? "If you want useful work, start with what people actually need. Food is moving badly into parts of the city, and the kitchens feel it before the counting houses do. I can point you toward the harbor factors, but I won't pretend charity owns cargo that merchants paid for."
          : "If you want useful work, start with what people actually need today. Food is holding well enough that I won't call it a shortage. Ask the harbor factors what is genuinely scarce and bring that.";
        break;
      }
      case "ask_about_food_pressure":
        text = korrFoodPressureText(state);
        break;
      case "ask_about_religion":
        if(state.player.character.religion === "covenant") text = "Then you already know the Covenant is not one voice. I serve it here by keeping people fed and treated. If your faith means anything, let it make you useful before it makes you loud.";
        else if(state.player.character.religion === "old_gods") text = "You keep the old rites; I serve the Covenant. That need not make us enemies. Ironhaven has enough sparks without priests or captains carrying tinder.";
        else text = "I serve the Covenant. That does not give me leave to spit on a man's ancestors. Ironhaven has enough sparks without priests carrying tinder.";
        break;
      case "ask_about_omen":
        text = `"I would not call an omen a verdict on your life. ${birthOmenInterpretation("covenant",state.player.character.birthOmen,state.player.character.trait==="superstitious")}"`;
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
    const crew=state.player.crew.find(member=>member.npcId===npc.id);
    const ship=state.ships[state.player.shipId];
    if(crew){
      if(intent === "ask_identity") text = `"${npc.name}. ${npc.role}. You know the title already; the rest you learn by sharing a deck with me."`;
      else if(intent === "ask_about_omen") {
        const reading=birthOmenInterpretation(npc.religion,state.player.character.birthOmen,state.player.character.trait==="superstitious");
        text = npc.id === "character.mira_holst" ? `"${reading} I pay attention to what a crew believes because belief changes people, not because every tale is a weather report."` : `"${reading}"`;
      }
      else if(intent === "ask_about_crew") {
        const company=ship?ensureCrewCommunity(ship):undefined;
        if(!ship||!company) text='"I cannot tell you what is not in front of me."';
        else if(company.outstandingPrizeShare>0) text=`"They know there's ${company.outstandingPrizeShare} crowns of prize share still unsettled. You can ask men to wait, but don't ask them to forget."`;
        else if(ship.systems.morale<40||company.loyalty<35) text=`"The company is wearing thin. Food, rest, fair shares, and whether they trust the next order all matter now."`;
        else if(ship.systems.morale<65||company.loyalty<50) text=`"They're holding together. Give them food, a little shore time, and reasons to believe the captain notices what they endure."`;
        else text=`"The company is in good heart. ${crewMoraleLabel(ship.systems.morale)} morale, ${crewLoyaltyLabel(company.loyalty).toLowerCase()} loyalty. Keep earning it."`;
      }
      else if(intent === "ask_about_ship") {
        if(!ship) text='"I cannot tell you what is not in front of me."';
        else if(npc.id === "character.elsa_tarn") text = `"Hull is ${ship.systems.hull} of ${ship.systems.hullMax}; sails ${ship.systems.sails} of ${ship.systems.sailsMax}. She is serviceable, but numbers do not replace listening to timber and rigging."`;
        else if(npc.id === "character.ulf_brenn") text = `"Battery is what it is: ${ship.firepower} effective firepower, crew morale ${ship.systems.morale}. Give me dry powder, time to drill, and no fool standing over the magazine with a lamp."`;
        else text = `"Tideworn is holding. Hull ${ship.systems.hull} of ${ship.systems.hullMax}, supplies ${ship.supplies}. If you want the fine details, ask the person whose hands are on that part of her."`;
      } else if(intent === "ask_about_voyage") {
        if(npc.id === "character.nils_orr") text = state.voyage ? `"Course is laid for ${state.voyage.destination.name}. We're about ${Math.round(state.voyage.progress*100)} percent through it. A chart tells us where we meant to go; the sea still gets a vote."` : '"No active course. Give me a destination and what we actually know of it, and I can tell you what I trust in the chart."';
        else text = state.voyage ? `"We're committed to ${state.voyage.destination.name} for now. If weather, supplies, or trouble changes the facts, then we change the plan."` : '"We are not under way. That is the best time to decide what kind of trouble is worth sailing toward."';
      } else if(intent === "ask_advice") {
        if(npc.id === "character.mira_holst") text='"Keep enough margin that one bad hour does not decide the whole voyage. Food, crew, hull, money. Captains usually lose ships after they convince themselves one of those can wait."';
        else if(npc.id === "character.nils_orr") text='"Do not confuse a confident line on a chart with knowledge. Check the source, the age, the weather, and what the person drawing it could actually have seen."';
        else if(npc.id === "character.ulf_brenn") text='"Do not spend powder proving you own guns. Fire when it changes the fight."';
        else if(npc.id === "character.elsa_tarn") text='"Repair the small failure before the sea turns it into the large one."';
        else text=`${npc.name} considers it. "Ask me about the part of the world I actually know, and my advice will be worth more."`;
      } else {
        const shortageMemory=[...npc.brain.memories].reverse().map(id=>state.worldEvents.find(event=>event.id===id)).find(event=>event?.type==="crew_supply_hardship");
        if(shortageMemory) text = `"I'm listening. And yes, I remember the stores running dry. We got through it, but the crew will remember whether that becomes a habit. Ask me about the ship, the crew, or the next voyage."`;
        else text = `"I'm listening. Ask me about the ship, the crew, the voyage, or something I might actually know."`;
      }
    } else {
      text = `${npc.name} studies you for a moment. "Ask me something I would reasonably know, and I'll answer what I can."`;
    }
  }

  const pc=state.player.character;
  let trustGain=1;
  let respectGain=0;
  if(npc.id === "character.pastor_elias_korr") {
    if(pc.religion === "covenant") trustGain += 1;
    if(pc.recentProfession === "healer" || pc.skills.medicine >= 42 || pc.skills.persuasion >= 45) respectGain += 2;
    if(pc.recentProfession === "merchant_clerk" || pc.skills.commerce >= 45) respectGain += 1;
  }
  const crew=state.player.crew.find(member=>member.npcId===npc.id);
  if(crew && (pc.skills.command >= 45 || pc.attributes.presence >= 7)) respectGain += 1;
  npc.relationshipToPlayer.trust = Math.min(100, npc.relationshipToPlayer.trust + trustGain);
  npc.relationshipToPlayer.respect = Math.min(100, npc.relationshipToPlayer.respect + respectGain);
  if(trustGain>1 || respectGain>0) npc.relationshipToPlayer.suspicion = Math.max(0,npc.relationshipToPlayer.suspicion-1);
  return {
    text,
    interpretedIntent: intent,
    proposedMemory: `Player spoke with ${npc.name} about ${intent.replaceAll("_", " ")}.`,
    proposedEffects: [],
    source: "deterministic_fallback"
  };
}
