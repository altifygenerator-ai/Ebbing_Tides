import { COMMODITY_BY_ID } from "../data/seed/commodities.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { SETTLEMENT_ECONOMIC_PROFILE_BY_ID } from "../data/seed/regionalAvailability.js";
import { politicalPowerForRegion } from "../data/seed/politicalPowers.js";
import { resolveCheck } from "./checks.js";
import { transact } from "./economy.js";
import { deterministicUnit } from "./rng.js";
import { advanceWorld } from "./worldSimulation.js";
import { factionStanding, legalStateForFaction, portStanding, recordPortCrime } from "./reputationLaw.js";
import { activeWorldCauses, worldCauseAppliesToPort } from "./worldCauses.js";
import { activeLetterOfMarque, activePolicyEnemyFactions, activeTradeCredential, blackMarketAccess, customsCapacityForPort, evaluateCommodityTradeLaw, normalizeTradeLawState, privateeringOpenForFaction, tradePolicyForPort } from "./tradeLaw.js";
import type { CustomsInspectionState, EntityId, GameState, TradeCredentialRecord } from "./types.js";

function cargoViolationIds(state:GameState,portId:EntityId):{controlled:EntityId[];prohibited:EntityId[]} {
  const ship=state.ships[state.player.shipId];
  const controlled:EntityId[]=[]; const prohibited:EntityId[]=[];
  for(const stack of ship?.cargo??[]){
    const law=evaluateCommodityTradeLaw(state,portId,stack.commodityId);
    if(law.status==="permit_required")controlled.push(stack.commodityId);
    else if(law.status==="prohibited"||law.status==="embargoed")prohibited.push(stack.commodityId);
  }
  return {controlled:[...new Set(controlled)],prohibited:[...new Set(prohibited)]};
}

export function customsInspectionRisk(state:GameState,portId:EntityId):number {
  const port=PORT_BY_ID[portId]; if(!port)return 0;
  const power=politicalPowerForRegion(port.region);
  const legal=legalStateForFaction(state,power.factionId);
  const local=portStanding(state,portId);
  const violations=cargoViolationIds(state,portId);
  let risk=12+customsCapacityForPort(portId)*9+Math.min(30,legal.heat*.3)+Math.max(0,-local)*.25+violations.controlled.length*18+violations.prohibited.length*28;
  const causes=activeWorldCauses(state).filter(c=>worldCauseAppliesToPort(c,portId));
  if(causes.some(c=>c.policyTags.includes("customs.search.intense")))risk+=22;
  if(causes.some(c=>c.policyTags.includes("customs.search.relaxed")))risk-=18;
  return Math.max(5,Math.min(95,Math.round(risk)));
}

export function prepareCustomsInspectionOnArrival(state:GameState,portId:EntityId):CustomsInspectionState|undefined {
  if(!state.arrival||state.arrival.destination.type!=="port"||state.arrival.destination.id!==portId)return undefined;
  const violations=cargoViolationIds(state,portId);
  const risk=customsInspectionRisk(state,portId);
  const mandatory=violations.controlled.length>0||violations.prohibited.length>0;
  const roll=Math.floor(deterministicUnit(state.worldSeed,`customs-arrival:${portId}:${state.absoluteHour}:${state.player.shipId}`)*100)+1;
  if(!mandatory&&roll>risk)return undefined;
  const inspection:CustomsInspectionState={id:`customs.${portId}.${state.absoluteHour}`,portId,createdAtHour:state.absoluteHour,status:"pending",intensity:risk,controlledCommodityIds:violations.controlled,prohibitedCommodityIds:violations.prohibited,reason:mandatory?"Your manifest contains cargo that current customs law requires officers to examine.":"Harbor customs selected Tideworn for a routine inspection."};
  state.arrival.customsInspection=inspection;
  state.worldEvents.push({id:`event.customs.inspection.${inspection.id}`,type:"customs_inspection_started",atHour:state.absoluteHour,locationId:portId,participants:[state.player.character.id,state.player.shipId],summary:`Customs inspection opened at ${PORT_BY_ID[portId]?.name??portId}.`,canonicalData:{inspectionId:inspection.id,intensity:risk,controlled:violations.controlled.length,prohibited:violations.prohibited.length},importance:1});
  return inspection;
}

