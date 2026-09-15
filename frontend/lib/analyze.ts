// Client for the TideEye analysis backend (the AquaLens reference engine).
// It drives the backend session flow: create a monitoring session on the clicked
// point, poll until it completes, then map the risk row + indices into a verdict.

import type { GeoJSONPolygon } from "@/lib/point";

export type RiskLevel = "safe" | "caution" | "avoid" | "unknown";

export type Analysis = {
  score: number; // 0..100
  level: RiskLevel;
  recommendation: string;
  explanation: string;
  indices: { code: string; label: string; value: number }[];
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

  // 1. Create a session on the AOI polygon.
  const createRes = await fetch(`${API_BASE}/api/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      new_water_body: {
        name: `Point ${lat.toFixed(3)}, ${lng.toFixed(3)}`,
        geometry: polygon,
      },
      max_cloud_cover: 40,
    }),
  });
  if (!createRes.ok) throw new Error(`Backend returned ${createRes.status}`);
  const session = (await createRes.json()) as { id: string };

  // 2. Poll until the pipeline finishes.
  for (let i = 0; i < 40; i++) {
    await sleep(2500);
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
  risk?: {
    score: number;
    level: string;
    recommendation?: string | null;
    reasoning?: string | null;
    citizen_summary?: { bottom_line?: string | null } | null;
  } | null;
  indices?: { name: string; value: number }[] | null;
};

function mapResult(data: SessionRead): Analysis {
  if (data.aoi_type && data.aoi_type !== "water") {
    return {
      score: 0,
      level: "unknown",
      recommendation: "Pick an area over open water for a real reading.",
      explanation:
        "The selected area is not open water, so water-quality indices are not meaningful here.",
      indices: [],
    };
  }
  const risk = data.risk;
  const indices = (data.indices ?? []).map((i) => ({
    code: i.name,
    label: INDEX_LABELS[i.name] ?? i.name,
    value: i.value,
  }));
  return {
    score: risk ? Math.round(risk.score * 100) : 0,
    level: risk ? (LEVEL_MAP[risk.level] ?? "unknown") : "unknown",
    recommendation: risk?.recommendation ?? "",
    explanation:
      risk?.citizen_summary?.bottom_line ??
      risk?.reasoning ??
      "Analysis complete.",
    indices,
  };
}
