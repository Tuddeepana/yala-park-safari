import { media } from "./media";

export type SafariId = "full-day" | "half-day" | "shared";
export type PriceBasis = "per-jeep" | "per-person";
export type VehicleType = "luxury" | "super-luxury";
export type PackageTier = "jeep-only" | "all-inclusive";

export interface Safari {
  id: SafariId;
  name: string;
  short: string;
  type: "Private" | "Shared";
  description: string;
  /** Base starting price in LKR (with +2000 LKR margin included) */
  price: number;
  /** Approximate starting price in USD for quick reference */
  priceUsd: number;
  basis: PriceBasis;
  needsSession: boolean;
  durationLabel: string;
  timingLabel: string;
  inclusions: string[];
  image: { src: string; alt: string };
  vehiclePricing?: {
    luxury: number;
    superLuxury: number;
  };
}

/** Maximum recommended passengers per safari jeep for optimum viewing */
export const JEEP_CAPACITY = 6;

/** National Park entry ticket estimate (DWC adult foreign visitor fee) */
export const PARK_TICKET_PRICE_LKR = 15000;

/** Currency exchange reference rates */
export const FX_RATES = {
  LKR_PER_USD: 305,
  LKR_PER_EUR: 335,
};

export const formatLkr = (amount: number) => `Rs. ${amount.toLocaleString()} LKR`;
export const approxUsd = (lkr: number) => Math.round(lkr / FX_RATES.LKR_PER_USD);
export const approxEur = (lkr: number) => Math.round(lkr / FX_RATES.LKR_PER_EUR);

/** Vehicle tier descriptions */
export const VEHICLE_DETAILS: Record<
  VehicleType,
  { name: string; tag: string; description: string; badge: string }
> = {
  luxury: {
    name: "Luxury Safari Jeep",
    tag: "Standard 4x4 Safari Cruiser",
    description: "Raised tiered passenger seats, 360° open safari viewing, canvas sun roof & USB charging ports.",
    badge: "Standard Luxury",
  },
  "super-luxury": {
    name: "Super Luxury Jeep",
    tag: "Premium High-Comfort Cruiser",
    description: "Extra-cushioned premium seats, upgraded smooth suspension, extra legroom & elevated photo angles.",
    badge: "Extra Comfort",
  },
};

/**
 * 4 Clear, Customer-Facing Safari Packages
 * (Safari base prices include the +2,000 LKR margin from the operator sheet)
 */
export interface SafariPackageItem {
  id: "full-day" | "half-day-7h" | "half-day-5h" | "shared";
  category: SafariId;
  name: string;
  short: string;
  tagline: string;
  badge?: string;
  durationLabel: string;
  timingLabel: string;
  type: "Private" | "Shared";
  luxuryPrice: number;
  superLuxuryPrice: number;
  mealPricePerPerson: number;
  mealPackTitle: string;
  mealPackDetails: string;
  sharedPriceLkr: number;
  sharedPriceEur: number;
}

export const SAFARI_PACKAGES: Record<string, SafariPackageItem> = {
  "full-day": {
    id: "full-day",
    category: "full-day",
    name: "Full-Day Private Safari",
    short: "Full Day",
    tagline: "The complete 13.5-hour expedition across Yala blocks for maximum leopard sightings",
    badge: "Ultimate Safari",
    durationLabel: "13.5 Hours",
    timingLabel: "5:00 AM – 6:30 PM",
    type: "Private",
    luxuryPrice: 28000,
    superLuxuryPrice: 32000,
    mealPricePerPerson: 2000,
    mealPackTitle: "Full Day Meals & Drinks Pack (+Rs. 2,000 / person)",
    mealPackDetails: "Packed Breakfast + Authentic Sri Lankan Rice & Curry Lunch in banana leaf + Fresh Fruit Dessert + Chilled 1L Mineral Water",
    sharedPriceLkr: 12000,
    sharedPriceEur: 65,
  },
  "half-day-7h": {
    id: "half-day-7h",
    category: "half-day",
    name: "7-Hour Extended Half-Day",
    short: "Extended 7h",
    tagline: "Extended morning game drive during peak leopard and sloth bear activity",
    badge: "Most Popular",
    durationLabel: "7 Hours",
    timingLabel: "5:00 AM – 12:00 PM (Noon)",
    type: "Private",
    luxuryPrice: 17000,
    superLuxuryPrice: 19000,
    mealPricePerPerson: 820,
    mealPackTitle: "Breakfast & Water Pack (+Rs. 820 / person)",
    mealPackDetails: "Packed Safari Breakfast (sandwiches, eggs, fruits, snacks) + Chilled Mineral Water bottle",
    sharedPriceLkr: 8000,
    sharedPriceEur: 45,
  },
  "half-day-5h": {
    id: "half-day-5h",
    category: "half-day",
    name: "5-Hour Standard Half-Day",
    short: "Standard 5h",
    tagline: "Compact morning or afternoon game drive suited for tight travel schedules",
    badge: "Budget Friendly",
    durationLabel: "5 Hours",
    timingLabel: "Morning (5am–10am) or Afternoon (2pm–6:30pm)",
    type: "Private",
    luxuryPrice: 14000,
    superLuxuryPrice: 17000,
    mealPricePerPerson: 820,
    mealPackTitle: "Breakfast & Water Pack (+Rs. 820 / person)",
    mealPackDetails: "Packed Safari Breakfast / Refreshments + Chilled Mineral Water bottle",
    sharedPriceLkr: 8000,
    sharedPriceEur: 45,
  },
  shared: {
    id: "shared",
    category: "shared",
    name: "Shared Group Safari",
    short: "Shared Jeep",
    tagline: "Join other friendly travellers in a shared open jeep with per-person pricing",
    badge: "Solo & Couples",
    durationLabel: "7h Morning Drive",
    timingLabel: "5:00 AM – 12:00 PM",
    type: "Shared",
    luxuryPrice: 8000,
    superLuxuryPrice: 8000,
    mealPricePerPerson: 820,
    mealPackTitle: "Breakfast & Water Pack (+Rs. 820 / person)",
    mealPackDetails: "Packed Safari Breakfast + Chilled Mineral Water bottle",
    sharedPriceLkr: 8000,
    sharedPriceEur: 45,
  },
};

