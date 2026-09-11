import { PORT_BY_ID } from "../data/seed/ports.js";
import { deterministicUnit } from "./rng.js";
import { advanceWorld } from "./worldSimulation.js";
import type { CrewExperienceBand, GameState, ShipEntity } from "./types.js";
import { crewLeadershipProfile, ensureCrewWelfare } from "./crewHardship.js";
import { ensureCrewCommunity, namedCrewCount, ordinaryCrewCount } from "./crewState.js";

function clamp(value:number,min=0,max=100):number { return Math.max(min,Math.min(max,value)); }
function rememberNamedCrew(state:GameState,eventId:string):void {
  for(const member of state.player.crew){
    if(!member.npcId)continue;
    const npc=state.npcs[member.npcId];
    if(npc && !npc.brain.memories.includes(eventId))npc.brain.memories.push(eventId);
  }
}
function pushCrewEvent(state:GameState,type:string,summary:string,canonicalData:Record<string,string|number|boolean>,importance=1):string {
  const ship=state.ships[state.player.shipId];
  const id=`event.crew.${type}.${state.absoluteHour}.${state.worldEvents.length}`;
  state.worldEvents.push({id,type:`crew_${type}`,atHour:state.absoluteHour,...(state.player.currentPortId?{locationId:state.player.currentPortId}:{}),participants:[state.player.character.id,state.player.shipId,...state.player.crew.flatMap(member=>member.npcId?[member.npcId]:[])],summary,canonicalData,importance});
  const c=ship?ensureCrewCommunity(ship):undefined;
  if(c && !c.historyTags.includes(id))c.historyTags.push(id);
  rememberNamedCrew(state,id);
  return id;
}

export interface CrewRecruitOffer {
  id:string;
  label:string;
  band:CrewExperienceBand;
  experience:number;
  seamanship:number;
  gunnery:number;
  boarding:number;
  discipline:number;
  signing:number;
  description:string;
}

const BAND_DATA:Record<CrewExperienceBand,{label:string;experience:number;signing:number;description:string}>={
  green:{label:"Green Harbor Hand",experience:26,signing:14,description:"Cheap and willing, but still learning shipboard habits."},
  regular:{label:"Able Sailor",experience:42,signing:22,description:"A competent working sailor with ordinary sea time."},
  seasoned:{label:"Seasoned Deckhand",experience:58,signing:32,description:"Experienced enough to strengthen an inexperienced company."},
  veteran:{label:"Veteran Sailor",experience:72,signing:46,description:"Battle- and weather-tested; expensive, but immediately useful."},
  elite:{label:"Exceptional Hand",experience:84,signing:64,description:"Rare professional talent. Usually already has choices of berths."}
};

function offerBand(unit:number,portId:string,index:number):CrewExperienceBand {
  const stormvik=portId==="port.stormvik"?0.05:0;
  const veyrholm=portId==="port.veyrholm"?0.03:0;
  const u=Math.min(.999,unit+stormvik+veyrholm+index*.005);
  if(u<.24)return "green";
  if(u<.61)return "regular";
  if(u<.86)return "seasoned";
  if(u<.975)return "veteran";
  return "elite";
}

export function crewRecruitOffers(state:GameState):CrewRecruitOffer[] {
  const portId=state.player.currentPortId;
  if(!portId)return [];
  const day=Math.floor(state.absoluteHour/24);
  return [0,1,2].map(index=>{
    const unit=deterministicUnit(state.worldSeed,`crew-recruit:${portId}:${day}:${index}`);
    const band=offerBand(unit,portId,index);
    const base=BAND_DATA[band];
    const variance=Math.round((deterministicUnit(state.worldSeed,`crew-recruit-skill:${portId}:${day}:${index}`)-.5)*8);
    const exp=clamp(base.experience+variance);
    return {
      id:`${portId}:${day}:${index}:${band}`,
      label:base.label,
      band,
      experience:exp,
      seamanship:clamp(exp+Math.round((deterministicUnit(state.worldSeed,`crew-recruit-sea:${portId}:${day}:${index}`)-.5)*12)),
      gunnery:clamp(exp-5+Math.round((deterministicUnit(state.worldSeed,`crew-recruit-gun:${portId}:${day}:${index}`)-.5)*14)),
      boarding:clamp(exp-2+Math.round((deterministicUnit(state.worldSeed,`crew-recruit-board:${portId}:${day}:${index}`)-.5)*14)),
      discipline:clamp(38+exp*.42),
      signing:base.signing,
      description:base.description
    };
  });
}

