// TideEye WhatsApp sender (Baileys, pairing-code auth).
// Links ONE WhatsApp account (WA_PHONE) via a pairing code the user types into
// WhatsApp > Linked devices > Link with phone number. The session persists in
// /data so it stays logged in across restarts. /send is protected by WA_TOKEN.

const express = require("express");
const P = require("pino");
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} = require("@whiskeysockets/baileys");

const PORT = 4310;
const WA_PHONE = (process.env.WA_PHONE || "").replace(/[^0-9]/g, ""); // digits only
const WA_TOKEN = process.env.WA_TOKEN || "";
const AUTH_DIR = process.env.WA_AUTH_DIR || "/data/auth";

const logger = P({ level: "silent" });

let sock = null;
let connected = false;
let pairingCode = null;
let lastError = null;

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
      if (code !== DisconnectReason.loggedOut) {
        setTimeout(start, 3000); // reconnect
      }
    }
  });

  // If this account is not linked yet, request a pairing code.
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
}

start().catch((e) => {
  lastError = String(e);
  console.error("start failed:", e);
});

const app = express();
app.use(express.json());

function requireToken(req, res, next) {
  if (!WA_TOKEN || req.headers["x-token"] !== WA_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

app.get("/status", (req, res) => {
  res.json({ connected, pairingCode, phone: WA_PHONE, lastError });
});

app.post("/send", requireToken, async (req, res) => {
  const { to, text } = req.body || {};
  if (!to || !text) return res.status(400).json({ error: "to and text required" });
  if (!connected) return res.status(503).json({ error: "whatsapp not connected" });
  const jid = String(to).replace(/[^0-9]/g, "") + "@s.whatsapp.net";
  try {
    await sock.sendMessage(jid, { text: String(text) });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => console.log("WA service listening on", PORT));
