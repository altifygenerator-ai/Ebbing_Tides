import { COMMODITY_BY_ID } from "../data/seed/commodities.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { JURISDICTION_TRADE_POLICY_BY_ID, type BaselineTradeTreatment, type JurisdictionTradePolicyDefinition } from "../data/seed/tradePolicies.js";
import { SETTLEMENT_ECONOMIC_PROFILE_BY_ID } from "../data/seed/regionalAvailability.js";
import { POLITICAL_POWER_BY_FACTION, politicalPowerForRegion, politicalPowerForShip } from "../data/seed/politicalPowers.js";
import { activeWorldCauses, worldCauseAppliesToPort } from "./worldCauses.js";
import type { CrimeType, EntityId, GameState, ShipEntity, TradeCredentialRecord } from "./types.js";

export type TradeLegalityStatus = "open" | "permit_required" | "prohibited" | "embargoed";
export interface TradeLegalityDecision {
  commodityId: EntityId;
  portId: EntityId;
  jurisdictionId: EntityId;
  factionId: EntityId;
  status: TradeLegalityStatus;
  label: string;
  reason: string;
  causeIds: EntityId[];
  credentialValid: boolean;
  violationCrimeType: CrimeType;
}

const FALLBACK_POLICY: JurisdictionTradePolicyDefinition = {
  jurisdictionId:"jurisdiction.unknown",factionId:"faction.unknown",label:"Local customs",authorityLabel:"Harbor customs",
  customsPermitCost:60,customsPermitHours:2,customsPermitDurationHours:24*180,commissionCost:120,commissionHours:6,commissionMinimumStanding:10,
  byLegalStatus:{ordinary:"open",licensed:"permit",restricted:"permit",politically_sensitive:"permit",sacred:"permit",military_only:"prohibited",contraband:"prohibited",stolen:"prohibited"}
};

export function tradePolicyForPort(portId:EntityId):JurisdictionTradePolicyDefinition {
  const port=PORT_BY_ID[portId];
  if(!port)return FALLBACK_POLICY;
  const power=politicalPowerForRegion(port.region);
  const policy=JURISDICTION_TRADE_POLICY_BY_ID[power.jurisdictionId];
  return policy ?? {...FALLBACK_POLICY,jurisdictionId:power.jurisdictionId,factionId:power.factionId,label:`${power.jurisdictionLabel} customs`};
}

export function normalizeTradeLawState(state:GameState):void {
  state.player.tradeCredentials??=[];
  for(const row of state.player.tradeCredentials){
    row.status??="active";
    if(row.status==="active"&&row.expiresAtHour!==undefined&&state.absoluteHour>=row.expiresAtHour)row.status="expired";
    row.authorizedEnemyFactionIds??=[];
  }
}

export function activeTradeCredential(state:GameState,kind:TradeCredentialRecord["kind"],jurisdictionId?:EntityId):TradeCredentialRecord|undefined {
  normalizeTradeLawState(state);
  return state.player.tradeCredentials.find(row=>row.kind===kind&&row.status==="active"&&(!jurisdictionId||row.jurisdictionId===jurisdictionId));
}

function matchesCommodityTag(tag:string,commodityId:string,category:string,origin:string|undefined):boolean {
  const [kind,...rest]=tag.split(":");
  const value=rest.join(":");
  if(kind==="commodity")return value===commodityId;
  if(kind==="category")return value===category;
  if(kind==="origin")return Boolean(origin)&&value===origin;
  return false;
}

function policyCausesForPort(state:GameState,portId:EntityId){
  return activeWorldCauses(state).filter(cause=>worldCauseAppliesToPort(cause,portId));
}

export function evaluateCommodityTradeLaw(state:GameState,portId:EntityId,commodityId:EntityId):TradeLegalityDecision {
  normalizeTradeLawState(state);
  const port=PORT_BY_ID[portId];
  const good=COMMODITY_BY_ID[commodityId];
  if(!port||!good)return {commodityId,portId,jurisdictionId:"jurisdiction.unknown",factionId:"faction.unknown",status:"prohibited",label:"Unavailable",reason:"No competent customs rule is available for this cargo.",causeIds:[],credentialValid:false,violationCrimeType:"smuggling"};
  const power=politicalPowerForRegion(port.region);
  const policy=tradePolicyForPort(portId);
  const baseline=(policy.byLegalStatus[good.legalStatus??"ordinary"]??"open") as BaselineTradeTreatment;
  const permit=activeTradeCredential(state,"customs_permit",power.jurisdictionId);
  let status:TradeLegalityStatus=baseline==="prohibited"?"prohibited":baseline==="permit"&&!permit?"permit_required":"open";
  let reason=baseline==="prohibited"?`${policy.label} prohibits ordinary import or sale of this class of cargo.`:baseline==="permit"?`${policy.label} requires current customs papers for this class of cargo.`:`Ordinary trade is open under ${policy.label}.`;
  let violationCrimeType:CrimeType="smuggling";
  const causeIds:EntityId[]=[];
  for(const cause of policyCausesForPort(state,portId)){
    for(const raw of cause.policyTags??[]){
      if(raw.startsWith("trade.embargo.")){
        const selector=raw.slice("trade.embargo.".length);
        if(matchesCommodityTag(selector,good.id,good.category,String(good.originRegion??""))){ status="embargoed";reason=`${cause.title}: ${cause.reason}`;violationCrimeType="aiding_enemy";causeIds.push(cause.id); }
      } else if(raw.startsWith("trade.prohibit.")){
        const selector=raw.slice("trade.prohibit.".length);
        if(matchesCommodityTag(selector,good.id,good.category,String(good.originRegion??""))){ status="prohibited";reason=`${cause.title}: ${cause.reason}`;causeIds.push(cause.id); }
      } else if(raw.startsWith("trade.license.")){
        const selector=raw.slice("trade.license.".length);
        if(matchesCommodityTag(selector,good.id,good.category,String(good.originRegion??""))){ status=permit?"open":"permit_required";reason=`${cause.title}: current policy requires customs papers for this cargo.`;causeIds.push(cause.id); }
      }
    }
  }
  return {commodityId,portId,jurisdictionId:power.jurisdictionId,factionId:power.factionId,status,label:status==="open"?(baseline==="permit"?"Licensed":"Open"):status==="permit_required"?"Permit required":status==="embargoed"?"Embargoed":"Prohibited",reason,causeIds:[...new Set(causeIds)],credentialValid:Boolean(permit),violationCrimeType};
}

