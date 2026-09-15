import Image from "next/image";
import Link from "next/link";
import {
  Satellite,
  Activity,
  BellRing,
  Search,
  ArrowRight,
  Droplets,
  Waves,
  Leaf,
  Users,
  ShieldAlert,
  MapPin,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { RiskPill } from "@/components/risk-pill";

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <Problem />
      <HowItWorks />
      <Uniqueness />
      <Science />
      <Impact />
      <Honesty />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#science" className="hover:text-foreground">The science</a>
          <a href="#impact" className="hover:text-foreground">Impact</a>
        </nav>
        <Link
          href="/map"
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Analyze a water point <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-medium text-primary">
            <Satellite size={15} /> Sentinel-2 · AI · Earth Forward
          </span>
          <h1 className="mt-5 text-4xl leading-tight md:text-5xl">
            The eye on the tide.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            TideEye watches lakes and rivers from space and tells communities —
            before they drink — whether the water is safe today. No lab. No
            sensors. Just a satellite and a clear alert.
          </p>

          <form className="mt-7 flex max-w-md items-center gap-2 rounded-lg border border-border bg-card p-1.5 shadow-card">
            <Search size={18} className="ml-2 shrink-0 text-muted-foreground" />
            <input
              className="w-full bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search a lake, river or place…"
              aria-label="Search a water point"
            />
            <Link
              href="/map"
              className="shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Analyze
            </Link>
          </form>
          <p className="mt-3 text-sm text-muted-foreground">
            Or explore the live map — no sign-up needed.
          </p>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-lift">
            <Image
              src="/images/landing/hero-african-woman-river.jpg"
              alt="A woman collecting water from a river"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {/* Floating verdict card to show the product output. */}
          <div className="absolute -bottom-5 -left-4 w-56 rounded-lg border border-border bg-card p-4 shadow-lift">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Lake Victoria · today</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <RiskPill level="caution" />
              <span className="tabular text-2xl font-bold">61</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Elevated chlorophyll — possible algae. Boil before drinking.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const stats = [
    { value: "400M+", label: "people in sub-Saharan Africa without safe drinking water" },
    { value: "1000s", label: "of rural water points that are never tested" },
    { value: "5-day", label: "fresh satellite pass — everywhere, for free" },
  ];
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <h2 className="max-w-2xl text-2xl md:text-3xl">
          Millions drink from water no one has ever tested.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Testing water needs labs, teams and budgets — impossible across thousands
          of rural ponds, lakes and rivers. So contamination, cholera and toxic algae
          are found too late. TideEye closes that gap from space.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-background p-6">
              <div className="tabular text-3xl font-bold text-primary">{s.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      Icon: Satellite,
      title: "1. Satellite",
      body: "Pick a water point on the map. TideEye pulls the latest free Sentinel-2 image of it.",
    },
    {
      Icon: Activity,
      title: "2. Analysis",
      body: "It computes water-quality indices (algae, turbidity, health) and a clear risk score.",
    },
    {
      Icon: BellRing,
      title: "3. Alert",
      body: "AI explains the verdict in plain words, and turns it into an alert you can share.",
    },
  ];
  return (
    <section id="how" className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-2xl md:text-3xl">How it works</h2>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        From orbit to action in seconds — three steps, no equipment on the ground.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map(({ Icon, title, body }) => (
          <div key={title} className="rounded-lg border border-border bg-card p-6 shadow-card">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-muted text-primary">
              <Icon size={22} />
            </span>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Uniqueness() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="max-w-2xl text-2xl md:text-3xl">
          Others give you data. TideEye gives you an action.
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Tools like CyFi and Digital Earth Africa produce excellent satellite data —
          but no one tells the villager <em>“don’t drink today.”</em> TideEye is the
          missing layer: from satellite to action, for communities, in human language.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <FeatureCard Icon={Users} title="Built for low-resource settings">
            No sensors, no lab. Works with a phone or a printed poster at the water point.
          </FeatureCard>
          <FeatureCard Icon={BellRing} title="Actionable, not just informative">
            A clear verdict plus a ready-to-send alert (SMS / WhatsApp) and a report.
          </FeatureCard>
          <FeatureCard Icon={Leaf} title="Earth Forward">
            Protecting freshwater and the people who depend on it, with technology.
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

function Science() {
  const indices = [
    { code: "NDCI", name: "Chlorophyll / algae", Icon: Leaf },
    { code: "NDTI", name: "Turbidity / sediment", Icon: Waves },
    { code: "NDWI", name: "Water presence", Icon: Droplets },
  ];
  return (
    <section id="science" className="mx-auto max-w-6xl px-5 py-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-2xl md:text-3xl">The science, kept honest</h2>
          <p className="mt-3 text-muted-foreground">
            TideEye reads the light reflected by water to derive spectral indices,
            then turns them into a deterministic risk score. The numbers are
            reproducible — AI writes the explanation, never the score.
          </p>
          <div className="mt-6 space-y-3">
            {indices.map(({ code, name, Icon }) => (
              <div key={code} className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-muted text-primary">
                  <Icon size={18} />
                </span>
                <span className="tabular text-sm font-semibold text-primary">{code}</span>
                <span className="text-sm text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-card">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="font-semibold">Sample verdict</span>
            <RiskPill level="avoid" />
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ["Risk score", "78 / 100"],
              ["Chlorophyll (NDCI)", "0.42"],
              ["Turbidity (NDTI)", "0.31"],
              ["Water fraction", "0.86"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="tabular font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Impact() {
  const cases = [
    { src: "/images/landing/community-water-pump.jpg", alt: "A community gathering at a water pump", title: "Villages", body: "Know before you drink — a printed 🔴/🟢 poster at the water point." },
    { src: "/images/landing/india-women-well-sunrise.jpg", alt: "Women carrying water pots to a well", title: "A global problem", body: "From West Africa to South Asia, families rely on untested surface water." },
    { src: "/images/landing/girls-collecting-lake.jpg", alt: "Girls collecting water at a lake", title: "NGOs & authorities", body: "See where to sample first across many water points at once." },
  ];
  return (
    <section id="impact" className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-2xl md:text-3xl">Who it protects</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {cases.map((c) => (
            <article key={c.title} className="overflow-hidden rounded-lg border border-border bg-background shadow-card">
              <div className="relative aspect-[4/3]">
                <Image src={c.src} alt={c.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="p-5">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <MapPin size={16} className="text-primary" /> {c.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Honesty() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <div className="flex items-start gap-4 rounded-lg border border-border bg-muted p-6">
        <ShieldAlert className="mt-0.5 shrink-0 text-accent" size={22} />
        <div>
          <h2 className="text-lg font-semibold">Advisory, not a lab</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Satellites can’t see bacteria or dissolved chemicals. TideEye is an
            early-warning and triage tool — it tells you where to look and when to be
            careful, not a certificate of safety. Confirm critical cases with a field
            sample.
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <div className="rounded-xl bg-primary px-8 py-12 text-center text-primary-foreground">
        <h2 className="text-2xl text-primary-foreground md:text-3xl">
          Point TideEye at a water body. See the verdict in seconds.
        </h2>
        <Link
          href="/map"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-transform hover:scale-[1.02]"
        >
          Analyze a water point <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
        <Logo />
        <p>The eye on the tide · Sentinel-2 imagery © Copernicus / ESA</p>
      </div>
    </footer>
  );
}

function FeatureCard({
  Icon,
  title,
  children,
}: {
  Icon: typeof Users;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-muted text-primary">
        <Icon size={22} />
      </span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
