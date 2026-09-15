"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileDown,
  MessageCircle,
  MapPin,
  Satellite,
  Activity,
  BellRing,
  Droplets,
  Check,
  FlaskConical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { RiskPill } from "@/components/risk-pill";
import { WaterMap } from "@/components/map/water-map";
import { analyzePoint, type Analysis } from "@/lib/analyze";
import type { GeoJSONPolygon } from "@/lib/point";

type State =
  | { phase: "idle" }
  | { phase: "loading"; lng: number; lat: number }
  | { phase: "done"; lng: number; lat: number; result: Analysis }
  | { phase: "error"; lng: number; lat: number; message: string };

export default function MapPage() {
  const [state, setState] = useState<State>({ phase: "idle" });
  const [flyTo, setFlyTo] = useState<{ lng: number; lat: number } | null>(null);
  const [askLocation, setAskLocation] = useState(true);

  const runAnalysis = useCallback((lng: number, lat: number, polygon: GeoJSONPolygon) => {
    setState({ phase: "loading", lng, lat });
    analyzePoint(lng, lat, polygon)
      .then((result) => setState({ phase: "done", lng, lat, result }))
      .catch((err: unknown) =>
        setState({
          phase: "error",
          lng,
          lat,
          message: err instanceof Error ? err.message : "Analysis failed",
        }),
      );
  }, []);

  const useMyLocation = () => {
    setAskLocation(false);
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setFlyTo({ lng: pos.coords.longitude, lat: pos.coords.latitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Satellite while selecting, terrain once a result is ready.
  const forceBasemap =
    state.phase === "done" ? "terrain" : state.phase === "loading" ? "satellite" : null;

  return (
    <main className="flex h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <Logo />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-base font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={18} /> Home
        </Link>
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className={`relative ${state.phase === "idle" ? "flex-1" : "h-[48vh] shrink-0"}`}>
          <WaterMap onSelect={runAnalysis} flyTo={flyTo} forceBasemap={forceBasemap} />
          {state.phase === "idle" ? (
            <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-card/90 px-4 py-2 text-sm font-medium shadow-card backdrop-blur">
              Tap a lake or river to check the water
            </div>
          ) : null}
          {askLocation ? (
            <LocationPrompt onYes={useMyLocation} onNo={() => setAskLocation(false)} />
          ) : null}
        </div>

        {state.phase === "loading" ? <LoadingReport /> : null}
        {state.phase === "error" ? <ErrorReport message={state.message} /> : null}
        {state.phase === "done" ? (
          <Report result={state.result} lat={state.lat} lng={state.lng} />
        ) : null}
      </div>
    </main>
  );
}

function LocationPrompt({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lift">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted text-primary">
          <MapPin size={24} />
        </span>
        <h2 className="mt-4 text-xl font-bold">Check the water near you?</h2>
        <p className="mt-2 text-base text-muted-foreground">
          TideEye can use your location to automatically find and check the nearest
          water. Or pick a spot yourself on the map.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onYes}
            className="flex-1 rounded-lg bg-primary px-4 py-3 text-base font-semibold text-primary-foreground hover:bg-primary-hover"
          >
            Yes, use my location
          </button>
          <button
            type="button"
            onClick={onNo}
            className="flex-1 rounded-lg border border-border bg-card px-4 py-3 text-base font-semibold hover:bg-muted"
          >
            I&apos;ll choose myself
          </button>
        </div>
      </div>
    </div>
  );
}

const LOADING_STEPS = [
  { Icon: Satellite, label: "Finding the freshest satellite image" },
  { Icon: Activity, label: "Reading the water" },
  { Icon: BellRing, label: "Writing your report" },
];

function LoadingReport() {
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-5 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {LOADING_STEPS.map(({ Icon, label }, i) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-4"
              style={{ animation: "tidepulse 1.6s ease-in-out infinite", animationDelay: `${i * 0.25}s` }}
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
                <Icon size={22} />
              </span>
              <span className="text-base font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/3 rounded-full bg-primary" style={{ animation: "tideslide 1.8s ease-in-out infinite" }} />
        </div>
        <p className="mt-4 text-center text-base text-muted-foreground">
          Pulling a real Sentinel-2 image and analyzing the water. This usually takes a minute.
        </p>
      </div>
      <style>{`
        @keyframes tidepulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes tideslide { 0%{transform:translateX(-120%)} 100%{transform:translateX(420%)} }
      `}</style>
    </section>
  );
}

function ErrorReport({ message }: { message: string }) {
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="rounded-xl border border-border bg-muted p-5">
          <p className="text-lg font-semibold">We couldn&apos;t analyze this spot</p>
          <p className="mt-1 text-base text-muted-foreground">
            Try tapping directly on open water (a lake or river). {message}
          </p>
        </div>
      </div>
    </section>
  );
}

// Friendly, non-technical signals derived from the spectral indices.
const SIGNALS: { label: string; codes: string[]; higherIsWorse: boolean }[] = [
  { label: "Algae & greenness", codes: ["NDCI"], higherIsWorse: true },
  { label: "Cloudiness / sediment", codes: ["NDTI"], higherIsWorse: true },
  { label: "Open water", codes: ["MNDWI", "NDWI"], higherIsWorse: false },
];

function signalLevel(pct: number, higherIsWorse: boolean) {
  const bad = higherIsWorse ? pct : 100 - pct;
  if (bad < 34) return { word: "Low", color: "var(--risk-safe)" };
  if (bad < 67) return { word: "Moderate", color: "var(--risk-caution)" };
  return { word: "High", color: "var(--risk-avoid)" };
}

// Split the AI recommendation (plain sentences) into individual action steps.
function toActions(recommendation: string): string[] {
  return recommendation
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// Full names for the spectral indices, shown in the scientific view.
const INDEX_FULL: Record<string, string> = {
  NDCI: "Normalized Difference Chlorophyll Index",
  NDTI: "Normalized Difference Turbidity Index",
  NDWI: "Normalized Difference Water Index",
  MNDWI: "Modified Normalized Difference Water Index",
  NDVI: "Normalized Difference Vegetation Index",
  WRI: "Water Ratio Index",
};

function Report({ result, lat, lng }: { result: Analysis; lat: number; lng: number }) {
  const actions = toActions(result.recommendation);
  const alertText = `TideEye water check (${lat.toFixed(3)}, ${lng.toFixed(3)}): ${result.level.toUpperCase()} risk, ${result.score}/100. ${result.explanation} ${result.recommendation}`;

  const [alertOpen, setAlertOpen] = useState(false);
  const [sciOpen, setSciOpen] = useState(false);
  const [phones, setPhones] = useState("");
  const [message, setMessage] = useState(alertText);
  const [sending, setSending] = useState(false);
  const [alertStatus, setAlertStatus] = useState<string | null>(null);

  const sendAlert = async () => {
    const list = phones.split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) {
      setAlertStatus("Enter at least one phone number.");
      return;
    }
    setSending(true);
    setAlertStatus(null);
    try {
      const r = await fetch("/api/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phones: list, text: message }),
      });
      const d = await r.json();
      setAlertStatus(r.ok ? `Sent to ${d.sent}/${d.total}.` : d.error ?? "Could not send.");
    } catch {
      setAlertStatus("Could not send.");
    }
    setSending(false);
  };
  const cloud = result.scene.cloudCover != null ? `${result.scene.cloudCover.toFixed(0)}%` : "—";
  const captured = result.scene.capturedAt
    ? new Date(result.scene.capturedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
  const water =
    result.scene.waterFraction != null ? `${Math.round(result.scene.waterFraction * 100)}%` : "—";

  const bannerBg: Record<string, string> = {
    safe: "rgba(21,128,61,0.08)",
    caution: "rgba(180,83,9,0.08)",
    avoid: "rgba(185,28,28,0.08)",
    unknown: "rgba(100,116,139,0.08)",
  };

  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-5 py-8">
        {/* Verdict banner */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border p-6"
          style={{ backgroundColor: bannerBg[result.level] }}
        >
          <div className="flex items-center gap-4">
            <RiskPill level={result.level} className="text-base" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Water at this spot</p>
              <p className="text-2xl font-bold">
                {result.level === "safe"
                  ? "Looks OK today"
                  : result.level === "caution"
                    ? "Be careful"
                    : result.level === "avoid"
                      ? "Avoid this water"
                      : "Not open water"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-muted-foreground">Risk score</p>
            <p className="tabular text-5xl font-bold leading-none">{result.score}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Left: explanation + action */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h3 className="text-lg font-bold">What this means</h3>
              <p className="mt-2 text-lg leading-relaxed text-muted-foreground">
                {result.explanation}
              </p>
              {actions.length ? (
                <div className="mt-5">
                  <p className="text-base font-semibold text-primary">What to do</p>
                  <ul className="mt-2 space-y-2">
                    {actions.map((a) => (
                      <li key={a} className="flex items-start gap-2.5 text-base leading-relaxed">
                        <Check size={18} className="mt-0.5 shrink-0 text-primary" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAlertOpen((v) => !v)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary-hover"
              >
                <MessageCircle size={18} /> Send alert
              </button>
              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3.5 text-base font-semibold text-muted-foreground opacity-60"
              >
                <FileDown size={18} /> Report PDF
              </button>
            </div>

            {alertOpen ? (
              <div className="rounded-2xl border border-border bg-background p-5">
                <p className="text-base font-semibold">Send this alert by SMS / WhatsApp</p>
                <label className="mt-3 block text-sm font-medium text-muted-foreground">
                  Phone numbers (one per line, with country code)
                </label>
                <textarea
                  value={phones}
                  onChange={(e) => setPhones(e.target.value)}
                  rows={3}
                  placeholder={"+22990000000\n+22991111111"}
                  className="mt-1 w-full rounded-lg border border-border bg-card p-3 font-mono text-sm outline-none focus:border-primary"
                />
                <label className="mt-3 block text-sm font-medium text-muted-foreground">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-border bg-card p-3 text-sm outline-none focus:border-primary"
                />
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={sendAlert}
                    disabled={sending}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-base font-semibold text-primary-foreground hover:bg-primary-hover disabled:opacity-60"
                  >
                    <MessageCircle size={16} /> {sending ? "Sending…" : "Send now"}
                  </button>
                  {alertStatus ? (
                    <span className="text-sm font-medium text-muted-foreground">{alertStatus}</span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {/* Right: signals + scene */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Droplets size={18} className="text-primary" /> Water signals
              </h3>
              <div className="mt-4 space-y-4">
                {SIGNALS.map((sig) => {
                  const idx = result.indices.find((i) => sig.codes.includes(i.code));
                  if (!idx) return null;
                  const pct = Math.max(0, Math.min(100, ((idx.value + 0.3) / 0.9) * 100));
                  const lvl = signalLevel(pct, sig.higherIsWorse);
                  return (
                    <div key={sig.label}>
                      <div className="flex items-center justify-between text-base">
                        <span className="font-medium">{sig.label}</span>
                        <span className="font-semibold" style={{ color: lvl.color }}>
                          {lvl.word}
                        </span>
                      </div>
                      <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: lvl.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold">
                <Satellite size={18} className="text-primary" /> Satellite image used
              </h3>
              <dl className="mt-4 space-y-2.5 text-base">
                <SceneRow label="Taken on" value={captured} />
                <SceneRow label="Clouds in view" value={cloud} />
                <SceneRow label="Water in the frame" value={water} />
                <SceneRow label="Source" value="Sentinel-2 (Copernicus)" />
              </dl>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Check size={14} className="text-risk-safe" /> Real satellite data, not a guess
              </p>
            </div>
          </div>
        </div>

        {/* Scientific analysis (opt-in, for credibility / technical readers) */}
        <div className="mt-6 rounded-2xl border border-border bg-background">
          <button
            type="button"
            onClick={() => setSciOpen((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4"
          >
            <span className="inline-flex items-center gap-2 text-lg font-bold">
              <FlaskConical size={18} className="text-primary" /> Scientific analysis
            </span>
            {sciOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {sciOpen ? (
            <div className="space-y-6 border-t border-border px-6 py-5">
              <div>
                <p className="text-base font-semibold">Spectral indices (Sentinel-2 L2A)</p>
                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-left">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Index</th>
                        <th className="px-3 py-2 font-semibold">Name</th>
                        <th className="px-3 py-2 text-right font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.indices.map((idx) => (
                        <tr key={idx.code} className="border-t border-border">
                          <td className="tabular px-3 py-2 font-semibold text-primary">{idx.code}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {INDEX_FULL[idx.code] ?? idx.label}
                          </td>
                          <td className="tabular px-3 py-2 text-right font-semibold">
                            {idx.value.toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-base font-semibold">Risk model</p>
                  <dl className="mt-2 space-y-1.5 text-sm">
                    <SciRow label="Risk score" value={`${result.score} / 100`} />
                    <SciRow label="Normalized score" value={(result.score / 100).toFixed(2)} />
                    <SciRow label="Risk level" value={result.level} />
                    <SciRow label="AOI type" value={result.aoiType ?? "—"} />
                  </dl>
                </div>
                <div>
                  <p className="text-base font-semibold">Scene provenance</p>
                  <dl className="mt-2 space-y-1.5 text-sm">
                    <SciRow label="Provider" value={result.scene.provider ?? "Sentinel-2"} />
                    <SciRow
                      label="Captured"
                      value={result.scene.capturedAt ? new Date(result.scene.capturedAt).toISOString().slice(0, 16).replace("T", " ") + " UTC" : "—"}
                    />
                    <SciRow
                      label="Cloud cover"
                      value={result.scene.cloudCover != null ? `${result.scene.cloudCover.toFixed(1)}%` : "—"}
                    />
                    <SciRow
                      label="Water fraction"
                      value={result.scene.waterFraction != null ? result.scene.waterFraction.toFixed(3) : "—"}
                    />
                  </dl>
                </div>
              </div>

              {result.scene.sceneId ? (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">Scene ID</p>
                  <p className="tabular mt-1 break-all text-xs">{result.scene.sceneId}</p>
                </div>
              ) : null}

              <p className="text-sm leading-relaxed text-muted-foreground">
                Method: six normalized-difference indices are computed on the water mask of a
                Sentinel-2 L2A scene (Microsoft Planetary Computer). A deterministic model turns
                them into the 0–100 risk score. The plain-language summary above is written by an
                AI from these same numbers, but never changes the score.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SciRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-1.5 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}

function SceneRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-2 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
