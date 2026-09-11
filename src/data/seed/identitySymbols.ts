import type { AncestryId, CultureId, RegionId, ReligionId } from "../../game/types.js";

/**
 * Ebbing Tides MAIN identity-symbol system.
 *
 * Cleanup authority: Ebbing_Tides_Main_Identity_Symbols_Approved_Reference.zip
 *
 * The recurring UI identity language is intentionally limited to four channels:
 * Ancestry, Religion, Homeland, and Affiliation. Older runes, civic seals,
 * naval rank marks, named-ship marks, and other specialist symbols are not
 * fallback identity marks and must not leak back into ordinary UI identity.
 */
export type IdentityChannel = "ancestry" | "religion" | "homeland" | "affiliation";

export interface IdentitySymbolContext {
  ancestry: AncestryId;
  culture: CultureId;
  homelandRegion: RegionId;
  religion: ReligionId;
  /** Explicit canonical affiliation only. Absence means unaffiliated. */
  affiliationId?: string;
}

export interface IdentityMarkDefinition {
  id: string;
  label: string;
  path: string;
  sourceReference: string;
  kind: IdentityChannel;
}

export interface IdentityPresentation {
  ancestryMark?: IdentityMarkDefinition;
  religionMark?: IdentityMarkDefinition;
  homelandMark?: IdentityMarkDefinition;
  affiliationMark?: IdentityMarkDefinition;
  ancestryAccent: string;
  bannerColor: string;
  accentColor: string;
}

const runtime = (name: string) => `/art/ui/symbols/runtime/${name}.png`;
const source = (name: string) => name;

