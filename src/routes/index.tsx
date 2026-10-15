import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Users, Tag, MessageCircle, MapPin, Check, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BookingForm, EnquiryPreview } from "@/components/site/BookingForm";
import { safaris, basisLabel, JEEP_CAPACITY, type SafariId } from "@/data/safaris";
import { media, jeepPhotos, jeepFeatures, guestPhotos } from "@/data/media";
import { about, benefits, reviews, faqs } from "@/data/content";
import { siteConfig, whatsappReady, whatsappUrl } from "@/data/site-config";
import { allHomepageSchemas } from "@/data/seo-schemas";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

const TITLE = "Yala Safari Sri Lanka | Private & Shared | Yala Park Safari";
const DESC =
  "Explore Yala National Park with private full-day, half-day and shared jeep safaris. Compare options and request your safari booking directly on WhatsApp.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      /* ─── SEO: Keyword targeting ─── */
      {
        name: "keywords",
        content:
          "yala safari, yala national park safari, yala jeep safari, private safari yala, shared safari yala, yala park safari, book yala safari, yala safari price, yala safari booking, yala wildlife safari, sri lanka safari, yala leopard safari, half day safari yala, full day safari yala, yala safari tour, yala safari packages, best yala safari, yala national park tour, cheap yala safari, yala safari online booking",
      },
      /* ─── Open Graph (page-specific) ─── */
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteConfig.domain },
      /* ─── Twitter (page-specific) ─── */
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      /* ─── Robots ─── */
      { name: "robots", content: siteConfig.demoMode ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
    ],
    links: [{ rel: "canonical", href: siteConfig.domain + "/" }],
    scripts: allHomepageSchemas().map((schema) => ({
      type: "application/ld+json",
      children: JSON.stringify(schema),
    })),
  }),
  component: Index,
});

const nav = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About Us" },
  { href: "#services", label: "Our Services" },
  { href: "#jeeps", label: "Safari Jeeps" },
  { href: "#contact", label: "Contact Us" },
];
const icons = { users: Users, tag: Tag, message: MessageCircle, map: MapPin };
const show = <T extends { sample: boolean }>(xs: T[]) => xs.filter((x) => siteConfig.demoMode || !x.sample);
const GENERAL_MSG = "Hello Yala Park Safari,\nI would like to ask about your safari options.";

