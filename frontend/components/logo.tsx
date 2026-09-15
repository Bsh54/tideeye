// TideEye wordmark: an eye whose iris is a water drop / ripple.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* eye outline */}
        <path
          d="M2 14C4.8 8.5 9 5.5 14 5.5S23.2 8.5 26 14c-2.8 5.5-7 8.5-12 8.5S4.8 19.5 2 14Z"
          stroke="var(--primary)"
          strokeWidth="2"
          fill="none"
        />
        {/* iris as a water drop */}
        <path
          d="M14 9.5c2.2 2.6 3.4 4.4 3.4 6.1a3.4 3.4 0 1 1-6.8 0c0-1.7 1.2-3.5 3.4-6.1Z"
          fill="var(--secondary)"
        />
      </svg>
      <span className="font-heading text-lg font-bold tracking-tight text-foreground">
        Tide<span className="text-primary">Eye</span>
      </span>
    </span>
  );
}
