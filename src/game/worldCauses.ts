import { PORT_BY_ID } from "../data/seed/ports.js";
import { politicalPowerForRegion } from "../data/seed/politicalPowers.js";
import type { CommodityCategory, EntityId, GameState, WorldCauseEffects, WorldCauseRecord } from "./types.js";

const TERMINAL_HISTORY_LIMIT = 96;
const clampFactor = (value: number | undefined, fallback = 1): number => {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(4, value));
};

function normalizedEffects(effects: WorldCauseEffects | undefined): WorldCauseEffects {
  const input = effects ?? {};
  const normalizeMap = (map: Partial<Record<CommodityCategory, number>>): Partial<Record<CommodityCategory, number>> =>
    Object.fromEntries(Object.entries(map).map(([key, value]) => [key, clampFactor(Number(value))])) as Partial<Record<CommodityCategory, number>>;
  return {
    ...(input.productionMultiplier !== undefined ? { productionMultiplier: clampFactor(input.productionMultiplier) } : {}),
    ...(input.externalSupplyMultiplier !== undefined ? { externalSupplyMultiplier: clampFactor(input.externalSupplyMultiplier) } : {}),
    ...(input.consumptionMultiplier !== undefined ? { consumptionMultiplier: clampFactor(input.consumptionMultiplier) } : {}),
    ...(input.categoryProductionMultipliers !== undefined ? { categoryProductionMultipliers: normalizeMap(input.categoryProductionMultipliers) } : {}),
    ...(input.categoryExternalSupplyMultipliers !== undefined ? { categoryExternalSupplyMultipliers: normalizeMap(input.categoryExternalSupplyMultipliers) } : {}),
    ...(input.categoryConsumptionMultipliers !== undefined ? { categoryConsumptionMultipliers: normalizeMap(input.categoryConsumptionMultipliers) } : {}),
    ...(input.trafficMultiplier !== undefined ? { trafficMultiplier: clampFactor(input.trafficMultiplier) } : {}),
    ...(input.legalReportTransitMultiplier !== undefined ? { legalReportTransitMultiplier: Math.max(0.25, Math.min(4, input.legalReportTransitMultiplier)) } : {}),
    ...(input.contractDemandMultiplier !== undefined ? { contractDemandMultiplier: clampFactor(input.contractDemandMultiplier) } : {})
  };
}

export function worldCauseActiveAtHour(cause: WorldCauseRecord, atHour: number): boolean {
  if (cause.startedAtHour > atHour) return false;
  const end = cause.resolvedAtHour ?? cause.scheduledEndAtHour;
  if (end !== undefined && atHour >= end) return false;
  return cause.status === "active" || (cause.resolvedAtHour !== undefined && atHour < cause.resolvedAtHour);
}

export function worldCauseAppliesToPort(cause: WorldCauseRecord, portId: EntityId): boolean {
  const port = PORT_BY_ID[portId];
  if (!port) return false;
  const scope = cause.scope ?? {};
  const hasScope = Boolean(scope.portIds?.length || scope.regionIds?.length || scope.jurisdictionIds?.length || scope.factionIds?.length);
  if (!hasScope) return true;
  if (scope.portIds?.includes(portId)) return true;
  if (scope.regionIds?.includes(port.region)) return true;
  const power = politicalPowerForRegion(port.region);
  if (scope.jurisdictionIds?.includes(power.jurisdictionId)) return true;
  if (scope.factionIds?.includes(power.factionId)) return true;
  return false;
}

export function activeWorldCauses(state: GameState, atHour = state.absoluteHour): WorldCauseRecord[] {
  normalizeWorldCauseState(state);
  return state.worldCauses.filter((cause) => worldCauseActiveAtHour(cause, atHour));
}

export interface PortCommodityCauseInfluence {
  productionMultiplier: number;
  externalSupplyMultiplier: number;
  consumptionMultiplier: number;
  causeIds: EntityId[];
}

