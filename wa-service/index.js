// TideEye WhatsApp + subscription service (Baileys).
// - Links ONE WhatsApp account (WA_PHONE) via a pairing code.
// - /subscribe: save numbers watching a location, send a welcome + first report,
//   then a daily job re-checks and alerts them when the satellite image changes.

const fs = require("fs");
const path = require("path");
const express = require("express");
const P = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} = require("@whiskeysockets/baileys");

const PORT = 4310;
const WA_PHONE = (process.env.WA_PHONE || "").replace(/[^0-9]/g, "");
const WA_TOKEN = process.env.WA_TOKEN || "";
const AUTH_DIR = process.env.WA_AUTH_DIR || "/data/auth";
const API = (process.env.ANALYSIS_API || "").replace(/\/$/, "");
const LLM_BASE = (process.env.TIDEEYE_LLM_BASE_URL || "").replace(/\/$/, "");
const LLM_KEY = process.env.TIDEEYE_LLM_API_KEY || "";
const LLM_MODEL = process.env.TIDEEYE_LLM_MODEL || "";
const SUBS_FILE = process.env.WA_SUBS_FILE || "/data/subs.json";
const CHECK_MS = 24 * 60 * 60 * 1000; // daily

const logger = P({ level: "silent" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let sock = null;
let connected = false;
let pairingCode = null;
let lastError = null;

// ---- subscription storage --------------------------------------------------
let subs = [];
function loadSubs() {
  try {
    subs = JSON.parse(fs.readFileSync(SUBS_FILE, "utf8"));
  } catch {
    subs = [];
  }
}
function saveSubs() {
  try {
    fs.mkdirSync(path.dirname(SUBS_FILE), { recursive: true });
    fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));
  } catch (e) {
    console.error("saveSubs", e);
  }
}
loadSubs();

// ---- WhatsApp --------------------------------------------------------------
async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.ubuntu("Chrome"),
    logger,
  });
  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", (u) => {
    const { connection, lastDisconnect } = u;
    if (connection === "open") {
      connected = true;
      pairingCode = null;
      console.log("WhatsApp connected.");
    } else if (connection === "close") {
      connected = false;
      const code = lastDisconnect?.error?.output?.statusCode;
      console.log("WhatsApp connection closed, code:", code);
      if (code !== DisconnectReason.loggedOut) setTimeout(start, 3000);
    }
  });
  if (!sock.authState.creds.registered && WA_PHONE) {
    setTimeout(async () => {
      try {
        pairingCode = await sock.requestPairingCode(WA_PHONE);
        console.log("PAIRING CODE for +" + WA_PHONE + ":", pairingCode);
      } catch (e) {
        lastError = String(e);
        console.error("requestPairingCode failed:", e);
      }
    }, 3000);
  }

  // Conversational bot: reply (via AI) to incoming direct messages.
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const m of messages) {
      try {
        if (m.key.fromMe) continue;
        const jid = m.key.remoteJid || "";
        if (jid === "status@broadcast" || jid.endsWith("@g.us")) continue;
        const text =
          m.message?.conversation || m.message?.extendedTextMessage?.text || "";
        if (!text.trim()) continue;
        try {
          await sock.sendPresenceUpdate("composing", jid);
        } catch {
          /* ignore */
        }
        const reply = await aiChat(text, jid);
        await sock.sendMessage(jid, { text: reply });
      } catch (e) {
        console.error("incoming message handler", e);
      }
    }
  });
}
start().catch((e) => {
  lastError = String(e);
  console.error("start failed:", e);
});

function jidOf(phone) {
  return String(phone).replace(/[^0-9]/g, "") + "@s.whatsapp.net";
}
async function sendText(phone, text) {
  try {
    await sock.sendMessage(jidOf(phone), { text });
    return true;
  } catch (e) {
    console.error("sendText", e);
    return false;
  }
}
async function sendPdf(phone, sessionId, place) {
  if (!API || !sessionId) return;
  try {
    const r = await fetch(`${API}/api/v1/sessions/${sessionId}/report`);
    if (!r.ok) return;
    const buf = Buffer.from(await r.arrayBuffer());
    await sock.sendMessage(jidOf(phone), {
      document: buf,
      mimetype: "application/pdf",
      fileName: `tideeye-${place}.pdf`.replace(/[^a-z0-9.\-]/gi, "_"),
    });
  } catch (e) {
    console.error("sendPdf", e);
  }
}

