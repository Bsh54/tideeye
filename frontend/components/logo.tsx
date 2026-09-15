// TideEye brand lockup (icon + wordmark + tagline).
export function Logo({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="TideEye — the eye on the tide"
      className={`h-14 w-auto ${className}`}
    />
  );
}