export const IDENTITY_MARKS = {
  ancestrySkeldran: { id:"ancestry.skeldran", label:"Skeldran ancestry", path:runtime("identity_ancestry_skeldran"), sourceReference:source("01_Ancestry/Ancestry_01_Skeldran__EXACT_CROP.png"), kind:"ancestry" },
  ancestryAsterian: { id:"ancestry.asterian", label:"Asterian ancestry", path:runtime("identity_ancestry_asterian"), sourceReference:source("01_Ancestry/Ancestry_02_Asterian__EXACT_CROP.png"), kind:"ancestry" },
  ancestrySerathi: { id:"ancestry.serathi", label:"Serathi ancestry", path:runtime("identity_ancestry_serathi"), sourceReference:source("01_Ancestry/Ancestry_03_Serathi__EXACT_CROP.png"), kind:"ancestry" },
  ancestryKaishin: { id:"ancestry.kaishin", label:"Kaishin ancestry", path:runtime("identity_ancestry_kaishin"), sourceReference:source("01_Ancestry/Ancestry_04_Kaishin__EXACT_CROP.png"), kind:"ancestry" },
  ancestryVesperan: { id:"ancestry.vesperan", label:"Vesperan ancestry", path:runtime("identity_ancestry_vesperan"), sourceReference:source("01_Ancestry/Ancestry_05_Vesperan__EXACT_CROP.png"), kind:"ancestry" },
  ancestryOuterIsles: { id:"ancestry.outer_isles", label:"Outer Isles ancestry", path:runtime("identity_ancestry_outer_isles"), sourceReference:source("01_Ancestry/Ancestry_06_Outer_Isles__EXACT_CROP.png"), kind:"ancestry" },

  religionOldGods: { id:"religion.old_gods", label:"Old Gods", path:runtime("identity_religion_old_gods"), sourceReference:source("02_Religion/Religion_01_Old_Gods__EXACT_CROP.png"), kind:"religion" },
  religionPantheon: { id:"religion.pantheon", label:"Pantheon", path:runtime("identity_religion_pantheon"), sourceReference:source("02_Religion/Religion_02_Pantheon__EXACT_CROP.png"), kind:"religion" },
  religionCovenant: { id:"religion.covenant", label:"Covenant", path:runtime("identity_religion_covenant"), sourceReference:source("02_Religion/Religion_03_Covenant__EXACT_CROP.png"), kind:"religion" },
  religionTurningWheel: { id:"religion.turning_wheel", label:"Turning Wheel", path:runtime("identity_religion_turning_wheel"), sourceReference:source("02_Religion/Religion_04_Turning_Wheel__EXACT_CROP.png"), kind:"religion" },

  homelandSkeldra: { id:"homeland.skeldra", label:"Skeldra", path:runtime("identity_homeland_skeldra"), sourceReference:source("03_Homeland/Homeland_01_Skeldra__EXACT_CROP.png"), kind:"homeland" },
  homelandAsteria: { id:"homeland.asteria", label:"Asteria", path:runtime("identity_homeland_asteria"), sourceReference:source("03_Homeland/Homeland_02_Asteria__EXACT_CROP.png"), kind:"homeland" },
  homelandSerath: { id:"homeland.serath", label:"Serath", path:runtime("identity_homeland_serath"), sourceReference:source("03_Homeland/Homeland_03_Serath__EXACT_CROP.png"), kind:"homeland" },
  homelandKaishin: { id:"homeland.kaishin", label:"Kaishin", path:runtime("identity_homeland_kaishin"), sourceReference:source("03_Homeland/Homeland_04_Kaishin__EXACT_CROP.png"), kind:"homeland" },
  homelandVespera: { id:"homeland.vespera", label:"Vespera", path:runtime("identity_homeland_vespera"), sourceReference:source("03_Homeland/Homeland_05_Vespera__EXACT_CROP.png"), kind:"homeland" },
  homelandOuterIsles: { id:"homeland.outer_isles", label:"Outer Isles", path:runtime("identity_homeland_outer_isles"), sourceReference:source("03_Homeland/Homeland_06_Outer_Isles__EXACT_CROP.png"), kind:"homeland" },

  affiliationHouseVaering: { id:"affiliation.house_vaering", label:"House Vaering", path:runtime("identity_affiliation_house_vaering"), sourceReference:source("04_Affiliation/Affiliation_01_House_Vaering__EXACT_CROP.png"), kind:"affiliation" },
  affiliationSkeldranRoyalNavy: { id:"affiliation.skeldran_royal_navy", label:"Skeldran Royal Navy", path:runtime("identity_affiliation_skeldran_royal_navy"), sourceReference:source("04_Affiliation/Affiliation_02_Skeldran_Royal_Navy__EXACT_CROP.png"), kind:"affiliation" },
  affiliationMerchantGuild: { id:"affiliation.merchant_guild", label:"Merchant Guild", path:runtime("identity_affiliation_merchant_guild"), sourceReference:source("04_Affiliation/Affiliation_03_Merchant_Guild__EXACT_CROP.png"), kind:"affiliation" },
  affiliationMarineOrder: { id:"affiliation.marine_order", label:"Marine Order", path:runtime("identity_affiliation_marine_order"), sourceReference:source("04_Affiliation/Affiliation_04_Marine_Order__EXACT_CROP.png"), kind:"affiliation" },
  affiliationHarborAuthority: { id:"affiliation.harbor_authority", label:"Harbor Authority", path:runtime("identity_affiliation_harbor_authority"), sourceReference:source("04_Affiliation/Affiliation_05_Harbor_Authority__EXACT_CROP.png"), kind:"affiliation" },
  affiliationFreeCaptains: { id:"affiliation.free_captains", label:"Free Captains", path:runtime("identity_affiliation_free_captains"), sourceReference:source("04_Affiliation/Affiliation_06_Free_Captains__EXACT_CROP.png"), kind:"affiliation" }
} as const satisfies Record<string, IdentityMarkDefinition>;

const ANCESTRY_MARK: Partial<Record<AncestryId, IdentityMarkDefinition>> = {
  skeldran: IDENTITY_MARKS.ancestrySkeldran,
  asterian: IDENTITY_MARKS.ancestryAsterian,
  serathi: IDENTITY_MARKS.ancestrySerathi,
  kaishin: IDENTITY_MARKS.ancestryKaishin
};