export function recruitCrewOffer(state:GameState,offerId:string):{ok:boolean;message:string} {
  const portId=state.player.currentPortId;
  if(!portId)return {ok:false,message:"Recruiting requires a port."};
  const ship=state.ships[state.player.shipId];
  if(!ship)return {ok:false,message:"Player ship not found."};
  if(ship.systems.crew>=ship.systems.crewMax)return {ok:false,message:`${ship.name} has no open crew berth.`};
  const offer=crewRecruitOffers(state).find(row=>row.id===offerId);
  if(!offer)return {ok:false,message:"That sailor is no longer available."};
  if(state.player.character.crowns<offer.signing)return {ok:false,message:`The ${offer.label.toLowerCase()} wants ${offer.signing} crowns to sign on.`};
  const c=ensureCrewCommunity(ship);
  const ordinaryBefore=ordinaryCrewCount(state);
  const weight=Math.max(1,ordinaryBefore);
  const mix=(current:number,incoming:number)=>ordinaryBefore<=0?incoming:(current*weight+incoming)/(weight+1);
  state.player.character.crowns-=offer.signing;
  ship.systems.crew+=1;
  c.experience=clamp(mix(c.experience,offer.experience));
  c.seamanship=clamp(mix(c.seamanship,offer.seamanship));
  c.gunnery=clamp(mix(c.gunnery,offer.gunnery));
  c.boarding=clamp(mix(c.boarding,offer.boarding));
  c.discipline=clamp(mix(c.discipline,offer.discipline));
  c.loyalty=clamp(c.loyalty-1); // New strangers slightly dilute an established company's cohesion.
  c.recruitsHired+=1;
  pushCrewEvent(state,"recruited",`${offer.label} signs aboard ${ship.name} in ${PORT_BY_ID[portId]?.name??portId}.`,{offerId,band:offer.band,signing:offer.signing,crew:ship.systems.crew,experience:Number(c.experience.toFixed(1))});
  return {ok:true,message:`${offer.label} signs aboard for ${offer.signing} crowns. Crew ${ship.systems.crew}/${ship.systems.crewMax}.`};
}

export function shoreLeaveCost(state:GameState):number {
  const ship=state.ships[state.player.shipId];
  return ship?Math.max(10,Math.ceil(ship.systems.crew*1.5)):12;
}

export function takeCrewShoreLeave(state:GameState):{ok:boolean;message:string} {
  const portId=state.player.currentPortId;
  if(!portId)return {ok:false,message:"You need to be in port to stand the crew down."};
  const ship=state.ships[state.player.shipId];
  if(!ship)return {ok:false,message:"Player ship not found."};
  const cost=shoreLeaveCost(state);
  if(state.player.character.crowns<cost)return {ok:false,message:`Food, bunks, and shore leave cost ${cost} crowns for the company.`};
  state.player.character.crowns-=cost;
  const c=ensureCrewCommunity(ship);
  const moraleGain=ship.systems.morale<40?10:ship.systems.morale<65?8:5;
  ship.systems.morale=clamp(ship.systems.morale+moraleGain);
  c.loyalty=clamp(c.loyalty+3);
  c.foodSatisfaction=clamp(c.foodSatisfaction+12);
  c.paySatisfaction=clamp(c.paySatisfaction+2);
  c.fatigue=clamp(c.fatigue-25);
  c.lastShoreLeaveHour=state.absoluteHour;
  const welfare=ensureCrewWelfare(ship);
  welfare.averageHealth=clamp(welfare.averageHealth+(welfare.averageHealth<75?2:1));
  for(const member of state.player.crew){member.morale=clamp(member.morale+Math.max(3,moraleGain-2));member.loyalty=clamp(member.loyalty+1);member.health=clamp((member.health??100)+1);}
  advanceWorld(state,8);
  pushCrewEvent(state,"shore_leave",`${ship.name}'s company received food, bunks, and eight hours ashore in ${PORT_BY_ID[portId]?.name??portId}.`,{cost,moraleGain,loyaltyGain:3,crew:ship.systems.crew},0);
  return {ok:true,message:`Eight hours ashore cost ${cost} crowns. Crew morale improves to ${ship.systems.morale}.`};
}

