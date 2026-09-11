import { equipmentFemaleLayout } from "./character/equipmentFemale.js";
import { equipmentMaleLayout } from "./character/equipmentMale.js";
export const ART_LAYOUT_REGISTRY = Object.fromEntries([
    equipmentMaleLayout, equipmentFemaleLayout
].map((layout) => [layout.layoutId, layout]));
export function artLayoutById(layoutId) { return ART_LAYOUT_REGISTRY[layoutId]; }
//# sourceMappingURL=registry.js.map