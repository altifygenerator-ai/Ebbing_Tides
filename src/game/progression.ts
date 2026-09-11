import { ABILITY_BY_ID } from "../data/seed/abilities.js";
import type { AdvancementHistoryEntry, CharacterCapabilityState, GameState, ProgressionCadenceEntry, SkillId, TrainingHistoryEntry } from "./types.js";
import { refreshDerivedAttunement } from "./attunement.js";

export type ExperienceSignificance = "minor" | "meaningful" | "major" | "historic";

export type GeneralPerkContext = "weather_navigation" | "ship_escape" | "naval_gunnery" | "command_surrender" | "field_repair" | "arcane_ritual";

export interface GeneralPerkDefinition {
  id: string;
  name: string;
  description: string;
  requirements: Array<{ skillId?: SkillId; skillRating?: number; attributeId?: keyof CharacterCapabilityState["attributes"]; attributeRating?: number }>;
  playableInAlphaB?: boolean;
  context?: GeneralPerkContext;
  modifier?: number;
  effectText?: string;
}

export const GENERAL_PERKS: GeneralPerkDefinition[] = [
  { id:"perk.weather_eye", name:"Weather Eye", description:"Long experience reading sea and sky makes dangerous weather easier to anticipate and discuss with specialists.", requirements:[{skillId:"navigation",skillRating:45}], playableInAlphaB:true, context:"weather_navigation", modifier:4, effectText:"Adds practical weather judgment when laying a voyage course." },
  { id:"perk.sea_wolf", name:"Sea Wolf", description:"A life spent aboard ships has made you unusually steady during pursuit and shipboard crises.", requirements:[{skillId:"seamanship",skillRating:50}], playableInAlphaB:true, context:"ship_escape", modifier:4, effectText:"Helps when trying to break contact from a pursuing ship." },
  { id:"perk.powder_discipline", name:"Powder Discipline", description:"You understand the habits that keep guns, ammunition, and crews effective under pressure.", requirements:[{skillId:"gunnery",skillRating:45}], playableInAlphaB:true, context:"naval_gunnery", modifier:4, effectText:"Improves disciplined naval firing when you or your battery specialist can apply your doctrine." },
  { id:"perk.commanding_presence", name:"Commanding Presence", description:"Experience carrying responsibility gives your orders unusual weight when discipline and surrender are genuinely at issue.", requirements:[{skillId:"command",skillRating:40},{attributeId:"presence",attributeRating:6}], playableInAlphaB:true, context:"command_surrender", modifier:4, effectText:"Strengthens legitimate command pressure in surrender demands; it does not mind-control unwilling characters." },
  { id:"perk.scholar", name:"Scholar", description:"Sustained study has made you adept at comparing sources, retaining difficult material, and learning from written authorities.", requirements:[{skillId:"scholarship",skillRating:45},{attributeId:"intellect",attributeRating:6}], effectText:"Reserved until written study, source comparison, and institutional learning have full player-facing actions." },
  { id:"perk.field_mechanic", name:"Field Mechanic", description:"Repeated repairs outside ideal workshops have taught you how to improvise without mistaking improvisation for proper engineering.", requirements:[{skillId:"engineering",skillRating:45}], playableInAlphaB:true, context:"field_repair", modifier:4, effectText:"Helps emergency ship repair and damage-control work outside ideal workshop conditions." },
  { id:"perk.ritualist", name:"Ritualist", description:"You have enough disciplined Arcane practice to prepare and sustain demanding structured rites more reliably when their real requirements are met.", requirements:[{skillId:"arcana",skillRating:45}], playableInAlphaB:true, context:"arcane_ritual", modifier:4, effectText:"Helps demanding Arcane practices and reduces strain slightly; it never supplies missing ritual requirements." },
  { id:"perk.strong_back", name:"Strong Back", description:"Long physical work has taught you to carry awkward loads and endure sustained labor efficiently.", requirements:[{attributeId:"might",attributeRating:6},{skillId:"athletics",skillRating:35}], effectText:"Reserved until personal encumbrance and sustained-labor actions are fully exposed in the Alpha UI." }
];

