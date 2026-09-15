import Image from "next/image";
import Link from "next/link";
import {
  Satellite,
  Activity,
  BellRing,
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
      <UrgencyBand />
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
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-base font-semibold text-muted-foreground md:flex">
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#science" className="hover:text-foreground">The science</a>
          <a href="#impact" className="hover:text-foreground">Impact</a>
        </nav>
        <Link
          href="/map"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Analyze a water point <ArrowRight size={18} />
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
        <div>
          <h1 className="text-5xl font-bold leading-[1.05] md:text-7xl">
            The eye on the tide.
          </h1>
          <p className="mt-6 max-w-xl text-xl text-muted-foreground md:text-2xl">
            TideEye watches lakes and rivers from space and tells communities,
            before they drink, whether the water is safe today. No lab. No sensors.
            Just a satellite and a clear alert.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-7 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Analyze a water point <ArrowRight size={20} />
            </Link>
            <Link
              href="/map"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-7 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-muted"
            >
              Explore the live map
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-lift">
          <Image
            src="/images/landing/woman-handpump-nigeria.jpg"
            alt="A woman drawing water from a hand pump"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function Problem() {
  const stats = [
    { value: "400M+", label: "people in sub-Saharan Africa without safe drinking water" },
    { value: "1000s", label: "of rural water points that are never tested" },
    { value: "5-day", label: "fresh satellite pass, everywhere, for free" },
  ];
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2">
        <div>
          <h2 className="max-w-xl text-3xl font-bold md:text-4xl">
            Millions drink from water no one has ever tested.
          </h2>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground md:text-xl">
            Testing water needs labs, teams and budgets, impossible across thousands
            of rural ponds, lakes and rivers. So contamination, cholera and toxic
            algae are found too late. TideEye closes that gap from space.
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="tabular text-4xl font-bold text-primary md:text-5xl">{s.value}</div>
                <div className="mt-2 text-base text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-card">
          <Image
            src="/images/landing/muddy-turbid-water.jpg"
            alt="Muddy, turbid river water"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function UrgencyBand() {
  return (
    <section className="relative overflow-hidden">
      <div className="relative min-h-[380px] w-full">
        <Image
          src="/images/landing/boy-pond-scarcity.jpg"
          alt="A child standing by a water source holding a container"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-foreground/60" />
        <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-5 py-16">
          <p className="max-w-2xl text-3xl font-bold leading-snug text-white md:text-4xl">
            Every day, families gather water they cannot see is unsafe.
          </p>
          <p className="mt-4 max-w-xl text-xl text-white/85">
            TideEye gives them a warning in time, in plain language.
          </p>
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
      body: "Pick a water point on the map. TideEye pulls the latest free satellite image of it.",
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
    <section id="how" className="mx-auto max-w-6xl px-5 py-20">
      <h2 className="text-3xl font-bold md:text-4xl">How it works</h2>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
        From orbit to action in seconds, three steps, no equipment on the ground.
      </p>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map(({ Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-7 shadow-card">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-muted text-primary">
              <Icon size={28} />
            </span>
            <h3 className="mt-5 text-2xl font-semibold">{title}</h3>
            <p className="mt-3 text-lg text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Uniqueness() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-2">
        <div className="relative order-last aspect-[4/3] overflow-hidden rounded-xl shadow-card md:order-first">
          <Image
            src="/images/landing/algae-polluted-water.jpg"
            alt="Water covered with algae and pollution"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">
            Others give you data. TideEye gives you an action.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground md:text-xl">
            Tools like CyFi and Digital Earth Africa produce excellent satellite data,
            but no one tells the villager not to drink today. TideEye is the missing
            layer: from satellite to action, for communities, in human language.
          </p>
          <div className="mt-8 space-y-4">
            <FeatureRow Icon={Users} title="Built for low-resource settings">
              No sensors, no lab. Works with a phone or a printed poster at the water point.
            </FeatureRow>
            <FeatureRow Icon={BellRing} title="Actionable, not just informative">
              A clear verdict plus a ready-to-send alert (SMS or WhatsApp) and a report.
            </FeatureRow>
            <FeatureRow Icon={Leaf} title="Protecting freshwater and people">
              Technology in service of the planet and the communities that depend on it.
            </FeatureRow>
          </div>
        </div>
      </div>
    </section>
  );
}

function Science() {
  const indices = [
    { code: "NDCI", name: "Chlorophyll and algae", Icon: Leaf },
    { code: "NDTI", name: "Turbidity and sediment", Icon: Waves },
    { code: "NDWI", name: "Water presence", Icon: Droplets },
  ];
  return (
    <section id="science" className="mx-auto max-w-6xl px-5 py-20">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-3xl font-bold md:text-4xl">The science, kept honest</h2>
          <p className="mt-5 text-lg text-muted-foreground md:text-xl">
            TideEye reads the light reflected by water to derive spectral indices,
            then turns them into a deterministic risk score. The numbers are
            reproducible. AI writes the explanation, never the score.
          </p>
          <div className="mt-7 space-y-3">
            {indices.map(({ code, name, Icon }) => (
              <div key={code} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-primary">
                  <Icon size={22} />
                </span>
                <span className="tabular text-lg font-bold text-primary">{code}</span>
                <span className="text-lg text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-7 shadow-card">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="text-xl font-semibold">Sample verdict</span>
            <RiskPill level="avoid" />
          </div>
          <dl className="mt-5 space-y-3 text-lg">
            {[
              ["Risk score", "78 / 100"],
              ["Chlorophyll (NDCI)", "0.42"],
              ["Turbidity (NDTI)", "0.31"],
              ["Water fraction", "0.86"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="tabular font-semibold">{v}</dd>
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
    { src: "/images/landing/man-well.jpg", alt: "A person gathering water from a well", title: "Villages", body: "Know before you drink, a printed red or green poster at the water point." },
    { src: "/images/landing/india-women-well-sunrise.jpg", alt: "Women carrying water pots to a well", title: "A global problem", body: "From West Africa to South Asia, families rely on untested surface water." },
    { src: "/images/landing/community-water-pump.jpg", alt: "A community gathered at a water pump", title: "NGOs and authorities", body: "See where to sample first across many water points at once." },
  ];
  return (
    <section id="impact" className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="text-3xl font-bold md:text-4xl">Who it protects</h2>
        <div className="mt-12 grid gap-7 md:grid-cols-3">
          {cases.map((c) => (
            <article key={c.title} className="overflow-hidden rounded-xl border border-border bg-background shadow-card">
              <div className="relative aspect-[4/3]">
                <Image src={c.src} alt={c.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="flex items-center gap-2 text-2xl font-semibold">
                  <MapPin size={20} className="text-primary" /> {c.title}
                </h3>
                <p className="mt-3 text-lg text-muted-foreground">{c.body}</p>
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
    <section className="mx-auto max-w-6xl px-5 py-16">
      <div className="flex items-start gap-5 rounded-xl border border-border bg-muted p-8">
        <ShieldAlert className="mt-1 shrink-0 text-accent" size={28} />
        <div>
          <h2 className="text-2xl font-semibold">Advisory, not a lab</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Satellites cannot see bacteria or dissolved chemicals. TideEye is an
            early warning and triage tool. It tells you where to look and when to be
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
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <div className="rounded-2xl bg-primary px-8 py-16 text-center text-primary-foreground">
        <h2 className="mx-auto max-w-3xl text-3xl font-bold text-primary-foreground md:text-5xl">
          Point TideEye at a water body. See the verdict in seconds.
        </h2>
        <Link
          href="/map"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary-foreground px-7 py-4 text-lg font-semibold text-primary transition-transform hover:scale-[1.02]"
        >
          Analyze a water point <ArrowRight size={20} />
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-base text-muted-foreground sm:flex-row">
        <Logo />
        <p>The eye on the tide. Satellite imagery from Copernicus and ESA.</p>
      </div>
    </footer>
  );
}

function FeatureRow({
  Icon,
  title,
  children,
}: {
  Icon: typeof Users;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
        <Icon size={24} />
      </span>
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-1 text-lg text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
