// ─────────────────────────────────────────────────────────────
// PRODUCT CONFIG — change everything about the product HERE.
// Swap name, prices, images, reviews and benefits in this one
// file and the whole page updates.
// ─────────────────────────────────────────────────────────────

export const product = {
  brand: "NOOR ORGANICS",
  name: "Noor Herbal Hair Oil",
  tagline: "With Amla & Curry Leaf",
  size: "200 ml bottle",
  currency: "Rs",
  freeDelivery: true,
  heroImage: "/images/hero.webp",
  ingredientsImage: "/images/ingredients.webp",
  howToImage: "/images/howto.webp",
  bundlesImage: "/images/bundles.webp",
};

export interface Pack {
  id: string;
  qty: number;
  price: number;
  wasPrice: number;
  badge?: "popular" | "value";
}

export const packs: Pack[] = [
  { id: "p1", qty: 1, price: 1499, wasPrice: 1999 },
  { id: "p2", qty: 2, price: 2449, wasPrice: 3998, badge: "popular" },
  { id: "p3", qty: 3, price: 3199, wasPrice: 5997, badge: "value" },
];

export const pakistaniCities = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
  "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Bahawalpur",
  "Sargodha", "Abbottabad", "Other",
];

export function formatRs(n: number): string {
  return "Rs " + n.toLocaleString("en-PK");
}
