import type { CrewExperienceBand, GameState, ShipCrewCommunityState, ShipEntity } from "./types.js";

function clamp(value:number,min=0,max=100):number { return Math.max(min,Math.min(max,value)); }

export function ensureCrewCommunity(ship:ShipEntity):ShipCrewCommunityState {
  if(!ship.crewCommunity){
    const morale=clamp(ship.systems.morale);
    ship.crewCommunity={
      experience:42,
      discipline:55,
      loyalty:Math.round(48+morale*.16),
      seamanship:48,
      gunnery:42,
      boarding:44,
      paySatisfaction:60,
      foodSatisfaction:72,
      fatigue:12,
      outstandingPrizeShare:0,
      victories:0,
      casualtiesRemembered:0,
      dangerousOrdersRemembered:0,
      recruitsHired:0,
      desertions:0,
      historyTags:[]
    };
  }
  const c=ship.crewCommunity;
  c.experience=clamp(c.experience); c.discipline=clamp(c.discipline); c.loyalty=clamp(c.loyalty);
  c.seamanship=clamp(c.seamanship); c.gunnery=clamp(c.gunnery); c.boarding=clamp(c.boarding);
  c.paySatisfaction=clamp(c.paySatisfaction); c.foodSatisfaction=clamp(c.foodSatisfaction); c.fatigue=clamp(c.fatigue);
  c.outstandingPrizeShare=Math.max(0,Math.round(c.outstandingPrizeShare||0));
  c.victories=Math.max(0,Math.floor(c.victories||0));
  c.casualtiesRemembered=Math.max(0,Math.floor(c.casualtiesRemembered||0));
  c.dangerousOrdersRemembered=Math.max(0,Math.floor(c.dangerousOrdersRemembered||0));
  c.recruitsHired=Math.max(0,Math.floor(c.recruitsHired||0));
  c.desertions=Math.max(0,Math.floor(c.desertions||0));
  c.historyTags??=[];
  return c;
}

export function namedCrewCount(state:GameState):number {
  return state.player.crew.filter(member=>Boolean(member.npcId)).length;
}

export function ordinaryCrewCount(state:GameState):number {
  const ship=state.ships[state.player.shipId];
  if(!ship)return 0;
  return Math.max(0,ship.systems.crew-namedCrewCount(state));
}

export function crewExperienceBand(value:number):CrewExperienceBand {
  if(value<32)return "green";
  if(value<48)return "regular";
  if(value<64)return "seasoned";
  if(value<80)return "veteran";
  return "elite";
}

export function crewMoraleLabel(value:number):string {
  if(value>=82)return "High";
  if(value>=65)return "Good";
  if(value>=48)return "Steady";
  if(value>=32)return "Uneasy";
  if(value>=18)return "Discontent";
  return "Angry";
}

export function crewLoyaltyLabel(value:number):string {
  if(value>=82)return "Devoted";
  if(value>=66)return "Loyal";
  if(value>=50)return "Committed";
  if(value>=36)return "Uncertain";
  if(value>=22)return "Restless";
  return "Ready to Leave";
}

export function crewHealthLabel(value:number):string {
  if(value>=90)return "Fit";
  if(value>=75)return "Worn";
  if(value>=55)return "Strained";
  if(value>=35)return "Suffering";
  return "Critical";
}

export function crewDisciplineLabel(value:number):string {
  if(value>=75)return "Excellent";
  if(value>=58)return "Disciplined";
  if(value>=42)return "Steady";
  if(value>=28)return "Loose";
  return "Fraying";
}


export interface CrewUnrestProfile {
  score:number;
  level:"quiet"|"grumbling"|"discontented"|"defiant";
  label:string;
  summary:string;
  reasons:string[];
}

export function crewUnrestProfile(state:GameState):CrewUnrestProfile {
  const ship=state.ships[state.player.shipId];
  if(!ship)return {score:0,level:"quiet",label:"Quiet",summary:"The company has no serious grievance pressing on it.",reasons:[]};
  const c=ensureCrewCommunity(ship);
  const welfare=ship.crewWelfare;
  const pressures:Array<{reason:string;value:number}>=[
    {reason:"morale is low",value:Math.max(0,52-ship.systems.morale)*.72},
    {reason:"loyalty is wavering",value:Math.max(0,52-c.loyalty)*.82},
    {reason:"the crew is tired of poor food",value:Math.max(0,48-c.foodSatisfaction)*.34},
    {reason:"pay and shares are causing resentment",value:Math.max(0,48-c.paySatisfaction)*.34+(c.outstandingPrizeShare>0?4:0)},
    {reason:"fatigue is wearing on the company",value:Math.max(0,c.fatigue-58)*.22},
    {reason:"dangerous orders are being remembered",value:Math.min(8,c.dangerousOrdersRemembered*.45)},
    {reason:"repeated shortages are becoming a pattern",value:Math.max(0,(welfare?.shortageEpisodes??0)-1)*1.5}
  ];
  const score=clamp(pressures.reduce((sum,row)=>sum+row.value,0),0,100);
  const active=pressures.filter(row=>row.value>=2).sort((a,b)=>b.value-a.value).slice(0,3).map(row=>row.reason);
  if(score<12)return {score,level:"quiet",label:"Quiet",summary:"The company has no serious grievance pressing on it.",reasons:active};
  if(score<25)return {score,level:"grumbling",label:"Grumbling",summary:"There is some grumbling, but discipline is holding.",reasons:active};
  if(score<40)return {score,level:"discontented",label:"Discontented",summary:"The company is openly unhappy and may lose sailors in port if conditions do not improve.",reasons:active};
  return {score,level:"defiant",label:"Defiant",summary:"The company is close to open defiance. Serious grievances need attention.",reasons:active};
}
export function crewActionModifier(state:GameState,domain:"seamanship"|"gunnery"|"boarding"):number {
  const ship=state.ships[state.player.shipId];
  if(!ship)return 0;
  const c=ensureCrewCommunity(ship);
  const domainRating=c[domain];
  const effective=domainRating*.46+c.discipline*.24+c.experience*.18+ship.systems.morale*.12-c.fatigue*.10;
  if(effective>=72)return 3;
  if(effective>=60)return 2;
  if(effective>=50)return 1;
  if(effective>=40)return 0;
  if(effective>=30)return -1;
  return -2;
}


export function effectivePlayerVoyageSeamanship(state:GameState, specialistRating:number):number {
  // The navigator/first mate still provides the specialist skill. The ordinary company contributes
  // a deliberately smaller ship-handling modifier so better-trained crews matter without replacing officers.
  return clamp(specialistRating + crewActionModifier(state,"seamanship")*3,0,100);
}

export function crewSummary(state:GameState):{morale:string;loyalty:string;experience:string;health:string;discipline:string;ordinary:number;unrest:string;unrestLevel:CrewUnrestProfile["level"]} {
  const ship=state.ships[state.player.shipId];
  if(!ship)return {morale:"—",loyalty:"—",experience:"—",health:"—",discipline:"—",ordinary:0,unrest:"—",unrestLevel:"quiet"};
  const c=ensureCrewCommunity(ship);
  const health=ship.crewWelfare?.averageHealth??100;
  const exp=crewExperienceBand(c.experience);
  const unrest=crewUnrestProfile(state);
  return {morale:crewMoraleLabel(ship.systems.morale),loyalty:crewLoyaltyLabel(c.loyalty),experience:exp[0]!.toUpperCase()+exp.slice(1),health:crewHealthLabel(health),discipline:crewDisciplineLabel(c.discipline),ordinary:ordinaryCrewCount(state),unrest:unrest.label,unrestLevel:unrest.level};
}