function removeCargo(state:GameState,ids:Set<EntityId>):number {
  const ship=state.ships[state.player.shipId]; if(!ship)return 0;
  let units=0;
  for(const stack of ship.cargo)if(ids.has(stack.commodityId))units+=stack.quantity;
  ship.cargo=ship.cargo.filter(stack=>!ids.has(stack.commodityId));
  return units;
}

export function presentCustomsPapers(state:GameState):{ok:boolean;message:string} {
  const inspection=state.arrival?.customsInspection;
  if(!inspection||inspection.status!=="pending")return {ok:false,message:"No customs inspection is waiting for your response."};
  const confiscatedIds=new Set([...inspection.controlledCommodityIds,...inspection.prohibitedCommodityIds]);
  const confiscated=removeCargo(state,confiscatedIds);
  const penalty=confiscated>0?Math.min(state.player.character.crowns,Math.max(20,confiscated*12)):0;
  state.player.character.crowns-=penalty;
  inspection.status="cleared";
  advanceWorld(state,1);
  inspection.resolvedAtHour=state.absoluteHour;
  const detail=confiscated>0?` You declared ${confiscated} non-cleared cargo unit${confiscated===1?"":"s"}; customs seized them${penalty?` and assessed ${penalty} crowns`:""}. No evasion charge was created.`:" Your papers and manifest clear the inspection.";
  state.worldEvents.push({id:`event.customs.cleared.${inspection.id}`,type:"customs_inspection_resolved",atHour:state.absoluteHour,locationId:inspection.portId,participants:[state.player.character.id],summary:`Customs inspection resolved by declaration.${detail}`,canonicalData:{inspectionId:inspection.id,method:"declared",confiscated,penalty,crime:false},importance:1});
  return {ok:true,message:`Customs clears Tideworn.${detail}`};
}

export function concealFromCustoms(state:GameState):{ok:boolean;message:string} {
  const inspection=state.arrival?.customsInspection;
  if(!inspection||inspection.status!=="pending")return {ok:false,message:"No customs inspection is waiting for your response."};
  const ids=new Set([...inspection.controlledCommodityIds,...inspection.prohibitedCommodityIds]);
  if(!ids.size)return {ok:false,message:"There is no controlled cargo on the manifest worth concealing. Present your papers instead."};
  const c=state.player.character;
  const useStreetwise=(c.skills.streetwise??0)>(c.skills.deception??0);
  const skillId=useStreetwise?"streetwise":"deception";
  const skillRating=c.skills[skillId];
  const ship=state.ships[state.player.shipId];
  const hidden=ship?.refits.includes("refit.hidden_smuggler_compartments")||ship?.systemTags?.includes("hidden_smuggler_compartments");
  const lived=c.background==="raised_among_smugglers"||c.recentProfession==="smuggler";
  const bonus=(hidden?12:0)+(lived?6:0);
  const check=resolveCheck({worldSeed:state.worldSeed,checkId:`customs-conceal:${inspection.id}`,skillId,skillRating:skillRating+bonus,attributeId:"presence",attributeRating:c.attributes.presence,difficulty:Math.round(16+inspection.intensity*.22),specializations:c.specializations,specialistCharacterId:c.id});
  const portId=inspection.portId;
  const mostSerious=[...ids].map(id=>evaluateCommodityTradeLaw(state,portId,id)).sort((a,b)=>(b.status==="embargoed"?3:b.status==="prohibited"?2:1)-(a.status==="embargoed"?3:a.status==="prohibited"?2:1))[0];
  if(check.outcome==="exceptional_success"||check.outcome==="clean_success"||check.outcome==="costly_success"){
    recordPortCrime(state,"smuggling",portId,"Concealed controlled cargo through customs without detection.",false);
    inspection.status="evaded";
    advanceWorld(state,1);
    inspection.resolvedAtHour=state.absoluteHour;
    state.worldEvents.push({id:`event.customs.evaded.${inspection.id}`,type:"customs_inspection_resolved",atHour:state.absoluteHour,locationId:portId,participants:[c.id],summary:"Tideworn passed customs with concealed cargo still aboard.",canonicalData:{inspectionId:inspection.id,method:"conceal",detected:false,skillId,roll:check.roll,chance:check.chance},importance:2});
    return {ok:true,message:"The concealed cargo gets through. Customs does not know what happened, but the smuggling act remains part of campaign truth."};
  }
  const confiscated=removeCargo(state,ids);
  const penalty=Math.min(c.crowns,Math.max(50,confiscated*20)); c.crowns-=penalty;
  const crimeType=mostSerious?.violationCrimeType??"customs_evasion";
  recordPortCrime(state,crimeType==="aiding_enemy"?"aiding_enemy":"customs_evasion",portId,crimeType==="aiding_enemy"?"Attempted to move embargoed cargo through customs by concealment.":"Attempted to conceal controlled cargo from customs.",true);
  inspection.status="detected";
  advanceWorld(state,1);
  inspection.resolvedAtHour=state.absoluteHour;
  return {ok:true,message:`Customs finds the concealment. ${confiscated} cargo unit${confiscated===1?"":"s"} are seized and ${penalty} crowns are collected. The authority records the offense through the normal legal-report system.`};
}

