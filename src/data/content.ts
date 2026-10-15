export const about =
  "Yala Park Safari helps travellers plan wildlife experiences in Yala National Park, Sri Lanka. Whether you prefer a private jeep with your own group or a shared safari with other travellers, we make it easy to explore your options and arrange your visit. Contact our team to discuss your safari, pickup location, and the details that matter to you.";

export const benefits = [
  { icon: "users", title: "Private and shared options", text: "Book a jeep just for your group, or share one with other travellers." },
  { icon: "tag", title: "Clear safari choices and pricing", text: "Three simple options, with prices shown per jeep or per person." },
  { icon: "message", title: "Direct WhatsApp planning", text: "Talk to our team directly — no booking platforms in between." },
  { icon: "map", title: "Help arranging your visit", text: "Ask us about timings, pickup and what to expect on the day." },
] as const;

/** sample: true = fictional demo testimonial. Hidden when demoMode is false. */
export const reviews = [
  { name: "Sample guest A", from: "Demo review", text: "Booking over WhatsApp was easy and the half-day drive fitted our schedule well.", sample: true },
  { name: "Sample guest B", from: "Demo review", text: "We chose the private jeep for our family and liked having the time to stop wherever we wanted.", sample: true },
  { name: "Sample guest C", from: "Demo review", text: "The shared safari was a great option travelling solo. Clear information before the day.", sample: true },
];

export const faqs = [
  { q: "What is the difference between a full-day and half-day safari?", a: "A full-day safari spends most of the day in Yala National Park, leaving more time to explore. A half-day safari is a shorter morning or afternoon game drive." },
  { q: "How does a shared safari work?", a: "You share a jeep with other travellers on a half-day drive in the morning or afternoon, and pay per person rather than for the whole jeep." },
  { q: "Is the displayed price per person or per jeep?", a: "Private safaris are priced per jeep for up to six guests. The shared safari is priced per person. The prices on this page are samples, and the final price is confirmed on WhatsApp." },
  { q: "Are national park entrance tickets included?", a: "No. Park entry tickets are not included in the sample estimate. Our team will explain ticket costs when confirming your booking." },
  { q: "Can you arrange pickup from my hotel?", a: "Tell us your hotel or location in the booking form and we will discuss pickup options with you on WhatsApp." },
  { q: "What should I bring on a safari?", a: "Light neutral clothing, a hat, sunscreen, water, binoculars and a camera are useful. Mornings can be cool, so a light layer helps." },
  { q: "Are leopard sightings guaranteed?", a: "No. Yala is a wild national park and animal sightings can never be guaranteed. Every safari is different." },
  { q: "How do I confirm or change my booking?", a: "Send your request on WhatsApp. Your booking is only confirmed after our team replies. For changes or cancellations, please discuss the details with our team." },
];
