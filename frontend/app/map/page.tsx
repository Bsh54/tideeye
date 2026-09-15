import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

// Placeholder for the main map screen (click a point → verdict → AI chat →
// report → alert → share). Built next.
export default function MapPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-5 text-center">
      <Logo />
      <h1 className="text-2xl">Map screen — coming next</h1>
      <p className="max-w-md text-muted-foreground">
        This is where you’ll click a water point, get an instant risk verdict, an AI
        explanation, and a shareable alert.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary-hover"
      >
        <ArrowLeft size={16} /> Back home
      </Link>
    </main>
  );
}