const CULTURE_ANCESTRY_FALLBACK: Partial<Record<CultureId, IdentityMarkDefinition>> = {
  vesperan: IDENTITY_MARKS.ancestryVesperan,
  outer_isles: IDENTITY_MARKS.ancestryOuterIsles
};

const RELIGION_MARK: Partial<Record<ReligionId, IdentityMarkDefinition>> = {
  old_gods: IDENTITY_MARKS.religionOldGods,
  pantheon: IDENTITY_MARKS.religionPantheon,
  covenant: IDENTITY_MARKS.religionCovenant,
  turning_wheel: IDENTITY_MARKS.religionTurningWheel
  // unaffiliated intentionally has no symbol.
};

const HOMELAND_MARK: Record<RegionId, IdentityMarkDefinition> = {
  skeldra: IDENTITY_MARKS.homelandSkeldra,
  asteria: IDENTITY_MARKS.homelandAsteria,
  serath: IDENTITY_MARKS.homelandSerath,
  kaishin: IDENTITY_MARKS.homelandKaishin,
  crossroads: IDENTITY_MARKS.homelandVespera,
  outer_isles: IDENTITY_MARKS.homelandOuterIsles
};

const AFFILIATION_MARKS: Record<string, IdentityMarkDefinition> = {
  "house.vaering": IDENTITY_MARKS.affiliationHouseVaering,
  "house_vaering": IDENTITY_MARKS.affiliationHouseVaering,
  "skeldran_royal_navy": IDENTITY_MARKS.affiliationSkeldranRoyalNavy,
  "faction.skeldran_royal_navy": IDENTITY_MARKS.affiliationSkeldranRoyalNavy,
  "merchant_guild": IDENTITY_MARKS.affiliationMerchantGuild,
  "faction.merchant_guild": IDENTITY_MARKS.affiliationMerchantGuild,
  "marine_order": IDENTITY_MARKS.affiliationMarineOrder,
  "faction.marine_order": IDENTITY_MARKS.affiliationMarineOrder,
  "harbor_authority": IDENTITY_MARKS.affiliationHarborAuthority,
  "faction.harbor_authority": IDENTITY_MARKS.affiliationHarborAuthority,
  "free_captains": IDENTITY_MARKS.affiliationFreeCaptains,
  "faction.free_captains": IDENTITY_MARKS.affiliationFreeCaptains
};

const ANCESTRY_ACCENT: Record<AncestryId, string> = {
  skeldran: "#738695",
  asterian: "#9a7d52",
  serathi: "#8d7659",
  kaishin: "#728074",
  mixed: "#817977"
};

const REGION_COLOR: Record<RegionId, { banner: string; accent: string }> = {
  skeldra: { banner: "#203747", accent: "#7f95a4" },
  asteria: { banner: "#26394a", accent: "#b08c4c" },
  serath: { banner: "#37332f", accent: "#9a805c" },
  kaishin: { banner: "#303a34", accent: "#7f8b75" },
  crossroads: { banner: "#253843", accent: "#7892a0" },
  outer_isles: { banner: "#29383a", accent: "#7b918d" }
};

export function ancestryMarkForContext(context: Pick<IdentitySymbolContext,"ancestry"|"culture">): IdentityMarkDefinition | undefined {
  return ANCESTRY_MARK[context.ancestry] ?? (context.ancestry === "mixed" ? CULTURE_ANCESTRY_FALLBACK[context.culture] : undefined);
}

export function religionMarkForId(religion: ReligionId): IdentityMarkDefinition | undefined {
  return RELIGION_MARK[religion];
}

export function homelandMarkForRegion(region: RegionId): IdentityMarkDefinition {
  return HOMELAND_MARK[region];
}

export function affiliationMarkForId(affiliationId?: string): IdentityMarkDefinition | undefined {
  return affiliationId ? AFFILIATION_MARKS[affiliationId] : undefined;
}

