export type ArtRegionType =
  | "equipment_slot"
  | "inventory_area"
  | "button"
  | "text_area"
  | "portrait"
  | "viewport"
  | "ship_slot"
  | "map_area"
  | "hitbox"
  | "anchor"
  | "tooltip_origin";

export type ArtRegionScroll = "none" | "auto" | "paged";
export type ArtScreenScroll = "none" | "host" | "region_only";
export type ArtShellMode = "main_content" | "full_screen";
export type ArtFitMode = "contain";

export interface NormalizedPoint {
  x: number;
  y: number;
}

export interface NormalizedRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ArtLayoutRegion extends NormalizedRect {
  id: string;
  type: ArtRegionType;
  label?: string;
  anchor?: NormalizedPoint;
  acceptedItemTypes?: string[];
  enabled?: boolean;
  scroll?: ArtRegionScroll;
}

/**
 * Screen-level presentation contract. Geometry is normalized to the runtime base art.
 * `assetId` remains as the runtime-base alias for backwards compatibility with Hotfix 8.
 */
export interface ArtLayoutManifest {
  layoutId: string;
  assetId: string;
  referenceAssetId?: string;
  runtimeBaseAssetId?: string;
  /** Source raster dimensions are validation/fidelity data only. They do not determine UI scale. */
  nativeWidth: number;
  nativeHeight: number;
  /** Logical layout dimensions used for viewport fitting and UI scale. */
  logicalWidth?: number;
  logicalHeight?: number;
  shellMode?: ArtShellMode;
  fitMode?: ArtFitMode;
  screenScroll?: ArtScreenScroll;
  minimumReadableScale?: number;
  alternateLayoutId?: string;
  provisionalArt?: boolean;
  notes?: string;
  regions: Record<string, ArtLayoutRegion>;
}

export interface ArtDirectedLayer {
  regionId: string;
  html: string;
  className?: string;
  zIndex?: number;
  pointerEvents?: "auto" | "none";
}

export interface ArtDirectedCanvasOptions {
  manifest: ArtLayoutManifest;
  artPath: string;
  layers?: ArtDirectedLayer[];
  debugMode?: boolean;
  className?: string;
  ariaLabel?: string;
}

export interface ArtScreenHostOptions extends ArtDirectedCanvasOptions {
  hostClassName?: string;
  screenId?: string;
  referenceArtPath?: string;
  referenceLabel?: string;
}