export function customsCapacityForPort(portId:EntityId):number {
  const profile=SETTLEMENT_ECONOMIC_PROFILE_BY_ID[portId];
  if(!profile)return 1;
  return Math.max(0,Math.min(4,Math.round(1+profile.militarySupplyLevel*.75-profile.smugglingAvailability*.25)));
}

export function blackMarketAccess(state:GameState,portId:EntityId):{available:boolean;rating:number;reason:string} {
  const profile=SETTLEMENT_ECONOMIC_PROFILE_BY_ID[portId];
  const c=state.player.character;
  const streetwise=Number(c.skills.streetwise??0);
  const lived=c.background==="raised_among_smugglers"||c.recentProfession==="smuggler";
  const availability=profile?.smugglingAvailability??0;
  const rating=availability*10+streetwise+(lived?18:0);
  return {available:availability>0&&(lived||streetwise>=15),rating,reason:lived?"Your underworld experience gives you a way into the local back channels.":streetwise>=15?"Your Streetwise is enough to find discreet local brokers.":"You do not know how to reach a trustworthy back-channel broker here."};
}

function worldCauseAppliesToFaction(cause:import("./types.js").WorldCauseRecord,factionId:EntityId):boolean {
  const scope=cause.scope??{};
  const hasScope=Boolean(scope.factionIds?.length||scope.jurisdictionIds?.length||scope.regionIds?.length||scope.portIds?.length);
  if(!hasScope)return true;
  if(scope.factionIds?.includes(factionId))return true;
  const power=POLITICAL_POWER_BY_FACTION[factionId];
  if(!power)return false;
  if(scope.jurisdictionIds?.includes(power.jurisdictionId)||scope.regionIds?.includes(power.region))return true;
  if(scope.portIds?.some(portId=>PORT_BY_ID[portId]?.region===power.region))return true;
  return false;
}

export function activePolicyEnemyFactions(state:GameState,factionId:EntityId):EntityId[] {
  const out=new Set<EntityId>();
  for(const cause of activeWorldCauses(state)){
    if(!worldCauseAppliesToFaction(cause,factionId))continue;
    for(const tag of cause.policyTags??[]){
      if(tag.startsWith("war.enemy:"))out.add(tag.slice("war.enemy:".length));
      if(tag.startsWith("privateering.enemy:"))out.add(tag.slice("privateering.enemy:".length));
    }
  }
  return [...out];
}

export function privateeringOpenForFaction(state:GameState,factionId:EntityId):boolean {
  return activeWorldCauses(state).some(cause=>worldCauseAppliesToFaction(cause,factionId)&&cause.policyTags.includes("privateering.open"));
}

export function activeLetterOfMarque(state:GameState,issuingFactionId?:EntityId):TradeCredentialRecord|undefined {
  normalizeTradeLawState(state);
  return state.player.tradeCredentials.find(row=>{
    if(row.kind!=="letter_of_marque"||row.status!=="active"||(issuingFactionId&&row.factionId!==issuingFactionId))return false;
    if(!privateeringOpenForFaction(state,row.factionId))return false;
    const liveEnemies=activePolicyEnemyFactions(state,row.factionId);
    return row.authorizedEnemyFactionIds.some(enemy=>liveEnemies.includes(enemy));
  });
}

export function isAuthorizedPrizeTarget(state:GameState,target:ShipEntity):{authorized:boolean;commission?:TradeCredentialRecord;reason:string} {
  const targetFaction=politicalPowerForShip(target).factionId;
  normalizeTradeLawState(state);
  for(const commission of state.player.tradeCredentials){
    if(commission.kind!=="letter_of_marque"||commission.status!=="active")continue;
    if(!privateeringOpenForFaction(state,commission.factionId))continue;
    const enemies=activePolicyEnemyFactions(state,commission.factionId);
    if(commission.authorizedEnemyFactionIds.includes(targetFaction)&&enemies.includes(targetFaction))return {authorized:true,commission,reason:`Prize authorized under ${commission.reason}`};
  }
  return {authorized:false,reason:"No active commission authorizes this target."};
}

export function playerPoliticalFactionId(state:GameState):EntityId {
  return politicalPowerForRegion(state.player.character.homelandRegion).factionId;
}

export function wartimePostureAgainstPlayer(state:GameState,ship:ShipEntity):boolean {
  const faction=politicalPowerForShip(ship).factionId;
  return activePolicyEnemyFactions(state,faction).includes(playerPoliticalFactionId(state));
}
