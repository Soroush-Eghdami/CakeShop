import type { ApiProduct } from "../types/apiProduct";
import type { Product } from "../types/product";

function formatMoney(value: string | null): string {
  if (value === null || value === undefined || value === "") return "";
  return `$${value}`;
}

function formatStars(rating: string | number): string {
  const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export function toUiProduct(api: ApiProduct): Product {
  const image = api.image ?? "";
  return {
    id: api.id,
    slug: api.id,
    name: api.name,
    price: formatMoney(api.price),
    oldPrice: formatMoney(api.old_price),
    rating: formatStars(api.rating),
    image,
    description: api.description,
    highlights: [
      { title: api.category?.name ?? "Cake", subtitle: api.description.slice(0, 48) },
      {
        title: api.is_available ? "Freshly Baked" : "Currently Unavailable",
        subtitle: api.is_available ? "Available today" : "Check back soon",
      },
      {
        title: `Rating ${api.rating}`,
        subtitle: `${api.reviews_count} happy customers`,
      },
    ],
    galleryItems: [
      { image, imageAlt: `${api.name} — photo 1` },
      { image, imageAlt: `${api.name} — photo 2` },
      { image, imageAlt: `${api.name} — photo 3` },
    ],
    reviews: { count: api.reviews_count, items: [] },
  };
}