export function worldCauseInfluenceForPortCommodity(
  state: GameState,
  portId: EntityId,
  category: CommodityCategory,
  atHour = state.absoluteHour
): PortCommodityCauseInfluence {
  let productionMultiplier = 1;
  let externalSupplyMultiplier = 1;
  let consumptionMultiplier = 1;
  const causeIds: EntityId[] = [];
  for (const cause of activeWorldCauses(state, atHour)) {
    if (!worldCauseAppliesToPort(cause, portId)) continue;
    const effects = cause.effects ?? {};
    const hasRelevantEffect = effects.productionMultiplier !== undefined
      || effects.externalSupplyMultiplier !== undefined
      || effects.consumptionMultiplier !== undefined
      || effects.categoryProductionMultipliers?.[category] !== undefined
      || effects.categoryExternalSupplyMultipliers?.[category] !== undefined
      || effects.categoryConsumptionMultipliers?.[category] !== undefined;
    if (!hasRelevantEffect) continue;
    productionMultiplier *= clampFactor(effects.productionMultiplier) * clampFactor(effects.categoryProductionMultipliers?.[category]);
    externalSupplyMultiplier *= clampFactor(effects.externalSupplyMultiplier) * clampFactor(effects.categoryExternalSupplyMultipliers?.[category]);
    consumptionMultiplier *= clampFactor(effects.consumptionMultiplier) * clampFactor(effects.categoryConsumptionMultipliers?.[category]);
    causeIds.push(cause.id);
  }
  return {
    productionMultiplier: Math.max(0, Math.min(4, productionMultiplier)),
    externalSupplyMultiplier: Math.max(0, Math.min(4, externalSupplyMultiplier)),
    consumptionMultiplier: Math.max(0, Math.min(4, consumptionMultiplier)),
    causeIds
  };
}

export interface RouteCauseInfluence {
  trafficMultiplier: number;
  causeIds: EntityId[];
}

export function worldCauseInfluenceForRoute(state: GameState, fromPortId: EntityId, toPortId: EntityId, atHour = state.absoluteHour): RouteCauseInfluence {
  let trafficMultiplier = 1;
  const causeIds: EntityId[] = [];
  for (const cause of activeWorldCauses(state, atHour)) {
    if (!worldCauseAppliesToPort(cause, fromPortId) && !worldCauseAppliesToPort(cause, toPortId)) continue;
    if (cause.effects?.trafficMultiplier === undefined) continue;
    trafficMultiplier *= clampFactor(cause.effects.trafficMultiplier);
    causeIds.push(cause.id);
  }
  return { trafficMultiplier: Math.max(0, Math.min(4, trafficMultiplier)), causeIds };
}

export function worldCauseLegalReportTransitForPort(state: GameState, portId: EntityId, atHour = state.absoluteHour): { multiplier:number; causeIds:EntityId[] } {
  let multiplier = 1;
  const causeIds: EntityId[] = [];
  for (const cause of activeWorldCauses(state, atHour)) {
    if (!worldCauseAppliesToPort(cause, portId) || cause.effects?.legalReportTransitMultiplier === undefined) continue;
    multiplier *= Math.max(0.25, Math.min(4, cause.effects.legalReportTransitMultiplier));
    causeIds.push(cause.id);
  }
  return { multiplier: Math.max(0.25, Math.min(4, multiplier)), causeIds };
}

export function worldCauseContractDemandForPort(state: GameState, portId: EntityId, atHour = state.absoluteHour): { multiplier:number; causeIds:EntityId[] } {
  let multiplier = 1;
  const causeIds: EntityId[] = [];
  for (const cause of activeWorldCauses(state, atHour)) {
    if (!worldCauseAppliesToPort(cause, portId) || cause.effects?.contractDemandMultiplier === undefined) continue;
    multiplier *= clampFactor(cause.effects.contractDemandMultiplier);
    causeIds.push(cause.id);
  }
  return { multiplier: Math.max(0, Math.min(4, multiplier)), causeIds };
}

export function worldCausesWithPolicyTag(state: GameState, tag: string, atHour = state.absoluteHour): WorldCauseRecord[] {
  return activeWorldCauses(state, atHour).filter((cause) => cause.policyTags.includes(tag));
}

function informationData(cause: WorldCauseRecord) {
  const info = cause.publicInformation;
  if (!info) return {};
  return {
    publicKnowledge: true,
    informationCategory: info.category,
    informationSource: info.source,
    informationConfidence: Math.max(10, Math.min(100, info.confidence)),
    ...(info.staleAfterHours !== undefined ? { informationStaleHours: Math.max(1, info.staleAfterHours) } : {})
  };
}

export type ActivateWorldCauseInput = Omit<WorldCauseRecord, "startedAtHour" | "status" | "resolvedAtHour" | "resolutionSummary"> & { startedAtHour?: number };

/**
 * Create one authoritative live cause. Consumers read this row; the WorldEvent emitted here is only
 * canonical history/public-news material and never carries a second price/heat/standing mutation.
 */
