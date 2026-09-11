import { mkdirSync, writeFileSync } from 'node:fs';
import { SHIP_CLASS_DEFINITIONS, CONTENT_DEFINITIONS, LEGACY_SHIP_CLASS_ALIASES } from '../public/alpha/js/data/seed/contentRegistry.js';
import { REGIONAL_AVAILABILITY, SETTLEMENT_AVAILABILITY, SETTLEMENT_ECONOMIC_PROFILES } from '../public/alpha/js/data/seed/regionalAvailability.js';

mkdirSync('docs/generated',{recursive:true});
writeFileSync('docs/generated/SHIP_CLASS_REGISTRY.json',JSON.stringify({
  generatedFrom:'Alpha 0.6C compiled runtime registry',
  count:SHIP_CLASS_DEFINITIONS.length,
  legacyAliases:LEGACY_SHIP_CLASS_ALIASES,
  definitions:SHIP_CLASS_DEFINITIONS
},null,2)+'\n');
writeFileSync('docs/generated/ITEM_REGISTRY.json',JSON.stringify({
  generatedFrom:'Alpha 0.6C compiled runtime registry',
  count:CONTENT_DEFINITIONS.length,
  categoryCounts:Object.fromEntries([...new Set(CONTENT_DEFINITIONS.map((row)=>row.category))].sort().map((category)=>[category,CONTENT_DEFINITIONS.filter((row)=>row.category===category).length])),
  definitions:CONTENT_DEFINITIONS
},null,2)+'\n');
writeFileSync('docs/generated/SETTLEMENT_AVAILABILITY.json',JSON.stringify({
  generatedFrom:'Alpha 0.6C compiled runtime registry',
  settlementProfileCount:SETTLEMENT_ECONOMIC_PROFILES.length,
  regionalAvailabilityCount:REGIONAL_AVAILABILITY.length,
  settlementAvailabilityCount:SETTLEMENT_AVAILABILITY.length,
  settlementProfiles:SETTLEMENT_ECONOMIC_PROFILES,
  regionalAvailability:REGIONAL_AVAILABILITY,
  settlementAvailability:SETTLEMENT_AVAILABILITY
},null,2)+'\n');
console.log(`Generated ${SHIP_CLASS_DEFINITIONS.length} ship classes, ${CONTENT_DEFINITIONS.length} content definitions, and ${SETTLEMENT_AVAILABILITY.length} settlement availability rows.`);
