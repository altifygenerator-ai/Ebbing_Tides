const generalFaiths = ["old_gods", "covenant", "pantheon", "turning_wheel", "unaffiliated"];
const northwesternFaiths = ["old_gods", "unaffiliated"];
const pantheonFaiths = ["pantheon"];
const asterianFaiths = ["pantheon", "unaffiliated"];
const serathiFaiths = ["covenant", "unaffiliated"];
const kaishinFaiths = ["turning_wheel", "unaffiliated"];
const wheelFaiths = ["turning_wheel"];
const vesperanFaiths = ["covenant", "pantheon", "unaffiliated"];
const outerIslesFaiths = ["unaffiliated", "old_gods"];
const outerMerchantFaiths = ["unaffiliated", "covenant"];
// Alpha 0.5C corrected first Skeldran/Northwestern PLAYER portrait library.
// Player-selectable assets use dedicated 4:5 waist-up presentation derivatives; broader character/reference art stays outside this list.
// Other ancestry/culture portrait libraries use this exact registry contract when their regions are built out.
export const PORTRAIT_CHOICES = [
    {
        portraitId: "portrait.skeldra.male.weathered_sailor.01",
        assetId: "character.skeldra.player.male.weathered_sailor.01",
        ancestryTags: ["skeldran"], cultureTags: ["skeldran"], religionTags: generalFaiths,
        homelandRegionTags: ["skeldra"], homeSettlementTags: ["port.stormvik", "port.veyrholm"], sex: "male", ageBand: "adult",
        professionTags: ["sailor", "navigator", "dockworker", "smuggler"], socialTags: ["dockside_poor", "artisan_household", "naval_family", "criminal_household"],
        backgroundTags: ["shipwreck_survivor", "raised_among_smugglers", "former_naval_midshipman"],
        presentationTags: ["working_maritime", "weathered", "practical"], poseTags: ["close_three_quarter", "standing"], environmentTags: ["foggy_harbor", "working_quay"], lightingTags: ["overcast_cold"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "skeldran", birthYear: 598, apparentAge: 30, skinTone: "light_weathered", faceFamily: "skeldran_northwestern_working_01", eyeColor: "gray_blue", hairColor: "dark_blond", hairTexture: "straight_wavy", hairStyle: "short_working", facialHair: "short_beard", build: "average", permanentMarks: ["sun_weathering"], clothingCulture: "skeldran", occupationPresentation: "working_sailor", rankPresentation: "common", wealthPresentation: "working", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.skeldra.male.weathered_sailor.01" }
    },
    {
        portraitId: "portrait.skeldra.female.captain_cabin.01",
        assetId: "character.skeldra.player.female.captain_cabin.01",
        ancestryTags: ["skeldran"], cultureTags: ["skeldran"], religionTags: generalFaiths,
        homelandRegionTags: ["skeldra"], homeSettlementTags: ["port.veyrholm", "port.stormvik"], sex: "female", ageBand: "adult",
        professionTags: ["sailor", "navigator", "smuggler", "merchant_clerk"], socialTags: ["naval_family", "merchant_family", "criminal_household"],
        backgroundTags: ["former_naval_midshipman", "raised_among_smugglers", "shipwreck_survivor"],
        presentationTags: ["independent_captain", "literate", "practical_wealth"], poseTags: ["seated", "relaxed_command"], environmentTags: ["lanternlit_cabin", "charts_and_papers"], lightingTags: ["warm_interior"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "skeldran", birthYear: 596, apparentAge: 32, skinTone: "light_weathered", faceFamily: "skeldran_northwestern_f_01", eyeColor: "gray_green", hairColor: "dark_brown", hairTexture: "wavy", hairStyle: "loosely_tied", facialHair: "none", build: "athletic", permanentMarks: ["weathering"], clothingCulture: "skeldran", occupationPresentation: "independent_captain", rankPresentation: "captain", wealthPresentation: "comfortable", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.skeldra.female.captain_cabin.01" }
    },
    {
        portraitId: "portrait.skeldra.female.harbor_noble.01",
        assetId: "character.skeldra.player.female.harbor_noble.01",
        ancestryTags: ["skeldran"], cultureTags: ["skeldran"], religionTags: generalFaiths,
        homelandRegionTags: ["skeldra"], homeSettlementTags: ["port.veyrholm", "port.thorenfjord"], sex: "female", ageBand: "adult",
        professionTags: ["merchant_clerk", "scholar", "navigator"], socialTags: ["minor_nobility", "merchant_family", "naval_family"],
        backgroundTags: ["disgraced_noble", "former_naval_midshipman", "temple_educated"],
        presentationTags: ["upper_class", "travel_ready", "restrained_status"], poseTags: ["standing_profile", "looking_over_shoulder"], environmentTags: ["high_harbor_terrace", "snow_city"], lightingTags: ["cold_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "skeldran", birthYear: 595, apparentAge: 33, skinTone: "fair_cold_weather", faceFamily: "skeldran_northwestern_f_02", eyeColor: "blue_gray", hairColor: "strawberry_blond", hairTexture: "wavy", hairStyle: "braided_pinned", facialHair: "none", build: "lean", permanentMarks: [], clothingCulture: "skeldran", occupationPresentation: "harbor_noble", rankPresentation: "gentry", wealthPresentation: "wealthy", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.skeldra.female.harbor_noble.01" }
    },
    {
        portraitId: "portrait.skeldra.female.rune_seer.01",
        assetId: "character.skeldra.player.female.rune_seer.01",
        ancestryTags: ["skeldran"], cultureTags: ["skeldran"], religionTags: ["old_gods"],
        homelandRegionTags: ["skeldra"], homeSettlementTags: ["port.thorenfjord", "port.stormvik"], sex: "female", ageBand: "mature",
        professionTags: ["priest", "scholar", "healer"], socialTags: ["clerical_household", "rural_household"],
        backgroundTags: ["temple_educated", "raised_by_monks"],
        presentationTags: ["traditionalist", "ritual_authority", "old_gods"], poseTags: ["standing_with_staff", "direct_gaze"], environmentTags: ["rune_house", "sacred_harbor"], lightingTags: ["cool_diffuse"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "skeldran", birthYear: 570, apparentAge: 58, skinTone: "light_weathered_age", faceFamily: "skeldran_northwestern_f_older_01", eyeColor: "pale_blue", hairColor: "gray", hairTexture: "wavy", hairStyle: "braided_long", facialHair: "none", build: "sturdy", permanentMarks: ["age_lines"], clothingCulture: "skeldran", occupationPresentation: "old_gods_seer", rankPresentation: "religious_elder", wealthPresentation: "modest_respected", religionPresentation: "old_gods", visibleSymbols: ["ancestral_medallion"], industrialAffinity: "low", arcaneAffinity: "ritual", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: ["traditional_jewelry"], appearanceSeed: "portrait.skeldra.female.rune_seer.01" }
    },
    {
        portraitId: "portrait.skeldra.male.harbor_noble.01",
        assetId: "character.skeldra.player.male.harbor_noble.01",
        ancestryTags: ["skeldran"], cultureTags: ["skeldran"], religionTags: generalFaiths,
        homelandRegionTags: ["skeldra"], homeSettlementTags: ["port.veyrholm"], sex: "male", ageBand: "young_adult",
        professionTags: ["merchant_clerk", "scholar", "navigator"], socialTags: ["minor_nobility", "merchant_family"],
        backgroundTags: ["disgraced_noble", "temple_educated", "former_naval_midshipman"],
        presentationTags: ["young_gentry", "educated", "harbor_business"], poseTags: ["standing_at_balcony", "sideward_gaze"], environmentTags: ["misty_capital_harbor"], lightingTags: ["cold_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "skeldran", birthYear: 603, apparentAge: 25, skinTone: "fair", faceFamily: "skeldran_northwestern_m_young_01", eyeColor: "blue", hairColor: "light_brown", hairTexture: "wavy", hairStyle: "medium_brushed", facialHair: "clean_shaven", build: "lean", permanentMarks: [], clothingCulture: "skeldran", occupationPresentation: "educated_harbor_gentry", rankPresentation: "gentry", wealthPresentation: "comfortable", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.skeldra.male.harbor_noble.01" }
    },
    {
        portraitId: "portrait.skeldra.male.industrial_officer.01",
        assetId: "character.skeldra.player.male.industrial_officer.01",
        ancestryTags: ["skeldran"], cultureTags: ["skeldran"], religionTags: generalFaiths,
        homelandRegionTags: ["skeldra"], homeSettlementTags: ["port.ironhaven"], sex: "male", ageBand: "mature",
        professionTags: ["apprentice_engineer", "shipwright", "merchant_clerk"], socialTags: ["artisan_household", "merchant_family", "naval_family"],
        backgroundTags: ["foundry_child", "engineers_apprentice"],
        presentationTags: ["industrial_professional", "foundry_management", "technical"], poseTags: ["standing_over_blueprints", "working_office"], environmentTags: ["ironhaven_foundry_office", "smokestacks"], lightingTags: ["window_daylight_industrial"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "skeldran", birthYear: 584, apparentAge: 44, skinTone: "light", faceFamily: "skeldran_northwestern_m_industrial_01", eyeColor: "gray_green", hairColor: "dark_brown_gray", hairTexture: "wavy", hairStyle: "formal_short", facialHair: "trimmed_beard", build: "broad", permanentMarks: [], clothingCulture: "skeldran", occupationPresentation: "industrial_officer", rankPresentation: "senior_professional", wealthPresentation: "prosperous", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "advanced", arcaneAffinity: "low", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.skeldra.male.industrial_officer.01" }
    },
    {
        portraitId: "portrait.skeldra.male.storm_admiral.01",
        assetId: "character.skeldra.player.male.storm_admiral.01",
        ancestryTags: ["skeldran"], cultureTags: ["skeldran"], religionTags: generalFaiths,
        homelandRegionTags: ["skeldra"], homeSettlementTags: ["port.stormvik", "port.veyrholm"], sex: "male", ageBand: "mature",
        professionTags: ["sailor", "navigator", "gunner", "marine"], socialTags: ["naval_family", "minor_nobility"],
        backgroundTags: ["former_naval_midshipman", "shipwreck_survivor"],
        presentationTags: ["senior_navy", "rough_weather", "command"], poseTags: ["standing_on_deck", "braced"], environmentTags: ["storm_fleet_deck", "mountain_harbor"], lightingTags: ["broken_storm_light"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "skeldran", birthYear: 577, apparentAge: 51, skinTone: "light_weathered", faceFamily: "skeldran_northwestern_m_older_01", eyeColor: "gray", hairColor: "gray_blond", hairTexture: "wavy", hairStyle: "windblown_medium", facialHair: "full_graying_beard", build: "broad", permanentMarks: ["weathering"], clothingCulture: "skeldran", occupationPresentation: "senior_naval_command", rankPresentation: "admiral", wealthPresentation: "professional", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.skeldra.male.storm_admiral.01" }
    },
    {
        portraitId: "portrait.skeldra.male.naval_duelist.01",
        assetId: "character.skeldra.player.male.naval_duelist.01",
        ancestryTags: ["skeldran"], cultureTags: ["skeldran"], religionTags: generalFaiths,
        homelandRegionTags: ["skeldra"], homeSettlementTags: ["port.veyrholm", "port.stormvik"], sex: "male", ageBand: "young_adult",
        professionTags: ["marine", "sailor", "gunner"], socialTags: ["naval_family", "dockside_poor", "artisan_household"],
        backgroundTags: ["former_naval_midshipman", "shipwreck_survivor"],
        presentationTags: ["duelist", "junior_officer", "martial"], poseTags: ["close_three_quarter", "alert"], environmentTags: ["harbor_wall", "sun_break"], lightingTags: ["cool_bright"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "skeldran", birthYear: 602, apparentAge: 26, skinTone: "light", faceFamily: "skeldran_northwestern_m_young_02", eyeColor: "green_gray", hairColor: "dark_brown", hairTexture: "wavy", hairStyle: "medium_tied_back", facialHair: "short_moustache_beard", build: "athletic", permanentMarks: [], clothingCulture: "skeldran", occupationPresentation: "naval_duelist", rankPresentation: "junior_officer", wealthPresentation: "working_professional", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.skeldra.male.naval_duelist.01" }
    },
    {
        portraitId: "portrait.skeldra.female.elder_priestess.02",
        assetId: "character.skeldra.player.female.elder_priestess.02",
        ancestryTags: ["skeldran"], cultureTags: ["skeldran"], religionTags: ["old_gods"],
        homelandRegionTags: ["skeldra"], homeSettlementTags: ["port.thorenfjord", "port.stormvik"], sex: "female", ageBand: "mature",
        professionTags: ["priest", "scholar", "healer"], socialTags: ["clerical_household", "rural_household"],
        backgroundTags: ["temple_educated", "raised_by_monks"],
        presentationTags: ["ritual_authority", "old_gods", "traditionalist"], poseTags: ["standing", "direct_gaze"], environmentTags: ["storm_coast", "sacred_harbor"], lightingTags: ["overcast_cold"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "skeldran", birthYear: 570, apparentAge: 58, skinTone: "light_weathered_age", faceFamily: "skeldran_northwestern_f_elder_02", eyeColor: "pale_blue", hairColor: "silver_gray", hairTexture: "wavy", hairStyle: "braided_pinned", facialHair: "none", build: "sturdy", permanentMarks: ["age_lines"], clothingCulture: "skeldran", occupationPresentation: "old_gods_priestess", rankPresentation: "religious_elder", wealthPresentation: "modest_respected", religionPresentation: "old_gods", visibleSymbols: ["ancestral_jewelry"], industrialAffinity: "low", arcaneAffinity: "ritual", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: ["ritual_braids"], appearanceSeed: "portrait.skeldra.female.elder_priestess.02" }
    },
    {
        portraitId: "portrait.skeldra.female.harbor_noble.02",
        assetId: "character.skeldra.player.female.harbor_noble.02",
        ancestryTags: ["skeldran"], cultureTags: ["skeldran"], religionTags: northwesternFaiths,
        homelandRegionTags: ["skeldra"], homeSettlementTags: ["port.veyrholm", "port.thorenfjord"], sex: "female", ageBand: "adult",
        professionTags: ["merchant_clerk", "scholar", "navigator"], socialTags: ["minor_nobility", "merchant_family"],
        backgroundTags: ["disgraced_noble", "temple_educated"],
        presentationTags: ["upper_class", "restrained_status", "harbor_gentry"], poseTags: ["standing_profile"], environmentTags: ["misty_capital_harbor"], lightingTags: ["cold_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "skeldran", birthYear: 594, apparentAge: 34, skinTone: "fair_cold_weather", faceFamily: "skeldran_northwestern_f_03", eyeColor: "gray_blue", hairColor: "dark_brown", hairTexture: "wavy", hairStyle: "pinned_up", facialHair: "none", build: "lean", permanentMarks: [], clothingCulture: "skeldran", occupationPresentation: "harbor_noble", rankPresentation: "gentry", wealthPresentation: "wealthy", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.skeldra.female.harbor_noble.02" }
    },
    {
        portraitId: "portrait.skeldra.male.maproom_captain.02",
        assetId: "character.skeldra.player.male.maproom_captain.02",
        ancestryTags: ["skeldran"], cultureTags: ["skeldran"], religionTags: northwesternFaiths,
        homelandRegionTags: ["skeldra"], homeSettlementTags: ["port.veyrholm", "port.stormvik"], sex: "male", ageBand: "mature",
        professionTags: ["navigator", "sailor", "merchant_clerk"], socialTags: ["naval_family", "merchant_family"],
        backgroundTags: ["former_naval_midshipman", "shipwreck_survivor"],
        presentationTags: ["experienced_captain", "literate", "command"], poseTags: ["seated"], environmentTags: ["harbor_maproom", "charts_and_papers"], lightingTags: ["warm_interior"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "skeldran", birthYear: 581, apparentAge: 47, skinTone: "light_weathered", faceFamily: "skeldran_northwestern_m_older_02", eyeColor: "steel_gray", hairColor: "gray_brown", hairTexture: "straight_wavy", hairStyle: "short_working", facialHair: "full_beard", build: "broad", permanentMarks: ["weathering"], clothingCulture: "skeldran", occupationPresentation: "captain_navigator", rankPresentation: "captain", wealthPresentation: "comfortable", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.skeldra.male.maproom_captain.02" }
    },
    {
        portraitId: "portrait.skeldra.male.young_shipwright.02",
        assetId: "character.skeldra.player.male.young_shipwright.02",
        ancestryTags: ["skeldran"], cultureTags: ["skeldran"], religionTags: northwesternFaiths,
        homelandRegionTags: ["skeldra"], homeSettlementTags: ["port.ironhaven", "port.veyrholm"], sex: "male", ageBand: "young_adult",
        professionTags: ["shipwright", "apprentice_engineer", "dockworker"], socialTags: ["artisan_household", "dockside_poor"],
        backgroundTags: ["engineers_apprentice", "foundry_child"],
        presentationTags: ["industrial_professional", "blueprints", "working_harbor"], poseTags: ["standing"], environmentTags: ["shipyard_office", "working_quay"], lightingTags: ["window_daylight_industrial"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "skeldran", birthYear: 605, apparentAge: 23, skinTone: "fair", faceFamily: "skeldran_northwestern_m_young_03", eyeColor: "gray_green", hairColor: "brown", hairTexture: "wavy", hairStyle: "windswept_short", facialHair: "clean_shaven", build: "lean", permanentMarks: [], clothingCulture: "skeldran", occupationPresentation: "shipwright_apprentice", rankPresentation: "junior_professional", wealthPresentation: "working", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "advanced", arcaneAffinity: "low", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.skeldra.male.young_shipwright.02" }
    },
    {
        portraitId: "portrait.asteria.female.sun_priestess.01",
        assetId: "character.asteria.player.female.sun_priestess.01",
        ancestryTags: ["asterian"], cultureTags: ["asterian"], religionTags: pantheonFaiths,
        homelandRegionTags: ["asteria"], homeSettlementTags: ["settlement.delphara", "settlement.asterra"], sex: "female", ageBand: "adult",
        professionTags: ["priest", "scholar", "healer"], socialTags: ["clerical_household", "merchant_family"],
        backgroundTags: ["temple_educated", "raised_by_monks"],
        presentationTags: ["sun_priestess", "literate", "harbor_temple"], poseTags: ["standing"], environmentTags: ["sunlit_harbor", "temple_terrace"], lightingTags: ["bright_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "asterian", birthYear: 595, apparentAge: 33, skinTone: "olive_sun_touched", faceFamily: "asterian_f_priestess_01", eyeColor: "brown", hairColor: "dark_brown", hairTexture: "curly_wavy", hairStyle: "formal_braids", facialHair: "none", build: "average", permanentMarks: [], clothingCulture: "asterian", occupationPresentation: "pantheon_priestess", rankPresentation: "religious_officiant", wealthPresentation: "comfortable", religionPresentation: "pantheon", visibleSymbols: ["sun_medallion"], industrialAffinity: "ordinary", arcaneAffinity: "ritual", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: ["temple_jewelry"], appearanceSeed: "portrait.asteria.female.sun_priestess.01" }
    },
    {
        portraitId: "portrait.asteria.female.scholarly_noble.01",
        assetId: "character.asteria.player.female.scholarly_noble.01",
        ancestryTags: ["asterian"], cultureTags: ["asterian"], religionTags: asterianFaiths,
        homelandRegionTags: ["asteria"], homeSettlementTags: ["settlement.asterra", "settlement.aurelia"], sex: "female", ageBand: "adult",
        professionTags: ["scholar", "merchant_clerk", "navigator"], socialTags: ["minor_nobility", "merchant_family"],
        backgroundTags: ["temple_educated", "disgraced_noble"],
        presentationTags: ["upper_class", "scholarly", "harbor_view"], poseTags: ["looking_over_shoulder"], environmentTags: ["high_harbor_terrace"], lightingTags: ["bright_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "asterian", birthYear: 596, apparentAge: 32, skinTone: "olive_fair", faceFamily: "asterian_f_scholar_01", eyeColor: "hazel", hairColor: "black", hairTexture: "wavy", hairStyle: "pinned_braided", facialHair: "none", build: "lean", permanentMarks: [], clothingCulture: "asterian", occupationPresentation: "scholarly_noble", rankPresentation: "gentry", wealthPresentation: "wealthy", religionPresentation: "unaffiliated", visibleSymbols: ["book_bundle"], industrialAffinity: "ordinary", arcaneAffinity: "learned", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.asteria.female.scholarly_noble.01" }
    },
    {
        portraitId: "portrait.asteria.male.sunsealed_captain.01",
        assetId: "character.asteria.player.male.sunsealed_captain.01",
        ancestryTags: ["asterian"], cultureTags: ["asterian"], religionTags: asterianFaiths,
        homelandRegionTags: ["asteria"], homeSettlementTags: ["settlement.rhadessa", "settlement.korinthos"], sex: "male", ageBand: "adult",
        professionTags: ["sailor", "navigator", "marine"], socialTags: ["naval_family", "merchant_family"],
        backgroundTags: ["former_naval_midshipman", "shipwreck_survivor"],
        presentationTags: ["independent_captain", "harbor_command"], poseTags: ["standing"], environmentTags: ["sunlit_harbor", "ship_balcony"], lightingTags: ["bright_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "asterian", birthYear: 590, apparentAge: 38, skinTone: "olive_weathered", faceFamily: "asterian_m_captain_01", eyeColor: "brown", hairColor: "dark_brown", hairTexture: "curly", hairStyle: "short_curl", facialHair: "short_beard", build: "athletic", permanentMarks: ["sun_weathering"], clothingCulture: "asterian", occupationPresentation: "harbor_captain", rankPresentation: "captain", wealthPresentation: "comfortable", religionPresentation: "unaffiliated", visibleSymbols: ["sun_seal_brooch"], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.asteria.male.sunsealed_captain.01" }
    },
    {
        portraitId: "portrait.asteria.male.contemplative_statesman.01",
        assetId: "character.asteria.player.male.contemplative_statesman.01",
        ancestryTags: ["asterian"], cultureTags: ["asterian"], religionTags: asterianFaiths,
        homelandRegionTags: ["asteria"], homeSettlementTags: ["settlement.asterra", "settlement.aurelia"], sex: "male", ageBand: "mature",
        professionTags: ["scholar", "merchant_clerk", "navigator"], socialTags: ["minor_nobility", "merchant_family", "clerical_household"],
        backgroundTags: ["temple_educated", "disgraced_noble"],
        presentationTags: ["statesman", "literate", "upper_class"], poseTags: ["seated"], environmentTags: ["marble_loggia", "harbor_view"], lightingTags: ["soft_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "asterian", birthYear: 576, apparentAge: 52, skinTone: "light_olive", faceFamily: "asterian_m_statesman_01", eyeColor: "brown", hairColor: "white", hairTexture: "wavy", hairStyle: "trimmed", facialHair: "short_beard", build: "average", permanentMarks: ["age_lines"], clothingCulture: "asterian", occupationPresentation: "statesman_scholar", rankPresentation: "senior_patrician", wealthPresentation: "wealthy", religionPresentation: "unaffiliated", visibleSymbols: ["folio"], industrialAffinity: "ordinary", arcaneAffinity: "learned", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.asteria.male.contemplative_statesman.01" }
    },
    {
        portraitId: "portrait.serathi.female.fisherwoman.01",
        assetId: "character.serathi.player.female.fisherwoman.01",
        ancestryTags: ["serathi"], cultureTags: ["serathi"], religionTags: serathiFaiths,
        homelandRegionTags: ["serath"], homeSettlementTags: ["settlement.tyras", "settlement.japhra"], sex: "female", ageBand: "young_adult",
        professionTags: ["sailor", "dockworker", "smuggler"], socialTags: ["dockside_poor", "rural_household"],
        backgroundTags: ["shipwreck_survivor", "raised_among_smugglers"],
        presentationTags: ["working_maritime", "warm_harbor"], poseTags: ["seated"], environmentTags: ["harbor_market", "nets"], lightingTags: ["bright_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "serathi", birthYear: 606, apparentAge: 22, skinTone: "bronze_sun_touched", faceFamily: "serathi_f_young_01", eyeColor: "brown", hairColor: "dark_brown", hairTexture: "curly", hairStyle: "headscarf_tied", facialHair: "none", build: "lean", permanentMarks: [], clothingCulture: "serathi", occupationPresentation: "fisherwoman", rankPresentation: "common", wealthPresentation: "working", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.serathi.female.fisherwoman.01" }
    },
    {
        portraitId: "portrait.serathi.female.quartermaster.01",
        assetId: "character.serathi.player.female.quartermaster.01",
        ancestryTags: ["serathi"], cultureTags: ["serathi"], religionTags: serathiFaiths,
        homelandRegionTags: ["serath"], homeSettlementTags: ["settlement.antiochara", "settlement.tyras"], sex: "female", ageBand: "adult",
        professionTags: ["sailor", "merchant_clerk", "navigator"], socialTags: ["merchant_family", "dockside_poor"],
        backgroundTags: ["raised_among_smugglers", "shipwreck_survivor"],
        presentationTags: ["quartermaster", "practical", "harbor_trade"], poseTags: ["standing"], environmentTags: ["working_quay", "trade_banners"], lightingTags: ["golden_hour"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "serathi", birthYear: 593, apparentAge: 35, skinTone: "olive_bronze", faceFamily: "serathi_f_quartermaster_01", eyeColor: "hazel", hairColor: "black", hairTexture: "curly", hairStyle: "working_loose", facialHair: "none", build: "athletic", permanentMarks: ["weathering"], clothingCulture: "serathi", occupationPresentation: "quartermaster", rankPresentation: "senior_crew", wealthPresentation: "working_professional", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.serathi.female.quartermaster.01" }
    },
    {
        portraitId: "portrait.serathi.male.dockworker.01",
        assetId: "character.serathi.player.male.dockworker.01",
        ancestryTags: ["serathi"], cultureTags: ["serathi"], religionTags: serathiFaiths,
        homelandRegionTags: ["serath"], homeSettlementTags: ["settlement.tyras", "settlement.antiochara"], sex: "male", ageBand: "adult",
        professionTags: ["dockworker", "sailor", "shipwright"], socialTags: ["dockside_poor", "artisan_household"],
        backgroundTags: ["foundry_child", "shipwreck_survivor"],
        presentationTags: ["working_class", "cargo_labor"], poseTags: ["standing"], environmentTags: ["busy_harbor"], lightingTags: ["bright_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "serathi", birthYear: 592, apparentAge: 36, skinTone: "sun_weathered", faceFamily: "serathi_m_worker_01", eyeColor: "brown", hairColor: "black", hairTexture: "wavy", hairStyle: "close_cropped", facialHair: "short_beard", build: "broad", permanentMarks: ["weathering"], clothingCulture: "serathi", occupationPresentation: "dockworker", rankPresentation: "common", wealthPresentation: "working", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.serathi.male.dockworker.01" }
    },
    {
        portraitId: "portrait.serathi.male.harbor_merchant.01",
        assetId: "character.serathi.player.male.harbor_merchant.01",
        ancestryTags: ["serathi"], cultureTags: ["serathi"], religionTags: serathiFaiths,
        homelandRegionTags: ["serath"], homeSettlementTags: ["settlement.antiochara", "settlement.aurel"], sex: "male", ageBand: "mature",
        professionTags: ["merchant_clerk", "smuggler", "scholar"], socialTags: ["merchant_family", "minor_nobility"],
        backgroundTags: ["disgraced_noble", "raised_among_smugglers"],
        presentationTags: ["merchant", "ledger_trade", "prosperous"], poseTags: ["standing"], environmentTags: ["market_stall", "sunlit_harbor"], lightingTags: ["warm_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "serathi", birthYear: 579, apparentAge: 49, skinTone: "olive_weathered", faceFamily: "serathi_m_merchant_01", eyeColor: "brown", hairColor: "dark_brown", hairTexture: "wavy", hairStyle: "trimmed", facialHair: "short_beard", build: "average", permanentMarks: ["age_lines"], clothingCulture: "serathi", occupationPresentation: "harbor_merchant", rankPresentation: "merchant", wealthPresentation: "prosperous", religionPresentation: "unaffiliated", visibleSymbols: ["coin_scale"], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.serathi.male.harbor_merchant.01" }
    },
    {
        portraitId: "portrait.kaishin.female.merchant_matriarch.01",
        assetId: "character.kaishin.player.female.merchant_matriarch.01",
        ancestryTags: ["kaishin"], cultureTags: ["kaishin"], religionTags: kaishinFaiths,
        homelandRegionTags: ["kaishin"], homeSettlementTags: ["settlement.nagara", "settlement.hanzhou"], sex: "female", ageBand: "mature",
        professionTags: ["merchant_clerk", "scholar", "navigator"], socialTags: ["merchant_family", "minor_nobility"],
        backgroundTags: ["temple_educated", "disgraced_noble"],
        presentationTags: ["merchant_matriarch", "ledger_trade"], poseTags: ["standing"], environmentTags: ["trade_counter", "busy_port"], lightingTags: ["soft_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "kaishin", birthYear: 575, apparentAge: 53, skinTone: "fair_warm", faceFamily: "kaishin_f_matriarch_01", eyeColor: "dark_brown", hairColor: "black_gray", hairTexture: "straight", hairStyle: "formal_updo", facialHair: "none", build: "average", permanentMarks: ["age_lines"], clothingCulture: "kaishin", occupationPresentation: "merchant_matriarch", rankPresentation: "merchant_elder", wealthPresentation: "prosperous", religionPresentation: "unaffiliated", visibleSymbols: ["abacus_scroll"], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.kaishin.female.merchant_matriarch.01" }
    },
    {
        portraitId: "portrait.kaishin.male.naval_officer.01",
        assetId: "character.kaishin.player.male.naval_officer.01",
        ancestryTags: ["kaishin"], cultureTags: ["kaishin"], religionTags: kaishinFaiths,
        homelandRegionTags: ["kaishin"], homeSettlementTags: ["settlement.kaishin", "settlement.nagara"], sex: "male", ageBand: "adult",
        professionTags: ["navigator", "marine", "sailor"], socialTags: ["naval_family", "minor_nobility"],
        backgroundTags: ["former_naval_midshipman", "temple_educated"],
        presentationTags: ["naval_officer", "disciplined"], poseTags: ["standing"], environmentTags: ["misty_harbor"], lightingTags: ["overcast_cool"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "kaishin", birthYear: 592, apparentAge: 36, skinTone: "fair", faceFamily: "kaishin_m_officer_01", eyeColor: "brown", hairColor: "black", hairTexture: "straight", hairStyle: "topknot_short", facialHair: "short_goatee", build: "athletic", permanentMarks: [], clothingCulture: "kaishin", occupationPresentation: "naval_officer", rankPresentation: "officer", wealthPresentation: "professional", religionPresentation: "unaffiliated", visibleSymbols: ["duty_sash"], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.kaishin.male.naval_officer.01" }
    },
    {
        portraitId: "portrait.kaishin.male.ferryman.01",
        assetId: "character.kaishin.player.male.ferryman.01",
        ancestryTags: ["kaishin"], cultureTags: ["kaishin"], religionTags: wheelFaiths,
        homelandRegionTags: ["kaishin"], homeSettlementTags: ["settlement.hanzhou", "settlement.tenzan"], sex: "male", ageBand: "mature",
        professionTags: ["sailor", "navigator", "priest"], socialTags: ["rural_household", "dockside_poor"],
        backgroundTags: ["raised_by_monks", "shipwreck_survivor"],
        presentationTags: ["ferryman", "humble", "turning_wheel"], poseTags: ["standing"], environmentTags: ["harbor_edge"], lightingTags: ["bright_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "kaishin", birthYear: 579, apparentAge: 49, skinTone: "weathered_fair", faceFamily: "kaishin_m_elder_01", eyeColor: "dark_brown", hairColor: "black_gray", hairTexture: "straight", hairStyle: "shaven_topknot", facialHair: "short_beard", build: "wiry", permanentMarks: ["weathering"], clothingCulture: "kaishin", occupationPresentation: "ferryman", rankPresentation: "common", wealthPresentation: "working", religionPresentation: "turning_wheel", visibleSymbols: ["turning_wheel_token"], industrialAffinity: "ordinary", arcaneAffinity: "spiritual", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.kaishin.male.ferryman.01" }
    },
    {
        portraitId: "portrait.kaishin.female.harbor_healer.01",
        assetId: "character.kaishin.player.female.harbor_healer.01",
        ancestryTags: ["kaishin"], cultureTags: ["kaishin"], religionTags: kaishinFaiths,
        homelandRegionTags: ["kaishin"], homeSettlementTags: ["settlement.tenzan", "settlement.hanzhou"], sex: "female", ageBand: "mature",
        professionTags: ["healer", "scholar", "priest"], socialTags: ["clerical_household", "artisan_household"],
        backgroundTags: ["raised_by_monks", "temple_educated"],
        presentationTags: ["healer", "practical_care"], poseTags: ["leaning_forward"], environmentTags: ["apothecary_stall", "harbor_clinic"], lightingTags: ["soft_interior"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "kaishin", birthYear: 573, apparentAge: 55, skinTone: "fair_warm", faceFamily: "kaishin_f_healer_01", eyeColor: "dark_brown", hairColor: "gray", hairTexture: "straight", hairStyle: "simple_bun", facialHair: "none", build: "average", permanentMarks: ["age_lines"], clothingCulture: "kaishin", occupationPresentation: "harbor_healer", rankPresentation: "respected_practitioner", wealthPresentation: "modest_respected", religionPresentation: "turning_wheel", visibleSymbols: ["herbal_bandages"], industrialAffinity: "ordinary", arcaneAffinity: "ritual", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.kaishin.female.harbor_healer.01" }
    },
    {
        portraitId: "portrait.vesperan.female.merchantess.01",
        assetId: "character.vesperan.player.female.merchantess.01",
        ancestryTags: ["serathi", "mixed"], cultureTags: ["vesperan"], religionTags: vesperanFaiths,
        homelandRegionTags: ["crossroads"], homeSettlementTags: ["settlement.vespera", "settlement.ardaran"], sex: "female", ageBand: "adult",
        professionTags: ["merchant_clerk", "scholar", "smuggler"], socialTags: ["merchant_family", "minor_nobility"],
        backgroundTags: ["disgraced_noble", "raised_among_smugglers"],
        presentationTags: ["merchant", "crossroads_trade"], poseTags: ["standing"], environmentTags: ["harbor_office"], lightingTags: ["soft_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "serathi", birthYear: 592, apparentAge: 36, skinTone: "olive_fair", faceFamily: "vesperan_f_merchant_01", eyeColor: "brown", hairColor: "gray_black", hairTexture: "wavy", hairStyle: "tied_back", facialHair: "none", build: "average", permanentMarks: [], clothingCulture: "vesperan", occupationPresentation: "merchantess", rankPresentation: "merchant", wealthPresentation: "comfortable", religionPresentation: "unaffiliated", visibleSymbols: ["ledger"], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.vesperan.female.merchantess.01" }
    },
    {
        portraitId: "portrait.vesperan.female.harbor_lookout.01",
        assetId: "character.vesperan.player.female.harbor_lookout.01",
        ancestryTags: ["serathi", "mixed"], cultureTags: ["vesperan"], religionTags: serathiFaiths,
        homelandRegionTags: ["crossroads"], homeSettlementTags: ["settlement.vespera", "settlement.ardaran"], sex: "female", ageBand: "young_adult",
        professionTags: ["sailor", "merchant_clerk", "smuggler"], socialTags: ["dockside_poor", "criminal_household"],
        backgroundTags: ["raised_among_smugglers", "shipwreck_survivor"],
        presentationTags: ["lookout", "nimble", "crossroads_harbor"], poseTags: ["crouched"], environmentTags: ["harbor_wall"], lightingTags: ["bright_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "serathi", birthYear: 606, apparentAge: 22, skinTone: "olive_sun_touched", faceFamily: "vesperan_f_young_01", eyeColor: "hazel", hairColor: "dark_brown", hairTexture: "wavy", hairStyle: "loose_braids", facialHair: "none", build: "lean", permanentMarks: [], clothingCulture: "vesperan", occupationPresentation: "lookout", rankPresentation: "common", wealthPresentation: "working", religionPresentation: "unaffiliated", visibleSymbols: [], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.vesperan.female.harbor_lookout.01" }
    },
    {
        portraitId: "portrait.vesperan.male.customs_magistrate.01",
        assetId: "character.vesperan.player.male.customs_magistrate.01",
        ancestryTags: ["serathi", "mixed"], cultureTags: ["vesperan"], religionTags: vesperanFaiths,
        homelandRegionTags: ["crossroads"], homeSettlementTags: ["settlement.vespera", "settlement.ardaran"], sex: "male", ageBand: "mature",
        professionTags: ["merchant_clerk", "scholar", "navigator"], socialTags: ["minor_nobility", "merchant_family", "clerical_household"],
        backgroundTags: ["temple_educated", "disgraced_noble"],
        presentationTags: ["civic_official", "customs"], poseTags: ["seated"], environmentTags: ["customs_desk"], lightingTags: ["soft_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "serathi", birthYear: 578, apparentAge: 50, skinTone: "olive", faceFamily: "vesperan_m_official_01", eyeColor: "brown", hairColor: "black", hairTexture: "wavy", hairStyle: "short_formal", facialHair: "moustache", build: "stocky", permanentMarks: ["age_lines"], clothingCulture: "vesperan", occupationPresentation: "customs_magistrate", rankPresentation: "civic_official", wealthPresentation: "prosperous", religionPresentation: "unaffiliated", visibleSymbols: ["customs_medallion"], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.vesperan.male.customs_magistrate.01" }
    },
    {
        portraitId: "portrait.vesperan.male.harbor_courier.01",
        assetId: "character.vesperan.player.male.harbor_courier.01",
        ancestryTags: ["serathi", "mixed"], cultureTags: ["vesperan"], religionTags: vesperanFaiths,
        homelandRegionTags: ["crossroads"], homeSettlementTags: ["settlement.vespera"], sex: "male", ageBand: "young_adult",
        professionTags: ["merchant_clerk", "sailor", "smuggler"], socialTags: ["dockside_poor", "merchant_family"],
        backgroundTags: ["raised_among_smugglers", "former_naval_midshipman"],
        presentationTags: ["courier", "crossroads_messenger"], poseTags: ["mid_stride"], environmentTags: ["harbor_steps"], lightingTags: ["bright_daylight"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "serathi", birthYear: 603, apparentAge: 25, skinTone: "olive", faceFamily: "vesperan_m_young_01", eyeColor: "brown", hairColor: "dark_brown", hairTexture: "curly", hairStyle: "windswept_short", facialHair: "clean_shaven", build: "lean", permanentMarks: [], clothingCulture: "vesperan", occupationPresentation: "harbor_courier", rankPresentation: "common", wealthPresentation: "working", religionPresentation: "unaffiliated", visibleSymbols: ["sealed_letter"], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: [], ceremonialMarks: [], appearanceSeed: "portrait.vesperan.male.harbor_courier.01" }
    },
    {
        portraitId: "portrait.outer_isles.female.stormbound_captain.01",
        assetId: "character.outer_isles.player.female.stormbound_captain.01",
        ancestryTags: ["skeldran", "mixed"], cultureTags: ["outer_isles"], religionTags: outerIslesFaiths,
        homelandRegionTags: ["outer_isles"], homeSettlementTags: ["settlement.blackhaven"], sex: "female", ageBand: "adult",
        professionTags: ["sailor", "smuggler", "navigator"], socialTags: ["criminal_household", "dockside_poor"],
        backgroundTags: ["raised_among_smugglers", "shipwreck_survivor"],
        presentationTags: ["privateer", "ragtag", "hard_coast"], poseTags: ["standing"], environmentTags: ["dark_coast_harbor"], lightingTags: ["rainy_dusk"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "skeldran", birthYear: 594, apparentAge: 34, skinTone: "weathered_light", faceFamily: "outerisles_f_captain_01", eyeColor: "gray", hairColor: "dark_brown", hairTexture: "wavy", hairStyle: "loose_practical", facialHair: "none", build: "athletic", permanentMarks: ["weathering"], clothingCulture: "outer_isles", occupationPresentation: "privateer_captain", rankPresentation: "captain", wealthPresentation: "rough_prosperous", religionPresentation: "unaffiliated", visibleSymbols: ["spiral_token"], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: ["small_coast_tattoo"], ceremonialMarks: [], appearanceSeed: "portrait.outer_isles.female.stormbound_captain.01" }
    },
    {
        portraitId: "portrait.outer_isles.female.helmswoman.01",
        assetId: "character.outer_isles.player.female.helmswoman.01",
        ancestryTags: ["skeldran", "mixed"], cultureTags: ["outer_isles"], religionTags: outerIslesFaiths,
        homelandRegionTags: ["outer_isles"], homeSettlementTags: ["settlement.blackhaven"], sex: "female", ageBand: "adult",
        professionTags: ["navigator", "sailor", "smuggler"], socialTags: ["dockside_poor", "criminal_household"],
        backgroundTags: ["raised_among_smugglers", "former_naval_midshipman"],
        presentationTags: ["helmswoman", "storm_crew"], poseTags: ["braced"], environmentTags: ["ship_wheel", "storm_harbor"], lightingTags: ["storm_light"], status: "PROVISIONAL",
        visualDna: { sex: "female", ancestryPrimary: "skeldran", birthYear: 597, apparentAge: 31, skinTone: "weathered_light", faceFamily: "outerisles_f_helmswoman_01", eyeColor: "gray_green", hairColor: "dark_brown", hairTexture: "wavy", hairStyle: "storm_loose", facialHair: "none", build: "athletic", permanentMarks: ["weathering"], clothingCulture: "outer_isles", occupationPresentation: "helmswoman", rankPresentation: "senior_crew", wealthPresentation: "working_professional", religionPresentation: "unaffiliated", visibleSymbols: ["spiral_token"], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: ["wrist_knotwork"], ceremonialMarks: [], appearanceSeed: "portrait.outer_isles.female.helmswoman.01" }
    },
    {
        portraitId: "portrait.outer_isles.male.harbor_merchant.01",
        assetId: "character.outer_isles.player.male.harbor_merchant.01",
        ancestryTags: ["asterian", "mixed"], cultureTags: ["outer_isles"], religionTags: outerMerchantFaiths,
        homelandRegionTags: ["outer_isles"], homeSettlementTags: ["settlement.blackhaven"], sex: "male", ageBand: "mature",
        professionTags: ["merchant_clerk", "smuggler", "navigator"], socialTags: ["merchant_family", "criminal_household"],
        backgroundTags: ["raised_among_smugglers", "disgraced_noble"],
        presentationTags: ["merchant", "ragtag_prosperity"], poseTags: ["seated"], environmentTags: ["dark_quay_office"], lightingTags: ["lanternlit"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "asterian", birthYear: 579, apparentAge: 49, skinTone: "weathered_olive", faceFamily: "outerisles_m_merchant_01", eyeColor: "brown", hairColor: "brown_gray", hairTexture: "wavy", hairStyle: "windblown_medium", facialHair: "full_beard", build: "broad", permanentMarks: ["weathering"], clothingCulture: "outer_isles", occupationPresentation: "outer_isles_merchant", rankPresentation: "merchant", wealthPresentation: "rough_prosperous", religionPresentation: "unaffiliated", visibleSymbols: ["spiral_token"], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: ["small_hand_tattoo"], ceremonialMarks: [], appearanceSeed: "portrait.outer_isles.male.harbor_merchant.01" }
    },
    {
        portraitId: "portrait.outer_isles.male.privateer.01",
        assetId: "character.outer_isles.player.male.privateer.01",
        ancestryTags: ["skeldran", "asterian", "mixed"], cultureTags: ["outer_isles"], religionTags: outerIslesFaiths,
        homelandRegionTags: ["outer_isles"], homeSettlementTags: ["settlement.blackhaven"], sex: "male", ageBand: "adult",
        professionTags: ["smuggler", "marine", "sailor"], socialTags: ["criminal_household", "dockside_poor"],
        backgroundTags: ["raised_among_smugglers", "shipwreck_survivor"],
        presentationTags: ["privateer", "storm_crew", "ragtag"], poseTags: ["braced"], environmentTags: ["storm_harbor", "ship_wheel"], lightingTags: ["storm_light"], status: "PROVISIONAL",
        visualDna: { sex: "male", ancestryPrimary: "skeldran", birthYear: 590, apparentAge: 38, skinTone: "weathered_mixed", faceFamily: "outerisles_m_privateer_01", eyeColor: "gray", hairColor: "dark_brown", hairTexture: "wavy", hairStyle: "loose_windswept", facialHair: "short_beard", build: "broad", permanentMarks: ["weathering"], clothingCulture: "outer_isles", occupationPresentation: "privateer", rankPresentation: "senior_crew", wealthPresentation: "working_professional", religionPresentation: "unaffiliated", visibleSymbols: ["spiral_token"], industrialAffinity: "ordinary", arcaneAffinity: "ordinary", prosthetics: [], corruptionMarks: [], tattoos: ["coast_tattoos"], ceremonialMarks: [], appearanceSeed: "portrait.outer_isles.male.privateer.01" }
    }
];
export const PORTRAIT_BY_ID = Object.fromEntries(PORTRAIT_CHOICES.map((portrait) => [portrait.portraitId, portrait]));
//# sourceMappingURL=portraits.js.map