const SIGNIFICANCE_XP: Record<ExperienceSignificance, number> = { minor:20, meaningful:50, major:100, historic:200 };

/**
 * A0.2B progression cadence. Repetition is a function of elapsed world time and
 * the semantic action/event key, never queue position. This keeps recurring
 * activities useful while preventing rotating-key spam at the same world hour.
 */
export const LIFE_EXPERIENCE_REPEAT_WINDOW_HOURS = 24 * 7;
export const SKILL_PRACTICE_REPEAT_WINDOW_HOURS = 24;

function pruneCadence(entries: ProgressionCadenceEntry[] | undefined, currentHour: number, windowHours: number): ProgressionCadenceEntry[] {
  const floor = currentHour - windowHours;
  return (entries ?? [])
    .map(entry => ({ key:entry.key, useHours:entry.useHours.filter(hour => Number.isFinite(hour) && hour <= currentHour && hour > floor) }))
    .filter(entry => entry.useHours.length > 0);
}

function cadenceUse(entries: ProgressionCadenceEntry[] | undefined, key: string, currentHour: number, windowHours: number, maxRememberedUses: number): { entries: ProgressionCadenceEntry[]; repeats: number } {
  const next = pruneCadence(entries, currentHour, windowHours);
  let row = next.find(entry => entry.key === key);
  if (!row) { row = { key, useHours:[] }; next.push(row); }
  const repeats = row.useHours.length;
  row.useHours.push(currentHour);
  if (row.useHours.length > maxRememberedUses) row.useHours.splice(0, row.useHours.length - maxRememberedUses);
  return { entries:next, repeats };
}

export function normalizeProgressionCadence(character: CharacterCapabilityState, currentHour: number): void {
  character.advancement.experienceCadence = pruneCadence(character.advancement.experienceCadence, currentHour, LIFE_EXPERIENCE_REPEAT_WINDOW_HOURS);
  // The old finite key queues caused the exploit and are not authoritative anymore.
  character.advancement.recentExperienceKeys = [];
  for (const practice of Object.values(character.practice)) {
    if (!practice) continue;
    practice.cadence = pruneCadence(practice.cadence, currentHour, SKILL_PRACTICE_REPEAT_WINDOW_HOURS);
    practice.recentPracticeKeys = [];
  }
}

export function experienceThresholdForLevel(level: number): number {
  const n=Math.max(0,Math.floor(level)-1);
  return Math.round(250*n + 75*n*n);
}

export function startingAdvancement(level=3): CharacterCapabilityState["advancement"] {
  const safe=Math.max(1,Math.min(12,Math.floor(level)));
  return { level:safe, lifeExperience:experienceThresholdForLevel(safe), developmentPoints:0, generalPerkPoints:0, generalPerks:[], history:[], recentExperienceKeys:[], experienceCadence:[] };
}

export function startingLevelFromAge(age:number):number {
  if(age<=22)return 2;
  if(age<=31)return 3;
  if(age<=39)return 4;
  return 5;
}

function characterFor(state:GameState,characterId:string) {
  return characterId===state.player.character.id ? state.player.character : state.npcs[characterId];
}

function pushAdvancementHistory(character: CharacterCapabilityState, entry: Omit<AdvancementHistoryEntry,"id">): void {
  character.advancement.history.push({...entry,id:`adv.${entry.kind}.${entry.atHour}.${character.advancement.history.length}`});
  if(character.advancement.history.length>120) character.advancement.history.splice(0,character.advancement.history.length-120);
}

function processLevelUps(state:GameState,characterId:string): string[] {
  const character=characterFor(state,characterId); if(!character)return[];
  const messages:string[]=[];
  while(character.advancement.lifeExperience >= experienceThresholdForLevel(character.advancement.level+1)) {
    character.advancement.level += 1;
    character.advancement.developmentPoints += 2;
    if(character.advancement.level % 3 === 0) character.advancement.generalPerkPoints += 1;
    const perkText=character.advancement.level%3===0 ? " and a General Perk opportunity" : "";
    pushAdvancementHistory(character,{kind:"level",atHour:state.absoluteHour,source:"Accumulated life experience",detail:`Reached Level ${character.advancement.level}; gained 2 Development Points${perkText}.`});
    state.worldEvents.push({id:`event.level.${characterId}.${character.advancement.level}.${state.absoluteHour}`,type:"character_level",atHour:state.absoluteHour,participants:[characterId],summary:`${"name" in character ? character.name : characterId} reached experience level ${character.advancement.level}.`,canonicalData:{characterId,level:character.advancement.level,developmentPoints:character.advancement.developmentPoints},importance:1});
    messages.push(`Level ${character.advancement.level}`);
  }
  return messages;
}

