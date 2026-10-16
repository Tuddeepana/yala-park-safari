/**
 * Brand, domain, contact and mode settings.
 * Leave a value as "" when it is not known yet — unset contact links are hidden
 * in production and shown as placeholders in demo mode.
 */
export const siteConfig = {
  name: "Yala Park Safari",
  domain: "https://yalaparksafari.com",
  /** true = sample content is shown and labelled, and the page is noindex. */
  demoMode: true,
  /** International format, digits only, e.g. "94771234567". Empty = preview modal. */
  whatsappNumber: "",
  phone: "",
  email: "",
  location: "Yala National Park area, Sri Lanka",
  timezone: "Asia/Colombo",
  currency: "LKR",
};

export const isValidWhatsapp = (n: string) => /^\d{8,15}$/.test(n);
export const whatsappReady = () => isValidWhatsapp(siteConfig.whatsappNumber);
export const whatsappUrl = (text: string) =>
  `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(text)}`;
