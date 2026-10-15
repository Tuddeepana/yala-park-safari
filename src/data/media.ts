import hero from "@/assets/hero-leopard.jpg";
import elephants from "@/assets/elephants.jpg";
import peacock from "@/assets/peacock.jpg";
import jeepSetting from "@/assets/jeep-setting.jpg";
import jeepSeating from "@/assets/jeep-seating.jpg";
import jeepExterior from "@/assets/jeep-exterior.jpg";
import openViewing from "@/assets/open-viewing.jpg";
import slothBear from "@/assets/sloth-bear.jpg";
import logo from "@/assets/logo-mark.png";

/** Replace images here. `sample: true` marks placeholder photos (labelled in demo, hidden in production for guest photos). */
export const media = {
  logo: { src: logo, alt: "Yala Park Safari leopard logo" },
  hero: { src: hero, alt: "Sri Lankan leopard resting on a granite rock in Yala National Park at sunset" },
  elephants: { src: elephants, alt: "Sri Lankan elephants grazing beside a lagoon in Yala at dusk" },
  peacock: { src: peacock, alt: "Peacock displaying its feathers on a Yala safari track" },
  about: { src: jeepSetting, alt: "Safari jeep on a red dirt track in Yala with elephants nearby" },
};

export const jeepPhotos = [
  { src: jeepExterior, alt: "Side view of a green open safari jeep on a dirt road", caption: "Jeep exterior", sample: true },
  { src: jeepSeating, alt: "Raised padded passenger seats inside an open safari jeep", caption: "Passenger seating", sample: true },
  { src: openViewing, alt: "Travellers using binoculars from an open safari jeep", caption: "Open viewing area", sample: true },
  { src: jeepSetting, alt: "Safari jeep driving through Yala's dry-zone landscape", caption: "On the trail in Yala", sample: true },
];

export const jeepFeatures = ["Open-sided viewing", "Raised seating", "Canvas sun roof"];

export const guestPhotos = [
  { src: openViewing, alt: "Travellers watching elephants from a jeep", sample: true },
  { src: hero, alt: "Leopard on a rock at sunset", sample: true },
  { src: slothBear, alt: "Sloth bear walking through dry scrub", sample: true },
  { src: elephants, alt: "Elephants near a lagoon", sample: true },
  { src: peacock, alt: "Peacock on a safari track", sample: true },
  { src: jeepSetting, alt: "Jeep on a red dirt track", sample: true },
];