export function recordPrizeForCrew(state:GameState,prizeValue:number):void {
  const ship=state.ships[state.player.shipId];
  if(!ship||prizeValue<=0)return;
  const c=ensureCrewCommunity(ship);
  const due=Math.max(8,Math.round(prizeValue*.20));
  c.outstandingPrizeShare+=due;
  c.victories+=1;
  c.experience=clamp(c.experience+2);
  c.gunnery=clamp(c.gunnery+1);
  c.boarding=clamp(c.boarding+0.5);
  ship.systems.morale=clamp(ship.systems.morale+2);
  pushCrewEvent(state,"prize_won",`${ship.name}'s company expects a share of ${prizeValue} crowns in recovered prize value.`,{prizeValue,crewShareDue:due,outstandingPrizeShare:c.outstandingPrizeShare,victories:c.victories});
}

export function sharePrizeWithCrew(state:GameState):{ok:boolean;message:string} {
  const ship=state.ships[state.player.shipId];
  if(!ship)return {ok:false,message:"Player ship not found."};
  const c=ensureCrewCommunity(ship);
  const due=Math.round(c.outstandingPrizeShare);
  if(due<=0)return {ok:false,message:"There is no unsettled prize share to divide."};
  if(state.player.character.crowns<due)return {ok:false,message:`The company is due ${due} crowns, but you do not have enough on hand.`};
  state.player.character.crowns-=due;
  c.outstandingPrizeShare=0;
  c.paySatisfaction=clamp(c.paySatisfaction+20);
  c.loyalty=clamp(c.loyalty+10);
  ship.systems.morale=clamp(ship.systems.morale+8);
  c.lastPrizeShareHour=state.absoluteHour;
  for(const member of state.player.crew){member.morale=clamp(member.morale+4);member.loyalty=clamp(member.loyalty+4);}
  if(state.player.currentPortId)advanceWorld(state,1);
  pushCrewEvent(state,"prize_shared",`The captain divided ${due} crowns of prize money among ${ship.name}'s company.`,{sharedCrowns:due,moraleGain:8,loyaltyGain:10},1);
  return {ok:true,message:`You divide ${due} crowns among the company. Morale and loyalty rise.`};
}

export function recordCrewCasualties(state:GameState,count:number,source:string):void {
  if(count<=0)return;
  const ship=state.ships[state.player.shipId];
  if(!ship)return;
  const c=ensureCrewCommunity(ship);
  c.casualtiesRemembered+=count;
  c.fatigue=clamp(c.fatigue+count*4);
  const moraleLoss=Math.min(8,1+count*2);
  ship.systems.morale=clamp(ship.systems.morale-moraleLoss);
  c.loyalty=clamp(c.loyalty-(count>=2?1:0));
  c.experience=clamp(c.experience+Math.min(2,count*.5));
  pushCrewEvent(state,"casualties",`${count} member${count===1?"":"s"} of ${ship.name}'s company were lost or put out of action during ${source}.`,{count,source,moraleLoss,casualtiesRemembered:c.casualtiesRemembered},count>=2?2:1);
}

export function recordDangerousCrewOrder(state:GameState,reason:string,severity=1):void {
  const ship=state.ships[state.player.shipId];
  if(!ship)return;
  const c=ensureCrewCommunity(ship);
  c.dangerousOrdersRemembered+=Math.max(1,severity);
  c.fatigue=clamp(c.fatigue+severity*2);
  const leadership=crewLeadershipProfile(state);
  const shaky=ship.systems.morale<48||c.loyalty<45;
  const moraleLoss=shaky?Math.max(0,Math.ceil(severity*(1.2-leadership.score/120))):0;
  if(moraleLoss>0)ship.systems.morale=clamp(ship.systems.morale-moraleLoss);
  pushCrewEvent(state,"dangerous_order",`${ship.name}'s company remembers the captain ordering ${reason}.`,{reason,severity,moraleLoss,leadershipScore:leadership.score,dangerousOrdersRemembered:c.dangerousOrdersRemembered},0);
}

