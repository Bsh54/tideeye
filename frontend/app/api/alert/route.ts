import { NextRequest, NextResponse } from "next/server";

// Server-side only: the Zavu key stays on the server, never in the browser.
const ZAVU_KEY = process.env.ZAVU_API_KEY ?? "";
const ZAVU_URL = "https://api.zavu.dev/v1/messages";

export async function POST(req: NextRequest) {
  if (!ZAVU_KEY) {
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
    return NextResponse.json({ error: "A message and at least one number are required." }, { status: 400 });
  }

  // Smart Routing: omit channel so Zavu tries WhatsApp then falls back to SMS.
  const results = await Promise.all(
    phones.map(async (to) => {
      try {
        const r = await fetch(ZAVU_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ZAVU_KEY}`,
            "Content-Type": "application/json",
          },
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