export function awardLifeExperience(state:GameState,characterId:string,key:string,source:string,significance:ExperienceSignificance|number): {gained:number;levels:string[]} {
  const character=characterFor(state,characterId); if(!character)return{gained:0,levels:[]};
  const base=typeof significance==="number"?Math.max(0,Math.round(significance)):SIGNIFICANCE_XP[significance];
  const cadence=cadenceUse(character.advancement.experienceCadence,key,state.absoluteHour,LIFE_EXPERIENCE_REPEAT_WINDOW_HOURS,2);
  character.advancement.experienceCadence=cadence.entries;
  character.advancement.recentExperienceKeys=[];
  const multiplier=cadence.repeats>=2?0:cadence.repeats===1?.35:1;
  const gained=Math.round(base*multiplier);
  if(gained<=0)return{gained:0,levels:[]};
  character.advancement.lifeExperience += gained;
  pushAdvancementHistory(character,{kind:"life_experience",atHour:state.absoluteHour,source,detail:`Gained ${gained} Life Experience.`,amount:gained});
  return {gained,levels:processLevelUps(state,characterId)};
}

function practiceThreshold(rating:number):number { return 8 + Math.floor(rating / 10) * 3; }

export function skillProgressPercent(character:CharacterCapabilityState,skillId:SkillId):number {
  const progress=character.practice[skillId]?.progress ?? 0;
  return Math.max(0,Math.min(100,(progress/practiceThreshold(character.skills[skillId]))*100));
}

export function recordMeaningfulPractice(state: GameState, characterId: string, skillId: SkillId, practiceKey: string, difficulty: number): { gained: number; newRating: number } {
  const character = characterFor(state,characterId);
  if (!character) return { gained: 0, newRating: 0 };
  const practice = character.practice[skillId] ?? { skillId, progress: 0, recentPracticeKeys: [], cadence:[] };
  character.practice[skillId] = practice;
  const cadence=cadenceUse(practice.cadence,practiceKey,state.absoluteHour,SKILL_PRACTICE_REPEAT_WINDOW_HOURS,3);
  practice.cadence=cadence.entries;
  practice.recentPracticeKeys=[];
  const challengeFactor = Math.max(0, Math.min(1.5, difficulty / Math.max(10, character.skills[skillId])));
  const damping = cadence.repeats >= 3 ? 0 : cadence.repeats === 2 ? 0.2 : cadence.repeats === 1 ? 0.55 : 1;
  const gained = Math.max(0, Math.round(challengeFactor * damping * 10) / 10);
  practice.progress += gained;
  practice.lastMeaningfulUseAtHour = state.absoluteHour;
  let rating = character.skills[skillId];
  const threshold = practiceThreshold(rating);
  if (practice.progress >= threshold && rating < 100) {
    practice.progress -= threshold;
    rating += 1;
    character.skills[skillId] = rating;
    pushAdvancementHistory(character,{kind:"skill_rank",atHour:state.absoluteHour,source:"Meaningful practice",detail:`${skillId} improved to ${rating} through use.`,skillId});
    awardLifeExperience(state,characterId,`skill-rank:${skillId}:${rating}`,`Improved ${skillId} through meaningful practice`,10);
  }
  return { gained, newRating: rating };
}