export function obtainCustomsPermit(state:GameState):{ok:boolean;message:string} {
  const portId=state.player.currentPortId; if(!portId)return {ok:false,message:"Customs papers must be issued in port."};
  normalizeTradeLawState(state);
  const port=PORT_BY_ID[portId]!; const power=politicalPowerForRegion(port.region); const policy=tradePolicyForPort(portId);
  if(activeTradeCredential(state,"customs_permit",power.jurisdictionId))return {ok:false,message:"Your customs permit is already current."};
  const legal=legalStateForFaction(state,power.factionId);
  if(legal.status==="wanted"||legal.status==="outlawed")return {ok:false,message:"The customs office will not issue routine trade papers while an active warrant stands."};
  if(state.player.character.crowns<policy.customsPermitCost)return {ok:false,message:`The permit costs ${policy.customsPermitCost} crowns.`};
  state.player.character.crowns-=policy.customsPermitCost;
  advanceWorld(state,policy.customsPermitHours);
  const credential:TradeCredentialRecord={id:`credential.customs.${power.jurisdictionId}.${state.absoluteHour}`,kind:"customs_permit",jurisdictionId:power.jurisdictionId,factionId:power.factionId,issuerPortId:portId,issuedAtHour:state.absoluteHour,expiresAtHour:state.absoluteHour+policy.customsPermitDurationHours,status:"active",authorizedEnemyFactionIds:[],reason:`Current trade permit issued by ${policy.authorityLabel}.`};
  state.player.tradeCredentials.push(credential);
  state.worldEvents.push({id:`event.${credential.id}`,type:"trade_credential_issued",atHour:state.absoluteHour,locationId:portId,participants:[state.player.character.id],summary:`${policy.authorityLabel} issued current customs papers.`,canonicalData:{credentialId:credential.id,kind:credential.kind,jurisdictionId:credential.jurisdictionId,expiresAtHour:credential.expiresAtHour??0},importance:1});
  return {ok:true,message:`Customs permit issued for ${policy.customsPermitCost} crowns. It remains current for 180 days.`};
}

