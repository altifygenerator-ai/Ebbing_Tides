import { equipmentFemaleLayout } from "./character/equipmentFemale.js";
import { equipmentMaleLayout } from "./character/equipmentMale.js";
import type { ArtLayoutManifest } from "./types.js";

export const ART_LAYOUT_REGISTRY: Record<string, ArtLayoutManifest> = Object.fromEntries([
  equipmentMaleLayout,equipmentFemaleLayout
].map((layout)=>[layout.layoutId,layout]));

export function artLayoutById(layoutId: string): ArtLayoutManifest | undefined { return ART_LAYOUT_REGISTRY[layoutId]; }