// ---- analysis (calls the TideEye/AquaLens backend) -------------------------
function bufferPolygon(lng, lat, radiusKm = 1) {
  const latD = radiusKm / 111;
  const lngD = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return {
    type: "Polygon",
    coordinates: [[
      [lng - lngD, lat - latD],
      [lng + lngD, lat - latD],
      [lng + lngD, lat + latD],
      [lng - lngD, lat + latD],
      [lng - lngD, lat - latD],
    ]],
  };
}
async function analyze(lat, lng) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 120);
  const iso = (d) => d.toISOString().slice(0, 10);
  const cr = await fetch(`${API}/api/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      new_water_body: {
        name: `Watch ${lat.toFixed(3)}, ${lng.toFixed(3)}`,
        geometry: bufferPolygon(lng, lat, 1),
      },
      start_date: iso(start),
      end_date: iso(end),
      max_cloud_cover: 30,
    }),
  });
  if (!cr.ok) throw new Error("create " + cr.status);
  const s = await cr.json();
  for (let i = 0; i < 90; i++) {
    await sleep(3000);
    const r = await fetch(`${API}/api/v1/sessions/${s.id}`);
    if (!r.ok) continue;
    const d = await r.json();
    if (d.status === "failed") throw new Error(d.status_message || "failed");
    if (d.status === "complete") return { ...d, sessionId: s.id };
  }
  throw new Error("timeout");
}
async function placeName(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
      { headers: { "User-Agent": "TideEye/1.0" } },
    );
    const d = await r.json();
    if (d.display_name) return d.display_name.split(",").slice(0, 2).join(",").trim();
  } catch {
    /* ignore */
  }
  return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
}
// The message body is the AI's own words (adaptive per situation), not a
// canned line. reasoning = what this means, recommendation = what to do.
function aiMessage(result, place) {
  const reasoning = (result.risk?.reasoning || result.citizen_summary?.bottom_line || "").trim();
  const rec = (result.risk?.recommendation || "").trim();
  const emoji = { low: "✅", medium: "⚠️", high: "🚫" }[result.risk?.level] || "💧";
  return `TideEye 💧 — ${place}\n\n${emoji} ${reasoning}\n\n${rec}`.trim();
}

// Conversational reply for an incoming WhatsApp message (the bot).
async function aiChat(userText, jid) {
  const num = String(jid).replace(/[^0-9]/g, "");
  const sub = subs.find((s) => s.phones.some((p) => p.replace(/[^0-9]/g, "") === num));
  const ctx = sub ? ` This person is subscribed to water alerts for ${sub.place}.` : "";
  const system =
    "You are TideEye's friendly water-safety assistant on WhatsApp, helping communities. " +
    "Answer questions about drinking-water safety and what to do about what people observe " +
    "(green or murky water, bad smell, dead fish, skin irritation, etc.). Be warm, plain and " +
    "short (2 to 4 sentences). You may use one or two emojis. If the water sounds unsafe, tell " +
    "them to boil it before drinking, not to drink it raw, keep children and animals away, and " +
    "contact a local health worker. You are an early-warning helper, not a laboratory." + ctx;
  if (!LLM_BASE || !LLM_KEY || !LLM_MODEL) {
    return "Thanks for your message! 💧 If your water looks green or murky or smells bad, boil it before drinking and keep children away.";
  }
  try {
    const r = await fetch(`${LLM_BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: "Bearer " + LLM_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: String(userText).slice(0, 1000) },
        ],
        temperature: 0.5,
      }),
    });
    if (!r.ok) throw new Error("llm " + r.status);
    const d = await r.json();
    return (d.choices?.[0]?.message?.content || "").trim() || "💧";
  } catch (e) {
    console.error("aiChat", e);
    return "Sorry, I couldn't answer just now. 💧 If your water looks or smells bad, boil it before drinking and keep children away.";
  }
}

// ---- HTTP ------------------------------------------------------------------
const app = express();
app.use(express.json());
function requireToken(req, res, next) {
  if (!WA_TOKEN || req.headers["x-token"] !== WA_TOKEN)
    return res.status(401).json({ error: "unauthorized" });
  next();
}

app.get("/status", (req, res) =>
  res.json({ connected, pairingCode, phone: WA_PHONE, subs: subs.length, lastError }),
);

// One-off send (kept for testing).
app.post("/send", requireToken, async (req, res) => {
  const { to, text } = req.body || {};
  if (!to || !text) return res.status(400).json({ error: "to and text required" });
  if (!connected) return res.status(503).json({ error: "whatsapp not connected" });
  res.json({ ok: await sendText(to, text) });
});

// Configure an alert: numbers watching a location.
app.post("/subscribe", requireToken, async (req, res) => {
  const { phones, lat, lng } = req.body || {};
  const list = (Array.isArray(phones) ? phones : [])
    .map((p) => String(p).replace(/[^0-9+]/g, ""))
    .filter(Boolean);
  if (!list.length || lat == null || lng == null)
    return res.status(400).json({ error: "phones, lat, lng required" });
  if (!connected) return res.status(503).json({ error: "whatsapp not connected" });

  const place = await placeName(lat, lng);
  res.json({ ok: true, place, count: list.length });

  // Do the heavy work after responding.
  (async () => {
    let result = null;
    try {
      result = await analyze(lat, lng);
    } catch (e) {
      console.error("subscribe analyze", e);
    }
    const sub = {
      id: Date.now().toString(),
      phones: list,
      lat,
      lng,
      place,
      lastSceneId: result?.scene_id || null,
      createdAt: new Date().toISOString(),
    };
    subs.push(sub);
    saveSubs();
    for (const to of list) {
      await sendText(
        to,
        `Hello! 👋 You are now subscribed to TideEye water alerts for ${place} 💧. ` +
          `We check this water every day and message you when there is a change. Stay safe! 🙏`,
      );
      if (result) {
        await sendText(to, aiMessage(result, place));
        await sendPdf(to, result.sessionId, place);
      }
    }
  })();
});

// ---- daily scheduler -------------------------------------------------------
async function checkAll() {
  if (!connected || !API) return;
  for (const sub of subs) {
    let result = null;
    try {
      result = await analyze(sub.lat, sub.lng);
    } catch (e) {
      console.error("checkAll analyze", sub.id, String(e));
      continue;
    }
    if (result.scene_id && result.scene_id !== sub.lastSceneId) {
      sub.lastSceneId = result.scene_id;
      saveSubs();
      for (const to of sub.phones) {
        await sendText(to, "🔔 New satellite update:\n\n" + aiMessage(result, sub.place));
        await sendPdf(to, result.sessionId, sub.place);
      }
    }
  }
}
setInterval(() => {
  checkAll().catch((e) => console.error("checkAll", e));
}, CHECK_MS);

app.listen(PORT, () => console.log("WA service listening on", PORT));
