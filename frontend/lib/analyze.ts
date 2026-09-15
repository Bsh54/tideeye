// Client for the TideEye analysis backend (the AquaLens reference engine).
// It drives the backend session flow: create a monitoring session on the clicked
// point, poll until it completes, then map the risk row + indices into a verdict.

import type { GeoJSONPolygon } from "@/lib/point";

export type RiskLevel = "safe" | "caution" | "avoid" | "unknown";

export type Scene = {
  provider: string | null;
  sceneId: string | null;
  capturedAt: string | null;
  cloudCover: number | null;
  waterFraction: number | null;
};

export type Analysis = {
  score: number; // 0..100
  level: RiskLevel;
  aoiType: string | null; // "water" | "mixed" | "land"
  recommendation: string;
  explanation: string;
  indices: { code: string; label: string; value: number }[];
  scene: Scene;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

const INDEX_LABELS: Record<string, string> = {
  NDCI: "Chlorophyll / algae",
  NDTI: "Turbidity / sediment",
  NDWI: "Water presence",
  MNDWI: "Water (modified)",
  NDVI: "Vegetation",
  WRI: "Water ratio",
};

const LEVEL_MAP: Record<string, RiskLevel> = {
  low: "safe",
  medium: "caution",
  high: "avoid",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// The polygon is the AOI box drawn on the map, so the analyzed zone matches
// exactly what the user sees framed.
export async function analyzePoint(
  lng: number,
  lat: number,
  polygon: GeoJSONPolygon,
): Promise<Analysis> {
  if (!API_BASE) throw new Error("Analysis backend is not configured yet.");

  // 1. Create a session on the AOI polygon. Use a wide window and cloud
  //    tolerance so a usable Sentinel-2 scene is almost always found.
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 120);
  const iso = (d: Date) => d.toISOString().slice(0, 10);

  const createRes = await fetch(`${API_BASE}/api/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      new_water_body: {
        name: `Point ${lat.toFixed(3)}, ${lng.toFixed(3)}`,
        geometry: polygon,
      },
      start_date: iso(start),
      end_date: iso(end),
      // Prefer a CLEAR recent scene over a fresh cloudy one: a wide window
      // (120 days) plus a low cloud ceiling avoids "the image was unclear".
      max_cloud_cover: 30,
    }),
  });
  if (!createRes.ok) throw new Error(`Backend returned ${createRes.status}`);
  const session = (await createRes.json()) as { id: string };

  // 2. Poll until the pipeline finishes. The primary LLM can take ~90s, plus
  //    satellite fetch, so allow a generous budget (~4.5 min).
  for (let i = 0; i < 90; i++) {
    await sleep(3000);
    const res = await fetch(`${API_BASE}/api/v1/sessions/${session.id}`);
    if (!res.ok) continue;
    const data = (await res.json()) as SessionRead;
    if (data.status === "failed") {
      throw new Error(data.status_message ?? "Analysis failed");
    }
    if (data.status === "complete") {
      return mapResult(data);
    }
  }
  throw new Error("Analysis timed out");
}

type SessionRead = {
  status: string;
  status_message?: string | null;
  aoi_type?: string | null;
  water_fraction?: number | null;
  scene_id?: string | null;
  scene_provider?: string | null;
  scene_capture_date?: string | null;
  scene_cloud_cover?: number | null;
  risk?: {
    score: number;
    level: string;
    recommendation?: string | null;
    reasoning?: string | null;
  } | null;
  // Plain-English verdict, computed top-level (not under risk).
  citizen_summary?: {
    headline?: string | null;
    bottom_line?: string | null;
  } | null;
  indices?: { name: string; value: number }[] | null;
};

function sceneOf(data: SessionRead): Scene {
  return {
    provider: data.scene_provider ?? null,
    sceneId: data.scene_id ?? null,
    capturedAt: data.scene_capture_date ?? null,
    cloudCover: data.scene_cloud_cover ?? null,
    waterFraction: data.water_fraction ?? null,
  };
}

function mapResult(data: SessionRead): Analysis {
  // Only block when the spot is essentially land. "mixed" (a shoreline/beach)
  // still has a usable water signal, so we show the result.
  if (data.aoi_type === "land") {
    return {
      score: 0,
      level: "unknown",
      aoiType: "land",
      recommendation: "Try tapping a little further into the water (a lake, river, or the sea).",
      explanation:
        "This spot is mostly dry land, so there's no water here for the satellite to read. Move your pin onto open water and try again.",
      indices: [],
      scene: sceneOf(data),
    };
  }
  const risk = data.risk;
  const indices = (data.indices ?? []).map((i) => ({
    code: i.name,
    label: INDEX_LABELS[i.name] ?? i.name,
    value: i.value,
  }));
  // The AI (reasoning) is now written in plain language by the prompt, so use
  // it directly; fall back to the deterministic citizen summary.
  const explanation =
    risk?.reasoning ??
    data.citizen_summary?.bottom_line ??
    data.citizen_summary?.headline ??
    "Analysis complete.";
  return {
    score: risk ? Math.round(risk.score * 100) : 0,
    level: risk ? (LEVEL_MAP[risk.level] ?? "unknown") : "unknown",
    aoiType: data.aoi_type ?? "water",
    recommendation: risk?.recommendation ?? "",
    explanation,
    indices,
    scene: sceneOf(data),
  };
}