export const safaris: Safari[] = [
  {
    id: "full-day",
    name: "Full-Day Private Safari",
    short: "Full Day",
    type: "Private",
    description:
      "A complete 13.5-hour game drive in Yala National Park with your private jeep and dedicated tracker. Maximum chances to spot leopards, sloth bears, and elephants across multiple blocks.",
    price: 28000,
    priceUsd: approxUsd(28000),
    basis: "per-jeep",
    needsSession: false,
    durationLabel: "13.5 Hours",
    timingLabel: "5:00 AM pickup – 6:30 PM drop-off",
    inclusions: [
      "Private 4x4 safari jeep exclusively for your group",
      "Up to 6 guests included per jeep",
      "Experienced local wildlife driver/tracker",
      "Full-day park patrol service & fuel",
    ],
    vehiclePricing: {
      luxury: 28000,
      superLuxury: 32000,
    },
    image: media.hero,
  },
  {
    id: "half-day",
    name: "Half-Day Private Safari",
    short: "Half Day",
    type: "Private",
    description:
      "A focused private game drive in your own jeep. Choose either the extended 7-hour morning safari (5 AM – 12 PM) or the standard 5-hour morning or afternoon drive.",
    price: 14000,
    priceUsd: approxUsd(14000),
    basis: "per-jeep",
    needsSession: true,
    durationLabel: "5 or 7 Hours",
    timingLabel: "Morning (5 AM) or Afternoon (2 PM)",
    inclusions: [
      "Private 4x4 safari jeep exclusively for your group",
      "Up to 6 guests included per jeep",
      "Experienced local wildlife driver/tracker",
      "Choice of 5-hour drive or 7-hour extended drive",
    ],
    vehiclePricing: {
      luxury: 14000,
      superLuxury: 17000,
    },
    image: media.elephants,
  },
  {
    id: "shared",
    name: "Shared Safari",
    short: "Shared",
    type: "Shared",
    description:
      "Join other travellers in a shared open safari jeep. A budget-friendly and sociable way for solo travellers and couples to experience Yala with transparent per-person pricing.",
    price: 8000,
    priceUsd: approxUsd(8000),
    basis: "per-person",
    needsSession: true,
    durationLabel: "7 Hours or Full Day",
    timingLabel: "Morning 5:00 AM pickup",
    inclusions: [
      "Individual seat in a shared 4x4 safari jeep",
      "Experienced local wildlife driver/tracker",
      "7-Hour morning or Full-Day drive options",
      "Option for all-inclusive package (€45 / €65)",
    ],
    image: media.peacock,
  },
];

export const exclusions = [
  "National Park entry ticket (~15,000 LKR per adult foreign visitor, except EUR shared package)",
  "Optional hotel transfers outside Tissamaharama / Kirinda",
  "Driver / tracker gratuities (optional)",
];

export const exclusionNote =
  "Private safari prices cover the private jeep, driver/tracker, and fuel. Park entry tickets (~Rs. 15,000 LKR / ~$45 per adult foreign guest) are paid at the park entrance gate with driver assistance, or included in EUR shared packages.";

export const getSafari = (id: SafariId) => safaris.find((s) => s.id === id)!;

export function calcTotal(s: Safari, guests: number) {
  const qty = s.basis === "per-jeep" ? 1 : guests;
  return { qty, rate: s.price, total: qty * s.price };
}

export const basisLabel = (b: PriceBasis) => (b === "per-jeep" ? "per jeep" : "per person");