export function obtainLetterOfMarque(state:GameState):{ok:boolean;message:string} {
  const portId=state.player.currentPortId; if(!portId)return {ok:false,message:"A commission must be issued by a competent government office."};
  normalizeTradeLawState(state);
  const port=PORT_BY_ID[portId]!; const power=politicalPowerForRegion(port.region); const policy=tradePolicyForPort(portId);
  const enemies=activePolicyEnemyFactions(state,power.factionId);
  if(!privateeringOpenForFaction(state,power.factionId)||!enemies.length)return {ok:false,message:"No current state policy authorizes privateering from this jurisdiction."};
  if(activeLetterOfMarque(state,power.factionId))return {ok:false,message:"You already hold an active commission from this authority."};
  const legal=legalStateForFaction(state,power.factionId);
  if(legal.status!=="clear"&&legal.status!=="watched")return {ok:false,message:"The issuing authority will not commission a captain with an active warrant."};
  if(factionStanding(state,power.factionId)<policy.commissionMinimumStanding)return {ok:false,message:`The crown requires at least ${policy.commissionMinimumStanding} political standing before entrusting a privateering commission.`};
  if(state.player.character.crowns<policy.commissionCost)return {ok:false,message:`The commission bond and papers cost ${policy.commissionCost} crowns.`};
  state.player.character.crowns-=policy.commissionCost;
  advanceWorld(state,policy.commissionHours);
  const relevantCauses=activeWorldCauses(state).filter(c=>worldCauseAppliesToPort(c,portId)&&c.policyTags.includes("privateering.open"));
  const causeEnd=relevantCauses.map(c=>c.scheduledEndAtHour).filter((v):v is number=>v!==undefined).sort((a,b)=>a-b)[0];
  for(const row of state.player.tradeCredentials){
    if(row.kind==="letter_of_marque"&&row.jurisdictionId===power.jurisdictionId&&row.status==="active")row.status="expired";
  }
  const credential:TradeCredentialRecord={id:`credential.marque.${power.jurisdictionId}.${state.absoluteHour}`,kind:"letter_of_marque",jurisdictionId:power.jurisdictionId,factionId:power.factionId,issuerPortId:portId,issuedAtHour:state.absoluteHour,expiresAtHour:causeEnd??state.absoluteHour+24*180,status:"active",authorizedEnemyFactionIds:enemies,reason:`Letter of marque authorizing prizes against ${enemies.join(", ")}.`};
  state.player.tradeCredentials.push(credential);
  state.worldEvents.push({id:`event.${credential.id}`,type:"privateering_commission_issued",atHour:state.absoluteHour,locationId:portId,participants:[state.player.character.id],summary:`${power.label} issued ${state.player.character.name} a privateering commission.`,canonicalData:{credentialId:credential.id,enemies:enemies.join(","),expiresAtHour:credential.expiresAtHour??0},importance:3});
  return {ok:true,message:`Letter of marque issued. Authorized enemy flags: ${enemies.join(", ")}.`};
}

export function attemptSmuggledTransaction(state:GameState,commodityId:EntityId,quantity:number,direction:"buy"|"sell"):{ok:boolean;message:string} {
  const portId=state.player.currentPortId; if(!portId)return {ok:false,message:"You need a port to reach a local broker."};
  const law=evaluateCommodityTradeLaw(state,portId,commodityId);
  if(law.status==="open")return {ok:false,message:"That cargo can be traded openly; there is no reason to use the back channels."};
  const access=blackMarketAccess(state,portId); if(!access.available)return {ok:false,message:access.reason};
  const c=state.player.character; const skillId=(c.skills.streetwise??0)>=(c.skills.deception??0)?"streetwise":"deception";
  const profile=SETTLEMENT_ECONOMIC_PROFILE_BY_ID[portId]; const customs=customsCapacityForPort(portId);
  const difficulty=16+customs*3+(law.status==="embargoed"?6:law.status==="prohibited"?4:1)-Math.min(5,(profile?.smugglingAvailability??0));
  const check=resolveCheck({worldSeed:state.worldSeed,checkId:`black-market:${portId}:${commodityId}:${direction}:${state.absoluteHour}`,skillId,skillRating:c.skills[skillId],attributeId:"presence",attributeRating:c.attributes.presence,difficulty,specializations:c.specializations,specialistCharacterId:c.id});
  if(check.outcome==="failure"||check.outcome==="severe_failure"){
    recordPortCrime(state,law.violationCrimeType==="aiding_enemy"?"aiding_enemy":"smuggling",portId,`Customs or harbor officers uncovered an attempted back-channel ${direction} of ${COMMODITY_BY_ID[commodityId]?.name??commodityId}.`,true);
    return {ok:false,message:"The back-channel deal is exposed before cargo changes hands. The offense goes straight into the existing local legal-report chain."};
  }
  const result=transact(state,commodityId,quantity,direction,{channel:"smuggled",priceMultiplier:direction==="buy"?1.22:.78});
  if(!result.ok)return result;
  recordPortCrime(state,law.violationCrimeType==="aiding_enemy"?"aiding_enemy":"smuggling",portId,`Moved ${COMMODITY_BY_ID[commodityId]?.name??commodityId} through a concealed local trade channel.`,false);
  return {ok:true,message:`${result.message} The exchange stayed outside ordinary customs channels; no authority report was created.`};
}
