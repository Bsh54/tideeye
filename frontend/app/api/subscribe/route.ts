import { NextRequest, NextResponse } from "next/server";

// Proxies an alert subscription to the WhatsApp service (server-side only).
const WA_URL = process.env.WA_SERVICE_URL ?? "";
const WA_TOKEN = process.env.WA_TOKEN ?? "";

export async function POST(req: NextRequest) {
  if (!WA_URL) {
    return NextResponse.json({ error: "Alerts are not configured yet." }, { status: 503 });
  }

  let body: { phones?: unknown; lat?: unknown; lng?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const phones = Array.isArray(body.phones)
    ? body.phones.map((p) => (typeof p === "string" ? p.trim() : "")).filter(Boolean)
    : [];
  const lat = typeof body.lat === "number" ? body.lat : null;
  const lng = typeof body.lng === "number" ? body.lng : null;

  if (phones.length === 0 || lat === null || lng === null) {
    return NextResponse.json({ error: "At least one phone number is required." }, { status: 400 });
  }

  try {
    const r = await fetch(`${WA_URL}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-token": WA_TOKEN },
      body: JSON.stringify({ phones, lat, lng }),
    });
    const d = await r.json();
    return NextResponse.json(d, { status: r.status });
  } catch {
    return NextResponse.json({ error: "Alert service unreachable." }, { status: 502 });
  }
}
