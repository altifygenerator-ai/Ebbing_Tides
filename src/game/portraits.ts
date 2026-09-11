import { PORTRAIT_CHOICES } from "../data/seed/portraits.js";
import type { AncestryId, BackgroundId, CultureId, PortraitChoice, ProfessionId, RegionId, ReligionId, SexId } from "./types.js";

export interface PortraitMatchContext {
  ancestry: AncestryId;
  sex: SexId;
  age: number;
  homelandRegion: RegionId;
  culture: CultureId;
  religion: ReligionId;
  background: BackgroundId;
  profession: ProfessionId;
}

export interface RankedPortraitChoice {
  portrait: PortraitChoice;
  score: number;
  ancestryMatch: boolean;
  reasons: string[];
}

export const PORTRAIT_MATCH_WEIGHTS = {
  ancestry: 100,
  sex: 100,
  ageBand: 40,
  culture: 30,
  homeland: 20,
  profession: 20,
  religion: 15,
  background: 10
} as const;

export function ageBandForAge(age: number): PortraitChoice["ageBand"] {
  if (age <= 23) return "young_adult";
  if (age >= 38) return "mature";
  return "adult";
}

function eligible(portrait: PortraitChoice): boolean {
  return portrait.status === "APPROVED" || portrait.status === "PROVISIONAL";
}

export function scorePortraitChoice(portrait: PortraitChoice, context: PortraitMatchContext): RankedPortraitChoice | undefined {
  // Sex is the only hard identity match in the current curated pool. Everything else ranks rather than excludes.
  if (!eligible(portrait) || portrait.sex !== context.sex) return undefined;
  let score = PORTRAIT_MATCH_WEIGHTS.sex;
  const reasons = ["sex"];
  const ancestryMatch = portrait.ancestryTags.includes(context.ancestry);
  if (ancestryMatch) { score += PORTRAIT_MATCH_WEIGHTS.ancestry; reasons.push("ancestry"); }
  if (portrait.ageBand === ageBandForAge(context.age)) { score += PORTRAIT_MATCH_WEIGHTS.ageBand; reasons.push("age_band"); }
  if (portrait.cultureTags.includes(context.culture)) { score += PORTRAIT_MATCH_WEIGHTS.culture; reasons.push("culture"); }
  if (portrait.homelandRegionTags?.includes(context.homelandRegion)) { score += PORTRAIT_MATCH_WEIGHTS.homeland; reasons.push("homeland"); }
  if (portrait.professionTags.includes(context.profession)) { score += PORTRAIT_MATCH_WEIGHTS.profession; reasons.push("profession"); }
  if (portrait.religionTags.includes(context.religion)) { score += PORTRAIT_MATCH_WEIGHTS.religion; reasons.push("religion"); }
  if (portrait.backgroundTags?.includes(context.background)) { score += PORTRAIT_MATCH_WEIGHTS.background; reasons.push("background"); }
  return { portrait, score, ancestryMatch, reasons };
}

export function rankCuratedPortraits(context: PortraitMatchContext, pool: PortraitChoice[] = PORTRAIT_CHOICES): RankedPortraitChoice[] {
  return pool
    .map((portrait)=>scorePortraitChoice(portrait,context))
    .filter((row): row is RankedPortraitChoice => Boolean(row))
    .sort((a,b)=> b.score-a.score || a.portrait.portraitId.localeCompare(b.portrait.portraitId));
}
