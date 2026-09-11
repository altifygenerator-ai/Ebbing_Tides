import { ABILITY_BY_ID } from "../data/seed/abilities.js";
import { PORTRAIT_BY_ID } from "../data/seed/portraits.js";
import { originSettlementName } from "../data/seed/origins.js";
import { PORT_BY_ID } from "../data/seed/ports.js";
import { ALL_SKILLS, buildStartingSkills, buildStartingSpecializations } from "./skills.js";
import { startingAdvancement, startingLevelFromAge } from "./progression.js";
import { refreshDerivedAttunement } from "./attunement.js";
function startingAbilities(choices) {
    const ids = [];
    if (choices.coreSkills.includes("arcana") || choices.background === "temple_educated" || choices.recentProfession === "scholar" || choices.recentProfession === "priest") {
        ids.push("arcane.wind_weather.read_wind", "arcane.sight_divination.sense_resonance");
    }
    if (choices.recentProfession === "apprentice_engineer" || choices.background === "foundry_child" || choices.background === "engineers_apprentice")
        ids.push("tech.naval_engineering.emergency_hull_shoring");
    if (choices.recentProfession === "navigator")
        ids.push("tech.instruments.calibrated_sextant_method");
    if (choices.recentProfession === "gunner" || choices.background === "former_naval_midshipman")
        ids.push("tech.precision_weapons.precision_bore_sighting");
    return ids.filter((id) => ABILITY_BY_ID[id]).map((abilityId) => ({ abilityId, learnedAtHour: 0, source: "Character history", mastery: 1, status: "known" }));
}
function startingSchematics(choices) {
    const rows = [];
    if (choices.recentProfession === "apprentice_engineer" || choices.background === "engineers_apprentice")
        rows.push({ schematicId: "schematic.naval.pump_bypass_basic", learnedAtHour: 0, source: "Apprenticeship", access: "known" });
    return rows;
}
function startingKnowledge(choices) {
    const rows = [
        { id: `knowledge.home.${choices.homeSettlementId}`, domain: "geographic", subjectId: choices.homeSettlementId, claim: `${originSettlementName(choices.homeSettlementId)} is your home settlement; its ordinary districts, customs, and approaches are familiar.`, source: "Homeland", confidence: 100, learnedAtHour: 0, status: "fact" },
        { id: `knowledge.culture.${choices.culture}`, domain: "social", claim: `Ordinary ${choices.culture} social norms and everyday material culture are familiar.`, source: "Culture", confidence: 95, learnedAtHour: 0, status: "fact" }
    ];
    if (choices.startingLocationId !== choices.homeSettlementId) {
        const startName = PORT_BY_ID[choices.startingLocationId]?.name ?? choices.startingLocationId;
        rows.push({ id: `knowledge.start.${choices.startingLocationId}`, domain: "geographic", subjectId: choices.startingLocationId, claim: `You begin the campaign at ${startName} and know the immediate harbor routines needed to operate there.`, source: "Current circumstances", confidence: 85, learnedAtHour: 0, status: "fact" });
    }
    if (choices.religion !== "unaffiliated")
        rows.push({ id: `knowledge.religion.${choices.religion}`, domain: "religious", claim: "Knows the ordinary rites, institutions, and taboos of their own faith as practiced in their community.", source: "Religious upbringing", confidence: 95, learnedAtHour: 0, status: "fact" });
    return rows;
}
export function visualDnaFromChoices(choices) {
    const portrait = PORTRAIT_BY_ID[choices.portraitId];
    if (portrait) {
        const dna = structuredClone(portrait.visualDna);
        dna.sex = choices.sex;
        dna.ancestryPrimary = choices.ancestry === "mixed" ? "skeldran" : choices.ancestry;
        if (choices.ancestry === "mixed" && choices.secondaryAncestry)
            dna.ancestrySecondary = choices.secondaryAncestry;
        dna.apparentAge = choices.age;
        dna.birthYear = 628 - choices.age;
        dna.clothingCulture = choices.culture;
        dna.occupationPresentation = choices.recentProfession;
        dna.religionPresentation = choices.religion;
        return dna;
    }
    if (choices.customPortrait?.enabled) {
        const request = choices.customPortrait;
        return {
            sex: request.sex,
            ancestryPrimary: request.ancestryPrimary,
            ...(request.ancestrySecondary ? { ancestrySecondary: request.ancestrySecondary } : {}),
            birthYear: 628 - choices.age,
            apparentAge: choices.age,
            skinTone: request.complexion,
            faceFamily: `${request.ancestryPrimary}.${request.faceCharacter}`,
            eyeColor: request.eyeColor,
            hairColor: request.hairColor,
            hairTexture: "player_defined",
            hairStyle: request.hairStyle,
            facialHair: request.facialHair,
            build: request.build,
            permanentMarks: [...request.marks],
            clothingCulture: request.culture ?? choices.culture,
            occupationPresentation: request.profession ?? choices.recentProfession,
            rankPresentation: "starting",
            wealthPresentation: request.socialOrigin ?? choices.socialOrigin,
            religionPresentation: request.religion ?? choices.religion,
            visibleSymbols: [],
            industrialAffinity: "ordinary",
            arcaneAffinity: "ordinary",
            prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [],
            appearanceSeed: choices.portraitId
        };
    }
    return {
        sex: choices.sex,
        ancestryPrimary: choices.ancestry === "mixed" ? "skeldran" : choices.ancestry,
        ...(choices.ancestry === "mixed" && choices.secondaryAncestry ? { ancestrySecondary: choices.secondaryAncestry } : {}),
        birthYear: 628 - choices.age,
        apparentAge: choices.age,
        skinTone: "pending_portrait_selection",
        faceFamily: `${choices.ancestry}.pending`,
        eyeColor: "pending",
        hairColor: "pending",
        hairTexture: "pending",
        hairStyle: "pending",
        facialHair: "pending",
        build: "pending",
        permanentMarks: [],
        clothingCulture: choices.culture,
        occupationPresentation: choices.recentProfession,
        rankPresentation: "starting",
        wealthPresentation: choices.socialOrigin,
        religionPresentation: choices.religion,
        visibleSymbols: [],
        industrialAffinity: "ordinary",
        arcaneAffinity: "ordinary",
        prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [],
        appearanceSeed: `pending.${choices.sex}.${choices.ancestry}.${choices.age}`
    };
}
export function buildCapabilityState(choices) {
    const capability = {
        attributes: structuredClone(choices.attributes),
        skills: buildStartingSkills(choices),
        specializations: buildStartingSpecializations(choices),
        abilities: startingAbilities(choices),
        preparedEffects: [],
        schematics: startingSchematics(choices),
        // startingAttunement remains in the compatibility/save shape but no longer assigns the state.
        attunement: { value: 0, arcaneStrain: 0, arcaneExposure: 0, industrialExposure: 0 },
        condition: { health: 100, healthMax: 100, fatigue: 0, stress: 0, pain: 0, arcaneStrain: 0 },
        advancement: startingAdvancement(startingLevelFromAge(choices.age)),
        trainingHistory: [],
        practice: Object.fromEntries(ALL_SKILLS.map((skillId) => [skillId, { skillId, progress: 0, recentPracticeKeys: [], cadence: [] }])),
        knowledgeEntries: startingKnowledge(choices)
    };
    refreshDerivedAttunement(capability);
    return capability;
}
//# sourceMappingURL=characterSystem.js.map