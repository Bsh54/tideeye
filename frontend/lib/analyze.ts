// Client for the TideEye analysis backend.
// The backend runs the satellite pipeline (Sentinel-2 -> indices -> risk score)
// and returns a verdict. Base URL comes from NEXT_PUBLIC_API_URL.

export type RiskLevel = "safe" | "caution" | "avoid" | "unknown";

export type Analysis = {
  score: number;
  level: RiskLevel;
  recommendation: string;
  explanation: string;
  indices: { code: string; label: string; value: number }[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function analyzePoint(lng: number, lat: number): Promise<Analysis> {
  if (!API_BASE) {
    throw new Error("Analysis backend is not configured yet.");
  }
  const res = await fetch(`${API_BASE}/api/v1/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng }),
  });
  if (!res.ok) {
    throw new Error(`Backend returned ${res.status}`);
  }
  return (await res.json()) as Analysis;
}
