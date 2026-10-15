import { siteConfig } from "./site-config";
import { safaris, basisLabel } from "./safaris";
import { faqs } from "./content";

/**
 * Structured data (JSON-LD) generators for SEO.
 * These produce schema.org objects that help Google understand
 * the page content and display rich results (star ratings, FAQ dropdowns,
 * breadcrumbs, local business panels, etc.).
 *
 * Usage: inject via <script type="application/ld+json"> in the route head().
 */

/* ─── Local Business ─── */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TouristAttraction",
    "@id": `${siteConfig.domain}/#business`,
    name: siteConfig.name,
    url: siteConfig.domain,
    description:
      "Private full-day, half-day, and shared jeep safari experiences in Yala National Park, Sri Lanka. Book directly via WhatsApp with an independent safari operator.",
    image: `${siteConfig.domain}/yala_park_safari.png`,
    ...(siteConfig.phone && { telephone: siteConfig.phone }),
    ...(siteConfig.email && { email: siteConfig.email }),
    address: {
      "@type": "PostalAddress",
      addressLocality: "Yala National Park area",
      addressRegion: "Southern Province",
      addressCountry: "LK",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 6.3692,
      longitude: 81.5165,
    },
    areaServed: {
      "@type": "Place",
      name: "Yala National Park, Sri Lanka",
    },
    priceRange: "$$",
    currenciesAccepted: "USD",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "05:00",
      closes: "18:00",
    },
    sameAs: [
      // Add social media URLs here as you create them:
      // "https://www.facebook.com/yalaparksafari",
      // "https://www.instagram.com/yalaparksafari",
      // "https://www.tiktok.com/@yalaparksafari",
    ],
  };
}

/* ─── Website (enables Google Sitelinks Search Box) ─── */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.domain}/#website`,
    name: siteConfig.name,
    url: siteConfig.domain,
    description:
      "Explore Yala National Park with private and shared jeep safaris. Compare options and book via WhatsApp.",
    publisher: { "@id": `${siteConfig.domain}/#business` },
    inLanguage: "en",
  };
}

/* ─── WebPage ─── */
export function webPageSchema(
  title: string,
  description: string,
  path = "/",
) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${siteConfig.domain}${path}#webpage`,
    name: title,
    description,
    url: `${siteConfig.domain}${path}`,
    isPartOf: { "@id": `${siteConfig.domain}/#website` },
    about: { "@id": `${siteConfig.domain}/#business` },
    inLanguage: "en",
  };
}

/* ─── Breadcrumb ─── */
export function breadcrumbSchema(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/* ─── FAQ Page ─── */
export function faqPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };
}

/* ─── Product / Safari Offer (one per safari) ─── */
export function safariProductSchemas() {
  return safaris.map((s) => ({
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${s.name} – Yala National Park`,
    description: s.description,
    image: `${siteConfig.domain}/yala_park_safari.png`,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    category: "Safari Experience",
    offers: {
      "@type": "Offer",
      url: `${siteConfig.domain}/#services`,
      priceCurrency: siteConfig.currency,
      price: s.price,
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      seller: { "@id": `${siteConfig.domain}/#business` },
      description: `${basisLabel(s.basis)} · ${s.inclusions.join(", ")}`,
    },
  }));
}

/* ─── Organisation (brand entity) ─── */
export function organisationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.domain}/#organization`,
    name: siteConfig.name,
    url: siteConfig.domain,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.domain}/yala_park_safari.png`,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Sinhala"],
      ...(siteConfig.phone && { telephone: siteConfig.phone }),
      ...(siteConfig.email && { email: siteConfig.email }),
    },
  };
}

/**
 * Convenience: returns all schemas for the homepage as an array of objects.
 * Inject each as a separate <script type="application/ld+json">.
 */
export function allHomepageSchemas() {
  const title =
    "Yala Safari Sri Lanka | Private & Shared Jeep Safaris | Yala Park Safari";
  const desc =
    "Explore Yala National Park with private full-day, half-day and shared jeep safaris. Compare options and request your safari booking directly on WhatsApp.";

  return [
    localBusinessSchema(),
    websiteSchema(),
    webPageSchema(title, desc),
    breadcrumbSchema([{ name: "Home", url: siteConfig.domain + "/" }]),
    faqPageSchema(),
    organisationSchema(),
    ...safariProductSchemas(),
  ];
}
