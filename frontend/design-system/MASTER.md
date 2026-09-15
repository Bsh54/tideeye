# TideEye — Design System (Source of Truth)

> *The eye on the tide.*
> Satellite + AI water-quality monitoring that turns imagery into an actionable
> alert for African communities with no lab or sensors. Tone: **credible,
> institutional, human, action-oriented.** Readable in full sunlight, in the field.

Generated with `ui-ux-pro-max`. Every page follows these rules unless overridden
in `design-system/pages/<page>.md`.

## 1. Pattern & Style
- **Pattern**: Real-Time / Operations — hero with live preview + status, scannable
  key metrics, "how it works", CTA (Analyze a water point / Try demo).
- **Style**: Data-Dense Dashboard, **light mode by default** (field/sunlight), dark
  mode later. WCAG AA minimum.
- **Avoid**: ornamental, heavy glassmorphism, dark-only, marketplace vibes.

## 2. Colors (semantic tokens)

Deep-water + health palette, with explicit risk semantics.

| Role | Hex | Token |
|------|-----|-------|
| Primary (deep water) | `#0E7490` | `--primary` |
| Primary hover | `#155E75` | `--primary-hover` |
| On primary | `#FFFFFF` | `--primary-foreground` |
| Secondary (water cyan) | `#06B6D4` | `--secondary` |
| Accent (earth / Africa) | `#C2410C` | `--accent` |
| Background | `#F8FAFC` | `--background` |
| Surface / Card | `#FFFFFF` | `--card` |
| Foreground | `#0F172A` | `--foreground` |
| Muted foreground | `#475569` | `--muted-foreground` |
| Muted | `#EEF4F7` | `--muted` |
| Border | `#E2E8F0` | `--border` |
| Ring (focus) | `#0E7490` | `--ring` |

### RISK semantics (product core — consistent across UI, map, PDF)
| Level | Hex | Token | Meaning |
|-------|-----|-------|---------|
| Safe | `#15803D` | `--risk-safe` | water OK per satellite |
| Caution | `#B45309` | `--risk-caution` | elevated indicators |
| Avoid | `#B91C1C` | `--risk-avoid` | likely problem (algae/pollution) |
| Unknown / not water | `#64748B` | `--risk-unknown` | no water / insufficient data |

> **Rule `color-not-only`**: risk is **never** conveyed by color alone → always
> color + icon + word (Safe / Caution / Avoid). Contrast ≥ 4.5:1 on white.

## 3. Typography — "Corporate Trust"
- **Headings**: **Lexend** (built for reading proficiency, great multilingual —
  French + local languages). Weights 600/700.
- **Body**: **Source Sans 3**. 400 body, 500 labels.
- **Numbers/indices**: tabular (`JetBrains Mono` or `font-variant-numeric: tabular-nums`).
- Base 16px, line-height 1.5–1.6. Scale: 12 · 14 · 16 · 18 · 24 · 32 · 48.

## 4. Effects & interaction
- Soft, consistent shadows (sm/md/lg), radius 8–12px.
- Transitions 150–300ms, ease-out on enter. Respect `prefers-reduced-motion`.
- Clear states: hover / active / focus (ring) / disabled (~0.45 opacity).
- Icons: **Lucide** only (no emoji-as-icon), consistent 1.5–2px stroke.

## 5. Key screens
- **Landing**: hero "The eye on the tide" + Africa impact subtitle + place search
  (primary CTA) + map preview; problem numbers; how it works (Satellite → Analysis
  → Alert); uniqueness vs data-only tools; science digest; impact/use cases; honesty
  (advisory, not a lab); final CTA.
- **Main map screen**: full map, click a point → verdict (color+icon+word) → AI
  chat explanation panel → report (PDF/email) → alert (SMS/WhatsApp) → share link.
- **Dashboard multi-site**: overview map + list with risk pills + trend.
- **Alert poster**: printable A4, high-contrast pictogram + short instruction.

## 6. Quality checklist
- [ ] Text contrast ≥ 4.5:1; risk = color + icon + word.
- [ ] Visible keyboard focus; touch targets ≥ 44px.
- [ ] Lucide icons (no emoji); consistent shadows/radii.
- [ ] Responsive 375 / 768 / 1024 / 1440; no mobile horizontal scroll.
- [ ] `prefers-reduced-motion` respected; transitions 150–300ms.
- [ ] Tabular numbers; semantic tokens (no hardcoded hex in components).