export function canFocusSkill(character:CharacterCapabilityState & {coreSkills?:SkillId[]},skillId:SkillId,currentHour:number): {ok:boolean;reason:string} {
  if(character.advancement.developmentPoints<=0)return{ok:false,reason:"No Development Points available."};
  if(character.skills[skillId]>=100)return{ok:false,reason:"This skill cannot improve further."};
  const practice=character.practice[skillId];
  const recent=practice?.lastMeaningfulUseAtHour!==undefined && currentHour-practice.lastMeaningfulUseAtHour<=720;
  const trained=character.trainingHistory.some(row=>row.subjectType==="skill" && row.subjectId===skillId);
  const formative=Boolean(character.coreSkills?.includes(skillId)) && character.skills[skillId]<25;
  if(!recent&&!trained&&!formative)return{ok:false,reason:"Focus requires recent meaningful use, relevant training, or a formative core-skill foundation."};
  return{ok:true,reason:"Eligible for focused development."};
}

export function spendDevelopmentPointOnSkill(state:GameState,skillId:SkillId):{ok:boolean;message:string} {
  const character=state.player.character;
  const eligible=canFocusSkill(character,skillId,state.absoluteHour); if(!eligible.ok)return{ok:false,message:eligible.reason};
  character.advancement.developmentPoints-=1;
  const practice=character.practice[skillId] ?? {skillId,progress:0,recentPracticeKeys:[]}; character.practice[skillId]=practice;
  const before=character.skills[skillId]; const threshold=practiceThreshold(before);
  practice.progress += Math.max(3,Math.round(threshold*.55*10)/10);
  let improved=false;
  if(practice.progress>=threshold&&before<100){practice.progress-=threshold;character.skills[skillId]=before+1;improved=true;pushAdvancementHistory(character,{kind:"skill_rank",atHour:state.absoluteHour,source:"Focused development",detail:`${skillId} improved to ${before+1} after focused development grounded in prior experience.`,skillId});}
  pushAdvancementHistory(character,{kind:"development_focus",atHour:state.absoluteHour,source:"Development Point",detail:`Focused development on ${skillId}${improved?`; skill rose to ${character.skills[skillId]}`:""}.`,amount:-1,skillId});
  return{ok:true,message:improved?`${skillId.replaceAll("_"," ")} improves to ${character.skills[skillId]}.`:`Focused work advances ${skillId.replaceAll("_"," ")} toward its next rating.`};
}

export function availableGeneralPerks(character:CharacterCapabilityState):GeneralPerkDefinition[] {
  return GENERAL_PERKS.filter(perk=>perk.playableInAlphaB && !character.advancement.generalPerks.includes(perk.id) && perk.requirements.every(req=>(req.skillId===undefined || character.skills[req.skillId]>=(req.skillRating??0)) && (req.attributeId===undefined || character.attributes[req.attributeId]>=(req.attributeRating??0))));
}


export function hasGeneralPerk(character:CharacterCapabilityState|undefined,perkId:string):boolean {
  return Boolean(character?.advancement.generalPerks.includes(perkId));
}

export function generalPerkModifier(character:CharacterCapabilityState|undefined,context:GeneralPerkContext):{value:number;sources:string[]} {
  if(!character)return{value:0,sources:[]};
  const active=GENERAL_PERKS.filter(perk=>perk.playableInAlphaB && perk.context===context && hasGeneralPerk(character,perk.id));
  return { value:active.reduce((sum,perk)=>sum+(perk.modifier??0),0), sources:active.map(perk=>perk.name) };
}

export function experienceLevelTitle(level:number):string {
  if(level<=2)return "Green Captain";
  if(level<=4)return "Seasoned Captain";
  if(level<=6)return "Experienced Captain";
  if(level<=8)return "Veteran Captain";
  if(level<=10)return "Renowned Captain";
  return "Historic Captain";
}

export function takeGeneralPerk(state:GameState,perkId:string):{ok:boolean;message:string} {
  const character=state.player.character; if(character.advancement.generalPerkPoints<=0)return{ok:false,message:"No General Perk opportunity is available."};
  const perk=availableGeneralPerks(character).find(row=>row.id===perkId); if(!perk)return{ok:false,message:"That perk is not currently available from this character's lived experience."};
  character.advancement.generalPerkPoints-=1; character.advancement.generalPerks.push(perk.id);
  pushAdvancementHistory(character,{kind:"general_perk",atHour:state.absoluteHour,source:"Overall life experience",detail:`Gained ${perk.name}.`});
  return{ok:true,message:`Gained ${perk.name}.`};
}