/**
 * Only explicit role language may resolve a current NPC affiliation. Profession,
 * homeland, religion, merchant/privateer/pirate status, or ship disposition alone
 * never manufactures affiliation.
 */
export function affiliationMarkForCharacter(input: { profession?: string; role?: string; affiliationId?: string }): IdentityMarkDefinition | undefined {
  const explicit = affiliationMarkForId(input.affiliationId);
  if (explicit) return explicit;
  const role = (input.role ?? "").toLowerCase();
  if (/\bhouse vaering\b/.test(role)) return IDENTITY_MARKS.affiliationHouseVaering;
  if (/\bskeldran royal navy\b|\broyal navy\b/.test(role)) return IDENTITY_MARKS.affiliationSkeldranRoyalNavy;
  if (/\bmerchant guild\b/.test(role)) return IDENTITY_MARKS.affiliationMerchantGuild;
  if (/\bmarine order\b/.test(role)) return IDENTITY_MARKS.affiliationMarineOrder;
  if (/\bharbou?r authority\b/.test(role)) return IDENTITY_MARKS.affiliationHarborAuthority;
  if (/\bfree captains?\b/.test(role)) return IDENTITY_MARKS.affiliationFreeCaptains;
  return undefined;
}

export function resolveIdentityPresentation(context: IdentitySymbolContext): IdentityPresentation {
  const colors = REGION_COLOR[context.homelandRegion];
  const result: IdentityPresentation = {
    homelandMark: homelandMarkForRegion(context.homelandRegion),
    ancestryAccent: ANCESTRY_ACCENT[context.ancestry],
    bannerColor: colors.banner,
    accentColor: colors.accent
  };
  const ancestryMark = ancestryMarkForContext(context);
  if (ancestryMark) result.ancestryMark = ancestryMark;
  const religionMark = religionMarkForId(context.religion);
  if (religionMark) result.religionMark = religionMark;
  const affiliationMark = affiliationMarkForId(context.affiliationId);
  if (affiliationMark) result.affiliationMark = affiliationMark;
  return result;
}

/** General identity surfaces prefer actual affiliation, otherwise homeland. */
export function primaryIdentityMark(presentation: IdentityPresentation): IdentityMarkDefinition {
  return presentation.affiliationMark ?? presentation.homelandMark!;
}

/** Government context uses a main affiliation only when explicit; otherwise homeland. */
export function governmentIdentityMarksForPort(portId: string, region: RegionId): IdentityMarkDefinition[] {
  if (portId === "port.veyrholm") return [IDENTITY_MARKS.affiliationHouseVaering];
  return [homelandMarkForRegion(region)];
}

/** Current-alpha religious landscape expressed only through the approved main faith marks. */
export function religionIdentityMarksForPort(portId: string): IdentityMarkDefinition[] {
  if (portId === "port.veyrholm" || portId === "port.ironhaven") return [IDENTITY_MARKS.religionOldGods, IDENTITY_MARKS.religionCovenant];
  if (portId === "port.stormvik" || portId === "port.thorenfjord") return [IDENTITY_MARKS.religionOldGods];
  return [];
}

/**
 * Ships use an explicit owner affiliation when known; otherwise the owner's
 * homeland mark. Named-ship marks and rank/service glyphs are not general UI identifiers.
 */
export function shipIdentityMarkForContext(input: {
  ownerPresentation?: IdentityPresentation;
  ownerProfession?: string;
  ownerRole?: string;
  explicitAffiliationId?: string;
  fallbackRegion: RegionId;
}): IdentityMarkDefinition {
  const affiliation = affiliationMarkForCharacter({
    ...(input.ownerProfession ? { profession: input.ownerProfession } : {}),
    ...(input.ownerRole ? { role: input.ownerRole } : {}),
    ...(input.explicitAffiliationId ? { affiliationId: input.explicitAffiliationId } : {})
  });
  if (affiliation) return affiliation;
  return input.ownerPresentation?.homelandMark ?? homelandMarkForRegion(input.fallbackRegion);
}
