import { ShieldCheck, AlertTriangle, OctagonX, HelpCircle } from "lucide-react";

// Risk is NEVER conveyed by color alone: color + icon + word. See MASTER.md.
type Level = "safe" | "caution" | "avoid" | "unknown";

const CONFIG: Record<
  Level,
  { label: string; color: string; bg: string; Icon: typeof ShieldCheck }
> = {
  safe: { label: "Safe", color: "var(--risk-safe)", bg: "rgba(21,128,61,0.10)", Icon: ShieldCheck },
  caution: { label: "Caution", color: "var(--risk-caution)", bg: "rgba(180,83,9,0.10)", Icon: AlertTriangle },
  avoid: { label: "Avoid", color: "var(--risk-avoid)", bg: "rgba(185,28,28,0.10)", Icon: OctagonX },
  unknown: { label: "Unknown", color: "var(--risk-unknown)", bg: "rgba(100,116,139,0.10)", Icon: HelpCircle },
};

export function RiskPill({ level, className = "" }: { level: Level; className?: string }) {
  const { label, color, bg, Icon } = CONFIG[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${className}`}
      style={{ color, backgroundColor: bg }}
    >
      <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
      {label}
    </span>
  );
}
