import { NextRequest, NextResponse } from "next/server";

// Server-side only: sends WhatsApp messages through the TideEye WA service
// (Baileys), which is linked to the user's own WhatsApp account.
const WA_URL = process.env.WA_SERVICE_URL ?? "";
const WA_TOKEN = process.env.WA_TOKEN ?? "";

export async function POST(req: NextRequest) {
  if (!WA_URL) {
    return NextResponse.json({ error: "Alerts are not configured yet." }, { status: 503 });
  }

  let body: { phones?: unknown; text?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const raw = Array.isArray(body.phones) ? body.phones : [body.phones];
  const phones = raw
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter((p) => p.length > 0);

  if (!text || phones.length === 0) {
    return NextResponse.json(
      { error: "A message and at least one number are required." },
      { status: 400 },
    );
  }

  const results = await Promise.all(
    phones.map(async (to) => {
      try {
        const r = await fetch(`${WA_URL}/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-token": WA_TOKEN },
          body: JSON.stringify({ to, text }),
        });
        return { to, ok: r.ok, status: r.status };
      } catch {
        return { to, ok: false, status: 0 };
      }
    }),
  );

  const sent = results.filter((r) => r.ok).length;
  return NextResponse.json({ sent, total: phones.length, results });
}
