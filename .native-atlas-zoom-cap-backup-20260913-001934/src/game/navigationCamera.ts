import type { GridPoint } from "./types.js";
import { GLOBAL_ATLAS } from "../data/seed/worldMap.js";

export const NAV_CAMERA = {
  minViewWidth: 12,
  defaultViewWidth: 18,
  farViewWidth: 120,
  maxViewWidth: 120,
  aspectRatio: 3 / 2,
  dragThresholdPx: 7,
  zoomWheelSensitivity: 0.0012,
  damping: 0.34
} as const;

export interface NavigationCameraState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  viewWidth: number;
  targetViewWidth: number;
}

export function viewHeightForWidth(viewWidth: number): number {
  return viewWidth / NAV_CAMERA.aspectRatio;
}

export function clampViewWidth(viewWidth: number): number {
  return Math.max(NAV_CAMERA.minViewWidth, Math.min(NAV_CAMERA.maxViewWidth, viewWidth));
}

export function clampCameraCenter(point: GridPoint, viewWidth: number): GridPoint {
  const width = clampViewWidth(viewWidth);
  const height = viewHeightForWidth(width);
  const halfW = width / 2;
  const halfH = height / 2;
  return {
    x: Math.max(halfW, Math.min(GLOBAL_ATLAS.width - halfW, point.x)),
    y: Math.max(halfH, Math.min(GLOBAL_ATLAS.height - halfH, point.y))
  };
}

export function cameraForPoint(point: GridPoint, viewWidth: number = NAV_CAMERA.defaultViewWidth): NavigationCameraState {
  const width = clampViewWidth(viewWidth);
  const center = clampCameraCenter(point, width);
  return { x: center.x, y: center.y, targetX: center.x, targetY: center.y, viewWidth: width, targetViewWidth: width };
}


export function cameraForPoints(points: GridPoint[], minimumViewWidth = 30, paddingCells = 2): NavigationCameraState {
  if (!points.length) return cameraForPoint({ x: GLOBAL_ATLAS.width / 2, y: GLOBAL_ATLAS.height / 2 }, minimumViewWidth);
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const spanX = Math.max(1, maxX - minX + paddingCells * 2);
  const spanY = Math.max(1, maxY - minY + paddingCells * 2);
  const width = clampViewWidth(Math.max(minimumViewWidth, spanX, spanY * NAV_CAMERA.aspectRatio));
  return cameraForPoint({ x: (minX + maxX) / 2, y: (minY + maxY) / 2 }, width);
}

export function cameraViewBox(camera: Pick<NavigationCameraState, "x" | "y" | "viewWidth">): { x: number; y: number; width: number; height: number } {
  const width = clampViewWidth(camera.viewWidth);
  const height = viewHeightForWidth(width);
  const center = clampCameraCenter({ x: camera.x, y: camera.y }, width);
  return { x: center.x - width / 2, y: center.y - height / 2, width, height };
}

export function cameraLod(viewWidth: number): "far" | "medium" | "navigation" | "close" {
  if (viewWidth >= 36) return "far";
  if (viewWidth >= 24) return "medium";
  if (viewWidth > 14) return "navigation";
  return "close";
}

export function legacyZoomBand(viewWidth: number): "far" | "navigation" | "close" {
  if (viewWidth >= 30) return "far";
  if (viewWidth <= 14) return "close";
  return "navigation";
}

export function regionalLayerOpacity(viewWidth: number): number {
  // Global art owns far strategy. Regional art becomes authoritative for close navigation,
  // with a restrained crossfade to avoid a visible map-pop.
  if (viewWidth >= 38) return 0;
  if (viewWidth <= 30) return 1;
  return (38 - viewWidth) / 8;
}

export function zoomAroundAnchor(
  camera: Pick<NavigationCameraState, "targetX" | "targetY" | "targetViewWidth">,
  anchorWorld: GridPoint,
  anchorFraction: GridPoint,
  requestedViewWidth: number
): { x: number; y: number; viewWidth: number } {
  const nextWidth = clampViewWidth(requestedViewWidth);
  const nextHeight = viewHeightForWidth(nextWidth);
  const nextX = anchorWorld.x - (anchorFraction.x - 0.5) * nextWidth;
  const nextY = anchorWorld.y - (anchorFraction.y - 0.5) * nextHeight;
  const center = clampCameraCenter({ x: nextX, y: nextY }, nextWidth);
  return { x: center.x, y: center.y, viewWidth: nextWidth };
}

export function panCameraTarget(camera: Pick<NavigationCameraState, "targetX" | "targetY" | "targetViewWidth">, dxWorld: number, dyWorld: number): GridPoint {
  return clampCameraCenter({ x: camera.targetX + dxWorld, y: camera.targetY + dyWorld }, camera.targetViewWidth);
}