export function activateWorldCause(state: GameState, input: ActivateWorldCauseInput): { ok:boolean; cause?:WorldCauseRecord; message:string } {
  normalizeWorldCauseState(state);
  if (state.worldCauses.some((row) => row.id === input.id)) return { ok:false, message:"That world cause already exists in campaign history." };
  const startedAtHour = Math.max(0, Math.floor(input.startedAtHour ?? state.absoluteHour));
  const cause: WorldCauseRecord = {
    ...input,
    startedAtHour,
    status:"active",
    scope: structuredClone(input.scope ?? {}),
    effects: normalizedEffects(input.effects),
    policyTags:[...new Set(input.policyTags ?? [])]
  };
  state.worldCauses.push(cause);
  const info = informationData(cause);
  state.worldEvents.push({
    id:`event.world_cause.started.${cause.id}`,
    type:"world_cause_started",
    atHour:startedAtHour,
    ...(cause.originPortId ? { locationId:cause.originPortId } : {}),
    participants:[...(cause.scope.factionIds ?? [])],
    summary:`${cause.title}: ${cause.summary}`,
    canonicalData:{ worldCauseId:cause.id, causeKind:cause.kind, causeStatus:"active", ...info },
    importance:cause.kind === "war" || cause.kind === "ruler_change" ? 4 : 3
  });
  return { ok:true, cause, message:`${cause.title} is now active.` };
}

function resolveWorldCauseAtHour(state: GameState, cause: WorldCauseRecord, atHour: number, summary: string): boolean {
  if (cause.status !== "active") return false;
  cause.status = "resolved";
  cause.resolvedAtHour = Math.max(cause.startedAtHour, Math.floor(atHour));
  cause.resolutionSummary = summary;
  const info = informationData(cause);
  state.worldEvents.push({
    id:`event.world_cause.resolved.${cause.id}`,
    type:"world_cause_resolved",
    atHour:cause.resolvedAtHour,
    ...(cause.originPortId ? { locationId:cause.originPortId } : {}),
    participants:[...(cause.scope.factionIds ?? [])],
    summary,
    canonicalData:{ worldCauseId:cause.id, causeKind:cause.kind, causeStatus:"resolved", ...info },
    importance:cause.kind === "war" || cause.kind === "ruler_change" ? 4 : 2
  });
  return true;
}

export function resolveWorldCause(state: GameState, causeId: EntityId, resolutionSummary: string): { ok:boolean; message:string } {
  normalizeWorldCauseState(state);
  const cause = state.worldCauses.find((row) => row.id === causeId);
  if (!cause || cause.status !== "active") return { ok:false, message:"That world cause is not active." };
  resolveWorldCauseAtHour(state, cause, state.absoluteHour, resolutionSummary);
  compactWorldCauses(state);
  return { ok:true, message:resolutionSummary };
}

/** Resolve time-bounded causes on the authoritative world clock, including during large time jumps. */
export function processWorldCauseLifecycle(state: GameState, _beforeHour: number, afterHour: number): number {
  normalizeWorldCauseState(state);
  let resolved = 0;
  for (const cause of state.worldCauses) {
    if (cause.status !== "active" || cause.scheduledEndAtHour === undefined || cause.scheduledEndAtHour > afterHour) continue;
    if (resolveWorldCauseAtHour(state, cause, cause.scheduledEndAtHour, `${cause.title} is no longer in force.`)) resolved += 1;
  }
  compactWorldCauses(state);
  return resolved;
}

export function compactWorldCauses(state: GameState): void {
  state.worldCauses ??= [];
  const unique = new Map<string,WorldCauseRecord>();
  for (const cause of state.worldCauses) if (cause?.id) unique.set(cause.id,cause);
  const active = [...unique.values()].filter((cause) => cause.status === "active");
  const terminal = [...unique.values()].filter((cause) => cause.status !== "active")
    .sort((a,b)=>(b.resolvedAtHour ?? b.startedAtHour)-(a.resolvedAtHour ?? a.startedAtHour)||b.id.localeCompare(a.id));
  state.worldCauses = [...active,...terminal.slice(0,TERMINAL_HISTORY_LIMIT)];
}

/** Additive v12 normalization. Current cause state is separate from historical WorldEvent rows. */
export function normalizeWorldCauseState(state: GameState): void {
  state.worldCauses ??= [];
  for (const cause of state.worldCauses) {
    cause.scope ??= {};
    cause.effects = normalizedEffects(cause.effects);
    cause.policyTags ??= [];
    cause.status ??= cause.resolvedAtHour !== undefined ? "resolved" : "active";
    cause.startedAtHour = Math.max(0, Math.floor(Number(cause.startedAtHour ?? 0)));
    if (cause.scheduledEndAtHour !== undefined) cause.scheduledEndAtHour = Math.max(cause.startedAtHour, Math.floor(cause.scheduledEndAtHour));
    if (cause.resolvedAtHour !== undefined) cause.resolvedAtHour = Math.max(cause.startedAtHour, Math.floor(cause.resolvedAtHour));
    if (cause.publicInformation) cause.publicInformation.confidence = Math.max(10,Math.min(100,Number(cause.publicInformation.confidence ?? 70)));
  }
  compactWorldCauses(state);
}