export function recordTraining(state: GameState, characterId: string, entry: Omit<TrainingHistoryEntry, "id">): void {
  const character = characterFor(state,characterId);
  if (!character) return;
  character.trainingHistory.push({ ...entry, id: `training.${characterId}.${entry.subjectId}.${entry.completedAtHour}` });
}

export interface LearningAcquisitionMetadata {
  startedAtHour?: number;
  costCrowns?: number;
  sourceId?: string;
}

export function learnAbilityFromSource(state: GameState, characterId: string, abilityId: string, source: string, acquisition: LearningAcquisitionMetadata = {}): {ok:boolean;message:string} {
  const character=characterFor(state,characterId); const definition=ABILITY_BY_ID[abilityId];
  if(!character||!definition)return{ok:false,message:"Unknown character or ability."};
  if(character.abilities.some(row=>row.abilityId===abilityId))return{ok:false,message:`${definition.name} is already known.`};
  if(definition.requiredSkillId && character.skills[definition.requiredSkillId] < (definition.requiredSkillRating??0))return{ok:false,message:`Training requires ${definition.requiredSkillRating??0} ${definition.requiredSkillId}.`};
  character.abilities.push({abilityId,learnedAtHour:state.absoluteHour,source,mastery:1,status:"known"});
  refreshDerivedAttunement(character);
  recordTraining(state,characterId,{subjectType:"ability",subjectId:abilityId,teacherOrSource:source,startedAtHour:acquisition.startedAtHour??state.absoluteHour,completedAtHour:state.absoluteHour,costCrowns:acquisition.costCrowns??0,result:"learned"});
  awardLifeExperience(state,characterId,`ability:${abilityId}`,`Learned ${definition.name} from ${source}`,"meaningful");
  state.worldEvents.push({id:`event.learn.${characterId}.${abilityId}.${state.absoluteHour}`,type:"character_learning",atHour:state.absoluteHour,participants:[characterId],summary:`${"name" in character ? character.name : characterId} learned ${definition.name} from ${source}.`,canonicalData:{characterId,abilityId,source,...(acquisition.sourceId?{sourceId:acquisition.sourceId}:{}),trainingStartedAtHour:acquisition.startedAtHour??state.absoluteHour,costCrowns:acquisition.costCrowns??0},importance:1});
  return{ok:true,message:`Learned ${definition.name}.`};
}

export function learnSpecializationFromSource(state:GameState,characterId:string,skillId:SkillId,name:string,source:string,rating=3,acquisition:LearningAcquisitionMetadata={}):{ok:boolean;message:string}{
 const character=characterFor(state,characterId); if(!character)return{ok:false,message:"Unknown character."}; if(character.specializations.some(row=>row.skillId===skillId&&row.name===name))return{ok:false,message:"Specialization already known."}; character.specializations.push({id:`specialization.${characterId}.${skillId}.${name.toLowerCase().replaceAll(" ","_")}`,skillId,name,rating,source,learnedAtHour:state.absoluteHour}); refreshDerivedAttunement(character); recordTraining(state,characterId,{subjectType:"specialization",subjectId:`${skillId}:${name}`,teacherOrSource:source,startedAtHour:acquisition.startedAtHour??state.absoluteHour,completedAtHour:state.absoluteHour,costCrowns:acquisition.costCrowns??0,result:"learned"}); awardLifeExperience(state,characterId,`specialization:${skillId}:${name}`,`Learned ${name} specialization from ${source}`,"meaningful"); state.worldEvents.push({id:`event.learn.${characterId}.${skillId}.${name.toLowerCase().replaceAll(" ","_")}.${state.absoluteHour}`,type:"character_learning",atHour:state.absoluteHour,participants:[characterId],summary:`${"name" in character ? character.name : characterId} learned ${name} (${skillId}) from ${source}.`,canonicalData:{characterId,skillId,specialization:name,source,...(acquisition.sourceId?{sourceId:acquisition.sourceId}:{}),trainingStartedAtHour:acquisition.startedAtHour??state.absoluteHour,costCrowns:acquisition.costCrowns??0},importance:1}); return{ok:true,message:`Learned ${name} specialization.`};
}