function Index() {
  const [selected, setSelected] = useState<SafariId>("half-day");
  const [menu, setMenu] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const choose = (id: SafariId) => {
    setSelected(id);
    const el = document.getElementById("book");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => el?.focus({ preventScroll: true }), 400);
  };
  const openWhatsapp = () => {
    if (whatsappReady()) window.open(whatsappUrl(GENERAL_MSG), "_blank", "noopener,noreferrer");
    else {
      setCopied(false);
      setPreview(GENERAL_MSG);
    }
  };
  const vReviews = show(reviews);
  const vGuests = show(guestPhotos);
  const vJeeps = show(jeepPhotos);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:bg-card focus:p-2">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <a href="#home" className="flex items-center gap-2">
            <img src={media.logo.src} alt={media.logo.alt} width={40} height={40} className="h-10 w-10" />
            <span className="font-display text-lg font-semibold text-primary">{siteConfig.name}</span>
          </a>
          <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="text-sm font-medium hover:text-accent">
                {n.label}
              </a>
            ))}
            <Button asChild>
              <a href="#book">Book Your Safari</a>
            </Button>
          </nav>
          <button
            className="flex h-11 w-11 items-center justify-center md:hidden"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            aria-controls="mobile-nav"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border bg-background px-4 pb-4 md:hidden">
            {nav.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenu(false)} className="block py-3 font-medium">
                {n.label}
              </a>
            ))}
            <Button asChild className="mt-2 w-full">
              <a href="#book" onClick={() => setMenu(false)}>Book Your Safari</a>
            </Button>
          </nav>
        )}
      </header>

      <main id="main">
        {/* Hero */}
        <section id="home" className="relative isolate">
          <img
            src={media.hero.src}
            alt={media.hero.alt}
            width={1920}
            height={1088}
            fetchPriority="high"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-overlay" />
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 lg:grid-cols-[1fr_440px] lg:py-20">
            <div className="text-primary-foreground">
              <p className="eyebrow">Yala National Park · Sri Lanka</p>
              <h1 className="mt-3 text-4xl leading-tight text-primary-foreground sm:text-5xl lg:text-6xl">
                Your Yala Safari Starts Here
              </h1>
              <p className="mt-4 max-w-lg text-lg text-primary-foreground/90">
                Explore Yala National Park, Sri Lanka, with a private or shared jeep safari. Choose your
                experience and plan your visit directly with our team.
              </p>
              <div className="mt-6 hidden gap-3 sm:flex">
                <Button asChild variant="heroOutline" size="lg">
                  <a href="#services">Compare safaris</a>
                </Button>
              </div>
            </div>
            <BookingForm selected={selected} onSelect={setSelected} />
          </div>
        </section>

        {/* Experiences */}
        <section id="services" className="mx-auto max-w-6xl px-4 py-20">
          <p className="eyebrow">Our services</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">Our safari experiences</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Choose a full-day or half-day private jeep safari, or join a shared safari in Yala National Park.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {safaris.map((s) => (
              <article key={s.id} className="flex flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)]">
                <img src={s.image.src} alt={s.image.alt} width={1200} height={912} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <div className="flex flex-1 flex-col p-6">
                  <span className="demo-badge self-start">{s.type}</span>
                  <h3 className="mt-3 text-2xl">{s.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
                  <p className="mt-4">
                    <span className="font-display text-3xl text-primary">USD {s.price}</span>{" "}
                    <span className="text-sm text-muted-foreground">{basisLabel(s.basis)}</span>
                    {siteConfig.demoMode && <span className="ml-2 text-xs text-accent">Sample price</span>}
                  </p>
                  <ul className="mt-4 space-y-1 text-sm">
                    {s.inclusions.map((i) => (
                      <li key={i} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-accent" />{i}</li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full" onClick={() => choose(s.id)}>Select This Safari</Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="bg-card">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 md:grid-cols-2">
            <img src={media.about.src} alt={media.about.alt} width={1200} height={912} loading="lazy" className="rounded-xl" />
            <div>
              <p className="eyebrow">About us</p>
              <h2 className="mt-2 text-3xl sm:text-4xl">An independent Yala safari operator</h2>
              <p className="mt-4 leading-relaxed">{about}</p>
              <Button asChild className="mt-6" size="lg"><a href="#book">Plan Your Safari</a></Button>
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <p className="eyebrow">Why choose us</p>
          <h2 className="mt-2 text-3xl sm:text-4xl">Simple to plan, easy to book</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => {
              const I = icons[b.icon];
              return (
                <div key={b.title} className="rounded-xl border border-border bg-card p-6">
                  <I className="h-7 w-7 text-accent" aria-hidden />
                  <h3 className="mt-4 text-xl">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{b.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Jeeps */}
        <section id="jeeps" className="bg-primary text-primary-foreground">
          <div className="mx-auto max-w-6xl px-4 py-20">
            <p className="eyebrow">Safari jeeps</p>
            <h2 className="mt-2 text-3xl text-primary-foreground sm:text-4xl">Our safari jeeps</h2>
            <p className="mt-3 max-w-2xl text-primary-foreground/80">
              Open jeeps seating up to {JEEP_CAPACITY} guests · {jeepFeatures.join(" · ")}
            </p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {vJeeps.map((j) => (
                <figure key={j.caption} className="relative overflow-hidden rounded-xl">
                  <img src={j.src} alt={j.alt} width={1200} height={912} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  {siteConfig.demoMode && j.sample && <span className="demo-badge absolute left-3 top-3">Sample image</span>}
                  <figcaption className="mt-2 text-sm text-primary-foreground/90">{j.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews + gallery */}
        {(vReviews.length > 0 || vGuests.length > 0) && (
          <section className="mx-auto max-w-6xl px-4 py-20">
            {vReviews.length > 0 && (
              <>
                <p className="eyebrow">Guest reviews</p>
                <h2 className="mt-2 text-3xl sm:text-4xl">What Our Guests Say</h2>
                <div className="mt-10 grid gap-6 md:grid-cols-3">
                  {vReviews.map((r) => (
                    <figure key={r.name} className="rounded-xl bg-card p-6 shadow-[var(--shadow-card)]">
                      {r.sample && <span className="demo-badge">Sample testimonial</span>}
                      <blockquote className="mt-3 font-display text-lg text-primary">“{r.text}”</blockquote>
                      <figcaption className="mt-4 text-sm text-muted-foreground">{r.name} · {r.from}</figcaption>
                    </figure>
                  ))}
                </div>
              </>
            )}
            {vGuests.length > 0 && (
              <>
                <h2 className="mt-20 text-3xl sm:text-4xl">Safari Moments With Our Guests</h2>
                {siteConfig.demoMode && <p className="mt-2 text-sm text-muted-foreground">Demo images — to be replaced with consented guest photos.</p>}
                <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {vGuests.map((g, i) => (
                    <div key={i} className="relative overflow-hidden rounded-lg">
                      <img src={g.src} alt={g.alt} width={1200} height={912} loading="lazy" className="aspect-square w-full object-cover" />
                      {siteConfig.demoMode && g.sample && <span className="demo-badge absolute left-2 top-2">Demo</span>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* FAQ */}
        <section className="bg-card">
          <div className="mx-auto max-w-3xl px-4 py-20">
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Frequently asked questions</h2>
            <Accordion type="single" collapsible className="mt-8">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`f${i}`}>
                  <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
                  <AccordionContent forceMount className="text-muted-foreground data-[state=closed]:hidden">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="mx-auto max-w-6xl px-4 py-20">
          <div className="rounded-2xl bg-gold-soft p-8 sm:p-12">
            <p className="eyebrow">Contact us</p>
            <h2 className="mt-2 text-3xl sm:text-4xl">Talk to {siteConfig.name}</h2>
            <p className="mt-3 max-w-xl">
              Ask us about safari options, timings, pickup or group bookings larger than {JEEP_CAPACITY} guests.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="whatsapp" size="lg" onClick={openWhatsapp}>
                <WhatsAppIcon className="h-5 w-5" /> Message us on WhatsApp
              </Button>
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" />{siteConfig.location}</li>
              {siteConfig.phone ? (
                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent" /><a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a></li>
              ) : siteConfig.demoMode && <li className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" />Phone number to be added</li>}
              {siteConfig.email ? (
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" /><a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></li>
              ) : siteConfig.demoMode && <li className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" />Email to be added</li>}
            </ul>
          </div>
        </section>
      </main>

      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary-foreground p-1"><img src={media.logo.src} alt={media.logo.alt} width={48} height={48} loading="lazy" className="h-12 w-12" /></span>
              <span className="font-display text-xl">{siteConfig.name}</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-primary-foreground/80">
              Private full-day and half-day jeep safaris and shared safaris in Yala National Park, Sri Lanka.
              An independent safari operator.
            </p>
          </div>
          <nav aria-label="Footer">
            <h2 className="font-display text-lg text-primary-foreground">Explore</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {nav.map((n) => <li key={n.href}><a href={n.href} className="hover:text-accent">{n.label}</a></li>)}
            </ul>
          </nav>
          <div>
            <h2 className="font-display text-lg text-primary-foreground">Safaris</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {safaris.map((s) => <li key={s.id}><button onClick={() => choose(s.id)} className="text-left hover:text-accent">{s.name}</button></li>)}
            </ul>
            <ul className="mt-4 space-y-1 text-sm text-primary-foreground/80">
              {siteConfig.phone && <li>{siteConfig.phone}</li>}
              {siteConfig.email && <li>{siteConfig.email}</li>}
            </ul>
          </div>
        </div>
        <p className="border-t border-primary-foreground/15 py-5 text-center text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} {siteConfig.name} · Independent safari operator
        </p>
      </footer>

      <button
        onClick={openWhatsapp}
        aria-label="Chat with Yala Park Safari on WhatsApp"
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-[var(--shadow-card)] transition-transform hover:scale-110 active:scale-95"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </button>
      <EnquiryPreview message={preview} onClose={() => setPreview(null)} copied={copied} setCopied={setCopied} />
    </>
  );
}
