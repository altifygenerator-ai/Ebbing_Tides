import type { HistoricalDatabaseSeed, HistoricalDate } from "../../types/history.js";

const UNKNOWN: HistoricalDate = { precision: "unknown" };
const YEAR = (year: number): HistoricalDate => ({ precision: "year", year });
const APPROX = (year: number): HistoricalDate => ({ precision: "approximate", year });

/**
 * Alpha 0.6B authored political/genealogical population.
 *
 * Scope is deliberately limited to the politically relevant Day-1 lineage backbone and the
 * office/claim structures that later simulation needs. Ellipses in the lore remain ellipses here:
 * missing generations, unknown accession dates, unnamed spouses, and uncertain precedence are
 * not fabricated merely to make a family tree look complete.
 */
export const HISTORICAL_DYNASTIES_06B_SEED: HistoricalDatabaseSeed = {
  characters: [
    // --- Skeldra / House Vaering ---
    {
      id: "character.vaer_the_red", name: "Vaer the Red", sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "unknown",
      birthDate: APPROX(225), deathDate: APPROX(279), socialStatus: "ancestral_founder", houseId: "house.vaering",
      notes: "Claimed ancestral founder of House Vaering; earliest links are partly genealogical tradition rather than courtroom-proof documentation.",
      origin: "authored", canonicalStatus: "traditional", lifecycle: "historical_only"
    },
    {
      id: "character.eirik_ii_vaering", name: "Eirik II Vaering", sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "unknown",
      birthDate: YEAR(497), deathDate: YEAR(558), socialStatus: "royal", houseId: "house.vaering",
      notes: "Documented royal Vaering line preceding Eirik III.", origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.queen_runa", name: "Queen Runa", sex: "female", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "unknown",
      birthDate: YEAR(503), deathDate: YEAR(566), socialStatus: "queen", houseId: "house.vaering",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.queen_sigrid", name: "Queen Sigrid", sex: "female", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "unknown",
      birthDate: YEAR(537), deathDate: YEAR(598), socialStatus: "queen", houseId: "house.vaering",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.queen_astrid", name: "Queen Astrid Vaering", sex: "female", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods",
      birthDate: YEAR(570), deathDate: UNKNOWN, socialStatus: "queen", houseId: "house.vaering",
      notes: "Queen of Skeldra in 628 CR; conservative, deeply religious, and protective of the royal family.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.hakon_vaering", name: "Hakon Vaering", sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "unknown",
      birthDate: YEAR(568), deathDate: YEAR(622), socialStatus: "prince", houseId: "house.vaering",
      notes: "Younger royal brother of Eirik IV; father of the politically relevant collateral branch.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.liv_ormsen", name: "Liv Ormsen", sex: "female", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "unknown",
      birthDate: YEAR(573), deathDate: UNKNOWN, socialStatus: "royal_spouse",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.sten_vaering", name: "Sten Vaering", sex: "male", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods",
      birthDate: YEAR(598), deathDate: UNKNOWN, socialStatus: "royal_collateral", houseId: "house.vaering",
      notes: "Collateral claimant if the direct Vaering line fractures.", origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.yrsa_vaering", name: "Yrsa Vaering", sex: "female", ancestry: "skeldran", homelandRegion: "skeldra", culture: "skeldran", religion: "old_gods",
      birthDate: YEAR(603), deathDate: UNKNOWN, socialStatus: "royal_collateral", houseId: "house.vaering",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },

    // --- Asterra / House Marcellan (republican oligarchic house, not a crown) ---
    {
      id: "character.aeson_marcellan", name: "Aeson Marcellan", sex: "male", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "unknown",
      birthDate: APPROX(304), deathDate: APPROX(368), socialStatus: "statesman", houseId: "house.marcellan",
      notes: "League-era ancestor and political myth of the Marcellan family; not evidence of a hereditary republican office.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.decian_marcellan", name: "Decian Marcellan", sex: "male", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "unknown",
      birthDate: YEAR(538), deathDate: YEAR(604), socialStatus: "senator_naval_financier", houseId: "house.marcellan",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.lysandra_coris", name: "Lysandra Coris", sex: "female", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "unknown",
      birthDate: YEAR(543), deathDate: YEAR(610), socialStatus: "patrician",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.cassian_marcellan", name: "Cassian Marcellan", sex: "male", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "pantheon",
      birthDate: YEAR(571), deathDate: UNKNOWN, socialStatus: "first_archon", houseId: "house.marcellan",
      notes: "First Archon in 628 CR; powerful oligarch inside a republic, not a hereditary monarch.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.thalia_varen", name: "Thalia Varen", sex: "female", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "unknown",
      birthDate: YEAR(574), deathDate: YEAR(618), socialStatus: "archon_spouse",
      notes: "Late wife of Cassian Marcellan and sister of merchant prince Nikos Varen.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.helena_marcellan", name: "Helena Marcellan", sex: "female", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "pantheon",
      birthDate: YEAR(599), deathDate: UNKNOWN, socialStatus: "patrician", houseId: "house.marcellan",
      notes: "Marcellan daughter; politically ambitious and reform-minded, but possesses no hereditary right to the First Archonship.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.marcus_marcellan", name: "Marcus Marcellan", sex: "male", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "pantheon",
      birthDate: YEAR(603), deathDate: UNKNOWN, socialStatus: "patrician", houseId: "house.marcellan",
      notes: "Marcellan son; militaristic Pantheon traditionalist, without hereditary entitlement to republican office.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.lydia_marcellan", name: "Lydia Marcellan", sex: "female", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "unknown",
      birthDate: YEAR(575), deathDate: UNKNOWN, socialStatus: "patrician", houseId: "house.marcellan",
      notes: "Married into a lesser civic house; spouse remains unnamed in current canon.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.nikos_varen", name: "Nikos Varen", sex: "male", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "pantheon",
      birthDate: YEAR(577), deathDate: UNKNOWN, socialStatus: "merchant_prince",
      notes: "Brother of the late Thalia Varen; his trade network gives merchant capital a direct family route into Cassian Marcellan's household.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },

    // --- Aurelia / House Valerian ---
    {
      id: "character.solvar_valerian_i", name: "Solvar Valerian I", sex: "male", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "unknown",
      birthDate: APPROX(34), deathDate: APPROX(102), socialStatus: "imperial_ancestor", houseId: "house.valerian",
      notes: "Celebrated early imperial ancestor; later Valerian genealogy contains multiple imperial and cadet branches.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.lucan_vi_valerian", name: "Lucan VI Valerian", sex: "male", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "unknown",
      birthDate: YEAR(526), deathDate: YEAR(584), socialStatus: "imperial", houseId: "house.valerian",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.aurelia_cassene", name: "Aurelia Cassene", sex: "female", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "unknown",
      birthDate: YEAR(532), deathDate: YEAR(590), socialStatus: "imperial_spouse",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.lucan_vii_valerian", name: "Lucan VII Valerian", sex: "male", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "pantheon",
      birthDate: YEAR(560), deathDate: UNKNOWN, socialStatus: "imperator", houseId: "house.valerian",
      notes: "Imperator of Aurelia in 628 CR; advocates imperial restoration.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.marcella_valerian", name: "Empress Marcella Valerian", sex: "female", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "unknown",
      birthDate: YEAR(567), deathDate: UNKNOWN, socialStatus: "empress", houseId: "house.valerian",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.cassian_valerian", name: "Cassian Valerian", sex: "male", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "pantheon",
      birthDate: YEAR(586), deathDate: YEAR(612), socialStatus: "imperial_heir", houseId: "house.valerian",
      notes: "Firstborn of Lucan VII; died at sea without issue in 612 CR.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.julian_valerian", name: "Julian Valerian", sex: "male", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "pantheon",
      birthDate: YEAR(588), deathDate: UNKNOWN, socialStatus: "military_heir", houseId: "house.valerian",
      notes: "Current military heir after the death of his elder brother Cassian.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.livia_valerian", name: "Livia Valerian", sex: "female", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "unknown",
      birthDate: YEAR(594), deathDate: UNKNOWN, socialStatus: "princess", houseId: "house.valerian",
      notes: "Secret Covenant sympathizer; dynastic descent remains politically relevant even though Julian is the current heir.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },

    // --- Serath / House Asharan ---
    {
      id: "character.mattan_i", name: "Mattan I", sex: "male", ancestry: "serathi", homelandRegion: "serath", culture: "serathi", religion: "unknown",
      birthDate: APPROX(450), deathDate: APPROX(510), socialStatus: "king", notes: "Pre-Covenant king in the older dynasty.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.ashar_i_asharan", name: "Ashar I", sex: "male", ancestry: "serathi", homelandRegion: "serath", culture: "serathi", religion: "covenant",
      birthDate: APPROX(477), deathDate: APPROX(538), socialStatus: "king", houseId: "house.asharan",
      notes: "Converted publicly in 503 CR and became king in 508; the dynasty was thereafter styled Asharan.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.jonan_i_asharan", name: "Jonan I Asharan", sex: "male", ancestry: "serathi", homelandRegion: "serath", culture: "serathi", religion: "covenant",
      birthDate: YEAR(510), deathDate: YEAR(574), socialStatus: "royal", houseId: "house.asharan",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.mattan_ii_asharan", name: "Mattan II Asharan", sex: "male", ancestry: "serathi", homelandRegion: "serath", culture: "serathi", religion: "covenant",
      birthDate: YEAR(541), deathDate: YEAR(607), socialStatus: "royal", houseId: "house.asharan",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.mattan_iii_asharan", name: "Mattan III Asharan", sex: "male", ancestry: "serathi", homelandRegion: "serath", culture: "serathi", religion: "covenant",
      birthDate: YEAR(573), deathDate: UNKNOWN, socialStatus: "king", houseId: "house.asharan",
      notes: "King of Serath in 628 CR.", origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.queen_miriam_asharan", name: "Queen Miriam Asharan", sex: "female", ancestry: "serathi", homelandRegion: "serath", culture: "serathi", religion: "covenant",
      birthDate: YEAR(579), deathDate: UNKNOWN, socialStatus: "queen", houseId: "house.asharan",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.elias_asharan", name: "Elias Asharan", sex: "male", ancestry: "serathi", homelandRegion: "serath", culture: "serathi", religion: "covenant",
      birthDate: YEAR(600), deathDate: UNKNOWN, socialStatus: "crown_prince", houseId: "house.asharan",
      notes: "Crown Prince; sincerely supports military protection of Covenant believers abroad.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.salome_asharan", name: "Salome Asharan", sex: "female", ancestry: "serathi", homelandRegion: "serath", culture: "serathi", religion: "covenant",
      birthDate: YEAR(603), deathDate: UNKNOWN, socialStatus: "princess", houseId: "house.asharan",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.jonan_asharan", name: "Jonan Asharan", sex: "male", ancestry: "serathi", homelandRegion: "serath", culture: "serathi", religion: "covenant",
      birthDate: YEAR(609), deathDate: UNKNOWN, socialStatus: "prince", houseId: "house.asharan",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },

    // --- Kaishin / House Tenrai ---
    {
      id: "character.tenrai_shun", name: "Tenrai Shun", sex: "male", ancestry: "kaishin", homelandRegion: "kaishin", culture: "kaishin", religion: "turning_wheel",
      birthDate: APPROX(318), deathDate: APPROX(377), socialStatus: "imperial_ancestor", houseId: "house.tenrai",
      notes: "Centralizing reform ancestor; current canon does not claim he founded the house itself.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.kaito_tenrai", name: "Emperor Kaito Tenrai", sex: "male", ancestry: "kaishin", homelandRegion: "kaishin", culture: "kaishin", religion: "turning_wheel",
      birthDate: YEAR(533), deathDate: YEAR(601), socialStatus: "emperor", houseId: "house.tenrai",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.hana_tenrai", name: "Empress Hana", sex: "female", ancestry: "kaishin", homelandRegion: "kaishin", culture: "kaishin", religion: "turning_wheel",
      birthDate: YEAR(538), deathDate: YEAR(612), socialStatus: "empress", houseId: "house.tenrai",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.jian_tenrai", name: "Emperor Jian Tenrai", sex: "male", ancestry: "kaishin", homelandRegion: "kaishin", culture: "kaishin", religion: "turning_wheel",
      birthDate: YEAR(567), deathDate: UNKNOWN, socialStatus: "emperor", houseId: "house.tenrai",
      notes: "Emperor of Kaishin in 628 CR.", origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.mei_tenrai", name: "Empress Mei Tenrai", sex: "female", ancestry: "kaishin", homelandRegion: "kaishin", culture: "kaishin", religion: "turning_wheel",
      birthDate: YEAR(572), deathDate: UNKNOWN, socialStatus: "empress", houseId: "house.tenrai",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.ren_tenrai", name: "Ren Tenrai", sex: "male", ancestry: "kaishin", homelandRegion: "kaishin", culture: "kaishin", religion: "turning_wheel",
      birthDate: YEAR(593), deathDate: UNKNOWN, socialStatus: "crown_prince", houseId: "house.tenrai",
      notes: "Crown Prince and selective modernizer.", origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.daichi_tenrai", name: "Daichi Tenrai", sex: "male", ancestry: "kaishin", homelandRegion: "kaishin", culture: "kaishin", religion: "turning_wheel",
      birthDate: YEAR(597), deathDate: UNKNOWN, socialStatus: "prince", houseId: "house.tenrai",
      notes: "Traditionalist prince suspicious of foreign institutional dependence.", origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.aya_tenrai", name: "Aya Tenrai", sex: "female", ancestry: "kaishin", homelandRegion: "kaishin", culture: "kaishin", religion: "turning_wheel",
      birthDate: YEAR(601), deathDate: UNKNOWN, socialStatus: "princess", houseId: "house.tenrai",
      notes: "Princess with strong interest in foreign cultures and intellectual exchange.", origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },

    // --- Vespera / House Darcon ---
    {
      id: "character.niketas_ii_darcon", name: "Emperor Niketas II Darcon", sex: "male", ancestry: "asterian", homelandRegion: "crossroads", culture: "vesperan", religion: "unknown",
      birthDate: YEAR(520), deathDate: YEAR(576), socialStatus: "emperor", houseId: "house.darcon",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.callista_darcon", name: "Empress Callista", sex: "female", ancestry: "asterian", homelandRegion: "crossroads", culture: "vesperan", religion: "unknown",
      birthDate: YEAR(525), deathDate: YEAR(580), socialStatus: "empress", houseId: "house.darcon",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.alexar_ii_darcon", name: "Alexar II Darcon", sex: "male", ancestry: "asterian", homelandRegion: "crossroads", culture: "vesperan", religion: "unknown",
      birthDate: YEAR(548), deathDate: YEAR(602), socialStatus: "imperial", houseId: "house.darcon",
      notes: "Used marriage, toll concessions, fortification, and religious balancing to keep Vespera independent.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.sophia_valen", name: "Sophia Valen", sex: "female", ancestry: "asterian", homelandRegion: "crossroads", culture: "vesperan", religion: "unknown",
      birthDate: YEAR(555), deathDate: YEAR(585), socialStatus: "imperial_spouse",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.miriam_sariel", name: "Miriam Sariel", sex: "female", ancestry: "serathi", homelandRegion: "crossroads", culture: "vesperan", religion: "covenant",
      birthDate: YEAR(558), deathDate: YEAR(616), socialStatus: "imperial_spouse",
      notes: "Covenant noblewoman; married Alexar II in 587 CR, creating an interfaith court precedent.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.alexar_iii_darcon", name: "Emperor Alexar III Darcon", sex: "male", ancestry: "asterian", homelandRegion: "crossroads", culture: "vesperan", religion: "pantheon",
      birthDate: YEAR(576), deathDate: UNKNOWN, socialStatus: "emperor", houseId: "house.darcon",
      notes: "Emperor of Vespera in 628 CR; balances stronger powers and a religiously mixed capital.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.helena_celos_darcon", name: "Empress Helena Celos", sex: "female", ancestry: "serathi", homelandRegion: "crossroads", culture: "vesperan", religion: "covenant",
      birthDate: YEAR(583), deathDate: UNKNOWN, socialStatus: "empress", houseId: "house.darcon",
      notes: "Covenant empress whose marriage to Alexar III is itself politically important.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.adrian_darcon", name: "Adrian Darcon", sex: "male", ancestry: "mixed", homelandRegion: "crossroads", culture: "vesperan", religion: "unaffiliated",
      birthDate: YEAR(605), deathDate: UNKNOWN, socialStatus: "prince", houseId: "house.darcon",
      notes: "Religion unsettled; both Pantheon and Covenant factions court him. Exact succession precedence is intentionally unresolved.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.sophia_darcon", name: "Sophia Darcon", sex: "female", ancestry: "mixed", homelandRegion: "crossroads", culture: "vesperan", religion: "covenant",
      birthDate: YEAR(608), deathDate: UNKNOWN, socialStatus: "princess", houseId: "house.darcon",
      notes: "Popular with Vespera's Covenant population; exact succession precedence is intentionally unresolved.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },

    // --- Blackhaven political families (family persistence without a dynasty) ---
    {
      id: "character.mateo_corven", name: "Mateo Corven", sex: "male", ancestry: "unknown", homelandRegion: "outer_isles", culture: "outer_isles", religion: "unknown",
      birthDate: YEAR(558), deathDate: YEAR(612), socialStatus: "merchant_captain",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.isabella_corven", name: "Isabella Corven", sex: "female", ancestry: "asterian", homelandRegion: "outer_isles", culture: "outer_isles", religion: "pantheon",
      birthDate: YEAR(590), deathDate: UNKNOWN, socialStatus: "pirate_captain",
      notes: "Captain of Gilded Knife; Day-1 High Captain contender and organizer. Her mother's office creates networks, not hereditary entitlement.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    },
    {
      id: "character.soren_voss", name: "Soren Voss", sex: "male", ancestry: "skeldran", homelandRegion: "outer_isles", culture: "outer_isles", religion: "unknown",
      birthDate: YEAR(551), deathDate: YEAR(602), socialStatus: "privateer_smuggler",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.daphne_merys", name: "Daphne Merys", sex: "female", ancestry: "asterian", homelandRegion: "outer_isles", culture: "outer_isles", religion: "unknown",
      birthDate: YEAR(557), deathDate: YEAR(614), socialStatus: "navigator_trader",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },
    {
      id: "character.cal_voss", name: "Cal Voss", sex: "male", ancestry: "mixed", homelandRegion: "outer_isles", culture: "outer_isles", religion: "unknown",
      birthDate: YEAR(589), deathDate: YEAR(616), socialStatus: "mariner",
      notes: "Younger brother of Mara Voss; died at sea without surviving children.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "historical_only"
    },

    // --- Rhadessa elected polity ---
    {
      id: "character.damon_rhys", name: "Damon Rhys", sex: "male", ancestry: "asterian", homelandRegion: "asteria", culture: "asterian", religion: "unknown",
      birthDate: YEAR(570), deathDate: UNKNOWN, socialStatus: "sea_magistrate",
      notes: "Elected Sea Magistrate of Rhadessa in 628 CR; long compromise career, with the current term ending soon. His children do not inherit the office.",
      origin: "authored", canonicalStatus: "canonical", lifecycle: "living_persistent"
    }
  ],

  relationships: [
    // Vaering documented branch
    { id: "relationship.eirik_ii.spouse.runa", fromCharacterId: "character.eirik_ii_vaering", toCharacterId: "character.queen_runa", relationshipType: "spouse", startDate: UNKNOWN, endDate: YEAR(558), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.eirik_ii.parent.eirik_iii", fromCharacterId: "character.eirik_ii_vaering", toCharacterId: "character.eirik_iii_vaering", relationshipType: "parent", startDate: YEAR(533), endDate: YEAR(558), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.runa.parent.eirik_iii", fromCharacterId: "character.queen_runa", toCharacterId: "character.eirik_iii_vaering", relationshipType: "parent", startDate: YEAR(533), endDate: YEAR(566), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.eirik_iii.spouse.sigrid", fromCharacterId: "character.eirik_iii_vaering", toCharacterId: "character.queen_sigrid", relationshipType: "spouse", startDate: UNKNOWN, endDate: YEAR(598), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.sigrid.parent.eirik_iv", fromCharacterId: "character.queen_sigrid", toCharacterId: "character.eirik_iv_vaering", relationshipType: "parent", startDate: YEAR(565), endDate: YEAR(598), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.eirik_iii.parent.hakon", fromCharacterId: "character.eirik_iii_vaering", toCharacterId: "character.hakon_vaering", relationshipType: "parent", startDate: YEAR(568), endDate: YEAR(613), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.sigrid.parent.hakon", fromCharacterId: "character.queen_sigrid", toCharacterId: "character.hakon_vaering", relationshipType: "parent", startDate: YEAR(568), endDate: YEAR(598), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.eirik_iv.spouse.astrid", fromCharacterId: "character.eirik_iv_vaering", toCharacterId: "character.queen_astrid", relationshipType: "spouse", startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.astrid.parent.leif", fromCharacterId: "character.queen_astrid", toCharacterId: "character.leif_vaering", relationshipType: "parent", startDate: YEAR(592), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.astrid.parent.freya", fromCharacterId: "character.queen_astrid", toCharacterId: "character.freya_vaering", relationshipType: "parent", startDate: YEAR(596), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.astrid.parent.torvald", fromCharacterId: "character.queen_astrid", toCharacterId: "character.torvald_vaering", relationshipType: "parent", startDate: YEAR(604), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.hakon.spouse.liv", fromCharacterId: "character.hakon_vaering", toCharacterId: "character.liv_ormsen", relationshipType: "spouse", startDate: UNKNOWN, endDate: YEAR(622), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.hakon.parent.sten", fromCharacterId: "character.hakon_vaering", toCharacterId: "character.sten_vaering", relationshipType: "parent", startDate: YEAR(598), endDate: YEAR(622), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.liv.parent.sten", fromCharacterId: "character.liv_ormsen", toCharacterId: "character.sten_vaering", relationshipType: "parent", startDate: YEAR(598), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.hakon.parent.yrsa", fromCharacterId: "character.hakon_vaering", toCharacterId: "character.yrsa_vaering", relationshipType: "parent", startDate: YEAR(603), endDate: YEAR(622), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.liv.parent.yrsa", fromCharacterId: "character.liv_ormsen", toCharacterId: "character.yrsa_vaering", relationshipType: "parent", startDate: YEAR(603), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },

    // Marcellan / Varen
    { id: "relationship.decian.spouse.lysandra", fromCharacterId: "character.decian_marcellan", toCharacterId: "character.lysandra_coris", relationshipType: "spouse", startDate: UNKNOWN, endDate: YEAR(604), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.decian.parent.cassian", fromCharacterId: "character.decian_marcellan", toCharacterId: "character.cassian_marcellan", relationshipType: "parent", startDate: YEAR(571), endDate: YEAR(604), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.lysandra.parent.cassian", fromCharacterId: "character.lysandra_coris", toCharacterId: "character.cassian_marcellan", relationshipType: "parent", startDate: YEAR(571), endDate: YEAR(610), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.decian.parent.lydia", fromCharacterId: "character.decian_marcellan", toCharacterId: "character.lydia_marcellan", relationshipType: "parent", startDate: YEAR(575), endDate: YEAR(604), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.lysandra.parent.lydia", fromCharacterId: "character.lysandra_coris", toCharacterId: "character.lydia_marcellan", relationshipType: "parent", startDate: YEAR(575), endDate: YEAR(610), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.cassian.spouse.thalia", fromCharacterId: "character.cassian_marcellan", toCharacterId: "character.thalia_varen", relationshipType: "spouse", startDate: UNKNOWN, endDate: YEAR(618), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.cassian.parent.helena", fromCharacterId: "character.cassian_marcellan", toCharacterId: "character.helena_marcellan", relationshipType: "parent", startDate: YEAR(599), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.thalia.parent.helena", fromCharacterId: "character.thalia_varen", toCharacterId: "character.helena_marcellan", relationshipType: "parent", startDate: YEAR(599), endDate: YEAR(618), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.cassian.parent.marcus", fromCharacterId: "character.cassian_marcellan", toCharacterId: "character.marcus_marcellan", relationshipType: "parent", startDate: YEAR(603), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.thalia.parent.marcus", fromCharacterId: "character.thalia_varen", toCharacterId: "character.marcus_marcellan", relationshipType: "parent", startDate: YEAR(603), endDate: YEAR(618), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.thalia.sibling.nikos", fromCharacterId: "character.thalia_varen", toCharacterId: "character.nikos_varen", relationshipType: "sibling", startDate: YEAR(577), endDate: YEAR(618), endReason: "death", origin: "authored", canonicalStatus: "canonical" },

    // Valerian
    { id: "relationship.lucan_vi.spouse.aurelia", fromCharacterId: "character.lucan_vi_valerian", toCharacterId: "character.aurelia_cassene", relationshipType: "spouse", startDate: UNKNOWN, endDate: YEAR(584), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.lucan_vi.parent.lucan_vii", fromCharacterId: "character.lucan_vi_valerian", toCharacterId: "character.lucan_vii_valerian", relationshipType: "parent", startDate: YEAR(560), endDate: YEAR(584), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.aurelia.parent.lucan_vii", fromCharacterId: "character.aurelia_cassene", toCharacterId: "character.lucan_vii_valerian", relationshipType: "parent", startDate: YEAR(560), endDate: YEAR(590), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.lucan_vii.spouse.marcella", fromCharacterId: "character.lucan_vii_valerian", toCharacterId: "character.marcella_valerian", relationshipType: "spouse", startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.lucan_vii.parent.cassian", fromCharacterId: "character.lucan_vii_valerian", toCharacterId: "character.cassian_valerian", relationshipType: "parent", startDate: YEAR(586), endDate: YEAR(612), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.marcella.parent.cassian", fromCharacterId: "character.marcella_valerian", toCharacterId: "character.cassian_valerian", relationshipType: "parent", startDate: YEAR(586), endDate: YEAR(612), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.lucan_vii.parent.julian", fromCharacterId: "character.lucan_vii_valerian", toCharacterId: "character.julian_valerian", relationshipType: "parent", startDate: YEAR(588), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.marcella.parent.julian", fromCharacterId: "character.marcella_valerian", toCharacterId: "character.julian_valerian", relationshipType: "parent", startDate: YEAR(588), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.lucan_vii.parent.livia", fromCharacterId: "character.lucan_vii_valerian", toCharacterId: "character.livia_valerian", relationshipType: "parent", startDate: YEAR(594), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.marcella.parent.livia", fromCharacterId: "character.marcella_valerian", toCharacterId: "character.livia_valerian", relationshipType: "parent", startDate: YEAR(594), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },

    // Asharan direct documented line
    { id: "relationship.mattan_i.parent.ashar_i", fromCharacterId: "character.mattan_i", toCharacterId: "character.ashar_i_asharan", relationshipType: "parent", startDate: APPROX(477), endDate: APPROX(510), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.ashar_i.parent.jonan_i", fromCharacterId: "character.ashar_i_asharan", toCharacterId: "character.jonan_i_asharan", relationshipType: "parent", startDate: YEAR(510), endDate: APPROX(538), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.jonan_i.parent.mattan_ii", fromCharacterId: "character.jonan_i_asharan", toCharacterId: "character.mattan_ii_asharan", relationshipType: "parent", startDate: YEAR(541), endDate: YEAR(574), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.mattan_ii.parent.mattan_iii", fromCharacterId: "character.mattan_ii_asharan", toCharacterId: "character.mattan_iii_asharan", relationshipType: "parent", startDate: YEAR(573), endDate: YEAR(607), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.mattan_iii.spouse.miriam", fromCharacterId: "character.mattan_iii_asharan", toCharacterId: "character.queen_miriam_asharan", relationshipType: "spouse", startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.mattan_iii.parent.elias", fromCharacterId: "character.mattan_iii_asharan", toCharacterId: "character.elias_asharan", relationshipType: "parent", startDate: YEAR(600), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.miriam.parent.elias", fromCharacterId: "character.queen_miriam_asharan", toCharacterId: "character.elias_asharan", relationshipType: "parent", startDate: YEAR(600), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.mattan_iii.parent.salome", fromCharacterId: "character.mattan_iii_asharan", toCharacterId: "character.salome_asharan", relationshipType: "parent", startDate: YEAR(603), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.miriam.parent.salome", fromCharacterId: "character.queen_miriam_asharan", toCharacterId: "character.salome_asharan", relationshipType: "parent", startDate: YEAR(603), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.mattan_iii.parent.jonan", fromCharacterId: "character.mattan_iii_asharan", toCharacterId: "character.jonan_asharan", relationshipType: "parent", startDate: YEAR(609), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.miriam.parent.jonan", fromCharacterId: "character.queen_miriam_asharan", toCharacterId: "character.jonan_asharan", relationshipType: "parent", startDate: YEAR(609), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },

    // Tenrai current documented branch (earlier generations intentionally omitted across the lore ellipsis)
    { id: "relationship.kaito.spouse.hana", fromCharacterId: "character.kaito_tenrai", toCharacterId: "character.hana_tenrai", relationshipType: "spouse", startDate: UNKNOWN, endDate: YEAR(601), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.kaito.parent.jian", fromCharacterId: "character.kaito_tenrai", toCharacterId: "character.jian_tenrai", relationshipType: "parent", startDate: YEAR(567), endDate: YEAR(601), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.hana.parent.jian", fromCharacterId: "character.hana_tenrai", toCharacterId: "character.jian_tenrai", relationshipType: "parent", startDate: YEAR(567), endDate: YEAR(612), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.jian.spouse.mei", fromCharacterId: "character.jian_tenrai", toCharacterId: "character.mei_tenrai", relationshipType: "spouse", startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.jian.parent.ren", fromCharacterId: "character.jian_tenrai", toCharacterId: "character.ren_tenrai", relationshipType: "parent", startDate: YEAR(593), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.mei.parent.ren", fromCharacterId: "character.mei_tenrai", toCharacterId: "character.ren_tenrai", relationshipType: "parent", startDate: YEAR(593), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.jian.parent.daichi", fromCharacterId: "character.jian_tenrai", toCharacterId: "character.daichi_tenrai", relationshipType: "parent", startDate: YEAR(597), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.mei.parent.daichi", fromCharacterId: "character.mei_tenrai", toCharacterId: "character.daichi_tenrai", relationshipType: "parent", startDate: YEAR(597), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.jian.parent.aya", fromCharacterId: "character.jian_tenrai", toCharacterId: "character.aya_tenrai", relationshipType: "parent", startDate: YEAR(601), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.mei.parent.aya", fromCharacterId: "character.mei_tenrai", toCharacterId: "character.aya_tenrai", relationshipType: "parent", startDate: YEAR(601), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },

    // Darcon / Vespera
    { id: "relationship.niketas_ii.spouse.callista", fromCharacterId: "character.niketas_ii_darcon", toCharacterId: "character.callista_darcon", relationshipType: "spouse", startDate: UNKNOWN, endDate: YEAR(576), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.niketas_ii.parent.alexar_ii", fromCharacterId: "character.niketas_ii_darcon", toCharacterId: "character.alexar_ii_darcon", relationshipType: "parent", startDate: YEAR(548), endDate: YEAR(576), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.callista.parent.alexar_ii", fromCharacterId: "character.callista_darcon", toCharacterId: "character.alexar_ii_darcon", relationshipType: "parent", startDate: YEAR(548), endDate: YEAR(580), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.alexar_ii.spouse.sophia_valen", fromCharacterId: "character.alexar_ii_darcon", toCharacterId: "character.sophia_valen", relationshipType: "spouse", startDate: UNKNOWN, endDate: YEAR(585), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.alexar_ii.parent.alexar_iii", fromCharacterId: "character.alexar_ii_darcon", toCharacterId: "character.alexar_iii_darcon", relationshipType: "parent", startDate: YEAR(576), endDate: YEAR(602), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.sophia_valen.parent.alexar_iii", fromCharacterId: "character.sophia_valen", toCharacterId: "character.alexar_iii_darcon", relationshipType: "parent", startDate: YEAR(576), endDate: YEAR(585), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.alexar_ii.spouse.miriam_sariel", fromCharacterId: "character.alexar_ii_darcon", toCharacterId: "character.miriam_sariel", relationshipType: "spouse", startDate: YEAR(587), endDate: YEAR(602), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.alexar_iii.spouse.helena", fromCharacterId: "character.alexar_iii_darcon", toCharacterId: "character.helena_celos_darcon", relationshipType: "spouse", startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.alexar_iii.parent.adrian", fromCharacterId: "character.alexar_iii_darcon", toCharacterId: "character.adrian_darcon", relationshipType: "parent", startDate: YEAR(605), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.helena.parent.adrian", fromCharacterId: "character.helena_celos_darcon", toCharacterId: "character.adrian_darcon", relationshipType: "parent", startDate: YEAR(605), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.alexar_iii.parent.sophia", fromCharacterId: "character.alexar_iii_darcon", toCharacterId: "character.sophia_darcon", relationshipType: "parent", startDate: YEAR(608), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.helena.parent.sophia", fromCharacterId: "character.helena_celos_darcon", toCharacterId: "character.sophia_darcon", relationshipType: "parent", startDate: YEAR(608), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },

    // Blackhaven families — no house records by design
    { id: "relationship.jessa.spouse.mateo", fromCharacterId: "character.jessa_corven", toCharacterId: "character.mateo_corven", relationshipType: "spouse", startDate: UNKNOWN, endDate: YEAR(607), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.jessa.parent.isabella", fromCharacterId: "character.jessa_corven", toCharacterId: "character.isabella_corven", relationshipType: "parent", startDate: YEAR(590), endDate: YEAR(607), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.mateo.parent.isabella", fromCharacterId: "character.mateo_corven", toCharacterId: "character.isabella_corven", relationshipType: "parent", startDate: YEAR(590), endDate: YEAR(612), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.soren.spouse.daphne", fromCharacterId: "character.soren_voss", toCharacterId: "character.daphne_merys", relationshipType: "spouse", startDate: UNKNOWN, endDate: YEAR(602), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.soren.parent.mara", fromCharacterId: "character.soren_voss", toCharacterId: "character.mara_voss", relationshipType: "parent", startDate: YEAR(584), endDate: YEAR(602), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.daphne.parent.mara", fromCharacterId: "character.daphne_merys", toCharacterId: "character.mara_voss", relationshipType: "parent", startDate: YEAR(584), endDate: YEAR(614), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.soren.parent.cal", fromCharacterId: "character.soren_voss", toCharacterId: "character.cal_voss", relationshipType: "parent", startDate: YEAR(589), endDate: YEAR(602), endReason: "death", origin: "authored", canonicalStatus: "canonical" },
    { id: "relationship.daphne.parent.cal", fromCharacterId: "character.daphne_merys", toCharacterId: "character.cal_voss", relationshipType: "parent", startDate: YEAR(589), endDate: YEAR(614), endReason: "death", origin: "authored", canonicalStatus: "canonical" }
  ],

  houses: [
    {
      id: "house.vaering", name: "House Vaering", culture: "skeldran", region: "skeldra", foundedDate: APPROX(225), endedDate: UNKNOWN,
      founderCharacterId: "character.vaer_the_red", notes: "Skeldran royal house. Vaer the Red is the claimed ancestral founder; the earliest links remain traditional/uncertain while the later royal line is documented.",
      status: "active", origin: "authored", canonicalStatus: "canonical"
    },
    {
      id: "house.marcellan", name: "House Marcellan", culture: "asterian", region: "asteria", foundedDate: UNKNOWN, endedDate: UNKNOWN,
      notes: "Asterra republican oligarchic family. Aeson Marcellan is a League-era ancestor/political myth, but family prestige does not create a hereditary right to the First Archonship.",
      status: "active", origin: "authored", canonicalStatus: "canonical"
    },
    {
      id: "house.valerian", name: "House Valerian", culture: "asterian", region: "asteria", foundedDate: UNKNOWN, endedDate: UNKNOWN,
      notes: "Aurellian imperial dynasty with multiple historical imperial and cadet branches; Solvar Valerian I is a celebrated early ancestor rather than a proven founder record.",
      status: "active", origin: "authored", canonicalStatus: "canonical"
    },
    {
      id: "house.asharan", name: "House Asharan", culture: "serathi", region: "serath", foundedDate: YEAR(508), endedDate: UNKNOWN,
      founderCharacterId: "character.ashar_i_asharan", notes: "Dynasty styled Asharan after Ashar I's Covenant conversion and kingship; current legitimacy is deeply tied to Covenant history.",
      status: "active", origin: "authored", canonicalStatus: "canonical"
    },
    {
      id: "house.tenrai", name: "House Tenrai", culture: "kaishin", region: "kaishin", foundedDate: UNKNOWN, endedDate: UNKNOWN,
      notes: "Long-lived Kaishin imperial house. Tenrai Shun is a centralizing reform ancestor; current canon does not identify him as the literal founder.",
      status: "active", origin: "authored", canonicalStatus: "canonical"
    },
    {
      id: "house.darcon", name: "House Darcon", culture: "vesperan", region: "crossroads", foundedDate: UNKNOWN, endedDate: UNKNOWN,
      notes: "Vesperan imperial house whose survival depends on dynastic continuity, religious balancing, court politics, fortification, tolls, and diplomacy rather than simple inheritance alone.",
      status: "active", origin: "authored", canonicalStatus: "canonical"
    }
  ],

  offices: [
    { id: "office.asterra.first_archon", name: "First Archon of Asterra", region: "asteria", selectionMode: "elected", hereditaryByDefault: false, notes: "Republican office. Marcellan family power can influence elections but children do not inherit this office by blood.", origin: "authored", canonicalStatus: "canonical" },
    { id: "office.aurelia.imperator", name: "Imperator of Aurelia", region: "asteria", selectionMode: "hereditary", hereditaryByDefault: true, notes: "Imperial office. Dynastic descent matters, but future succession must still consider legitimacy and political/military support rather than a universal hard-coded rule.", origin: "authored", canonicalStatus: "canonical" },
    { id: "office.serath.king", name: "King of Serath", region: "serath", selectionMode: "hereditary", hereditaryByDefault: true, notes: "Serathi royal office. Covenant legitimacy and dynastic descent both matter.", origin: "authored", canonicalStatus: "canonical" },
    { id: "office.kaishin.emperor", name: "Emperor of Kaishin", region: "kaishin", selectionMode: "hereditary", hereditaryByDefault: true, notes: "Imperial Tenrai office; court institutions and continuity matter alongside descent.", origin: "authored", canonicalStatus: "canonical" },
    { id: "office.vespera.emperor", name: "Emperor of Vespera", region: "crossroads", selectionMode: "customary", hereditaryByDefault: true, notes: "Dynastic office whose practical succession can depend on court, military, religious, and diplomatic legitimacy; not reduced to strict primogeniture.", origin: "authored", canonicalStatus: "canonical" },
    { id: "office.rhadessa.sea_magistrate", name: "Sea Magistrate of Rhadessa", region: "asteria", selectionMode: "elected", hereditaryByDefault: false, notes: "Elected ruler chosen from naval families. Family reputation may matter, but descendants receive no automatic political succession.", origin: "authored", canonicalStatus: "canonical" }
  ],

  officeTerms: [
    { id: "term.asterra.cassian_marcellan", officeId: "office.asterra.first_archon", holderCharacterId: "character.cassian_marcellan", startDate: UNKNOWN, endDate: UNKNOWN, interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.aurelia.lucan_vii", officeId: "office.aurelia.imperator", holderCharacterId: "character.lucan_vii_valerian", startDate: UNKNOWN, endDate: UNKNOWN, interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.serath.ashar_i", officeId: "office.serath.king", holderCharacterId: "character.ashar_i_asharan", startDate: YEAR(508), endDate: APPROX(538), endReason: "death", interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.serath.mattan_iii", officeId: "office.serath.king", holderCharacterId: "character.mattan_iii_asharan", startDate: UNKNOWN, endDate: UNKNOWN, interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.kaishin.kaito_tenrai", officeId: "office.kaishin.emperor", holderCharacterId: "character.kaito_tenrai", startDate: UNKNOWN, endDate: YEAR(601), endReason: "death", interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.kaishin.jian_tenrai", officeId: "office.kaishin.emperor", holderCharacterId: "character.jian_tenrai", startDate: UNKNOWN, endDate: UNKNOWN, interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.vespera.niketas_ii", officeId: "office.vespera.emperor", holderCharacterId: "character.niketas_ii_darcon", startDate: UNKNOWN, endDate: YEAR(576), endReason: "death", interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.vespera.alexar_iii", officeId: "office.vespera.emperor", holderCharacterId: "character.alexar_iii_darcon", startDate: UNKNOWN, endDate: UNKNOWN, interim: false, origin: "authored", canonicalStatus: "canonical" },
    { id: "term.rhadessa.damon_rhys", officeId: "office.rhadessa.sea_magistrate", holderCharacterId: "character.damon_rhys", startDate: UNKNOWN, endDate: UNKNOWN, endReason: "term_ending_soon", interim: false, origin: "authored", canonicalStatus: "canonical" }
  ],

  claims: [
    // Skeldra: one legal heir, other real dynastic/political bases without pretending they are equal.
    { id: "claim.freya.skeldran_crown.descent", claimantCharacterId: "character.freya_vaering", targetOfficeId: "office.skeldra.king", basis: "direct_descent", legalBasis: "Direct child of Eirik IV. Leif remains the recognized legal heir.", genealogicalPath: ["character.freya_vaering", "character.eirik_iv_vaering"], disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "claim.freya.skeldran_crown.custom", claimantCharacterId: "character.freya_vaering", targetOfficeId: "office.skeldra.king", basis: "customary_law", legalBasis: "Traditionalist and military support could invoke ancestral/customary arguments if succession fractures; this is not the current legal-heir designation.", disputed: true, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical_uncertain" },
    { id: "claim.torvald.skeldran_crown", claimantCharacterId: "character.torvald_vaering", targetOfficeId: "office.skeldra.king", basis: "direct_descent", legalBasis: "Direct child of Eirik IV, junior to the recognized legal heir; no exact statutory priority is invented here.", genealogicalPath: ["character.torvald_vaering", "character.eirik_iv_vaering"], disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "claim.sten.skeldran_crown", claimantCharacterId: "character.sten_vaering", targetOfficeId: "office.skeldra.king", basis: "collateral_descent", legalBasis: "Collateral Vaering claim if the direct line fractures.", genealogicalPath: ["character.sten_vaering", "character.hakon_vaering", "character.eirik_iii_vaering", "character.eirik_iv_vaering"], disputed: false, active: false, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },

    // Asterra: current mandate is electoral; children intentionally receive no hereditary claims.
    { id: "claim.cassian.asterra_first_archon", claimantCharacterId: "character.cassian_marcellan", targetOfficeId: "office.asterra.first_archon", basis: "election", legalBasis: "Current republican mandate. Marcellan wealth and patronage influence politics but do not convert the office into a crown.", disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },

    // Aurelia
    { id: "claim.julian.aurellian_imperator", claimantCharacterId: "character.julian_valerian", targetOfficeId: "office.aurelia.imperator", basis: "direct_descent", priority: 1, legalBasis: "Current military heir after elder brother Cassian died without issue in 612 CR.", genealogicalPath: ["character.julian_valerian", "character.lucan_vii_valerian"], disputed: false, active: true, startDate: YEAR(612), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "claim.livia.aurellian_imperator", claimantCharacterId: "character.livia_valerian", targetOfficeId: "office.aurelia.imperator", basis: "direct_descent", legalBasis: "Dynastic descent remains a potential basis; Julian is the current recognized military heir.", genealogicalPath: ["character.livia_valerian", "character.lucan_vii_valerian"], disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },

    // Serath
    { id: "claim.elias.serathi_crown", claimantCharacterId: "character.elias_asharan", targetOfficeId: "office.serath.king", basis: "direct_descent", priority: 1, legalBasis: "Recognized Crown Prince in 628 CR.", genealogicalPath: ["character.elias_asharan", "character.mattan_iii_asharan"], disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "claim.salome.serathi_crown", claimantCharacterId: "character.salome_asharan", targetOfficeId: "office.serath.king", basis: "direct_descent", legalBasis: "Direct royal descent; exact contingent precedence behind Elias is intentionally not fabricated.", genealogicalPath: ["character.salome_asharan", "character.mattan_iii_asharan"], disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "claim.jonan.serathi_crown", claimantCharacterId: "character.jonan_asharan", targetOfficeId: "office.serath.king", basis: "direct_descent", legalBasis: "Direct royal descent; exact contingent precedence behind Elias is intentionally not fabricated.", genealogicalPath: ["character.jonan_asharan", "character.mattan_iii_asharan"], disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },

    // Kaishin
    { id: "claim.ren.kaishin_throne", claimantCharacterId: "character.ren_tenrai", targetOfficeId: "office.kaishin.emperor", basis: "direct_descent", priority: 1, legalBasis: "Recognized Crown Prince in 628 CR.", genealogicalPath: ["character.ren_tenrai", "character.jian_tenrai"], disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "claim.daichi.kaishin_throne", claimantCharacterId: "character.daichi_tenrai", targetOfficeId: "office.kaishin.emperor", basis: "direct_descent", legalBasis: "Direct imperial descent; no exact contingent precedence beyond Ren is invented.", genealogicalPath: ["character.daichi_tenrai", "character.jian_tenrai"], disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "claim.aya.kaishin_throne", claimantCharacterId: "character.aya_tenrai", targetOfficeId: "office.kaishin.emperor", basis: "direct_descent", legalBasis: "Direct imperial descent; no exact contingent precedence beyond Ren is invented.", genealogicalPath: ["character.aya_tenrai", "character.jian_tenrai"], disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },

    // Vespera: both children have dynastic standing but the exact precedence is intentionally unresolved.
    { id: "claim.adrian.vesperan_throne", claimantCharacterId: "character.adrian_darcon", targetOfficeId: "office.vespera.emperor", basis: "direct_descent", legalBasis: "Direct imperial descent. Exact succession precedence is not yet canonized and Vesperan legitimacy is not strict primogeniture.", genealogicalPath: ["character.adrian_darcon", "character.alexar_iii_darcon"], disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical_uncertain" },
    { id: "claim.sophia.vesperan_throne", claimantCharacterId: "character.sophia_darcon", targetOfficeId: "office.vespera.emperor", basis: "direct_descent", legalBasis: "Direct imperial descent. Exact succession precedence is not yet canonized; religious support can affect practical legitimacy.", genealogicalPath: ["character.sophia_darcon", "character.alexar_iii_darcon"], disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical_uncertain" },

    // Blackhaven: office is elective. Family history creates networks, never hereditary entitlement.
    { id: "claim.mara.blackhaven_high_captain", claimantCharacterId: "character.mara_voss", targetOfficeId: "office.blackhaven.high_captain", basis: "election", legalBasis: "Won the 623 election through alliances, profitable raids, reputation, crew loyalty, and rival coalition arithmetic.", disputed: false, active: true, startDate: YEAR(623), endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },
    { id: "claim.isabella.blackhaven_high_captain", claimantCharacterId: "character.isabella_corven", targetOfficeId: "office.blackhaven.high_captain", basis: "election", legalBasis: "Recognized Day-1 contender. Jessa Corven's legacy supplies networks and reputation, not inheritance of office.", disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" },

    // Rhadessa: current mandate is elected, with descendants excluded from automatic succession.
    { id: "claim.damon.rhadessa_sea_magistrate", claimantCharacterId: "character.damon_rhys", targetOfficeId: "office.rhadessa.sea_magistrate", basis: "election", legalBasis: "Current elected mandate near the end of its term; family does not create automatic succession.", disputed: false, active: true, startDate: UNKNOWN, endDate: UNKNOWN, origin: "authored", canonicalStatus: "canonical" }
  ],

  events: [
    { id: "history.event.ashar_conversion.503", eventType: "conversion", title: "Public Conversion of Ashar I", date: YEAR(503), locationId: "region.serath", participantCharacterIds: ["character.ashar_i_asharan"], factionIds: ["house.asharan"], description: "Ashar I publicly converted to the Covenant in 503 CR, helping reshape royal legitimacy.", canonicalStatus: "canonical", origin: "authored", sourceConfidence: 100, importedFromSeed: "0.6B" },
    { id: "history.event.ashar_kingship.508", eventType: "coronation", title: "Ashar I becomes King", date: YEAR(508), locationId: "region.serath", participantCharacterIds: ["character.ashar_i_asharan"], factionIds: ["house.asharan"], description: "Ashar I became king in 508 CR; the dynasty was thereafter styled Asharan.", canonicalStatus: "canonical", origin: "authored", sourceConfidence: 100, importedFromSeed: "0.6B" },
    { id: "history.event.cassian_valerian_death.612", eventType: "death", title: "Death of Cassian Valerian", date: YEAR(612), locationId: "region.asteria", participantCharacterIds: ["character.cassian_valerian"], factionIds: ["house.valerian"], description: "Lucan VII's firstborn Cassian died at sea without issue in 612 CR.", canonicalStatus: "canonical", origin: "authored", sourceConfidence: 100, importedFromSeed: "0.6B" },
    { id: "history.event.julian_becomes_heir.612", eventType: "other", title: "Julian Valerian becomes current heir", date: YEAR(612), locationId: "region.asteria", participantCharacterIds: ["character.julian_valerian"], factionIds: ["house.valerian"], description: "Cassian's death without issue made Julian Valerian the current military heir.", canonicalStatus: "canonical", origin: "authored", sourceConfidence: 100, importedFromSeed: "0.6B" },
    { id: "history.event.mara_voss_election.623", eventType: "election", title: "Mara Voss elected High Captain", date: YEAR(623), locationId: "origin.blackhaven", participantCharacterIds: ["character.mara_voss"], factionIds: [], description: "Mara Voss won the Blackhaven High Captain election through alliances, profitable raids, reputation, crew loyalty, and a coalition of rivals who preferred her to one another.", canonicalStatus: "canonical", origin: "authored", sourceConfidence: 100, importedFromSeed: "0.6B" }
  ],

  eventLinks: [
    { id: "history.link.ashar_conversion_to_kingship", sourceEventId: "history.event.ashar_conversion.503", targetEventId: "history.event.ashar_kingship.508", relationType: "contributed_to", notes: "Ashar's sincere conversion also strengthened a political program that later shaped Asharan legitimacy.", origin: "authored", canonicalStatus: "canonical" },
    { id: "history.link.cassian_death_to_julian_heir", sourceEventId: "history.event.cassian_valerian_death.612", targetEventId: "history.event.julian_becomes_heir.612", relationType: "enabled", notes: "The firstborn's death without issue shifted the active Valerian succession position to Julian.", origin: "authored", canonicalStatus: "canonical" }
  ],

  institutions: [], wars: [], battles: [], treaties: [], ships: [], shipOwnership: [], shipCommands: [], shipRefits: [], shipRenames: [], sources: [], interpretations: []
};
