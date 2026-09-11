import { PORTRAIT_CHOICES } from "../data/seed/portraits.js";
export const PORTRAIT_MATCH_WEIGHTS = {
    ancestry: 100,
    sex: 100,
    ageBand: 40,
    culture: 30,
    homeland: 20,
    profession: 20,
    religion: 15,
    background: 10
};
export function ageBandForAge(age) {
    if (age <= 23)
        return "young_adult";
    if (age >= 38)
        return "mature";
    return "adult";
}
function eligible(portrait) {
    return portrait.status === "APPROVED" || portrait.status === "PROVISIONAL";
}
export function scorePortraitChoice(portrait, context) {
    // Sex is the only hard identity match in the current curated pool. Everything else ranks rather than excludes.
    if (!eligible(portrait) || portrait.sex !== context.sex)
        return undefined;
    let score = PORTRAIT_MATCH_WEIGHTS.sex;
    const reasons = ["sex"];
    const ancestryMatch = portrait.ancestryTags.includes(context.ancestry);
    if (ancestryMatch) {
        score += PORTRAIT_MATCH_WEIGHTS.ancestry;
        reasons.push("ancestry");
    }
    if (portrait.ageBand === ageBandForAge(context.age)) {
        score += PORTRAIT_MATCH_WEIGHTS.ageBand;
        reasons.push("age_band");
    }
    if (portrait.cultureTags.includes(context.culture)) {
        score += PORTRAIT_MATCH_WEIGHTS.culture;
        reasons.push("culture");
    }
    if (portrait.homelandRegionTags?.includes(context.homelandRegion)) {
        score += PORTRAIT_MATCH_WEIGHTS.homeland;
        reasons.push("homeland");
    }
    if (portrait.professionTags.includes(context.profession)) {
        score += PORTRAIT_MATCH_WEIGHTS.profession;
        reasons.push("profession");
    }
    if (portrait.religionTags.includes(context.religion)) {
        score += PORTRAIT_MATCH_WEIGHTS.religion;
        reasons.push("religion");
    }
    if (portrait.backgroundTags?.includes(context.background)) {
        score += PORTRAIT_MATCH_WEIGHTS.background;
        reasons.push("background");
    }
    return { portrait, score, ancestryMatch, reasons };
}
export function rankCuratedPortraits(context, pool = PORTRAIT_CHOICES) {
    return pool
        .map((portrait) => scorePortraitChoice(portrait, context))
        .filter((row) => Boolean(row))
        .sort((a, b) => b.score - a.score || a.portrait.portraitId.localeCompare(b.portrait.portraitId));
}
//# sourceMappingURL=portraits.js.map