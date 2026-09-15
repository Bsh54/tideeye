"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  FileDown,
  Mail,
  Share2,
  MessageCircle,
  MapPin,
  Satellite,
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
      () => {
        /* denied or unavailable: user can click the map */
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

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
        {/* Map on top. It shrinks to make room for the report when analysis runs. */}
        <div
          className={`relative ${
            state.phase === "idle" ? "flex-1" : "h-[52vh] shrink-0"
          }`}
        >
          <WaterMap onSelect={runAnalysis} flyTo={flyTo} />
          {state.phase === "idle" ? (
            <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-lg bg-card/90 px-4 py-2 text-sm font-medium shadow-card backdrop-blur">
              Click a water point to analyze it.
            </div>
          ) : null}
          {askLocation ? (
            <LocationPrompt onYes={useMyLocation} onNo={() => setAskLocation(false)} />
          ) : null}
        </div>

        {/* Report below the map, in normal flow (classic stacked layout). */}
        {state.phase !== "idle" ? <ReportSection state={state} /> : null}
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
        <h2 className="mt-4 text-xl font-bold">Analyze the water near you?</h2>
        <p className="mt-2 text-base text-muted-foreground">
          TideEye can use your location to automatically frame and analyze the
          nearest water. Or choose a point yourself on the map.
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

function ReportSection({ state }: { state: Exclude<State, { phase: "idle" }> }) {
  const coords = `${state.lat.toFixed(4)}, ${state.lng.toFixed(4)}`;
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-3xl px-5 py-6">
        <div className="flex items-center gap-3">
          {state.phase === "loading" ? (
            <Loader2 size={20} className="animate-spin text-primary" />
          ) : state.phase === "done" ? (
            <RiskPill level={state.result.level} />
          ) : (
            <MapPin size={20} className="text-muted-foreground" />
          )}
          <span className="text-base font-semibold text-muted-foreground">{coords}</span>
        </div>

        <div className="mt-4">
          {state.phase === "loading" ? (
            <p className="py-4 text-base text-muted-foreground">
              Fetching the latest Sentinel-2 image and computing water-quality
              indices. This can take a minute.
            </p>
          ) : state.phase === "error" ? (
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="font-semibold">Analysis engine not reachable</p>
              <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
            </div>
          ) : (
            <Report result={state.result} lat={state.lat} lng={state.lng} />
          )}
        </div>
      </div>
    </section>
  );
}

function Report({
  result,
  lat,
  lng,
}: {
  result: Analysis;
  lat: number;
  lng: number;
}) {
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/map?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`
      : "";
  const alertText = `TideEye water alert for ${lat.toFixed(3)}, ${lng.toFixed(
    3,
  )}: risk ${result.level.toUpperCase()} (${result.score}/100). ${result.recommendation}`;
  const cloud =
    result.scene.cloudCover != null ? `${result.scene.cloudCover.toFixed(1)}%` : "—";
  const captured = result.scene.capturedAt
    ? new Date(result.scene.capturedAt).toLocaleDateString()
    : "—";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between rounded-xl border border-border bg-background p-4">
        <span className="text-lg font-semibold">Risk score</span>
        <span className="tabular text-4xl font-bold">{result.score}</span>
      </div>

      <div>
        <h3 className="text-base font-semibold">What this means</h3>
        <p className="mt-1 text-base leading-relaxed text-muted-foreground">
          {result.explanation}
        </p>
        {result.recommendation ? (
          <p className="mt-2 text-base leading-relaxed">
            <span className="font-semibold">Do this: </span>
            {result.recommendation}
          </p>
        ) : null}
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <Satellite size={16} className="text-primary" /> Satellite scene
        </h3>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <Row label="Provider" value={result.scene.provider ?? "Sentinel-2"} />
          <Row label="Captured" value={captured} />
          <Row label="Cloud cover" value={cloud} />
          <Row
            label="Water fraction"
            value={
              result.scene.waterFraction != null
                ? `${Math.round(result.scene.waterFraction * 100)}%`
                : "—"
            }
          />
          <Row label="Scene ID" value={result.scene.sceneId ?? "—"} full mono />
        </dl>
      </div>

      {result.indices.length ? (
        <div>
          <h3 className="text-base font-semibold">Indices</h3>
          <div className="mt-2 space-y-1.5">
            {result.indices.map((idx) => (
              <div
                key={idx.code}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span className="tabular text-sm font-semibold text-primary">{idx.code}</span>
                <span className="text-sm text-muted-foreground">{idx.label}</span>
                <span className="tabular text-sm font-semibold">{idx.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(alertText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-base font-semibold text-primary-foreground hover:bg-primary-hover"
        >
          <MessageCircle size={18} /> Alert
        </a>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(shareUrl)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-base font-semibold hover:bg-muted"
        >
          <Share2 size={18} /> Share
        </button>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-base font-semibold text-muted-foreground opacity-60"
        >
          <FileDown size={18} /> PDF
        </button>
        <button
          type="button"
          disabled
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-base font-semibold text-muted-foreground opacity-60"
        >
          <Mail size={18} /> Email
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  full,
  mono,
}: {
  label: string;
  value: string;
  full?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={`flex flex-col ${full ? "col-span-2" : ""}`}>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={`${mono ? "tabular break-all text-xs" : "text-sm"} font-medium`}>
        {value}
      </dd>
    </div>
  );
}
