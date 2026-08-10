export const STORE_ID = process.env.STORE_ID || "essential_oils_perfumes_store_01";

export const STORE_NAME = "Rose Valley Kannauj";

export const DEFAULT_CURRENCY = "INR";

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "AED ",
};

export const COLOR_PALETTE = {
  blush: "#F8E8E8",
  petal: "#F2D4D4",
  rose: "#E8B8B8",
  peony: "#E08A9A",
  pink: "#D45A7A",
  flamingo: "#C94A6A",
  fuchsia: "#B03060",
  raspberry: "#9A2048",
  magenta: "#7A1840",
  mulberry: "#5A1030",
};

export const NAVIGATION_LINKS = [
  { name: "Home", href: "/" },
  { name: "Shop Attars & Perfumes", href: "/products" },
  { name: "Kannauj Rose Distillates", href: "/products?category=artisanal-perfumes" },
  { name: "Pure Essential Oils", href: "/products?category=pure-essential-oils" },
  { name: "Kannauj Journal", href: "/journal" },
];