export function recordUnderprovisionedDeparture(state:GameState):void {
  const ship=state.ships[state.player.shipId];
  if(!ship||ship.supplies>0)return;
  const c=ensureCrewCommunity(ship);
  c.foodSatisfaction=clamp(c.foodSatisfaction-8);
  c.loyalty=clamp(c.loyalty-2);
  ship.systems.morale=clamp(ship.systems.morale-1);
  recordDangerousCrewOrder(state,"putting to sea without stores",2);
}

export function recordCompletedCrewVoyage(state:GameState):void {
  const ship=state.ships[state.player.shipId];
  if(!ship)return;
  const c=ensureCrewCommunity(ship);
  c.experience=clamp(c.experience+.6);
  c.seamanship=clamp(c.seamanship+.5);
  c.fatigue=clamp(c.fatigue+3);
  // An unpaid prize obligation becomes a real grievance when the captain keeps sailing without settling it.
  // This is deliberately slow so a captain can reasonably reach a port and pay the company.
  if(c.outstandingPrizeShare>0){
    c.paySatisfaction=clamp(c.paySatisfaction-2);
    if(c.paySatisfaction<35)c.loyalty=clamp(c.loyalty-1);
  }
}

export function checkTavernDesertion(state:GameState):{ok:boolean;message:string;left:number} {
  const portId=state.player.currentPortId;
  const ship=state.ships[state.player.shipId];
  if(!portId||!ship)return {ok:true,message:"",left:0};
  const c=ensureCrewCommunity(ship);
  const checkKey=`${portId}:${Math.floor(state.absoluteHour/24)}`;
  if(c.lastDesertionCheckKey===checkKey)return {ok:true,message:"",left:0};
  c.lastDesertionCheckKey=checkKey;
  const ordinary=ordinaryCrewCount(state);
  if(ordinary<=0)return {ok:true,message:"",left:0};
  const welfare=ensureCrewWelfare(ship);
  const leadership=crewLeadershipProfile(state);
  let risk=Math.max(0,45-ship.systems.morale)*.85+Math.max(0,45-c.loyalty)*.75+Math.max(0,c.fatigue-65)*.22;
  // Poor food/pay are remembered as company grievances, but remain secondary to morale and loyalty.
  risk+=Math.max(0,40-c.foodSatisfaction)*.35+Math.max(0,40-c.paySatisfaction)*.35;
  risk+=Math.max(0,(welfare.shortageEpisodes??0)-1)*1.5;
  risk+=c.outstandingPrizeShare>0?4:0;
  risk+=Math.min(8,c.dangerousOrdersRemembered*.45);
  risk-=leadership.score*.08;
  risk=clamp(risk,0,65);
  if(risk<10)return {ok:true,message:"",left:0};
  const roll=deterministicUnit(state.worldSeed,`crew-desertion:${checkKey}:${c.desertions}`)*100;
  if(roll>=risk)return {ok:true,message:"",left:0};
  const left=Math.min(ordinary,risk>=42&&ordinary>=4?2:1);
  ship.systems.crew=Math.max(namedCrewCount(state),ship.systems.crew-left);
  c.desertions+=left;
  c.loyalty=clamp(c.loyalty-2);
  ship.systems.morale=clamp(ship.systems.morale-2);
  pushCrewEvent(state,"desertion",`${left} sailor${left===1?"":"s"} left ${ship.name} while ashore in ${PORT_BY_ID[portId]?.name??portId}.`,{left,risk:Number(risk.toFixed(1)),roll:Number(roll.toFixed(1)),crew:ship.systems.crew,desertions:c.desertions},2);
  return {ok:true,message:`${left} sailor${left===1?"":"s"} quietly leave${left===1?"s":""} the ship while ashore. Crew ${ship.systems.crew}/${ship.systems.crewMax}.`,left};
}
