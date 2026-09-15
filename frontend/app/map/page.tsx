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

  const handleSelect = useCallback((lng: number, lat: number, polygon: GeoJSONPolygon) => {
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

      <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-[1fr_400px]">
        <div className="relative min-h-[300px]">
          <WaterMap onSelect={handleSelect} />
          <div className="pointer-events-none absolute left-4 top-4 rounded-lg bg-card/90 px-4 py-2 text-sm font-medium shadow-card backdrop-blur">
            Click a water point to analyze it.
          </div>
        </div>

        <aside className="overflow-y-auto border-t border-border md:border-l md:border-t-0">
          <ResultPanel state={state} />
        </aside>
      </div>
    </main>
  );
}

function ResultPanel({ state }: { state: State }) {
  if (state.phase === "idle") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <MapPin size={32} className="text-primary" />
        <h2 className="text-xl font-semibold">Pick a water point</h2>
        <p className="text-base text-muted-foreground">
          Click a lake or river on the map. TideEye pulls the latest satellite image
          and returns a risk verdict.
        </p>
      </div>
    );
  }

  const coords = `${state.lat.toFixed(4)}, ${state.lng.toFixed(4)}`;

  if (state.phase === "loading") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-lg font-semibold">Analyzing {coords}</p>
        <p className="text-base text-muted-foreground">
          Fetching satellite imagery and computing water-quality indices.
        </p>
      </div>
    );
  }

  if (state.phase === "error") {
    return (
      <div className="p-6">
        <p className="text-base font-semibold text-muted-foreground">{coords}</p>
        <div className="mt-4 rounded-lg border border-border bg-muted p-4">
          <p className="font-semibold">Analysis engine not reachable yet</p>
          <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
        </div>
      </div>
    );
  }

  const { result, lng, lat } = state;
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/map?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}`
      : "";
  const alertText = `TideEye water alert for ${lat.toFixed(3)}, ${lng.toFixed(
    3,
  )}: risk ${result.level.toUpperCase()} (${result.score}/100). ${result.recommendation}`;

  return (
    <div className="p-6">
      <p className="text-base font-semibold text-muted-foreground">{coords}</p>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-card">
        <RiskPill level={result.level} className="text-base" />
        <span className="tabular text-4xl font-bold">{result.score}</span>
      </div>

      <h3 className="mt-6 text-lg font-semibold">Indices</h3>
      <div className="mt-2 space-y-2">
        {result.indices.map((idx) => (
          <div
            key={idx.code}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5"
          >
            <span className="tabular text-base font-semibold text-primary">{idx.code}</span>
            <span className="text-base text-muted-foreground">{idx.label}</span>
            <span className="tabular text-base font-semibold">{idx.value.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <h3 className="mt-6 text-lg font-semibold">What this means</h3>
      <div className="mt-2 rounded-xl border border-border bg-muted p-4">
        <p className="text-base leading-relaxed">{result.explanation}</p>
      </div>

      <h3 className="mt-6 text-lg font-semibold">Take action</h3>
      <div className="mt-2 grid grid-cols-2 gap-3">
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
          <Share2 size={18} /> Share link
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
