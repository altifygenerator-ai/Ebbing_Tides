import type { GameState } from "../game/types.js";
import { GLOBAL_ATLAS } from "../data/seed/worldMap.js";
import { migrateSaveData } from "./localSave.js";
import { dayOfYear } from "../game/time/calendar.js";
import { compactSimulationEvents } from "../game/simulationQueue.js";
import { compactWorldCauses } from "../game/worldCauses.js";

export interface CloudSaveConfig {
  supabaseUrl: string;
  anonKey: string;
  accessToken: string;
}

export interface CloudSaveResult {
  ok: boolean;
  message: string;
}

function headers(config: CloudSaveConfig): HeadersInit {
  return {
    apikey: config.anonKey,
    Authorization: `Bearer ${config.accessToken}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal"
  };
}

/**
 * Alpha 0.6A cloud persistence adapter.
 * The complete canonical state is stored as a versioned JSON snapshot while normalized tables
 * remain available for future simulation queries. Authentication/RLS stays outside simulation code.
 */
export async function saveGameToSupabase(state: GameState, config: CloudSaveConfig): Promise<CloudSaveResult> {
  compactSimulationEvents(state);
  compactWorldCauses(state);
  const url = `${config.supabaseUrl.replace(/\/$/, "")}/rest/v1/game_saves?on_conflict=id`;
  const body = [{
    id: state.saveId,
    world_seed: state.worldSeed,
    schema_version: state.schemaVersion,
    absolute_hour: state.absoluteHour,
    clock_year: state.clock.year,
    clock_month: state.clock.month,
    clock_day: state.clock.day,
    clock_day_of_year: dayOfYear(state.clock),
    clock_hour: state.clock.hour,
    settings: state.settings,
    atlas_version: GLOBAL_ATLAS.version,
    navigation_state: {
      player_position: state.ships[state.player.shipId]?.position,
      current_port_id: state.player.currentPortId ?? null,
      current_poi_id: state.player.currentPoiId ?? null,
      voyage: state.voyage ?? null,
      arrival: state.arrival ?? null,
      navigation_zoom: state.settings.navigationZoom,
      active_regional_layer_contract: "REGIONAL_MAP_LAYERS_0.5C"
    },
    snapshot: state,
    updated_at: new Date().toISOString()
  }];
  const response = await fetch(url, { method: "POST", headers: headers(config), body: JSON.stringify(body) });
  if (!response.ok) return { ok: false, message: `Cloud save failed (${response.status}).` };
  return { ok: true, message: "Campaign snapshot saved to Supabase." };
}

export async function loadGameFromSupabase(saveId: string, config: CloudSaveConfig): Promise<GameState | undefined> {
  const base = config.supabaseUrl.replace(/\/$/, "");
  const query = encodeURIComponent(`eq.${saveId}`);
  const response = await fetch(`${base}/rest/v1/game_saves?id=${query}&select=snapshot&limit=1`, {
    method: "GET",
    headers: headers(config)
  });
  if (!response.ok) throw new Error(`Cloud load failed (${response.status}).`);
  const rows = await response.json() as Array<{ snapshot?: unknown }>;
  return rows[0]?.snapshot ? migrateSaveData(rows[0].snapshot) : undefined;
}
