import { media } from "./media";

export type SafariId = "full-day" | "half-day" | "shared";
export type PriceBasis = "per-jeep" | "per-person";

export interface Safari {
  id: SafariId;
  name: string;
  short: string;
  type: "Private" | "Shared";
  description: string;
  price: number;
  basis: PriceBasis;
  needsSession: boolean;
  inclusions: string[];
  image: { src: string; alt: string };
}

/** Demo capacity per jeep — used by the booking form and jeep section. */
export const JEEP_CAPACITY = 6;

/** Shared Safari is treated as a half-day experience (configurable via needsSession). */
export const safaris: Safari[] = [
  {
    id: "full-day",
    name: "Full-Day Private Safari",
    short: "Full Day",
    type: "Private",
    description:
      "A full day in Yala National Park with your own jeep and group, giving you time to explore further and wait patiently at quieter spots.",
    price: 120,
    basis: "per-jeep",
    needsSession: false,
    inclusions: ["Private jeep for your group", "Up to 6 guests", "Driver for the day"],
    image: media.hero,
  },
  {
    id: "half-day",
    name: "Half-Day Private Safari",
    short: "Half Day",
    type: "Private",
    description:
      "A morning or afternoon game drive in your own jeep — a relaxed way to see Yala if you have a shorter schedule.",
    price: 75,
    basis: "per-jeep",
    needsSession: true,
    inclusions: ["Private jeep for your group", "Up to 6 guests", "Morning or afternoon"],
    image: media.elephants,
  },
  {
    id: "shared",
    name: "Shared Safari",
    short: "Shared",
    type: "Shared",
    description:
      "Join other travellers in a shared jeep for a half-day drive. A good choice for solo travellers and couples on a budget.",
    price: 25,
    basis: "per-person",
    needsSession: true,
    inclusions: ["Seat in a shared jeep", "Half-day drive", "Morning or afternoon"],
    image: media.peacock,
  },
];

export const exclusions = ["Park entry tickets", "Meals", "Additional transfers"];

export const exclusionNote =
  "Park entry tickets, meals, and any additional transfers are excluded from this sample estimate. Final inclusions and price will be confirmed on WhatsApp.";

export const getSafari = (id: SafariId) => safaris.find((s) => s.id === id)!;

export function calcTotal(s: Safari, guests: number) {
  const qty = s.basis === "per-jeep" ? 1 : guests;
  return { qty, rate: s.price, total: qty * s.price };
}

export const basisLabel = (b: PriceBasis) => (b === "per-jeep" ? "per jeep" : "per person");
